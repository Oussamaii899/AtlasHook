<?php

namespace App\Http\Controllers;

use App\Models\EmbedHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class EmbedHistoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = EmbedHistory::where('user_id', Auth::id())
                ->orderBy('created_at', 'desc');

            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('webhook_url', 'like', "%{$search}%");
                });
            }

            if ($request->filled('status')) {
                $query->where('status', $request->get('status'));
            }

            $perPage = 12;
            $histories = $query->paginate($perPage);

            return Inertia::render('History', [
                'histories' => $histories->items(),
                'total' => $histories->total(),
                'current_page' => $histories->currentPage(),
                'per_page' => $perPage,
                'filters' => [
                    'search' => $request->get('search'),
                    'status' => $request->get('status'),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading history: ' . $e->getMessage());
            return Inertia::render('History', [
                'histories' => [],
                'total' => 0,
                'current_page' => 1,
                'per_page' => 12,
                'filters' => []
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Attempting to save history', ['user_id' => Auth::id()]);
            
            $validated = $request->validate([
                'title' => 'nullable|string|max:255',
                'description' => 'nullable|string',
                'color' => 'nullable|string|max:7',
                'webhook_url' => 'required|string|max:500',
                'embed_data' => 'required|array',
                'status' => 'required|in:success,failed',
                'error_message' => 'nullable|string',
            ]);

            $history = EmbedHistory::create([
                'user_id' => Auth::id(),
                'title' => $validated['title'],
                'description' => $validated['description'],
                'color' => $validated['color'],
                'webhook_url' => $validated['webhook_url'],
                'embed_data' => $validated['embed_data'],
                'status' => $validated['status'],
                'error_message' => $validated['error_message'],
            ]);

            Log::info('History saved successfully', ['history_id' => $history->id]);

            return redirect()->back()->with('success', 'History saved successfully!');
            
        } catch (\Exception $e) {
            Log::error('Failed to save history: ' . $e->getMessage());
            return redirect()->back()->withErrors(['message' => 'Failed to save history']);
        }
    }

    /**
     * Resend an embed from history
     */
    public function resend($id)
    {
        try {
            $history = EmbedHistory::where('user_id', Auth::id())
                ->findOrFail($id);

            // Navigate to home page with the embed data for resending
            return redirect()->route('home', [
                'template' => json_encode($history->embed_data),
                'webhook_url' => $history->webhook_url,
                'quick_send' => true,
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to resend embed: ' . $e->getMessage());
            return redirect()->back()->withErrors(['message' => 'Failed to resend embed']);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            $history = EmbedHistory::where('user_id', Auth::id())
                ->findOrFail($id);
            
            $history->delete();
            return redirect()->back()->with('success', 'History deleted successfully!');
        } catch (\Exception $e) {
            Log::error('Failed to delete history: ' . $e->getMessage());
            return redirect()->back()->withErrors(['message' => 'Failed to delete history']);
        }
    }

    /**
     * Bulk delete history entries
     */
    public function bulkDelete(Request $request)
    {
        try {
            $validated = $request->validate([
                'history_ids' => 'required|array',
                'history_ids.*' => 'exists:embed_histories,id'
            ]);

            $deleted = EmbedHistory::where('user_id', Auth::id())
                ->whereIn('id', $validated['history_ids'])
                ->delete();

            return redirect()->back()->with('success', "Deleted {$deleted} history entries successfully!");
        
        } catch (\Exception $e) {
            Log::error('Failed to bulk delete history: ' . $e->getMessage());
            return redirect()->back()->withErrors(['message' => 'Failed to delete history entries']);
        }
    }
}
