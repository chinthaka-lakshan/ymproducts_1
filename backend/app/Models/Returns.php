<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use App\Models\Shop;
// use App\Models\Item;

class Returns extends Model
{
    use HasFactory;

    protected $table='returns';
    protected $fillable = ['shop_id','type','rep_name','return_cost'];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    
    // public function items()
    // {
    //     return $this->hasMany(Item::class);
    // }

    public function returnItems()
    {
        return $this->hasMany(ReturnItem::class,'return_id');
    }
}
