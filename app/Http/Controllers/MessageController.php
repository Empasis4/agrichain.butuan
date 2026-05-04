<?php

namespace App\Http\Controllers;

use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index($userId1, $userId2)
    {
        return Message::where(function($q) use ($userId1, $userId2) {
            $q->where('sender_id', $userId1)->where('receiver_id', $userId2);
        })->orWhere(function($q) use ($userId1, $userId2) {
            $q->where('sender_id', $userId2)->where('receiver_id', $userId1);
        })->orderBy('created_at', 'asc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'sender_id' => 'required|exists:users,id',
            'receiver_id' => 'required|exists:users,id',
            'message' => 'required|string',
        ]);

        $message = Message::create($validated);
        return response()->json($message, 201);
    }

    public function inbox($userId)
    {
        $userId = (int)$userId;
        $messages = Message::where('sender_id', $userId)
            ->orWhere('receiver_id', $userId)
            ->with(['sender', 'receiver'])
            ->orderBy('created_at', 'desc')
            ->get();

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

        return response()->json(array_values($inbox));
    }
}
