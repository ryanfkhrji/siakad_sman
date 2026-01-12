<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kelas;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class KelasController extends Controller
{
    // ✅ show all kelas oleh super admin
    public function index()
    {
        $allKelas = Kelas::with([
            'jurusan',            
        ])->get();

        $formatted = $allKelas->map(function ($kelas) {
            return [
                'kelas_id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'tingkat' => $kelas->tingkat ?? null,
                'jurusan_kelas' => $kelas->jurusan->nama_jurusan ?? null,            
            ];
        });

        return ApiResponse::success($formatted, 'Daftar kelas berhasil diambil');

    }

    // ✅ show kelas oleh super admin
    public function show($id)
    {
        $kelas = Kelas::with([
            'jurusan',
            'rombels.kelas',            
            'rombels.waliRombel',            
            'rombels.tahunAkademik',            
            'rombels.siswaRombels.siswa.jurusan',            
            'rombels.siswaRombels.tahunAkademik',            
        ])->find($id);

        $formatted = [
                'kelas_id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'tingkat' => $kelas->tingkat ?? null,
                'jurusan_kelas' => $kelas->jurusan->nama_jurusan ?? null,
                'histori_rombel' => $kelas->rombels->groupBy('kelas_id')->map(function ($rombel) {
                    return [
                        'rombel_id' => $rombel->id ?? null,
                        'nama_rombel' => $rombel->nama_rombel ?? null,
                        'wali_rombel' => $rombel->waliRombel->nama ?? null,

                        'tahun_akademik_rombel' => $rombel->tahunAkademik->tahun_akademik ?? null,
                        'status_tahun_akademik_rombel' => $rombel->tahunAkademik->status ?? null,
                        'anggota_rombel' => $rombel->siswaRombels->map(function ($siswaRombel) {
                            return [
                                'siswa_rombel_id' => $siswaRombel->id ?? null,
                                'siswa_id' => $siswaRombel->siswa->id ?? null,
                                'nama_siswa' => $siswaRombel->siswa->nama ?? null,
                                'nisn' => $siswaRombel->siswa->nisn ?? null,
                                'nis' => $siswaRombel->siswa->nis ?? null,
                                'jurusan_siswa' => $siswaRombel->siswa->jurusan->nama_jurusan ?? null,
                                'tahun_akademik_siswa_rombel' => $siswaRombel->rombel->tahunAkademik->tahun_akademik ?? null,
                                'status_tahun_akademik_siswa_rombel' => $siswaRombel->rombel->tahunAkademik->status ?? null,
                            ];
                        }),
                    ];
                }),                                                                                                         
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
                'jurusan_id' => 'nullable|exists:jurusans,id',                
            ], [
                'nama_kelas.required' => 'Nama kelas wajib diisi',
                'kode_kelas.required' => 'Kode kelas wajib diisi',
                'kode_kelas.unique' => 'Kode kelas sudah ada',
                'tingkat.required' => 'Tingkat kelas wajib diisi',
                'tingkat.numeric' => 'Tingkat kelas wajib berisi angka 10, 11, atau 12',
                'jurusan_id.exists' => 'Jurusan tidak ditemukan',                
            ]);                      
    
            $kelas = Kelas::create($validated);
            $kelas->load('jurusan');
            
            return ApiResponse::success([
                'id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'kode_kelas' => $kelas->kode_kelas ?? null,
                'tingkat' => $kelas->tingkat ?? null,
                'nama_jurusan' => $kelas->jurusan->nama_jurusan ?? null,                                
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
            return ApiResponse::error('Kelas tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_kelas' => [
                'sometimes',
                'required',
            ],
            'kode_kelas' => [
                'sometimes',                
                'required',
                Rule::unique('kelas')->ignore($id)
            ],
            'tingkat' => [
                'sometimes',
                'required',
            ],
            'jurusan_id' => 'sometimes|nullable|exists:jurusans,id',            
        ],[
            'nama_kelas.required' => 'Nama kelas wajib diisi',
            'kode_kelas.required' => 'Kode kelas wajib diisi',            
            'kode_kelas.unique' => 'Kode kelas sudah ada',            
            'tingkat.required' => 'Tingkat kelas wajib diisi',            
            'jurusan_id.exists' => 'Jurusan tidak ditemukan',            
        ]);
                

        $kelas->update($validated);
        $kelas->load('jurusan');
        
        return ApiResponse::success(
            [
                'id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'kode_kelas' => $kelas->kode_kelas ?? null,
                'tingkat' => $kelas->tingkat ?? null,
                'nama_jurusan' => $kelas->jurusan->nama_jurusan ?? null,                
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
        if ($kelas->siswas()->exists()) {
            return ApiResponse::error('Kelas tidak bisa dihapus karena masih memiliki siswa', [
                'kelas_id' => ['Kelas ini masih digunakan oleh siswa']
            ], 422);
        }

        $kelas->delete();
        return ApiResponse::success(null, 'Kelas berhasil dihapus');
    }

}
