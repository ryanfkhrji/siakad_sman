<?php

namespace App\Http\Controllers;
use App\Models\AbsensiPegawai;

use Illuminate\Http\Request;

class AbsensiPegawaiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $absen = AbsensiPegawai::with('mataPelajaran', 'guru')
        ->orderBy('tanggal', 'desc')
        ->get();

        if (!$absen) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }

        $formatted = $absen->map(function ($item) {
            return [
                'id' => $item->id ?? null,
                'guru_id' => $item->guru->nama ?? null,                
                'mata_pelajaran_id' => $item->mataPelajaran->nama_pelajaran ?? null,                
                'tanggal' => $item->tanggal ?? null,                
                'status' => $item->status ?? null,                
            ];
        });

        return ApiResponse::success($formatted, 'Daftar absensi berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'guru_id' => 'required|exists:kepegawaians,id',
                'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
                'tanggal' => 'required|date',
                'status' => 'required|in:hadir,tidak hadir'
            ],[
                'guru_id.required' => 'Nama guru wajib diisi',
                'guru_id.exists' => 'Guru tidak ditemukan',
                'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
                'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
                'tanggal.required' => 'Tanggal wajib diisi',
                'tanggal.date' => 'Format tanggal salah',
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir atau tidak hadir'
            ]);

            $absensi = AbsensiPegawai::create($validated);
            $absensi->load('mataPelajaran', 'guru');

            $jumlahHadir = AbsensiPegawai::where('guru_id', $absensi->id)
            ->where('status', 'hadir')
            ->count();

            $jumlahTidakHadir = AbsensiPegawai::where('guru_id', $absensi->id)
            ->where('status', 'tidak hadir')
            ->count();

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'guru_id' => $absensi->guru->nama ?? null,                
                'mata_pelajaran_id' => $absensi->mataPelajaran->nama_pelajaran ?? null,                
                'tanggal' => $absensi->tanggal ?? null,                
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

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $absensi = AbsensiPegawai::with('mataPelajaran', 'guru')->find($id);

        if (!$absensi) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        // hitung jumlah hadir/tidak hadir khusus guru ini
        $jumlahHadir = AbsensiPegawai::where('guru_id', $id)
        ->where('status', 'hadir')
        ->count();

        $jumlahTidakHadir = AbsensiPegawai::where('guru_id', $id)
        ->where('status', 'tidak hadir')
        ->count();

        $formatted = [
            'id' => $absensi->id ?? null,
            'guru_id' => $absensi->guru->nama ?? null,                
            'mata_pelajaran_id' => $absensi->mataPelajaran->nama_pelajaran ?? null,                
            'tanggal' => $absensi->tanggal ?? null,                
            'status' => $absensi->status ?? null,       
            'rekapitulasi' => [
                'hadir' => $jumlahHadir,
                'tidak_hadir' => $jumlahTidakHadir
            ]
        ];

        return ApiResponse::success($fomatted, 'Detail absensi berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $absensi = AbsensiPegawai::find($id);

        if (!$absensi) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'guru_id' => 'sometimes|required|exists:kepegawaians,id',
            'mata_pelajaran_id' => 'sometimes|required|exists:mata_pelajarans,id',
            'tanggal' => 'sometimes|required|date',
            'status' => 'sometimes|required|in:hadir,tidak hadir',
        ], [
            'guru_id.required' => 'Nama guru wajib diisi',
            'guru_id.exists' => 'Guru tidak ditemukan',
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
            'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
            'tanggal.required' => 'Tanggal wajib diisi',
            'tanggal.date' => 'Format tanggal salah',
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan hanya hadir atau tidak hadir'
        ]);
       
        $absensi->update($validated);
        $absensi->load('mataPelajaran', 'guru');    

        return ApiResponse::success([
            'id' => $absensi->id ?? null,
            'guru_id' => $absensi->guru->nama ?? null,                
            'mata_pelajaran_id' => $absensi->mataPelajaran->nama_pelajaran ?? null,                
            'tanggal' => $absensi->tanggal ?? null,                
            'status' => $absensi->status ?? null,       
            'rekapitulasi' => [
                'hadir' => $jumlahHadir,
                'tidak_hadir' => $jumlahTidakHadir
            ]
        ], 'Data absensi berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $absensi = AbsensiPegawai::find($id);

        if (!$absensi) {
            return ApiResponse::error('Data tidak ditemukan', ['id' => 'Absensi tidak ditemukan']);
        }

        $absensi->delete();

        return ApiResponse::success('null', 'Data absensi berhasil dihapus');
    }

    // ! export data
    
}
