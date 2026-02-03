<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TahunAkademik;
use App\Models\Semester;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TahunAkademikController extends Controller
{
    /**
     * ✅ untuk spa
     */
    public function index()
    {
        $ta = TahunAkademik::orderBy('tahun_akademik', 'asc')->get();

        $formatted = $ta->map(function($item) {
            return [
                'id'                => $item->id ?? null,
                'tahun_akademik'    => $item->tahun_akademik ?? null,                
                'keterangan'        => $item->keterangan ?? null,
                'status'            => $item->status ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar tahun akademik berhasil diambil');
    }

    /**
     * ✅ untuk spa (SAMPE SINI)
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'tahun_akademik' => 'required|unique:tahun_akademik,tahun_akademik',                
                'keterangan' => 'nullable',            
            ],[
                'tahun_akademik.required' => 'Wajib diisi',
                'tahun_akademik.unique' => 'Tahun akademik sudah ada',                
            ]);                        

            // cegah create sebelum semua TA menjadi arsip
            $tahunAkademikAktif = TahunAkademik::where('status', 'aktif')->exists();

            if ($tahunAkademikAktif) {
                return ApiResponse::error('Double aktif', ['pesan' => 'Masih ada tahun akademik lain yang aktif, arsipkan terlebih dahulu']);
            }

            $ta = TahunAkademik::create([
                'tahun_akademik' => $validated['tahun_akademik'],
                'keterangan' => $validated['keterangan'],
                'status' => 'aktif',
            ]);

            return ApiResponse::success([
                'id' => $ta->id ?? null,
                'tahun_akademik' => $ta->tahun_akademik ?? null,                
                'keterangan' => $ta->keterangan ?? null,
                'status' => $ta->status ?? null,
            ], 'Data berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ untuk spa
     */
    public function show(string $id)
    {
        $ta = TahunAkademik::with('semester')->find($id);

        if (!$ta) {
            return ApiResponse::error('Tahun akademik tidak ditemukan', ['id' => 'Data tidak ditemukan']);
        }

        $formatted = [
                'tahun_akademik_id' => $ta->id ?? null,
                'tahun_akademik' => $ta->tahun_akademik ?? null,
                'keterangan' => $ta->keterangan ?? null,
                'status_tahun_akademik' => $ta->status ?? null,
                'semester' => $ta->semester->map(function ($semester) {
                    return [
                        'semester_id' => $semester->id,   
                        'semester' => $semester->semester,   
                        'status_semester' => $semester->status,   
                    ];
                }) ?? null,                
            ];

        return ApiResponse::success($formatted, 'Detail tahun akademik berhasil diambil');
    }

    /**
     * ✅ untuk spa
     */
    public function update(Request $request, string $id)
    {
        $ta = TahunAkademik::with('semester')->find($id);

        if (!$ta) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        // if ($ta->status == 'arsip') {
        //     return ApiResponse::error('Not supported', ['data' => ['Sudah menjadi arsip, tidak boleh diubah']], 404);
        // }

        $validated = $request->validate([
            'tahun_akademik' => [
                'sometimes',
                'required',
                Rule::unique('tahun_akademik')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],
            'keterangan' => 'sometimes|nullable',        
            'status' => 'sometimes|required|in:aktif,arsip',
        ],[
            'tahun_akademik.required' => 'Wajib diisi',
            'tahun_akademik.unique' => 'Tahun akademik sudah ada',
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan status hanya aktif dan arsip',
        ]);

        if (
            $ta->status === 'arsip'
            && isset($validated['status'])
            && $validated['status'] === 'aktif'
        ) {
            return ApiResponse::error(
                'Kesalahan',
                ['status' => 'Tahun akademik yang sudah diarsipkan tidak dapat diaktifkan kembali'],
                422
            );
        }

        $masihAdaSemesterAktif = Semester::where('tahun_akademik_id', $id)
        ->where('status', 'aktif')
        ->exists();

        if ($masihAdaSemesterAktif) {
            return ApiResponse::error(
                'Kesalahan',
                ['status' => 'Masih ada semester aktif pada tahun ini'],
                422
            );
        }

        $ta->update($validated);

        return ApiResponse::success(
            [
                'tahun_akademik_id' => $ta->id ?? null,
                'tahun_akademik' => $ta->tahun_akademik ?? null,                
                'keterangan' => $ta->keterangan ?? null,
                'status' => $ta->status ?? null,
            ], 'Tahun akademik berhasil diperbarui');
    }

    /**
     * ✅ untuk spa
     */
    public function destroy(string $id)
    {
        $ta = TahunAkademik::find($id);

        if (!$ta) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        if ($ta->status == 'arsip') {
            return ApiResponse::error('Not supported', ['id' => ['Tahun akademik sudah berstatus arsip']], 404);
        }

        $dipakaiSemester = $ta->semester()->exists();

        if ($dipakaiSemester) {
            return ApiResponse::error(
                'Tahun akademik tidak dapat dihapus',
                [
                    'pesan' => [
                        'Tahun akademik sudah digunakan pada semester'
                    ]
                ],
                422
            );
        }

        $ta->delete();
        return ApiResponse::success(null, 'Tahun akademik berhasil dihapus');
    }
}
