<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IdentitasSekolah;

class IdentitasSekolahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $identitasSekolah = IdentitasSekolah::all();

        return ApiResponse::success($identitasSekolah, 'Identitas sekolah berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'npsn' => 'nullable|string',
            'nama_sekolah' => 'required|string',
            'status_sekolah' => 'nullable|string',
            'jenjang' => 'nullable|string',
            'alamat' => 'nullable|string',
            'desa_kelurahan' => 'nullable|string',
            'kecamatan' => 'nullable|string',
            'kabupaten_kota' => 'nullable|string',
            'provinsi' => 'nullable|string',
            'kode_pos' => 'nullable|string|max:20',
            'email' => 'nullable|email',
            'no_telepon' => 'nullable|string',
            'kepala_sekolah' => 'nullable|string',
            'nip_kepala_sekolah' => 'nullable|string',
            'visi' => 'nullable|string',
            'misi' => 'nullable|string',
            'logo' => 'nullable|string'
        ], [
            'nama_sekolah.required' => 'Nama sekolah wajib diisi',
            'email.email' => 'Format tidak valid',
        ]);

        $identitas = IdentitasSekolah::create($validated);

        return response()->json([
            'status' => 'success',
            'data' => $identitas
        ], 'Identitas sekolah berhasil dibuat');
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
        $identitas = IdentitasSekolah::find($id);

        if (!$identitas) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $validated = $request->validate([
            'npsn' => 'nullable|string',
            'nama_sekolah' => 'sometimes|required|string',
            'status_sekolah' => 'nullable|string',
            'jenjang' => 'nullable|string',
            'alamat' => 'nullable|string',
            'desa_kelurahan' => 'nullable|string',
            'kecamatan' => 'nullable|string',
            'kabupaten_kota' => 'nullable|string',
            'provinsi' => 'nullable|string',
            'kode_pos' => 'nullable|string',
            'email' => 'nullable|email',
            'no_telepon' => 'nullable|string',
            'kepala_sekolah' => 'nullable|string',
            'nip_kepala_sekolah' => 'nullable|string',
            'visi' => 'nullable|string',
            'misi' => 'nullable|string',
            'logo' => 'nullable|string'
        ], [
            'nama_sekolah.required' => 'Nama sekolah wajib diisi',
            'email.email' => 'Format tidak valid',
        ]);

        $identitas->update($validated);

        return response()->json([
            'status' => 'success',
            'data' => $identitas
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $identitas = IdentitasSekolah::find($id);

        if (!$identitas) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        $identitas->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil dihapus'
        ]);
    }
}
