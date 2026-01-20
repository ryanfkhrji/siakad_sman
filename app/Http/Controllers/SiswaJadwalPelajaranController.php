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
    public function getAllSiswaAktif()
    {
        $siswa = Siswa::with([
                'siswaRombels.rombel.kelas.jurusan',
                'siswaRombels.rombel.tahunAkademik',
            ])
            ->whereHas('siswaRombels.rombel.tahunAkademik', function ($q) {
                $q->where('status', 'aktif');
            })
            ->get();

        if ($siswa->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Tidak ada siswa aktif']);
        }

        /**
         * Ambil data siswa + rombel aktif
         */
        $mapped = $siswa->map(function ($item) {

            $rombelAktif = $item->siswaRombels
                ->filter(fn ($sr) =>
                    $sr->rombel !== null &&
                    $sr->rombel->tahunAkademik !== null &&
                    $sr->rombel->tahunAkademik->status === 'aktif'
                )
                ->first()
                ?->rombel;

            if (! $rombelAktif) {
                return null;
            }

            return [
                'kelas_id' => $rombelAktif->kelas->id,
                'nama_kelas' => $rombelAktif->kelas->nama_kelas,
                'jurusan' => $rombelAktif->kelas->jurusan->nama_jurusan ?? null,

                'rombel_id' => $rombelAktif->id,
                'nama_rombel' => $rombelAktif->nama_rombel,

                'siswa' => [
                    'siswa_id' => $item->id,
                    'nisn' => $item->nisn,
                    'nama' => $item->nama,
                    'nis' => $item->nis,
                    'email' => $item->email,
                    'role' => $item->role,
                    'status_siswa' => $item->status,
                ]
            ];
        })->filter();

        /**
         * GROUPING:
         * kelas -> rombel -> siswa
         */
        $grouped = $mapped
            ->groupBy('kelas_id')
            ->map(function ($kelasItems) {

                return [
                    'kelas_id' => $kelasItems->first()['kelas_id'],
                    'nama_kelas' => $kelasItems->first()['nama_kelas'],
                    'jurusan' => $kelasItems->first()['jurusan'],

                    'rombels' => $kelasItems
                        ->groupBy('rombel_id')
                        ->map(function ($rombelItems) {

                            return [
                                'rombel_id' => $rombelItems->first()['rombel_id'],
                                'nama_rombel' => $rombelItems->first()['nama_rombel'],
                                'total_siswa' => $rombelItems->count(),

                                'siswa' => $rombelItems
                                    ->pluck('siswa')
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return ApiResponse::success($grouped, 'Daftar siswa aktif berhasil diambil');
    }





    // spa (get siswa->ta->rombel->jadwal)
    public function showSiswaJadwal($id)
    {
        $allRombel = SiswaRombel::with([
                'siswa',
                'rombel.kelas',
                'rombel.waliRombel',
                'rombel.tahunAkademik',
                'rombel.jadwalPelajarans.rombel',
                'rombel.jadwalPelajarans.ruangan',
                'rombel.jadwalPelajarans.semester',
                'rombel.jadwalPelajarans.guru',
                'rombel.jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
            ])
            ->where('siswa_id', $id)
            ->get();

        if ($allRombel->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        $formatted = $allRombel
            ->groupBy('siswa_id')
            ->map(function ($siswaRombels) {

                $siswa = $siswaRombels->first()->siswa;

                return [
                    'siswa_id' => $siswa->id ?? null,
                    'nama_siswa' => $siswa->nama ?? null,

                    'periode' => $siswaRombels
                        ->map(fn ($sr) => $sr->rombel)
                        ->filter()
                        ->groupBy('tahun_akademik_id')
                        ->map(function ($rombels) {

                            $tahunAkademik = $rombels->first()->tahunAkademik;

                            return [
                                'tahun_akademik_id' => $tahunAkademik->id ?? null,
                                'tahun_akademik' => $tahunAkademik->tahun_akademik ?? null,
                                'status_tahun_akademik' => $tahunAkademik->status ?? null,

                                'histori_rombel' => $rombels->map(function ($rombel) {
                                    return [
                                        'rombel_id' => $rombel->id ?? null,
                                        'nama_rombel' => $rombel->nama_rombel ?? null,
                                        'kelas' => $rombel->kelas->nama_kelas ?? null,
                                        'wali_rombel' => $rombel->waliRombel->nama ?? null,

                                        'histori_jadwal_pelajaran' =>
                                            $rombel->jadwalPelajarans
                                                ->groupBy('semester_id')
                                                ->map(function ($jadwalPelajaran) {

                                                    $smt = $jadwalPelajaran->first()->semester;

                                                    return [
                                                        'semester_id' => $smt->id ?? null,
                                                        'semester' => $smt->semester ?? null,
                                                        'status_semester' => $smt->status ?? null,

                                                        'jadwal_pelajarans' =>
                                                            $jadwalPelajaran->map(function ($jadwal) {

                                                                $mataPelajaran =
                                                                    $jadwal->kurikulumMataPelajaran
                                                                        ->mataPelajaran ?? null;

                                                                return [
                                                                    'jadwal_pelajaran_id' => $jadwal->id ?? null,
                                                                    'mata_pelajaran' => $mataPelajaran->nama_pelajaran ?? null,
                                                                    'hari' => $jadwal->hari ?? null,
                                                                    'guru' => $jadwal->guru->nama ?? null,
                                                                    'rombel' => $jadwal->rombel->nama_rombel ?? null,
                                                                    'jam_mulai' => $jadwal->jam_mulai ?? null,
                                                                    'jam_selesai' => $jadwal->jam_selesai ?? null,
                                                                    'ruangan' => $jadwal->ruangan->nama_ruangan ?? null,
                                                                    'link_opsional' => $jadwal->link_opsional ?? null,
                                                                ];
                                                            })->values(),
                                                    ];
                                                })->values(),
                                    ];
                                })->values(),
                            ];
                        })->values(),
                ];
            })
            ->values();

        return ApiResponse::success($formatted, 'Jadwal berhasil diambil');
    }



}
