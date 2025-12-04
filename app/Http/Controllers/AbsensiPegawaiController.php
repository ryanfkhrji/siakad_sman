<?php

namespace App\Http\Controllers;
use App\Models\AbsensiPegawai;
use App\Models\JadwalPelajaran;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\ApiResponse;
use App\Exports\AbsensiPegawaiExport;
use Illuminate\Support\Facades\Validator;
use File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AbsensiPegawaiController extends Controller
{
    /**
     * ✅ Untuk super admin
     */
    public function index()
    {
        $absen = AbsensiPegawai::with('mataPelajaran', 'guru')
            ->orderBy('tanggal', 'desc')
            ->get();
    
        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }
    
        // Kelompokkan berdasarkan guru_id
        $grouped = $absen->groupBy('guru_id')->map(function ($item) {
            $namaGuru = $item->first()->guru->nama ?? null;
            $namaPelajaran = $item->first()->mataPelajaran->nama_pelajaran ?? null;
    
            return [
                'nama_guru' => $namaGuru,
                'mengajar' => $namaPelajaran,
                'total_hadir' => $item->where('status', 'hadir')->count(),
                'total_tidak_hadir' => $item->where('status', 'tidak hadir')->count(),
                'absensi' => $item->map(function ($abs) {
                    return [
                        'id' => $abs->id,
                        'tanggal' => Carbon::parse($abs->tanggal)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026                        
                        'status' => $abs->status,
                    ];
                })->values()
            ];
        })->values();
    
        return ApiResponse::success($grouped, 'Absensi berhasil diambil');
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
                'status' => 'required|in:hadir,tidak hadir'
            ],[
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir atau tidak hadir'
            ]);            

            $mataPelajaran = JadwalPelajaran::where('guru_id', $pegawai->id)->first();

            // gabisa absen 2x pada hari yang sama
            $tanggal = AbsensiPegawai::where('guru_id', $pegawai->id)
            ->whereDate('tanggal', today())
            ->first();

            if ($tanggal) {
                return ApiResponse::error('Gagal', ['pesan' => 'Anda sudah absen hari ini'], 422);
            }

            $absensi = AbsensiPegawai::create(
                [
                    'guru_id' => $pegawai->id,
                    'mata_pelajaran_id' => $mataPelajaran->id,
                    'tanggal' => Carbon::today()->toDateString(),
                    'status' => $validated['status']
                ]
            );

            $absensi->load('mataPelajaran', 'guru');

            $jumlahHadir = AbsensiPegawai::where('guru_id', $absensi->guru_id)
            ->where('status', 'hadir')
            ->count();

            $jumlahTidakHadir = AbsensiPegawai::where('guru_id', $absensi->guru_id)
            ->where('status', 'tidak hadir')
            ->count();

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'guru_id' => $absensi->guru->nama ?? null,                
                'mata_pelajaran_id' => $absensi->mataPelajaran->nama_pelajaran ?? null,                
                // 'tanggal' => Carbon::parse($absensi->tanggal)->translatedFormat('l, d-m-Y') ?? null,   // Senin, 24-06-2026
                'tanggal' => Carbon::parse($absensi->tanggal)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026
                'status' => $absensi->status ?? null,       
                'rekapitulasi' => [
                    'hadir' => $jumlahHadir,
                    'tidak_hadir' => $jumlahTidakHadir
                ]
            ], 'Data absensi berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    // ✅ show all absen sendiri (untuk pegawai)
    public function showAbsenSendiri() {
        $user = Auth::guard('kepegawaian')->user();
        $matpel = JadwalPelajaran::with('mataPelajaran')->where('guru_id', $user->id)->first();

        $absensi = AbsensiPegawai::with('mataPelajaran')->where('guru_id', $user->id)->get();

        if ($absensi->isEmpty()) {
            return ApiResponse::error('Absensi tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // hitung jumlah hadir/tidak hadir khusus guru ini
        $jumlahHadir = AbsensiPegawai::where('guru_id', $user->id)
        ->where('status', 'hadir')
        ->count();

        $jumlahTidakHadir = AbsensiPegawai::where('guru_id', $user->id)
        ->where('status', 'tidak hadir')
        ->count();

        $formatted = [
            'nama' => $user->nama ?? null,
            'mata_pelajaran_id' => $matpel->mataPelajaran->nama_pelajaran ?? null,
            'total_hadir' => $jumlahHadir ?? null,
            'total_tidak_hadir' => $jumlahTidakHadir ?? null,
            'absensi' => $absensi->map(function ($item) {
                return [
                    'id' => $item->id ?? null,                    
                    'tanggal' => Carbon::parse($item->tanggal)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026                                
                    'status' => $item->status ?? null,
                ];
            }),
        ];

        return ApiResponse::success($formatted, 'Absensi berhasil diambil');
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
        $absensi->load('mataPelajaran', 'guru');    

        // hitung jumlah hadir/tidak hadir khusus guru ini
        $jumlahHadir = AbsensiPegawai::where('guru_id', $absensi->guru_id)
        ->where('status', 'hadir')
        ->count();

        $jumlahTidakHadir = AbsensiPegawai::where('guru_id', $absensi->guru_id)
        ->where('status', 'tidak hadir')
        ->count();

        

        return ApiResponse::success([
            'id' => $absensi->id ?? null,
            'guru_id' => $absensi->guru->nama ?? null,                
            'mata_pelajaran_id' => $absensi->mataPelajaran->nama_pelajaran ?? null,                
            'tanggal' => Carbon::parse($absensi->tanggal)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026
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
     * Beberapa data = DELETE /absensi/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /absensi/destroy?ids=7
     */
    public function destroyData(Request $request)
    {
        $ids = $request->ids;        

        // HAPUS BEBERAPA DATA
        if (is_array($ids)) {
            $validIds = AbsensiPegawai::whereIn('id', $ids)->pluck('id')->toArray();
            $invalidIds = array_diff($ids, $validIds);

            // Jika terdapat id yang tidak ada
            if (!empty($invalidIds)) {
                return response()->json([
                    'message' => 'Beberapa ID tidak ditemukan.',
                    'invalid_ids' => array_values($invalidIds)
                ], 404);
            }

            AbsensiPegawai::whereIn('id', $validIds)->delete();
            return response()->json([
                'message' => 'Beberapa data absensi pegawai berhasil dihapus.',
                'deleted_ids' => $validIds
            ]);
        }

        // HAPUS SATU DATA
        if (is_numeric($ids)) {
            $absensi = AbsensiPegawai::find($ids);

            if (!$absensi) {
                return response()->json([
                    'message' => 'Data tidak ditemukan.',
                    'invalid_id' => $ids
                ], 404);
            }

            $absensi->delete();
            return response()->json([
                'message' => 'Data absensi pegawai berhasil dihapus.',
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
     * Semua data = GET /absensi/export
     * Beberapa data = GET /absensi/export?ids[]=3&ids[]=5&ids[]=10
     * Satu data = GET /absensi/export?ids[]=7
     */
    public function export(Request $request)
    {
        $ids = $request->input('ids'); // bisa null atau array        

         // Validasi ID jika ada
         if ($ids) {
            $validIds = AbsensiPegawai::whereIn('id', $ids)->pluck('id')->toArray();
            $missingIds = array_diff($ids, $validIds);

            if (count($missingIds) > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Beberapa ID tidak ditemukan',
                    'missing_ids' => array_values($missingIds),
                ], 404);
            }
        }

        return Excel::download(new AbsensiPegawaiExport($ids), 'absensi-pegawai.xlsx');
    }


    // ! tidak ada import karena guru_id dan matpel_Id
}
