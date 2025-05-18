<?php

use Illuminate\Support\Facades\Route;

// Default welcome route
Route::get('/', function () {
    return view('welcome');
});

// Home route (protected by auth)
Route::get('/home', function () {
    return view('home');
})->middleware('auth');