<?php
 
 use Illuminate\Database\Migrations\Migration;
 use Illuminate\Database\Schema\Blueprint;
 use Illuminate\Support\Facades\Schema;
 
 class AddPermitPathToUsersTable extends Migration
 {
     public function up()
     {
         Schema::table('users', function (Blueprint $table) {
             $table->string('permit_path')->nullable()->after('permit_image');
             $table->string('vehicle_details')->nullable();
             $table->string('license_number')->nullable();
         });
     }
 
     public function down()
     {
         Schema::table('users', function (Blueprint $table) {
             $table->dropColumn(['permit_path', 'vehicle_details', 'license_number']);
         });
     }
 }
