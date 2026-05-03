<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return Product::with('farmer')->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'farmer_id' => 'required|exists:users,id',
            'name' => 'required|string',
            'category' => 'required|string',
            'price_per_kg' => 'required|numeric',
            'quantity_available' => 'required|numeric',
            'unit' => 'required|string',
            'harvest_date' => 'required|date',
            'description' => 'nullable|string',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function show($id)
    {
        return Product::with('farmer')->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $product->update($request->all());
        return response()->json($product);
    }

    public function getFarmerProducts($farmer_id)
    {
        return Product::where('farmer_id', $farmer_id)->get();
    }

    public function destroy($id)
    {
        Product::destroy($id);
        return response()->json(['message' => 'Product deleted']);
    }
}
