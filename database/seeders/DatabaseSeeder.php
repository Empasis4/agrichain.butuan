<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        // Admin
        \App\Models\User::create([
            'name' => 'AgriChain Admin',
            'email' => 'admin@agrichain.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'admin',
            'status' => 'verified',
            'phone' => '09000000000',
            'location' => 'Butuan City Hall',
        ]);

        // Farmers
        $farmer1 = \App\Models\User::create([
            'name' => 'Mang Jose',
            'email' => 'jose.farmer@agrichain.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'farmer',
            'status' => 'verified',
            'phone' => '09123456781',
            'location' => 'Barangay Libertad',
        ]);

        \App\Models\User::create([
            'name' => 'Aling Maria',
            'email' => 'maria.farmer@agrichain.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'farmer',
            'status' => 'pending', // For admin to verify
            'phone' => '09123456782',
            'location' => 'Barangay Ampayon',
        ]);

        // Retailers
        \App\Models\User::create([
            'name' => 'Butuan Fresh Market',
            'email' => 'market.retailer@agrichain.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'retailer',
            'status' => 'verified',
            'phone' => '09987654321',
            'location' => 'Barangay Baan',
        ]);

        \App\Models\User::create([
            'name' => 'Sari-Sari Plus',
            'email' => 'sari.retailer@agrichain.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'role' => 'retailer',
            'status' => 'pending', // For admin to verify
            'phone' => '09987654322',
            'location' => 'Butuan City Proper',
        ]);

        // Products for Mang Jose
        \App\Models\Product::create([
            'farmer_id' => $farmer1->id,
            'name' => 'Red Onions',
            'category' => 'Vegetables',
            'price_per_kg' => 120.00,
            'quantity_available' => 500.00,
            'unit' => 'kg',
            'harvest_date' => now()->toDateString(),
            'description' => 'Grade A red onions.',
        ]);
    }
}
