<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Cache;

// ✅ Mengecek expired token dan menghapusnya
// class CheckTokenExpiry
// {
//     public function handle(Request $request, Closure $next): Response
//     {
//         $token = $request->user()?->currentAccessToken();

//         if ($token && $token->expires_at && $token->expires_at->isPast()) {
//             // Hapus token agar tidak bisa digunakan lagi
//             $token->delete();

//             return response()->json([
//                 'status' => 'error',
//                 'message' => 'Sesi sudah habis, silakan login kembali'
//             ], 401);
//         }

//         return $next($request);
//     }
// }


// ✅ Membersihkan token sehari sekali, agar user login lagi
class DailyTokenCleanup
{
    public function handle(Request $request, Closure $next)
    {
        // Jalankan hanya sekali per hari
        // apakah di cache ada tokens_cleaned_today yang true ?, jika tidak maka lakukan ini
        if (!Cache::has('tokens_cleaned_today')) {
            // hapus token yang expired
            PersonalAccessToken::where('expires_at', '<', now())->delete();

            // Simpan penanda bahwa sudah dibersihkan hari ini dan otomatis dihapus ketika hari sudah habis
            Cache::put('tokens_cleaned_today', true, now()->endOfDay());
        }

        return $next($request);
    }
}
