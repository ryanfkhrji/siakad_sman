<?php

namespace App\Http\Controllers;
use App\Models\AbsensiPegawai;
use App\Models\JadwalPelajaran;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use File;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Response;
use App\Exports\AbsensiPegawaiExport;

class AbsensiPegawaiController extends Controller
{
    /**
     * ✅ Untuk super admin
     */
    public function index()
    {
        $absen = AbsensiPegawai::with([
                'guru',
                'tahunAkademik',
                'semester',
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            ])
            ->orderBy('hari', 'desc')
            ->get();

        if ($absen->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                ['data' => 'Data absensi tidak ditemukan']
            );
        }

        $formatted = $absen
            ->groupBy('guru_id')
            ->map(function ($absGuru) {

                $guru = $absGuru->first()->guru;

                return [
                    'guru_id' => $guru->id ?? null,
                    'nama' => $guru->nama ?? null,
                    'nip' => $guru->nip ?? null,
                    'nuptk' => $guru->nuptk ?? null,
                    'role' => $guru->role ?? null,

                    'periode' => $absGuru
                        ->groupBy('tahun_akademik_id')
                        ->map(function ($taItems) {

                            $tahunAkademik = $taItems->first()->tahunAkademik;

                            return [
                                'tahun_akademik_id' => $tahunAkademik->id ?? null,
                                'tahun_akademik' => $tahunAkademik->tahun_akademik ?? null,
                                'status_tahun_akademik' => $tahunAkademik->status ?? null,

                                'semester' => $taItems
                                    ->groupBy('semester_id')
                                    ->map(function ($smtItems) {

                                        $semester = $smtItems->first()->semester;

                                        return [
                                            'semester_id' => $semester->id ?? null,
                                            'semester' => $semester->semester ?? null,
                                            'status_semester' => $semester->status ?? null,

                                            'absensis' => $smtItems
                                                ->map(function ($abs) {

                                                    // mata pelajaran OPSIONAL
                                                    $mataPelajaran =
                                                        $abs->jadwalPelajaran
                                                            ?->kurikulumMataPelajaran
                                                            ?->mataPelajaran;

                                                    return [
                                                        'absensi_id' => $abs->id ?? null,
                                                        'tanggal' => $abs->hari ?? null,
                                                        'status' => $abs->status ?? null,

                                                        // hanya ada jika guru mengajar
                                                        'mengajar' => $mataPelajaran->nama_pelajaran ?? null,
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
            'Absensi berhasil diambil'
        );
    }


    // ! Data select (jadwal_plajaran, yang tahun_akademik dan semesternya aktif saja)

    /**
     * ✅ Untuk pegawai
     */
    public function store(Request $request)
    {
        Carbon::setLocale('id');

        $pegawai = Auth::guard('kepegawaian')->user();

        try {
            $validated = $request->validate([
                // ini untuk inputan create absensi pegawai @Ryan
                'status' => 'required|in:hadir,tidak hadir',
            ],[
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir atau tidak hadir'
            ]);            

            $mataPelajaran = JadwalPelajaran::where('guru_id', $pegawai->id)->first();            
            $tahunAkademik = TahunAkademik::where('status', 'aktif')->first();            

            // gabisa absen 2x pada hari yang sama
            $hari = AbsensiPegawai::where('guru_id', $pegawai->id)
            ->whereDate('hari', today())
            ->first();

            if ($hari) {
                return ApiResponse::error('Gagal', ['pesan' => 'Anda sudah absen hari ini'], 422);
            }

            $absensi = AbsensiPegawai::create(
                [
                    'guru_id' => $pegawai->id,
                    'mata_pelajaran_id' => $mataPelajaran->mata_pelajaran_id ?? null,
                    'hari' => Carbon::today()->toDateString(),
                    'tahun_akademik_id' => $tahunAkademik->id ?? null,
                    'status' => $validated['status']
                ]
            );

            $absensi->load('mataPelajaran', 'guru', 'tahunAkademik');            

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'guru_id' => $absensi->guru->nama ?? null,                
                'mata_pelajaran_id' => $absensi->mataPelajaran->nama_pelajaran ?? null,                
                'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026
                'status' => $absensi->status ?? null,                       
                'tahun_akademik_id' => $absensi->tahunAkademik->id ?? null,       
                'tahun_akademik' => $absensi->tahunAkademik->tahun_akademik ?? null,       
                'status_tahun_akademik' => $absensi->tahunAkademik->status ?? null,       
                'semester' => $absensi->tahunAkademik->semester ?? null,       
                'status_semester' => $absensi->tahunAkademik->status ?? null,       
            ], 'Data absensi berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ Untuk super admin
    // show detail pegawai dan semua absennya
    public function show($id)
    {
        $absensi = AbsensiPegawai::with([
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
                'guru',
                'tahunAkademik',
                'semester',
            ])
            ->where('guru_id', $id)
            ->orderBy('hari', 'desc')
            ->get();

        if ($absensi->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                ['data' => 'Data absensi tidak ditemukan']
            );
        }

        $guru = $absensi->first()->guru;

        $groupedByYear = $absensi
            ->groupBy(fn ($abs) => $abs->tahunAkademik?->tahun_akademik)
            ->map(function ($itemsYear, $tahunAkademik) {

                // 🔹 TOTAL PER TAHUN
                $totalHadirYear = $itemsYear->where('status', 'hadir')->count();
                $totalTidakHadirYear = $itemsYear->where('status', 'tidak hadir')->count();

                // 🔹 GROUP MAPEL (dari kurikulum_mata_pelajaran)
                $mataPelajaran = $itemsYear
                    ->groupBy(fn ($abs) =>
                        $abs->jadwalPelajaran
                            ?->kurikulumMataPelajaran
                            ?->mata_pelajaran_id
                    )
                    ->map(function ($itemsMapel) {

                        $mapel = $itemsMapel->first()
                            ->jadwalPelajaran
                            ?->kurikulumMataPelajaran
                            ?->mataPelajaran;

                        // 🔹 GROUP PER SEMESTER
                        $semester = $itemsMapel
                            ->groupBy(fn ($abs) => $abs->semester?->semester)
                            ->map(function ($itemsSemester, $semester) {

                                $totalHadirSemester = $itemsSemester->where('status', 'hadir')->count();
                                $totalTidakHadirSemester = $itemsSemester->where('status', 'tidak hadir')->count();

                                return [
                                    'semester' => $semester,
                                    'status_semester' => $itemsSemester->first()->semester->status ?? null,

                                    'total_hadir' => $totalHadirSemester,
                                    'total_tidak_hadir' => $totalTidakHadirSemester,

                                    'rincian' => $itemsSemester->map(function ($abs) {
                                        return [
                                            'absensi_id' => $abs->id,
                                            'hari' => Carbon::parse($abs->hari)
                                                ->translatedFormat('l, d F Y'),
                                            'status' => $abs->status,
                                        ];
                                    })->values(),
                                ];
                            })
                            ->values();

                        return [
                            'mata_pelajaran_id' => $mapel->id ?? null,
                            'nama_mata_pelajaran' => $mapel->nama_pelajaran ?? null,
                            'semester' => $semester,
                        ];
                    })
                    ->values();

                return [
                    'tahun_akademik' => $tahunAkademik,
                    'status_tahun_akademik' => $itemsYear->first()->tahunAkademik->status ?? null,

                    'total_hadir' => $totalHadirYear,
                    'total_tidak_hadir' => $totalTidakHadirYear,

                    'mata_pelajaran' => $mataPelajaran,
                ];
            })
            ->values();

        $formatted = [
            'guru_id' => $guru->id,
            'nama' => $guru->nama ?? null,
            'absensi' => $groupedByYear,
        ];

        return ApiResponse::success(
            [$formatted],
            'Absensi pegawai berhasil diambil'
        );
    }



    // ✅ show all absen sendiri (untuk pegawai)
    public function showAbsenSendiri()
    {
        $guru = Auth::guard('kepegawaian')->user();

        $absensi = AbsensiPegawai::with([
            'mataPelajaran',
            'tahunAkademik'
        ])
        ->where('guru_id', $guru->id)
        ->orderBy('hari', 'desc')
        ->get();

        if ($absensi->isEmpty()) {
            return ApiResponse::error(
                'Absensi tidak ditemukan',
                ['data' => ['Data tidak ditemukan']],
                404
            );
        }

        $first = $absensi->first();

        // 🔹 GROUP BERDASARKAN STRING TAHUN AKADEMIK (contoh: 2025/2026)
        $groupedByYear = $absensi
            ->groupBy(fn ($abs) => $abs->tahunAkademik->tahun_akademik)
            ->map(function ($itemsYear, $tahunAkademik) {

                // total per tahun (gabungan ganjil + genap)
                $totalHadir = $itemsYear->where('status', 'hadir')->count();
                $totalTidakHadir = $itemsYear->where('status', 'tidak hadir')->count();

                // 🔹 GROUP PER SEMESTER (AMBIL DARI DB)
                $semester = $itemsYear
                    ->groupBy(fn ($abs) => $abs->tahunAkademik->semester)
                    ->map(function ($itemsSemester, $semester) {

                        return [
                            'semester' => $semester,
                            'rincian' => $itemsSemester->map(function ($abs) {
                                return [
                                    'absensi_id' => $abs->id,
                                    'hari' => Carbon::parse($abs->hari)
                                        ->translatedFormat('l, d F Y'),
                                    'status' => $abs->status,
                                ];
                            })->values(),
                        ];
                    })
                    ->values();

                return [
                    'tahun_akademik' => $tahunAkademik,
                    'status_tahun_akademik' => $itemsYear->first()->tahunAkademik->status ?? null,
                    
                    'total_hadir' => $totalHadir,
                    'total_tidak_hadir' => $totalTidakHadir,
                    'semester' => $semester,
                    'status_semester' => $itemsYear->first()->tahunAkademik->status ?? null,
                ];
            })
            ->values();

        // 🔹 FINAL RESPONSE
        $formatted = [
            'guru_id' => $guru->id,
            'nama' => $guru->nama ?? null,
            'wali_kelas' => $guru->kelas->nama_kelas ?? null,
            'mata_pelajaran_id' => $first->mataPelajaran->id ?? null,
            'nama_mata_pelajaran' => $first->mataPelajaran->nama_pelajaran ?? null,
            'absensi' => $groupedByYear,
        ];

        return ApiResponse::success(
            [$formatted],
            'Absensi guru berhasil diambil'
        );
    }


    /**
     * ✅ Untuk super admin
     */
    public function update(Request $request, string $id)
    {
        $absensi = AbsensiPegawai::find($id);

        if (!$absensi) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([            
            'status' => 'sometimes|required|in:hadir,tidak hadir',
        ], [            
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan hanya hadir atau tidak hadir'
        ]);                

        $absensi->update($validated);

        $absensi->load([
            'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'guru',
            'tahunAkademik',
            'semester'
        ]);           

        return ApiResponse::success([
            'id' => $absensi->id ?? null,
            'guru_id' => $absensi->guru->nama ?? null,                
            'mata_pelajaran' => $absensi->jadwalPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,                
            'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026
            'status' => $absensi->status ?? null,                   
            'tahun_akademik' => $absensi->tahunAkademik->tahun_akademik ?? null,                   
            'status_tahun_akademik' => $absensi->tahunAkademik->status ?? null,                   
            'semester' => $absensi->semester->semester ?? null,                   
            'status_semester' => $absensi->semester->status ?? null,                   
        ], 'Data absensi berhasil diperbarui');
    }

    /**
     * ✅ untuk super admin
     * Remove the specified resource from storage.
     * Beberapa data = DELETE /absensi/pegawai/sekolah/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /absensi/pegawai/sekolah/destroy?ids=7
     */
    public function destroyData(Request $request)
    {
        $ids = $request->ids;

        // =========================
        // VALIDASI PARAMETER
        // =========================
        if (!$ids || (!is_array($ids) && !is_numeric($ids))) {
            return response()->json([
                'message' => 'Parameter ids tidak valid. Kirimkan satu id atau array id.'
            ], 422);
        }

        // Normalisasi ke array
        $ids = is_array($ids) ? $ids : [$ids];

        // =========================
        // AMBIL DATA + RELASI
        // =========================
        $absensis = AbsensiPegawai::with('tahunAkademik', 'semester')
            ->whereIn('id', $ids)
            ->get();

        // =========================
        // CEK ID TIDAK DITEMUKAN
        // =========================
        $foundIds = $absensis->pluck('id')->toArray();
        $invalidIds = array_diff($ids, $foundIds);

        if (!empty($invalidIds)) {
            return response()->json([
                'message' => 'Beberapa ID tidak ditemukan.',
                'invalid_ids' => array_values($invalidIds)
            ], 404);
        }

        // =========================
        // CEK STATUS AKTIF
        // =========================
        $tidakAktif = $absensis->contains(function ($abs) {
            return
                !$abs->tahunAkademik ||
                !$abs->semester ||
                $abs->tahunAkademik->status !== 'aktif' ||
                $abs->semester->status !== 'aktif';
        });

        if ($tidakAktif) {
            return ApiResponse::error(
                'Tidak bisa dihapus',
                ['data' => 'Absensi hanya bisa dihapus jika tahun akademik dan semester masih aktif']
            );
        }

        // =========================
        // DELETE (HARD DELETE)
        // =========================
        AbsensiPegawai::whereIn('id', $ids)->delete();

        return response()->json([
            'message' => count($ids) > 1
                ? 'Beberapa data absensi berhasil dihapus.'
                : 'Data absensi berhasil dihapus.',
            'deleted_ids' => $ids
        ]);
    }


    // ✅ export data ke excel
    /**
     * php artisan make:export AbsensiPegawaiExport --model=AbsensiPegawai
     * Semua data = GET /absensi/pegawai/sekolah/export
     * Beberapa data = GET /absensi/pegawai/sekolah/export?ids[]=3&ids[]=5&ids[]=10
     * Satu data = GET /absensi/pegawai/sekolah/export?ids[]=7
     */
    public function export(Request $request)
    {
        $ids = $request->input('ids');

        // ❗ WAJIB array & tidak kosong
        if (!$ids || !is_array($ids)) {
            return response()->json([
                'status' => 'error',
                'message' => 'ID absensi wajib dikirim dalam bentuk array',
            ], 422);
        }

        // Ambil ID yang valid
        $validIds = AbsensiPegawai::whereIn('id', $ids)->pluck('id')->toArray();

        // Cari ID yang tidak ada
        $missingIds = array_values(array_diff($ids, $validIds));

        if (!empty($missingIds)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Beberapa ID absensi tidak ditemukan',
                'missing_ids' => $missingIds,
            ], 404);
        }

        // ✅ SEMUA ID VALID → EXPORT
        return Excel::download(
            new AbsensiPegawaiExport($validIds),
            'absensi-pegawai-harian.xlsx'
        );
    }
}
