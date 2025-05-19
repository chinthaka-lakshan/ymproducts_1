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
            'items.*.quantity'=>'required|integer|min:1'
            
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
                //handle good return items
                // if($validated['type']=='good' && !empty($validated['items'])){
                //     foreach ($validated['items'] as $itemData) {
                //         $item = Item::findOrFail($itemData['item_id']);
                        
                //         ReturnItem::create([
                //             'return_id'=> $returnRecord->id,
                //             'item-id'=>$item->id,
                //             'quantity'=>$itemData['quantity'],
                //             'unit_price'=> $item->unitPrice,
                //         ]);

                //     }
                // }
                return response()->json([
                    'message'=> 'Return stored successfully.',
                    'data' =>$returnRecord->load('returnItems.item'),
                ],201);
            });
        }catch(\Exception $e){
            return response()->json([
                'message'=>'Failed to store return',
                'error'=> $e->getMessage()
            ],400);
        }
    }
    // {

    //     \Log::info("Incoming Request:",$request->all());
        
    //         $validated = $request->validate([
    //         'shop_id'=>'required|exists:shops,id',
    //         'type'=>'required|string|in:good,bad',
    //         'return_cost'=>'required|numeric|min:0',
    //         'rep_name'=>'required|string',
    //         'items'=>'required|array|min:1',
    //         'items.*.item_id'=>'required:type,good,bad|exists:items.id',
    //         'items.*.quantity'=>'required:type,good,bad|integer'
            
    //     ]);
        

    //     //$validated['type']=strtolower($validated['type']);
    //     //DB::beginTransaction();
    //     $returns=null;
    //     try{
    //         return DB::transaction(function () use ($validated,$request){
    //             $shop = Shop::lockForUpdate()->findOrFail($shopId);

    //             $returnItem = Return::where()
    //         })
    //         if($validated['type']=='good'){
    //             $request->validate([
    //                     'items'=>'required|array|min:1',
    //                     'items.*.item_id'=>'required|exists:items,id',
    //                     'items.*.qty'=>'required|integer|min:1',
    //                 ]);
    //                 $returns = DB::transaction(function () use ($validated){
    //             $returnRecord =  Returns::create([
    //                 'shop_id'=>$validated['shop_id'],
    //                 'type'=>$validated['type'],
    //                 'return_cost'=>$validated['return_cost'],
    //                 'rep_name'=>$validated['rep_name'],
    //             ]);
         
    //             //add return quantity to item table if return type is good

    //             if(!empty($validated['items']) && is_array($validated['items'])){
                    
    //                 foreach($validated['items'] as $itemData){
    //                     $item=Item::find($itemData['item_id']);
    //                     if(!$item){
                            
    //                         throw new \Exception("Item with id {$itemData['item_id']} not found");
                            
    //                     }

    //                     $item->increment('quantity',$itemData['qty']);
    //                 }
    //             }
    //              return $returnRecord;
    //         });
    //         }else{
    //             $returns = Returns::create([
    //                 'shop_id'=>$validated['shop_id'],
    //                 'type'=>$validated['type'],
    //                 'return_cost'=>$validated['return_cost'],
    //                 'rep_name'=>$validated['rep_name'],
    //             ]);
    //         }
             
    //         return response()->json([
    //             'message'=> 'Return stored successfully.',
    //             'data'=>$returns,
                
    //         ],201);
    //     }catch(\Exception $e){
    //        return response()->json(['message'=>'Failed to store return','error'=> $e->getMessage()],400);
    //     }  
    // }

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
                // return response()->json([
                //     'message'=>'Return Cost Updated successfully',
                //     'error'=> $returnItem, 
                // ]);
                return response()->json([
                    'message'=>'Return Cost Updated successfully',
                    'error'=> $return->refresh()->load('returnItems.item'), 
                ]);
            });
        }catch(\Exception $e){
             return response()->json([
                    'message'=>'Failed to Update return',
                    'error'=> $e->getMessage() 
                ],400);
        }

        // $returnItem = Returns::where('id',$returnId)->where('shop_id',$shopId)->first();
        
        // if(!$returnItem){
        //     return response()->json(['message'=> 'Return item not found for this shop'],404);
        // }

        // $returnItem->update(['return_cost'=>$validated['return_cost']]);

        // return response()->json([
        //     'message'=>'Return cost updated successfully.',
        //     'data'=>$returnItem,
        // ]);
        
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
        }catch(\Exception $e){
            return response()->json([
                'message'=>'Failed to delete return',
                'error'=>$e->getMessage()
            ],400);
        }
        $returnItem = Returns::find($id);
        // if(!$returnItem){
        //     return response()->json(['message'=> 'Return item not found'],404);
        // }
        // $returnItem->delete();
        // return response()->json(['message'=> 'Return deleted successfully']);
    }

    // public function show($shopId){
    //     $returnData = Returns::with('shop')->where('shop_id',$shopId)->get();

    //     if($returnData->isEmpty()){
    //         return response()->json(['message'=> 'No return cost found for this shop.'],404);
    //     }
    //     $totalReturnCost = $returnData->sum('return_cost');

    //     return response()->json([
    //         'message'=>'Return cost found for this shop.',
    //         'total_return_cost'=>$totalReturnCost,
    //         'returns'=>$returnData
    //     ]);
public function show($returnId)
{
    try {
        $return = Returns::with(['shop', 'returnItems.item'])
                    ->findOrFail($returnId);
                    
        return response()->json([
            'success' => true,
            'message' => 'Return details retrieved successfully',
            'data' => $return
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
            ->get()
            ->map(function ($return) {
                return [
                    'id' => $return->id,
                    'shop_name' => $return->shop->name ?? 'Unknown Shop',
                    'created_at' => $return->created_at,
                    'return_cost' => $return->return_cost,
                    // Include other necessary fields
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
            'message' => 'Server error'
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
        // $returns = Returns::all();
        // return response()->json(['message'=> 'Return fetched successfully','data'=>$returns]);
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


        }catch(\Illuminate\Database\Eloquent\ModelNotFoundException $e){
            return response()->json([
            'success'=>false,
            'message'=>'Shop not found'
            ],404);
        }catch(\Exception $e){
            return response()->json([
                'success'=> false,
                'message'=>'Error fetching return balance:',$e->getMessage()
            ],500);
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
            'return_balance' => $shop->return_balance,
            'shop_id' => $shopId
        ]);
    } catch (ModelNotFoundException $e) {
        return response()->json(['error' => 'Shop not found'], 404);
    }
}
}
