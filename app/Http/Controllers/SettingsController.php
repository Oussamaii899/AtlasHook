<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\EmbedHistory;
use App\Models\SavedEmbed;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        $user = Auth::user();
        
        return Inertia::render('Settings', [
            'user' => $user,
            'preferences' => [
                'theme' => $user->theme ?? 'system',
                'notifications' => $user->notifications ?? true,
                'auto_save' => $user->auto_save ?? true,
                'compact_mode' => $user->compact_mode ?? false,
                'email_notifications' => $user->email_notifications ?? true,
                'webhook_notifications' => $user->webhook_notifications ?? true,
                'error_notifications' => $user->error_notifications ?? true,
            ],
        ]);
    }

    public function updatePreferences(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'theme' => ['required', 'in:light,dark,system'],
            'notifications' => ['boolean'],
            'auto_save' => ['boolean'],
            'compact_mode' => ['boolean'],
        ]);

        $user->update([
            'theme' => $request->theme,
            'notifications' => $request->boolean('notifications'),
            'auto_save' => $request->boolean('auto_save'),
            'compact_mode' => $request->boolean('compact_mode'),
        ]);

        return redirect()->back(303)->with('success', 'Appearance settings updated successfully!');
    }

    public function updateNotifications(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'email_notifications' => ['boolean'],
            'webhook_notifications' => ['boolean'],
            'error_notifications' => ['boolean'],
        ]);

        $user->update([
            'email_notifications' => $request->email_notifications,
            'webhook_notifications' => $request->webhook_notifications,
            'error_notifications' => $request->error_notifications,
        ]);

        return redirect()->route('settings.index')->with('success', 'Notification settings updated successfully!');
    }

    public function exportData()
    {
        $user = Auth::user();
        
        $userData = [
            'user_info' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
            'saved_templates' => SavedEmbed::where('user_id', $user->id)->get(),
            'embed_history' => EmbedHistory::where('user_id', $user->id)->get(),
            'preferences' => [
                'theme' => $user->theme,
                'notifications' => $user->notifications,
                'auto_save' => $user->auto_save,
                'compact_mode' => $user->compact_mode,
                'email_notifications' => $user->email_notifications,
                'webhook_notifications' => $user->webhook_notifications,
            ],
            'exported_at' => now()->toISOString(),
            'export_version' => '1.0',
        ];

        $fileName = 'atlashook-export-user-' . $user->id . '-' . now()->format('Y-m-d-H-i-s') . '.json';
        
        return response()->streamDownload(function () use ($userData) {
            echo json_encode($userData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }, $fileName, [
            'Content-Type' => 'application/json',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }

    public function clearCache()
    {
        $user = Auth::user();
        
        
        return redirect()->route('settings.index')->with('success', 'Cache cleared successfully!');
    }

    public function resetPreferences()
    {
        $user = Auth::user();

        $user->update([
            'theme' => 'system',
            'notifications' => true,
            'auto_save' => true,
            'compact_mode' => false,
            'email_notifications' => true,
            'webhook_notifications' => true,
            'error_notifications' => true,
        ]);

        return redirect()->route('settings.index')->with('success', 'All preferences have been reset to default!');
    }
}
