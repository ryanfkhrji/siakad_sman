<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Models\JadwalPelajaran;
use App\Models\Kepegawaian;
use App\Models\KurikulumMataPelajaran;
use App\Models\Kelas;
use App\Models\Ruangan;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class JadwalPelajaranController extends Controller
{
    /**
     * ✅ Untuk SPA
     * 1 guru = banyak jadwal
     * 1 jadwal = 1 kurmap
     * 1 jadwal = banyak peserta
     */
    public function index()
    {
        $jadwal = JadwalPelajaran::with([
            'guru',
            'kelas',
            'kurikulumMataPelajaran.kurikulum',
            'kurikulumMataPelajaran.mataPelajaran',
            'kurikulumMataPelajaran.jurusan',
            'kurikulumMataPelajaran.tahunAkademik',
            'siswas.jurusan',
            'siswas.kelas',
        ])        
        ->get();

        if ($jadwal->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Jadwal tidak ditemukan']);
        }

        $result = $jadwal
        ->groupBy('guru_id')
        ->map(function ($items) {

            $guru = $items->first()->guru;

            return [
                'guru_id'   => $guru->id ?? null,
                'nama_guru' => $guru->nama ?? null,

                // 🔽 GROUP BARU: jurusan pelajaran
                'jurusan_pelajaran' => $items
                    ->groupBy(function ($item) {
                        return $item->kurikulumMataPelajaran->jurusan->id ?? 'tanpa_jurusan';
                    })
                    ->map(function ($itemsJurusan) {

                        $jurusan = $itemsJurusan->first()
                            ->kurikulumMataPelajaran
                            ->jurusan;

                        return [
                            'jurusan_pelajaran_id' => $jurusan->id ?? null,
                            'nama_jurusan' => $jurusan->nama_jurusan ?? null,

                            'jadwal_pelajaran' => $itemsJurusan->map(function ($item) {

                                $kurikulum = $item->kurikulumMataPelajaran;

                                return [
                                    'jadwal_pelajaran_id' => $item->id,
                                    'hari'        => $item->hari,
                                    'kelas'       => $item->kelas->nama_kelas ?? null,
                                    'jam_mulai'   => $item->jam_mulai,
                                    'jam_selesai' => $item->jam_selesai,
                                    'ruangan'     => $item->ruangan,
                                    'link_opsional' => $item->link_opsional,

                                    'kurikulum_mata_pelajaran' => [
                                        'id'        => $kurikulum->id ?? null,
                                        'kurikulum' => $kurikulum->kurikulum->nama_kurikulum ?? null,
                                        'mata_pelajaran_id'   => $kurikulum->mata_pelajaran_id ?? null,
                                        'nama_mata_pelajaran' => $kurikulum->mataPelajaran->nama_pelajaran ?? null,
                                        'tahun_akademik_id' => $kurikulum->tahunAkademik->id ?? null,
                                        'tahun_akademik' => $kurikulum->tahunAkademik->tahun_akademik ?? null,
                                        'status_tahun_akademik' => $kurikulum->tahunAkademik->status ?? null,
                                        'semester' => $kurikulum->tahunAkademik->semester ?? null,
                                        'status_semester' => $kurikulum->tahunAkademik->status ?? null,
                                        'tingkat'     => $kurikulum->tingkat ?? null,
                                        'nilai_kkm'   => $kurikulum->nilai_kkm ?? null,
                                        'status_mata_pelajaran' => $kurikulum->status_mata_pelajaran ?? null,
                                    ],

                                    'peserta' => $item->siswas->map(function ($siswa) use ($item) {
                                        return [
                                            'siswa_id'   => $siswa->id ?? null,
                                            'nama_siswa' => $siswa->nama ?? null,
                                            'jurusan_siswa' => $siswa->jurusan->nama_jurusan ?? null,
                                            'kelas_siswa'   => $siswa->kelas->nama_kelas ?? null,
                                            'siswa_jadwal_pelajaran_id' => $siswa->pivot->id ?? null,
                                            'jadwal_pelajaran_id' => $item->id,
                                            'status_aktif' => $siswa->pivot->status ?? null,
                                        ];
                                    })->values(),
                                ];
                            })->values(),
                        ];
                    })->values(),
                ];
        })->values();


        // Data untuk select
        $guru = Kepgawaian::get()->map(function ($item) {
            return [
                'guru_id' => $item->id ?? null,
                'nama_guru' => $item->nama ?? null,
                'status' => $item->status ?? null,
                'role' => $item->role ?? null,
            ];
        });


        // ambil yang status pada tahun akademiknya aktif saja
        $kurikulumMataPelajaran = KurikulumMataPelajaran::with('kurikulum', 'mataPelajaran', 'tahunAkademik')
        ->whereHas('tahunAkademik', function ($q) {
             $q->where('status', 'aktif');
        })
        ->map(function ($item) {
            return [
                'kurikulum_mata_pelajaran_id' => $item->id ?? null,
                'kurikulum' => $item->kurikulum->nama_kurikulum ?? null,
                'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran ?? null,
                'tahun_akademik' => $item->tahunAkademik->tahun_akademik ?? null,
                'status_tahun_akademik' => $item->tahunAkademik->status ?? null,
                'tingkat' => $item->tingkat ?? null,
                'status_mata_pelajaran' => $item->status_mata_pelajaran ?? null,
            ];
        });


        // ambil yang status tahun akademiknya aktif saja
        $kelas = Kelas::with('jurusan', 'tahunAkademik')
        ->whereHas('tahunAkademik', function ($q) {
            $q->where('status', 'aktif');
        })
        ->get()
        ->map(function ($item) {
            return [
                'kelas_id' => $item->id ?? null,
                'nama_kelas' => $item->nama_kelas ?? null,
                'tingkat' => $item->tingkat ?? null,
                'jurusan' => $item->jurusan->nama_jurusan ?? null,
                'tahun_akademik' => $item->tahunAkademik->tahun_akademik ?? null,
                'status_tahun_akademik' => $item->tahunAkademik->status ?? null,
            ];
        });


        $ruangan = Ruangan::with('gedung')->get()->map(function ($item) {
            return [
                'ruangan_id' => $item->id ?? null,
                'nama_ruangan' => $item->nama_ruangan ?? null,
                'di_gedung' => $item->gedung->nama_gedung ?? null,
            ];
        });
        // Data untuk select


        return ApiResponse::success(
        [   
            'data' => $result,
            'data_untuk_select' => [
                'kurikulum_mata_pelajaran' => $kurikulumMataPelajaran ?? null,
                'guru' => $guru ?? null,
                'kelas' => $kelas ?? null,
                'ruangan' => $ruangan ?? null,
            ]
        ], 'Daftar jadwal pelajaran berhasil diambil');
    }


    /**
     * ✅ Untuk SPA
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                // ⚠️ Ini inputannya untuk create @Ryan
                'kurikulum_mata_pelajaran_id' => 'required|exists:kurikulum_mata_pelajaran,id',
                'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
                'guru_id' => 'required|exists:kepegawaians,id',
                'kelas_id' => 'required|exists:kelas,id',
                'jam_mulai' => 'required|time',
                'jam_selesai' => 'required|time',
                'ruangan' => 'nullable|exists:ruangan,id',
                'link_opsional' => 'nullable'
            ], [
                'kurikulum_mata_pelajaran_id.required' => 'Kurikulum mata pelajaran wajib diisi',
                'kurikulum_mata_pelajaran_id.exists' => 'Kurikulum mata pelajaran tidak ditemukan',
                'hari.required' => 'Hari wajib diisi',
                'hari.in' => 'Pilihan hanya Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu',
                'guru_id.required' => 'Guru wajib diisi',
                'guru_id.exists' => 'Guru tidak ditemukan',
                'kelas_id.required' => 'Kelas wajib diisi',
                'kelas_id.exists' => 'Kelas tidak ditemukan',
                'jam_mulai.required' => 'Jam mulai wajib diisi',
                'jam_mulai.time' => 'Format waktu jam mulai tidak valid',
                'jam_selesai.required' => 'Jam selesai wajib diisi',
                'jam_selesai.time' => 'Format waktu jam selesai tidak valid',
                'ruangan.exists' => 'Ruangan tidak ditemukan',
            ]);            

            // pelajaran harus sama dan tidak boleh berbeda
            // get mata_pelajaran_id di kurikulumMataPelajaran
            $existingMapel = KurikulumMataPelajaran::with('mataPelajaran')->where('id', $validated['kurikulum_mata_pelajaran_id'])->first();

            // get jadwal_pelajaran
            $existing = JadwalPelajaran::with('kurikulumMataPelajaran')->where('guru_id', $validated['guru_id'])->first();

            // jika mata_pelajaran_id pada existing != dengan mata_pelajaran_id pada existingMapel, tidak boleh
            if ($existing) {
                if ($existing->kurikulumMataPelajaran->mata_pelajaran_id != $existingMapel->mata_pelajaran_id) {
                    return ApiResponse::error('Not allowed', [
                        'pesan' => ['Satu guru hanya boleh satu mata pelajaran']
                    ], 422);
                }
            }

            // bentrok jika hari dan jam sudah ada di db
            $bentrok = JadwalPelajaran::where('guru_id', $validated['guru_id'])
            // ->where('kurikulum_mata_pelajaran_id', $validated['kurikulum_mata_pelajaran_id'])
            ->where('hari', $validated['hari'])
            ->where('jam_mulai', $validated['jam_mulai'])
            ->where('jam_selesai', $validated['jam_selesai'])
            ->first();
            if ($bentrok) {
                    return ApiResponse::error('Not allowed', [
                        'pesan' => ['Hari dan jam sekian sudah ada sehingga bentrok']
                    ], 422);
            }
    
            // ! jika semester (tahun) dan kurikulum_mata_pelajaran (tahun) tidak sama, maka tidak boleh
            if (
                $kurmap->tahun_akademik_id !== $semester->tahun_akademik_id
            ) {
                throw ValidationException::withMessages([
                    'semester_id' => 'Semester tidak sesuai dengan tahun akademik mata pelajaran',
                ]);
            }
            

            $matpel = JadwalPelajaran::create($validated);
            
            $matpel->load(['kurikulumMataPelajaran.mataPelajaran', 'guru', 'kelas', 'tahunAkademik', 'jurusan', 'jurusanPelajaran', 'siswas']);
            
            return ApiResponse::success([
                'id' => $matpel->id ?? null,
                'kurikulum_mata_pelajaran' => $matpel->kurikulumMataPelajaran->id ?? null,
                'nama_mata_pelajaran' => $matpel->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                'hari' => $matpel->hari ?? null,
                'guru' => $matpel->guru->nama ?? null,
                'kelas' => $matpel->kelas->nama_kelas ?? null,
                'jam_mulai' => $matpel->jam_mulai ?? null,
                'jam_selesai' => $matpel->jam_selesai ?? null,
                'ruangan' => $matpel->ruangan ?? null,
                'link_opsional' => $matpel->link_opsional ?? null,
            ], 'Jadwal Pelajaran Berhasil Dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ SPA dan Guru
     * 1 jadwal = 1 kurmap
     * 1 kurmap = banyak jadwal
     * 
     * 1 jadwal = banyak siswa
     * 1 siswa = banyak jadwal
     */
    public function show(string $id)
    {
        $matpel = JadwalPelajaran::with(['kurikulumMataPelajaran.mataPelajaran', 'guru', 'kelas', 'tahunAkademik', 'jurusan', 'jurusanPelajaran', 'siswas'])->find($id);

        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'guru_id' => $matpel->guru->id ?? null,
            'nama_guru' => $matpel->guru->nama ?? null,
            'jadwal_pelajaran' => [
                'jadwal_pelajaran_id' => $matpel->id ?? null,
                'hari' => $matpel->hari ?? null,
                'kelas' => $matpel->kelas->nama_kelas ?? null,
                'jam_mulai' => $matpel->jam_mulai ?? null,
                'jam_selesai' => $matpel->jam_selesai ?? null,
                'ruangan' => $matpel->ruangan ?? null,
                'link_opsional' => $matpel->link_opsional ?? null,
                'kurikulum_mata_pelajaran' => [
                    'kurikulum_mata_pelajaran_id' => $matpel->kurikulumMataPelajaran->id ?? null,
                    'mata_pelajaran_id' => $matpel->kurikulumMataPelajaran->mata_pelajaran_id ?? null,
                    'nama_mata_pelajaran' => $matpel->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                    'jurusan_pelajaran_id' => $matpel->kurikulumMataPelajaran->jurusan_pelajaran_id ?? null,
                    'nama_jurusan_pelajaran' => $matpel->kurikulumMataPelajaran->jurusan->nama_jurusan ?? null,
                    'tingkat' => $matpel->kurikulumMataPelajaran->tingkat ?? null,
                    'nilai_kkm' => $matpel->kurikulumMataPelajaran->nilai_kkm ?? null,
                    'status_mata_pelajaran' => $matpel->kurikulumMataPelajaran->status_mata_pelajaran ?? null,
                    'tahun_akademik_id' => $matpel->kurikulumMataPelajaran->tahunAkademik->id ?? null,                    
                    'tahun_akademik' => $matpel->kurikulumMataPelajaran->tahunAkademik->tahun_akademik ?? null,                    
                    'status_tahun_akademik' => $matpel->kurikulumMataPelajaran->tahunAkademik->status ?? null,
                    'semester' => $matpel->kurikulumMataPelajaran->tahunAkademik->semester ?? null,
                    'status_semester' => $matpel->kurikulumMataPelajaran->tahunAkademik->status ?? null,
                ],
                'peserta' => $matpel->siswas->map(function ($siswa) {
                    return [
                        'siswa_id' => $siswa->id ?? null,
    
                        'siswa_jadwal_pelajaran_id' => $siswa->pivot->id ?? null,
                        'jadwal_pelajaran_id' => $siswa->pivot->jadwal_pelajaran_id ?? null,
    
                        'nama_siswa' => $siswa->nama ?? null,
                        'jurusan_siswa' => $siswa->jurusan->nama_jurusan ?? null,
                        'kelas' => $siswa->kelas->nama_kelas ?? null,
                    ];
                }),  
            ],        

                
        ];

        return ApiResponse::success($formatted, 'Detail jadwal pelajaran berhasil diambil');
    }

    // ✅ Untuk pegawai     
    public function showAllJadwalSendiri()
    {
        $pegawai = Auth::guard('kepegawaian')->user();

        $guru = Kepegawaian::with([
            'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
            'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
            'jadwalPelajarans.kelas',
            'jadwalPelajarans.siswas.jurusan',
            'jadwalPelajarans.siswas.kelas',
        ])->find($pegawai->id);

        if (!$guru) {
            return ApiResponse::error(
                'Guru tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $result = [
            'guru_id'   => $guru->id,
            'nama_guru' => $guru->nama,

            // 🔽 GROUP BERDASARKAN JURUSAN PELAJARAN
            'jurusan_pelajaran' => $guru->jadwalPelajarans
                ->groupBy(function ($jadwal) {
                    return $jadwal->kurikulumMataPelajaran->jurusan->id ?? 'tanpa_jurusan';
                })
                ->map(function ($jadwalPerJurusan) {

                    $jurusan = $jadwalPerJurusan->first()
                        ->kurikulumMataPelajaran
                        ->jurusan;

                    return [
                        'jurusan_pelajaran_id' => $jurusan->id ?? null,
                        'nama_jurusan' => $jurusan->nama_jurusan ?? null,

                        'jadwal_pelajaran' => $jadwalPerJurusan->map(function ($jadwal) {

                            $kurikulum = $jadwal->kurikulumMataPelajaran;

                            return [
                                'jadwal_pelajaran_id' => $jadwal->id,

                                'hari'        => $jadwal->hari,
                                'kelas_id'    => $jadwal->kelas->id ?? null,
                                'kelas'       => $jadwal->kelas->nama_kelas ?? null,
                                'jam_mulai'   => $jadwal->jam_mulai,
                                'jam_selesai' => $jadwal->jam_selesai,
                                'ruangan'     => $jadwal->ruangan,
                                'link_opsional' => $jadwal->link_opsional,

                                'kurikulum_mata_pelajaran' => [
                                    'kurikulum_mata_pelajaran_id'        => $kurikulum->id ?? null,
                                    'mata_pelajaran_id' => $kurikulum->mata_pelajaran_id ?? null,
                                    'nama_mata_pelajaran' => $kurikulum->mataPelajaran->nama_pelajaran ?? null,
                                    'tingkat' => $kurikulum->tingkat ?? null,
                                    'nilai_kkm' => $kurikulum->nilai_kkm ?? null,
                                    'status_mata_pelajaran' => $kurikulum->status_mata_pelajaran ?? null,
                                    'tahun_akademik_id' => $kurikulum->tahunAkademik->id ?? null,
                                    'tahun_akademik' => $kurikulum->tahunAkademik->tahun_akademik ?? null,
                                    'status_tahun_akademik' => $kurikulum->tahunAkademik->status ?? null,
                                    'semester' => $kurikulum->tahunAkademik->semester ?? null,
                                    'status_semester' => $kurikulum->tahunAkademik->status ?? null,
                                ],

                                'peserta' => $jadwal->siswas->map(function ($siswa) {
                                    return [
                                        'siswa_id'   => $siswa->id,
                                        'nama_siswa' => $siswa->nama,
                                        'jurusan_siswa' => $siswa->jurusan->nama_jurusan ?? null,
                                        'kelas_siswa_id' => $siswa->kelas->id ?? null,
                                        'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
                                        'siswa_jadwal_pelajaran_id' => $siswa->pivot->id ?? null,
                                        'status_aktif' => $siswa->pivot->status ?? null,
                                    ];
                                })->values(),
                            ];
                        })->values(),
                    ];
                })->values(),
        ];

        return ApiResponse::success(
            $result,
            'Semua jadwal anda berhasil diambil'
        );
    }

    /**
     * ✅ Untuk spa
     */
    public function update(Request $request, $id)
    {
        $matpel = JadwalPelajaran::find($id);

        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            // ⚠️ Ini inputannya untuk update @Ryan
            'kurikulum_mata_pelajaran_id' => 'sometimes|required|exists:kurikulum_mata_pelajaran,id',
            'hari' => 'sometimes|required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'guru_id' => 'sometimes|required|exists:kepegawaians,id',
            'kelas_id' => 'sometimes|required|exists:kelas,id',
            'jam_mulai' => 'sometimes|required|time',
            'jam_selesai' => 'sometimes|required|time',
            'ruangan' => 'sometimes|nullable',
            'link_opsional' => 'sometimes|nullable',
        ],[
            'jurusan_pelajaran_id.exists' => 'Jurusan tidak ditemukan',
            'hari.required' => 'Hari wajib diisi',
            'hari.in' => 'Pilihan hanya Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu',
            'kelas_id.required' => 'Kelas wajib diisi',
            'kelas_id.exists' => 'Kelas tidak ditemukan',
            'jam_mulai.required' => 'Jam mulai wajib diisi',
            'jam_mulai.time' => 'Format jam mulai tidak valid',
            'jam_selesai.required' => 'Jam selesai wajib diisi',
            'jam_selesai.time' => 'Format jam selesai tidak valid',
        ]);


        // pelajaran harus sama dan tidak boleh berbeda
        // get mata_pelajaran_id di kurikulumMataPelajaran
        $existingMapel = KurikulumMataPelajaran::with('mataPelajaran')->where('id', $validated['kurikulum_mata_pelajaran_id'])->first();

        // get jadwal_pelajaran
        $existing = JadwalPelajaran::with('kurikulumMataPelajaran')->where('guru_id', $validated['guru_id'])->first();

       // jika mata_pelajaran_id pada existing != dengan mata_pelajaran_id pada existingMapel, tidak boleh
        if ($existing) {
            if ($existing->kurikulumMataPelajaran->mata_pelajaran_id != $existingMapel->mata_pelajaran_id) {
                return ApiResponse::error('Not allowed', [
                    'pesan' => ['Satu guru hanya boleh satu mata pelajaran']
                ], 422);
            }
        }

        $bentrok = JadwalPelajaran::where('guru_id', $matpel->guru_id)
        // ->where('kurikulum_mata_pelajaran_id', $validated['kurikulum_mata_pelajaran_id'])
        ->where('hari', $validated['hari'])
        ->where('jam_mulai', $validated['jam_mulai'])
        ->where('jam_selesai', $validated['jam_selesai'])
        ->first();
        if ($bentrok) {
                return ApiResponse::error('Not allowed', [
                    'pesan' => ['Hari dan jam sekian sudah ada sehingga bentrok']
                ], 422);
        }

       // guru_id dan mata_pelajaran_id tidak boleh diupdate (karna harus sama)
        $matpel->update([        
            'kurikulum_mata_pelajaran_id' => $validated['kurikulum_mata_pelajaran_id'] ?? null,
            'hari' => $validated['hari'] ?? null,
            'guru_id' => $validated['guru_id'] ?? null,
            'kelas_id' => $validated['kelas_id'] ?? null,
            'jam_mulai' => $validated['jam_mulai'] ?? null,
            'jam_selesai' => $validated['jam_selesai'] ?? null,
            'ruangan' => $validated['ruangan'] ?? null,
            'link_opsional' => $validated['link_opsional'] ?? null,
        ]);

        $matpel->load(['kurikulumMataPelajaran.mataPelajaran', 'guru', 'kelas', 'tahunAkademik', 'jurusan', 'jurusanPelajaran', 'siswas']);
            
        return ApiResponse::success([
            'id' => $matpel->id ?? null,
            'kurikulum_mata_pelajaran' => $matpel->kurikulumMataPelajaran->id ?? null,
            'nama_mata_pelajaran' => $matpel->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
            'hari' => $matpel->hari ?? null,
            'guru' => $matpel->guru->nama ?? null,
            'kelas' => $matpel->kelas->nama_kelas ?? null,
            'jam_mulai' => $matpel->jam_mulai ?? null,
            'jam_selesai' => $matpel->jam_selesai ?? null,
            'ruangan' => $matpel->ruangan ?? null,
            'link_opsional' => $matpel->link_opsional ?? null,
        ], 'Jadwal Pelajaran Berhasil Diperbarui');
    }

    /**
     * ✅ Untuk SPA
     */
    public function destroy($id)
    {
        $matpel = JadwalPelajaran::find($id);
        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $matpel->delete();
        return ApiResponse::success(null, 'Jadwal pelajaran berhasil dihapus');
    }
}
