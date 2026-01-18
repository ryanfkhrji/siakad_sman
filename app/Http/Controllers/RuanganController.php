<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\Gedung;
use App\Models\Ruangan;
use Illuminate\Validation\Rule;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;

class RuanganController extends Controller
{
    /**
     * Display a listing of the resource.
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
                'nama_gedung' => $item->gedung->nama_gedung ?? null,
                'kode_ruangan' => $item->kode_ruangan ?? null,
                'nama_ruangan' => $item->nama_ruangan ?? null,
                'jenis_ruangan' => $item->jenis_ruangan ?? null,
                'lantai' => $item->lantai ?? null,
                'kapasitas' => $item->kapasitas ?? null,
                'luas_ruangan' => $item->luas_ruangan ?? null,
                'kondisi' => $item->kondisi ?? null,
                'fasilitas' => $item->fasilitas ?? null,
                'keterangan' => $item->keterangan ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar ruangan berhasil diambil');
    }


    /**
     * Store a newly created resource in storage.
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

            $lantaiGedung = Gedung::find($request->gedung_id)->jumlah_lantai;

            if ($validated['lantai'] > $lantaiGedung) {
                return ApiResponse::error('Tidak valid', [
                    'lantai' => 'Lantai ruangan lebih tinggi dari lantai gedung'
                ]);
            }            

            $ruangan = Ruangan::create($validated);
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
            ], 'Data ruangan berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
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
        ];

        return ApiResponse::success($formatted, 'Detail ruangan berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
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
            'jenis_ruangan' => 'nullable',
            'lantai' => 'nullable',
            'kapasitas' => 'nullable',
            'luas_ruangan' => 'nullable',
            'kondisi' => 'nullable',
            'fasilitas' => 'nullable',
            'keterangan' => 'nullable',
        ], [
            'gedung_id.required' => 'Gedung wajib diisi',
            'gedung_id.exists' => 'Gedung tidak ditemukan',
            'kode_ruangan.required' => 'Kode ruangan wajib diisi',
            'kode_ruangan.unique' => 'Kode ruangan sudah ada',
            'nama_ruangan.required' => 'Nama ruangan wajib diisi',
            'nama_ruangan.unique' => 'Nama ruangan sudah ada',
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
        ], 'Data ruangan berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $ruangan = Ruangan::find($id);

        if (!$ruangan) {
            return ApiResponse::error('Data tidak ditemukan', ['id' => 'Ruangan tidak ditemukan']);
        }

        $ruangan->delete();

        return ApiResponse::success('null', 'Data ruangan berhasil dihapus');
    }

     // data select
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
             ];
         });
 
         return ApiResponse::success($data, 'Data select berhasil diambil');
     }
}
