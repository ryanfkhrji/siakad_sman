<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use App\Helpers\ApiResponse;


class AuthController extends Controller
{
    public function registerSuperAdmin(Request $request)
    {
        try {
            // ✅ Validasi input
            $validated = $request->validate([
                'nama' => 'required|string|max:255',
                'nip' => ['required', 'digits_between:5,50', 'unique:users,nip', 'regex:/^[0-9]+$/'],
                'password' => [
                    'required',
                    'string',
                    'min:5',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
                ],
            ], [
                'nip.regex' => 'NIP hanya boleh berisi angka.',
                'nip.unique' => 'NIP sudah terdaftar.',
                'password.min' => 'Password minimal 5 karakter.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            ]);

            // ✅ Simpan user baru
            $user = User::create([
                'nama' => $validated['nama'],
                'nip' => $validated['nip'],
                'password' => Hash::make($validated['password']),
                'role' => 'super admin',
            ]);

            // ✅ Response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi berhasil, silakan login.',
                'data' => [
                    'id' => $user->id,
                    'nama' => $user->nama,
                    'nip' => $user->nip,
                    'role' => $user->role,
                ]
            ], 201);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // ⚠️ Tangani error validasi
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // ⚠️ Tangani error umum
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat registrasi',
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    public function loginSuperAdmin(Request $request)
    {
        try {
            // ✅ Validasi input
            $validated = $request->validate([
                'nip' => 'required|digits_between:5,20|regex:/^[0-9]+$/',
                'password' => 'required|string|min:5',
            ], [
                'nip.required' => 'NIP wajib diisi.',
                'nip.regex' => 'NIP hanya boleh berisi angka.',
                'password.required' => 'Password wajib diisi.',
            ]);

            // ✅ Cari user berdasarkan NIP
            $user = User::where('nip', $validated['nip'])->first();

            // ✅ Cek apakah user ada & password cocok
            if (!$user || !Hash::check($validated['password'], $user->password)) {
                return ApiResponse::error('NIP atau password salah.', 401);
            }

            // ✅ Hanya user dengan role super admin yang boleh login lewat endpoint ini
            if ($user->role !== 'super admin') {
                return ApiResponse::error('Akses ditolak. Anda bukan super admin.', 403);
            }

            // ✅ Buat token Sanctum
            $token = $user->createToken('auth_token')->plainTextToken;

            // ✅ Kirim response sukses
            return ApiResponse::success([
                'id' => $user->id,
                'nama' => $user->nama,
                'nip' => $user->nip,
                'role' => $user->role,
                'token' => $token,
            ], 'Login berhasil.');

        } catch (\Illuminate\Validation\ValidationException $e) {
            // ⚠️ Tangani error validasi
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);

        } catch (\Exception $e) {
            // ⚠️ Tangani error umum
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat login',
                'errors' => $e->getMessage()
            ], 500);
        }
    }


    public function logoutSuperAdmin(Request $request)
    {
        // ✅ Hapus token Sanctum aktif
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(null, 'Logout berhasil.');
    }

    // public function me(Request $request)
    // {
    //     // $request->user();
    //     return response()->json([
    //             'data' => $request->user()
    //         ], 500);

    // }

}
