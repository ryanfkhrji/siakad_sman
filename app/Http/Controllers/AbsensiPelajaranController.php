<?php

namespace App\Http\Controllers;
use App\Models\AbsensiPelajaran;
use App\Models\JadwalPelajaran;
use App\Models\Kelas;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use File;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Response;
use App\Exports\AbsensiPelajaranExport;

class AbsensiPelajaranController extends Controller
{
    /**
     * ✅ Untuk super admin
     */
    public function index()
    {
        $absen = AbsensiPelajaran::with([
            'jadwalPelajaran.kelas',
            'jadwalPelajaran.mataPelajaran',
            'guru.kelas',
            'tahunAkademik'
        ])
        ->orderBy('hari', 'desc')
        ->get();

        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Data absensi tidak ditemukan'
            ]);
        }

        $result = $absen
            ->groupBy('guru_pengajar_id')
            ->map(function ($absenGuru) {

                $first = $absenGuru->first();
                $guru  = $first->guru;

                return [
                    'guru_id' => $guru->id ?? null,
                    'nama_guru' => $guru->nama ?? null,
                    'wali_kelas' => $guru->kelas->nama_kelas ?? null,

                    // asumsi 1 guru = 1 mapel
                    'mata_pelajaran' =>
                        $first->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,

                    // 🔹 GROUP BERDASARKAN STRING TAHUN AKADEMIK
                    'tahun_akademik' => $absenGuru
                        ->groupBy(fn ($abs) => $abs->tahunAkademik->tahun_akademik)
                        ->map(function ($absenPerTahun, $tahunAkademik) {

                            // total per tahun (gabungan ganjil + genap)
                            $totalHadir = $absenPerTahun->where('status', 'hadir')->count();
                            $totalTidakHadir = $absenPerTahun->where('status', 'tidak hadir')->count();

                            // 🔹 GROUP PER SEMESTER (AMBIL DARI DB)
                            $semester = $absenPerTahun
                                ->groupBy(fn ($abs) => $abs->tahunAkademik->semester)
                                ->map(function ($absenSemester, $semester) {

                                    // 🔹 GROUP PER KELAS
                                    $kelas = $absenSemester
                                        ->groupBy('jadwalPelajaran.kelas_id')
                                        ->map(function ($absenKelas) {

                                            $kelasData = $absenKelas->first()
                                                ->jadwalPelajaran
                                                ->kelas;

                                            return [
                                                'kelas' => $kelasData->nama_kelas ?? null,
                                                'rincian' => $absenKelas->map(function ($abs) {
                                                    return [
                                                        'hari' => Carbon::parse($abs->hari)
                                                            ->translatedFormat('l, d F Y'),
                                                        'status_kehadiran' => $abs->status,
                                                    ];
                                                })->values(),
                                            ];
                                        })->values();

                                    return [
                                        'semester' => $semester,
                                        'kelas' => $kelas,
                                    ];
                                })->values();

                            return [
                                'tahun_akademik' => $tahunAkademik,
                                'status_tahun_akademik' => $absenPerTahun->first()->tahunAkademik->status ?? null,

                                'total' => [
                                    'hadir' => $totalHadir,
                                    'tidak_hadir' => $totalTidakHadir,
                                ],

                                'semester' => $semester,
                                'status_semester' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                            ];
                        })->values(),
                ];
            })->values();

        return ApiResponse::success($result, 'Absensi berhasil diambil');
    }

    /**
     * ✅ Untuk pegawai
     */
    public function store(Request $request)
    {
        Carbon::setLocale('id');

        $pegawai = Auth::guard('kepegawaian')->user();

        if ($pegawai->role != 'guru') {
            return ApiResponse::error('Tidak valid', ['pesan' => 'Anda bukan guru']);
        }

        try {
            $validated = $request->validate([                
                'status' => 'required|in:hadir,tidak hadir',
                'tahun_akademik_id' => 'required|exists:tahun_akademik,id'
            ],[
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir atau tidak hadir',
                'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
                'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',
            ]);            

            // ambil id pada jadwal pelajaran
            $mataPelajaran = JadwalPelajaran::with('kurikulumMataPelajaran.mataPelajaran')->where('guru_id', $pegawai->id)->first();

            if ($mataPelajaran == null) {
                return ApiResponse::error('Tidak valid', ['pesan' => 'Anda belum memiliki jadwal pelajaran']);
            }

            $kelas = Kelas::where('id', $validated['kelas_id'])->first();

            // gabisa absen 2x pada hari yang sama
            $hari = AbsensiPelajaran::where('guru_pengajar_id', $pegawai->id)
            ->where('jadwal_pelajaran_id', $mataPelajaran->mata_pelajaran_id)
            ->where('kelas_id', $validated['kelas_id'])
            ->whereDate('hari', today())
            ->first();

            if ($hari) {
                return ApiResponse::error('Gagal', ['pesan' => 'Anda sudah absen di kelas '.$kelas->nama_kelas.' hari ini'], 422);
            }
           
            $absensi = AbsensiPelajaran::create(
                [
                    'guru_pengajar_id' => $pegawai->id,
                    'jadwal_pelajaran_id' => $mataPelajaran->mata_pelajaran_id,
                    'hari' => Carbon::today()->toDateString(),
                    'status' => $validated['status'],
                    'tahun_akademik_id' => $validated['tahun_akademik_id'],
                ]
            );

            $absensi->load('jadwalPelajaran.mataPelajaran', 'guru');           

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'guru_pengajar_id' => $absensi->guru->nama ?? null,                
                'mata_pelajaran' => $mataPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,               
                'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
                'status_kehadiran' => $absensi->status ?? null,                       
                'tahun_akademik_id' => $absensi->jadwalPelajaran->tahunAkademik->id ?? null,                       
                'tahun_akademik' => $absensi->jadwalPelajaran->tahunAkademik->tahun_akademik ?? null,                       
                'status_tahun_akademik' => $absensi->jadwalPelajaran->tahunAkademik->status ?? null,                       
                'semester' => $absensi->jadwalPelajaran->tahunAkademik->semester ?? null,                       
                'status_semester' => $absensi->jadwalPelajaran->tahunAkademik->status ?? null,                       
            ], 'Data absensi pelajaran '.$mataPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran.' berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    // ✅ show untuk spa
    // get guru dan seluruh absennya
    public function show($id)
    {
        $absen = AbsensiPelajaran::with([
            'jadwalPelajaran.kelas',
            'jadwalPelajaran.mataPelajaran',
            'guru.kelas',
            'tahunAkademik'
        ])
        ->where('guru_pengajar_id', $id)
        ->orderBy('hari', 'desc')
        ->get();

        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Data absensi tidak ditemukan'
            ]);
        }

        $first = $absen->first();
        $guru  = $first->guru;

        $result = [
            'guru_id'    => $guru->id ?? null,
            'nama_guru'  => $guru->nama ?? null,
            'wali_kelas' => $guru->kelas->nama_kelas ?? null,

            // aturan: 1 guru = 1 mapel
            'mata_pelajaran' =>
                $first->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,

            // 🔹 GROUP BERDASARKAN STRING TAHUN AKADEMIK
            'tahun_akademik' => $absen
                ->groupBy(fn ($abs) => $abs->tahunAkademik->tahun_akademik)
                ->map(function ($absenPerTahun, $tahunAkademik) {

                    // total tahunan (gabungan ganjil + genap)
                    $totalHadir = $absenPerTahun->where('status', 'hadir')->count();
                    $totalTidakHadir = $absenPerTahun->where('status', 'tidak hadir')->count();

                    // 🔹 GROUP PER SEMESTER (DARI DB)
                    $semester = $absenPerTahun
                        ->groupBy(fn ($abs) => $abs->tahunAkademik->semester)
                        ->map(function ($absenSemester, $semester) {

                            // 🔹 GROUP PER KELAS
                            $kelas = $absenSemester
                                ->groupBy('jadwalPelajaran.kelas_id')
                                ->map(function ($absenKelas) {

                                    $kelasData = $absenKelas->first()
                                        ->jadwalPelajaran
                                        ->kelas;

                                    return [
                                        'kelas' => $kelasData->nama_kelas ?? null,
                                        'rincian' => $absenKelas->map(function ($abs) {
                                            return [
                                                'absensi_id' => $abs->id,
                                                'hari' => Carbon::parse($abs->hari)
                                                    ->translatedFormat('l, d F Y'),
                                                'status_kehadiran' => $abs->status,
                                            ];
                                        })->values(),
                                    ];
                                })->values();

                            return [
                                'semester' => $semester,
                                'kelas' => $kelas,
                            ];
                        })->values();

                    return [
                        'tahun_akademik' => $tahunAkademik,
                        'status_tahun_akademik' => $absenPerTahun->first()->tahunAkademik->status ?? null,

                        'total' => [
                            'hadir' => $totalHadir,
                            'tidak_hadir' => $totalTidakHadir,
                        ],

                        'semester' => $semester,
                        'status_semester' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                    ];
                })->values(),
        ];

        // data untuk select
        $tahun_akademik = TahunAkademik::where('status', 'aktif')->get();

        return ApiResponse::success(
            [
                'data' => $result,
                'data_untuk_select' => $tahun_akademik,
            ],
            'Absensi berhasil diambil'
        );
    }



    // ✅ show all absen sendiri (untuk pegawai)
    public function showAbsenPelajaranSendiri()
    {
        $user = Auth::guard('kepegawaian')->user();

        $absen = AbsensiPelajaran::with([
            'jadwalPelajaran.kelas',
            'jadwalPelajaran.mataPelajaran',
            'guru.kelas',
            'tahunAkademik'
        ])
        ->where('guru_pengajar_id', $user->id)
        ->orderBy('hari', 'desc')
        ->get();

        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Data absensi tidak ditemukan'
            ]);
        }

        $first = $absen->first();
        $guru  = $first->guru;

        $result = [
            'guru_id'    => $guru->id ?? null,
            'nama_guru'  => $guru->nama ?? null,
            'wali_kelas' => $guru->kelas->nama_kelas ?? null,

            // aturan: 1 guru = 1 mapel
            'mata_pelajaran' =>
                $first->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,

            // 🔹 GROUP BERDASARKAN STRING TAHUN AKADEMIK
            'tahun_akademik' => $absen
                ->groupBy(fn ($abs) => $abs->tahunAkademik->tahun_akademik)
                ->map(function ($absenPerTahun, $tahunAkademik) {

                    // total tahunan (gabungan ganjil + genap)
                    $totalHadir = $absenPerTahun->where('status', 'hadir')->count();
                    $totalTidakHadir = $absenPerTahun->where('status', 'tidak hadir')->count();

                    // 🔹 GROUP PER SEMESTER (DARI DB)
                    $semester = $absenPerTahun
                        ->groupBy(fn ($abs) => $abs->tahunAkademik->semester)
                        ->map(function ($absenSemester, $semester) {

                            // 🔹 GROUP PER KELAS
                            $kelas = $absenSemester
                                ->groupBy('jadwalPelajaran.kelas_id')
                                ->map(function ($absenKelas) {

                                    $kelasData = $absenKelas->first()
                                        ->jadwalPelajaran
                                        ->kelas;

                                    return [
                                        'kelas' => $kelasData->nama_kelas ?? null,
                                        'rincian' => $absenKelas->map(function ($abs) {
                                            return [
                                                'absensi_id' => $abs->id,
                                                'hari' => Carbon::parse($abs->hari)
                                                    ->translatedFormat('l, d F Y'),
                                                'status_kehadiran' => $abs->status,
                                            ];
                                        })->values(),
                                    ];
                                })->values();

                            return [
                                'semester' => $semester,
                                'kelas' => $kelas,
                            ];
                        })->values();

                    return [
                        'tahun_akademik' => $tahunAkademik,
                        'status_tahun_akademik' => $absenPerTahun->first()->tahunAkademik->status ?? null,

                        'total' => [
                            'hadir' => $totalHadir,
                            'tidak_hadir' => $totalTidakHadir,
                        ],

                        'semester' => $semester,
                        'status_semester' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                    ];
                })->values(),
        ];

        // data untuk select
        $tahun_akademik = TahunAkademik::where('status', 'aktif')->get();

        return ApiResponse::success(
            [
                'data' => $result,
                'data_untuk_select' => $tahun_akademik,
            ],
            'Absensi berhasil diambil'
        );
    }

    /**
     * ✅ untuk super admin
     */
    public function update(Request $request, string $id)
    {
        $absensi = AbsensiPelajaran::find($id);

        if (!$absensi) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        $validated = $request->validate([            
            'status' => 'sometimes|required|in:hadir,tidak hadir',
            'tahun_akademik_id' => 'sometimes|required|exists:tahun_akademik,id',
        ], [            
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan hanya hadir atau tidak hadir',
            'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
            'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',
        ]);        

        $absensi->update($validated);
        $absensi->load('jadwalPelajaran.mataPelajaran', 'guru');             

        return ApiResponse::success([
            'id' => $absensi->id ?? null,
            'guru_pengajar_id' => $absensi->guru->nama ?? null,                
            'mata_pelajaran' => $mataPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,               
            'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
            'status_kehadiran' => $absensi->status ?? null,                       
            'tahun_akademik_id' => $absensi->jadwalPelajaran->tahunAkademik->id ?? null,                       
            'tahun_akademik' => $absensi->jadwalPelajaran->tahunAkademik->tahun_akademik ?? null,                       
            'status_tahun_akademik' => $absensi->jadwalPelajaran->tahunAkademik->status ?? null,                       
            'semester' => $absensi->jadwalPelajaran->tahunAkademik->semester ?? null,                       
            'status_semester' => $absensi->jadwalPelajaran->tahunAkademik->status ?? null,                       
        ], 'Data absensi berhasil diperbarui');
    }

    /**
     * ✅ untuk super admin
     * Remove the specified resource from storage.
     * Beberapa data = DELETE /absensi/pegawai/pelajaran/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /absensi/pegawai/pelajaran/destroy?ids=7
     */
    public function destroyData(Request $request)
    {
        $ids = $request->ids;        

        // HAPUS BEBERAPA DATA
        if (is_array($ids)) {
            $validIds = AbsensiPelajaran::whereIn('id', $ids)->pluck('id')->toArray();
            $invalidIds = array_diff($ids, $validIds);

            // Jika terdapat id yang tidak ada
            if (!empty($invalidIds)) {
                return response()->json([
                    'message' => 'Beberapa ID tidak ditemukan.',
                    'invalid_ids' => array_values($invalidIds)
                ], 404);
            }

            AbsensiPelajaran::whereIn('id', $validIds)->delete();
            return response()->json([
                'message' => 'Beberapa data absensi pegawai berhasil dihapus.',
                'deleted_ids' => $validIds
            ]);
        }

        // HAPUS SATU DATA
        if (is_numeric($ids)) {
            $absensi = AbsensiPelajaran::find($ids);

            if (!$absensi) {
                return response()->json([
                    'message' => 'Data tidak ditemukan.',
                    'invalid_id' => $ids
                ], 404);
            }

            $absensi->delete();
            return response()->json([
                'message' => 'Data absensi berhasil dihapus.',
                'deleted_id' => $ids
            ]);
        }

        return response()->json([
            'message' => 'Parameter ids tidak valid. Kirimkan satu id, atau array id.'
        ], 422);
    }

    // ✅ export data ke excel
    /**
     * php artisan make:export AbsensiPegawaiExport --model=AbsensiPegawai
     * Semua data = GET /absensi/pegawai/pelajaran/export
     * Beberapa data = GET /absensi/pegawai/pelajaran/export?ids[]=3&ids[]=5&ids[]=10
     * Satu data = GET /absensi/pegawai/pelajaran/export?ids[]=7
     */
    public function export(Request $request)
    {
        $ids = $request->input('ids'); // bisa null atau array        

         // Validasi ID jika ada
         if ($ids) {
            $validIds = AbsensiPelajaran::whereIn('id', $ids)->pluck('id')->toArray();
            $missingIds = array_diff($ids, $validIds);

            if (count($missingIds) > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Beberapa ID tidak ditemukan',
                    'missing_ids' => array_values($missingIds),
                ], 404);
            }
        }

        return Excel::download(new AbsensiPelajaranExport($ids), 'absensi-pelajaran-guru.xlsx');
    }
}
