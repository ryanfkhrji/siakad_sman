<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SiswaJadwalPelajaran;
use App\Models\SiswaRombel;
use App\Models\Siswa;
use App\Models\Rombel;
use App\Models\TahunAkademik;
use App\Models\JadwalPelajaran;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class SiswaJadwalPelajaranController extends Controller
{
    /**
     * ✅ siswa
     */
    public function index()
    {
        $siswa = Auth::guard('siswa')->user();

        $rombelAktif = SiswaRombel::where('siswa_id', $siswa->id)
        ->whereHas('rombel.tahunAkademik', fn ($q) => $q->where('status', 'aktif'))
        ->whereHas('rombel.jadwalPelajarans.semester', fn ($q) => $q->where('status', 'aktif'))
        ->with('rombel')
        ->first();

        if (!$rombelAktif) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        $jadwal = JadwalPelajaran::with([
            'guru',
            'kurikulumMataPelajaran.mataPelajaran',
            'ruangan',
            'rombel'
        ])
        ->where('rombel_id', $rombelAktif->id)
        ->orderByRaw("
            FIELD(hari, 'Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu')
        ")
        ->orderBy('jam_mulai')
        ->get();

        if ($jadwal->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Belum ada data']);
        }

        $formatted = $jadwal->map(function ($j) {
            return [
                'jadwal_pelajaran_id' => $j->id ?? null,
                'hari' => $j->hari ?? null,
                'mata_pelajaran' => $j->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                'guru' => $j->guru->nama ?? null,
                'rombel' => $j->rombel->nama_rombel ?? null,
                'jam_mulai' => $j->jam_mulai ?? null,
                'jam_selesai' => $j->jam_selesai ?? null,
                'ruangan' => $j->ruangan->nama_ruangan ?? null,
                'link_opsional' => $j->link_opsional ?? null
            ];
        })->values();
        
        return ApiResponse::success($formatted, 'Jadwal berhasil diambil');        
    }


    // spa (get all siswa yang punya rombel di tahun akademik aktif)
    // public function getAllSiswaAktif()
    // {
    //     $siswa = Siswa::with([
    //             'siswaRombels.tahunAkademik',
    //             'siswaRombels.rombel.kelas',
    //             'siswaRombels.rombel.jurusan',
    //         ])
    //         ->whereHas('siswaRombels.tahunAkademik', function ($q) {
    //             $q->where('status', 'aktif');
    //         })
    //         ->get();

    //     if ($siswa->isEmpty()) {
    //         return ApiResponse::error('Not found', ['data' => 'Tidak ada siswa aktif']);
    //     }

    //     /**
    //      * Mapping siswa + rombel aktif
    //      */
    //     $mapped = $siswa->map(function ($item) {

    //         $srAktif = $item->siswaRombels->first(function ($sr) {
    //             return
    //                 $sr->rombel !== null &&
    //                 $sr->tahunAkademik !== null &&
    //                 $sr->tahunAkademik->status === 'aktif';
    //         });

    //         if (! $srAktif || ! $srAktif->rombel) {
    //             return null;
    //         }

    //         $rombel = $srAktif->rombel;

    //         return [
    //             'kelas_id'   => $rombel->kelas->id,
    //             'nama_kelas' => $rombel->kelas->nama_kelas,

    //             'rombel_id'   => $rombel->id,
    //             'nama_rombel' => $rombel->nama_rombel,
    //             'jurusan_rombel' => $rombel->jurusan->nama_jurusan ?? null,                

    //             // 🔑 tahun akademik dari siswa_rombel
    //             // 'tahun_akademik' => [
    //             //     'id'     => $srAktif->tahunAkademik->id,
    //             //     'nama'   => $srAktif->tahunAkademik->tahun_akademik,
    //             //     'status' => $srAktif->tahunAkademik->status,
    //             // ],
    //             'tahun_akademik' => $srAktif->tahunAkademik->tahun_akademik,

    //             'siswa' => [
    //                 'siswa_id' => $item->id,
    //                 'nama'     => $item->nama,
    //                 'nisn'     => $item->nisn,
    //                 'nis'      => $item->nis,
    //                 // 'email'    => $item->email,
    //                 // 'role'     => $item->role,
    //                 'status_siswa' => $item->status,
    //                 'status_akhir' => $item->siswaRombels->first()->status_akhir ?? null,
    //                 'catatan'      => $item->siswaRombels->first()->catatan ?? null,
    //             ],
    //         ];
    //     })->filter();

    //     /**
    //      * GROUPING:
    //      * kelas → rombel → siswa
    //      */
    //     $grouped = $mapped
    //         ->groupBy('kelas_id')
    //         ->sortKeys()
    //         ->map(function ($kelasItems) {

    //             return [
    //                 'kelas_id'   => $kelasItems->first()['kelas_id'],
    //                 'nama_kelas' => $kelasItems->first()['nama_kelas'],

    //                 'rombels' => $kelasItems
    //                     ->groupBy('rombel_id')
    //                     ->map(function ($rombelItems) {

    //                         return [
    //                             'rombel_id'   => $rombelItems->first()['rombel_id'],
    //                             'nama_rombel' => $rombelItems->first()['nama_rombel'],
    //                             'jurusan'     => $rombelItems->first()['jurusan_rombel'],

    //                             // ✅ ditaruh sebelum total_siswa
    //                             'tahun_akademik' => $rombelItems->first()['tahun_akademik'],

    //                             // 'total_siswa' => $rombelItems->count(),

    //                             'siswa' => $rombelItems
    //                                 ->pluck('siswa')
    //                                 ->values(),
    //                         ];
    //                     })
    //                     ->values(),
    //             ];
    //         })
    //         ->values();

    //     return ApiResponse::success(
    //         $grouped,
    //         'Daftar siswa aktif berhasil diambil'
    //     );
    // }

    

    // spa (get siswa->ta->rombel->jadwal)
    public function showSiswaJadwal($id)
    {
        $siswaRombels = SiswaRombel::with([
            'siswa',
            'tahunAkademik',
            'rombel.kelas',
            'rombel.waliRombels.wali', // nanti difilter manual
            'rombel.jadwalPelajarans.ruangan',
            'rombel.jadwalPelajarans.tahunAkademik',
            'rombel.jadwalPelajarans.semester',
            'rombel.jadwalPelajarans.guru',
            'rombel.jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
        ])
            ->where('siswa_id', $id)
            ->get();

        if ($siswaRombels->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        $siswa = $siswaRombels->first()->siswa;

        $result = [
            'siswa_id'   => $siswa->id,
            'nama_siswa' => $siswa->nama,

            'periode' => $siswaRombels
                ->groupBy('tahun_akademik_id')
                ->map(function ($groupedByTahun) {

                    $sr = $groupedByTahun->first();
                    $tahunAkademik = $sr->tahunAkademik;
                    $rombel = $sr->rombel;

                    // wali rombel → hanya 1 sesuai tahun akademik
                    $waliRombel = $rombel
                    ->waliRombels
                    ->where('tahun_akademik_id', $tahunAkademik->id)
                    ->first();

                    $namaWali = $waliRombel?->wali?->nama;


                    return [
                        'tahun_akademik_id'     => $tahunAkademik->id,
                        'tahun_akademik'        => $tahunAkademik->tahun_akademik,
                        'status_tahun_akademik' => $tahunAkademik->status,

                        'rombel' => [
                            'rombel_id'   => $rombel->id ?? null,
                            'nama_rombel' => $rombel->nama_rombel ?? null,
                            'kelas'       => $rombel->kelas->nama_kelas ?? null,
                            'wali_rombel' => $namaWali,
                        ],

                        'jadwal' => $rombel?->jadwalPelajarans
                            ->where('tahun_akademik_id', $tahunAkademik->id)
                            ->groupBy('semester_id')
                            ->map(function ($jadwals) {

                                $semester = $jadwals->first()->semester;

                                return [
                                    'semester_id'     => $semester->id,
                                    'semester'        => $semester->semester,
                                    'status_semester' => $semester->status,

                                    'jadwal_pelajarans' => $jadwals->map(function ($jadwal) {

                                        $mapel = $jadwal->kurikulumMataPelajaran?->mataPelajaran;

                                        return [
                                            'jadwal_pelajaran_id' => $jadwal->id,
                                            'mata_pelajaran'      => $mapel?->nama_pelajaran,
                                            'hari'                => $jadwal->hari,
                                            'jam_mulai'           => $jadwal->jam_mulai,
                                            'jam_selesai'         => $jadwal->jam_selesai,
                                            'guru'                => $jadwal->guru?->nama,
                                            'ruangan'             => $jadwal->ruangan?->nama_ruangan,
                                            'link_opsional'       => $jadwal->link_opsional,
                                        ];
                                    })->values(),
                                ];
                            })->values(),
                    ];
                })->values(),
        ];

        return ApiResponse::success($result, 'Jadwal siswa berhasil diambil');
    }

}
