<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;

class NotificationController extends Controller
{
    // GET /api/notifications?user_id=X&limit=Y
    public function index(Request $request)
    {
        $userId = $request->query('user_id');
        if (!$userId) {
            return response()->json([]);
        }

        $query = Notification::where('user_id', $userId)->latest();

        if ($request->has('limit')) {
            $query->limit((int) $request->query('limit'));
        }

        return response()->json($query->get());
    }

    // POST /api/notifications
    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title'   => 'required|string',
            'message' => 'required|string',
            'type'    => 'nullable|string',
        ]);

        $notif = Notification::create([
            'user_id' => $validated['user_id'],
            'title'   => $validated['title'],
            'message' => $validated['message'],
            'type'    => $validated['type'] ?? 'system',
            'is_read' => false,
        ]);

        return response()->json($notif, 201);
    }

    // PATCH /api/notifications/{id} — mark as read
    public function update(Request $request, $id)
    {
        $notif = Notification::findOrFail($id);
        $notif->update(['is_read' => true]);
        return response()->json($notif);
    }

    // DELETE /api/notifications/{id}
    public function destroy($id)
    {
        Notification::destroy($id);
        return response()->json(null, 204);
    }

    public function markAllAsRead(Request $request)
    {
        $userId = $request->query('user_id');
        if ($userId) {
            Notification::where('user_id', $userId)->update(['is_read' => true]);
        }
        return response()->json(['message' => 'All notifications marked as read']);
    }
}
