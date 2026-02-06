<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Models\JadwalPelajaran;
use App\Models\Kepegawaian;
use App\Models\Rombel;
use App\Models\Ruangan;
use App\Models\KurikulumMataPelajaran;
use App\Models\TahunAkademik;
use App\Models\Semester;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\QueryException;

class JadwalPelajaranController extends Controller
{
    /**
     * ✅ Untuk SPA
     */   
    public function index()
    {
        $jadwal = JadwalPelajaran::with([
            'guru',
            'tahunAkademik',
            'semester',
            'rombel.jurusan',
            'ruangan',
            'kurikulumMataPelajaran.mataPelajaran',
            'kurikulumMataPelajaran.kurikulum',
        ])->get();

        if ($jadwal->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Jadwal tidak ditemukan'
            ], 404);
        }

        $grouped = $jadwal
            // ===============================
            // 1️⃣ GROUP BY TAHUN AKADEMIK
            // ===============================
            ->groupBy('tahun_akademik_id')
            ->map(function ($byTahun) {

                $tahun = $byTahun->first()->tahunAkademik;

                return [
                    'tahun_akademik_id' => $tahun->id,
                    'tahun_akademik' => $tahun->tahun_akademik,

                    // ===============================
                    // 2️⃣ GROUP BY SEMESTER
                    // ===============================
                    'semesters' => $byTahun
                        ->groupBy('semester_id')
                        ->map(function ($bySemester) {

                            $semester = $bySemester->first()->semester;

                            return [
                                'semester_id' => $semester->id,
                                'semester' => $semester->semester,

                                // ===============================
                                // 3️⃣ GROUP BY GURU
                                // ===============================
                                'gurus' => $bySemester
                                    ->groupBy('guru_id')
                                    ->map(function ($byGuru) {

                                        $guru = $byGuru->first()->guru;

                                        return [
                                            'guru_id' => $guru->id,
                                            'guru' => $guru->nama,

                                            // ===============================
                                            // 4️⃣ LIST JADWAL
                                            // ===============================
                                            'jadwals' => $byGuru
                                                ->map(function ($j) {
                                                    return [
                                                        'jadwal_pelajaran_id' => $j->id,
                                                        'mata_pelajaran' =>
                                                            $j->kurikulumMataPelajaran
                                                                ->mataPelajaran
                                                                ->nama_pelajaran ?? null,
                                                        'hari' => $j->hari,
                                                        'jam_mulai' => $j->jam_mulai,
                                                        'jam_selesai' => $j->jam_selesai,
                                                        'rombel' => $j->rombel->nama_rombel ?? null,
                                                        'jurusan' => $j->rombel->jurusan->nama_jurusan ?? null,
                                                        'ruangan' => optional($j->ruangan)->nama_ruangan,
                                                        'link_opsional' => $j->link_opsional,
                                                    ];
                                                })
                                                ->values(),
                                        ];
                                    })
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return ApiResponse::success($grouped, 'Data jadwal berhasil dimuat');
    }

    

    /**
     * ✅ Untuk SPA
     */   
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'kurikulum_mata_pelajaran_id' => 'required|exists:kurikulum_mata_pelajaran,id',
                'hari' => 'required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
                'guru_id' => 'required|exists:kepegawaians,id',
                'rombel_id' => 'required|exists:rombels,id',
                'jam_mulai' => 'required|date_format:H:i',
                'jam_selesai' => 'required|date_format:H:i|after:jam_mulai',
                'ruangan_id' => 'nullable|exists:ruangan,id',
                'link_opsional' => 'nullable|string|max:255'
            ]);

            // ===============================
            // Tahun Akademik Aktif
            // ===============================
            $tahunAktif = TahunAkademik::where('status', 'aktif')->first();
            if (!$tahunAktif) {
                return ApiResponse::error('Not found', [
                    'data' => 'Belum ada tahun akademik aktif'
                ]);
            }

            // ===============================
            // Semester Aktif
            // ===============================
            $semesterAktif = Semester::where('status', 'aktif')
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->first();

            if (!$semesterAktif) {
                return ApiResponse::error('Not found', [
                    'data' => 'Belum ada semester aktif'
                ]);
            }

            // ===============================
            // Bentrok Jadwal GURU
            // ===============================
            $bentrokGuru = JadwalPelajaran::where('guru_id', $validated['guru_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->where('semester_id', $semesterAktif->id)
                ->where('hari', $validated['hari'])
                ->where(function ($q) use ($validated) {
                    $q->where('jam_mulai', '<', $validated['jam_selesai'])
                    ->where('jam_selesai', '>', $validated['jam_mulai']);
                })
                ->exists();

            if ($bentrokGuru) {
                return ApiResponse::error('Bentrok', [
                    'guru' => ['Guru sudah memiliki jadwal di jam tersebut']
                ], 422);
            }

            // ===============================
            // Bentrok Jadwal ROMBEL
            // ===============================
            $bentrokRombel = JadwalPelajaran::where('rombel_id', $validated['rombel_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->where('semester_id', $semesterAktif->id)
                ->where('hari', $validated['hari'])
                ->where(function ($q) use ($validated) {
                    $q->where('jam_mulai', '<', $validated['jam_selesai'])
                    ->where('jam_selesai', '>', $validated['jam_mulai']);
                })
                ->exists();

            if ($bentrokRombel) {
                return ApiResponse::error('Bentrok', [
                    'rombel' => ['Rombel sudah memiliki jadwal di jam tersebut']
                ], 422);
            }

            // ===============================
            // Simpan Jadwal
            // ===============================
            $jadwal = JadwalPelajaran::create([
                'kurikulum_mata_pelajaran_id' => $validated['kurikulum_mata_pelajaran_id'],
                'tahun_akademik_id' => $tahunAktif->id,
                'semester_id' => $semesterAktif->id,
                'hari' => $validated['hari'],
                'guru_id' => $validated['guru_id'],
                'rombel_id' => $validated['rombel_id'],
                'jam_mulai' => $validated['jam_mulai'],
                'jam_selesai' => $validated['jam_selesai'],
                'ruangan_id' => $validated['ruangan_id'] ?? null,
                'link_opsional' => $validated['link_opsional'] ?? null,
            ]);

            $jadwal->load([
                'kurikulumMataPelajaran.mataPelajaran',
                'tahunAkademik',
                'semester',
                'rombel',
                'guru',
                'ruangan'
            ]);

            return ApiResponse::success([
                'id' => $jadwal->id,
                'mata_pelajaran' => $jadwal->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
                'tahun_akademik' => $jadwal->tahunAkademik->tahun_akademik,
                'semester' => $jadwal->semester->semester,
                'hari' => $jadwal->hari,
                'guru' => $jadwal->guru->nama,
                'rombel' => $jadwal->rombel->nama_rombel,
                'jam_mulai' => $jadwal->jam_mulai,
                'jam_selesai' => $jadwal->jam_selesai,
                'ruangan' => optional($jadwal->ruangan)->nama_ruangan,
                'link_opsional' => $jadwal->link_opsional,
            ], 'Jadwal pelajaran berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);

        } catch (QueryException $e) {
            return ApiResponse::error('Bentrok data', [
                'database' => 'Jadwal sudah ada (duplikat)'
            ], 409);
        }
    }



    /**
     * ✅ guru dan spa
     */
    public function show(string $id)
    {
        $jadwal = JadwalPelajaran::with([
            'guru',
            'tahunAkademik',
            'semester',
            'kurikulumMataPelajaran.mataPelajaran',
            'rombel.jurusan',
            'rombel.kelas',
            'ruangan'
        ])
        ->where('guru_id', $id)
        ->get();
    
        if ($jadwal->isEmpty()) {
            return ApiResponse::error(
                'Jadwal pelajaran tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }
    
        $formatted = $jadwal
            ->filter(fn ($j) => $j->guru)
            ->groupBy('guru_id')
            ->map(function ($groupByGuru) {
    
                $guru = $groupByGuru->first()->guru;
    
                return [
                    'guru_id' => $guru->id,
                    'nama'    => $guru->nama,
                    'nip'     => $guru->nip ?? null,
                    'nuptk'   => $guru->nuptk ?? null,
    
                    'periode' => $groupByGuru
                        ->groupBy('tahun_akademik_id')
                        ->map(function ($groupByTA) {
    
                            $tahun = $groupByTA->first()->tahunAkademik;
    
                            return [
                                'tahun_akademik_id' => $tahun?->id,
                                'tahun_akademik'    => $tahun?->tahun_akademik,
                                'status_tahun'      => $tahun?->status,
    
                                'semesters' => $groupByTA
                                    ->groupBy('semester_id')
                                    ->map(function ($groupBySemester) {
    
                                        $semester = $groupBySemester->first()->semester;
    
                                        return [
                                            'semester_id'     => $semester?->id,
                                            'semester'        => $semester?->semester,
                                            'status_semester' => $semester?->status,
    
                                            'jadwal_pelajarans' => $groupBySemester
                                                ->map(function ($jadwal) {
    
                                                    return [
                                                        'jadwal_pelajaran_id' => $jadwal->id,
                                                        'mata_pelajaran'      => $jadwal->kurikulumMataPelajaran
                                                                                    ?->mataPelajaran
                                                                                    ?->nama_pelajaran,
    
                                                        'hari'        => $jadwal->hari,
                                                        'rombel'      => $jadwal->rombel?->nama_rombel,
                                                        'jurusan'     => $jadwal->rombel?->jurusan?->nama_jurusan,
                                                        'tingkat'     => $jadwal->rombel?->kelas?->tingkat,
    
                                                        'jam_mulai'   => $jadwal->jam_mulai,
                                                        'jam_selesai' => $jadwal->jam_selesai,
    
                                                        'ruangan'     => $jadwal->ruangan?->nama_ruangan,
                                                        'link_opsional' => $jadwal->link_opsional,
                                                    ];
                                                })
                                                ->values(),
                                        ];
                                    })
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();
    
        return ApiResponse::success(
            $formatted,
            'Detail jadwal pelajaran berhasil diambil'
        );
    }
    

    // ✅ guru (hanya tahun dan semester aktif saja)
    public function getAllJadwalSendiri()
    {
        $pegawai = Auth::guard('kepegawaian')->user();
    
        $guru = Kepegawaian::with([
            'jadwalPelajarans' => function ($q) {
                $q->whereHas('semester', function ($q) {
                    $q->where('status', 'aktif');
                })
                ->whereHas('kurikulumMataPelajaran.tahunAkademik', function ($q) {
                    $q->where('status', 'aktif');
                });
            },
            'jadwalPelajarans.semester',
            'jadwalPelajarans.rombel',
            'jadwalPelajarans.ruangan',
            'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
            'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
        ])->find($pegawai->id);
    
        if (!$guru) {
            return ApiResponse::error(
                'Guru tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }
    
        $jadwals = $guru->jadwalPelajarans;
    
        if ($jadwals->isEmpty()) {
            return ApiResponse::error(
                'Jadwal kosong',
                ['data' => 'Anda belum memiliki jadwal mengajar']
            );
        }
    
        $urutanHari = [
            'Senin' => 1,
            'Selasa' => 2,
            'Rabu' => 3,
            'Kamis' => 4,
            'Jumat' => 5,
            'Sabtu' => 6,
            'Minggu' => 7,
        ];
    
        $result = $jadwals
            ->groupBy(fn ($j) => $j->kurikulumMataPelajaran->tahun_akademik_id)
            ->map(function ($byTahun) use ($urutanHari) {
    
                $ta = $byTahun->first()->kurikulumMataPelajaran->tahunAkademik;
    
                return [
                    'tahun_akademik_id' => $ta->id,
                    'tahun_akademik' => $ta->tahun_akademik,
    
                    'semesters' => $byTahun
                        ->groupBy('semester_id')
                        ->map(function ($bySemester) use ($urutanHari) {
    
                            $semester = $bySemester->first()->semester;
    
                            return [
                                'semester_id' => $semester->id,
                                'semester' => $semester->semester,
    
                                'jadwal_pelajaran' => $bySemester
                                    ->sortBy(
                                        fn ($j) => $urutanHari[$j->hari],
                                        SORT_NUMERIC
                                    )
                                ->values()
                                    ->map(function ($j) {
                                        return [
                                            'id' => $j->id,
                                            'hari' => $j->hari,
                                            'jam_mulai' => $j->jam_mulai,
                                            'jam_selesai' => $j->jam_selesai,
    
                                            'nama_pelajaran' =>
                                                $j->kurikulumMataPelajaran
                                                    ->mataPelajaran
                                                    ->nama_pelajaran,
    
                                            'jurusan_pelajaran' => $j->kurikulumMataPelajaran
                                            ->jurusan
                                            ->nama_jurusan ?? null,                                                
    
                                            'rombel' => $j->rombel->nama_rombel,
                                            'ruangan' => $j->ruangan->nama_ruangan,
                                            'link_opsional' => $j->link_opsional,
                                        ];
                                    })
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();
    
        return ApiResponse::success(
            $result,
            'Jadwal pelajaran aktif berhasil diambil'
        );
    }        

    /**
     * ✅ Untuk spa
     */
    public function update(Request $request, $id)
    {
        $jadwal = JadwalPelajaran::with([
            'tahunAkademik',
            'semester',
            'kurikulumMataPelajaran.mataPelajaran',
            'guru',
            'rombel',
            'ruangan',
        ])->find($id);

        if (!$jadwal) {
            return ApiResponse::error(
                'Jadwal pelajaran tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        // ❌ Tidak boleh update jika semester arsip
        if (!$jadwal->semester || $jadwal->semester->status === 'arsip') {
            return ApiResponse::error(
                'Not supported',
                ['data' => ['Jadwal pelajaran sudah berstatus arsip']],
                422
            );
        }

        $validated = $request->validate([
            'kurikulum_mata_pelajaran_id' => 'sometimes|required|exists:kurikulum_mata_pelajaran,id',
            'hari' => 'sometimes|required|in:Senin,Selasa,Rabu,Kamis,Jumat,Sabtu,Minggu',
            'guru_id' => 'sometimes|required|exists:kepegawaians,id',
            'rombel_id' => 'sometimes|required|exists:rombels,id',
            'jam_mulai' => 'sometimes|required|date_format:H:i',
            'jam_selesai' => 'sometimes|required|date_format:H:i|after:jam_mulai',
            'ruangan_id' => 'nullable|exists:ruangan,id',
            'link_opsional' => 'nullable|string|max:255',
        ]);

        // ===============================
        // DATA FINAL (MERGE)
        // ===============================
        $data = [
            'kurikulum_mata_pelajaran_id' =>
                $validated['kurikulum_mata_pelajaran_id'] ?? $jadwal->kurikulum_mata_pelajaran_id,

            'tahun_akademik_id' => $jadwal->tahun_akademik_id, // 🔒 tidak boleh berubah
            'semester_id'       => $jadwal->semester_id,       // 🔒 tidak boleh berubah

            'hari'        => $validated['hari'] ?? $jadwal->hari,
            'guru_id'     => $validated['guru_id'] ?? $jadwal->guru_id,
            'rombel_id'   => $validated['rombel_id'] ?? $jadwal->rombel_id,
            'jam_mulai'   => $validated['jam_mulai'] ?? $jadwal->jam_mulai,
            'jam_selesai' => $validated['jam_selesai'] ?? $jadwal->jam_selesai,
            'ruangan_id'  => $validated['ruangan_id'] ?? $jadwal->ruangan_id,
            'link_opsional' => $validated['link_opsional'] ?? $jadwal->link_opsional,
        ];

        // ===============================
        // 1️⃣ Bentrok waktu GURU (OVERLAP BENAR)
        // ===============================
        $bentrokGuru = JadwalPelajaran::where('guru_id', $data['guru_id'])
            ->where('tahun_akademik_id', $data['tahun_akademik_id'])
            ->where('semester_id', $data['semester_id'])
            ->where('hari', $data['hari'])
            ->where('id', '!=', $jadwal->id)
            ->where(function ($q) use ($data) {
                $q->where('jam_mulai', '<', $data['jam_selesai'])
                ->where('jam_selesai', '>', $data['jam_mulai']);
            })
            ->exists();

        if ($bentrokGuru) {
            return ApiResponse::error('Bentrok', [
                'guru' => ['Guru sudah memiliki jadwal pada jam tersebut']
            ], 422);
        }

        // ===============================
        // 2️⃣ Bentrok waktu ROMBEL
        // ===============================
        $bentrokRombel = JadwalPelajaran::where('rombel_id', $data['rombel_id'])
            ->where('tahun_akademik_id', $data['tahun_akademik_id'])
            ->where('semester_id', $data['semester_id'])
            ->where('hari', $data['hari'])
            ->where('id', '!=', $jadwal->id)
            ->where(function ($q) use ($data) {
                $q->where('jam_mulai', '<', $data['jam_selesai'])
                ->where('jam_selesai', '>', $data['jam_mulai']);
            })
            ->exists();

        if ($bentrokRombel) {
            return ApiResponse::error('Bentrok', [
                'rombel' => ['Rombel sudah memiliki jadwal pada jam tersebut']
            ], 422);
        }

        // ===============================
        // 3️⃣ Duplikasi jadwal (SESUAI UNIQUE INDEX)
        // ===============================
        $duplikasi = JadwalPelajaran::where([
            'kurikulum_mata_pelajaran_id' => $data['kurikulum_mata_pelajaran_id'],
            'rombel_id' => $data['rombel_id'],
            'tahun_akademik_id' => $data['tahun_akademik_id'],
            'semester_id' => $data['semester_id'],
            'hari' => $data['hari'],
            'jam_mulai' => $data['jam_mulai'],
            'jam_selesai' => $data['jam_selesai'],
        ])
        ->where('id', '!=', $jadwal->id)
        ->exists();

        if ($duplikasi) {
            return ApiResponse::error('Duplikasi', [
                'jadwal' => ['Jadwal sudah ada']
            ], 422);
        }

        // ===============================
        // UPDATE
        // ===============================
        $jadwal->update($data);

        $jadwal->load([
            'tahunAkademik',
            'semester',
            'kurikulumMataPelajaran.mataPelajaran',
            'guru',
            'rombel',
            'ruangan',
        ]);

        return ApiResponse::success([
            'id' => $jadwal->id,
            'mata_pelajaran' =>
                $jadwal->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'tahun_akademik' =>
                $jadwal->tahunAkademik->tahun_akademik,
            'semester' =>
                $jadwal->semester->semester,
            'hari' => $jadwal->hari,
            'guru' => $jadwal->guru->nama,
            'rombel' => $jadwal->rombel->nama_rombel,
            'jam_mulai' => $jadwal->jam_mulai,
            'jam_selesai' => $jadwal->jam_selesai,
            'ruangan' => optional($jadwal->ruangan)->nama_ruangan,
            'link_opsional' => $jadwal->link_opsional,
        ], 'Jadwal pelajaran berhasil diperbarui');
    }



    /**
     * ✅ Untuk SPA
     */
    public function destroy($id)
    {
        $jadwal = JadwalPelajaran::with([
            'tahunAkademik',
            'semester'
        ])->find($id);

        if (! $jadwal) {
            return ApiResponse::error(
                'Jadwal pelajaran tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        // (Opsional tapi direkomendasikan) Tahun akademik harus aktif
        $tahunAkademik = $jadwal->tahunAkademik ?? null;

        if ($tahunAkademik && $tahunAkademik->status !== 'aktif') {
            return ApiResponse::error(
                'Tidak valid',
                ['tahun_akademik' => 'Jadwal hanya dapat dihapus pada tahun akademik aktif'],
                422
            );
        }

        if ($jadwal->semester->status == 'arsip') {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['arsip' => 'Hanya dapat dihapus saat semester masih aktif'],
                403
            );
        }

        // Tidak boleh hapus jika sudah ada absensi
        if ($jadwal->absensiPelajaran()->exists()) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['jadwal' => 'Jadwal sudah memiliki data absensi dan tidak dapat dihapus'],
                403
            );
        }                

        // Aman untuk dihapus
        $jadwal->delete();

        return ApiResponse::success(
            null,
            'Jadwal pelajaran berhasil dihapus'
        );
    }


    // Data untuk select
    public function dataUntukSelect()
    {
        // kurmap
        $data = KurikulumMataPelajaran::with([
                'kurikulum',
                'mataPelajaran',                
            ])            
            ->where('status', 'aktif')
            ->get();

        if ($data->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Belum ada kurikulum mata pelajaran aktif']
            );
        }

        $kurmap = $data->map(function ($item) {
            return [
                'kurikulum_mata_pelajaran_id' => $item->id ?? null,
                'kurikulum' => $item->kurikulum->tipe ?? null,                
                'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran,                
                'tingkat' => $item->tingkat,
                'status_mata_pelajaran' => $item->status_mata_pelajaran,
            ];
        });

        
        // guru
        $data3 = Kepegawaian::where('role', 'guru')
        ->where('status', 'aktif')
        ->get();

        if ($data3->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Belum ada guru aktif']
            );
        }     

        $guru = $data3->map(function ($g) {
            return [
                'guru_id' => $g->id,
                'nama_guru' => $g->nama,
                'nip' => $g->nip ?? null,
                'nuptk' => $g->nuptk ?? null,
            ];
        });


        // rombel
        $data4 = Rombel::with('kelas', 'jurusan')
        ->where('status', 'aktif')
        ->get();

        if ($data4->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Belum ada rombel aktif']
            );
        }    

        $rombel = $data4->map(function ($r) {
            return [
                'rombel_id'     => $r->id ?? null,
                'nama_rombel'   => $r->nama_rombel ?? null,
                'jurusan'       => $r->jurusan->nama_jurusan ?? null,
                'kelas'         => $r->kelas->nama_kelas ?? null,
                'tingkat'       => $r->kelas->tingkat ?? null,
            ];
        });


        // ruangan
        $data5 = Ruangan::where('status', 'aktif')->get();

        if ($data5->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Belum ada ruangan aktif']
            );
        }    

        $ruangan = $data5->map(function ($ruang) {
            return [
                'ruangan_id' => $ruang->id,
                'nama_ruangan' => $ruang->nama_ruangan,
                'kode_ruangan' => $ruang->kode_ruangan,
                'jenis_ruangan' => $ruang->jenis_ruangan ?? null,
            ];
        });

        return ApiResponse::success(
            [
                'kurikulum_mata_pelajaran' => $kurmap,
                'guru' => $guru,
                'rombel' => $rombel,
                'ruangan' => $ruangan,
            ],
            'Data select berhasil diambil'
        );
    }
    // Data untuk select
}
