<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Shop;
use App\Models\Item;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Returns;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index()
    {
        //return response()->json(Order::all());
        return response()->json(Order::with([
            'items'=>function($query){
            $query->select('items.id','items.item','items.unitPrice','order_items.quantity');
        }
        ])->get());
    }

    // Create new order
    //public function store(Request $request)
    // {
    //     \Log::info("Incoming order request:",$request->all());
    //     try{
    //         $validated = $request->validate([
    //             'shop_id' => 'required|exists:shops,id',
    //             'total_price' => 'required|numeric',
    //             'items'=>'required|array',
    //             'items.*.item_id'=>'required|exists:items,id',
    //             'items.*.quantity'=>'required|integer|min:1',
    //             'items.*.item_expenses'=>'nullable|numeric|min:0',
    //             'discount'=>'nullable|numeric|min:0',
    //             'return_balance'=>'nullable|numeric|min:0',
    //         ]);

    //         return DB::transaction(function () use ($validated,$request){
    //             $shop = Shop::findOrFail($validated['shop_id']);
    //             $currentReturnBalance=$shop->return_balance;
    //             $orderTotal=$validated['total_price'];
    //             $discount = $validated['discount'] ?? 0;
    //             $discountedTotal = $orderTotal-$discount;
    //             $goodReturnValue = Returns::where('shop_id',$validated['shop_id'])->sum('return_cost');
    //             $returnBalanceToUse = min($goodReturnValue,$orderTotal);    
    //             $remainingReturnBalance = $validated['return_balance'];
    //             $finalAmountToPay = max(0,$discountedTotal-$returnBalanceToUse);
    //             $shop->update(['return_balance'=>$remainingReturnBalance]);

    //             if($remainingReturnBalance> 0){
    //                 Returns::where('shop_id',$validated['shop_id'])->decrement('return_cost',$remainingReturnBalance);
    //             }
                
    //             $order = Order:: create([
    //                 'total_price'=>$discountedTotal,
    //                 'return_balance'=>$remainingReturnBalance,
    //                 'shop_id'=>$validated['shop_id'],
    //                 'user_name'=>$request->user_name,
    //                 'status'=>"Pending",
    //                 'discount'=>$discount,
    //             ]);

    //             $formattedItems=[];
    //             foreach($validated['items'] as $item){
    //                 $formattedItems[$item['item_id']]=['quantity'=>$item['quantity'],'item_expenses'=>$item['item_expenses'] ?? 0];
    //             }
    //             \Log::info('Attching items:',$formattedItems);
    //             $order->items()->attach($formattedItems);

    //             return response()->json([
    //                 'message'=> 'Order created successfully',
    //                 'order'=>$order->load(['items'=>function($query){
    //                     $query->select('items.id','items.item','items.unitPrice','order_items.quantity','order_items.item_expenses');
    //                 }]),
    //             ],201);
            
    //         });

    //         }catch(\Illuminate\Validation\ValidationException $e){
    //             return response()->json(['error'=>$e->getMessage()],422);
    //         }catch(\Exception $e){
    //             \Log::error('Order creation failed:'. $e->getMessage());
    //             return response()->json([
    //                 'error'=>"Failed to create order",
    //                 'message'=>$e->getMessage()
    //             ],500);
    //         }
    // }
    
   // //worked well
//     public function store(Request $request)
// {
//     \Log::info("Incoming order request:", $request->all());
    
//     try {
//         $validated = $request->validate([
//             'shop_id' => 'required|exists:shops,id',
//             'total_price' => 'required|numeric',
//             'items' => 'required|array',
//             'items.*.item_id' => 'required|exists:items,id',
//             'items.*.quantity' => 'required|integer|min:1',
//             'items.*.item_expenses' => 'nullable|numeric|min:0',
//             'discount' => 'nullable|numeric|min:0',
//             'user_name' => 'required|string',
//         ]);

//         return DB::transaction(function () use ($validated) {
//             $shop = Shop::findOrFail($validated['shop_id']);
            
//             $order = Order::create([
//                 'total_price' => $validated['total_price'],
//                 'return_balance' => 0, // Initialize to 0, adjust as needed
//                 'shop_id' => $validated['shop_id'],
//                 'user_name' => $validated['user_name'],
//                 'status' => "Pending",
//                 'discount' => $validated['discount'] ?? 0,
//             ]);

