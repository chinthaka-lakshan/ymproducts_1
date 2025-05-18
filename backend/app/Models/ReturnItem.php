<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Returns;

class ReturnItem extends Model
{
    use HasFactory;
    protected $fillable = ['return_id','item_id','quantity','unit_price'];

    public function return()
    {
        return $this->belongsTo(Returns::class,'return_id','id');
    }

    public function item()
    {
        return $this->belongsTo(Item::class);
    }
}
