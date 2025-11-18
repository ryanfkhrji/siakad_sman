<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Siswa;
use App\Models\Kepegawaian;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Models\MataPelajaran;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password; // Mengimpor facade Password untuk fitur reset password

class SiswaController extends Controller
{
    // ✅ register siswa
    public function registerSiswa(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'nisn' => ['required', 'digits_between:5,50', 'unique:siswas,nisn'],
                'nama' => 'required|string',
                'email' => 'required|email|unique:siswas,email',
                'nis' => ['required', 'digits_between:5,50', 'unique:siswas,nis'],
                'jurusan_id' => ['required', 'exists:jurusans,id'],
                'kelas_id' => ['required', 'exists:kelas,id'],
                'password' => [
                    'required',
                    'string',
                    'min:5',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
                ],
            ], [
                'nisn.unique' => 'NISN sudah terdaftar.',
                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Email tidak valid.',
                'email.unique' => 'Email sudah terdaftar.',
                'nis.unique' => 'NIS sudah terdaftar.',
                'jurusan_id.exists' => 'Jurusan tidak ada.',
                'kelas_id.exists' => 'Kelas tidak ada.',
                'password.min' => 'Password minimal 5 karakter.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            ]);

            // Simpan baru
            $siswa = Siswa::create([
                'nisn' => $validated['nisn'],
                'nama' => $validated['nama'],
                'email' => $validated['email'],
                'nis' => $validated['nis'],
                'jurusan_id' => $validated['jurusan_id'],
                'kelas_id' => $validated['kelas_id'],
                'status' => $request['status'],
                'password' => Hash::make($validated['password']),
                'role' => 'siswa',
            ]);

            $siswa->load(['kelas.wali', 'jurusan', 'ekstrakurikulers']);

            // Response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi siswa berhasil, silakan login',
                'data' => [
                    'id' => $siswa->id,
                    'nisn' => $siswa->nisn,
                    'nama' => $siswa->nama,
                    'email' => $siswa->email,
                    'nis' => $siswa->nis,
                    'jurusan_id' => $siswa->jurusan_id,
                    'kelas_id' => $siswa->kelas_id,
                    'status' => $siswa->status,
                    'role' => $siswa->role,
                    'kelas' => [
                        'id' => $siswa->kelas->id,
                        'nama_kelas' => $siswa->kelas->nama_kelas,
                        'jam_masuk' => $siswa->kelas->jam_masuk,
                        'wali_kelas' => $siswa->kelas->wali_kelas,
                    ],
                    'wali_kelas' => [
                        'id' => $siswa->kelas->wali->id ?? null,
                        'nama' => $siswa->kelas->wali->nama ?? null,
                        'email' => $siswa->kelas->wali->email ?? null,
                        'status' => $siswa->kelas->wali->status ?? null,
                        'nip' => $siswa->kelas->wali->nip ?? null,
                        'keterangan' => $siswa->kelas->wali->keterangan ?? null,
                        'role' => $siswa->kelas->wali->role ?? null,
                    ]
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

    public function store(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'nisn' => ['required', 'digits_between:5,50', 'unique:siswas,nisn'],
                'nama' => 'required|string',
                'email' => 'required|email|unique:siswas,email',
                'nis' => ['required', 'digits_between:5,50', 'unique:siswas,nis'],
                'jurusan_id' => ['required', 'exists:jurusans,id'],
                'kelas_id' => ['required', 'exists:kelas,id'],
                'password' => [
                    'required',
                    'string',
                    'min:5',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
                ],
            ], [
                'nisn.unique' => 'NISN sudah terdaftar.',
                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Email tidak valid.',
                'email.unique' => 'Email sudah terdaftar.',
                'nis.unique' => 'NIS sudah terdaftar.',
                'jurusan_id.exists' => 'Jurusan tidak ada.',
                'kelas_id.exists' => 'Kelas tidak ada.',
                'password.min' => 'Password minimal 5 karakter.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            ]);

            // Simpan baru
            $siswa = Siswa::create([
                'nisn' => $validated['nisn'],
                'nama' => $validated['nama'],
                'email' => $validated['email'],
                'nis' => $validated['nis'],
                'jurusan_id' => $validated['jurusan_id'],
                'kelas_id' => $validated['kelas_id'],
                'status' => $request['status'],
                'password' => Hash::make($validated['password']),
                'role' => 'siswa',
            ]);

            $siswa->load(['kelas.wali', 'jurusan', 'ekstrakurikulers']);

            // Response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi siswa berhasil, silakan login',
                'data' => [
                    'id' => $siswa->id,
                    'nisn' => $siswa->nisn,
                    'nama' => $siswa->nama,
                    'email' => $siswa->email,
                    'nis' => $siswa->nis,
                    'jurusan_id' => $siswa->jurusan_id,
                    'kelas_id' => $siswa->kelas_id,
                    'status' => $siswa->status,
                    'role' => $siswa->role,
                    'kelas' => [
                        'id' => $siswa->kelas->id,
                        'nama_kelas' => $siswa->kelas->nama_kelas,
                        'jam_masuk' => $siswa->kelas->jam_masuk,
                        'wali_kelas' => $siswa->kelas->wali_kelas,
                    ],
                    'wali_kelas' => [
                        'id' => $siswa->kelas->wali->id ?? null,
                        'nama' => $siswa->kelas->wali->nama ?? null,
                        'email' => $siswa->kelas->wali->email ?? null,
                        'status' => $siswa->kelas->wali->status ?? null,
                        'nip' => $siswa->kelas->wali->nip ?? null,
                        'keterangan' => $siswa->kelas->wali->keterangan ?? null,
                        'role' => $siswa->kelas->wali->role ?? null,
                    ]
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

    // ✅ login siswa
    public function loginSiswa(Request $request)
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

            // Cari siswa berdasarkan email
            $siswa = Siswa::with('kelas.wali', 'ekstrakurikulers', 'jurusan')->where('email', $validated['email'])->first();

            // Cek apakah Siswa ada & password cocok
            if (!$siswa || !Hash::check($validated['password'], $siswa->password)) {
                return ApiResponse::error('Email atau password salah.', 401);
            }

            // Hanya user dengan role siswa yang boleh login lewat endpoint ini
            $allowedRoles = ['siswa'];

            if (!in_array($siswa->role, $allowedRoles)) {
                return ApiResponse::error('Akses ditolak', 403);
            }

            // Hapus semua token lama user ini, agar token hanya satu per user
            $siswa->tokens()->delete();

            /**
             *  Buat token Sanctum yang expired dalam waktu 30 menit
             * Coba cek file App\Http\Middleware\DailyTokenCleanup.php => kernal.php
             * Disitu akan dicek token yang kadaluarsa dan menghapusnya per hari
             * Jika sudah dihapus hari itu, maka akan dibuatkan cache = true sebagai bukti sudah dibersihkan hari ini
             * Jika cache = false, lakukan pembersihan, jika cache = true, jangan bersihkan
             */
            $token = $siswa->createToken('API Token', ['*'], now()->addMinutes(660))->plainTextToken;

            // Response sukses
            return ApiResponse::success([
                'id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama' => $siswa->nama,
                'email' => $siswa->email,
                'nis' => $siswa->nis,
                'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                'nama_ekstrakurikuler' => $siswa->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
                'status' => $siswa->status,
                'role' => $siswa->role,
                'kelas' => [
                    'id' => $siswa->kelas->id ?? null,
                    'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
                    'jam_masuk' => $siswa->kelas->jam_masuk ?? null,
                    'wali_kelas' => [
                        'id' => $siswa->kelas->wali->id ?? null,
                        'nama' => $siswa->kelas->wali->nama ?? null,
                        'email' => $siswa->kelas->wali->email ?? null,
                        'status' => $siswa->kelas->wali->status ?? null,
                        'nip' => $siswa->kelas->wali->nip ?? null,
                        'keterangan' => $siswa->kelas->wali->keterangan ?? null,
                        'role' => $siswa->kelas->wali->role ?? null,
                    ]
                ],
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

    // ✅ logout siswa
    public function logoutSiswa(Request $request)
    {
        try {
            // Ambil user siswa yang sedang login via guard 'siswa'
            $siswa = Auth::guard('siswa')->user();

            if (!$siswa) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Tidak ada siswa yang sedang login.'
                ], 401);
            }

            // Hapus token aktif
            $siswa->currentAccessToken()->delete();

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
    // ✅ get all siswa untuk pegawai
    public function index()
    {
        $siswa = Siswa::with('kelas.wali', 'ekstrakurikulers', 'jurusan', 'jadwalPelajarans.mataPelajaran')->get();

        $formatted = $siswa->map(function ($item) {
            return [
                'id' => $item->id,
                'nisn' => $item->nisn,
                'nama' => $item->nama,
                'email' => $item->email,
                'nis' => $item->nis,
                'nama_jurusan' => $item->jurusan->nama_jurusan,
                'nama_ekstrakurikuler' => $item->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
                'status' => $item->status,
                'role' => $item->role,
                'kelas' => [
                    'id' => $item->kelas->id ?? null,
                    'nama_kelas' => $item->kelas->nama_kelas ?? null,
                    'jam_masuk' => $item->kelas->jam_masuk ?? null,
                    'wali_kelas' => [
                        'id' => $item->kelas->wali->id ?? null,
                        'nama' => $item->kelas->wali->nama ?? null,
                        'email' => $item->kelas->wali->email ?? null,
                        'status' => $item->kelas->wali->status ?? null,
                        'nip' => $item->kelas->wali->nip ?? null,
                        'keterangan' => $item->kelas->wali->keterangan ?? null,
                        'role' => $item->kelas->wali->role ?? null,
                    ]
                ],
                'jadwal_pelajaran' => $item->jadwalPelajarans->map(function ($items) {
                    return [
                        'id' => $items->id,
                        'mata_pelajaran' => $items->mataPelajaran->nama_pelajaran ?? null,
                        'status' => $items->mataPelajaran->status ?? null,
                        'hari' => $items->hari ?? null,
                        'guru' => $items->guru->nama ?? null,
                        'kelas' => $items->kelas->nama_kelas ?? null,
                        'jam_pelajaran' => $items->jam_pelajaran ?? null,
                        'ruangan' => $items->ruangan ?? null,
                        'link_opsional' => $items->link_opsional ?? null,
                    ];
                }), 
            ];
        });

        return ApiResponse::success($formatted, 'Daftar siswa berhasil diambil');
    }

    // ✅ show siswa untuk pegawai
    public function show($id)
    {
        $siswa = Siswa::with('kelas.wali', 'jurusan', 'ekstrakurikulers', 'jadwalPelajarans.mataPelajaran')->find($id);
        if (!$siswa) {
            return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $siswa->id,
            'nisn' => $siswa->nisn,
            'nama' => $siswa->nama,
            'email' => $siswa->email,
            'nis' => $siswa->nis,
            'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
            'nama_ekstrakurikuler' => $siswa->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
            'status' => $siswa->status,
            'role' => $siswa->role,
            'kelas' => [
                'id' => $siswa->kelas->id ?? null,
                'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
                'jam_masuk' => $siswa->kelas->jam_masuk ?? null,
            ],
            'wali_kelas' => [
                'id' => $siswa->kelas->wali->id ?? null,
                'nama' => $siswa->kelas->wali->nama ?? null,
                'email' => $siswa->kelas->wali->email ?? null,
                'status' => $siswa->kelas->wali->status ?? null,
                'nip' => $siswa->kelas->wali->nip ?? null,
                'keterangan' => $siswa->kelas->wali->keterangan ?? null,
                'role' => $siswa->kelas->wali->role ?? null,
            ],
            'jadwal_pelajaran' => $siswa->jadwalPelajarans->map(function ($item) {
                return [
                    'id' => $item->id,
                    'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran ?? null,
                    'status' => $item->mataPelajaran->status ?? null,
                    'hari' => $item->hari ?? null,
                    'guru' => $item->guru->nama ?? null,
                    'kelas' => $item->kelas->nama_kelas ?? null,
                    'jam_pelajaran' => $item->jam_pelajaran ?? null,
                    'ruangan' => $item->ruangan ?? null,
                    'link_opsional' => $item->link_opsional ?? null,
                ];
            }),  
        ];

        return ApiResponse::success($formatted, 'Detail siswa berhasil diambil');
    }

    // ✅ show diri siswa sendiri
    public function showDiriSendiri()
    {
        $siswa = Auth::guard('siswa')->user()->load('kelas.wali', 'jurusan', 'ekstrakurikulers', 'jadwalPelajarans.mataPelajaran');

        if (!$siswa) {
            return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $siswa->id,
            'nisn' => $siswa->nisn,
            'nama' => $siswa->nama,
            'email' => $siswa->email,
            'nis' => $siswa->nis,
            'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
            'nama_ekstrakurikuler' => $siswa->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
            'status' => $siswa->status,
            'role' => $siswa->role,
            'kelas' => [
                'id' => $siswa->kelas->id ?? null,
                'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
                'jam_masuk' => $siswa->kelas->jam_masuk ?? null,
            ],
            'wali_kelas' => [
                'id' => $siswa->kelas->wali->id ?? null,
                'nama' => $siswa->kelas->wali->nama ?? null,
                'email' => $siswa->kelas->wali->email ?? null,
                'status' => $siswa->kelas->wali->status ?? null,
                'nip' => $siswa->kelas->wali->nip ?? null,
                'keterangan' => $siswa->kelas->wali->keterangan ?? null,
                'role' => $siswa->kelas->wali->role ?? null,
            ],
            'jadwal_pelajaran' => $siswa->jadwalPelajarans->map(function ($item) {
                return [
                    'id' => $item->id,
                    'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran ?? null,
                    'status' => $item->mataPelajaran->status ?? null,
                    'hari' => $item->hari ?? null,
                    'guru' => $item->guru->nama ?? null,
                    'kelas' => $item->kelas->nama_kelas ?? null,
                    'jam_pelajaran' => $item->jam_pelajaran ?? null,
                    'ruangan' => $item->ruangan ?? null,
                    'link_opsional' => $item->link_opsional ?? null,
                ];
            }),  
        ];

        return ApiResponse::success($formatted, 'Detail siswa berhasil diambil');
    }

    // ✅ Store = Register

    // ✅ update siswa oleh pegawai
    public function update(Request $request, $id)
    {
        $siswa = Siswa::with('jurusan', 'kelas')->find($id);
        if (!$siswa) {
            return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nisn' => [
                'sometimes',
                'required',
                Rule::unique('siswas')->ignore($id)
            ],
            'nama' => 'sometimes|required|string',
            'email' => [
                'sometimes',
                'required',
                Rule::unique('siswas')->ignore($id)
            ],
            'nis' => [
                'sometimes',
                'required',
                Rule::unique('siswas')->ignore($id)
            ],
            'jurusan_id' => [
                'sometimes',
                'required',
                'exists:jurusans,id'
            ],
            'kelas_id' => 'sometimes|required|exists:kelas,id',
            'status' => 'sometimes',
            'role' => 'sometimes|required',
        ]);

        // cek kelas
        if (isset($validated['kelas_id'])) {
            $kelas = Kelas::find($validated['kelas_id']);
            if (!$kelas) {
                return ApiResponse::error('Kelas tidak ditemukan', [
                    'kelas_id' => ['Kelas tidak ditemukan']
                ], 422);
            }
        }

        $siswa->update([
            'nisn' => $validated['nisn'],
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'nis' => $validated['nis'],
            'jurusan_id' => $validated['jurusan_id'],
            'kelas_id' => $validated['kelas_id'],
            'status' => $request['status'],
            'role' => 'siswa',
        ]);

        return ApiResponse::success(
            [
                'id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama' => $siswa->nama,
                'email' => $siswa->email,
                'nis' => $siswa->nis,
                'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                'nama_kelas' => $siswa->kelas->nama_kelas,
                'status' => $siswa->status,
                'role' => $siswa->role,
            ],
            'Siswa berhasil diperbarui'
        );
    }

     // ✅ Update siswa oleh dirinya sendiri
     public function updateDirinyaSendiri(Request $request)
     {
         $siswa = Auth::guard('siswa')->user()->load('jurusan', 'kelas');
 
         if (!$siswa) {
             return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
         }
 
         $validated = $request->validate([
             'nisn' => [
                 'sometimes',
                 'required',
                 Rule::unique('siswas')->ignore($siswa->id)
             ],
             'nama' => 'sometimes|required|string',
             'email' => [
                 'sometimes',
                 'required',
                 Rule::unique('siswas')->ignore($siswa->id)
             ],
             'nis' => [
                 'sometimes',
                 'required',
                 Rule::unique('siswas')->ignore($siswa->id)
             ],
             'jurusan_id' => [
                 'sometimes',
                 'required',
                 'exists:jurusans,id'
             ],
             'kelas_id' => 'sometimes|required|exists:kelas,id',
             'status' => 'sometimes',
             'role' => 'sometimes|required',
         ]);
 
         // cek kelas
         if (isset($validated['kelas_id'])) {
             $kelas = Kelas::find($validated['kelas_id']);
             if (!$kelas) {
                 return ApiResponse::error('Kelas tidak ditemukan', [
                     'kelas_id' => ['Kelas tidak ditemukan']
                 ], 422);
             }
         }
 
         $siswa->update([
             'nisn' => $validated['nisn'],
             'nama' => $validated['nama'],
             'email' => $validated['email'],
             'nis' => $validated['nis'],
             'jurusan_id' => $validated['jurusan_id'] ?? $siswa->jurusan_id,
             'kelas_id' => $validated['kelas_id'] ?? $siswa->kelas_id,
             'status' => $validated['status'] ?? $siswa->status,
             'role' => 'siswa',
         ]);
 
         return ApiResponse::success(
             [
                 'id' => $siswa->id,
                 'nisn' => $siswa->nisn,
                 'nama' => $siswa->nama,
                 'email' => $siswa->email,
                 'nis' => $siswa->nis,
                 'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                 'nama_kelas' => $siswa->kelas->nama_kelas,
                 'status' => $siswa->status,
                 'role' => $siswa->role,
             ],
             'Siswa berhasil diperbarui'
         );
     }

    // ✅ hapus siswa oleh pegawai
    public function destroy($id)
    {
        $siswa = Siswa::find($id);
        if (!$siswa) {
            return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $siswa->delete();
        return ApiResponse::success(null, 'Siswa berhasil dihapus');
    }
    // CRUD

    // ✅ ubah password oleh pegawai
    public function ubahPassword(Request $request)
    {
        // Validasi input
        $validated = $request->validate([
            'email' => 'required|exists:siswas,email',
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

        // Ambil data siswa
        $siswa = Siswa::where('email', $validated['email'])->first();

        // Cek password lama
        if (!Hash::check($validated['password_lama'], $siswa->password)) {
            return ApiResponse::error('Password lama salah', 401);
        }

        // Hash password baru
        $siswa->password = Hash::make($validated['password_baru']);
        $siswa->save();

        // (Opsional) Hapus semua token lama agar user harus login ulang
        $siswa->tokens()->delete();
        
        return ApiResponse::success(null, 'Password berhasil diperbarui. Silakan login kembali.');
    }

    // ✅ ubah password oleh diri sendiri
    public function ubahPassDiri(Request $request)
    {        
        // Validasi input
        $validated = $request->validate([
            'email' => 'required|exists:siswas,email',
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

        // Ambil data siswa
        $siswa = Auth::guard('siswa')->user();

        if ($siswa->email !== $request->email) {
            return response()->json(['error' => 'Email tidak cocok'], 403);
        }

        // Cek password lama
        if (!Hash::check($validated['password_lama'], $siswa->password)) {
            return ApiResponse::error('Password lama salah', 401);
        }

        // Hash password baru
        $siswa->password = Hash::make($validated['password_baru']);
        $siswa->save();

        // (Opsional) Hapus semua token lama agar user harus login ulang
        $siswa->tokens()->delete();
        
        return ApiResponse::success(null, 'Password berhasil diperbarui. Silakan login kembali.');
    }
    
    
    // ✅ Lupa password oleh siswa
    public function sendResetLink(Request $request)
    {
        // Validasi input: pastikan email diisi dan ada di tabel siswas
        $request->validate([
            'email' => 'required|email|exists:siswas,email'
        ]);
    
        // Kirim link reset password menggunakan broker 'siswa'
        // Broker akan membuat token, menyimpan ke tabel password_reset_tokens, dan mengirim email ke pengguna
        $status = Password::broker('siswa')->sendResetLink(
            ['email' => $request->email] // Data yang digunakan untuk mencari pengguna dan mengirim link
        );
    
        // Cek apakah pengiriman berhasil, lalu kirim respons JSON sesuai hasilnya
        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Link reset dikirim']) // Jika berhasil
            : response()->json(['message' => 'Gagal mengirim link'], 500); // Jika gagal
    }
    

}