//             $formattedItems = [];
//             foreach ($validated['items'] as $item) {
//                 $formattedItems[$item['item_id']] = [
//                     'quantity' => $item['quantity'],
//                     'item_expenses' => $item['item_expenses'] ?? 0
//                 ];
//             }
            
//             $order->items()->attach($formattedItems);

//             return response()->json([
//                 'message' => 'Order created successfully',
//                 'order' => $order->load(['items' => function($query) {
//                     $query->select('items.id', 'items.item', 'items.unitPrice', 
//                                  'order_items.quantity', 'order_items.item_expenses');
//                 }]),
//             ], 201);
//         });

//     } catch (\Illuminate\Validation\ValidationException $e) {
//         return response()->json(['errors' => $e->errors()], 422);
//     } catch (\Exception $e) {
//         \Log::error('Order creation failed: '. $e->getMessage());
//         return response()->json([
//             'error' => "Failed to create order",
//             'message' => $e->getMessage()
//         ], 500);
//     }
// }

//worked 2
// public function store(Request $request)
// {
//     \Log::info("Incoming order request:", $request->all());
    
//     try {
//         $validated = $request->validate([
//             'shop_id' => 'required|exists:shops,id',
//             'total_price' => 'required|numeric',
//             'items' => 'required|array',
//             'items.*.item_id' => 'required|exists:items,id',
//             'items.*.quantity' => 'required|integer|min:1',
//             'items.*.item_expenses' => 'nullable|numeric|min:0',
//             'discount' => 'nullable|numeric|min:0',
//             'user_name' => 'required|string',
//             'return_balance_used' => 'nullable|numeric|min:0',
//         ]);

//         return DB::transaction(function () use ($validated) {
//             $shop = Shop::findOrFail($validated['shop_id']);
            
//             // Process return balance if being used
//             $remainingReturnBalance = $shop->return_balance;
//             $returnBalanceUsed = $validated['return_balance_used'] ?? 0;
            
//             if ($returnBalanceUsed > 0) {
//                 // Get returns ordered by oldest first
//                 $returns = Returns::where('shop_id', $validated['shop_id'])
//                     ->where('return_cost', '>', 0)
//                     ->orderBy('created_at')
//                     ->get();
                
//                 $balanceToConsume = $returnBalanceUsed;
                
//                 foreach ($returns as $return) {
//                     if ($balanceToConsume <= 0) break;
                    
//                     $consumable = min($return->return_cost, $balanceToConsume);
//                     $return->decrement('return_cost', $consumable);
//                     $balanceToConsume -= $consumable;
//                 }
                
//                 // Update shop's return balance
//                 $remainingReturnBalance = $shop->return_balance - $returnBalanceUsed;
//                 $shop->update(['return_balance' => $remainingReturnBalance]);
//             }

//             $order = Order::create([
//                 'total_price' => $validated['total_price'],
//                 'return_balance' => $returnBalanceUsed,
//                 'shop_id' => $validated['shop_id'],
//                 'user_name' => $validated['user_name'],
//                 'status' => "Pending",
//                 'discount' => $validated['discount'] ?? 0,
//             ]);

//             $formattedItems = [];
//             foreach ($validated['items'] as $item) {
//                 $formattedItems[$item['item_id']] = [
//                     'quantity' => $item['quantity'],
//                     'item_expenses' => $item['item_expenses'] ?? 0
//                 ];
//             }
            
//             $order->items()->attach($formattedItems);

//             return response()->json([
//                 'message' => 'Order created successfully',
//                 'order' => $order->load(['items' => function($query) {
//                     $query->select('items.id', 'items.item', 'items.unitPrice', 
//                                  'order_items.quantity', 'order_items.item_expenses');
//                 }]),
//                 'return_balance_used' => $returnBalanceUsed,
//                 'remaining_return_balance' => $remainingReturnBalance
//             ], 201);
//         });

//     } catch (\Illuminate\Validation\ValidationException $e) {
//         return response()->json(['errors' => $e->errors()], 422);
//     } catch (\Exception $e) {
//         \Log::error('Order creation failed: '. $e->getMessage());
//         return response()->json([
//             'error' => "Failed to create order",
//             'message' => $e->getMessage()
//         ], 500);
//     }
// }

