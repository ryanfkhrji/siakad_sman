<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kepegawaian;
use App\Models\Jurusan;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class JurusanController extends Controller
{
    public function index()
    {
        $jurusans = Jurusan::get();

        $formatted = $jurusans->map(function ($item) {
            return [
                'id' => $item->id ?? null,
                'nama_jurusan' => $item->nama_jurusan ?? null,
                'kode_jurusan' => $item->kode_jurusan ?? null,                
                'status' => $item->status ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar jurusan berhasil diambil');
    }

    public function show($id)
    {
        $jurusan = Jurusan::with('rombels.jurusan')->find($id);

        if (!$jurusan) {
            return ApiResponse::error('Jurusan tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $data = [
            'id' => $jurusan->id ?? null,
            'nama_jurusan' => $jurusan->nama_jurusan ?? null,
            'kode_jurusan' => $jurusan->kode_jurusan ?? null,
            'status' => $jurusan->status ?? null,
            'details' => $jurusan->rombels->groupBy('kelas_id')
            ->map(function ($k) {
                $kelas = $k->first()->kelas;
                return [
                    'kelas_id'  => $kelas->id ?? null,
                    'nama_kelas'=> $kelas->nama_kelas ?? null,
                    'tingkat'   => $kelas->tingkat ?? null,      
                    'status'    => $kelas->status ?? null,      
                    'rombel'    => $k->map(function ($r) {
                        return [
                            'rombel_id'     => $r->id,
                            'nama_rombel'   => $r->nama_rombel,                            
                            'status'        => $r->status,                            
                        ];
                    })->values(),
                ];
            })->values(),
        ];
        return ApiResponse::success($data, 'Detail jurusan berhasil diambil');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_jurusan' => 'required',
                'kode_jurusan' => 'required|unique:jurusans,kode_jurusan',
            ], [
                'nama_jurusan.required' => 'Nama jurusan wajib diisi',
                'kode_jurusan.required' => 'Kode jurusan wajib diisi',
                'kode_jurusan.unique' => 'Kode jurusan sudah ada',
            ]);

            // cek apakah super admin atau bukan
            $pegawai = Kepegawaian::where('role', 'super_admin')->first();

            if (!$pegawai || $pegawai->role !== 'super_admin') {
                return ApiResponse::error('Akses ditolak', [
                    'role' => ['Anda Bukan Super Admin']
                ], 422);
            }
    
            $jurusan = Jurusan::create($validated);
            
            return ApiResponse::success([
                'id' => $jurusan->id,
                'nama_jurusan' => $jurusan->nama_jurusan,
                'kode_jurusan' => $jurusan->kode_jurusan,
                'status' => 'aktif',
            ], 201);
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    public function update(Request $request, $id)
    {
        $jurusan = Jurusan::find($id);
        if (!$jurusan) {
            return ApiResponse::error('Jurusan tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_jurusan' => [
                'sometimes',
                'required',
            ],
            'kode_jurusan' => [
                'sometimes',
                'required',
                Rule::unique('jurusans')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],
            'status' => [
                'sometimes',
                'required',
                'in:aktif,arsip'
            ],
        ],[
            'nama_jurusan.required' => 'Nama jurusan wajib diisi',
            'kode_jurusan.required' => 'Kode jurusan wajib diisi',
            'kode_jurusan.unique' => 'kode jurusan sudah ada',
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan status hanya aktif atau arsip',
        ]);

        // cek apakah super admin atau bukan
        $pegawai = Kepegawaian::where('role', 'super_admin')->first();

        if (!$pegawai || $pegawai->role !== 'super_admin') {
            return ApiResponse::error('Akses ditolak', [
                'role' => ['Anda Bukan Super Admin']
            ], 422);
        }

        $jurusan->update($validated);
        
        return ApiResponse::success(
            [
                'id' => $jurusan->id,
                'nama_jurusan' => $jurusan->nama_jurusan,
                'kode_jurusan' => $jurusan->kode_jurusan,
                'status' => $jurusan->status,
            ], 'Jurusan berhasil diperbarui');
    }

    public function destroy($id)
    {
        $jurusan = Jurusan::find($id);
        if (!$jurusan) {
            return ApiResponse::error('Jurusan tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek apakah jurusan masih dipakai kelas
        if ($jurusan->rombels()->exists()) {
            return ApiResponse::error('Tidak bisa', [
                'nama_jurusan' => ['Ada rombel yang telah menggunakan jurusan ini']
            ], 422);
        }        

        $jurusan->delete();
        return ApiResponse::success(null, 'Jurusan berhasil dihapus');
    }

}
