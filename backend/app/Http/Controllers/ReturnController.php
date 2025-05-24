<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Returns;
use App\Models\Item;
use App\Models\Shop;
use App\Models\ReturnItem;
class ReturnController extends Controller
{
    public function store(Request $request)
    {
        \Log::info("Incoming Request:",$request->all());
        
        $validated = $request->validate([
            'shop_id'=>'required|exists:shops,id',
            'type'=>'required|string|in:good,bad',
            'return_cost'=>'required|numeric|min:0',
            'rep_name'=>'required|string',
            'items'=>'required|array|min:1',
            'items.*.item_id'=>'required|exists:items,id',
            'items.*.quantity'=>'required|integer|min:1',
            'items.*.unit_price' => 'nullable|numeric|min:0',
        ]);

        try{
            return DB::transaction(function () use ($validated) {
                $shop = Shop::lockForUpdate()->findOrFail($validated['shop_id']);

                $returnRecord = Returns::create([
                    'shop_id'=>$validated['shop_id'],
                    'type'=>$validated['type'],
                    'return_cost'=>$validated['return_cost'],
                    'rep_name'=> $validated['rep_name'],
                ]);

                //update return balance of a shop
                $shop->increment('return_balance', $validated['return_cost']);
                foreach($validated['items'] as $itemData){
                    $item = Item::findOrFail($itemData['item_id']);

                    ReturnItem::create([
                        'return_id'=> $returnRecord->id,
                        'item_id'=>$item->id,
                        'quantity'=>$itemData['quantity'],
                        'unit_price'=> $item->unitPrice,
                    ]);

                    if($validated['type']=='good') {
                        $item->increment('quantity',$itemData['quantity']);
                    }
                }

                return response()->json([
                    'message'=> 'Return stored successfully.',
                    'data' =>$returnRecord->load('returnItems.item'),
                ],201);
            });

        } catch (\Exception $e){
            return response()->json([
                'message'=>'Failed to store return',
                'error'=> $e->getMessage()
            ], 400);
        }
    }

    public function update(Request $request,$returnId, $shopId){
        $validated = $request->validate([
            'return_cost'=>'required|numeric|min:0',
            'items'=>'sometimes|array',
            'items.*.id'=>'sometimes|exists:return_items,id,return_id,'.$returnId,
            'items.*.item_id'=>'sometimes|exists:items,id',
            'items.*.quantity'=>'sometimes|integer|min:1'
        ]);

        try{
            return DB::transaction(function () use ($returnId, $shopId, $validated){
                $shop = Shop::lockForUpdate()->findOrFail($shopId);
                
                $return = Returns::with('returnItems')
                    ->where('id',$returnId)
                    ->where('shop_id',$shopId)
                    ->firstOrFail();

                $difference = $validated['return_cost']- $returnItem->return_cost;

                // $shop->increment('return_balance',$difference);
                $shop->increment('return_balance',$validated['return_cost']);
                $return->update(['return_cost'=>$validated['return_cost']]);

                if(isset($validated['items'])){
                    foreach($validated['items'] as $itemData) {
                        $returnItem = ReturnItem::where('return_id',$returnId)
                            ->where('id',$itemData['id'])
                            ->firstOrFail();

                        $item = Item::findOrFail($returnItem->item_id);
                        $quantityDifference = $itemData['quantity'] - $returnItem->quantity;

                        $returnItem->update([
                            'quantity'=>$itemData['quantity']
                        ]);

                        if($return->type =='good'){
                            $item->increment('quantity',$quantityDifference);
                        }
                    }
                }

                return response()->json([
                    'message'=>'Return Cost Updated successfully',
                    'error'=> $return->refresh()->load('returnItems.item'), 
                ]);
            });

        } catch (\Exception $e){
            return response()->json([
                'message'=>'Failed to Update return',
                'error'=> $e->getMessage() 
            ], 400);
        }
    }

