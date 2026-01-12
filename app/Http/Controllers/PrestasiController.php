<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Prestasi;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class PrestasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $prestasi = Prestasi::with([
            'siswa.kelas',
            'siswa.jurusan',
            'tahunAkademik'
        ])->get();

        $grouped = $prestasi->groupBy('siswa_id')->map(function ($items) {
            $siswa = $items->first()->siswa;
            return [
                'siswa_id' => $siswa->id,
                'nama_siswa' => $siswa->nama ?? null,
                'kelas' => $siswa->kelas->nama_kelas ?? null,
                'jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                'prestasi' => $items->map(function ($item) {
                    return [
                        'prestasi_id' => $item->id ?? null,
                        'tahun_akademik_id' => $item->tahunAkademik->id ?? null,
                        'nama_tahun_akademik' => $item->tahunAkademik->tahun_akademik ?? null,
                        'prestasi_diraih' => $item->prestasi_diraih ?? null,
                    ];
                })->values(),
            ];
        })->values();

        return ApiResponse::success($grouped, 'Prestasi semua siswa berhasil diambil');
    }



    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',                
                'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
                'prestasi_diraih' => 'required',
            ],[
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
                'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',                
                'prestasi_diraih.required' => 'Prestasi wajib diisi',
            ]);            

            // selain siswa_id, diakalin pake inputan otomatis di front

            $prestasi = Prestasi::create($validated);
            $prestasi->load('siswa.kelas', 'siswa.jurusan', 'tahunAkademik');

            return ApiResponse::success([
                'siswa_id' => $prestasi->siswa->id ?? null,
                'nama_siswa' => $prestasi->siswa->nama ?? null,
                'kelas' => $prestasi->siswa->kelas->nama_kelas ?? null,
                'jurusan' => $prestasi->siswa->jurusan->nama_jurusan ?? null,
                'prestasi' => $prestasi->map(function ($item) {
                    return [
                        'prestasi_id' => $item->id ?? null,
                        'tahun_akademik_id' => $item->tahunAkademik->id ?? null,
                        'nama_tahun_akademik' => $item->tahunAkademik->tahun_akademik ?? null,
                        'prestasi_diraih' => $item->prestasi_diraih ?? null,
                    ];
                })
            ], 'Data prestasi berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $prestasi = Prestasi::with('siswa.kelas', 'siswa.jurusan', 'tahunAkademik')->find($id);

        if (!$prestasi) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        $formatted = [
            'siswa_id' => $prestasi->siswa->id ?? null,
            'nama_siswa' => $prestasi->siswa->nama ?? null,
            'kelas' => $prestasi->siswa->kelas->nama_kelas ?? null,
            'jurusan' => $prestasi->siswa->jurusan->nama_jurusan ?? null,
            'prestasi' => $prestasi->map(function ($item) {
                return [
                    'prestasi_id' => $item->id ?? null,
                    'tahun_akademik_id' => $item->tahunAkademik->id ?? null,
                    'nama_tahun_akademik' => $item->tahunAkademik->tahun_akademik ?? null,
                    'prestasi_diraih' => $item->prestasi_diraih ?? null,
                ];
            })
        ];

        return ApiResponse::success($formatted, 'Data prestasi berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $prestasi = Prestasi::find($id);
        
        if (!$prestasi) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'siswa_id' => 'sometimes|required|exists:siswas,id',    
            'tahun_akademik_id' => 'sometimes|required|exists:tahun_akademik,id',
            'prestasi_diraih' => 'sometimes|required',
        ],[
            'siswa_id.required' => 'Siswa wajib diisi',
            'siswa_id.exists' => 'Siswa tidak ditemukan',
            'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
            'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',
            'prestasi_diraih.required' => 'Wajib diisi',
        ]);

        $prestasi->update($validated);
        $prestasi->load('siswa.kelas', 'siswa.jurusan', 'tahunAkademik');
        
        return ApiResponse::success(
            [
                'siswa_id' => $prestasi->siswa->id ?? null,
                'nama_siswa' => $prestasi->siswa->nama ?? null,
                'kelas' => $prestasi->siswa->kelas->nama_kelas ?? null,
                'jurusan' => $prestasi->siswa->jurusan->nama_jurusan ?? null,
                'prestasi' => $prestasi->map(function ($item) {
                return [
                    'prestasi_id' => $item->id ?? null,
                    'tahun_akademik_id' => $item->tahunAkademik->id ?? null,
                    'nama_tahun_akademik' => $item->tahunAkademik->tahun_akademik ?? null,
                    'prestasi_diraih' => $item->prestasi_diraih ?? null,
                ];
            })
            ], 'Data prestasi berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $prestasi = Prestasi::find($id);

        if (!$prestasi) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        $prestasi->delete();
        return ApiResponse::success(null, 'Data prestasi berhasil dihapus');
    }
}
