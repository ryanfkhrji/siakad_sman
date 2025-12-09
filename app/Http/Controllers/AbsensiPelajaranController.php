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
        $absen = AbsensiPelajaran::with('jadwalPelajaran.mataPelajaran','jadwalPelajaran.kelas', 'guru', 'kelas')
            ->orderBy('hari', 'desc')
            ->get();
    
        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }
    
        // Kelompokkan berdasarkan guru_id
        $grouped = $absen->groupBy('guru_pengajar_id')->map(function ($item) {
            $guruId = $item->first()->guru->id ?? null;
            $namaGuru = $item->first()->guru->nama ?? null;
            $namaPelajaran = $item->first()->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null;
            $namaKelas = $item->first()->jadwalPelajaran->kelas->nama_kelas ?? null;
    
            return [
                'guru_id' => $guruId,
                'nama_guru' => $namaGuru,
                'wali_kelas' => $namaKelas,
                'mata_pelajaran' => $namaPelajaran,
                'total_hadir' => $item->where('status', 'hadir')->count(),
                'total_tidak_hadir' => $item->where('status', 'tidak hadir')->count(),
                'absensi' => $item->map(function ($abs) {
                    return [
                        'id' => $abs->id,
                        'kelas' => $abs->kelas->nama_kelas ?? null,
                        'hari' => Carbon::parse($abs->hari)->translatedFormat('l, d F Y') ?? null,
                        'jam' => $abs->jam,                       
                        'status' => $abs->status,
                    ];
                })->values()
            ];
        })->values();
    
        return ApiResponse::success($grouped, 'Absensi berhasil diambil');
    }

     // ✅ Untuk super admin
    // show detail pelajaran dan semua absennya
    public function show($id) {
        
        $absen = AbsensiPelajaran::with('jadwalPelajaran.mataPelajaran', 'guru.kelas', 'kelas')
            ->where('guru_pengajar_id', $id)
            ->orderBy('hari', 'desc')
            ->get();
    
        if (!$absen) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }            
    
        // Kelompokkan berdasarkan mata_pelajaran_id
        $grouped = $absen->groupBy('guru_pengajar_id')->map(function ($item) {
            $namaGuru = $item->first()->guru->nama ?? null;
            $namaPelajaran = $item->first()->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null;
            $kelas = $item->first()->guru->kelas->nama_kelas ?? null;
    
            return [
                'guru_id' => $item->first()->guru_pengajar_id ?? null,
                'nama_guru' => $namaGuru ?? null,
                'wali_kelas' => $kelas ?? null,
                'mengajar' => $namaPelajaran ?? null,
                'total_hadir' => $item->where('status', 'hadir')->count(),
                'total_tidak_hadir' => $item->where('status', 'tidak hadir')->count(),
                'absensi' => $item->map(function ($abs) {
                    return [
                        'id' => $abs->id ?? null,
                        'kelas' => $abs->kelas->nama_kelas ?? null,
                        'hari' => Carbon::parse($abs->hari)->translatedFormat('l, d F Y') ?? null,
                        'jam' => $abs->jam ?? null,
                        'status' => $abs->status ?? null,
                    ];
                })->values()
            ];
        })->values();
    
        return ApiResponse::success($grouped, 'Detail absensi berhasil diambil');
    }

    /**
     * ✅ Untuk pegawai
     */
    public function store(Request $request)
    {
        Carbon::setLocale('id');

        $pegawai = Auth::guard('kepegawaian')->user();

        try {
            $validated = $request->validate([                
                'kelas_id' => 'required|exists:kelas,id', // otomatis input (front)
                'status' => 'required|in:hadir,tidak hadir'
            ],[
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir atau tidak hadir'
            ]);            

            // ambil id pada jadwal pelajaran
            $mataPelajaran = JadwalPelajaran::with('mataPelajaran')->where('guru_id', $pegawai->id)->first();

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
                    'kelas_id' => $validated['kelas_id'],
                    'hari' => Carbon::today()->toDateString(),
                    'jam' => now()->format('H:i'),
                    'status' => $validated['status']
                ]
            );

            $absensi->load('jadwalPelajaran.mataPelajaran', 'jadwalPelajaran.kelas','guru');

            $jumlahHadir = AbsensiPelajaran::where('guru_pengajar_id', $absensi->guru_pengajar_id)
            ->where('status', 'hadir')
            ->count();

            $jumlahTidakHadir = AbsensiPelajaran::where('guru_pengajar_id', $absensi->guru_pengajar_id)
            ->where('status', 'tidak hadir')
            ->count();

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'guru_pengajar_id' => $absensi->guru->nama ?? null,                
                'mata_pelajaran_id' => $absensi->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,               
                'kelas' => $absensi->jadwalPelajaran->kelas->nama_kelas ?? null,
                'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026
                'jam' => $absensi->jam,
                'status' => $absensi->status ?? null,       
                'rekapitulasi' => [
                    'hadir' => $jumlahHadir,
                    'tidak_hadir' => $jumlahTidakHadir
                ]
            ], 'Data absensi pelajaran '.$absensi->jadwalPelajaran->mataPelajaran->nama_pelajaran.' berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ show all absen sendiri (untuk pegawai)
    public function showAbsenPelajaranSendiri() {
        // ambil id user sekarang
        $user = Auth::guard('kepegawaian')->user();

        $absen = AbsensiPelajaran::with('jadwalPelajaran.mataPelajaran', 'guru', 'kelas')
            ->where('guru_pengajar_id', $user->id)
            ->orderBy('hari', 'desc')
            ->get();

        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }
    
        // Kelompokkan berdasarkan kelas_id
        $grouped = $absen->groupBy('guru_pengajar_id')->map(function ($item) {
            $namaGuru = $item->first()->guru->nama ?? null;
            $namaPelajaran = $item->first()->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null;
            $kelas = $item->first()->guru->kelas->nama_kelas ?? null;
    
            return [
                'guru_pengajar_id' => $item->first()->guru_pengajar_id ?? null,
                'nama_guru' => $namaGuru ?? null,
                'mengajar' => $namaPelajaran ?? null,
                'wali_kelas' => $kelas ?? null,
                'total_hadir' => $item->where('status', 'hadir')->count(),
                'total_tidak_hadir' => $item->where('status', 'tidak hadir')->count(),
                'absensi' => $item->map(function ($abs) {
                    return [
                        'id' => $abs->id ?? null,
                        'kelas' => $abs->kelas->nama_kelas ?? null,
                        'hari' => Carbon::parse($abs->hari)->translatedFormat('l, d F Y') ?? null,
                        'jam' => $abs->jam ?? null,
                        'status' => $abs->status ?? null,
                    ];
                })->values()
            ];
        })->values();

        return ApiResponse::success($grouped, 'Absensi berhasil diambil');
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
        ], [            
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan hanya hadir atau tidak hadir'
        ]);        

        $absensi->update($validated);
        $absensi->load('jadwalPelajaran.mataPelajaran', 'guru', 'kelas');    

        // hitung jumlah hadir/tidak hadir khusus guru ini
        $jumlahHadir = AbsensiPelajaran::where('guru_pengajar_id', $absensi->guru_pengajar_id)
        ->where('status', 'hadir')
        ->count();

        $jumlahTidakHadir = AbsensiPelajaran::where('guru_pengajar_id', $absensi->guru_pengajar_id)
        ->where('status', 'tidak hadir')
        ->count();        

        return ApiResponse::success([
            'id' => $absensi->id ?? null,
            'guru_pengajar' => $absensi->guru->nama ?? null,                
            'mata_pelajaran' => $absensi->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,                
            'kelas' => $absensi->kelas->nama_kelas ?? null,                
            'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
            'jam' => $absensi->jam ?? null,       
            'status' => $absensi->status ?? null,       
            'rekapitulasi' => [
                'hadir' => $jumlahHadir,
                'tidak_hadir' => $jumlahTidakHadir
            ]
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