    public function destroy($id){
        try{
            return DB::transaction(function () use ($id) {
                $return = Returns::with('returnItems')->findOrFail($id);
                $shop = Shop::lockForUpdate()->findOrFail($return->shop_id);

                $shop->decrement('return_balance',$return->return_cost);

                if($return->type == 'good') {
                    foreach($return->returnItems as $returnItem) {
                        $item = Item::find($returnItem->item_id);
                        if($item) {
                            $item->decrement('quantity',$returnItem->quantity);
                        }
                    }
                }
                $return->delete();

                return response()->json([
                    'message'=> 'Return deleted successfully'
                ]);
            });
        } catch (\Exception $e){
            return response()->json([
                'message'=>'Failed to delete return',
                'error'=>$e->getMessage()
            ], 400);
        }
        $returnItem = Returns::find($id);
    }

    public function show($returnId)
    {
        try {
            $return = Returns::with(['shop', 'returnItems.item'])
                ->findOrFail($returnId);
                        
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $return->id,
                    'shop_id' => $return->shop_id,
                    'shop_name' => $return->shop->shop_name,
                    'created_at' => $return->created_at->toISOString(),
                    'return_cost' => (float)$return->return_cost,
                    'type' => $return->type,
                    'rep_name' => $return->rep_name,
                    'items' => $return->returnItems->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'item_id' => $item->item_id,
                            'item_name' => $item->item->item_name,
                            'quantity' => (int)$item->quantity,
                            'unit_price' => (float)$item->unit_price,
                            'total_price' => (float)($item->quantity * $item->unit_price)
                        ];
                    })
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve return details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function goodReturns()
    {
        return $this->getReturnsByType('good');
    }

    public function badReturns()
    {
        return $this->getReturnsByType('bad');
    }

    protected function getReturnsByType($type)
    {
        try {
            $returns = Returns::with(['shop', 'returnItems.item'])
                ->where('type', $type)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($return) {
                    return [
                        'id' => $return->id,
                        'shop_id' => $return->shop_id,
                        'shop' => [
                            'id' => $return->shop->id,
                            'shop_name' => $return->shop->shop_name
                        ],
                        'created_at' => $return->created_at->toISOString(),
                        'return_cost' => (float)$return->return_cost,
                        'type' => $return->type,
                        'rep_name' => $return->rep_name,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $returns
            ]);
            
        } catch (\Exception $e) {
            \Log::error("Error fetching $type returns: " . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch returns',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function index()
    {
        $return = Returns::with(['shop','returnItems'])->get();
        return response()->json([
            'message'=> 'Return fetched successfully',
            'data'=>$returns
        ]);
    }


    public function getReturnBalance($shopId)
    {
        try{
            $shop = Shop::findOrFail($shopId);

            $balance = Returns::where('shop_id',$shopId)
                ->sum('return_cost');

            return response()->json([
                'success'=> true,
                'shop_id'=>$shopId,
                'shop_name'=> $shop->shop_name,
                'remaining_balance'=>$balance,
                'message'=>'Remaining return Balance retrieved succesfully'
            ]);
        
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
            'success'=>false,
            'message'=>'Shop not found'
            ], 404);

        } catch (\Exception $e){
            return response()->json([
                'success'=> false,
                'message'=>'Error fetching return balance:',$e->getMessage()
            ], 500);
        }
    }

    public function getShopReturns($shopId)
    {
        $retuns = Returns::with(['returnItems.item'])
                ->where('shop_id',$shopId)
                ->get();

        $shop = Shop::findOrFail($shopId);

        return response()->json([
            'message'=> 'Shop returns retrieved succesfully',
            'total_return_cost'=>$shop->return_balance,
            'data'=>$returns
        ]);
    }

    public function getShopReturnBalance($shopId)
    {
        try {
            $shop = Shop::findOrFail($shopId);
            return response()->json([
                'shop_id' => $shopId,
                'return_balance' => $shop->return_balance
            ]);
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Shop not found'], 404);
        }
    }
}