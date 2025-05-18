<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Returns;
class Shop extends Model
{
    use HasFactory;

    protected $fillable = ['shop_name', 'location', 'contact','return_balance'];

    public function returns()
    {
        return $this->hasMany(Returns::class);
    }
}