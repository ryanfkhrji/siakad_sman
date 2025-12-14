<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Models\MataPelajaran;
use Illuminate\Validation\Rule;

class MataPelajaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $matpel = MataPelajaran::get();

        $formatted = $matpel->map(function ($item) {
            return [
                'id' => $item->id ?? null,
                'nama_pelajaran' => $item->nama_pelajaran ?? null,
                'status' => $item->status ?? null,
                'nilai_kkm' => $item->nilai_kkm ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar mata pelajaran berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_pelajaran' => 'required|string|unique:mata_pelajarans,nama_pelajaran',
                'status' => 'required|in:wajib,pilihan,jurusan',
                'nilai_kkm' => 'nullable|numeric',
            ], [
                'nama_pelajaran.required' => 'Mata pelajaran wajib diisi',
                'nama_pelajaran.unique' => 'Mata pelajaran sudah ada',
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Hanya diantara wajib, pilihan, dan jurusan',
                'nilai_kkm.numeric' => 'Wajib diisi angka'
            ]);
    
            $matpel = MataPelajaran::create($validated);
            
            return ApiResponse::success([
                'id' => $matpel->id ?? null,
                'nama_pelajaran' => $matpel->nama_pelajaran ?? null,
                'status' => $matpel->status ?? null,
                'nilai_kkm' => $matpel->nilai_kkm ?? null,
            ], 'Mata Pelajaran Berhasil Dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $matpel = MataPelajaran::find($id);

        if (!$matpel) {
            return ApiResponse::error('Mata pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
                'id' => $matpel->id ?? null,
                'nama_pelajaran' => $matpel->nama_pelajaran ?? null,
                'status' => $matpel->status ?? null,                
                'nilai_kkm' => $matpel->nilai_kkm ?? null,                
            ];

        return ApiResponse::success($formatted, 'Detail mata pelajaran berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $matpel = MataPelajaran::find($id);
        if (!$matpel) {
            return ApiResponse::error('Mata pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_pelajaran' => [
                'sometimes',
                'required',
                Rule::unique('mata_pelajarans')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],
            'status' => 'sometimes|required',
            'nilai_kkm' => 'sometimes|numeric',
        ],[
            'nama_pelajaran.required' => 'Nama pelajaran wajib diisi',
            'nama_pelajaran.unique' => 'Nama pelajaran sudah ada',

            'status.required' => 'Status wajib diisi',

            'nilai_kkm.numeric' => 'Wajib diisi angka',
        ]);

        $matpel->update($validated);
        
        return ApiResponse::success(
            [
                'id' => $matpel->id ?? null,
                'nama_pelajaran' => $matpel->nama_pelajaran ?? null,
                'status' => $matpel->status ?? null,
                'nilai_kkm' => $matpel->nilai_kkm ?? null,
            ], 'Mata pelajaran berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $matpel = MataPelajaran::find($id);
        if (!$matpel) {
            return ApiResponse::error('Mata pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $matpel->delete();
        return ApiResponse::success(null, 'Mata pelajaran berhasil dihapus');
    }
}
