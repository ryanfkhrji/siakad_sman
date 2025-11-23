<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Gedung;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;

class GedungController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $gedung = Gedung::get();

        $formatted = $gedung->map(function ($item) {
            return [
                'id' => $item->id,
                'foto_gedung' => $item->foto_gedung,
                'kode_gedung' => $item->kode_gedung,
                'nama_gedung' => $item->nama_gedung,
                'jumlah_lantai' => $item->jumlah_lantai,
                'luas_bangunan' => $item->luas_bangunan,
                'tahun_dibangun' => $item->tahun_dibangun,
                'kondisi' => $item->kondisi,
                'keterangan' => $item->keterangan,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar gedung berhasil diambil');

    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //  ! sampe sini
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
