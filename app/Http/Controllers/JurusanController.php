<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kepegawaian;
use App\Models\Jurusan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;

class JurusanController extends Controller
{
    public function index()
    {
        $jurusans = Jurusan::with('siswas.kelas')->withCount('siswas')->get();

        $formatted = $jurusans->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_jurusan' => $item->nama_jurusan,
                'jumlah_siswa' => $item->siswas_count,                
            ];
        });

        return ApiResponse::success($formatted, 'Daftar jurusan berhasil diambil');
    }

    public function show($id)
    {
        $jurusan = Jurusan::with('siswas.kelas')
            ->withCount('siswas')
            ->find($id);

        if (!$jurusan) {
            return ApiResponse::error('Jurusan tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $data = [
            'id' => $jurusan->id,
            'nama_jurusan' => $jurusan->nama_jurusan,
            'jumlah_siswa' => $jurusan->siswas_count,
            'siswa' => $jurusan->siswas->map(function ($siswa) {
                return [
                    'id' => $siswa->id,
                    'nisn' => $siswa->nisn,
                    'nama' => $siswa->nama,
                    'nis' => $siswa->nis,
                    'kelas' => $siswa->kelas->nama_kelas ?? null,
                    'status' => $siswa->status,
                ];
            }),
        ];

        return ApiResponse::success($data, 'Detail jurusan berhasil diambil');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_jurusan' => 'required|unique:jurusans,nama_jurusan',
            ], [
                'nama_jurusan.required' => 'Nama jurusan wajib diisi',
                'nama_jurusan.unique' => 'Jurusan sudah ada',
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
                Rule::unique('jurusans')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],
        ],[
            'nama_jurusan.required' => 'Nama jurusan wajib diisi',
            'nama_jurusan.unique' => 'Jurusan sudah ada',
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
            ], 'Jurusan berhasil diperbarui');
    }

    public function destroy($id)
    {
        $jurusan = Jurusan::find($id);
        if (!$jurusan) {
            return ApiResponse::error('Jurusan tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek apakah jurusan masih punya siswa
        if ($jurusan->siswas()->exists()) {
            return ApiResponse::error('Jurusan tidak bisa dihapus karena masih memiliki siswa', [
                'nama_jurusan' => ['Jurusan ini masih digunakan oleh siswa']
            ], 422);
        }

        $jurusan->delete();
        return ApiResponse::success(null, 'Jurusan berhasil dihapus');
    }

}
