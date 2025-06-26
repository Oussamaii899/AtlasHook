<?php

namespace App\Http\Controllers;

use App\Models\SavedEmbed;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class SavedEmbedController extends Controller
{
    /**
     * Display the saved embeds page
     */
    public function index(Request $request)
    {
        try {
            $query = SavedEmbed::where('user_id', Auth::id())
                ->orderBy('updated_at', 'desc');

            // Apply filters
            if ($request->filled('search')) {
                $search = $request->get('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            if ($request->boolean('favorites_only')) {
                $query->where('is_favorite', true);
            }

            $perPage = 12;
            $saved = $query->paginate($perPage);

            return Inertia::render('Saved', [
                'saved' => $saved->items(),
                'total' => $saved->total(),
                'current_page' => $saved->currentPage(),
                'per_page' => $perPage,
                'filters' => [
                    'search' => $request->get('search'),
                    'favorites_only' => $request->boolean('favorites_only'),
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading saved embeds: ' . $e->getMessage());
            return Inertia::render('Saved', [
                'saved' => [],
                'total' => 0,
                'current_page' => 1,
                'per_page' => 12,
                'filters' => []
            ]);
        }
    }

    /**
     * Store a new saved embed
     */
    public function store(Request $request)
    {
        try {
            Log::info('Attempting to save embed', ['user_id' => Auth::id()]);
            
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'embed_data' => 'required|array',
                'is_favorite' => 'boolean',
            ]);

            $saved = SavedEmbed::create([
                'user_id' => Auth::id(),
                'name' => $validated['name'],
                'description' => $validated['description'],
                'embed_data' => $validated['embed_data'],
                'is_favorite' => $validated['is_favorite'] ?? false,
                'usage_count' => 0,
            ]);

            Log::info('Embed saved successfully', ['saved_id' => $saved->id]);

            return redirect()->back()->with('success', 'Embed template saved successfully!');
        
        } catch (\Illuminate\Validation\ValidationException $e) {
            Log::warning('Validation failed for embed save', ['errors' => $e->errors()]);
            return redirect()->back()->withErrors($e->errors())->withInput();
        } catch (\Exception $e) {
            Log::error('Failed to save embed: ' . $e->getMessage(), [
                'user_id' => Auth::id(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->withErrors(['message' => 'Failed to save embed template: ' . $e->getMessage()]);
        }
    }

    /**
     * Update a saved embed
     */
    public function update(Request $request, $id)
    {
        try {
            $saved = SavedEmbed::where('user_id', Auth::id())
                ->findOrFail($id);

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'description' => 'nullable|string|max:500',
                'embed_data' => 'required|array',
                'is_favorite' => 'boolean',
            ]);

            $saved->update($validated);

            return response()->json([
                'success' => true,
                'message' => 'Embed template updated successfully!'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update embed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update embed template'
            ], 500);
        }
    }

    /**
     * Toggle favorite status
     */
    public function toggleFavorite(Request $request, $id)
    {
        try {
            $saved = SavedEmbed::where('user_id', Auth::id())
                ->findOrFail($id);

            $validated = $request->validate([
                'is_favorite' => 'required|boolean'
            ]);

            $saved->update(['is_favorite' => $validated['is_favorite']]);

            $message = $validated['is_favorite'] ? 'Added to favorites!' : 'Removed from favorites!';
            return redirect()->back()->with('success', $message);
        
        } catch (\Exception $e) {
            Log::error('Failed to toggle favorite: ' . $e->getMessage());
            return redirect()->back()->withErrors(['message' => 'Failed to update favorite status']);
        }
    }

    /**
     * Increment usage count when template is used
     */
    public function incrementUsage($id)
    {
        try {
            $saved = SavedEmbed::where('user_id', Auth::id())
                ->findOrFail($id);

            $saved->increment('usage_count');

           
        } catch (\Exception $e) {
            Log::error('Failed to increment usage: ' . $e->getMessage());
            return response()->json(['success' => false], 500);
        }
    }

    /**
     * Delete a saved embed
     */
    public function destroy($id)
    {
        try {
            $saved = SavedEmbed::where('user_id', Auth::id())
                ->findOrFail($id);

            $saved->delete();

            return redirect()->back()->with('success', 'Embed template deleted successfully!');
        
        } catch (\Exception $e) {
            Log::error('Failed to delete embed: ' . $e->getMessage());
            return redirect()->back()->withErrors(['message' => 'Failed to delete embed template']);
        }
    }

    /**
     * Bulk delete saved embeds
     */
    public function bulkDelete(Request $request)
    {
        try {
            $validated = $request->validate([
                'embed_ids' => 'required|array',
                'embed_ids.*' => 'exists:saved_embeds,id'
            ]);

            $deleted = SavedEmbed::where('user_id', Auth::id())
                ->whereIn('id', $validated['embed_ids'])
                ->delete();

            return redirect()->back()->with('success', "Deleted {$deleted} embed templates successfully!");
        
        } catch (\Exception $e) {
            Log::error('Failed to bulk delete embeds: ' . $e->getMessage());
            return redirect()->back()->withErrors(['message' => 'Failed to delete embed templates']);
        }
    }
}
