<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SiswaRombel;
use App\Models\Siswa;
use App\Models\TahunAkademik;
use App\Models\Rombel;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class SiswaRombelController extends Controller
{
    /**
     * ✅ tidak ada index, karena bisa di get lewat RombelController.php::index, show, getAllRombelSendiri
     */
    public function index()
    {
        
    }


    /**
     * ✅ Untuk spa
     * 
     */
    public function store(Request $request)
    {                
        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',
                'rombel_id' => 'required|exists:rombels,id',                
            ],[
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'rombel_id.required' => 'Rombel wajib diisi',
                'rombel_id.exists' => 'Rombel tidak ditemukan',                                
            ]);                       

            $tahunAktif = TahunAkademik::where('status', 'aktif')->first();
            
            if (!$tahunAktif) {
                return ApiResponse::error('Belum ada tahun akademik aktif');
            }

            // 1 siswa tidak boleh masuk 2x pada rombel yang sama di tahun yang sama
            $unikDua = SiswaRombel::where('siswa_id', $validated['siswa_id'])
            ->where('rombel_id', $validated['rombel_id'])
            ->where('tahun_akademik_id', $tahunAktif->id)
            ->exists();
            if ($unikDua) {
                return ApiResponse::error('Duplikasi', 'Siswa sudah terdaftar di rombel ini pada tahun ini');
            }                                
            
            $unikTiga = SiswaRombel::with('rombel')->where('siswa_id', $validated['siswa_id'])
            ->where('tahun_akademik_id', $tahunAktif->id)
            ->first();
            if ($unikTiga) {
                return ApiResponse::error('Duplikasi', 'Siswa sudah terdaftar di rombel '. $unikTiga->rombel->nama_rombel .' pada tahun ini');
            }                                            

            $siswaRombel = SiswaRombel::create([
                'siswa_id'          => $validated['siswa_id'],
                'rombel_id'         => $validated['rombel_id'],
                'tahun_akademik_id' => $tahunAktif->id,
                'status_akhir'      => null,
                'catatan'           => null,
            ]);

            $siswaRombel->load(['siswa', 'rombel.kelas', 'tahunAkademik']);

            return ApiResponse::success([
                'id'             => $siswaRombel->id ?? null,
                'nama_siswa'     => $siswaRombel->siswa->nama ?? null,
                'nama_rombel'    => $siswaRombel->rombel->nama_rombel ?? null,
                'kelas'          => $siswaRombel->rombel->kelas->nama_kelas ?? null,
                'tingkat'        => $siswaRombel->rombel->kelas->tingkat ?? null,
                'tahun_akademik' => $siswaRombel->tahunAkademik->tahun_akademik ?? null,
                'status_akhir'   => $siswaRombel->status_akhir,
                'catatan'        => $siswaRombel->catatan
            ], 'Siswa berhasil didaftarkan ke rombel');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

     /**
     * ✅ untuk siswa
     */
    public function getAllRombelSendiri()
    {
        $user = Auth::guard('siswa')->user();
        
        $siswa = Siswa::with(['siswaRombels.rombel.kelas.jurusan', 'siswaRombels.rombel.tahunAkademik', 'siswaRombels.rombel.waliRombel'])
        ->where('id', $user->id)
        ->get();

        if ($siswa->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $data = [
            'siswa_id' => $siswa->id,
            'nama_siswa' => $siswa->nama,
            'nisn' => $siswa->nisn,
            'nis' => $siswa->nis,
            'histori_rombel' => $siswa->siswaRombels->map(function ($siswaRombel) {                  
                return [
                    'rombel_id' => $siswaRombel->rombel->id ?? null,
                    'nama_rombel' => $siswaRombel->rombel->nama_rombel ?? null,
                            
                    'kelas_id' => $siswaRombel->rombel->kelas->id,
                    'nama_kelas' => $siswaRombel->rombel->kelas->nama_kelas,
                    'tingkat_kelas' => $siswaRombel->rombel->kelas->tingkat,
                    'jurusan_kelas' => $siswaRombel->rombel->kelas->jurusan->nama_jurusan ?? null,

                    'wali_rombel' => $siswaROmbel->rombel->waliRombel->nama,

                    'tahun_akademik_rombel_id' => $siswaRombel->rombel->tahunAkademik->id,
                    'tahun_akademik_rombel' => $siswaRombel->rombel->tahunAkademik->tahun_akademik,
                    'status_tahun_akademik_rombel' => $siswaRombel->rombel->tahunAkademik->status,
                ];
            })->values(),    
        ];

        return ApiResponse::success(['data' => $data], 'Detail rombel berhasil diambil');
    }


     /**
     * ✅ histori rombel (siswa/spa/tu)
     */
    public function show($id)
    {
        $siswaRombel = SiswaRombel::with([
            'siswa',
            'tahunAkademik',
            'rombel.jurusan',
            'rombel.waliRombels.wali',
            'rombel.kelas',
        ])
        ->where('siswa_id', $id)
        ->get();

        if ($siswaRombel->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Belum ada data histori rombel']);
        }

        $siswa = $siswaRombel->first()->siswa;

        $formatted = [[
            'siswa_id'     => $siswa->id,
            'nama_siswa'   => $siswa->nama,
            'nisn'         => $siswa->nisn,
            'nis'          => $siswa->nis,
            'status_siswa' => $siswa->status,

            'periode' => $siswaRombel
                ->groupBy('tahun_akademik_id')
                ->map(function ($ta) {

                    $tahunAkademik = $ta->first()->tahunAkademik;
                    $tahunId = $tahunAkademik->id;

                    return [
                        'tahun_akademik_id'     => $tahunAkademik->id ?? null,
                        'tahun_akademik'        => $tahunAkademik->tahun_akademik ?? null,
                        'status_tahun_akademik' => $tahunAkademik->status ?? null,

                        'histori_rombel' => $ta->map(function ($hr) use ($tahunId) {

                            $waliRombel = $hr->rombel
                                ->waliRombels
                                ->where('tahun_akademik_id', $tahunId)
                                ->first();

                            $wali = $waliRombel?->wali;

                            return [
                                'siswa_rombel_id' => $hr->id,
                                'status_akhir'    => $hr->status_akhir ?? null,
                                'catatan'         => $hr->catatan ?? null,

                                'rombel' => [
                                    'id'          => $hr->rombel->id,
                                    'nama_rombel' => $hr->rombel->nama_rombel,
                                    'jurusan'     => $hr->rombel->jurusan->nama_jurusan ?? null,
                                    'status'      => $hr->rombel->status,

                                    'kelas' => [
                                        'id'         => $hr->rombel->kelas->id,
                                        'nama_kelas' => $hr->rombel->kelas->nama_kelas,
                                        'tingkat'    => $hr->rombel->kelas->tingkat,
                                        'status'     => $hr->rombel->kelas->status,
                                    ],

                                    'wali_rombel' => [
                                        'id'     => $wali?->id,
                                        'nama'   => $wali?->nama,
                                        'nip'    => $wali?->nip ?? null,
                                        'nuptk'  => $wali?->nuptk ?? null,
                                        'status' => $wali?->status,
                                    ],
                                ],                                
                            ];
                        })->values(),
                    ];
                })->values(),
        ]];

        return ApiResponse::success($formatted, 'Histori rombel siswa berhasil diambil');
    }


    /**
     * ✅ tidak ada update, jika salah, hapus saja
     */
    public function update(Request $request, string $id)
    {
        $siswaRombel = SiswaRombel::find($id);

        if (!$siswaRombel) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'status_akhir'  => 'sometimes|nullable|in:naik_kelas,tinggal_kelas,pindah,pindahan,berhenti,diberhentikan,lulus',
            'catatan'       => 'sometimes|nullable|string'
        ], [
            'status_akhir.in'   => 'Pilihan status akhir hanya naik_kelas, tinggal_kelas, pindah, pindahan, berhenti, diberhentikan, lulus',
            'catatan.string'    => 'Catatan harus berisi angka'
        ]);

        $siswaRombel->update($validated);

        $siswaRombel->load(['siswa', 'rombel.kelas', 'tahunAkademik']);

        return ApiResponse::success([
            'id'             => $siswaRombel->id ?? null,
            'nama_siswa'     => $siswaRombel->siswa->nama ?? null,
            'nama_rombel'    => $siswaRombel->rombel->nama_rombel ?? null,
            'kelas'          => $siswaRombel->rombel->kelas->nama_kelas ?? null,
            'tingkat'        => $siswaRombel->rombel->kelas->tingkat ?? null,
            'tahun_akademik' => $siswaRombel->tahunAkademik->tahun_akademik ?? null,
            'status_akhir'   => $siswaRombel->status_akhir ?? null,
            'catatan'        => $siswaRombel->catatan ?? null
        ], 'Berhasil memperbarui data');
    }

    /**
     * ✅ untuk spa
     */
    public function destroy(string $id)
    {
        $siswaRombel = SiswaRombel::with('tahunAkademik')->find($id);

        if (! $siswaRombel) {
            return ApiResponse::error(
                'Data tidak ditemukan',
                ['id' => ['Siswa rombel tidak ditemukan']],
                404
            );
        }

        $tahunAkademik = $siswaRombel->tahunAkademik;

        if (! $tahunAkademik) {
            return ApiResponse::error(
                'Data tidak valid',
                ['tahun_akademik' => ['Tahun akademik tidak ditemukan']],
                422
            );
        }

        // tidak boleh hapus jika tahun akademik arsip
        if ($tahunAkademik->status === 'arsip') {
            return ApiResponse::error(
                'Tidak bisa menghapus data',
                ['status' => ['Tahun akademik sudah menjadi arsip']],
                403
            );
        }

        $siswaRombel->delete();

        return ApiResponse::success(
            null,
            'Data siswa rombel berhasil dihapus'
        );
    }

    // spa
    public function dataSelect() {
        // siswa
        $data = Siswa::select('id', 'nama', 'nisn', 'nis')
        ->where('status', 'aktif')
        ->get();

        if ($data->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Belum ada data siswa aktif']);
        }

        $siswa = $data->map(function ($s) {
            return [
                'siswa_id'      => $s->id ?? null,
                'nama_siswa'    => $s->nama ?? null,
                'nisn'          => $s->nisn ?? null,
                'nis'           => $s->nis ?? null,
            ];
        })->values();
        

        // rombel
        $data2 = Rombel::with('jurusan')
        ->where('status', 'aktif')
        ->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Belum ada data rombel']
            );
        }    

        $rombel = $data2->map(function ($r) {
            return [
                'rombel_id'     => $r->id ?? null,
                'nama_rombel'   => $r->nama_rombel ?? null,
                'jurusan'       => $r->jurusan->nama_jurusan ?? null
            ];
        });


        return ApiResponse::success([
            'siswa' => $siswa,
            'rombels' => $rombel
        ], 'Data select berhasil diambil');
    }

}


