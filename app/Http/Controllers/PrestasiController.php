<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prestasi;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PrestasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $prestasi = Prestasi::with([
            'siswa',
            'kelas',
            'jurusan'
        ])->get();

        $formatted = $prestasi->map(function($item) {
            return [
                'id' => $item->id ?? null,
                'siswa_id' => $item->siswa->nama ?? null,
                'kelas_id' => $item->kelas->nama_kelas ?? null,
                'jurusan_id' => $item->jurusan->nama_jurusan ?? null,
                'prestasi_diraih' => $item->prestasi_diraih ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Semua prestasi berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',
                'kelas_id' => 'required|exists:kelas,id',
                'jurusan_id' => 'required|exists:jurusans,id',
                'prestasi_diraih' => 'required',
            ],[
                'siswa_id.required' => 'Wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'kelas_id.required' => 'Wajib diisi',
                'kelas_id.exists' => 'Kelas tidak ditemukan',
                'jurusan_id.required' => 'Wajib diisi',
                'jurusan_id.exists' => 'Jurusan tidak ditemukan',
                'prestasi_diraih.required' => 'Wajib diisi',
            ]);            

            $prestasi = Prestasi::create($validated);
            $prestasi->load('siswa', 'kelas', 'jurusan');

            return ApiResponse::success([
                'id' => $prestasi->id ?? null,
                'siswa_id' => $prestasi->siswa->nama ?? null,
                'kelas_id' => $prestasi->kelas->nama_kelas ?? null,
                'jurusan_id' => $prestasi->jurusan->nama_jurusan ?? null,
                'prestasi_diraih' => $prestasi->prestasi_diraih ?? null,
            ], 'Data prestasi berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $prestasi = Prestasi::with('siswa', 'kelas', 'jurusan')->find($id);

        if (!$prestasi) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        $formatted = [
            'id' => $prestasi->id ?? null,
            'siswa_id' => $prestasi->siswa->nama ?? null,
            'kelas_id' => $prestasi->kelas->nama_kelas ?? null,
            'jurusan_id' => $prestasi->jurusan->nama_jurusan ?? null,
            'prestasi_diraih' => $prestasi->prestasi_diraih ?? null,
        ];

        return ApiResponse::success($formatted, 'Data prestasi berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $prestasi = Prestasi::find($id);
        
        if (!$prestasi) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'siswa_id' => 'sometimes|required|exists:siswas,id',
            'kelas_id' => 'sometimes|required|exists:kelas,id',
            'jurusan_id' => 'sometimes|required|exists:jurusans,id',
            'prestasi_diraih' => 'sometimes|required',
        ],[
            'siswa_id.required' => 'Wajib diisi',
            'siswa_id.exists' => 'Siswa tidak ditemukan',
            'kelas_id.required' => 'Wajib diisi',
            'kelas_id.exists' => 'Kelas tidak ditemukan',
            'jurusan_id.required' => 'Wajib diisi',
            'jurusan_id.exists' => 'Jurusan tidak ditemukan',
            'prestasi_diraih.required' => 'Wajib diisi',
        ]);

        $prestasi->update($validated);
        $prestasi->load('siswa', 'kelas', 'jurusan');
        
        return ApiResponse::success(
            [
                'id' => $prestasi->id ?? null,
                'siswa_id' => $prestasi->siswa->nama ?? null,
                'kelas_id' => $prestasi->kelas->nama_kelas ?? null,
                'jurusan_id' => $prestasi->jurusan->nama_jurusan ?? null,
                'prestasi_diraih' => $prestasi->prestasi_diraih ?? null,
            ], 'Data prestasi berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $prestasi = Prestasi::find($id);

        if (!$prestasi) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        $prestasi->delete();
        return ApiResponse::success(null, 'Data prestasi berhasil dihapus');
    }
}
