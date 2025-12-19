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
                'kode_mapel_diknas' => $item->kode_mapel_diknas ?? null,
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
                'nama_pelajaran' => 'required|string',
                'kode_mapel_diknas' => 'required|unique:mata_pelajarans,kode_mapel_diknas',                
            ], [
                'nama_pelajaran.required' => 'Mata pelajaran wajib diisi',
                'kode_mapel_diknas.required' => 'Kode mapel wajib diisi',                
                'kode_mapel_diknas.unique' => 'Kode mapel sudah ada',
            ]);
    
            $matpel = MataPelajaran::create($validated);
            
            return ApiResponse::success([
                'id' => $matpel->id ?? null,
                'nama_pelajaran' => $matpel->nama_pelajaran ?? null,
                'kode_mapel_diknas' => $matpel->kode_mapel_diknas ?? null,                
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
                'kode_mapel_diknas' => $matpel->kode_mapel_diknas ?? null,                                
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
            ],
            'kode_mapel_diknas' => [
                'sometimes',
                'required',
                Rule::unique('mata_pelajarans')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],            
        ],[
            'nama_pelajaran.required' => 'Nama pelajaran wajib diisi',
            'kode_mapel_diknas.required' => 'Kode mapel wajib diisi',
            'kode_mapel_diknas.unique' => 'Kode mapel sudah ada',            
        ]);

        $matpel->update($validated);
        
        return ApiResponse::success(
            [
                'id' => $matpel->id ?? null,
                'nama_pelajaran' => $matpel->nama_pelajaran ?? null,
                'kode_mapel_diknas' => $matpel->kode_mapel_diknas ?? null,                
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
