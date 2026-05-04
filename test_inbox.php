<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$userId = 16;
$messages = App\Models\Message::where('sender_id', $userId)->orWhere('receiver_id', $userId)->with(['sender', 'receiver'])->orderBy('created_at', 'desc')->get();
$inbox = [];
foreach ($messages as $msg) {
    $otherUser = $msg->sender_id == $userId ? $msg->receiver : $msg->sender;
    if (!$otherUser) continue;
    $otherUserId = $otherUser->id;
    if (!isset($inbox[$otherUserId])) {
        $inbox[$otherUserId] = [
            'id' => $otherUserId,
            'name' => $otherUser->name,
            'role' => $otherUser->role,
            'last_message' => $msg->message,
            'last_message_time' => $msg->created_at,
        ];
    }
}
print_r(array_values($inbox));
