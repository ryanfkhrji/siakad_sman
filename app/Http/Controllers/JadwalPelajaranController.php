<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Models\JadwalPelajaran;
use Illuminate\Validation\Rule;

class JadwalPelajaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jadwal = JadwalPelajaran::with(['mataPelajaran', 'guru', 'kelas'])->get();

        $formatted = $jadwal->map(function ($item) {
            return [
                'id' => $item->id,
                'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran,
                'hari' => $item->hari,
                'guru' => $item->guru->nama,
                'kelas' => $item->kelas->nama_kelas,
                'jam_pelajaran' => $item->jam_pelajaran,
                'ruangan' => $item->ruangan,
                'link_opsional' => $item->link_opsional,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar jadwal pelajaran berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'mata_pelajaran_id' => 'required',
                'hari' => 'required',
                'guru_id' => 'required|exists:kepegawaians,id',
                'kelas_id' => 'required|exists:kelas,id',
                'jam_pelajaran' => 'required',
                'ruangan' => 'nullable',
                'link_opsional' => 'nullable'
            ], [
                'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
                'hari.required' => 'Hari wajib diisi',
                'guru_id.required' => 'Guru wajib diisi',
                'guru_id.exists' => 'Guru tidak ditemukan',
                'kelas_id.required' => 'Kelas wajib diisi',
                'kelas_id.exists' => 'Kelas tidak ditemukan',
                'jam_pelajaran' => 'Jam pelajaran wajib diisi'
            ]);
    
            $matpel = JadwalPelajaran::create($validated);
            $matpel->load('mataPelajaran', 'guru', 'kelas');
            
            return ApiResponse::success([
                'id' => $matpel->id,
                'mata_pelajaran' => $matpel->mataPelajaran->nama_pelajaran,
                'hari' => $matpel->hari,
                'guru' => $matpel->guru->nama,
                'kelas' => $matpel->kelas->nama_kelas,
                'jam_pelajaran' => $matpel->jam_pelajaran,
                'ruangan' => $matpel->ruangan,
                'link_opsional' => $matpel->link_opsional,
            ], 'Jadwal Pelajaran Berhasil Dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $matpel = JadwalPelajaran::with(['mataPelajaran', 'guru', 'kelas'])->find($id);

        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $matpel->id,
            'mata_pelajaran' => $matpel->mataPelajaran->nama_pelajaran,
            'hari' => $matpel->hari,
            'guru' => $matpel->guru->nama,
            'kelas' => $matpel->kelas->nama_kelas,
            'jam_pelajaran' => $matpel->jam_pelajaran,
            'ruangan' => $matpel->ruangan,
            'link_opsional' => $matpel->link_opsional,               
        ];

        return ApiResponse::success($formatted, 'Detail jadwal pelajaran berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $matpel = JadwalPelajaran::find($id);
        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'mata_pelajaran_id' => 'sometimes|required',
            'hari' => 'sometimes|required',
            'guru_id' => 'sometimes|required',
            'kelas_id' => 'sometimes|required',
            'jam_pelajaran' => 'sometimes|required',
            'ruangan' => 'sometimes|nullable',
            'link_opsional' => 'sometimes|nullable',
        ],[
            'mata_pelajaran.required' => 'Mata pelajaran wajib diisi',
            'hari.required' => 'Hari wajib diisi',
            'guru_id.required' => 'Guru wajib diisi',
            'kelas_id.required' => 'Kelas wajib diisi',
            'jam_pelajaran.required' => 'Jam pelajaran wajib diisi',
        ]);

        $matpel->update($validated);

        $matpel->load(['mataPelajaran', 'guru', 'kelas']);
        
        return ApiResponse::success(
            [
                'id' => $matpel->id,
                'mata_pelajaran' => $matpel->mataPelajaran->nama_pelajaran,
                'hari' => $matpel->hari,
                'guru' => $matpel->guru->nama,
                'kelas' => $matpel->kelas->nama_kelas,
                'jam_pelajaran' => $matpel->jam_pelajaran,
                'ruangan' => $matpel->ruangan,
                'link_opsional' => $matpel->link_opsional,
            ], 'Jadwal pelajaran berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $matpel = JadwalPelajaran::find($id);
        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $matpel->delete();
        return ApiResponse::success(null, 'Jadwal pelajaran berhasil dihapus');
    }
}
