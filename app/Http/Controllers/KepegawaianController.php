<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kepegawaian;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Password; // Mengimpor facade Password untuk mengakses fitur reset password Laravel
use Illuminate\Support\Facades\Validator;

class KepegawaianController extends Controller
{

    // ✅ register pegawai
    public function registerKepegawaian(Request $request)
    {
        try {            
            $validated = $request->validate([
                // samakan dengan ini
                // -----------------------------------------------------------------------
                'nama' => 'required|string',
                'email' => ['required', 'unique:kepegawaians,email', 'email'],
                'nip' => ['nullable', 'digits_between:5,50', 'unique:kepegawaians,nip', 'numeric'],
                'nuptk' => ['nullable', 'digits_between:5,50', 'unique:kepegawaians,nuptk', 'numeric'],
                'keterangan' => 'nullable',
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
                // -----------------------------------------------------------------------
            ], [
                'email.required' => 'Email wajib diisi.',
                'email.unique' => 'Email sudah terdaftar.',
                'email.email' => 'Email tidak valid.',            
                'nip.unique' => 'NIP sudah terdaftar.',
                'nip.numeric' => 'NIP hanya boleh berisi angka.',
                'nuptk.unique' => 'NUPTK sudah terdaftar.',
                'nuptk.numeric' => 'NUPTK hanya boleh berisi angka.',
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
                'nama' => $validated['nama'] ?? null,
                'email' => $validated['email'] ?? null,
                'nip' => $validated['nip'] ?? null,
                'nuptk' => $validated['nuptk'] ?? null,
                'keterangan' => $validated['keterangan'] ?? null,
                'password' => Hash::make($validated['password']) ?? null,
                'role' => $validated['role'] ?? null,
                'status' => 'aktif',
            ]);

            // Response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi Kepegawaian berhasil, silakan login',
                'data' => [
                    'id' => $kepegawaian->id,
                    'nama' => $kepegawaian->nama,
                    'email' => $kepegawaian->email ?? null,
                    'nip' => $kepegawaian->nip ?? null,
                    'nuptk' => $kepegawaian->nuptk ?? null,
                    'keterangan' => $kepegawaian->keterangan ?? null,
                    'role' => $kepegawaian->role,
                    'status' => $kepegawaian->status,
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

    // ✅ store pegawai untuk spa
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                // samakan dengan ini
                // -----------------------------------------------------------------------
                'nama' => 'required|string',
                'email' => ['required', 'unique:kepegawaians,email', 'email'],
                'nip' => ['nullable', 'digits_between:5,50', 'unique:kepegawaians,nip', 'numeric'],
                'nuptk' => ['nullable', 'digits_between:5,50', 'unique:kepegawaians,nuptk', 'numeric'],
                'keterangan' => 'nullable',
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
                // -----------------------------------------------------------------------
            ], [
                'email.required' => 'Email wajib diisi.',
                'email.unique' => 'Email sudah terdaftar.',
                'email.email' => 'Email tidak valid.',
                'nip.numeric' => 'NIP hanya boleh berisi angka.',
                'nuptk.unique' => 'NUPTK sudah terdaftar.',
                'nuptk.numeric' => 'NUPTK hanya boleh berisi angka.',
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
                'nama' => $validated['nama'] ?? null,
                'email' => $validated['email'] ?? null,
                'nip' => $validated['nip'] ?? null,
                'nuptk' => $validated['nuptk'] ?? null,
                'keterangan' => $validated['keterangan'] ?? null,
                'password' => Hash::make($validated['password']) ?? null,
                'role' => $validated['role'] ?? null,
                'status' => 'aktif',
            ]);

            // Response sukses
            return response()->json([
                'status' => 'success',
                'message' => 'Registrasi Kepegawaian berhasil, silakan login',
                'data' => [
                    'id' => $kepegawaian->id,
                    'nama' => $kepegawaian->nama,
                    'email' => $kepegawaian->email,
                    'nip' => $kepegawaian->nip,
                    'nuptk' => $kepegawaian->nuptk,
                    'keterangan' => $kepegawaian->keterangan,
                    'role' => $kepegawaian->role,
                    'status' => $kepegawaian->status,
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

            // Cari Pegawai berdasarkan email
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
                'id' => $kepegawaian->id ?? null,
                'nama' => $kepegawaian->nama ?? null,
                'email' => $kepegawaian->email ?? null,
                'nip' => $kepegawaian->nip ?? null,
                'nuptk' => $kepegawaian->nuptk ?? null,
                'keterangan' => $kepegawaian->keterangan ?? null,
                'role' => $kepegawaian->role ?? null,
                'status' => $kepegawaian->status ?? null,
                'token' => $token ?? null,
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
    // ✅ untuk spa
    public function index()
    {
        $pegawai = Kepegawaian::get();

        $formatted = $pegawai->map(function ($item) {
            return [
                'id' => $item->id ?? null,
                'nama' => $item->nama ?? null,
                'email' => $item->email ?? null,
                'nip' => $item->nip ?? null,
                'nuptk' => $item->nuptk ?? null,
                'keterangan' => $item->keterangan ?? null,
                'role' => $item->role ?? null,                
                'status' => $item->status ?? null,                
            ];
        });

        return ApiResponse::success($formatted, 'Daftar pegawai berhasil diambil');
    }

    // ✅ untuk spa
    public function show($id)
    {
        $pegawai = Kepegawaian::with([
            'rombels.kelas',
            'rombels.tahunAkademik',
            'pelatihEkskul.ekstrakurikuler',
            'pelatihEkskul.tahunAkademik',
            'pembinaEkskul.ekstrakurikuler',
            'pembinaEkskul.tahunAkademik',
            'jadwalPelajarans.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.kurikulum',
            'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
            'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
            'jadwalPelajarans.semester.tahunAkademik',
        ])->find($id);

        if (!$pegawai) {
            return ApiResponse::error('Pegawai tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $pegawai->id ?? null,
            'nama' => $pegawai->nama ?? null,
            'email' => $pegawai->email ?? null,
            'nip' => $pegawai->nip ?? null,
            'nuptk' => $pegawai->nuptk ?? null,
            'keterangan' => $pegawai->keterangan ?? null,
            'role' => $pegawai->role ?? null,
            'status' => $pegawai->status ?? null,
            'histori_wali_rombel' => $pegawai->rombels->map(function ($walRom) {
                return [
                    'rombel_id' => $walRom->id ?? null,
                    'nama_rombel' => $walRom->nama_rombel ?? null, // X-1

                    'kelas_id' => $walRom->kelas->id ?? null, // X
                    'nama_kelas' => $walRom->kelas->nama_kelas ?? null,
                    'tingkat_kelas' => $walRom->kelas->tingkat ?? null, // 10
                    'jurusan_kelas' => $walRom->kelas->jurusan->nama_jurusan ?? null,                    

                    'tahun_akademik_rombel' => $walRom->tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik_rombel' => $walRom->tahunAkademik->status ?? null,
                ];
            }),
            'histori_pelatih_ekskul' => $pegawai->pelatihEkskul->map(function ($pelatih) {
                return [
                    'pelatih_id' => $pelatih->id ?? null,
                    'ekskul_id' => $pelatih->ekstrakurikuler_id ?? null,
                    'nama_ekskul' => $pelatih->ekstrakurikuler->nama_ekstrakurikuler ?? null,
                    'tahun_akademik_melatih' => $pelatih->tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik_melatih' => $pelatih->tahunAkademik->status ?? null,
                ];
            }),
            'histori_pembina_ekstrakurikuler' => $pegawai->pembinaEkskul->map(function ($pembina) {
                return [
                    'pembina_id' => $pembina->id ?? null,
                    'ekstrakurikuler_id' => $pembina->ekstrakurikuler_id ?? null,
                    'nama_ekstrakurikuler' => $pembina->ekstrakurikuler->nama_ekstrakurikuler ?? null,
                    'tahun_akademik_membina' => $pembina->tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik_membina' => $pembina->tahunAkademik->status ?? null,
                ];
            }),                    
            'histori_jadwal_pelajaran' => $pegawai->jadwalPelajarans
            ->groupBy(fn ($jadwal) => $jadwal->semester->tahunAkademik->id)
            ->map(function ($jadwalPerTahun) {

                $tahunAkademik = $jadwalPerTahun->first()->semester->tahunAkademik;

                return [
                    'tahun_akademik_id' => $tahunAkademik->id,
                    'tahun_akademik' => $tahunAkademik->tahun_akademik,
                    'status_tahun_akademik' => $tahunAkademik->status,

                    'semester' => $jadwalPerTahun
                        ->groupBy(fn ($jadwal) => $jadwal->semester->id)
                        ->map(function ($jadwalPerSemester) {

                            $semester = $jadwalPerSemester->first()->semester;

                            return [
                                'semester_id' => $semester->id,
                                'semester' => $semester->semester, // Ganjil / Genap
                                'status_semester' => $semester->status,

                                'jadwal' => $jadwalPerSemester->map(function ($jadwal) {
                                    $kurmap = $jadwal->kurikulumMataPelajaran;

                                    return [
                                        'jadwal_pelajaran_id' => $jadwal->id,
                                        'hari' => $jadwal->hari,
                                        'jam_mulai' => $jadwal->jam_mulai,
                                        'jam_selesai' => $jadwal->jam_selesai,
                                        'rombel' => $jadwal->rombel->nama_rombel ?? null,
                                        'ruangan' => $jadwal->ruangan,
                                        'link_opsional' => $jadwal->link_opsional,

                                        'mata_pelajaran' => [
                                            'nama_pelajaran' => $kurmap->mataPelajaran->nama_pelajaran ?? null,
                                            'jurusan_pelajaran' => $kurmap->jurusan->nama_jurusan ?? null,
                                            'tingkat_pelajaran' => $kurmap->tingkat,
                                            'status_pelajaran' => $kurmap->status_mata_pelajaran,
                                            'kkm' => $kurmap->nilai_kkm,
                                            'tahun_akdemik_pelajaran' => $kurmap->tahunAkademik->tahun_akademik ?? null, 
                                            'status_tahun_akdemik_pelajaran' => $kurmap->tahunAkademik->status ?? null, 
                                        ],
                                    ];
                                })->values(),
                            ];
                        })->values(),
                ];
            })->values(),
        ];
        return ApiResponse::success($formatted, 'Detail pegawai berhasil diambil');
    }

    // ✅ show diri sendiri (pegawai)
    public function showDiriSendiri()
    {
        $user = Auth::guard('kepegawaian')->user();

        $pegawai = Kepegawaian::with([
            'rombels.kelas',
            'rombels.tahunAkademik',
            'pelatihEkskul.ekstrakurikuler',
            'pelatihEkskul.tahunAkademik',
            'pembinaEkskul.ekstrakurikuler',
            'pembinaEkskul.tahunAkademik',
            'jadwalPelajarans.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.kurikulum',
            'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
            'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
            'jadwalPelajarans.semester.tahunAkademik',
        ])->find($user->id);

        if (!$pegawai) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $pegawai->id ?? null,
            'nama' => $pegawai->nama ?? null,
            'email' => $pegawai->email ?? null,
            'nip' => $pegawai->nip ?? null,
            'nuptk' => $pegawai->nuptk ?? null,
            'keterangan' => $pegawai->keterangan ?? null,
            'role' => $pegawai->role ?? null,
            'status' => $pegawai->status ?? null,
            'histori_wali_rombel' => $pegawai->rombels->map(function ($walRom) {
                return [
                    'rombel_id' => $walRom->id ?? null,
                    'nama_rombel' => $walRom->nama_rombel ?? null, // X-1

                    'kelas_id' => $walRom->kelas->id ?? null, // X
                    'nama_kelas' => $walRom->kelas->nama_kelas ?? null,
                    'tingkat_kelas' => $walRom->kelas->tingkat ?? null, // 10
                    'jurusan_kelas' => $walRom->kelas->jurusan->nama_jurusan ?? null,                    

                    'tahun_akademik_rombel' => $walRom->tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik_rombel' => $walRom->tahunAkademik->status ?? null,
                ];
            }),
            'histori_pelatih_ekskul' => $pegawai->pelatihEkskul->map(function ($pelatih) {
                return [
                    'pelatih_id' => $pelatih->id ?? null,
                    'ekskul_id' => $pelatih->ekstrakurikuler_id ?? null,
                    'nama_ekskul' => $pelatih->ekstrakurikuler->nama_ekstrakurikuler ?? null,
                    'tahun_akademik_melatih' => $pelatih->tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik_melatih' => $pelatih->tahunAkademik->status ?? null,
                ];
            }),
            'histori_pembina_ekstrakurikuler' => $pegawai->pembinaEkskul->map(function ($pembina) {
                return [
                    'pembina_id' => $pembina->id ?? null,
                    'ekstrakurikuler_id' => $pembina->ekstrakurikuler_id ?? null,
                    'nama_ekstrakurikuler' => $pembina->ekstrakurikuler->nama_ekstrakurikuler ?? null,
                    'tahun_akademik_membina' => $pembina->tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik_membina' => $pembina->tahunAkademik->status ?? null,
                ];
            }),                    
            'histori_jadwal_pelajaran' => $pegawai->jadwalPelajarans
            ->groupBy(fn ($jadwal) => $jadwal->semester->tahunAkademik->id)
            ->map(function ($jadwalPerTahun) {

                $tahunAkademik = $jadwalPerTahun->first()->semester->tahunAkademik;

                return [
                    'tahun_akademik_id' => $tahunAkademik->id,
                    'tahun_akademik' => $tahunAkademik->tahun_akademik,
                    'status_tahun_akademik' => $tahunAkademik->status,

                    'semester' => $jadwalPerTahun
                        ->groupBy(fn ($jadwal) => $jadwal->semester->id)
                        ->map(function ($jadwalPerSemester) {

                            $semester = $jadwalPerSemester->first()->semester;

                            return [
                                'semester_id' => $semester->id,
                                'semester' => $semester->semester, // Ganjil / Genap
                                'status_semester' => $semester->status,

                                'jadwal' => $jadwalPerSemester->map(function ($jadwal) {
                                    $kurmap = $jadwal->kurikulumMataPelajaran;

                                    return [
                                        'jadwal_pelajaran_id' => $jadwal->id,
                                        'hari' => $jadwal->hari,
                                        'jam_mulai' => $jadwal->jam_mulai,
                                        'jam_selesai' => $jadwal->jam_selesai,
                                        'rombel' => $jadwal->rombel->nama_rombel ?? null,
                                        'ruangan' => $jadwal->ruangan,
                                        'link_opsional' => $jadwal->link_opsional,

                                        'mata_pelajaran' => [
                                            'nama_pelajaran' => $kurmap->mataPelajaran->nama_pelajaran ?? null,
                                            'jurusan_pelajaran' => $kurmap->jurusan->nama_jurusan ?? null,
                                            'tingkat_pelajaran' => $kurmap->tingkat,
                                            'status_pelajaran' => $kurmap->status_mata_pelajaran,
                                            'kkm' => $kurmap->nilai_kkm,
                                            'tahun_akdemik_pelajaran' => $kurmap->tahunAkademik->tahun_akademik ?? null, 
                                            'status_tahun_akdemik_pelajaran' => $kurmap->tahunAkademik->status ?? null, 
                                        ],
                                    ];
                                })->values(),
                            ];
                        })->values(),
                ];
            })->values(),
        ];
        return ApiResponse::success($formatted, 'Detail data berhasil diambil');
    }

    // ✅ Store = Register

    // ✅ untuk spa
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
            'nip' => [
                'sometimes',
                'nullable',
                Rule::unique('kepegawaians')->ignore($id)
            ],
            'nuptk' => [
                'sometimes',
                'nullable',
                Rule::unique('kepegawaians')->ignore($id)
            ],
            'keterangan' => 'sometimes|nullable',
            'role' => 'sometimes|required',
            'status' => 'sometimes|required|in:aktif,tidak aktif'
        ], [
            'nama.required' => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.unique' => 'Terdeteksi email ganda',            
            'nip.unique' => 'Terdeteksi NIP ganda',
            'nuptk.unique' => 'Terdeteksi NUPTK ganda',
            'role.required' => 'Role wajib diisi',
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan status hanya aktif dan tidak aktif',
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

        // tidak boleh ubah role jika sedang menjadi wali_rombel di tahun akademik yang aktif
        if (
            $validated['role'] !== $pegawai->role &&
            $pegawai->rombels()
                ->whereHas('tahunAkademik', function ($q) {
                    $q->where('status', 'aktif');
                })
                ->exists()
        ) {
            return ApiResponse::error(
                'Role tidak bisa diubah karena pegawai masih menjadi wali rombel aktif',
                [
                    'role' => ['Tidak bisa, pegawai ini masih berstatus sebagai wali rombel di tahun akademik aktif']
                ],
                422
            );
        }
            
        $pegawai->update([
            'nama' => $validated['nama'],
            'email' => $validated['email'],
            'status' => $validated['status'],
            'nip' => $validated['nip'],
            'nuptk' => $validated['nuptk'],
            'keterangan' => $validated['keterangan'],
            'role' => $validated['role'],
            'status' => $validated['status'],
        ]);        

        return ApiResponse::success(
            [
                'id' => $pegawai->id ?? null,
                'nama' => $pegawai->nama ?? null,
                'email' => $pegawai->email ?? null,
                'nip' => $pegawai->nip ?? null,
                'nuptk' => $pegawai->nuptk ?? null,
                'keterangan' => $pegawai->keterangan ?? null,
                'role' => $pegawai->role ?? null,                
                'status' => $pegawai->status ?? null,                
            ],
            'Pegawai berhasil diperbarui'
        );
    }

     // ✅ Update super admin oleh dirinya sendiri
     public function updateDirinyaSendiri(Request $request)
     {
         $user = Auth::guard('kepegawaian')->user();

         $pegawai = Kepegawaian::find($user->id);
 
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
             'nip' => [
                 'sometimes',
                 'nullable',
                 Rule::unique('kepegawaians')->ignore($pegawai->id)
             ],
             'nuptk' => [
                 'sometimes',
                 'nullable',
                 Rule::unique('kepegawaians')->ignore($pegawai->id)
             ],                          
             'keterangan' => 'sometimes|nullable',
        ], [
            'nama.required' => 'Nama wajib diisi',
            'email.required' => 'Email wajib diisi',
            'email.unique' => 'Terdeteksi email ganda',            
            'nip.unique' => 'Terdeteksi NIP ganda',
            'nuptk.unique' => 'Terdeteksi NUPTK ganda',            
        ]);

        $pegawai->update([
            'nama' => $validated['nama'] ?? null,
            'email' => $validated['email'] ?? null,
            'nip' => $validated['nip'] ?? null,
            'nuptk' => $validated['nuptk'] ?? null,
            'keterangan' => $validated['keterangan'] ?? null,
        ]);        

        return ApiResponse::success(
            [
                'id' => $pegawai->id ?? null,
                'nama' => $pegawai->nama ?? null,
                'email' => $pegawai->email ?? null,
                'nip' => $pegawai->nip ?? null,
                'nuptk' => $pegawai->nuptk ?? null,
                'keterangan' => $pegawai->keterangan ?? null,
                'role' => $pegawai->role ?? null,                
                'status' => $pegawai->status ?? null,                
            ],
            'Data berhasil diperbarui'
        );
     }

    // ✅ untuk spa
    public function destroy($id)
    {
        $pegawai = Kepegawaian::find($id);
        if (!$pegawai) {
            return ApiResponse::error('Pegawai tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $dipakaiRombel = $pegawai->rombels()->exists();
        $dipakaiPembina = $pegawai->pembinaEkskul()->exists();
        $dipakaiPelatih = $pegawai->pelatihEkskul()->exists();
        $dipakaiJadwal = $pegawai->jadwalPelajarans()->exists();
        $dipakaiAbsenPegawai = $pegawai->absensiKepegawaians()->exists();
        $dipakaiAbsenPelajaran = $pegawai->absensiPelajarans()->exists();
        $dipakaiAbsenNilai = $pegawai->dataNilaiSiswas()->exists();
        
        if ($dipakaiRombel || $dipakaiPembina || $dipakaiPelatih || $dipakaiJadwal || $dipakaiAbsenPegawai || $dipakaiAbsenPelajaran || $dipakaiAbsenNilai) {
            return ApiResponse::error(
                'Pegawai tidak dapat dihapus',
                [
                    'id' => [
                        'Pegawai sudah menjadi bagian dari histori arsip, ubah status sebagai solusi'
                    ]
                ],
                422
            );
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

    // ✅ Ubah password pegawai oleh diri sendiri
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
    // ? Button forgot password + send reset link email 
    public function sendResetLink(Request $request)
    {
        // 1. Validasi email wajib ada dan harus terdaftar
        $request->validate([
            'email' => 'required|email|exists:kepegawaians,email'
        ], [
            'email.exists' => 'Email tidak terdaftar dalam sistem.'
        ]);

        // 2. Kirim link reset password via email menggunakan broker "kepegawaian" pada config/auth.php bagian password
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
        return redirect()->away($frontendUrl . "?token={$token}&email={$email}&type=kepegawaian");

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