<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Returns;

class Item extends Model
{
    use HasFactory;
    protected $fillable = ['item','unitPrice','quantity','itemCost'];
    
    public function orders()
    {
        return $this->belongsToMany(Order::class, 'order_items')->withPivot('quantity');
        
    }

    public function returns()
    {
        return $this->hasMany(Returns::class);
    }

    public function returnItems()
    {
        return $this->hasMany(ReturnItem::class);
    }
}
