<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\SalesRepCredentials;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AdminDashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:admin']);
    }

    public function registerRep(Request $request)
{
    // Verify content type header exists and is JSON
    if (!$request->headers->has('Content-Type') || 
        strpos($request->headers->get('Content-Type'), 'application/json') === false) {
        return response()->json([
            'success' => false,
            'message' => 'Content-Type must be application/json'
        ], 415);
    }

    // Get and clean raw JSON input
    $rawJson = $request->getContent();
    $cleanedJson = $this->sanitizeJsonInput($rawJson);
    
    // Decode JSON with detailed error handling
    $data = json_decode($cleanedJson, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        \Log::error('JSON Parse Failure', [
            'raw_input' => $rawJson,
            'cleaned_input' => $cleanedJson,
            'error' => json_last_error_msg(),
            'bytes' => bin2hex(substr($rawJson, 0, 50)) // First 50 bytes in hex
        ]);
        
        return response()->json([
            'success' => false,
            'message' => 'Invalid JSON data',
            'error' => json_last_error_msg(),
            'received_data_sample' => substr($rawJson, 0, 100) // First 100 chars
        ], 400);
    }

    // Validate required fields
    try {
        $validator = \Validator::make($data, [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'nic' => 'required|string|max:20|unique:users|regex:/^[0-9Vv]+$/',
            'contact_number' => 'required|string|max:20|regex:/^[0-9]{10}$/'
        ], [
            'password.regex' => 'Password must contain at least one uppercase, one lowercase, one number and one special character',
            'nic.regex' => 'NIC must contain only numbers and V',
            'contact_number.regex' => 'Contact number must be 10 digits'
        ]);

        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        // Create user
        $salesRep = User::create([
            'name' => $data['name'],
            'email' => strtolower(trim($data['email'])),
            'password' => \Hash::make($data['password']),
            'nic' => strtoupper($data['nic']),
            'contact_number' => preg_replace('/[^0-9]/', '', $data['contact_number']),
            'role' => 'sales_rep',
            'email_verified_at' => now() // Auto-verify for admin-created accounts
        ]);

        // Send email (queued with error handling)
        try {
            \Mail::to($salesRep->email)
                ->queue(new \App\Mail\SalesRepCredentials(
                    $salesRep->name,
                    $salesRep->email,
                    $data['password'] // Original password before hashing
                ));
        } catch (\Exception $e) {
            \Log::error('Email queue failed: '.$e->getMessage());
            // Continue even if email fails
        }

        return response()->json([
            'success' => true,
            'message' => 'Sales representative registered successfully',
            'data' => [
                'id' => $salesRep->id,
                'name' => $salesRep->name,
                'email' => $salesRep->email,
                'created_at' => $salesRep->created_at->toDateTimeString()
            ]
        ], 201);

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Validation failed',
            'errors' => $e->errors()
        ], 422);

    } catch (\Illuminate\Database\QueryException $e) {
        \Log::error('Database error: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Database operation failed',
            'error' => config('app.debug') ? $e->getMessage() : null
        ], 500);

    } catch (\Exception $e) {
        \Log::error('Unexpected error: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Registration failed',
            'error' => config('app.debug') ? $e->getMessage() : null
        ], 500);
    }
}

/**
 * Sanitize JSON input string by removing:
 * - UTF-8 BOM
 * - Non-breaking spaces
 * - Invalid Unicode characters
 * - Normalize line endings
 */
protected function sanitizeJsonInput(string $input): string
{
    // Remove UTF-8 BOM if present
    if (str_starts_with($input, "\xEF\xBB\xBF")) {
        $input = substr($input, 3);
    }

    // Normalize line endings to LF
    $input = str_replace(["\r\n", "\r"], "\n", $input);

    // Remove non-breaking spaces and other special spaces
    $input = preg_replace('/[\x00-\x1F\x7F\xA0]/u', ' ', $input);

    // Remove any other non-printable characters except space, newline, and tab
    return preg_replace('/[^\x20-\x7E\x0A\x09]/', '', $input);
}

    public function getSalesReps()
{
    $reps = User::where('role', 'sales_rep')
        ->select('id', 'name', 'email', 'nic', 'contact_number', 'created_at')
        ->get();

    return response()->json([
        'success' => true,
        'data' => $reps,
        'message' => 'Sales representatives retrieved successfully'
    ]);
}



public function editRep(Request $request, $id)
{
    try {
        $salesRep = User::where('role', 'sales_rep')->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,'.$id,
            'password' => 'sometimes|string|min:6',
            'nic' => 'sometimes|string|max:20|unique:users,nic,'.$id,
            'contact_number' => 'sometimes|string|max:20'
        ]);

        // Only update fields that were provided
        if (isset($validated['name'])) {
            $salesRep->name = $validated['name'];
        }
        if (isset($validated['email'])) {
            $salesRep->email = $validated['email'];
        }
        if (isset($validated['password'])) {
            $salesRep->password = Hash::make($validated['password']);
        }
        if (isset($validated['nic'])) {
            $salesRep->nic = $validated['nic'];
        }
        if (isset($validated['contact_number'])) {
            $salesRep->contact_number = $validated['contact_number'];
        }

        $salesRep->save();

        return response()->json([
            'success' => true,
            'message' => 'Sales rep updated successfully',
            'data' => $salesRep
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Sales representative not found'
        ], 404);
    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        Log::error('Edit failed: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to update sales rep',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}

/**
 * Delete sales representative
 */
public function deleteRep($id)
{
    try {
        $salesRep = User::where('role', 'sales_rep')->findOrFail($id);
        $salesRep->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sales rep deleted successfully'
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Sales representative not found'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Delete failed: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to delete sales rep',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}

public function getRepById($id)
{
    try {
        $rep = User::where('role', 'sales_rep')
            ->select('id', 'name', 'email', 'nic', 'contact_number', 'created_at')
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $rep,
            'message' => 'Sales representative retrieved successfully'
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Sales representative not found'
        ], 404);
    } catch (\Exception $e) {
        Log::error('Failed to fetch sales rep: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Failed to fetch sales representative',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}



    public function index()
    {
        return response()->json([
            'message' => 'Welcome to Admin Dashboard',
            'data' => 'Admin specific data here'
        ]);
    }
}