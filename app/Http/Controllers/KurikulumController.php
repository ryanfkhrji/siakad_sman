<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kurikulum;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;

class KurikulumController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = Kurikulum::get();

        $formatted = $data->map(function ($item) {
           return [
                'id' => $item->id ?? null,
                'nama_kurikulum' => $item->nama_kurikulum ?? null,
                'tahun_berlaku' => $item->tahun_berlaku ?? null,
                'status' => $item->status ?? null,
                'deskripsi' => $item->deskripsi ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Semua kurikulum berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_kurikulum' => 'required|unique:kurikulum,nama_kurikulum',
                'tahun_berlaku' => 'nullable',
                'status' => 'nullable|in:aktif,tidak aktif',
                'deskripsi' => 'nullable',
            ], [
                'nama_kurikulum.required' => 'Nama kurikulum wajib diisi',
                'nama_kurikulum.unique' => 'Nama kurikulum sudah ada',
                'status.in' => 'Pilihan hanya aktif dan tidak aktif'
            ]);

            $kurikulum = Kurikulum::create($validated);

            return ApiResponse::success([
                'id' => $kurikulum['id'],
                'nama_kurikulum' => $kurikulum['nama_kurikulum'],
                'tahun_berlaku' => $kurikulum['tahun_berlaku'],
                'status' => $kurikulum['status'],
                'deskripsi' => $kurikulum['deskripsi'],
            ], 'Data kurikulum berhasil dibuat');
        } catch (ValidationException $e)  {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $find = Kurikulum::where('id', $id)->first();

        if (!$find) {
            return ApiResponse::error('Data tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $find['id'],
            'nama_kurikulum' => $find['nama_kurikulum'],
            'tahun_berlaku' => $find['tahun_berlaku'],
            'status' => $find['status'],
            'deskripsi' => $find['deskripsi'],
        ];

        return ApiResponse::success($formatted, 'Detail kurikulum berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $kurikulum = Kurikulum::find($id);

        if (!$kurikulum) {
            return ApiResponse::error('Kurikulum tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_kurikulum' => [
                'sometimes',
                'required',
                Rule::unique('kurikulum')->ignore($id)
            ],
            'tahun_berlaku' => 'nullable',
            'status' => 'nullable|in:aktif,tidak aktif',
            'deskripsi' => 'nullable',
        ], [
            'nama_kurikulum.required' => 'Nama kurikulum wajib diisi',
            'nama_kurikulum.unique' => 'Nama kurikulum sudah ada',
            'status.in' => 'Pilihan hanya aktif dan tidak aktif'
        ]);

        $kurikulum->update($validated);

        return ApiResponse::success(
            [
                'id' => $kurikulum->id,
                'nama_kurikulum' => $kurikulum->nama_kurikulum,
                'tahun_berlaku' => $kurikulum->tahun_berlaku,
                'status' => $kurikulum->status,
                'deskripsi' => $kurikulum->deskripsi,
            ], 
            'Kurikulum berhasil diperbarui'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $kurikulum = Kurikulum::find($id);

        if (!$kurikulum) {
            return ApiResponse::error('Kurikulum tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek apakah kurikulum sedang digunaka oleh kompetensi dasar
        if ($kurikulum->kompetensiDasars()->exists()) {
            return ApiResponse::error('Kurikulum tidak bisa dihapus karena masih digunakan pada kompetensi dasar', [
                'nama_kurikulum' => ['Kurikulum ini masih digunakan pada kompetensi dasar']
            ], 422);
        }

        $kurikulum->delete();
        return ApiResponse::success(null, 'Kurikulum berhasil dihapus');
    }
}
