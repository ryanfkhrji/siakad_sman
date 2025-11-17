<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kepegawaian;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Password; // Mengimpor facade Password untuk mengakses fitur reset password Laravel

class KepegawaianController extends Controller
{

    // ✅ register pegawai
    public function registerKepegawaian(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'nama' => 'required|string',
                'email' => ['required', 'unique:kepegawaians,email', 'email'],
                'nip' => ['required', 'digits_between:5,50', 'unique:kepegawaians,nip', 'regex:/^[0-9]+$/'],
                'password' => [
                    'required',
                    'string',
                    'min:5',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
                ],
                'role' => [
                    'string',
                    'required',
                    'in:super_admin,kepsek,guru,tu,staff',
                ]
            ], [
                'email.required' => 'Email wajib diisi.',
                'email.unique' => 'Email sudah terdaftar.',
                'email.email' => 'Email tidak valid.',
                'nip.regex' => 'NIP hanya boleh berisi angka.',
                'nip.unique' => 'NIP sudah terdaftar.',
                'password.min' => 'Password minimal 5 karakter.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            ]);

            // cek role super_admin dan kepsek agar tidak double
            if (in_array($validated['role'], ['super_admin', 'kepsek'])) {
                $existing = Kepegawaian::where('role', $validated['role'])->exists();

                if ($existing) {
                    return response()->json([
                        'status' => 'error',
                        'message' => "Role {$validated['role']} sudah digunakan.",
                    ], 403);
                }
            }

            // Simpan baru
            $kepegawaian = Kepegawaian::create([
                'nama' => $validated['nama'],
                'email' => $validated['email'],
                'status' => $request['status'],
                'nip' => $validated['nip'],
                'keterangan' => $request['keterangan'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

            // Response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi Kepegawaian berhasil, silakan login',
                'data' => [
                    'id' => $kepegawaian->id,
                    'nama' => $kepegawaian->nama,
                    'email' => $kepegawaian->email,
                    'status' => $kepegawaian->status,
                    'nip' => $kepegawaian->nip,
                    'keterangan' => $kepegawaian->keterangan,
                    'role' => $kepegawaian->role,
                ]
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat registrasi',
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ login pegawai
    public function loginKepegawaian(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'email' => 'required',
                'password' => 'required',
            ], [
                'email.required' => 'Email wajib diisi.',
                'password.required' => 'Password wajib diisi.',
            ]);

            // Cari Pegawai berdasarkan NIP
            $kepegawaian = Kepegawaian::where('email', $validated['email'])->first();

            // Cek apakah Pegawai ada & password cocok
            if (!$kepegawaian || !Hash::check($validated['password'], $kepegawaian->password)) {
                return ApiResponse::error('Email atau password salah.', 401);
            }

            // Hanya user dengan role yang boleh login lewat endpoint ini
            $allowedRoles = ['super_admin', 'kepsek', 'guru', 'tu', 'staff'];

            if (!in_array($kepegawaian->role, $allowedRoles)) {
                return ApiResponse::error('Akses ditolak', 403);
            }

            // Hapus semua token lama user ini, agar token hanya satu per user
            $kepegawaian->tokens()->delete();

            /* Buat token Sanctum yang expired dalam waktu 30 menit
             * Coba cek file App\Http\Middleware\DailyTokenCleanup.php => kernel.php
             * Disitu akan dicek token yang kadaluarsa dan menghapusnya per hari
             * Jika sudah dihapus hari itu, maka akan dibuatkan cache = true sebagai bukti sudah dibersihkan hari ini
             * Jika cache = false, lakukan pembersihan, jika cache = true, jangan bersihkan
             */
            $token = $kepegawaian->createToken('API Token', ['*'], now()->addMinutes(660))->plainTextToken;

            // Response sukses
            return ApiResponse::success([
                'id' => $kepegawaian->id,
                'nama' => $kepegawaian->nama,
                'email' => $kepegawaian->email,
                'status' => $kepegawaian->status,
                'nip' => $kepegawaian->nip,
                'keterangan' => $kepegawaian->keterangan,
                'role' => $kepegawaian->role,
                'token' => $token,
            ], 'Login berhasil.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat login',
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    // ✅ logout pegawai
    public function logoutKepegawaian(Request $request)
    {
        try {
            // Ambil user Pegawai yang sedang login via guard 'kepegawaian'
            $kepegawaian = Auth::guard('kepegawaian')->user();

            if (!$kepegawaian) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak ada pegawai yang sedang login.'
                ], 401);
            }

            // Hapus token aktif
            $kepegawaian->currentAccessToken()->delete();

            // Response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Logout berhasil.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan saat logout.',
                'errors' => $e->getMessage()
            ], 500);
        }
    }

    // CRUD
    // ✅ get all pegawai
    public function index()
    {
        $pegawai = Kepegawaian::with('kelas')->get();

        $formatted = $pegawai->map(function ($item) {
            return [
                'id' => $item->id ?? null,
                'nama' => $item->nama ?? null,
                'email' => $item->email ?? null,
                'status' => $item->status ?? null,
                'nip' => $item->nip ?? null,
                'keterangan' => $item->keterangan ?? null,
                'role' => $item->role ?? null,
                'kelas' => [
                    'id' => $item->kelas->id ?? null,
                    'nama_kelas' => $item->kelas->nama_kelas ?? null,
                    'jam_masuk' => $item->kelas->jam_masuk ?? null,
                    // 'wali_kelas' => $item->kelas->wali_kelas ?? null,
                ],
            ];
        });

        return ApiResponse::success($formatted, 'Daftar pegawai berhasil diambil');
    }

    // ✅ show pegawai untuk super admin
    public function show($id)
    {
        $pegawai = Kepegawaian::with('kelas')->find($id);
        if (!$pegawai) {
            return ApiResponse::error('Pegawai tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $pegawai->id ?? null,
            'nama' => $pegawai->nama ?? null,
            'email' => $pegawai->email ?? null,
            'status' => $pegawai->status ?? null,
            'nip' => $pegawai->nip ?? null,
            'keterangan' => $pegawai->keterangan ?? null,
            'role' => $pegawai->role ?? null,
            'kelas' => [
                'id' => $pegawai->kelas->id ?? null,
                'nama_kelas' => $pegawai->kelas->nama_kelas ?? null,
                'jam_masuk' => $pegawai->kelas->jam_masuk ?? null,
            ]
        ];

        return ApiResponse::success($formatted, 'Detail pegawai berhasil diambil');
    }

    // ✅ show diri sendiri (pegawai)
    public function showDiriSendiri()
    {
        $pegawai = Auth::guard('kepegawaian')->user()->load('kelas', 'ekstrakurikuler');

        if (!$pegawai) {
            return ApiResponse::error('Pegawai tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }


        $formatted = [
            'id' => $pegawai->id ?? null,
            'nama' => $pegawai->nama ?? null,
            'email' => $pegawai->email ?? null,
            'status' => $pegawai->status ?? null,
            'nip' => $pegawai->nip ?? null,
            'keterangan' => $pegawai->keterangan ?? null,
            'kelas' => [
                'id' => $pegawai->kelas->id ?? null,
                'nama_kelas' => $pegawai->kelas->nama_kelas ?? null,
                'jam_masuk' => $pegawai->kelas->jam_masuk ?? null,
            ],
            'ekstrakurikuler' => [
                'id' => $pegawai->ekstrakurikuler->id ?? null,
                'nama_ekstrakurikuler' => $pegawai->ekstrakurikuler->nama_ekstrakurikuler ?? null,
                'anggaran' => $pegawai->ekstrakurikuler->anggaran ?? null,
                'status' => $pegawai->ekstrakurikuler->status ?? null,
            ]
        ];

        return ApiResponse::success($formatted, 'Detail pegawai berhasil diambil');
    }

    // ✅ Store = Register

    // ✅ update pegawai oleh super admin
    public function update(Request $request, $id)
    {
        $pegawai = Kepegawaian::find($id);
        if (!$pegawai) {
            return ApiResponse::error('Pegawai tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama' => 'sometimes|required|string',
            'email' => [
                'sometimes',
                'required',
                Rule::unique('kepegawaians')->ignore($id)
            ],
            'status' => 'sometimes',
            'nip' => [
                'sometimes',
                'required',
                Rule::unique('kepegawaians')->ignore($id)
            ],
            'keterangan' => 'sometimes',
            'role' => 'sometimes|required',
        ], [
            'nama.required' => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.unique' => 'Terdeteksi email ganda',
            'nip.required' => 'NIP wajib diisi',
            'nip.unique' => 'Terdeteksi NIP ganda',
            'role.required' => 'Role wajib diisi',
        ]);

        // cek role super_admin dan kepsek agar tidak double
        if (in_array($validated['role'], ['super_admin', 'kepsek'])) {
            $existing = Kepegawaian::where('role', $validated['role'])->exists();

            if ($existing) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Role {$validated['role']} sudah digunakan.",
                ], 403);
            }
        }

        // Cek apakah sedang digunakan sebagai wali_kelas
        if ($pegawai->kelas()->exists() && $validated['role'] !== $pegawai->role) {
            return ApiResponse::error('Role tidak bisa diubah karena pegawai masih menjadi wali kelas', [
                'role' => ['Tidak bisa, pegawai ini masih berstatus sebagai wali kelas']
            ], 422);
        }
        
        $pegawai->update([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'status' => $request['status'],
            'nip' => $validated['nip'],
            'keterangan' => $request['keterangan'],
            'role' => $validated['role'],
        ]);
        $pegawai->load('kelas');

        return ApiResponse::success(
            [
                'id' => $pegawai->id ?? null,
                'nama' => $pegawai->nama ?? null,
                'email' => $pegawai->email ?? null,
                'status' => $pegawai->status ?? null,
                'nip' => $pegawai->nip ?? null,
                'keterangan' => $pegawai->keterangan ?? null,
                'role' => $pegawai->role ?? null,
                'kelas' => [
                    'id' => $pegawai->kelas->id ?? null,
                    'nama_kelas' => $pegawai->kelas->nama_kelas ?? null,
                    'jam_masuk' => $pegawai->kelas->jam_masuk ?? null,
                ]
            ],
            'Pegawai berhasil diperbarui'
        );
    }

     // ✅ Update super admin oleh dirinya sendiri
     public function updateDirinyaSendiri(Request $request)
     {
         $pegawai = Auth::guard('kepegawaian')->user();
 
         if (!$pegawai) {
             return ApiResponse::error('Pegawai tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
         }
 
         $validated = $request->validate([
             'nama' => 'sometimes|required|string',
             'email' => [
                 'sometimes',
                 'required',
                 Rule::unique('kepegawaians')->ignore($pegawai->id)
             ],
             'status' => 'sometimes',
             'nip' => [
                 'sometimes',
                 'required',
                 Rule::unique('kepegawaians')->ignore($pegawai->id)
             ],
             'keterangan' => 'sometimes',
             'role' => [
                 'sometimes',
                 'required',
                //  Rule::unique('kepegawaians')->ignore($pegawai->id)
             ],
        ], [
            'nama.required' => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.unique' => 'Terdeteksi email ganda',
            'nip.required' => 'NIP wajib diisi',
            'nip.unique' => 'Terdeteksi NIP ganda',
            'role.required' => 'Role wajib diisi',
        ]);

        // ROLE AWAL
        $roleAwal = $pegawai->role;

        // ROLE BARU
        $roleBaru = $validated['role'] ?? $pegawai->role;

        // 1. Jika role awal super_admin atau kepsek → tidak boleh diubah
        if (in_array($roleAwal, ['super_admin', 'kepsek'])) {

            if ($roleBaru !== $roleAwal) {
                return ApiResponse::error('Role tidak dapat diubah', [
                    'role' => ['Pegawai dengan role ini tidak boleh mengubah role']
                ], 422);
            }
        }

        // 2. Jika role awal bukan super_admin/kepsek → cek agar tidak double
        if (!in_array($roleAwal, ['super_admin', 'kepsek'])) {
            if (in_array($roleBaru, ['super_admin', 'kepsek'])) {
                $existing = Kepegawaian::where('role', $roleBaru)
                    ->where('id', '!=', $pegawai->id)
                    ->exists();

                if ($existing) {
                    return ApiResponse::error("Role {$roleBaru} sudah digunakan", [
                        'role' => ["Role {$roleBaru} tidak boleh lebih dari satu"]
                    ], 403);
                }
            }
        }

        // Cek apakah sedang digunakan sebagai wali_kelas
        if ($pegawai->kelas()->exists() && $validated['role'] !== $pegawai->role) {
            return ApiResponse::error('Role tidak bisa diubah karena pegawai masih menjadi wali kelas', [
                'role' => ['Tidak bisa, pegawai ini masih berstatus sebagai wali kelas']
            ], 422);
        }
        
        $pegawai->update([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'status' => $validated['status'],
            'nip' => $validated['nip'],
            'keterangan' => $validated['keterangan'],
            'role' => $validated['role'],
        ]);

        $pegawai->load('kelas','ekstrakurikuler');

        return ApiResponse::success(
            [
                'id' => $pegawai->id ?? null,
                'nama' => $pegawai->nama ?? null,
                'email' => $pegawai->email ?? null,
                'status' => $pegawai->status ?? null,
                'nip' => $pegawai->nip ?? null,
                'keterangan' => $pegawai->keterangan ?? null,
                'role' => $pegawai->role ?? null,
                'kelas' => [
                    'id' => $pegawai->kelas->id ?? null,
                    'nama_kelas' => $pegawai->kelas->nama_kelas ?? null,
                    'jam_masuk' => $pegawai->kelas->jam_masuk ?? null,
                ],
                'ekstrakurikuler' => [
                    'id' => $pegawai->ekstrakurikuler->id ?? null,
                    'nama_ekstrakurikuler' => $pegawai->ekstrakurikuler->nama_ekstrakurikuler ?? null,
                    'anggaran' => $pegawai->ekstrakurikuler->anggaran ?? null,
                    'status' => $pegawai->ekstrakurikuler->status ?? null,
                ]
            ],
            'Pegawai berhasil diperbarui'
        );
     }

    // ✅ destroy pegawai untuk super admin
    public function destroy($id)
    {
        $pegawai = Kepegawaian::find($id);
        if (!$pegawai) {
            return ApiResponse::error('Pegawai tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek di model Kepegawaian apakah pegawai masih jadi wali kelas
        if ($pegawai->kelas()->exists()) {
            return ApiResponse::error('Pegawai tidak bisa dihapus karena masih menjadi wali kelas', [
                'wali_kelas' => ['Tidak bisa, pegawai ini masih berstatus sebagai wali kelas']
            ], 422);
        }

        $pegawai->delete();
        return ApiResponse::success(null, 'Pegawai berhasil dihapus');
    }
    // CRUD

    // ✅ ubah password untuk super admin
    public function ubahPassword(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'email' => 'required|exists:kepegawaians,email',
            'password_lama' => 'required|string|min:5',                    
            'password_baru' => 'required|string|min:5|different:password_lama|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/',
            'konfirmasi_password' => 'required|same:password_baru',
        ], [
            'email.required' => 'Email wajib diisi',
            'email.exists' => 'Email tidak ditemukan',
            'password_lama.required' => 'Password lama wajib diisi',
            'password_baru.required' => 'Password baru wajib diisi',
            'password_baru.different' => 'Password baru tidak boleh sama dengan password lama',
            'password_baru.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            'konfirmasi_password.same' => 'Konfirmasi password tidak cocok',
        ]);

        // Ambil data pegawai
        $pegawai = Kepegawaian::where('email', $validated['email'])->first();

        // Cek password lama
        if (!Hash::check($validated['password_lama'], $pegawai->password)) {
            return ApiResponse::error('Password lama salah', 401);
        }

        // Hash password baru
        $pegawai->password = Hash::make($validated['password_baru']);
        $pegawai->save();

        // (Opsional) Hapus semua token lama agar user harus login ulang
        $pegawai->tokens()->delete();

        return ApiResponse::success(null, 'Password berhasil diperbarui. Silakan login kembali.');
    }



    // ✅ Lupa password pegawai oleh diri sendiri
    public function ubahPassDiri(Request $request)
    {        
        // Validasi input
        $validated = $request->validate([
            'email' => 'required|exists:kepegawaians,email',
            'password_lama' => 'required|string|min:5',                    
            'password_baru' => 'required|string|min:5|different:password_lama|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/',
            'konfirmasi_password' => 'required|same:password_baru',
        ], [
            'email.required' => 'Email wajib diisi',
            'email.exists' => 'Email tidak ditemukan',
            'password_lama.required' => 'Password lama wajib diisi',
            'password_baru.required' => 'Password baru wajib diisi',
            'password_baru.different' => 'Password baru tidak boleh sama dengan password lama',
            'password_baru.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            'konfirmasi_password.same' => 'Konfirmasi password tidak cocok',
        ]);

        // Ambil data pegawai
        $pegawai = Auth::guard('kepegawaian')->user();

        if ($pegawai->email !== $request->email) {
            return response()->json(['error' => 'Email tidak cocok'], 403);
        }

        // Cek password lama
        if (!Hash::check($validated['password_lama'], $pegawai->password)) {
            return ApiResponse::error('Password lama salah', 401);
        }

        // Hash password baru
        $pegawai->password = Hash::make($validated['password_baru']);
        $pegawai->save();

        // (Opsional) Hapus semua token lama agar user harus login ulang
        $pegawai->tokens()->delete();
        
        return ApiResponse::success(null, 'Password berhasil diperbarui. Silakan login kembali.');
    }

    // ✅ Lupa password untuk pegawai
    // ? Button forgot ppassword + send reset link email 
    public function sendResetLink(Request $request)
    {
        // 1. Validasi email wajib ada dan harus terdaftar
        $request->validate([
            'email' => 'required|email|exists:kepegawaians,email'
        ], [
            'email.exists' => 'Email tidak terdaftar dalam sistem.'
        ]);

        // 2. Kirim link reset password via email menggunakan broker "kepegawaian"
        //    Broker akan otomatis:
        //    - generate token
        //    - simpan hash token ke tabel password_reset_tokens
        //    - mengirim email berisi link reset
        $status = Password::broker('kepegawaian')->sendResetLink(
            $request->only('email')
        );

        // 3. Jika email berhasil dikirim
        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'status'  => true,
                'message' => 'Link reset password telah dikirim ke email Anda.'
            ], 200);
        }

        // 4. Jika gagal (biasanya karena server email)
        return response()->json([
            'status'  => false,
            'message' => 'Gagal mengirim link reset password. Coba lagi nanti.'
        ], 500);
    }



    // ? Tampilkan form react untuk reset password
    public function redirectToFrontendForm(Request $request, $token)
    {
        // Ambil email dari query param
        $email = $request->query('email');

        // Jika tidak ada email → error
        if (!$email) {
            return response()->json([
                'status' => false,
                'message' => 'Email tidak ditemukan dalam permintaan.'
            ], 400);
        }

        // sebelum diarahkan ke react, ubah dulu di AuthServiceProvider.php

        // URL React (ubah sesuai domain kamu)
        $frontendUrl = "http://localhost:5173/reset-password";

        // Redirect ke frontend sambil membawa token & email di params
        return redirect()->away($frontendUrl . "?token={$token}&email={$email}");

        /**
         * Front end bisa ambil dari param denga cara berikut, lalu jadikan hidden untuk dikirim ke route Post::reset-password
         * const [params] = useSearchParams();
         * const token = params.get("token");
         * const email = params.get("email");
         */
    }

    // ? Proses reset password
    public function resetPassword(Request $request)
    {
        // Validasi input
        $validator = Validator::make($request->all(), [
            'token'    => 'required',                                // token wajib yang dikirim ke email
            'email'    => 'required|email|exists:kepegawaians,email', // email valid & terdaftar
            'password' => 'required|min:6|confirmed',                 // password & konfirmasi wajib sama
            // password_confirmation tidak perlu disini tapi wajib di body
        ]);

        // Jika validasi gagal, respon error rapi
        if ($validator->fails()) {
            return response()->json([
                'status'  => false,
                'message' => 'Validasi gagal',
                'errors'  => $validator->errors(),  // daftar error lengkap
            ], 422);
        }

        // Proses reset password menggunakan broker
        $status = Password::broker('kepegawaian')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),

            // Jika token dan email cocok
            function ($user) use ($request) {
                $user->password = bcrypt($request->password);
                $user->save();
            }
        );

        // Jika password berhasil direset
        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'status'  => true,
                'message' => 'Password berhasil direset',
                'data'    => [
                    'email' => $request->email
                ]
            ]);
        }

        // Jika token salah, email salah, atau token kedaluwarsa
        return response()->json([
            'status'  => false,
            'message' => 'Gagal mereset password',
            'errors'  => [
                'token' => ['Token tidak valid atau kadaluarsa']
            ]
        ], 400);
    }

}