<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'retailer_id', 'total_price', 'status', 'payment_method', 'delivery_address', 'order_date', 'rider_name', 'tracking_number', 'rider_id',
        'shipping_fee', 'payment_proof_image', 'payment_reference', 'map_coordinates'
    ];

    public function retailer()
    {
        return $this->belongsTo(User::class, 'retailer_id');
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function rider()
    {
        return $this->belongsTo(User::class, 'rider_id');
    }
}
