<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:farmer,retailer',
            'phone' => 'nullable|string',
            'location' => 'nullable|string',
            'verification_id' => 'nullable|string',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'location' => $validated['location'] ?? null,
            'verification_id' => $validated['verification_id'] ?? null,
            'status' => 'pending', // Default to pending for verification
        ]);

        return response()->json([
            'user' => $user,
            'message' => 'Registration successful. Waiting for admin approval.'
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if ($user && Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'user' => $user,
                'message' => 'Login successful'
            ]);
        }

        return response()->json(['message' => 'Invalid credentials'], 401);
    }
}
