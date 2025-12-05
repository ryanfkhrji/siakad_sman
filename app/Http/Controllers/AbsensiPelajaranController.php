<?php

namespace App\Http\Controllers;
use App\Models\AbsensiPelajaran;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use File;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Response;

class AbsensiPelajaranController extends Controller
{
    /**
     * ✅ Untuk super admin
     */
    public function index()
    {
        $absen = AbsensiPelajaran::with('jadwalPelajaran.mataPelajaran','jadwalPelajaran.kelas', 'guru')
            ->orderBy('hari', 'desc')
            ->get();
    
        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }
    
        // Kelompokkan berdasarkan guru_id
        $grouped = $absen->groupBy('jadwal_pelajaran_id')->map(function ($item) {
            $namaGuru = $item->first()->guru->nama ?? null;
            $namaPelajaran = $item->first()->JadwalPelajaran->mataPelajaran->nama_pelajaran ?? null;
            $namaKelas = $item->first()->jadwalPelajaran->kelas->nama_kelas ?? null;
    
            return [
                'mata_pelajaran' => $namaPelajaran,
                'guru_pengajar' => $namaGuru,
                'kelas' => $namaKelas,
                'total_hadir' => $item->where('status', 'hadir')->count(),
                'total_tidak_hadir' => $item->where('status', 'tidak hadir')->count(),
                'absensi' => $item->map(function ($abs) {
                    return [
                        'id' => $abs->id,
                        'hari' => Carbon::parse($abs->hari)->translatedFormat('l, d F Y') ?? null,
                        'jam' => $abs->jam,                       
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

            // ambil id pada jadwal pelajaran
            $mataPelajaran = JadwalPelajaran::where('guru_id', $pegawai->id)->first();

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
                    'mata_pelajaran_id' => $mataPelajaran->id,
                    'hari' => Carbon::today()->toDateString(),
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
                // 'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d-m-Y') ?? null,   // Senin, 24-06-2026
                'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,   // Senin, 24 September 2026
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
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
