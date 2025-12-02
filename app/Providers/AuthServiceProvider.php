<?php

namespace App\Providers;

// use Illuminate\Support\Facades\Gate;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;

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

        ResetPassword::createUrlUsing(function($user, string $token) {
            // cek apakah user adalah pegawai
            if ($user instanceof \App\Models\Kepegawaian) {
                return url(route('password.reset', [
                    'token' => $token,
                    'email' => $user->email
                ], false));
            }
            
            // jika user adalah siswa
            if ($user instanceof \App\Models\Siswa) {
                return url(route('siswa.password.reset', [
                    'token' => $token,
                    'email' => $user->email
                ], false));
            }

            return '';
        });
    }
}
