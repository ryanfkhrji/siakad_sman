<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KompetensiDasar;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;

class KompetensiDasarController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data = KompetensiDasar::with('kurikulum', 'mataPelajaran')->get();

        $formatted = $data->map(function ($item) {
           return [
                'id' => $item->id,
                'mata_pelajaran_id' => $item->mataPelajaran->nama_pelajaran,
                'judul_kompetensi_dasar' => $item->judul_kompetensi_dasar,
                'deskripsi' => $item->deskripsi,
                'kurikulum_id' => $item->kurikulum->nama_kurikulum,
            ];
        });

        return ApiResponse::success($formatted, 'Kompetensi dasar berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
                'judul_kompetensi_dasar' => 'required',
                'deskripsi' => 'nullable',
                'kurikulum_id' => 'required|exists:kurikulum,id',
            ], [
                'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
                'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
                'judul_kompetensi_dasar.required' => 'Judul wajib diisi',
                'kurikulum_id.required' => 'Kurikulum wajib diisi',
                'kurikulum_id.exists' => 'Kurikulum tidak ditemukan',
            ]);

            $find = KompetensiDasar::where('mata_pelajaran_id', $validated['mata_pelajaran_id'])->where('kurikulum_id', $validated['kurikulum_id'])->first();

            if ($find) {
                return ApiResponse::error('Duplikasi', [
                    'unique' => ['Mata pelajaran dengan kurikulum ini sudah ada']
                ], 422);
            }

            $kd = KompetensiDasar::create($validated);
            $kd->load('kurikulum', 'mataPelajaran');

            return ApiResponse::success([
                'id' => $kd->id,
                'mata_pelajaran_id' => $kd->mataPelajaran->nama_pelajaran,
                'judul_kompetensi_dasar' => $kd->judul_kompetensi_dasar,
                'deskripsi' => $kd->deskripsi,
                'kurikulum_id' => $kd->kurikulum->nama_kurikulum,
            ], 'Data kompetensi dasar berhasil dibuat');
        } catch (ValidationException $e)  {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $kd = KompetensiDasar::where('id', $id)->with('kurikulum', 'mataPelajaran')->first();

        if (!$kd) {
            return ApiResponse::error('Data tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $kd->id,
            'mata_pelajaran_id' => $kd->mataPelajaran->nama_pelajaran,
            'judul_kompetensi_dasar' => $kd->judul_kompetensi_dasar,
            'deskripsi' => $kd->deskripsi,
            'kurikulum_id' => $kd->kurikulum->nama_kurikulum,
        ];

        return ApiResponse::success($formatted, 'Detail kompetensi dasar berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $kd = KompetensiDasar::find($id);

        if (!$kd) {
            return ApiResponse::error('Kompetensi dasar tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'mata_pelajaran_id' => 'sometimes|required',
            'judul_kompetensi_dasar' => 'required',
            'deskripsi' => 'nullable',
            'kurikulum_id' => 'nullable'
        ], [            
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
            'judul_kompetensi_dasar.required' => 'Judul wajib diisi',
        ]);

        $find = KompetensiDasar::where('mata_pelajaran_id', $validated['mata_pelajaran_id'])
        ->where('kurikulum_id', $validated['kurikulum_id'])
        ->where('id', '!=', $id)
        ->first();

        if ($find) {
            return ApiResponse::error('Duplikasi', [
                'unique' => ['Mata pelajaran dengan kurikulum ini sudah ada']
            ], 422);
        }

        $kd->update($validated);
        $kd->load('kurikulum', 'mataPelajaran');

        return ApiResponse::success([
            'id' => $kd->id,
            'mata_pelajaran_id' => $kd->mataPelajaran->nama_pelajaran,
            'judul_kompetensi_dasar' => $kd->judul_kompetensi_dasar,
            'deskripsi' => $kd->deskripsi,
            'kurikulum_id' => $kd->kurikulum->nama_kurikulum,
        ], 'Data kompetensi dasar berhasil dibuat');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $kd = KompetensiDasar::find($id);

        if (!$kd) {
            return ApiResponse::error('Kompetensi  dasar tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $kd->delete();
        return ApiResponse::success(null, 'Kompetensi dasar berhasil dihapus');
    }
}
