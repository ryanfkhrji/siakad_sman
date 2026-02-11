<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataNilaiSiswa;
use App\Models\SiswaRombel;
use App\Models\JadwalPelajaran;
use App\Models\Siswa;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class DataNilaiSiswaController extends Controller
{
    // ! ✅ untuk spa (MASUK SINI)
    public function index()
    {
        $data = DataNilaiSiswa::with([
            'tahunAkademik',
            'semester',
            'siswa',
            'siswaRombel.rombel.kelas',
            'kurikulumMataPelajaran.mataPelajaran'
        ])
        ->orderBy('tahun_akademik_id')
        ->orderBy('semester_id')
        ->orderBy('siswa_id')
        ->get();

        if ($data->isEmpty()) {
            return ApiResponse::error('Not Found', 'Belum ada data nilai siswa');
        }

        $result = $data
            ->groupBy('tahun_akademik_id')
            ->map(function ($tahunGroup) {

                return [
                    'tahun_akademik_id' => $tahunGroup->first()->tahunAkademik->id,
                    'tahun_akademik'    => $tahunGroup->first()->tahunAkademik->tahun_akademik,
                    'status_tahun'      => $tahunGroup->first()->tahunAkademik->status,

                    'semesters' => $tahunGroup
                        ->groupBy('semester_id')
                        ->sortKeys()
                        ->map(function ($semesterGroup) {

                            return [
                                'semester_id'     => $semesterGroup->first()->semester->id,
                                'semester'        => $semesterGroup->first()->semester->semester,
                                'status_semester' => $semesterGroup->first()->semester->status,

                                'rombels' => $semesterGroup
                                    ->groupBy(fn ($item) =>
                                        $item->siswaRombel->rombel_id
                                    )
                                    ->map(function ($rombelGroup) {

                                        return [
                                            'rombel_id'   => $rombelGroup->first()->siswaRombel->rombel->id,
                                            'nama_rombel' => $rombelGroup->first()->siswaRombel->rombel->nama_rombel,

                                            'siswas' => $rombelGroup
                                                ->groupBy('siswa_id')
                                                ->map(function ($siswaGroup) {

                                                    return [
                                                        'siswa_id'   => $siswaGroup->first()->siswa->id,
                                                        'nama_siswa' => $siswaGroup->first()->siswa->nama,
                                                        'nisn'       => $siswaGroup->first()->siswa->nisn,
                                                        'nis'        => $siswaGroup->first()->siswa->nis,

                                                        'mata_pelajaran' => $siswaGroup
                                                            ->groupBy('kurikulum_mata_pelajaran_id')
                                                            ->map(function ($mapelGroup) {

                                                                $nilai = $mapelGroup->first();
                                                                $mapel = $nilai->kurikulumMataPelajaran->mataPelajaran;

                                                                if ($nilai->jenis_penilaian == 'PTS') {
                                                                    return [
                                                                        'mapel'             => $mapel->nama_pelajaran,
                                                                        'jenis_penilaian'   => $nilai->jenis_penilaian,
                                                                        'point'             => [
                                                                            'absensi'     => $nilai->point_absensi,
                                                                            'tugas'       => $nilai->point_tugas,
                                                                            'uts'         => $nilai->point_uts,
                                                                        ],
                                                                        'sikap'             => $nilai->sikap ?? null,
                                                                    ];
                                                                }

                                                                return [
                                                                    'mapel'             => $mapel->nama_pelajaran,
                                                                    'jenis_penilaian'   => $nilai->jenis_penilaian,
                                                                    'point'             => [
                                                                        'absensi'     => $nilai->point_absensi,
                                                                        'tugas'       => $nilai->point_tugas,
                                                                        'uas'         => $nilai->point_uas,
                                                                    ],
                                                                    'sikap'             => $nilai->sikap ?? null,
                                                                ];

                                                            })
                                                            ->values()
                                                    ];
                                                })
                                                ->values()
                                        ];
                                    })
                                    ->values()
                            ];
                        })
                        ->values()
                ];
            })
            ->values();

        return ApiResponse::success($result, 'Data nilai siswa berhasil ditampilkan');
    }



    /**
     * ✅ untuk guru
     */
    public function store(Request $request)
    {
        $user = Auth::guard('kepegawaian')->user();        

        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',
                'kurikulum_mata_pelajaran_id' => 'required|exists:kurikulum_mata_pelajaran,id',
                'guru_id' => 'required|exists:kepegawaians,id', // otomatis (gaperlu dibuat inputannya)
                'point_absensi' => 'required|numeric',
                'point_tugas' => 'required|numeric',
                'point_uts' => 'required|numeric',
                'point_uas' => 'required|numeric',
                'point_ekskul' => 'nullable|numeric',
                'sikap' => 'nullable|in:Sangat Baik,Baik,Cukup,Kurang',
            ], [
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',

                'kurikulum_mata_pelajaran_id.required' => 'Kurikulum mata pelajaran wajib diisi',
                'kurikulum_mata_pelajaran_id.exists' => 'Kurikulum mata pelajaran tidak ditemukan',

                'guru_id.required' => 'Guru wajib diisi',                
                'guru_id.exists' => 'Guru tidak ditemukan',
                
                'point_absensi.required' => 'Point absensi wajib diisi',
                'point_absensi.numeric' => 'Wajib diisi angka',

                'point_tugas.required' => 'Point tugas wajib diisi',
                'point_tugas.numeric' => 'Wajib diisi angka',
                
                'point_uts.required' => 'Point uts wajib diisi',
                'point_uts.numeric' => 'Wajib diisi angka',
                
                'point_uas.required' => 'Point uas wajib diisi',
                'point_uas.numeric' => 'Wajib diisi angka',
                
                'point_ekskul.numeric' => 'Wajib diisi angka',

                'sikap.in' => 'Pilihan hanya Sangat Baik, Baik, Cukup, Kurang'
            ]);            
            
        if (!in_array($user->role, ['guru', 'super_admin'])) {
            return ApiResponse::error('Kesalahan', [
                'pesan' => ['Anda tidak berhak menentukan nilai siswa']
            ], 403);
        }            

        $sama = DataNilaiSiswa::where('kurikulum_mata_pelajaran_id', $validated['kurikulum_mata_pelajaran_id'])
            ->where('siswa_id', $validated['siswa_id'])
            ->exists();

        if ($sama) {
            return ApiResponse::error('Duplicated', ['Pesan' => 'Data Nilai Siswa sudah ada']);
        }
    
        $nilai = DataNilaiSiswa::create([
            'siswa_id' => $validated['siswa_id'],
            'kurikulum_mata_pelajaran_id' => $validated['kurikulum_mata_pelajaran_id'],
            'guru_id' => $user->id,
            'point_absensi' => $validated['point_absensi'],
            'point_tugas' => $validated['point_tugas'],
            'point_uts' => $validated['point_uts'],
            'point_uas' => $validated['point_uas'],
            'point_ekskul' => $validated['point_ekskul'],
            'sikap' => $validated['sikap'] ?? null,
        ]);

        $nilai->load('siswa.kelas', 'siswa.jurusan', 'kurikulumMataPelajaran.mataPelajaran', 'jurusan', 'guru');

        $formatted = [
            'data_nilai_id'     => $nilai->id,
            'siswa_id'          => $nilai->siswa->id,
            'nama_siswa'        => $nilai->siswa->nama,
            'nama_jurusan_siswa'  => $nilai->siswa->jurusan->nama_jurusan,
            'nama_kelas_siswa'  => $nilai->siswa->kelas->nama_kelas,
            'kurikulum_mata_pelajaran_id' => $nilai->kurikulumMataPelajaran->id,
            'nama_pelajaran'    => $nilai->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'jurusan_pelajaran' => $nilai->kurikulumMataPelajaran->jurusan->nama_jurusan,
            'guru_id'           => $nilai->guru_id,
            'nama_guru'         => $nilai->guru->nama,

            'point_absensi' => $nilai->point_absensi,
            'point_tugas'   => $nilai->point_tugas,
            'point_uts'     => $nilai->point_uts,
            'point_uas'     => $nilai->point_uas,
            'point_ekskul'  => $nilai->point_ekskul,
            'sikap'         => $nilai->sikap ?? null,            
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ untuk spa/guru
     */    
    public function show($id)
    {        
        $siswa = Siswa::with([
            'kelas',
            'jurusan',
            'dataNilaiSiswas',
            'jadwalPelajarans.guru',
            'jadwalPelajarans.kelas',
            'jadwalPelajarans.kurikulumMataPelajaran.kurikulum',
            'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
            'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
        ])->find($id);
    
        if (!$siswa) {
            return ApiResponse::error('Not found', ['Data siswa tidak ditemukan']);
        }
    
        /**
         * 🔹 Flatten jadwal → group by tahun akademik
         */
        $tahunAkademik = $siswa->jadwalPelajarans
            ->groupBy(fn ($jadwal) =>
                $jadwal->kurikulumMataPelajaran->tahunAkademik->id
            )
            ->map(function ($jadwalPerTahun) use ($siswa) {
    
                $ta = $jadwalPerTahun->first()
                    ->kurikulumMataPelajaran
                    ->tahunAkademik;
    
                return [
                    'tahun_akademik_id' => $ta->id,
                    'tahun_akademik'    => $ta->tahun_akademik,
                    'semester'          => $ta->semester,
                    'status'            => $ta->status,
    
                    'kurikulum_mata_pelajaran' => $jadwalPerTahun
                        ->groupBy(fn ($jadwal) =>
                            $jadwal->kurikulum_mata_pelajaran_id
                        )
                        ->map(function ($jadwalPerKmp) use ($siswa) {
    
                            $jadwal = $jadwalPerKmp->first();
                            $kmp    = $jadwal->kurikulumMataPelajaran;
    
                            $nilai = $siswa->dataNilaiSiswas
                                ->firstWhere(
                                    'kurikulum_mata_pelajaran_id',
                                    $kmp->id
                                );
    
                            return [
                                'kurikulum_mata_pelajaran_id' => $kmp->id,
                                'kurikulum' => $kmp->kurikulum->nama_kurikulum ?? null,
                                'mata_pelajaran' => $kmp->mataPelajaran->nama_pelajaran ?? null,
                                'jurusan_pelajaran' => $kmp->jurusan->nama_jurusan ?? null,
                                'tingkat' => $kmp->tingkat,
                                'nilai_kkm' => $kmp->nilai_kkm,
                                'status_mata_pelajaran' => $kmp->status_mata_pelajaran,
    
                                'jadwal_pelajaran' => [
                                    'hari'        => $jadwal->hari,
                                    'jam_mulai'   => $jadwal->jam_mulai,
                                    'jam_selesai' => $jadwal->jam_selesai,
                                    'ruangan'     => $jadwal->ruangan,
                                    'link_opsional' => $jadwal->link_opsional,
    
                                    'guru' => [
                                        'guru_id'   => $jadwal->guru->id ?? null,
                                        'nama_guru' => $jadwal->guru->nama ?? null,
                                    ],
    
                                    'kelas' => $jadwal->kelas->nama_kelas ?? null,
                                ],
    
                                'nilai_siswa' => $nilai ? [
                                    'point_absensi' => $nilai->point_absensi,
                                    'point_tugas'   => $nilai->point_tugas,
                                    'point_uts'     => $nilai->point_uts,
                                    'point_uas'     => $nilai->point_uas,
                                    'point_ekskul'  => $nilai->point_ekskul,
                                    'sikap'         => $nilai->sikap,
                                ] : null,
                            ];
                        })->values(),
                ];
            })->values();
    
        return ApiResponse::success([
            'siswa' => [
                'siswa_id' => $siswa->id,
                'nisn'     => $siswa->nisn,
                'nis'      => $siswa->nis,
                'nama'     => $siswa->nama,
                'kelas'    => $siswa->kelas->nama_kelas ?? null,
                'jurusan'  => $siswa->jurusan->nama_jurusan ?? null,
            ],
            'tahun_akademik' => $tahunAkademik
        ], 'Data nilai siswa berhasil diambil');
    }
    

    // ✅ get all data nilai siswa sendiri (untuk guru)
    public function getAllDataNilaiSendiri()
    {
        $user = Auth::guard('kepegawaian')->user();
    
        $siswa = Siswa::with([
            'kelas',
            'jurusan',
            'dataNilaiSiswas',
            'jadwalPelajarans.guru',
            'jadwalPelajarans.kelas',
            'jadwalPelajarans.kurikulumMataPelajaran.kurikulum',
            'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
            'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
        ])->find($user->id);
    
        if (!$siswa) {
            return ApiResponse::error('Not found', ['Data siswa tidak ditemukan']);
        }
    
        /**
         * 🔹 Flatten jadwal → group by tahun akademik
         */
        $tahunAkademik = $siswa->jadwalPelajarans
            ->groupBy(fn ($jadwal) =>
                $jadwal->kurikulumMataPelajaran->tahunAkademik->id
            )
            ->map(function ($jadwalPerTahun) use ($siswa) {
    
                $ta = $jadwalPerTahun->first()
                    ->kurikulumMataPelajaran
                    ->tahunAkademik;
    
                return [
                    'tahun_akademik_id' => $ta->id,
                    'tahun_akademik'    => $ta->tahun_akademik,
                    'semester'          => $ta->semester,
                    'status'            => $ta->status,
    
                    'kurikulum_mata_pelajaran' => $jadwalPerTahun
                        ->groupBy(fn ($jadwal) =>
                            $jadwal->kurikulum_mata_pelajaran_id
                        )
                        ->map(function ($jadwalPerKmp) use ($siswa) {
    
                            $jadwal = $jadwalPerKmp->first();
                            $kmp    = $jadwal->kurikulumMataPelajaran;
    
                            $nilai = $siswa->dataNilaiSiswas
                                ->firstWhere(
                                    'kurikulum_mata_pelajaran_id',
                                    $kmp->id
                                );
    
                            return [
                                'kurikulum_mata_pelajaran_id' => $kmp->id,
                                'kurikulum' => $kmp->kurikulum->nama_kurikulum ?? null,
                                'mata_pelajaran' => $kmp->mataPelajaran->nama_pelajaran ?? null,
                                'jurusan_pelajaran' => $kmp->jurusan->nama_jurusan ?? null,
                                'tingkat' => $kmp->tingkat,
                                'nilai_kkm' => $kmp->nilai_kkm,
                                'status_mata_pelajaran' => $kmp->status_mata_pelajaran,
    
                                'jadwal_pelajaran' => [
                                    'hari'        => $jadwal->hari,
                                    'jam_mulai'   => $jadwal->jam_mulai,
                                    'jam_selesai' => $jadwal->jam_selesai,
                                    'ruangan'     => $jadwal->ruangan,
                                    'link_opsional' => $jadwal->link_opsional,
    
                                    'guru' => [
                                        'guru_id'   => $jadwal->guru->id ?? null,
                                        'nama_guru' => $jadwal->guru->nama ?? null,
                                    ],
    
                                    'kelas' => $jadwal->kelas->nama_kelas ?? null,
                                ],
    
                                'nilai_siswa' => $nilai ? [
                                    'point_absensi' => $nilai->point_absensi,
                                    'point_tugas'   => $nilai->point_tugas,
                                    'point_uts'     => $nilai->point_uts,
                                    'point_uas'     => $nilai->point_uas,
                                    'point_ekskul'  => $nilai->point_ekskul,
                                    'sikap'         => $nilai->sikap,
                                ] : null,
                            ];
                        })->values(),
                ];
            })->values();
    
        return ApiResponse::success([
            'siswa' => [
                'siswa_id' => $siswa->id,
                'nisn'     => $siswa->nisn,
                'nis'      => $siswa->nis,
                'nama'     => $siswa->nama,
                'kelas'    => $siswa->kelas->nama_kelas ?? null,
                'jurusan'  => $siswa->jurusan->nama_jurusan ?? null,
            ],
            'tahun_akademik' => $tahunAkademik
        ], 'Data nilai siswa berhasil diambil');
    }
    

    /**
     * ✅ untuk guru
     */
    public function update(Request $request, string $id)
    {
        $nilai = DataNilaiSiswa::find($id);

        $user = Auth::guard('kepegawaian')->user();

        if (!$nilai) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'point_absensi' => 'sometimes|required|numeric',            
            'point_tugas' => 'sometimes|required|numeric',            
            'point_uts' => 'sometimes|required|numeric',            
            'point_uas' => 'sometimes|required|numeric',            
            'point_ekskul' => 'sometimes|numeric',            
            'sikap' => 'nullable|in:Sangat Baik,Baik,Cukup,Kurang',
        ], [
            'point_absensi.required' => 'Point absensi wajib diisi',
            'point_absensi.numeric' => 'Wajib diisi angka',

            'point_tugas.required' => 'Point tugas wajib diisi',
            'point_tugas.numeric' => 'Wajib diisi angka',
                
            'point_uts.required' => 'Point uts wajib diisi',
            'point_uts.numeric' => 'Wajib diisi angka',
                
            'point_uas.required' => 'Point uas wajib diisi',
            'point_uas.numeric' => 'Wajib diisi angka',
                
            'point_ekskul.numeric' => 'Wajib diisi angka',

            'sikap.in' => 'Pilihan hanya Sangat Baik, Baik, Cukup, Kurang'
        ]);

        if (!in_array($user->role, ['guru', 'super_admin'])) {
            return ApiResponse::error('Kesalahan', [
                'pesan' => ['Anda tidak berhak menentukan nilai siswa']
            ], 403);
        }            

        $sama = DataNilaiSiswa::where('kurikulum_mata_pelajaran_id', $nilai->kurikulum_mata_pelajaran_id)
            ->where('siswa_id', $nilai->siswa_id)
            ->first();

        if ($sama != null) {
            return ApiResponse::error('Duplicated', ['Pesan' => 'Siswa dengan mata pelajaran dan jurusan ini sudah ada']);
        }

        // yang tidak boleh diubah: siswa_id, mata_pelajaran_id, guru_id
        $nilai->update(
            [
                'siswa_id' => $nilai->siswa_id ?? null,
                'kurikulum_mata_pelajaran_id' => $nilai->kurikulum_mata_pelajaran_id ?? null,
                'guru_id' => $nilai->guru_id ?? null,
                'point_absensi' => $validated['point_absensi'] ?? null,
                'point_tugas' => $validated['point_tugas'] ?? null,
                'point_uts' => $validated['point_uts'] ?? null,
                'point_uas' => $validated['point_uas'] ?? null,
                'point_ekskul' => $validated['point_ekskul'] ?? null,
                'sikap' => $validated['sikap'] ?? null,
            ]
        );
        
        $nilai->load('siswa.kelas', 'siswa.jurusan', 'kurikulumMataPelajaran.mataPelajaran', 'jurusan', 'guru');

        $formatted = [
            'data_nilai_id'     => $nilai->id,
            'siswa_id'          => $nilai->siswa->id,
            'nama_siswa'        => $nilai->siswa->nama,
            'nama_jurusan_siswa'  => $nilai->siswa->jurusan->nama_jurusan,
            'nama_kelas_siswa'  => $nilai->siswa->kelas->nama_kelas,
            'kurikulum_mata_pelajaran_id' => $nilai->kurikulumMataPelajaran->id,
            'nama_pelajaran'    => $nilai->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran,
            'jurusan_pelajaran' => $nilai->kurikulumMataPelajaran->jurusan->nama_jurusan,
            'guru_id'           => $nilai->guru_id,
            'nama_guru'         => $nilai->guru->nama,

            'point_absensi' => $nilai->point_absensi,
            'point_tugas'   => $nilai->point_tugas,
            'point_uts'     => $nilai->point_uts,
            'point_uas'     => $nilai->point_uas,
            'point_ekskul'  => $nilai->point_ekskul,
            'sikap'         => $nilai->sikap ?? null,            
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil diupdate');
    }

    /**
     * ✅ untuk guru
     * Remove the specified resource from storage.
     * Beberapa data = DELETE /pegawai/data-nilai-siswa/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /pegawai/data-nilai-siswa/destroy?ids=7
     */ 
    public function destroyData(Request $request)
    {
        $ids = $request->ids;        

        // HAPUS BEBERAPA DATA
        if (is_array($ids)) {
            $validIds = DataNilaiSiswa::whereIn('id', $ids)->pluck('id')->toArray();
            $invalidIds = array_diff($ids, $validIds);

            // Jika terdapat id yang tidak ada
            if (!empty($invalidIds)) {
                return response()->json([
                    'message' => 'Beberapa ID tidak ditemukan.',
                    'invalid_ids' => array_values($invalidIds)
                ], 404);
            }

            DataNilaiSiswa::whereIn('id', $validIds)->delete();
            return response()->json([
                'message' => 'Beberapa data nilai siswa berhasil dihapus.',
                'deleted_ids' => $validIds
            ]);
        }

        // HAPUS SATU DATA
        if (is_numeric($ids)) {
            $absensi = DataNilaiSiswa::find($ids);

            if (!$absensi) {
                return response()->json([
                    'message' => 'Data tidak ditemukan.',
                    'invalid_id' => $ids
                ], 404);
            }

            $absensi->delete();
            return response()->json([
                'message' => 'Data nilai siswa berhasil dihapus.',
                'deleted_id' => $ids
            ]);
        }

        return response()->json([
            'message' => 'Parameter ids tidak valid. Kirimkan satu id, atau array id.'
        ], 422);
    }    

    // spa/tu/guru (digunakan untuk mengambil absensi)
    public function selectDanReferensi()
    {
        // ambil hanya siswa rombel pada tahun akademik yang aktif
        $data = SiswaRombel::with([
                'tahunAkademik',
                'rombel.kelas',
                'siswa',
            ])
            ->whereHas('tahunAkademik', function ($ta) {
                $ta->where('status', 'aktif');
            })
            ->get();

        if ($data->isEmpty()) {
            return ApiResponse::error('Not found', 'Belum ada data siswa dan rombel pada tahun aktif');
        }

        $siswaRombel = $data->groupBy('tahun_akademik_id')
            ->sortKeys()
            ->map(function ($siswaRmbl) {

                $tahun = $siswaRmbl->first()->tahunAkademik;

                return [
                    'tahun_akademik_id' => $tahun->id,
                    'tahun_akademik'    => $tahun->tahun_akademik,
                    'status_tahun'      => $tahun->status,

                    'rombel' => $siswaRmbl->groupBy('rombel_id')
                        ->sortKeys()
                        ->map(function ($siswaR) {

                            $rombel = $siswaR->first()->rombel;

                            return [
                                'rombel_id' => $rombel->id,
                                'rombel'    => $rombel->nama_rombel,

                                'siswa' => $siswaR->map(function ($item) {
                                    return [
                                        'siswa_id'     => $item->siswa->id,
                                        'nama'         => $item->siswa->nama,
                                        'nisn'         => $item->siswa->nisn,
                                        'nis'          => $item->siswa->nis,
                                        'status_akhir' => $item->status_akhir,
                                        'catatan'      => $item->catatan,
                                    ];
                                })->values(),
                            ];
                        })->values(),
                ];
            })->values();

        return ApiResponse::success($siswaRombel, 'Data select dan referensi absensi berhasil diambil');
    }    
}
