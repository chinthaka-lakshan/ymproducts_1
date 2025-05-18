<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\Support\Facades\Mail;
use App\Mail\SalesRepCredentials;
use App\Mail\SendOtpMail;
use App\Models\PasswordResetOtp;


class AuthController extends Controller
{

    public function sendOtp(Request $request)
{
    $request->validate(['email' => 'required|email|exists:users,email']);

    try {
        $otp = rand(100000, 999999);
        $email = strtolower(trim($request->email));
        
        \DB::beginTransaction();
        
        // Delete existing OTPs
        PasswordResetOtp::where('email', $email)->delete();
        
        // Create new OTP record
        $otpRecord = PasswordResetOtp::create([
            'email' => $email,
            'otp' => (string)$otp,
            'created_at' => now()
        ]);
        
        \DB::commit();
        
        // Send email
        Mail::to($email)->send(new SendOtpMail($otp));
        
        return response()->json([
            'status' => 'success',
            'message' => 'OTP sent successfully',
            'expires_in' => 15 // minutes
        ]);
        
    } catch (\Exception $e) {
        \DB::rollBack();
        \Log::error("OTP send failed for {$request->email}: " . $e->getMessage());
        return response()->json([
            'status' => 'error',
            'message' => 'Failed to send OTP',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}

public function verifyOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'otp' => 'required|digits:6'
    ]);

    $otpRecord = PasswordResetOtp::where('email', $request->email)
                                ->where('otp', $request->otp)
                                ->first();

    // Check if OTP record exists
    if (!$otpRecord) {
        return response()->json([
            'status' => 'error',
            'message' => 'Invalid OTP or user not found'
        ], 400);
    }

    // Check if created_at exists
    if (!$otpRecord->created_at) {
        return response()->json(['error' => 'OTP record is invalid'], 400);
    }

    $expiresAt = $otpRecord->created_at->addMinutes(15);

    if ($expiresAt->isPast()) {
        return response()->json([
            'error' => 'OTP expired',
            'generated_at' => $otpRecord->created_at->toDateTimeString(),
            'expired_at' => $expiresAt->toDateTimeString()
        ], 400);
    }

    // Optionally mark OTP as used
    $otpRecord->update(['used_at' => now()]);

    return response()->json([
        'message' => 'OTP verified successfully',
        'valid_until' => $expiresAt->toDateTimeString()
    ]);
}
public function resetPasswordWithOtp(Request $request)
{
    $validated = $request->validate([
        'email' => 'required|email|exists:users,email',
        'otp' => 'required|digits:6',
        'password' => 'required|confirmed|min:8'
    ]);

    try {
        \DB::beginTransaction();

        $otpRecord = PasswordResetOtp::where('email', $validated['email'])
                                    ->where('otp', $validated['otp'])
                                    ->firstOrFail();

        if ($otpRecord->created_at->addMinutes(15)->isPast()) {
            throw new \Exception('OTP expired');
        }

        $user = User::where('email', $validated['email'])->firstOrFail();
        $user->password = Hash::make($validated['password']);
        $user->save();

        PasswordResetOtp::where('email', $validated['email'])->delete();

        \DB::commit();

        return response()->json([
            'message' => 'Password reset successfully',
            'user_id' => $user->id
        ]);

    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        \DB::rollBack();
        return response()->json(['error' => 'Invalid OTP or user not found'], 400);
    } catch (\Exception $e) {
        \DB::rollBack();
        \Log::error("Password reset failed for {$request->email}: " . $e->getMessage());
        return response()->json([
            'error' => 'Password reset failed',
            'message' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 500);
    }
}









    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'nic' => 'required|string|max:255|unique:users', // Added NIC validation
            'contact_number' => 'required|string|max:255',
            'password' => ['required', Rules\Password::defaults()],
            'role' => 'sometimes|in:admin,sales_rep'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'nic' => $request->nic, // Added NIC field
            'contact_number' => $request->contact_number,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'sales_rep',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }



    public function registerRep(Request $request)
{
    try {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
            'nic' => 'required|string|max:20|unique:users',
            'contact_number' => 'required|string|max:20'
        ]);

        $salesRep = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'nic' => $validated['nic'],
            'contact_number' => $validated['contact_number'],
            'role' => 'sales_rep'
        ]);

        // Send email (queued)
        Mail::to($validated['email'])
            ->queue(new SalesRepCredentials(
                $validated['name'],
                $validated['email'],
                $validated['password']
            ));

        return response()->json([
            'success' => true,
            'message' => 'Sales rep created successfully',
            'data' => $salesRep
        ], 201);

    } catch (ValidationException $e) {
        return response()->json([
            'success' => false,
            'errors' => $e->errors()
        ], 422);
    } catch (\Exception $e) {
        \Log::error('Registration failed: '.$e->getMessage());
        return response()->json([
            'success' => false,
            'message' => 'Account created but email failed to send',
            'error' => env('APP_DEBUG') ? $e->getMessage() : null
        ], 201);
    }
}

    public function login(Request $request)
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login details'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    public function getSalesReps()
    {
        $reps = Admin::where('role', 'sales_rep')
            ->select('id', 'name', 'email', 'nic', 'contact_number', 'created_at')
            ->get();  // Remove ->paginate()

        return response()->json([
            'success' => true,
            'data' => $reps,  // Now just the array of reps
            'message' => 'Sales representatives retrieved successfully'
        ]);
    }




    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }
}