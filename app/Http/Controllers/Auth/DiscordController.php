<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use App\Models\User;

class DiscordController extends Controller
{
    public function redirect()
    {
         $url = Socialite::driver('discord')
        ->scopes(['identify', 'email'])
        ->with(['prompt' => 'consent']) // ✅ Override default "none"
        ->redirect()
        ->getTargetUrl();

        return redirect($url);

    }

    public function callback()
    {
        $discordUser = Socialite::driver('discord')->stateless()->user();

        // Fallback-safe values
        $discordId = $discordUser->id;
        $username = $discordUser->user['username'] ?? null;
        $discriminator = $discordUser->user['discriminator'] ?? null;
        $avatarHash = $discordUser->avatar ?? null;
        $email = $discordUser->email ?? $discordId . '@discord.local';
        $name = $discordUser->name 
            ?? $discordUser->nickname 
            ?? $discordUser->user['global_name'] 
            ?? $username 
            ?? 'Discord User';

        // Construct avatar URL if available
        $avatar = $avatarHash 
            ? "https://cdn.discordapp.com/avatars/{$discordId}/{$avatarHash}.png" 
            : null;

        // Try to find existing user by Discord ID or email
        $user = User::where('discord_id', $discordId)
            ->orWhere('email', $email)
            ->first();

        if (!$user) {
            // Create new user with full Discord data
            $user = User::create([
                'discord_id' => $discordId,
                'name' => $name,
                'email' => $email,
                'password' => bcrypt(Str::random(32)),

                // Optional extra fields
                'discord_username' => $username,
                'discord_discriminator' => $discriminator,
                'discord_avatar' => $discordUser->avatar,
                'discord_verified_at' => now(),
                'avatar' => $discordUser->avatar,
            ]);
        } else {
            // Update missing Discord fields
            $updated = false;

            if (!$user->discord_id) {
                $user->discord_id = $discordId;
                $updated = true;
            }

            if (!$user->discord_username) {
                $user->discord_username = $username;
                $updated = true;
            }

            if (!$user->discord_discriminator) {
                $user->discord_discriminator = $discriminator;
                $updated = true;
            }

            if (!$user->discord_avatar && $avatar) {
                $user->discord_avatar = $avatar;
                $updated = true;
            }

            if (!$user->discord_verified_at) {
                $user->discord_verified_at = now();
                $updated = true;
            }

            if (!$user->avatar && $avatar) {
                $user->avatar = $avatar;
                $updated = true;
            }

            if ($updated) {
                $user->save();
            }
        }

        // Login and redirect
        Auth::login($user);
        return redirect('/dashboard');
    }
}
