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

            // Decrement the stock of the product automatically
            $product = \App\Models\Product::find($item['product_id']);
            if ($product) {
                $product->quantity_available -= $item['quantity'];
                // Prevent negative stock
                if ($product->quantity_available < 0) {
                    $product->quantity_available = 0;
                }
                $product->save();
            }
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
            'status' => 'sometimes|string',
            'rider_name' => 'nullable|string',
            'tracking_number' => 'nullable|string'
        ]);
        
        // Auto-approve if status is 'paid' (for this demo)
        if (isset($validated['status']) && $validated['status'] === 'paid' && $order->status === 'pending') {
            return $this->verifyPayment($id);
        }

        $order->update($validated);
        
        // Trigger notifications for status changes
        if (isset($validated['status'])) {
            $statusMessages = [
                'shipped' => "Your order ORD-{$order->id} is now IN TRANSIT! Assigned Rider: " . ($order->rider_name ?? 'Delivery Personnel'),
                'delivered' => "Order ORD-{$order->id} has been DELIVERED. Thank you for choosing AgriChain!",
                'cancelled' => "Order ORD-{$order->id} has been cancelled by the system administrator.",
                'paid' => "Payment for ORD-{$order->id} has been verified. Fulfillment is now starting."
            ];

            if (isset($statusMessages[$validated['status']])) {
                // Notify Retailer
                \App\Models\Notification::create([
                    'user_id' => $order->retailer_id,
                    'title' => 'Order Update: ' . strtoupper($validated['status']),
                    'message' => $statusMessages[$validated['status']],
                    'type' => 'order'
                ]);

                // Notify Farmer(s)
                $order->load('items.product');
                $farmerIds = $order->items->pluck('product.farmer_id')->unique();
                foreach ($farmerIds as $farmerId) {
                    \App\Models\Notification::create([
                        'user_id' => $farmerId,
                        'title' => 'Order Update: ' . strtoupper($validated['status']),
                        'message' => "Order ORD-{$order->id} status changed to " . strtoupper($validated['status']),
                        'type' => 'order'
                    ]);
                }
            }
        }
        
        return response()->json($order);
    }

    public function verifyPayment($id)
    {
        $order = \App\Models\Order::findOrFail($id);
        
        // Mark as paid
        $order->update(['status' => 'paid']);

        // Create notification for the retailer
        \App\Models\Notification::create([
            'user_id' => $order->retailer_id,
            'title' => '💰 Payment Verified',
            'message' => "Your payment for ORD-{$order->id} has been verified by Admin. Fulfillment starting now!",
            'type' => 'order'
        ]);

        // Create notification for the farmer(s)
        $order->load(['items.product.farmer']);
        
        if ($order->items) {
            $farmerIds = $order->items->map(function($item) {
                return $item->product ? $item->product->farmer_id : null;
            })->filter()->unique();

            foreach ($farmerIds as $farmerId) {
                \App\Models\Notification::create([
                    'user_id' => $farmerId,
                    'title' => '📦 Prepare for Shipment',
                    'message' => "Order ORD-{$order->id} is now PAID. Please prepare the items for the rider.",
                    'type' => 'order'
                ]);
            }
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