public function store(Request $request)
{
    \Log::info("Incoming order request:", $request->all());
    
    try {
        $validated = $request->validate([
            'shop_id' => 'required|exists:shops,id',
            'total_price' => 'required|numeric',
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.item_expenses' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'user_name' => 'required|string',
            'return_balance_used' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated) {
            $shop = Shop::findOrFail($validated['shop_id']);
            
            // Process return balance if being used
            $remainingReturnBalance = $shop->return_balance;
            $returnBalanceUsed = $validated['return_balance_used'] ?? 0;
            
            if ($returnBalanceUsed > 0) {
                $returns = Returns::where('shop_id', $validated['shop_id'])
                    ->where('return_cost', '>', 0)
                    ->orderBy('created_at')
                    ->get();
                
                $balanceToConsume = $returnBalanceUsed;
                
                foreach ($returns as $return) {
                    if ($balanceToConsume <= 0) break;
                    
                    $consumable = min($return->return_cost, $balanceToConsume);
                    $return->decrement('return_cost', $consumable);
                    $balanceToConsume -= $consumable;
                }
                
                $remainingReturnBalance = $shop->return_balance - $returnBalanceUsed;
                $shop->update(['return_balance' => $remainingReturnBalance]);
            }

            $order = Order::create([
                'total_price' => $validated['total_price'],
                'return_balance' => $returnBalanceUsed,
                'shop_id' => $validated['shop_id'],
                'user_name' => $validated['user_name'],
                'status' => "Pending",
                'discount' => $validated['discount'] ?? 0,
            ]);

            $backorderedItems = [];
            
            foreach ($validated['items'] as $itemData) {
                $item = Item::findOrFail($itemData['item_id']);
                $orderedQuantity = $itemData['quantity'];
                $currentStock = $item->quantity;
                
                // Calculate new quantity (can go negative)
                $newQuantity = $currentStock - $orderedQuantity;
                
                // Update item stock
                $item->update(['quantity' => $newQuantity]);
                
                // Track backordered items
                if ($newQuantity < 0) {
                    $backorderedItems[] = [
                        'item_id' => $item->id,
                        'item_name' => $item->item,
                        'ordered_quantity' => $orderedQuantity,
                        'available_stock' => $currentStock,
                        'backordered_quantity' => abs($newQuantity),
                        'unit_price' => $item->unitPrice
                    ];
                }
                
                // Only include fields that exist in the pivot table
                $order->items()->attach($itemData['item_id'], [
                    'quantity' => $itemData['quantity'],
                    'item_expenses' => $itemData['item_expenses'] ?? 0
                ]);
            }

            $response = [
                'message' => 'Order created successfully',
                'order' => $order->load(['items' => function($query) {
                    $query->select('items.id', 'items.item', 'items.unitPrice', 
                                 'order_items.quantity', 'order_items.item_expenses');
                }]),
                'return_balance_used' => $returnBalanceUsed,
                'remaining_return_balance' => $remainingReturnBalance,
                'has_backorders' => !empty($backorderedItems),
            ];
            
            if (!empty($backorderedItems)) {
                $response['backordered_items'] = $backorderedItems;
                $response['message'] = 'Order created with backordered items';
            }

            return response()->json($response, 201);
        });

    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['errors' => $e->errors()], 422);
    } catch (\Exception $e) {
        \Log::error('Order creation failed: '. $e->getMessage());
        return response()->json([
            'error' => "Failed to create order",
            'message' => $e->getMessage(),
            'trace' => config('app.debug') ? $e->getTrace() : null
        ], 500);
    }
}
    // Show single order
    public function show($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        return response()->json($order);
    }

    // Update order
    public function update(Request $request, $id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $validated = $request->validate([
            'shop_id'=>'required|exists:shops,id',
            'total_price'=> 'required|numeric',
            'discount'=>'sometimes|numeric|min:0',
            'items'=>'sometimes|array',
            'items.*.item_id'=>'required|exists:items,id',
            'items.*.quantity'=>'required|integer|min:1',
            'items.*.item_expenses'=>'nullable|numeric|min:0',
        ]);

        $goodReturnValue = Returns::where('shop_id',$validated['shop_id'])->sum('return_cost');
        $orderCost = max(0,$validated['total_price']-$goodReturnValue);

        $order->update([
            'shop_id'=>$validated['shop_id'],
            'total_price'=>$orderCost,
            'status'=>"Pending",
            'return_balance'=>$validated['return_balance'],
            'discount'=>$validated['discount'],
            'username'=> $validated['username']
        ]);

        $formattedItems=[];
        foreach($validated['items'] as $item){
            $stockQuantity = Item::find($item['item_id'])->quantity;
            $formattedItems[$item['item_id']]=['quantity'=> $item['quantity'],'item_expenses'=>$item['item_expenses']??0];
        }

        $order->items()->sync($formattedItems);

        return response()->json([
            'message' => 'Order updated successfully',
            'order' => $order->load(['items'=> function ($query) {
                $query->select('items.id','items.item','items.unitPrice','order_items.quantity','order_items.item_expenses');
            }]),
        ]);
    }

    //update status
    public function updateStatus(Request $request,$id)
    {
        $order = Order::find($id);

        if(!$order){
            return response()->json(['message'=> 'Order not found'],404);
        }

        $validated = $request->validate([
            'status'=>'required|string|in:Pending,Accepted,Cancelled,ACCEPTED,CANCELLED,PENDING',
        ]);

        $order->update([
            'status'=>$validated['status'],
        ]);

        return response()->json([
            'message'=> 'Order status Updated Success fully',
            'order'=>$order,
        ]);
    }

    // Delete order
    public function destroy($id)
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        $order->delete();

        return response()->json(['message' => 'Order deleted successfully']);
    }

    public function calculateOrderCost($shopId, $orderAmount){
        if(!Shop::find($shopId)){
            return response()->json(['error'=>"Shop not found!"],404);
        }

        $goodReturnValue = Returns::where('shop_id',$shopId)->sum('return_cost');
        $orderCost = max(0,$orderAmount-$goodReturnValue);

        if($orderAmount>=$goodReturnValue){
            Returns::where('shop_id',$shopId)->delete();
            $remainingGoodReturn=0;
        } else {
            $remainingGoodReturn=$goodReturnValue-$orderAmount;
            ReturnItem::where('shop_id',$shopId)->update(['return_cost'=>$remainingGoodReturn]);
        }
        return response()->json([
            'shop_id'=>$shopId,
            'orginal_order_order_amount'=>$orderAmount,
            'return_balance'=>$orderCost,
            'remaining_good_return'=> $orderAmount<$goodReturnValue ? $goodReturnValue-$orderAmount : 0
        ]);
    }

    //accept Order
    public function acceptOrder(Request $request,$id)
    {
        $order = Order::find($id);
        $order = Order::with(['items'=> function ($query) {
            $query->withPivot('quantity');
        }])->find($id);

        if(!$order){
            return response()->json(['message'=>'Order not found'],404);
        }

        $insufficientStock = [];

        foreach ($order->items as $item) {
            $stockQuantity = Item::find($item->id)->quantity;
            $orderedQuantity = $item->pivot->quantity;
            if($orderedQuantity>$stockQuantity){
                $insufficientStock[]=[
                    'item_id'=> $item->id,
                    'item_name'=> $item->item,
                    'needed'=>$item->pivot->quantity-$stockQuantity
                ];
            }
        }

        if(!empty($insufficientStock)){
            return response()->json([
                'message'=>'Stock needs to be increased for the following items: ',
                'insufficient_stock'=>$insufficientStock
            ],400);
        }

        foreach($order->items as $item) {
            Item:: where('id',$item->id)->decrement('quantity',$item->pivot->quantity);
        }

        $order->update(['status'=>'Accepted']);
        
        return response()->json([
            'message'=>'Order accepted successfully',
            'order'=>$order
        ]);
    }

    public function showOrderItems($id){
        $order = Order::with(['items'=>function ($query){
            $query->select('items.id','items.item','items.unitPrice','order_items.quantity');
        }])->find($id);

        if(!$order){
            return response()->json(['message'=> 'Order not found'],404);
        }

        return response()->json($order);
    }
}