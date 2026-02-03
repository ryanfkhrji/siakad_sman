<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MataPelajaran;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class MataPelajaranController extends Controller
{
    /**
     * ✅ untuk spa
     */
    public function index()
    {
        $matpel = MataPelajaran::get();

        $formatted = $matpel->groupBy('status')
        ->map(function ($item) {        
            return [
                'status'                    => $item->first()->status ?? null,
                'daftar_kelompok'           => $item->groupBy('kelompok')
                ->map(function ($kel) {
                    return [
                        'kelompok'          => $kel->first()->kelompok ?? null,                    
                        'mata_pelajarans'   => $kel->map(function ($m) {
                            return [
                                'id'                => $m->id ?? null,
                                'nama_pelajaran'    => $m->nama_pelajaran ?? null,
                                'kode_mapel_diknas' => $m->kode_mapel_diknas ?? null,
                            ];
                        })->values(),
                    ];
                })->values(),
            ];
        })->values();

        return ApiResponse::success($formatted, 'Daftar mata pelajaran berhasil diambil');
    }

    /**
     * ✅ untuk spa
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_pelajaran' => 'required|string',
                'kode_mapel_diknas' => 'required|unique:mata_pelajarans,kode_mapel_diknas',                
                'kelompok' => 'required|string|in:umum,sains,ipa,sosial,ips,bahasa',
            ], [
                'nama_pelajaran.required' => 'Mata pelajaran wajib diisi',
                'kode_mapel_diknas.required' => 'Kode mapel wajib diisi',                
                'kode_mapel_diknas.unique' => 'Kode mapel sudah ada',
                'kelompok.required' => 'Kelompok mata pelajaran wajib diisi',
                'kelompok.in' => 'Pilihan kelompok hanya umum, sains, ipa, sosial, ips, dan bahasa',
            ]);
    
            $matpel = MataPelajaran::create([
                'nama_pelajaran' => $validated['nama_pelajaran'],
                'kode_mapel_diknas' => $validated['kode_mapel_diknas'],
                'kelompok' => $validated['kelompok'],
                'status' => 'aktif'
            ]);
            
            return ApiResponse::success([
                'id' => $matpel->id ?? null,
                'nama_pelajaran' => $matpel->nama_pelajaran ?? null,
                'kode_mapel_diknas' => $matpel->kode_mapel_diknas ?? null,                
                'kelompok' => $matpel->kelompok ?? null,                
                'status' => $matpel->status ?? null
            ], 'Mata Pelajaran Berhasil Dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ untuk spa
     */
    public function show(string $id)
    {
        $find = MataPelajaran::where('id', $id)->first();

        if (!$find) {
            return ApiResponse::error('Data tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $find->id ?? null,
            'nama_pelajaran' => $find->nama_pelajaran ?? null,
            'kode_mapel_diknas' => $find->kode_mapel_diknas ?? null,
            'kelompok' => $find->kelompok ?? null,
            'status' => $find->status ?? null,
        ];

        return ApiResponse::success($formatted, 'Detail mata pelajaran berhasil diambil');
    }

    /**
     * ✅ untuk spa
     */
    public function update(Request $request, $id)
    {
        $matpel = MataPelajaran::find($id);

        if (!$matpel) {
            return ApiResponse::error(
                'Mata pelajaran tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $validated = $request->validate([
            'nama_pelajaran' => [
                'sometimes',
            ],
            'kode_mapel_diknas' => [
                'sometimes',
                Rule::unique('mata_pelajarans')->ignore($id),
            ],
            'kelompok' => [
                'sometimes',
                'in:umum,sains,ipa,sosial,ips,bahasa',
            ],
            'status' => [
                'sometimes',
                'in:aktif,tidak_aktif,arsip',
            ],
        ], [
            'kode_mapel_diknas.unique' => 'Kode mapel sudah ada',
            'kelompok.in' => 'Pilihan kelompok hanya umum, sains, ipa, sosial, ips, dan bahasa',
            'status.in' => 'Pilihan status hanya aktif, tidak_aktif, dan arsip',
        ]);

        // =========================
        // RULE STATUS (FIXED)
        // =========================
        if (
            array_key_exists('status', $validated) &&        // user kirim status
            $matpel->status === 'arsip' &&                   // status lama arsip
            $validated['status'] !== 'arsip'                 // mau keluar dari arsip
        ) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['status' => ['Kolom status arsip bersifat final dan tidak boleh diubah']],
                422
            );
        }

        $matpel->update($validated);

        return ApiResponse::success(
            [
                'id' => $matpel->id,
                'nama_pelajaran' => $matpel->nama_pelajaran,
                'kode_mapel_diknas' => $matpel->kode_mapel_diknas,
                'kelompok' => $matpel->kelompok,
                'status' => $matpel->status,
            ],
            'Mata pelajaran berhasil diperbarui'
        );
    }



    /**
     * ✅ untuk spa
     */
    public function destroy($id)
    {
        $matpel = MataPelajaran::find($id);

        if (! $matpel) {
            return ApiResponse::error(
                'Mata pelajaran tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        // Cek apakah sudah digunakan di kurmap
        $dipakaiKurmap = $matpel->kurikulumMataPelajarans()->exists();        

        if ($dipakaiKurmap) {
            return ApiResponse::error(
                'Mata pelajaran tidak dapat dihapus',
                [
                    'mata_pelajaran' => [
                        'Mata pelajaran sudah digunakan pada kurikulum mata pelajaran, update status sebagai solusi'
                    ]
                ],
                422
            );
        }

        $matpel->delete();

        return ApiResponse::success(null, 'Mata pelajaran berhasil dihapus');
    }

}
