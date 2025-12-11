<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Keuangan;
use App\Exports\KeuanganExport;
use App\Helpers\ApiResponse;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;

class KeuanganController extends Controller
{
    /**
     * ✅ Untuk super admin
     */
    public function index()
    {
        $keuangan = Keuangan::get();

        if (!$keuangan) {
            return ApiResponse::error('Not found', ['data' => 'Daftar data keuangan tidak ditemukan']);
        }

        $formatted = $keuangan->map(function ($item) {
            return [
                'id' => $item->id ?? null,
                'nama_akun' => $item->nama_akun ?? null,
                'debit' => $item->debit ?? null,
                'kredit' => $item->kredit ?? null,
                'keterangan' => $item->keterangan ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar data keuangan berhasil diambil');
    }

    /**
     * ✅ Untuk Super Admin
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_akun' => 'required',            
                'debit'   => 'required|numeric',
                'kredit'  => 'required|numeric',
                'keterangan' => 'nullable',            
            ],[
                'nama_akun.required' => 'Nama akun wajib diisi',
                'debit.required' => 'Debit wajib diisi',
                'debit.numeric'  => 'Debit harus berupa angka',
                'kredit.required' => 'Kredit wajib diisi',
                'kredit.numeric'  => 'Kredit harus berupa angka',
            ]);            

            $keuangan = Keuangan::create($validated);

            return ApiResponse::success([
                'id' => $keuangan->id ?? null,
                'nama_akun' => $keuangan->nama_akun ?? null,
                'debit' => $keuangan->debit ?? null,
                'kredit' => $keuangan->kredit ?? null,
                'keterangan' => $keuangan->keterangan ?? null,
            ], 'Data keuangan berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ Untuk Super Admin
     */
    public function show(string $id)
    {
        $keuangan = Keuangan::find($id);

        if (!$keuangan) {
            return ApiResponse::error('Not found', ['id' => 'Detail data keuangan tidak ditemukan']);
        }

        $formatted = [
            'id' => $keuangan->id ?? null,
            'nama_akun' => $keuangan->nama_akun ?? null,
            'debit' => $keuangan->debit ?? null,
            'kredit' => $keuangan->kredit ?? null,
            'keterangan' => $keuangan->keterangan ?? null,
        ];

        return ApiResponse::success($formatted, 'Detail data keuangan berhasil diambil');
    }

    /**
     * ✅ Untuk Super Admin
     */
    public function update(Request $request, string $id)
    {
        $keuangan = Keuangan::find($id);

        if (!$keuangan) {
            return ApiResponse::error('Not found', ['id', 'Data keuangan tidak ditemukan']);
        }

        $validated = $request->validate([
            'nama_akun' => 'sometimes|required',            
            'debit'   => 'sometimes|required|numeric',
            'kredit'  => 'sometimes|required|numeric',
            'keterangan' => 'sometimes|nullable',            
        ],[
            'nama_akun.required' => 'Nama akun wajib diisi',
            'debit.required' => 'Debit wajib diisi',
            'debit.numeric'  => 'Debit harus berupa angka',
            'kredit.required' => 'Kredit wajib diisi',
            'kredit.numeric'  => 'Kredit harus berupa angka',
        ]);       

        $keuangan->update($validated);

        return ApiResponse::success([
            'id' => $keuangan->id ?? null,
            'nama_akun' => $keuangan->nama_akun ?? null,
            'debit' => $keuangan->debit ?? null,
            'kredit' => $keuangan->kredit ?? null,
            'keterangan' => $keuangan->keterangan ?? null,
        ], 'Data keuangan berhasil diperbarui');
    }

    /**
     * ✅ untuk super admin
     * Beberapa data = DELETE /spa/keuangan/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /spa/kuangan/destroy?ids=7
     */
    public function destroyData(Request $request)
    {
        $ids = $request->ids;        

        // HAPUS BEBERAPA DATA
        if (is_array($ids)) {
            $validIds = Keuangan::whereIn('id', $ids)->pluck('id')->toArray();
            $invalidIds = array_diff($ids, $validIds);

            // Jika terdapat id yang tidak ada
            if (!empty($invalidIds)) {
                return response()->json([
                    'message' => 'Beberapa ID tidak ditemukan.',
                    'invalid_ids' => array_values($invalidIds)
                ], 404);
            }

            Keuangan::whereIn('id', $validIds)->delete();
            return response()->json([
                'message' => 'Beberapa data keuangan berhasil dihapus.',
                'deleted_ids' => $validIds
            ]);
        }

        // HAPUS SATU DATA
        if (is_numeric($ids)) {
            $absensi = Keuangan::find($ids);

            if (!$absensi) {
                return response()->json([
                    'message' => 'Data tidak ditemukan.',
                    'invalid_id' => $ids
                ], 404);
            }

            $absensi->delete();
            return response()->json([
                'message' => 'Data keuangan berhasil dihapus.',
                'deleted_id' => $ids
            ]);
        }

        return response()->json([
            'message' => 'Parameter ids tidak valid. Kirimkan satu id, atau array id.'
        ], 422);
    }


    /** 
     * ✅ Export data menggunakan app/Exports/KeuanganExport.php
     * php artisan make:export KeuanganExport --model=Keuangan
     * Export all data /api/spa/keuangan/export
     * Export id data tertentu /api/spa/keuangan/export?ids[]=2&ids[]=4 
    */    
    public function exportExcel(Request $request)
    {
        $ids = $request->input('ids'); // bisa null atau array

        // Validasi ID jika ada
        if ($ids) {
            $validIds = Keuangan::whereIn('id', $ids)->pluck('id')->toArray();
            $missingIds = array_diff($ids, $validIds);

            if (count($missingIds) > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Beberapa ID tidak ditemukan',
                    'missing_ids' => array_values($missingIds),
                ], 404);
            }
        }

        try {
            // Kirim file langsung sebagai download response
            return Excel::download(new KeuanganExport($ids), 'data_keuangan.xlsx');
        } catch (\Exception $e) {
            // Tangani error ekspor
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
