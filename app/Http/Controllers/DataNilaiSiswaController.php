<?php

namespace App\Http\Controllers;

use App\Exports\LegerExport;
use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Models\DataNilaiSiswa;
use App\Models\Rapor;
use App\Models\Semester;
use App\Models\Siswa;
use App\Models\Kelas;
use App\Models\SiswaRombel;
use Carbon\Carbon;
use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Validator;
// use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Maatwebsite\Excel\Facades\Excel;
use PDF;

class DataNilaiSiswaController extends Controller
{
    // ✅ untuk spa
    // Leger Nai Rapor (wajib tentukan dulu tahun dan semester, biar ga berat)
    // Mengambil semua rombel + siswa + nilai + rapor pada tahun dan semester tertentu    
    public function index(Request $request)
    {
        $request->validate([
            'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
            'semester_id'       => 'required|exists:semester,id',
        ], [
            'tahun_akademik_id.required' => 'Tahun akademik wajib dipilih terlebih dahulu',
            'tahun_akademik_id.exists'   => 'Tahun akademik tidak ditemukan',
            'semester_id.required'       => 'Semester wajib dipilih terlebih dahulu',
            'semester_id.exists'         => 'Semester tidak ditemukan',
        ]);

        $data = DataNilaiSiswa::query()
        ->join('siswa_rombel', 'data_nilai_siswa.siswa_rombel_id', '=', 'siswa_rombel.id')
        ->join('rombels', 'siswa_rombel.rombel_id', '=', 'rombels.id') // 🔥 ganti di sini
        ->where('data_nilai_siswa.tahun_akademik_id', $request->tahun_akademik_id)
        ->where('data_nilai_siswa.semester_id', $request->semester_id)
        ->orderBy('rombels.nama_rombel')
        ->select('data_nilai_siswa.*')
        ->with([
            'tahunAkademik:id,tahun_akademik,status',
            'semester:id,semester,status',
            'siswa:id,nama,nis,nisn',
            'siswaRombel.rombel.jurusan',
            'siswaRombel.rombel.waliRombels.wali',
            'kurikulumMataPelajaran.mataPelajaran:id,nama_pelajaran',
            'rapor.waliRombel.wali',
            'guru',
        ])
        ->get();

        if ($data->isEmpty()) {
            return ApiResponse::error('Not Found', 'Belum ada data nilai siswa');
        }

        $result = $data
            ->groupBy('tahun_akademik_id')
            ->map(function ($tahunGroup) {

                $tahun = $tahunGroup->first()->tahunAkademik;

                return [
                    'tahun_akademik_id' => $tahun->id,
                    'tahun_akademik'    => $tahun->tahun_akademik,
                    'status_tahun'      => $tahun->status,

                    'semesters' => $tahunGroup
                        ->groupBy('semester_id')
                        ->map(function ($semesterGroup) {

                            $semester = $semesterGroup->first()->semester;

                            return [
                                'semester_id'     => $semester->id,
                                'semester'        => $semester->semester,
                                'status_semester' => $semester->status,

                                'rombels' => $semesterGroup
                                    ->groupBy(fn ($item) =>
                                        $item->siswaRombel->rombel_id
                                    )
                                    ->map(function ($rombelGroup) {

                                        $rombel = $rombelGroup->first()->siswaRombel->rombel;
                                        $tahunId = $rombelGroup->first()->tahun_akademik_id;
                                        $waliData = $rombel->waliRombels
                                            ->where('tahun_akademik_id', $tahunId)
                                            ->first();

                                        $namaWali = optional($waliData?->wali)->nama;
                                        return [
                                            'rombel_id'   => $rombel->id,
                                            'nama_rombel' => $rombel->nama_rombel,
                                            'jurusan'     => $rombel->jurusan->nama_jurusan ?? null,
                                            'wali_rombel' => $namaWali,

                                            'siswas' => $rombelGroup
                                                ->groupBy('siswa_id')
                                                ->map(function ($siswaGroup) {

                                                    $siswa = $siswaGroup->first()->siswa;

                                                    // 🔥 AMBIL 1 RAPOR SAJA
                                                    $rapor = $siswaGroup->first()->rapor;

                                                    return [
                                                        'siswa_id'   => $siswa->id,
                                                        'nama_siswa' => $siswa->nama,
                                                        'nisn'       => $siswa->nisn,
                                                        'nis'        => $siswa->nis,

                                                        'data_nilai_siswa' => $siswaGroup
                                                            ->map(function ($nilai) {

                                                                $mapel = $nilai->kurikulumMataPelajaran->mataPelajaran;

                                                                if (
                                                                    $nilai->jenis_penilaian == 'PTS' || 
                                                                    $nilai->jenis_penilaian == 'Susulan PTS' || 
                                                                    $nilai->jenis_penilaian == 'Remedial PTS'
                                                                ) {
                                                                    return [
                                                                        'data_nilai_siswa_id' => $nilai->id,
                                                                        'mata_pelajaran'  => $mapel->nama_pelajaran,
                                                                        'guru_pengajar'   => $nilai->guru->nama,
                                                                        'jenis_penilaian' => $nilai->jenis_penilaian,
                                                                        'point' => [
                                                                            'absensi'     => $nilai->point_absensi,
                                                                            'tugas'       => $nilai->point_tugas,
                                                                            'uts'         => $nilai->point_uts,
                                                                            'nilai_akhir' => $nilai->nilai_akhir,
                                                                            'predikat'  => $nilai->predikat,
                                                                            'deskripsi' => $nilai->deskripsi,
                                                                        ],
                                                                    ];
                                                                } else {
                                                                    return [
                                                                        'mata_pelajaran'  => $mapel->nama_pelajaran,
                                                                        'guru_pengajar'   => $nilai->guru->nama,
                                                                        'jenis_penilaian' => $nilai->jenis_penilaian,
                                                                        'point' => [
                                                                            'absensi'     => $nilai->point_absensi,
                                                                            'tugas'       => $nilai->point_tugas,
                                                                            'uas'         => $nilai->point_uas,
                                                                            'nilai_akhir' => $nilai->nilai_akhir,
                                                                            'predikat'  => $nilai->predikat,
                                                                            'deskripsi' => $nilai->deskripsi,
                                                                        ],
                                                                    ];
                                                                }

                                                            })
                                                            ->values(),

                                                        // 🔥 RAPOR (1 SAJA PER SISWA)
                                                        'rapor' => $rapor ? [
                                                            'rapor_id'        => $rapor->id,
                                                            'jenis_rapor'     => $rapor->jenis_rapor,
                                                            'sikap_spiritual' => $rapor->sikap_spiritual,
                                                            'sikap_sosial'    => $rapor->sikap_sosial,
                                                            'deskripsi_sikap' => $rapor->deskripsi_sikap,
                                                            'status'          => $rapor->status,
                                                            'tanggal_terbit'  => $rapor->tanggal_terbit,
                                                            'catatan_wali'    => $rapor->catatan_wali,
                                                        ] : null,
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

    // cetak leger
    public function export(Request $request) {    
        $kelas = Kelas::find($request->kelas_id);
        return Excel::download(
            new LegerExport(
                $request->tahun_akademik_id,
                $request->semester_id,
                $request->kelas_id   // 10 / 11 / 12
            ),
            'Leger-Kelas-'.$kelas->nama_kelas.'.xlsx'
        );
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
     * ✅ untuk spa/wali kelas
     * detail rapor untuk satu siswa dengan semua nilai dan mapelnya
     */      
    public function semuaNilaiSatuSiswa($id)
    {
        $nilai = DataNilaiSiswa::with([
            'siswa',
            'guru',
            'siswaRombel.rombel.jurusan',
            'kurikulumMataPelajaran.mataPelajaran',
            'tahunAkademik',
            'semester',
        ])
        ->where('siswa_id', $id)
        ->orderBy('tahun_akademik_id')
        ->orderBy('semester_id')
        ->get();

        if ($nilai->isEmpty()) {
            return ApiResponse::error('Not found', 'Belum ada nilai akhir mata pelajaran apapun');
        }

        $raporCollection = Rapor::with([
            'waliRombel.wali',
            'waliRombel.rombel'
        ])
        ->where('siswa_id', $id)
        ->get()
        ->groupBy(function ($item) {
            return $item->tahun_akademik_id . '-' . $item->semester_id;
        });

        $first = $nilai->first();
        $last  = $nilai->last();

        $formatted = [
            'siswa' => [
                'siswa_id'  => $first->siswa->id,
                'nama'      => $first->siswa->nama,
                'nisn'      => $first->siswa->nisn,
                'nis'       => $first->siswa->nis,
            ],

            'rombel_saat_ini' => [
                'rombel_id'     => $last->siswaRombel->rombel->id ?? null,
                'nama_rombel'   => $last->siswaRombel->rombel->nama_rombel ?? null,
                'jurusan'       => $last->siswaRombel->rombel->jurusan->nama_jurusan ?? null,
            ],

            'tahun_akademik' => $nilai
                ->groupBy('tahun_akademik_id')
                ->map(function ($tahunGroup) use ($raporCollection) {

                    $tahun = $tahunGroup->first()->tahunAkademik;

                    return [
                        'tahun_akademik_id' => $tahun->id,
                        'tahun_akademik'    => $tahun->tahun_akademik,
                        'status'            => $tahun->status,

                        'semester' => $tahunGroup
                            ->groupBy('semester_id')
                            ->map(function ($semesterGroup) use ($tahun, $raporCollection) {

                                $semester = $semesterGroup->first()->semester;
                                $key = $tahun->id . '-' . $semester->id;
                                $rapor = $raporCollection[$key][0] ?? null;

                                return [
                                    'semester_id'=> $semester->id,
                                    'semester'   => $semester->semester,
                                    'status'     => $semester->status,

                                    'data_nilai_siswa' => $semesterGroup
                                        ->groupBy('jenis_penilaian')
                                        ->map(function ($group, $jenis) {

                                            return [
                                                'jenis_penilaian' => $jenis,
                                                'mata_pelajaran' => $group->map(function ($mapel) {

                                                    $isPTS = in_array($mapel->jenis_penilaian, [
                                                        'PTS',
                                                        'Susulan PTS',
                                                        'Remedial PTS'
                                                    ]);

                                                    if ($isPTS) {
                                                        $point = [
                                                            'absensi'     => $mapel->point_absensi,
                                                            'tugas'       => $mapel->point_tugas,
                                                            'uts'         => $mapel->point_uts,
                                                            'nilai_akhir' => $mapel->nilai_akhir,
                                                            'predikat'    => $mapel->predikat,
                                                            'deskripsi'   => $mapel->deskripsi,
                                                        ];
                                                    } else {
                                                        $point = [
                                                            'absensi'     => $mapel->point_absensi,
                                                            'tugas'       => $mapel->point_tugas,
                                                            'uas'         => $mapel->point_uas,
                                                            'nilai_akhir' => $mapel->nilai_akhir,
                                                            'predikat'    => $mapel->predikat,
                                                            'deskripsi'   => $mapel->deskripsi,
                                                        ];
                                                    }

                                                    return [
                                                        'data_nilai_siswa_id'   => $mapel->id,
                                                        'mata_pelajaran_id'     => $mapel->kurikulumMataPelajaran->mataPelajaran->id ?? null,
                                                        'mata_pelajaran'        => $mapel->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                                                        'guru_pengajar'         => $mapel->guru->nama ?? null,
                                                        'point'                 => $point,
                                                    ];
                                                })->values(),
                                            ];
                                        })->values(),

                                    'rapor' => $rapor ? [
                                        'rapor_id'        => $rapor->id,
                                        'jenis_rapor'     => $rapor->jenis_rapor,
                                        'sikap_spiritual' => $rapor->sikap_spiritual,
                                        'sikap_sosial'    => $rapor->sikap_sosial,
                                        'deskripsi_sikap' => $rapor->deskripsi_sikap,
                                        'status'          => $rapor->status,
                                        'tanggal_terbit'  => $rapor->tanggal_terbit,
                                        'catatan_wali'    => $rapor->catatan_wali,
                                        'wali_rombel'     => $rapor->waliRombel?->wali?->nama,
                                        'rombel'          => $rapor->waliRombel?->rombel?->nama_rombel,
                                    ] : null,
                                ];
                            })->values(),
                    ];
                })->values(),
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil diambil');
    }

    
    // Export/Cetak excel satu siswa semua mapel (bukan leger)
    public function cetakSemuaNilaiSatuSiswa(Request $request, $siswaId)
    {
        // $request->validate([
        //     'tahun' => 'required|integer',
        //     'semester' => 'required|integer',
        //     'jenis' => 'required|string',
        // ]);

        // $siswa = Siswa::with('siswaRombels.rombel')
        //     ->findOrFail($siswaId);

        // $nilai = DataNilaiSiswa::with('kurikulumMataPelajaran.mataPelajaran')
        //     ->where('siswa_id', $siswaId)
        //     ->where('tahun_akademik_id', $request->tahun)
        //     ->where('semester_id', $request->semester)
        //     ->where('jenis_penilaian', $request->jenis)
        //     ->orderBy('kurikulum_mata_pelajaran_id')
        //     ->get();

        // if ($nilai->isEmpty()) {
        //     return response()->json([
        //         'message' => 'Nilai tidak ditemukan'
        //     ], 404);
        // }

        // $pdf = PDF::loadView('pdf.nilai_siswa', [
        //     'siswa' => $siswa,
        //     'nilai' => $nilai,
        //     'jenis' => $request->jenis,
        //     'semester' => $request->semester
        // ]);

        // return $pdf->download('Laporan_Nilai_'.$siswa->nama.'.pdf');

        // $request->validate([
        //     'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
        //     'semester_id'       => 'required|exists:semester,id',
        //     'jenis_rapor'       => 'required|in:PTS,PAS'
        // ], [
        //     'tahun_akademik_id.required'    => 'Tahun akademik wajib ditentkan',
        //     'tahun_akademik_id.exists'      => 'Tahun akademik tidak ditemukan',
        //     'semester_id.required'          => 'Semester wajib ditentkan',
        //     'semester_id.exists'            => 'Semester tidak ditemukan',
        //     'jenis_rapor.required'          => 'Jenis rapor wajib ditentkan',
        //     'jenis_rapor.in'                => 'Pilihan jenis rapor hanya PTS dan PAS',
        // ]);

        // $data = Rapor::with([
        //     'tahunAkademik',
        //     'semester',
        //     'siswaRombel.rombel',
        //     'waliRombel.rombel',
        //     'siswa',
        // ])
        // ->where('tahun_akademik_id', $request->tahun_akademik_id)
        // ->where('semester_id', $request->semester_id)
        // ->where('jenis_rapor', $request->jenis_rapor)
        // ->get();

        // if ($data->isEmpty()) {
        //     return ApiResponse::error('Not found', 'Belum ada data');
        // }

        // $formatted = $data->groupBy('tahun_akademik_id')
        // ->map(function ($raporSiswa) {
        //     $tahunAkademik = $raporSiswa->first()->tahunAkademik;

        //     return [
        //         'tahun_akademik_id' => $tahunAkademik->id,
        //         'tahun_akademik'    => $tahunAkademik->tahun_akademik,
        //         'status_tahun'      => $tahunAkademik->status,
        //         'semeester'         => $raporSiswa->groupBy('semester_id')
        //         ->map(function ($rapor) {
        //             $semester = $rapor->first()->semester;

        //             return [
        //                 'semester_id'       => $semester->id,
        //                 'semester'          => $semester->semester,
        //                 'status_semester'   => $status->semester,
        //                 'rombel'            => $rapor->groupBy('siswa_rombel_id.rombel')
        //                 ->map(function ($rpr) {
        //                     $rombel     = $rpr->first()->siswaRombel->rombel;
        //                     $waliRombel = $rpr->first()->waliRombel->wali;

        //                     return [
        //                         'rombel_id' => $rombel->id,
        //                         'rombel'    => $rombel->nama_rombel,
        //                         'wali'      => $waliRombel->nama,
        //                         ''
        //                     ];
        //                 })->values(),
        //             ];
        //         })->values(),
        //     ];
        // })->values();
    }



    // ✅ get all data nilai siswa sendiri (untuk guru)
    // public function getAllDataNilaiSendiri()
    // {
    //     $user = Auth::guard('kepegawaian')->user();
    
    //     $siswa = Siswa::with([
    //         'kelas',
    //         'jurusan',
    //         'dataNilaiSiswas',
    //         'jadwalPelajarans.guru',
    //         'jadwalPelajarans.kelas',
    //         'jadwalPelajarans.kurikulumMataPelajaran.kurikulum',
    //         'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
    //         'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
    //         'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
    //     ])->find($user->id);
    
    //     if (!$siswa) {
    //         return ApiResponse::error('Not found', ['Data siswa tidak ditemukan']);
    //     }
    
    //     /**
    //      * 🔹 Flatten jadwal → group by tahun akademik
    //      */
    //     $tahunAkademik = $siswa->jadwalPelajarans
    //         ->groupBy(fn ($jadwal) =>
    //             $jadwal->kurikulumMataPelajaran->tahunAkademik->id
    //         )
    //         ->map(function ($jadwalPerTahun) use ($siswa) {
    
    //             $ta = $jadwalPerTahun->first()
    //                 ->kurikulumMataPelajaran
    //                 ->tahunAkademik;
    
    //             return [
    //                 'tahun_akademik_id' => $ta->id,
    //                 'tahun_akademik'    => $ta->tahun_akademik,
    //                 'semester'          => $ta->semester,
    //                 'status'            => $ta->status,
    
    //                 'kurikulum_mata_pelajaran' => $jadwalPerTahun
    //                     ->groupBy(fn ($jadwal) =>
    //                         $jadwal->kurikulum_mata_pelajaran_id
    //                     )
    //                     ->map(function ($jadwalPerKmp) use ($siswa) {
    
    //                         $jadwal = $jadwalPerKmp->first();
    //                         $kmp    = $jadwal->kurikulumMataPelajaran;
    
    //                         $nilai = $siswa->dataNilaiSiswas
    //                             ->firstWhere(
    //                                 'kurikulum_mata_pelajaran_id',
    //                                 $kmp->id
    //                             );
    
    //                         return [
    //                             'kurikulum_mata_pelajaran_id' => $kmp->id,
    //                             'kurikulum' => $kmp->kurikulum->nama_kurikulum ?? null,
    //                             'mata_pelajaran' => $kmp->mataPelajaran->nama_pelajaran ?? null,
    //                             'jurusan_pelajaran' => $kmp->jurusan->nama_jurusan ?? null,
    //                             'tingkat' => $kmp->tingkat,
    //                             'nilai_kkm' => $kmp->nilai_kkm,
    //                             'status_mata_pelajaran' => $kmp->status_mata_pelajaran,
    
    //                             'jadwal_pelajaran' => [
    //                                 'hari'        => $jadwal->hari,
    //                                 'jam_mulai'   => $jadwal->jam_mulai,
    //                                 'jam_selesai' => $jadwal->jam_selesai,
    //                                 'ruangan'     => $jadwal->ruangan,
    //                                 'link_opsional' => $jadwal->link_opsional,
    
    //                                 'guru' => [
    //                                     'guru_id'   => $jadwal->guru->id ?? null,
    //                                     'nama_guru' => $jadwal->guru->nama ?? null,
    //                                 ],
    
    //                                 'kelas' => $jadwal->kelas->nama_kelas ?? null,
    //                             ],
    
    //                             'nilai_siswa' => $nilai ? [
    //                                 'point_absensi' => $nilai->point_absensi,
    //                                 'point_tugas'   => $nilai->point_tugas,
    //                                 'point_uts'     => $nilai->point_uts,
    //                                 'point_uas'     => $nilai->point_uas,
    //                                 'point_ekskul'  => $nilai->point_ekskul,
    //                                 'sikap'         => $nilai->sikap,
    //                             ] : null,
    //                         ];
    //                     })->values(),
    //             ];
    //         })->values();
    
    //     return ApiResponse::success([
    //         'siswa' => [
    //             'siswa_id' => $siswa->id,
    //             'nisn'     => $siswa->nisn,
    //             'nis'      => $siswa->nis,
    //             'nama'     => $siswa->nama,
    //             'kelas'    => $siswa->kelas->nama_kelas ?? null,
    //             'jurusan'  => $siswa->jurusan->nama_jurusan ?? null,
    //         ],
    //         'tahun_akademik' => $tahunAkademik
    //     ], 'Data nilai siswa berhasil diambil');
    // }
    

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

    // ✅ untuk leger/index
    public function dataSelect() {        
        $data2 = Semester::with('tahunAkademik')->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('Not found', 'Belum ada data tahun akademik dan semester');
        }

        $tahunDanSemester = $data2->groupBy('tahun_akademik_id')
        ->map(function ($tahunAkademik) {
            return [
                'tahun_akademik_id' => $tahunAkademik->first()->tahunAkademik->id,
                'tahun_akademik'    => $tahunAkademik->first()->tahunAkademik->tahun_akademik,
                'status'            => $tahunAkademik->first()->tahunAkademik->status,
                'semester'          => $tahunAkademik->map(function ($taSemester) {
                    return [
                        'semester_id'   => $taSemester->id,
                        'semester'      => $taSemester->semester,
                        'status'        => $taSemester->status,
                    ];
                })->values(),
            ];
        })->values();

        return ApiResponse::success([
            'tahun_dan_smeester'    => $tahunDanSemester,
        ], 'Data select leger berhasil diambil');
    }
}
