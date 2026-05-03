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
        return [
            'total_users' => User::count(),
            'pending_verifications' => User::where('status', 'pending')->count(),
            'total_farmers' => User::where('role', 'farmer')->count(),
            'total_retailers' => User::where('role', 'retailer')->count(),
            'total_revenue' => \App\Models\Order::where('status', 'approved')->sum('total_price'),
            'pending_payments' => \App\Models\Order::where('status', 'pending')->count(),
        ];
    }
}
