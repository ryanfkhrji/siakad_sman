<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Gedung;
use App\Models\Ruangan;
use Illuminate\Validation\Rule;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class RuanganController extends Controller
{
    /**
     * spa/tu
     */
    public function index()
    {
        $ruangan = Ruangan::with('gedung')->get();        

        if (!$ruangan) {
            return ApiResponse::error('Not found', ['data' => 'Data ruangan tidak ditemukan']);
        }

        $formatted = $ruangan->map(function ($item) {
            return [
                'id' => $item->id ?? null,
                'nama_ruangan' => $item->nama_ruangan ?? null,
                'kode_ruangan' => $item->kode_ruangan ?? null,
                'jenis_ruangan' => $item->jenis_ruangan ?? null,
                'lantai' => $item->lantai ?? null,
                'status' => $item->status ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar ruangan berhasil diambil');
    }
    
    /**
     * spa/tu
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'gedung_id' => 'required|exists:gedung,id',
                'kode_ruangan' => 'required|unique:ruangan,kode_ruangan',
                'nama_ruangan' => 'required|unique:ruangan,nama_ruangan',
                'jenis_ruangan' => 'nullable',
                'lantai' => 'nullable',            
                'kapasitas' => 'nullable',            
                'luas_ruangan' => 'nullable',            
                'kondisi' => 'nullable',            
                'fasilitas' => 'nullable',            
                'keterangan' => 'nullable',            
            ],[
                'gedung_id.required' => 'Gedung wajib diisi',
                'gedung_id.exists' => 'Gedung tidak ditemukan',
                'kode_ruangan.required' => 'Kode ruangan wajib diisi',
                'kode_ruangan.unique' => 'Kode ruangan sudah ada',
                'nama_ruangan.required' => 'Nama ruangan wajib diisi',
                'nama_ruangan.unique' => 'Nama ruangan sudah ada',
            ]);

            if(isset($validated['gedung_id'])) {
                $lantaiGedung = Gedung::find($validated['gedung_id']);

                if ($validated['lantai'] > $lantaiGedung->jumlah_lantai) {
                    return ApiResponse::error('Tidak valid', [
                        'lantai' => 'Lantai ruangan lebih tinggi dari lantai gedung'
                    ]);
                }            
            }

            $ruangan = Ruangan::create([
                'gedung_id' => $validated['gedung_id'],
                'kode_ruangan' => $validated['kode_ruangan'],
                'nama_ruangan' => $validated['nama_ruangan'],
                'jenis_ruangan' => $validated['jenis_ruangan'],
                'lantai' => $validated['lantai'],
                'kapasitas' => $validated['kapasitas'],
                'luas_ruangan' => $validated['luas_ruangan'],
                'kondisi' => $validated['kondisi'],
                'fasilitas' => $validated['fasilitas'],
                'keterangan' => $validated['keterangan'],
                'status' => 'aktif',
            ]);
            
            $ruangan->load('gedung');

            return ApiResponse::success([
                'id' => $ruangan->id ?? null,
                'nama_gedung' => $ruangan->gedung->nama_gedung ?? null,
                'nama_ruangan' => $ruangan->nama_ruangan ?? null,
                'kode_ruangan' => $ruangan->kode_ruangan ?? null,
                'jenis_ruangan' => $ruangan->jenis_ruangan ?? null,
                'lantai' => $ruangan->lantai ?? null,
                'kapasitas' => $ruangan->kapasitas ?? null,
                'luas_ruangan' => $ruangan->luas_ruangan ?? null,
                'kondisi' => $ruangan->kondisi ?? null,
                'fasilitas' => $ruangan->fasilitas ?? null,
                'keterangan' => $ruangan->keterangan ?? null,
                'status' => $ruangan->status ?? 'aktif'
            ], 'Data ruangan berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * all
     */
    public function show(string $id)
    {
        $ruangan = Ruangan::with('gedung')->find($id);

        if (!$ruangan) {
            return ApiResponse::error('Not found', ['id' => 'Gedung tidak ditemukan']);
        }

        $formatted = [
            'id' => $ruangan->id ?? null,
            'nama_gedung' => $ruangan->gedung->nama_gedung ?? null,
            'kode_ruangan' => $ruangan->kode_ruangan ?? null,
            'nama_ruangan' => $ruangan->nama_ruangan ?? null,
            'jenis_ruangan' => $ruangan->jenis_ruangan ?? null,
            'lantai' => $ruangan->lantai ?? null,
            'kapasitas' => $ruangan->kapasitas ?? null,
            'luas_ruangan' => $ruangan->luas_ruangan ?? null,
            'kondisi' => $ruangan->kondisi ?? null,
            'fasilitas' => $ruangan->fasilitas ?? null,
            'keterangan' => $ruangan->keterangan ?? null,
            'status' => $ruangan->status ?? null,
        ];

        return ApiResponse::success($formatted, 'Detail ruangan berhasil diambil');
    }

    /**
     * spa/tu
     */
    public function update(Request $request, string $id)
    {
        $ruangan = Ruangan::find($id);

        if (!$ruangan) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'gedung_id' => 'sometimes|required|exists:gedung,id',
            'kode_ruangan' => [
                'sometimes',
                'required',
                Rule::unique('ruangan')->ignore($id)
            ],
            'nama_ruangan' => [
                'sometimes',
                'required',
                Rule::unique('ruangan')->ignore($id)
            ],
            'jenis_ruangan' => 'sometimes|nullable',
            'lantai' => 'sometimes|nullable',
            'kapasitas' => 'sometimes|nullable',
            'luas_ruangan' => 'sometimes|nullable',
            'kondisi' => 'sometimes|nullable',
            'fasilitas' => 'sometimes|nullable',
            'keterangan' => 'sometimes|nullable',            
            'status' => 'sometimes|nullable|in:aktif,arsip',
        ], [
            'gedung_id.required' => 'Gedung wajib diisi',
            'gedung_id.exists' => 'Gedung tidak ditemukan',
            'kode_ruangan.required' => 'Kode ruangan wajib diisi',
            'kode_ruangan.unique' => 'Kode ruangan sudah ada',
            'nama_ruangan.required' => 'Nama ruangan wajib diisi',
            'nama_ruangan.unique' => 'Nama ruangan sudah ada',
            'status.in' => 'Status hanya boleh aktif atau arsip',
        ]);

        $lantaiGedung = Gedung::find($request->gedung_id)->jumlah_lantai;

        if ($validated['lantai'] > $lantaiGedung) {
            return ApiResponse::error('Tidak valid', [
                'lantai' => 'Lantai ruangan lebih tinggi dari lantai gedung'
            ]);
        }      

        $ruangan->update($validated);
        $ruangan->load('gedung');

        return ApiResponse::success([
            'id' => $ruangan->id ?? null,
            'nama_gedung' => $ruangan->gedung->nama_gedung ?? null,
            'kode_ruangan' => $ruangan->kode_ruangan ?? null,
            'nama_ruangan' => $ruangan->nama_ruangan ?? null,
            'jenis_ruangan' => $ruangan->jenis_ruangan ?? null,
            'lantai' => $ruangan->lantai ?? null,
            'kapasitas' => $ruangan->kapasitas ?? null,
            'luas_ruangan' => $ruangan->luas_ruangan ?? null,
            'kondisi' => $ruangan->kondisi ?? null,
            'fasilitas' => $ruangan->fasilitas ?? null,
            'keterangan' => $ruangan->keterangan ?? null,
            'status' => $ruangan->status ?? null,
        ], 'Data ruangan berhasil diperbarui');
    }

    /**
     * spa/tu
     */
    public function destroy(string $id)
    {
        $ruangan = Ruangan::find($id);

        if (!$ruangan) {
            return ApiResponse::error('Data tidak ditemukan', ['id' => 'Ruangan tidak ditemukan']);
        }

        if ($ruangan->jadwalPelajarans()->exists()) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['jadwal' => 'Ruangan sudah digunakan pada jadwal pelajaran, update status sebagai solusi'],
                403
            );
        }

        $ruangan->delete();

        return ApiResponse::success(null, 'Data ruangan berhasil dihapus');
    }

     // spa/tu
     public function dataSelectRuangan()
     {
         $gedung = Gedung::select('id', 'nama_gedung', 'kode_gedung')->get();
 
        if ($gedung->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

         $data = $gedung->map(function ($g) {
             return [
                 'gedung_id' => $g->id,
                 'nama_gedung' => $g->nama_gedung,
                 'kode_gedung' => $g->kode_gedung,
                 'status' => $g->status,
             ];
         });
 
         return ApiResponse::success($data, 'Data select berhasil diambil');
     }
}
