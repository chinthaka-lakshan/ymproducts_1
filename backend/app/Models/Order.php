<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
       'total_price',
        'return_balance',
        'shop_id',
        'user_name',
        'status',
        "discount",
    ];

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }

    public function items()
    {
        return $this->belongsToMany(Item::class, 'order_items','order_id','item_id')->withPivot('quantity','item_expenses');
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class, 'order_id');
    }
}
