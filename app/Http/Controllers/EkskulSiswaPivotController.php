<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EkskulSiswaPivot;
use App\Models\Siswa;
use App\Models\TahunAkademik;
use App\Models\Ekstrakurikuler;
use Illuminate\Support\Facades\Hash;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EkskulSiswaPivotController extends Controller
{
    // ✅ spa: get histori
    public function show(string $id)
    {
        $ekskulSiswa = EkskulSiswaPivot::with([
            'ekstrakurikuler',
            'siswa',
            'tahunAkademik',
        ])
        ->where('siswa_id', $id)
        ->get();

        if ($ekskulSiswa->isEmpty()) {
            return ApiResponse::error(
                'No data',
                ['data' => 'Data tidak ditemukan']
            );
        }

        // ambil data siswa (cukup sekali)
        $siswa = $ekskulSiswa->first()->siswa;

        $formatted = [
            'siswa_id'      => $siswa?->id,
            'nama_siswa'    => $siswa?->nama,
            'nisn'          => $siswa?->nisn,
            'nis'           => $siswa?->nis,

            'periode' => $ekskulSiswa
                ->groupBy('tahun_akademik_id')
                ->map(function ($perTahun) {

                    $tahun = $perTahun->first()->tahunAkademik;

                    return [
                        'tahun_akademik_id' => $tahun?->id,
                        'tahun_akademik' => $tahun?->tahun_akademik,
                        'status_tahun_akademik' => $tahun?->status,

                        'ekstrakurikulers' => $perTahun
                            ->map(function ($item) {

                                $ekskul = $item->ekstrakurikuler;

                                return [
                                    'ekskul_id' => $ekskul?->id,
                                    'nama_ekskul' => $ekskul?->nama_ekstrakurikuler,
                                    'anggaran' => $ekskul?->anggaran,
                                    'status_ekskul' => $ekskul?->status,
                                    'status_aktif_ekskul' => $ekskul?->status_aktif,
                                    'sikap' => $item->sikap ?? null,
                                    'status_kehadiran' => $item->status ?? null,
                                ];
                            })
                            ->values(),
                    ];
                })
                ->values(),
        ];

        return ApiResponse::success(
            $formatted,
            'Detail ekskul siswa berhasil diambil'
        );
    }


    // ✅ get all ekskul sendiri (siswa)
    public function getAllEkskulSendiri()
    {
        $siswa = Auth::guard('siswa')->user();
    
        $ekskul = EkskulSiswaPivot::with([
                'ekstrakurikuler.pelatihEkskul.pelatih',
                'ekstrakurikuler.pembinaEkskul.pembina',
                'ekstrakurikuler.peserta.siswa',
                'tahunAkademik'
            ])
            ->where('siswa_id', $siswa->id)
            ->whereHas('tahunAkademik', fn ($q) => $q->where('status', 'aktif'))
            ->get();
    
        $hasil = $ekskul
            ->groupBy('tahun_akademik_id')
            ->map(function ($items) {
    
                $tahun = $items->first()->tahunAkademik;
    
                return [
                    'tahun_akademik_id' => $tahun->id,
                    'tahun_akademik' => $tahun->tahun_akademik,
                    'status_tahun_akademik' => $tahun->status,
    
                    'daftar_ekstrakurikuler' => $items
                        ->groupBy('ekstrakurikuler_id')
                        ->map(function ($ekskulItems) {
    
                            $pivot = $ekskulItems->first();
                            $ekskul = $pivot->ekstrakurikuler;
                            $tahunId = $pivot->tahun_akademik_id;
    
                            return [
                                'ekskul_id' => $ekskul->id,
                                'nama_ekskul' => $ekskul->nama_ekstrakurikuler,
    
                                /* ===== PEMBINA (1 per tahun) ===== */
                                'pembina' => $ekskul->pembinaEkskul
                                    ->where('tahun_akademik_id', $tahunId)
                                    ->first()?->pembina->nama,
    
                                /* ===== PELATIH (1 per tahun) ===== */
                                'pelatih' => $ekskul->pelatihEkskul
                                    ->where('tahun_akademik_id', $tahunId)
                                    ->first()?->pelatih->nama,
    
                                /* ===== PESERTA (BANYAK per tahun) ===== */
                                'peserta' => $ekskul->peserta
                                    ->where('tahun_akademik_id', $tahunId)
                                    ->map(function ($peserta) {
                                        return [
                                            'siswa_id' => $peserta->siswa->id,
                                            'nama_siswa' => $peserta->siswa->nama,
                                            'sikap' => $peserta->sikap,
                                            'status' => $peserta->status,
                                        ];
                                    })
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();
    
        return ApiResponse::success($hasil, 'Data ekstrakurikuler siswa');
    }
    

    // ✅ mendaftarkan siswa oleh spa/pelatih/pembina
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',
                'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id',                
            ], [
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
                'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',                
            ]);            

            $tahunAktif = TahunAkademik::where('status', 'aktif')->first();

            if (!$tahunAktif) {
                return ApiResponse::error('Not supported', ['tahun' => 'Belum ada tahun aktif']);
            }

            $existing = EkskulSiswaPivot::where('siswa_id', $validated['siswa_id'])
                ->where('ekstrakurikuler_id', $validated['ekstrakurikuler_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->exists();

            if ($existing) {
                return ApiResponse::error('Duplikasi', [
                    'siswa_id' => ['Siswa sudah terdaftar di ekstrakurikuler ini']
                ], 422);
            }            

            $pivot = EkskulSiswaPivot::create([
                'siswa_id' => $validated['siswa_id'],
                'ekstrakurikuler_id' => $validated['ekstrakurikuler_id'],
                'tahun_akademik_id' => $tahunAktif->id,
                'status' => 'Aktif',
            ]);
            
            $pivot->load('siswa', 'ekstrakurikuler', 'tahunAkademik');

            return ApiResponse::success([
                'id' => $pivot->id,
                'nama_siswa' => $pivot->siswa->nama,
                'nama_ekskul' => $pivot->ekstrakurikuler->nama_ekstrakurikuler,                
                'tahun_akademik' => $pivot->tahunAkademik->tahun_akademik,
                'status' => $pivot->status
            ], 'Pendaftaran berhasil');
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ untuk pelatih/pembina
    public function update(Request $request, string $id)
    {
        $ekskul = EkskulSiswaPivot::with('ekstrakurikuler', 'siswa')->find($id);

        if (!$ekskul) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([            
            'sikap' => 'sometimes|nullable|in:Sangat Baik,Baik,Cukup,Kurang', 
            'status' => 'sometimes|nullable|in:Aktif,Cukup Aktif,Kurang Aktif,Tidak Aktif', 
        ],[            
            'sikap.in' => 'Pilihan sikap hanya Sangat Baik, Baik, Cukup, Kurang',
            'status.in' => 'Pilihan status hanya Aktif, Cukup Aktif, Kurang Aktif, Tidak Aktif',
        ]);       

        $ekskul->update($validated);

        $ekskul->load('siswa', 'ekstrakurikuler', 'tahunAkademik');

        return ApiResponse::success([
            'ekskul_siswa_pivot_id' => $ekskul->id ?? null,
            'nama_siswa' => $ekskul->siswa->nama ?? null,
            'nama_ekskul' => $ekskul->ekstrakurikuler->nama_ekstrakurikuler ?? null,
            'tahun_akademik' => $ekskul->tahunAkademik->tahun_akademik ?? null,
            'sikap' => $ekskul->sikap ?? null,
            'status' => $ekskul->status ?? null,
        ], 'Data berhasil diperbarui');
    }


    // ✅ destroy buat pelatih/pembina
    public function destroy($id)
    {
        $pivot = EkskulSiswaPivot::find($id);
        if (!$pivot) {
            return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $pivot->delete();
        return ApiResponse::success(null, 'Peserta berhasil dihapus');
    }


    // ✅ siswa daftar sendiri
    public function storeSiswa(Request $request)
    {

        // ambil id siswa yang lagi login
        $siswa = Auth::guard('siswa')->user();

        $validated = $request->validate([
            'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id'
        ],[
            'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
            'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',
        ]);

        $tahunAkademik = TahunAkademik::where('status', 'aktif')->first();

        // cocokkan dengan id eskul yang di klik
        $existing = EkskulSiswaPivot::where('siswa_id', $siswa->id)
            ->where('ekstrakurikuler_id', $validated['ekstrakurikuler_id'])
            ->where('tahun_akademik_id', $tahunAkademik->id)
            ->exists();

        if ($existing) {
            return ApiResponse::error('Anda sudah terdaftar di ekskul ini', [
                'siswa_id' => ['Anda sudah terdaftar di ekskul ini']
            ], 422);
        }

        $pivot = EkskulSiswaPivot::create([
            'siswa_id' => $siswa->id,
            'ekstrakurikuler_id' => $validated['ekstrakurikuler_id'],
            'tahun_akademik_id' => $tahunAakademik->id ?? null,
            'status' => 'Aktif',
        ]);

        $pivot->load('siswa', 'ekstrakurikuler', 'tahunAkademik');

        return ApiResponse::success([
            'id' => $pivot->id,
            'nama_siswa' => $pivot->siswa->nama,
            'nama_ekskul' => $pivot->ekstrakurikuler->nama_ekstrakurikuler,
            'tahun_akademik' => $pivot->tahunAkademik->tahun_akademik ?? null,
            'status' => $pivot->status ?? null,            
        ], 'Pendaftaran berhasil');
    }


    // ✅ destroy buat siswa (diri sendiri)    
    public function destroySiswa(Request $request)
    {
        $siswa = Auth::guard('siswa')->user();

        $validated = $request->validate([
            'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id'
        ],[
            'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
            'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',
        ]);

        $tahunAkademik = TahunAkademik::where('status', 'aktif')->first();

        $pivot = EkskulSiswaPivot::where([
            ['siswa_id', '=', $siswa->id],
            ['ekstrakurikuler_id', '=', $validated['ekstrakurikuler_id']],
            ['tahun_akademik_id', '=', $tahunAkademik->id],
        ])->first();

        if (!$pivot) {
            return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $pivot->delete();
        $pivot->load('ekstrakurikuler');

        return ApiResponse::success(null, 'Peserta berhasil keluar dari ekskul '.$pivot->ekstrakurikuler->nama_ekstrakurikuler);
    }


    // ✅ spa
    public function dataSelect() {
        // data select
        $data = Ekstrakurikuler::where('status_aktif', 'aktif')->get();

        if ($data->isEmpty()) {
            return ApiResponse::error('No data', ['data' => 'Belum ada ekstrakurikuler aktif']);
        }

        $ekskul = $data->map(function ($e) {
        return [
                'ekskul_id' => $e->id ?? null,
                'nama_ekskul' => $e->nama_ekstrakurikuler ?? null,
                'anggaran' => $e->anggaran ?? null,
                'status' => $e->status ?? null,
                'status_aktif' => $e->status_aktif ?? null,
        ];
        });

        // siswa
        $data2 = Siswa::where('status', 'aktif')->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('No data', ['data' => 'Data tidak ditemukan']);
        }

        $siswa = $data2->map(function ($s) {
            return [
                'siswa_id' => $s->id ?? null,
                'nama_siswa' => $s->nama ?? null,
                'nisn' => $s->nisn ?? null,
                'nis' => $s->nis ?? null,
            ];
        })->values();    

        return ApiResponse::success([
            'siswa' => $siswa,
            'ekskul' => $ekskul,
        ], 'Data select berhasil diambil');
    }
}
