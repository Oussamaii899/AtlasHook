<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Socialite\Contracts\Factory as SocialiteFactory;
use SocialiteProviders\Discord\Provider as DiscordProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(SocialiteFactory $socialite): void
    {
        $socialite->extend('discord', function ($app) use ($socialite) {
            $config = $app['config']['services.discord'];

            return $socialite->buildProvider(DiscordProvider::class, $config);
        });
    }
}
