<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AbsensiPegawaiController extends Controller
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
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
