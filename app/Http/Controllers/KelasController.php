<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kelas;
use App\Models\TahunAkademik;
use App\Helpers\ApiResponse;
// use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
// use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class KelasController extends Controller
{
    // ✅ show all kelas oleh super admin
    public function index()
    {
        $allKelas = Kelas::get();

        $formatted = $allKelas->map(function ($kelas) {
            return [
                'kelas_id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'tingkat' => $kelas->tingkat ?? null,
                'status' => $kelas->status ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar kelas berhasil diambil');

    }

    // ✅ show kelas oleh super admin
    public function show($id)
    {
        $kelas = Kelas::with([
            'rombels.jurusan',
            'rombels.waliRombels.wali',
        ])->find($id);

        if (!$kelas) {
            return ApiResponse::error('Not Found', [
                'kelas' => 'Data kelas tidak ditemukan'
            ]);
        }

        $tahunAktif = TahunAkademik::where('status', 'aktif')->first();

        $formatted = [
            'kelas_id'   => $kelas->id,
            'nama_kelas' => $kelas->nama_kelas,
            'kode_kelas' => $kelas->kode_kelas,
            'tingkat'    => $kelas->tingkat,
            'status'     => $kelas->status,

            'daftar_rombel' => $kelas->rombels->map(function ($rm) use ($tahunAktif) {
                $waliAktif = $tahunAktif
                    ? $rm->waliRombels
                        ->where('tahun_akademik_id', $tahunAktif->id)
                        ->first()
                    : null;

                return [
                    'rombel_id'     => $rm->id,
                    'nama_rombel'   => $rm->nama_rombel,
                    'jurusan'       => $rm->jurusan->nama_jurusan ?? null,
                    'wali_saat_ini' => $waliAktif?->wali?->nama,                            
                    'status_rombel' => $rm->status,
                ];
            })->values(),
        ];

        return ApiResponse::success($formatted, 'Detail kelas berhasil diambil');
    }
 

    // ✅ create kelas oleh super admin
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_kelas' => 'required|string',
                'kode_kelas' => 'required|unique:kelas,kode_kelas',
                'tingkat' => 'required|numeric',                
            ], [
                'nama_kelas.required' => 'Nama kelas wajib diisi',
                'kode_kelas.required' => 'Kode kelas wajib diisi',
                'kode_kelas.unique' => 'Kode kelas sudah ada',
                'tingkat.required' => 'Tingkat kelas wajib diisi',
                'tingkat.numeric' => 'Tingkat kelas wajib berisi angka 10, 11, atau 12',                
            ]);                      
    
            $kelas = Kelas::create($validated);            
            
            return ApiResponse::success([
                'id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'kode_kelas' => $kelas->kode_kelas ?? null,
                'tingkat' => $kelas->tingkat ?? null,                
                'status' => 'aktif'
            ], 201);
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ update kelas oleh super admin
    public function update(Request $request, $id)
    {
        $kelas = Kelas::find($id);

        if (!$kelas) {
            return ApiResponse::error(
                'Kelas tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $validated = $request->validate([
            'nama_kelas' => 'sometimes|string|max:50',
            'kode_kelas' => [
                'sometimes',
                'string',
                'max:20',
                Rule::unique('kelas', 'kode_kelas')->ignore($kelas->id),
            ],
            'tingkat' => 'sometimes|integer|min:1|max:12',
            'status' => 'sometimes|in:aktif,arsip',
        ], [
            'nama_kelas.string' => 'Nama kelas harus berupa teks',

            'kode_kelas.string' => 'Kode kelas harus berupa teks',
            'kode_kelas.unique' => 'Kode kelas sudah digunakan',

            'tingkat.integer' => 'Tingkat kelas harus berupa angka',
            'tingkat.min' => 'Tingkat kelas tidak valid',
            'tingkat.max' => 'Tingkat kelas tidak valid',

            'status.in' => 'Pilihan status hanya aktif dan arsip',
        ]);

        $kelas->update($validated);

        return ApiResponse::success([
            'id' => $kelas->id,
            'nama_kelas' => $kelas->nama_kelas,
            'kode_kelas' => $kelas->kode_kelas,
            'tingkat' => $kelas->tingkat,
            'status' => $kelas->status,
        ], 'Kelas berhasil diperbarui');
    }

    // ✅ destroy kelas oleh super admin
    public function destroy($id)
    {
        $kelas = Kelas::find($id);
        if (!$kelas) {
            return ApiResponse::error('Kelas tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek apakah kelas masih punya siswa
        if ($kelas->rombels()->exists()) {
            return ApiResponse::error('Sudah digunakan oleh rombel', [
                'kelas_id' => ['Tidak bisa dihapus, update status sebagai solusi']
            ], 422);
        }

        $kelas->delete();
        return ApiResponse::success(null, 'Kelas berhasil dihapus');
    }

}
