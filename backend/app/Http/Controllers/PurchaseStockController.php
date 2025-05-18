<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PurchaseStock;
use Illuminate\Support\Facades\Validator;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Validation\ValidationException;

class PurchaseStockController extends Controller
{
    public function index()
    {
        return response()->json(PurchaseStock::all());
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'item' => 'required|string|max:255',
            'weight' => [
                'required',
                'numeric',
                'regex:/^\d+(\.\d{1,3})?$/'
            ],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $weight = number_format((float) $request->weight, 3, '.', '');
            $purchase_stock = PurchaseStock::create([
                'item' => $request->item,
                'weight' => $weight
            ]);

            return response()->json([
                'message' => 'Item Added Successfully',
                'purchase_stock' => $purchase_stock
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error when Adding Item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $purchase_stock = PurchaseStock::find($id);

        if (!$purchase_stock) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        $validator = Validator::make($request->all(), [
            'item' => 'sometimes|string|max:255',
            'weight' => [
                'sometimes',
                'numeric',
                'regex:/^\d+(\.\d{1,3})?$/'
            ]
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only(['item', 'weight']);

            if (isset($updateData['weight'])) {
                $updateData['weight'] = number_format((float) $updateData['weight'], 3, '.', '');
            }

            $purchase_stock->update($updateData);

            return response()->json([
                'message' => 'Stock Updated Successfully',
                'item' => $purchase_stock
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error when Updating Purchase Stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function addStock(Request $request, $id)
    {
        try {
            $purchase_stock = PurchaseStock::findOrFail($id);

            $validator = Validator::make($request->all(), [
                'weight' => [
                    'required',
                    'numeric',
                    'regex:/^\d+(\.\d{1,3})?$/'
                ],
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $weightToAdd = number_format((float) $request->weight, 3, '.', '');
            $newWeight = number_format((float) $purchase_stock->weight + $weightToAdd, 3, '.', '');

            $purchase_stock->update(['weight' => $newWeight]);

            return response()->json([
                'message' => 'Stock Added Successfully',
                'item' => $purchase_stock
            ], 200);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Item not found'], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error when Adding Stock',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $purchase_stock = PurchaseStock::find($id);

        if (!$purchase_stock) {
            return response()->json(['message' => 'Item not found'], 404);
        }

        try {
            $purchase_stock->delete();
            return response()->json(['message' => 'Item Deleted Successfully'], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error when deleting item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // In App\Http\Controllers\PurchaseStockController.php

    public function lowStock()
    {
        // Define your threshold for low stock (e.g., less than 10kg)
        $threshold = 5;
        
        $lowStockItems = PurchaseStock::where('weight', '<', $threshold)
            ->orderBy('weight', 'asc')
            ->get();
        
        return response()->json($lowStockItems);
    }
}