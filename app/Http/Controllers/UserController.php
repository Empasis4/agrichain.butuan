<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // Admin: List pending users
    public function getPendingUsers()
    {
        return User::where('status', 'pending')->get();
    }

    // Admin: Verify user
    public function verifyUser($id, Request $request)
    {
        $user = User::findOrFail($id);
        $user->status = $request->status; // 'verified' or 'rejected'
        $user->save();

        // Create notification for the user
        \App\Models\Notification::create([
            'user_id' => $user->id,
            'title' => 'Verification Update',
            'message' => "Your account has been " . ($request->status === 'verified' ? 'Approved' : 'Rejected') . ".",
            'type' => 'system'
        ]);

        return response()->json(['message' => 'User status updated successfully', 'user' => $user]);
    }

    // Profile: Update user
    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $user->update($request->all());
        return response()->json($user);
    }

    // Admin: Get Dashboard Stats
    public function getAdminStats()
    {
        $today = date('Y-m-d');
        return [
            'total_users' => User::count(),
            'pending_verifications' => User::where('status', 'pending')->count(),
            'total_farmers' => User::where('role', 'farmer')->count(),
            'total_retailers' => User::where('role', 'retailer')->count(),
            'total_revenue' => \App\Models\Order::whereIn('status', ['paid', 'shipped', 'delivered', 'approved'])->sum('total_price'),
            'ready_for_pickup' => \App\Models\Order::whereIn('status', ['approved', 'paid'])->count(),
            'out_for_delivery' => \App\Models\Order::where('status', 'shipped')->count(),
            'delivered_today' => \App\Models\Order::where('status', 'delivered')->whereDate('updated_at', $today)->count(),
            'pending_payments' => \App\Models\Order::whereIn('status', ['pending'])->count(),
        ];
    }

    // Profile: Soft delete user
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
    public function storeRider(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6',
            'phone' => 'nullable|string'
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'role' => 'rider',
            'status' => 'verified',
            'phone' => $validated['phone']
        ]);

        return response()->json(['message' => 'Rider account created successfully', 'user' => $user], 201);
    }
}
