<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class FixOrderStatusEnum extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('status')->default('pending')->change();
        });

        // Migrate existing data to new status names
        DB::table('orders')->where('status', 'approved')->update(['status' => 'paid']);
        DB::table('orders')->where('status', 'in_transit')->update(['status' => 'shipped']);
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->enum('status', ['pending', 'approved', 'in_transit', 'delivered', 'cancelled'])->default('pending')->change();
        });
    }
}
