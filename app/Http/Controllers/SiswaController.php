<?php

namespace App\Http\Controllers;

use App\Models\Kelas;
use App\Models\Siswa;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use App\Models\MataPelajaran;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password; // Mengimpor facade Password untuk fitur reset password
use Illuminate\Support\Facades\Validator;

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
                'nis' => ['required', 'digits_between:5,50', 'unique:siswas,nis'],                
                'email' => 'required|email|unique:siswas,email',
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
                'password.min' => 'Password minimal 5 karakter.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            ]);
            
            $siswa = Siswa::create([
                'nisn' => $validated['nisn'],
                'nama' => $validated['nama'],
                'nis' => $validated['nis'],                
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'siswa',
                'status' => 'aktif'
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi siswa berhasil, silakan login',
                'data' => [
                    'id' => $siswa->id,
                    'nisn' => $siswa->nisn,
                    'nama' => $siswa->nama,
                    'nis' => $siswa->nis,                                        
                    'email' => $siswa->email,
                    'role' => $siswa->role,                    
                    'status_siswa' => $siswa->status,                    
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

    // ✅ untuk spa
    public function store(Request $request)
    {
        try {
            // Validasi input
            $validated = $request->validate([
                'nisn' => ['required', 'digits_between:5,50', 'unique:siswas,nisn'],
                'nama' => 'required|string',
                'nis' => ['required', 'digits_between:5,50', 'unique:siswas,nis'],                
                'email' => 'required|email|unique:siswas,email',
                'password' => [
                    'required',
                    'string',
                    'min:5',
                    'confirmed',
                    'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/'
                ],
            ], [
                'nisn.required' => 'NISN wajib diisi.',
                'nisn.unique' => 'NISN sudah terdaftar.',
                'nama.required' => 'Nama wajib diisi',
                'nis.required' => 'NIS wajib diisi.',
                'nis.unique' => 'NIS sudah terdaftar.',                
                'email.required' => 'Email wajib diisi.',
                'email.email' => 'Email tidak valid.',
                'email.unique' => 'Email sudah terdaftar.',
                'password.min' => 'Password minimal 5 karakter.',
                'password.confirmed' => 'Konfirmasi password tidak cocok.',
                'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            ]);
            
            $siswa = Siswa::create([
                'nisn' => $validated['nisn'],
                'nama' => $validated['nama'],
                'nis' => $validated['nis'],                
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'siswa',
                'status' => 'aktif'
            ]);
        
            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi siswa berhasil, silakan login',
                'data' => [
                    'id' => $siswa->id,
                    'nisn' => $siswa->nisn,
                    'nama' => $siswa->nama,
                    'nis' => $siswa->nis,               
                    'email' => $siswa->email,
                    'role' => $siswa->role,                    
                    'status_siswa' => $siswa->status,                    
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
            $siswa = Siswa::where('email', $validated['email'])->first();

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
                'nis' => $siswa->nis,
                'email' => $siswa->email,
                'role' => $siswa->role,                
                'status_siswa' => $siswa->status,                
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
    // ✅ get all siswa untuk spa
    public function index()
    {
        $siswa = Siswa::select(
                'id',
                'nisn',
                'nama',
                'nis',
                'email',
                'role',
                'status'
            )
            ->orderBy('status')
            ->orderBy('nama')
            ->get();

        if ($siswa->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data siswa kosong']);
        }

        $grouped = $siswa
            ->groupBy('status')
            ->map(function ($items, $status) {
                return [
                    'status' => $status,
                    'total' => $items->count(),
                    'siswa' => $items->map(function ($item) {
                        return [
                            'siswa_id' => $item->id,
                            'nisn' => $item->nisn,
                            'nama' => $item->nama,
                            'nis' => $item->nis,
                            'email' => $item->email,
                            'role' => $item->role,
                            'status' => $item->status,
                        ];
                    })->values(),
                ];
            })
            ->values();

        return ApiResponse::success($grouped, 'Daftar siswa berhasil diambil');
    }
 

    // ✅ guru dan spa
    public function show($id)
    {
        $siswa = Siswa::with([
            'siswaRombels.rombel.jurusan',
            'siswaRombels.tahunAkademik',

            'siswaRombels.rombel.waliRombels.wali',
            'siswaRombels.rombel.waliRombels.tahunAkademik',

            'siswaRombels.rombel.jadwalPelajarans.semester.tahunAkademik',
            'siswaRombels.rombel.jadwalPelajarans.guru',
            'siswaRombels.rombel.jadwalPelajarans.ruangan',
            'siswaRombels.rombel.jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',

            'ekskulSiswa.tahunAkademik',
            'ekskulSiswa.ekstrakurikuler',
            'ekskulSiswa.ekstrakurikuler.pembinaEkskul.pembina',
            'ekskulSiswa.ekstrakurikuler.pelatihEkskul.pelatih',

            'prestasis.tahunAkademik',
        ])->find($id);

        if (!$siswa) {
            return ApiResponse::error(
                'Siswa tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $formatted = [
            'siswa_id' => $siswa->id,
            'nama_siswa' => $siswa->nama,
            'nisn' => $siswa->nisn,
            'nis' => $siswa->nis,
            'email' => $siswa->email,
            'status_siswa' => $siswa->status,

            'jurusan_siswa' => optional(
                $siswa->siswaRombels
                    ->sortByDesc('tahun_akademik_id')
                    ->first()?->rombel?->jurusan
            )->nama_jurusan,            
            
            // =========================
            // HISTORI ROMBEL
            // =========================
            'histori_rombel' => $siswa->siswaRombels->map(function ($row) {

                $rombel = $row->rombel;
                $tahunAkademik = $row->tahunAkademik;

                // wali rombel sesuai rombel + tahun akademik
                $waliRombel = $rombel?->waliRombels
                    ->where('tahun_akademik_id', $tahunAkademik?->id)
                    ->first();

                return [
                    'rombel_id' => $rombel?->id,
                    'nama_rombel' => $rombel?->nama_rombel,
                    'jurusan_rombel' => $rombel?->jurusan?->nama_jurusan,
                    
                    'kelas' => $rombel?->kelas?->nama_kelas,
                    'tingkat' => $rombel?->kelas?->tingkat,
                    
                    'wali_rombel' => $waliRombel?->wali?->nama,
                    
                    'tahun_studi' => $tahunAkademik?->tahun_akademik,
                    'status_tahun_studi' => $tahunAkademik?->status,

                    'status_akhir' => $row->status_akhir ?? null,
                    'catatan' => $row->catatan ?? null,

                    // =========================
                    // JADWAL PELAJARAN
                    // =========================
                    'histori_jadwal_pelajaran' => $rombel?->jadwalPelajarans
                    ->whereNotNull('semester_id')
                    ->groupBy(fn ($j) => $j->semester?->tahun_akademik_id)
                    ->map(function ($jadwalPerTahun) {
                
                        $tahunAkademik = $jadwalPerTahun->first()?->semester?->tahunAkademik;
                
                        return [
                            'tahun_akademik_id' => $tahunAkademik?->id,
                            'tahun_akademik' => $tahunAkademik?->tahun_akademik,
                
                            'semester' => $jadwalPerTahun
                                ->groupBy('semester_id')
                                ->map(function ($jadwalPerSemester) {
                
                                    $semester = $jadwalPerSemester->first()?->semester;
                
                                    return [
                                        'semester_id' => $semester?->id,
                                        'semester' => $semester?->semester,
                
                                        'jadwal' => $jadwalPerSemester->map(function ($j) {
                                            return [
                                                'jadwal_pelajaran_id' => $j->id,
                                                'mata_pelajaran' => $j->kurikulumMataPelajaran?->mataPelajaran?->nama_pelajaran,
                                                'kode_mata_pelajaran' => $j->kurikulumMataPelajaran?->mataPelajaran?->kode_mapel_diknas,
                                                'status_mata_pelajaran' => $j->kurikulumMataPelajaran?->status_mata_pelajaran,
                                                'kelompok_mata_pelajaran' => $j->kurikulumMataPelajaran?->mataPelajaran?->kelompok,
                                                'tingkat' => $j->kurikulumMataPelajaran?->tingkat,
                                                'nilai_kkm' => $j->kurikulumMataPelajaran?->nilai_kkm,
                                                'hari' => $j->hari,
                                                'guru_pengajar' => $j->guru?->nama,
                                                'jam_mulai' => $j->jam_mulai,
                                                'jam_selesai' => $j->jam_selesai,
                                                'ruangan' => $j->ruangan?->nama_ruangan,
                                                'link_opsional' => $j->link_opsional,
                                            ];
                                        })->values(),
                                    ];
                                })->values(),
                        ];
                    })->values(),                
                ];
            })->values(),

            // =========================
            // HISTORI EKSTRAKURIKULER
            // =========================
            'histori_ekstrakurikuler' => $siswa->ekskulSiswa
            ->groupBy('tahun_akademik_id')
            ->map(function ($items) {

                $tahun = $items->first()->tahunAkademik;

                return [
                    'tahun_akademik_ekskul_id' => $tahun?->id,
                    'tahun_akademik_ekskul' => $tahun?->tahun_akademik,
                    'status_tahun_akademik_ekskul' => $tahun?->status,

                    'ekstrakurikuler' => $items->map(function ($row) use ($tahun) {

                        $ekskul = $row->ekstrakurikuler;

                        // ===== PEMBINA (HISTORIS) =====
                        $pembinaEkskul = $ekskul?->pembinaEkskul
                            ->where('tahun_akademik_id', $tahun?->id)
                            ->first();

                        // ===== PELATIH (HISTORIS) =====
                        $pelatihEkskul = $ekskul?->pelatihEkskul
                            ->where('tahun_akademik_id', $tahun?->id)
                            ->first();

                        return [
                            'ekskul_id' => $ekskul?->id,
                            'nama_ekskul' => $ekskul?->nama_ekstrakurikuler,

                            // === PEMBINA ===
                            'pembina_id' => $pembinaEkskul?->pembina?->id,
                            'pembina' => $pembinaEkskul?->pembina?->nama,

                            // === PELATIH ===
                            'pelatih_id' => $pelatihEkskul?->pelatih?->id,
                            'pelatih' => $pelatihEkskul?->pelatih?->nama,

                            'anggaran_ekskul' => $ekskul?->anggaran,
                            'status_ekskul' => $ekskul?->status,

                            'sikap' => $row->sikap,
                            'status_aktif' => $row->status,
                        ];
                    })->values(),
                ];
            })->values(),


            // =========================
            // HISTORI PRESTASI
            // =========================
            'histori_prestasi' => $siswa->prestasis
                ->groupBy('tahun_akademik_id')
                ->map(function ($items) {
                    $tahun = $items->first()->tahunAkademik;

                    return [
                        'tahun_akademik_prestasi_id' => $tahun->id,
                        'tahun_akademik_prestasi' => $tahun->tahun_akademik,
                        'status_tahun_akademik_prestasi' => $tahun->status,

                        'prestasi' => $items->map(function ($row) {
                            return [
                                'prestasi_id' => $row->id,
                                'prestasi_diraih' => $row->prestasi_diraih,
                            ];
                        })->values(),
                    ];
                })->values(),
        ];

        return ApiResponse::success($formatted, 'Detail siswa berhasil diambil');
    }




    // ! ✅ show diri siswa  (samakan dengan show)
    // public function showDiriSendiri()
    // {
    //     $siswa = Auth::guard('siswa')->user();

    //     $siswa = Siswa::with([            
    //         'siswaRombels.rombel.kelas.jurusan',
    //         // 'siswaRombels.rombel.tahunAkademik',
    //         // 'ekskulSiswa.tahunAkademik',
    //         // 'ekskulSiswa.ekstrakurikuler',
    //         // 'prestasis.tahunAkademik',
    //     ])->find($siswa->id);

    //     if (!$siswa) {
    //         return ApiResponse::error(
    //             'Siswa tidak ditemukan',
    //             ['id' => ['Data tidak ditemukan']],
    //             404
    //         );
    //     }

    //     $formatted = [
    //         'siswa_id' => $siswa->id,
    //         'nama_siswa' => $siswa->nama,
    //         'jurusan_siswa' => $siswa->siswaRombels->rombel->kelas->jurusan->nama_jurusan ?? null,
    //         'nisn' => $siswa->nisn,
    //         'nis' => $siswa->nis,
    //         'email' => $siswa->email,
    //         'status_siswa' => $siswa->status,                      
    //         // 'histori_ekstrakurikuler' => $siswa->ekskulSiswa
    //         //     ->groupBy('tahun_akademik_id')
    //         //     ->map(function ($items) {
    //         //         $tahun = $items->first()->tahunAkademik;

    //         //         return [
    //         //             'tahun_akademik_ekskul_id' => $tahun->id,
    //         //             'tahun_akademik_ekskul' => $tahun->tahun_akademik,
    //         //             'status_tahun_akademik_ekskul' => $tahun->status,

    //         //             'ekstrakurikuler' => $items->map(function ($row) {
    //         //                 return [
    //         //                     'ekskul_id' => $row->ekstrakurikuler->id ?? null,
    //         //                     'nama_ekskul' => $row->ekstrakurikuler->nama_ekstrakurikuler ?? null,
    //         //                     'anggaran_ekskul' => $row->ekstrakurikuler->anggaran ?? null,
    //         //                     'status_ekskul' => $row->ekstrakurikuler->status ?? null,

    //         //                     'sikap' => $row->sikap,
    //         //                     'status_aktif' => $row->status,
    //         //                 ];
    //         //         })->values(),
    //         //     ];
    //         // })->values(),         
    //         // 'histori_prestasi' => $siswa->prestasis
    //         //     ->groupBy('tahun_akademik_id')
    //         //     ->map(function ($items) {
    //         //         $tahun = $items->first()->tahunAkademik;

    //         //         return [
    //         //             'tahun_akademik_prestasi_id' => $tahun->id,
    //         //             'tahun_akademik_prestasi' => $tahun->tahun_akademik,
    //         //             'status_tahun_akademik_prestasi' => $tahun->status,

    //         //             'prestasi' => $items->map(function ($row) {
    //         //                 return [
    //         //                     'prestasi_id' => $row->id,
    //         //                     'prestasi_diraih' => $row->prestasi_diraih,
    //         //                     'tingkat' => $row->tingkat ?? null,
    //         //                     'juara' => $row->juara ?? null,
    //         //                 ];
    //         //             })->values(),
    //         //         ];
    //         //     })
    //         //     ->values(),
    //     ];

    //     return ApiResponse::success($formatted, 'Detail siswa berhasil diambil');
    // }

    // ✅ Store = Register

    // ✅ spa
    public function update(Request $request, $id)
    {
        $siswa = Siswa::find($id);
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
            'nis' => [
                'sometimes',
                'required',
                Rule::unique('siswas')->ignore($id)
            ],            
            'email' => [
                'sometimes',
                'required',
                Rule::unique('siswas')->ignore($id)
            ],
            'status' => 'sometimes|required|in:aktif,tidak aktif',
        ], [
            'nisn.required' => 'NISN wajib diisi.',
            'nisn.unique' => 'NISN sudah terdaftar.',
            'nama.required' => 'Nama wajib diisi',
            'nis.required' => 'NIS wajib diisi.',
            'nis.unique' => 'NIS sudah terdaftar.',                
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Email tidak valid.',
            'email.unique' => 'Email sudah terdaftar.',
            'password.min' => 'Password minimal 5 karakter.',
            'password.confirmed' => 'Konfirmasi password tidak cocok.',
            'password.regex' => 'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol.',
            'status.required' => 'Status wajib diisi.',
            'status.in' => 'Piilihan status hanya aktif dan tidak aktif.',
        ]);        

        $siswa->update([
            'nisn' => $validated['nisn'],
            'nama' => $validated['nama'],
            'nis' => $validated['nis'],            
            'email' => $validated['email'],
            'role' => 'siswa',
            'status' => $validated['status'],
        ]);

        return ApiResponse::success(
            [
                'id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama' => $siswa->nama,
                'nis' => $siswa->nis,                
                'email' => $siswa->email,
                'role' => $siswa->role,
                'status' => $siswa->status,
            ],
            'Data siswa berhasil diperbarui'
        );
    }

    // ✅ spa
    public function destroy($id)
    {
        $siswa = Siswa::find($id);

        if (! $siswa) {
            return ApiResponse::error(
                'Siswa tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        // Daftar relasi yang harus dicek
        $relations = [
            'ekskulSiswa',
            'jurusan',
            'kelas',
            'siswaRombels',
            'pengajar',
            'jadwalPelajarans',
            'absensis',
            'kurikulumMataPelajarans',
            'dataNilaiSiswas',
            'prestasis'
        ];

        foreach ($relations as $relation) {
            if ($siswa->$relation()->exists()) {
                return ApiResponse::error(
                    'Siswa tidak dapat dihapus',
                    [
                        'relasi' => [
                            "Siswa sudah digunakan pada data lain, update status sebagai solusi"
                        ]
                    ],
                    422
                );
            }
        }

        $siswa->delete();

        return ApiResponse::success(null, 'Siswa berhasil dihapus');
    }

    // CRUD

    // ✅ ubah password oleh super admin
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
    
    
    // ✅ Lupa password siswa
    // ? Button forgot ppassword + send reset link email 
    public function sendResetLink(Request $request)
    {
        // 1. Validasi email wajib ada dan harus terdaftar
        $request->validate([
            'email' => 'required|email|exists:siswas,email'
        ], [
            'email.exists' => 'Email tidak terdaftar dalam sistem.'
        ]);

        // 2. Kirim link reset password via email menggunakan broker "siswa" di config/auth.php bagian password
        //    Broker akan otomatis:
        //    - generate token
        //    - simpan hash token ke tabel password_reset_tokens
        //    - mengirim email berisi link reset
        $status = Password::broker('siswa')->sendResetLink(
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
        return redirect()->away($frontendUrl . "?token={$token}&email={$email}&type=siswa");

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
            'email'    => 'required|email|exists:siswas,email', // email valid & terdaftar
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
        $status = Password::broker('siswa')->reset(
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
