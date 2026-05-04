<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddNewFeaturesFields extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('barangay')->nullable();
            $table->longText('permit_image')->nullable();
            $table->longText('farmer_id_image')->nullable();
            $table->longText('profile_picture')->nullable();
            $table->string('gcash_number')->nullable();
            $table->longText('gcash_qr')->nullable();
            $table->text('default_delivery_address')->nullable();
            $table->softDeletes();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->decimal('shipping_fee', 10, 2)->default(150.00);
            $table->longText('payment_proof_image')->nullable();
            $table->string('payment_reference')->nullable();
            $table->string('map_coordinates')->nullable();
        });

        // Add role 'rider' manually or update status if needed.
        // We will change the role column to string to avoid enum issues.
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('retailer')->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'barangay', 'permit_image', 'farmer_id_image', 'profile_picture',
                'gcash_number', 'gcash_qr', 'default_delivery_address'
            ]);
            $table->dropSoftDeletes();
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shipping_fee', 'payment_proof_image', 'payment_reference', 'map_coordinates'
            ]);
        });
    }
}
