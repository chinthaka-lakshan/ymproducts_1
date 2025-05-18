<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasswordResetOtp extends Model
{
    protected $fillable = ['email', 'otp'];
    public $timestamps = false; // We manually handle created_at
    
    protected $casts = [
        'created_at' => 'datetime'
    ];
}