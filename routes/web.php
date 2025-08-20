<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\DiscordController;
use App\Http\Controllers\EmbedHistoryController;
use App\Http\Controllers\SavedEmbedController;
use App\Http\Controllers\AtlasHookController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;


Route::get('/auth/discord/redirect', [DiscordController::class, 'redirect'])->name('discord.redirect');
Route::get('/auth/discord/callback', [DiscordController::class, 'callback'])->name('discord.callback');


Route::get('/', [AtlasHookController::class, 'index'])->name('home');

Route::get('/welcome', function() {
    return redirect('/');
});

Route::get('/faq', function() {
    return Inertia::render('FAQ');
})->name('faq');

Route::get('/contact', function() {
    return Inertia::render('ContactPage'); 
})->name('contact');


Route::middleware(['auth'])->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    
    Route::get('/history', [EmbedHistoryController::class, 'index'])->name('history.index');
    Route::post('/history', [EmbedHistoryController::class, 'store'])->name('history.store');
    Route::post('/history/{id}/resend', [EmbedHistoryController::class, 'resend'])->name('history.resend');
    Route::delete('/history/{id}', [EmbedHistoryController::class, 'destroy'])->name('history.destroy');
    Route::post('/history/bulk-delete', [EmbedHistoryController::class, 'bulkDelete'])->name('history.bulk-delete');
    
    Route::get('/saved', [SavedEmbedController::class, 'index'])->name('saved.index');
    Route::post('/saved', [SavedEmbedController::class, 'store'])->name('saved.store');
    Route::put('/saved/{id}', [SavedEmbedController::class, 'update'])->name('saved.update');
    Route::patch('/saved/{id}/favorite', [SavedEmbedController::class, 'toggleFavorite'])->name('saved.favorite');
    Route::post('/saved/{id}/use', [SavedEmbedController::class, 'incrementUsage'])->name('saved.use');
    Route::delete('/saved/{id}', [SavedEmbedController::class, 'destroy'])->name('saved.destroy');
    Route::post('/saved/bulk-delete', [SavedEmbedController::class, 'bulkDelete'])->name('saved.bulk-delete');


    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile/password', [ProfileController::class, 'updatePassword'])->name('profile.password');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    
        Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
        Route::put('/settings/preferences', [SettingsController::class, 'updatePreferences'])->name('settings.preferences');
        Route::put('/settings/notifications', [SettingsController::class, 'updateNotifications'])->name('settings.notifications');
        Route::get('/settings/export', [SettingsController::class, 'exportData'])->name('settings.export');
        Route::post('/settings/clear-cache', [SettingsController::class, 'clearCache'])->name('settings.clear-cache');
        Route::post('/settings/reset', [SettingsController::class, 'resetPreferences'])->name('settings.reset');
});

require __DIR__.'/auth.php';
require __DIR__.'/settings.php';
