<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('register', [\App\Http\Controllers\AuthController::class, 'register']);
Route::post('login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::get('/health', function () {
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
        $userCount = \App\Models\User::count();
        return response()->json(['status' => 'ok', 'message' => 'Connected to DB. Users: ' . $userCount]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'error', 'message' => 'DB Connection Failed: ' . $e->getMessage()], 500);
    }
});

Route::get('/user', function (Request $request) {
    if (!$request->user()) {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
    return $request->user();
})->middleware('auth:sanctum');

Route::get('products/farmer/{farmer_id}', [\App\Http\Controllers\ProductController::class, 'getFarmerProducts']);
Route::get('orders/farmer/{id}', [\App\Http\Controllers\OrderController::class, 'getFarmerOrders']);
Route::get('orders/retailer/{id}', [\App\Http\Controllers\OrderController::class, 'getRetailerOrders']);
Route::get('orders/rider/{id}', [\App\Http\Controllers\OrderController::class, 'getRiderOrders']);
Route::post('orders/{id}/verify-payment', [\App\Http\Controllers\OrderController::class, 'verifyPayment']);

Route::apiResource('products', \App\Http\Controllers\ProductController::class);
Route::apiResource('orders', \App\Http\Controllers\OrderController::class);

// User Management & Admin
Route::get('admin/users', [\App\Http\Controllers\UserController::class, 'index']);
Route::get('admin/pending-users', [\App\Http\Controllers\UserController::class, 'getPendingUsers']);
Route::post('admin/verify-user/{id}', [\App\Http\Controllers\UserController::class, 'verifyUser']);
Route::get('admin/stats', [\App\Http\Controllers\UserController::class, 'getAdminStats']);
Route::post('admin/riders', [\App\Http\Controllers\UserController::class, 'storeRider']);
Route::post('admin/broadcast', [\App\Http\Controllers\UserController::class, 'broadcastAnnouncement']);
Route::put('users/{id}', [\App\Http\Controllers\UserController::class, 'updateProfile']);
Route::get('admin/orders', [\App\Http\Controllers\OrderController::class, 'index']); // Get all orders for admin

Route::post('notifications/mark-all-read', [\App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
Route::apiResource('notifications', \App\Http\Controllers\NotificationController::class);

Route::get('messages/inbox/{userId}', [\App\Http\Controllers\MessageController::class, 'inbox']);
Route::get('messages/{userId1}/{userId2}', [\App\Http\Controllers\MessageController::class, 'index']);
Route::post('messages', [\App\Http\Controllers\MessageController::class, 'store']);
Route::get('users/{id}', [\App\Http\Controllers\UserController::class, 'show']);
Route::delete('users/{id}', [\App\Http\Controllers\UserController::class, 'destroy']);
