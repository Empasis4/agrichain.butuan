<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class OrderController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = \App\Models\Order::with(['retailer', 'items.product']);
        
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        return $query->latest()->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'retailer_id' => 'required|exists:users,id',
            'total_price' => 'required|numeric',
            'payment_method' => 'required|in:gcash,cod',
            'delivery_address' => 'required|string',
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric',
            'items.*.price_at_time' => 'required|numeric',
        ]);

        $order = \App\Models\Order::create([
            'retailer_id' => $validated['retailer_id'],
            'total_price' => $validated['total_price'],
            'payment_method' => $validated['payment_method'],
            'delivery_address' => $validated['delivery_address'],
            'status' => 'pending'
        ]);

        foreach ($validated['items'] as $item) {
            \App\Models\OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price_at_time' => $item['price_at_time'],
            ]);
        }

        return response()->json($order->load('items'), 201);
    }

    public function show($id)
    {
        return \App\Models\Order::with(['retailer', 'items.product.farmer'])->findOrFail($id);
    }

    public function update(Request $request, $id)
    {
        $order = \App\Models\Order::findOrFail($id);
        
        $validated = $request->validate([
            'status' => 'required|in:pending,approved,in_transit,delivered,cancelled'
        ]);

        $order->update(['status' => $validated['status']]);

        // Trigger notification logic here in a real app
        
        return response()->json($order);
    }

    public function verifyPayment($id)
    {
        $order = \App\Models\Order::findOrFail($id);
        
        // In a real scenario, this would interface with a payment gateway (GCash API)
        // For this high-fidelity demo, we'll mark it as approved.
        $order->update(['status' => 'approved']);

        // Create notification for the retailer
        \App\Models\Notification::create([
            'user_id' => $order->retailer_id,
            'title' => 'Payment Verified',
            'message' => "Your payment for ORD-{$order->id} has been verified. Fulfillment starting soon!",
            'type' => 'order'
        ]);

        // Create notification for the farmer(s)
        $order->load('items.product');
        $farmerIds = $order->items->pluck('product.farmer_id')->unique();
        foreach ($farmerIds as $farmerId) {
            \App\Models\Notification::create([
                'user_id' => $farmerId,
                'title' => 'New Paid Order!',
                'message' => "Payment for ORD-{$order->id} is verified. Please prepare for delivery.",
                'type' => 'order'
              ]);
        }
        
        return response()->json([
            'message' => 'Payment verified successfully and all parties notified.',
            'order' => $order
        ]);
    }
    public function getFarmerOrders($farmer_id)
    {
        return \App\Models\Order::whereHas('items.product', function($query) use ($farmer_id) {
            $query->where('farmer_id', $farmer_id);
        })->with(['retailer', 'items.product'])->latest()->get();
    }

    public function getRetailerOrders($retailer_id)
    {
        return \App\Models\Order::where('retailer_id', $retailer_id)->with(['items.product'])->latest()->get();
    }
}
