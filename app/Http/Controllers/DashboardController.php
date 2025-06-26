<?php

namespace App\Http\Controllers;

use App\Models\EmbedHistory;
use App\Models\SavedEmbed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $userId = Auth::id();
        $user = Auth::user();
        
    
        $totalSent = EmbedHistory::where('user_id', $userId)->count();
        
        $totalSaved = SavedEmbed::where('user_id', $userId)->count();
        
        $weekStart = Carbon::now()->startOfWeek();
        $recentActivity = EmbedHistory::where('user_id', $userId)
            ->where('created_at', '>=', $weekStart)
            ->count();
        
            
        $recentEmbeds = EmbedHistory::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($embed) {
                return [
                    'id' => $embed->id,
                    'title' => $embed->title ?: 'Untitled Embed',
                    'status' => $embed->status,
                    'timestamp' => $embed->created_at->diffForHumans(),
                    'color' => $embed->color ?: '#FFD700',
                ];
            });
        
        $recentTemplates = SavedEmbed::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->take(3)
            ->get()
            ->map(function ($template) {
                return [
                    'id' => $template->id,
                    'name' => $template->name,
                    'created_at' => $template->created_at->diffForHumans(),
                    'color' => $template->embed_data['color'] ?? '#FFD700',
                ];
            });
        
        $dailyActivity = EmbedHistory::where('user_id', $userId)
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();
        
        return Inertia::render('dashboard', [
            'stats' => [
                'totalSent' => $totalSent,
                'totalSaved' => $totalSaved,
                'recentActivity' => $recentActivity,
            ],
            'recentEmbeds' => $recentEmbeds,
            'recentTemplates' => $recentTemplates,
            'dailyActivity' => $dailyActivity,
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'theme' => $user->theme ?? 'system',
                    'avatar' => $user->avatar ?? null,
                ],
            ],
        ]);
    }
}
