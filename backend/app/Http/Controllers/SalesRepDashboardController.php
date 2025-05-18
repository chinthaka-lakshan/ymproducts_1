<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class SalesRepDashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware(['auth:sanctum', 'role:sales_rep']);
    }

    public function index()
    {
        return response()->json([
            'message' => 'Welcome to Sales Representative Dashboard',
            'data' => 'Sales rep specific data here'
        ]);
    }
}