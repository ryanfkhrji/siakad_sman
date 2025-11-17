<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        //
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // kelanjutan dari KepegawaianController::@redirectToFrontendForm
        /**
         * Arahkan ke backend dulu untuk ambil token dan email, baru kemudian ke frontend
         */
        ResetPassword::createUrlUsing(function ($notifiable, $token) {
            $email = urlencode($notifiable->email);
        
            // arahkan ke backend, bukan frontend
            return "http://localhost:8000/api/reset-password/{$token}?email={$email}";
        });
        
    }
}
