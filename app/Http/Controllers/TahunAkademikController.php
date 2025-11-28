<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TahunAkademik;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class TahunAkademikController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $ta = TahunAkademik::orderBy('tahun_akademik', 'desc')->get();

        $formatted = $ta->map(function($item) {
            return [
                'id' => $item->id ?? null,
                'tahun_akademik' => $item->tahun_akademik ?? null,
                'semester' => $item->semester ?? null,
                'tanggal_mulai' => $item->tanggal_mulai ?? null,
                'tanggal_selesai' => $item->tanggal_selesai ?? null,
                'status' => $item->status ?? null,
                'keterangan' => $item->keterangan ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar tahun akademik berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'tahun_akademik' => 'required|unique:tahun_akademik,tahun_akademik',
                'semester' => 'required|in:Ganjil,Genap',
                'tanggal_mulai' => 'nullable',
                'tanggal_selesai' => 'nullable',
                'status' => 'required|in:aktif,nonaktif',            
                'keterangan' => 'nullable',            
            ],[
                'tahun_akademik.required' => 'Wajib diisi',
                'tahun_akademik.unique' => 'Tahun akademik sudah ada',
                'semester.required' => 'Wajib diisi',
                'semester.in' => 'Pilihan hanya Ganjil dan Genap',
                'status.required' => 'Wajib diisi',
                'status.in' => 'Pilihan hanya aktif dan nonaktif',
            ]);            

            $ta = TahunAkademik::create($validated);

            return ApiResponse::success([
                'id' => $ta->id ?? null,
                'tahun_akademik' => $ta->tahun_akademik ?? null,
                'semester' => $ta->semester ?? null,
                'tanggal_mulai' => $ta->tanggal_mulai ?? null,
                'tanggal_selesai' => $ta->tanggal_selesai ?? null,
                'status' => $ta->status ?? null,
                'keterangan' => $ta->keterangan ?? null,
            ], 'Data berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $ta = TahunAkademik::find($id);

        if (!$ta) {
            return ApiResponse::error('Tahun akademik tidak ditemukan', ['id' => 'Data tidak ditemukan']);
        }

        $formatted = [
                'id' => $ta->id ?? null,
                'tahun_akademik' => $ta->tahun_akademik ?? null,
                'semester' => $ta->semester ?? null,
                'tanggal_mulai' => $ta->tanggal_mulai ?? null,
                'tanggal_selesai' => $ta->tanggal_selesai ?? null,
                'status' => $ta->status ?? null,
                'keterangan' => $ta->keterangan ?? null,
            ];

        return ApiResponse::success($formatted, 'Detail tahun akademik berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $ta = TahunAkademik::find($id);
        if (!$ta) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'tahun_akademik' => [
                'sometimes',
                'required',
                Rule::unique('tahun_akademik')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],
            'semester' => 'sometimes|required|in:Ganjil,Genap',
            'tanggal_mulai' => 'sometimes|nullable',        
            'tanggal_selesai' => 'sometimes|nullable',        
            'status' => 'sometimes|in:aktif,nonaktif',        
            'keterangan' => 'sometimes|nullable',        
        ],[
            'tahun_akademik.required' => 'Wajib diisi',
            'tahun_akademik.unique' => 'Tahun akademik sudah ada',
            'semester.required' => 'Wajib diisi',
            'semester.in' => 'Pilihan hanya Ganjil dan Genap',
            'status.in' => 'Pilihan hanya aktif dan nonaktif',
        ]);

        $ta->update($validated);
        
        return ApiResponse::success(
            [
                'id' => $ta->id ?? null,
                'tahun_akademik' => $ta->tahun_akademik ?? null,
                'semester' => $ta->semester ?? null,
                'tanggal_mulai' => $ta->tanggal_mulai ?? null,
                'tanggal_selesai' => $ta->tanggal_selesai ?? null,
                'status' => $ta->status ?? null,
                'keterangan' => $ta->keterangan ?? null,
            ], 'Tahun akademik berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ta = TahunAkademik::find($id);

        if (!$ta) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        $ta->delete();
        return ApiResponse::success(null, 'Tahun akademik berhasil dihapus');
    }
}
