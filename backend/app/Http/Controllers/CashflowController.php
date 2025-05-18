<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Returns;
use Illuminate\Http\Request;
use App\Models\Cashflow;
use App\Models\Order;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class CashflowController extends Controller
{
    public function index()
    {
        return response()->json(Cashflow::all(), 200);
    }

    public function store(Request $request)
    {
        $today = Carbon::today();

        //  Get total of bad return costs (adjust 'type' and 'bad' if needed)
        $badReturnsTotal = Returns::where('type', 'bad')->sum('return_cost');

        //  Calculate item expenses
        $itemExpenses = Item::all()->sum(function ($item) {
            return $item->quantity * $item->itemCost;
        });

        //  Get user input
        $transport = (float) $request->input('transport');
        $other = (float) $request->input('other');

        //  Total income
        $totalIncome = Order::sum('total_price');

        //  Total expenses and profit
        $totalExpenses = $badReturnsTotal + $itemExpenses + $transport + $other;
        $totalProfit = $totalIncome - $totalExpenses;

        //  Validation
        $validator = Validator::make($request->all(), [
            'transport' => 'required|numeric|max:999999.99',
            'other' => 'required|numeric|max:999999.99',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $cashflow = Cashflow::create([
                'income' => $totalIncome,
                'transport' => $transport,
                'other' => $other,
                'expenses' => $totalExpenses,
                'profit' => $totalProfit,
                'created_at' => $today,
                'updated_at' => now(),
            ]);

            return response()->json([
                'message' => 'Cashflow created successfully',
                'cashflow' => $cashflow
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Something went wrong',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $cashflow = Cashflow::find($id);

        if (!$cashflow) {
            return response()->json(['message' => 'Cashflow not found'], 404);
        }

        return response()->json($cashflow, 200);
    }

    public function dailySummary()
    {
        $today = Carbon::today();

        $dailyCashflow = Cashflow::whereDate('created_at', $today)->get();

        $income = $dailyCashflow->sum('income');
        $expenses = $dailyCashflow->sum('expenses');
        $profit = $dailyCashflow->sum('profit');

        return response()->json([
            'income' => $income,
            'expenses' => $expenses,
            'profit' => $profit
        ]);
    }

    public function monthlySummary()
    {
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();

        $monthlyCashflow = Cashflow::whereBetween('created_at', [$startOfMonth, $endOfMonth])->get();

        $income = $monthlyCashflow->sum('income');
        $expenses = $monthlyCashflow->sum('expenses');
        $profit = $monthlyCashflow->sum('profit');

        return response()->json([
            'income' => $income,
            'expenses' => $expenses,
            'profit' => $profit
        ]);
    }
}
