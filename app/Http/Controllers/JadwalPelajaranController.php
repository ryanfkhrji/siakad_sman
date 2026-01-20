<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Models\JadwalPelajaran;
use App\Models\Kepegawaian;
use App\Models\Rombel;
use App\Models\Ruangan;
use App\Models\KurikulumMataPelajaran;
use App\Models\Semester;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class JadwalPelajaranController extends Controller
{
    /**
     * ✅ Untuk SPA
     * tahun_akademik
     *      semester
     *          guru
     *             jadwal
     */
    public function index()
    {
        $jadwal = JadwalPelajaran::with([
            'guru',
            'semester',
            'rombel',
            'ruangan',
            'kurikulumMataPelajaran.kurikulum',
            'kurikulumMataPelajaran.mataPelajaran',
            'kurikulumMataPelajaran.jurusan',
            'kurikulumMataPelajaran.tahunAkademik',
        ])->get();

        if ($jadwal->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Jadwal tidak ditemukan'
            ], 404);
        }

        $grouped = $jadwal
            // 1️⃣ GROUP BY TAHUN AKADEMIK
            ->groupBy(fn ($item) =>
                $item->kurikulumMataPelajaran->tahun_akademik_id
            )
            ->map(function ($byTahun) {

                $tahunAkademik = $byTahun->first()
                    ->kurikulumMataPelajaran
                    ->tahunAkademik;

                return [
                    'tahun_akademik_id' => $tahunAkademik->id,
                    'tahun_akademik' => $tahunAkademik->tahun_akademik,

                    // 2️⃣ GROUP BY SEMESTER
                    'semesters' => $byTahun
                        ->groupBy('semester_id')
                        ->map(function ($bySemester) {

                            $semester = $bySemester->first()->semester;

                            return [
                                'semester_id' => $semester->id,
                                'semester' => $semester->semester,

                                // 3️⃣ GROUP BY GURU
                                'gurus' => $bySemester
                                    ->groupBy('guru_id')
                                    ->map(function ($byGuru) {

                                        $guru = $byGuru->first()->guru;

                                        return [
                                            'guru_id' => $guru->id,
                                            'guru' => $guru->nama,

                                            // 4️⃣ LIST JADWAL
                                            'jadwals' => $byGuru->map(function ($j) {
                                                return [
                                                    'id' => $j->id,
                                                    'hari' => $j->hari,
                                                    'jam_mulai' => $j->jam_mulai,
                                                    'jam_selesai' => $j->jam_selesai,
                                                    'rombel' => $j->rombel->nama_rombel ?? null,
                                                    'mata_pelajaran' =>
                                                        $j->kurikulumMataPelajaran
                                                            ->mataPelajaran
                                                            ->nama_pelajaran ?? null,
                                                    'ruangan' => $j->ruangan->nama_ruangan,
                                                    'link_opsional' => $j->link_opsional ?? null,
                                                ];
                                            })->values(),
                                        ];
                                    })->values(),
                            ];
                        })->values(),
                ];
            })->values();

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
                'link_opsional' => 'nullable'
            ], [
                'kurikulum_mata_pelajaran_id.required' => 'Kurikulum mata pelajaran wajib diisi',
                'kurikulum_mata_pelajaran_id.exists' => 'Kurikulum mata pelajaran tidak ditemukan',                                
                'hari.required' => 'Hari wajib diisi',
                'hari.in' => 'Pilihan hanya Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu',
                'guru_id.required' => 'Guru wajib diisi',
                'guru_id.exists' => 'Guru tidak ditemukan',
                'rombel_id.required' => 'Rombel wajib diisi',
                'rombel_id.exists' => 'Rombel tidak ditemukan',
                'jam_mulai.required' => 'Jam mulai wajib diisi',
                'jam_mulai.date_format' => 'Format jam mulai salah',
                'jam_selesai.required' => 'Jam selesai wajib diisi',
                'jam_selesai.date_format' => 'Format jam selesai salah',
                'jam_selesai.after' => 'Jam selesai harus lebih besar dari jam mulai',
                'ruangan_id.exists' => 'Ruangan tidak ditemukan',
            ]);

            // ===============================
            // 1. Validasi tahun akademik sama
            // ===============================
            // $semester = Semester::find($validated['semester_id']);
            
            // if ($kurmap->tahun_akademik_id !== $semester->tahun_akademik_id) {
                //     return ApiResponse::error('Not valid', ['semester' => 'Semester tidak sesuai dengan tahun akademik mata pelajaran']);
                // }
                
            // ambil semester aktif
            $semesterAktif = Semester::with('tahunAkademik')
            ->whereHas('tahunAkademik', function ($q) {
                $q->where('status', 'aktif');
            })
            ->where('status', 'aktif')
            ->first();

            if (!$semesterAktif) {
                return ApiResponse::error( 'Data kosong', ['data' => 'Belum ada semester aktif pada tahun ini'] );
            }               


            // ===============================
            // 2. Guru hanya boleh 1 mapel per TA
            // ===============================
            $kurmap = KurikulumMataPelajaran::find($validated['kurikulum_mata_pelajaran_id']);

            $existingMapelGuru = JadwalPelajaran::where('guru_id', $validated['guru_id'])
                ->whereHas('kurikulumMataPelajaran', function ($q) use ($kurmap) {
                    $q->where('tahun_akademik_id', $kurmap->tahun_akademik_id);
                })
                ->with('kurikulumMataPelajaran')
                ->first();

            if (
                $existingMapelGuru &&
                $existingMapelGuru->kurikulumMataPelajaran->mata_pelajaran_id
                    !== $kurmap->mata_pelajaran_id
            ) {
                return ApiResponse::error('Not allowed', [
                    'guru' => ['Satu guru hanya boleh mengajar satu mata pelajaran dalam satu tahun akademik']
                ], 422);
            }

            // ===============================
            // 3. Bentrok jadwal GURU (OVERLAP)
            // ===============================
            $bentrokGuru = JadwalPelajaran::where('guru_id', $validated['guru_id'])
                ->where('hari', $validated['hari'])
                ->where(function ($q) use ($validated) {
                    $q->where('jam_mulai', '<', $validated['jam_selesai'])
                    ->where('jam_selesai', '>', $validated['jam_mulai']);
                })
                ->exists();

            if ($bentrokGuru) {
                return ApiResponse::error('Bentrok', [
                    'jam' => ['Guru sudah memiliki jadwal pada jam tersebut']
                ], 422);
            }

            // ===============================
            // 4. Bentrok jadwal ROMBEL
            // ===============================
            $bentrokRombel = JadwalPelajaran::where('rombel_id', $validated['rombel_id'])
                ->where('semester_id', $semesterAktif->id)
                ->where('hari', $validated['hari'])
                ->where(function ($q) use ($validated) {
                    $q->where('jam_mulai', '<', $validated['jam_selesai'])
                    ->where('jam_selesai', '>', $validated['jam_mulai']);
                })
                ->exists();

            if ($bentrokRombel) {
                return ApiResponse::error('Bentrok', [
                    'rombel' => ['Rombel sudah memiliki jadwal pada jam tersebut']
                ], 422);
            }

            // ===============================
            // 5. Simpan
            // ===============================
            $jadwal = JadwalPelajaran::create([
                'kurikulum_mata_pelajaran_id' => $validated['kurikulum_mata_pelajaran_id'],
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
                'semester',
                'rombel',
                'guru',
                'ruangan'
            ]);

            return ApiResponse::success([
                'id' => $jadwal->id,
                'mata_pelajaran' => $jadwal->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
                'semester' => $jadwal->semester->semester,
                'hari' => $jadwal->hari,
                'guru' => $jadwal->guru->nama,
                'rombel' => $jadwal->rombel->nama_rombel,
                'jam_mulai' => $jadwal->jam_mulai,
                'jam_selesai' => $jadwal->jam_selesai,
                'ruangan' => $jadwal->ruangan->nama_ruangan ?? null,
                'link_opsional' => $jadwal->link_opsional ?? null,
            ], 'Jadwal pelajaran berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    /**
     * ✅ guru dan spa
     */
    public function show(string $id)
    {
        $jadwal = JadwalPelajaran::with([
            'kurikulumMataPelajaran.mataPelajaran',
            'kurikulumMataPelajaran.tahunAkademik',
            'semester',
            'guru',
            'rombel',
            'ruangan'
        ])->find($id);

        if (!$jadwal) {
            return ApiResponse::error(
                'Jadwal pelajaran tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $formatted = [
            'mata_pelajaran' => $jadwal->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'tahun_akademik' => $jadwal->kurikulumMataPelajaran->tahunAkademik->tahun_akademik,
            'status_tahun_akademik' => $jadwal->kurikulumMataPelajaran->tahunAkademik->status,
            'semester' => $jadwal->semester->semester,
            'guru' => $jadwal->guru->nama,
            'hari' => $jadwal->hari,
            'rombel' => $jadwal->rombel->nama_rombel,
            'jam_mulai' => $jadwal->jam_mulai,
            'jam_selesai' => $jadwal->jam_selesai,
            'ruangan' => $jadwal->ruangan->nama_ruangan,
            'link_opsional' => $jadwal->link_opsional,            
        ];

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
            'semester',
            'kurikulumMataPelajaran.mataPelajaran',
            'kurikulumMataPelajaran.tahunAkademik',
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
        
        if (!$jadwal->semester || $jadwal->semester->status === 'arsip') {
            return ApiResponse::error(
                'Not supported',
                ['data' => ['Jadwal pelajaran sudah berstatus arsip']],
                404
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
            'link_opsional' => 'nullable|string',
        ]);

        // 🔑 DATA FINAL (gabungan lama + input baru)
        $data = [
            'kurikulum_mata_pelajaran_id' => $validated['kurikulum_mata_pelajaran_id'] ?? $jadwal->kurikulum_mata_pelajaran_id,
            'semester_id' => $jadwal->semester_id,
            'hari' => $validated['hari'] ?? $jadwal->hari,
            'guru_id' => $validated['guru_id'] ?? $jadwal->guru_id,
            'rombel_id' => $validated['rombel_id'] ?? $jadwal->rombel_id,
            'jam_mulai' => $validated['jam_mulai'] ?? $jadwal->jam_mulai,
            'jam_selesai' => $validated['jam_selesai'] ?? $jadwal->jam_selesai,
            'ruangan_id' => $validated['ruangan_id'] ?? $jadwal->ruangan_id,
            'link_opsional' => $validated['link_opsional'] ?? $jadwal->link_opsional,
        ];

        // ===============================
        // 1. Guru hanya boleh 1 mapel per TA
        // ===============================
        $kurmap = KurikulumMataPelajaran::find($validated['kurikulum_mata_pelajaran_id']);

        $existingMapelGuru = JadwalPelajaran::where('guru_id', $validated['guru_id'])
            ->whereHas('kurikulumMataPelajaran', function ($q) use ($kurmap) {
                $q->where('tahun_akademik_id', $kurmap->tahun_akademik_id);
            })
            ->with('kurikulumMataPelajaran')
            ->first();

        if (
            $existingMapelGuru &&
            $existingMapelGuru->kurikulumMataPelajaran->mata_pelajaran_id
                !== $kurmap->mata_pelajaran_id
        ) {
            return ApiResponse::error('Not allowed', [
                'guru' => ['Satu guru hanya boleh mengajar satu mata pelajaran dalam satu tahun akademik']
            ], 422);
        }

        // 2️⃣ Bentrok waktu guru
        $bentrokGuru = JadwalPelajaran::where('guru_id', $data['guru_id'])
            ->where('hari', $data['hari'])
            ->where('id', '!=', $jadwal->id)
            ->where(function ($q) use ($data) {
                $q->whereBetween('jam_mulai', [$data['jam_mulai'], $data['jam_selesai']])
                ->orWhereBetween('jam_selesai', [$data['jam_mulai'], $data['jam_selesai']]);
            })
            ->exists();

        if ($bentrokGuru) {
            return ApiResponse::error('Bentrok', [
                'pesan' => ['Guru memiliki jadwal bentrok pada waktu tersebut']
            ], 422);
        }

        // 3️⃣ Duplikasi jadwal (sesuai UNIQUE INDEX)
        $duplikasi = JadwalPelajaran::where([
            'kurikulum_mata_pelajaran_id' => $data['kurikulum_mata_pelajaran_id'],
            'rombel_id' => $data['rombel_id'],
            'semester_id' => $data['semester_id'],
            'hari' => $data['hari'],
            'jam_mulai' => $data['jam_mulai'],
            'jam_selesai' => $data['jam_selesai'],
        ])
        ->where('id', '!=', $jadwal->id)
        ->exists();

        if ($duplikasi) {
            return ApiResponse::error('Duplikasi', [
                'pesan' => ['Jadwal sudah ada']
            ], 422);
        }

        // ✅ UPDATE
        $jadwal->update($data);

        $jadwal->load([
            'kurikulumMataPelajaran.mataPelajaran',
            'kurikulumMataPelajaran.tahunAkademik',
            'semester',
            'guru',
            'rombel',
        ]);

        return ApiResponse::success([
            'id' => $jadwal->id,
            'mata_pelajaran' => $jadwal->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'tahun_akademik' => $jadwal->kurikulumMataPelajaran->tahunAkademik->tahun_akademik,
            'semester' => $jadwal->semester->semester,
            'hari' => $jadwal->hari,
            'guru' => $jadwal->guru->nama,
            'rombel' => $jadwal->rombel->nama_rombel,
            'jam_mulai' => $jadwal->jam_mulai,
            'jam_selesai' => $jadwal->jam_selesai,
            'ruangan' => $jadwal->ruangan->nama_ruangan,
            'link_opsional' => $jadwal->link_opsional,
        ], 'Jadwal Pelajaran berhasil diperbarui');
    }


    /**
     * ✅ Untuk SPA
     */
    public function destroy($id)
    {
        $jadwal = JadwalPelajaran::with([
            'absensiPelajaran',
            'semester'
        ])->find($id);

        if (! $jadwal) {
            return ApiResponse::error(
                'Jadwal pelajaran tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
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

        if ($jadwal->semester->status == 'arsip') {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['arsip' => 'Hanya dapat dihapus saat semester masih aktif'],
                403
            );
        }

        // (Opsional tapi direkomendasikan) Tahun akademik harus aktif
        $tahunAkademik = $jadwal->kurikulumMataPelajaran->tahunAkademik ?? null;

        if ($tahunAkademik && $tahunAkademik->status !== 'aktif') {
            return ApiResponse::error(
                'Tidak valid',
                ['tahun_akademik' => 'Jadwal hanya dapat dihapus pada tahun akademik aktif'],
                422
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
                'jurusan',
                'tahunAkademik',
            ])
            ->whereHas('tahunAkademik', function ($q) {
                $q->where('status', 'aktif');
            })
            ->orderBy('tahun_akademik_id')
            ->orderBy('tingkat')
            ->get();

        if ($data->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Tidak ada kurikulum mata pelajaran aktif']
            );
        }

        $kurmap = $data->map(function ($item) {
            return [
                'kurikulum_mata_pelajaran_id' => $item->id ?? null,
                'kurikulum' => $item->kurikulum->nama_kurikulum ?? null,
                'mata_pelajaran' => [
                    'id' => $item->mataPelajaran->id,
                    'nama' => $item->mataPelajaran->nama_pelajaran,
                ],

                'jurusan' => $item->jurusan
                    ? [
                        'id' => $item->jurusan->id,
                        'nama' => $item->jurusan->nama_jurusan,
                    ]
                    : null,

                'tahun_akademik' => [
                    'id' => $item->tahunAkademik->id,
                    'tahun' => $item->tahunAkademik->tahun_akademik,
                    'status' => $item->tahunAkademik->status,
                ],

                'tingkat' => $item->tingkat,
                'nilai_kkm' => $item->nilai_kkm,
                'status_mata_pelajaran' => $item->status_mata_pelajaran,
            ];
        });

        
        // semester
        // $data2 = Semester::with('tahunAkademik')
        // ->whereHas('tahunAkademik', function ($q) {
        //     $q->where('status', 'aktif');
        // })
        // ->where('status', 'aktif')
        // ->first();

        // if (!$data2) {
        //     return ApiResponse::error( 'Data kosong', ['data' => 'Tidak ada semester aktif'] );
        // }   
        
        // $semester = [
        //     'semester_id' => $data2->id,
        //     'semester' => $data2->semester,
        //     'status_semester' => $data2->status,
        //     'tahun_akademik' => $data2->tahunAkademik->tahun_akademik,
        //     'status_tahun_akademik' => $data2->tahunAkademik->status
        // ];

        
        // guru
        $data3 = Kepegawaian::where('role', 'guru')
        ->where('status', 'aktif')
        ->get();

        if ($data3->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Tidak ada guru aktif']
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
        $data4 = Rombel::with('tahunAkademik', 'waliRombel')
        ->whereHas('tahunAkademik', function ($q) {
            $q->where('status', 'aktif');
        })
        ->get();

        if ($data4->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Belum ada rombel pada tahun akademik akktif']
            );
        }    

        $rombel = $data4->map(function ($r) {
            return [
                'rombel_id' => $r->id ?? null,
                'nama_rombel' => $r->nama_rombel ?? null,
                'wali_rombel' => $r->waliRombel->nama ?? null,
                'tahun_akademik' => $r->tahunAkademik->tahun_akademik ?? null,
                'status_tahun_akademik' => $r->tahunAkademik->status ?? null,
            ];
        });


        // ruangan
        $data5 = Ruangan::get();

        if ($data5->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Belum ada ruangan']
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
                'semester' => $semester,
                'guru' => $guru,
                'rombel' => $rombel,
                'ruangan' => $ruangan,
            ],
            'Data select berhasil diambil'
        );
    }
    // Data untuk select
}
