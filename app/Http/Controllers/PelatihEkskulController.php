<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kepegawaian;
use App\Models\TahunAkademik;
use App\Models\PelatihEkskul;
use App\Models\Ekstrakurikuler;
use App\Helpers\ApiResponse;

class PelatihEkskulController extends Controller
{
    /**
     * ✅ spa
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'pelatih_id' => 'required|exists:kepegawaians,id',
                'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id',
            ], [
                'pelatih_id.required' => 'Pelatih wajib diisi',
                'pelatih_id.exists' => 'Pelatih tidak ditemukan',
                'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
                'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',
            ]);

            // ambil tahun akademik aktif
            $tahunAktif = TahunAkademik::where('status', 'aktif')->first();

            if (!$tahunAktif) {
                return ApiResponse::error('Not found', [
                    'data' => 'Belum ada tahun akademik yang aktif'
                ]);
            }

            // ambil data pelatih
            $pelatih = Kepegawaian::find($validated['pelatih_id']);

            // ATURAN 2: role terlarang
            $roleTerlarang = ['super_admin', 'kepsek', 'siswa'];

            if (in_array(strtolower($pelatih->role), $roleTerlarang)) {
                return ApiResponse::error('Forbidden', [
                    'data' => 'Role ini tidak diperbolehkan menjadi pelatih ekstrakurikuler'
                ]);
            }

            // ATURAN: tidak boleh dobel (pelatih + ekskul + tahun)
            $cekDuplikat = PelatihEkskul::where('pelatih_id', $validated['pelatih_id'])
                ->where('ekstrakurikuler_id', $validated['ekstrakurikuler_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->exists();

            if ($cekDuplikat) {
                return ApiResponse::error('Double', [
                    'data' => 'Data ini sudah ada'
                ]);
            }

            // ATURAN 1: satu pelatih hanya satu ekskul per tahun
            $cekPelatih = PelatihEkskul::where('pelatih_id', $validated['pelatih_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->exists();

            if ($cekPelatih) {
                return ApiResponse::error('Double', [
                    'data' => 'Pelatih sudah melatih ekskul lain pada tahun akademik ini'
                ]);
            }

            // ekskul sudah memiliki pelatih
            $cekPelatih = PelatihEkskul::where('ekstrakurikuler_id', $validated['ekstrakurikuler_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->exists();

            if ($cekPelatih) {
                return ApiResponse::error('Double', [
                    'data' => 'Ekstrakurikuler sudah memiliki pelatih pada tahun akademik ini'
                ]);
            }

            // simpan
            $pelatihEkskul = PelatihEkskul::create([
                'pelatih_id' => $validated['pelatih_id'],
                'ekstrakurikuler_id' => $validated['ekstrakurikuler_id'],
                'tahun_akademik_id' => $tahunAktif->id,
            ]);

            $pelatihEkskul->load([
                'tahunAkademik',
                'pelatih',
                'ekstrakurikuler'
            ]);

            return ApiResponse::success([
                'id' => $pelatihEkskul->id,
                'pelatih' => $pelatihEkskul->pelatih->nama,
                'ekstrakurikuler' => $pelatihEkskul->ekstrakurikuler->nama_ekstrakurikuler,
                'tahun_akademik' => $pelatihEkskul->tahunAkademik->tahun_akademik,
            ], 'Berhasil menetapkan pelatih ekstrakurikuler');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


   /**
     * ✅ spa dan guru
     */
    public function show(string $id)
    {
        $pelatihEkskul = PelatihEkskul::with([
            'tahunAkademik',
            'pelatih',
            'ekstrakurikuler'
        ])
        ->where('pelatih_id', $id)
        ->get();

        if ($pelatihEkskul->isEmpty()) {
            return ApiResponse::error(
                'No data',
                ['data' => 'Data pelatih tidak ditemukan']
            );
        }

        // ambil data pelatih (cukup sekali)
        $pelatih = $pelatihEkskul->first()->pelatih;

        $formatted = [
            'pelatih_id'   => $pelatih?->id,
            'nama_pelatih' => $pelatih?->nama,
            'nip'          => $pelatih?->nip,
            'nuptk'        => $pelatih?->nuptk,

            'periode' => $pelatihEkskul
                ->groupBy('tahun_akademik_id')
                ->map(function ($perTahun) {

                    $tahun = $perTahun->first()->tahunAkademik;

                    return [
                        'tahun_akademik_id' => $tahun?->id,
                        'tahun_akademik' => $tahun?->tahun_akademik,
                        'status_tahun_akademik' => $tahun?->status,

                        'ekstrakurikuler' => $perTahun
                            ->map(function ($item) {

                                $ekskul = $item->ekstrakurikuler;

                                return [
                                    'ekskul_id' => $ekskul?->id,
                                    'nama_ekskul' => $ekskul?->nama_ekstrakurikuler,
                                    'anggaran' => $ekskul?->anggaran,
                                    'status_ekskul' => $ekskul?->status,
                                    'status_aktif_ekskul' => $ekskul?->status_aktif,
                                ];
                            })
                            ->values(),
                    ];
                })
                ->values(),
        ];

        return ApiResponse::success(
            $formatted,
            'Detail pelatih berhasil diambil'
        );
    }


    /**
     * ✅ spa
     */
    public function update(Request $request, string $id)
    {
        // ambil data pivot pelatih ekskul
        $pelatihEkskul = PelatihEkskul::with([
            'tahunAkademik',
            'pelatih',
            'ekstrakurikuler'
        ])->find($id);

        if (!$pelatihEkskul) {
            return ApiResponse::error('Not found', [
                'data' => 'Data tidak ditemukan'
            ]);
        }

        // ❌ tidak boleh ubah jika tahun akademik arsip
        if ($pelatihEkskul->tahunAkademik?->status === 'arsip') {
            return ApiResponse::error('Tidak bisa ubah', [
                'arsip' => 'Hanya bisa diubah pada saat tahun akademik aktif'
            ]);
        }

        // validasi input
        $validated = $request->validate([
            'pelatih_id' => 'sometimes|required|exists:kepegawaians,id',            
        ], [
            'pelatih_id.required' => 'Pelatih wajib diisi',
            'pelatih_id.exists' => 'Pelatih tidak ditemukan',                        
        ]);

        // gunakan tahun dari data lama (TIDAK BOLEH GANTI TAHUN)
        $tahunId = $pelatihEkskul->tahun_akademik_id;

        /* ======================
        * ATURAN ROLE PELATIH
        * ====================== */
        if (isset($validated['pelatih_id'])) {
            $pegawai = Kepegawaian::find($validated['pelatih_id']);

            $roleTerlarang = ['super_admin', 'kepsek', 'siswa'];

            if (in_array(strtolower($pegawai->role), $roleTerlarang)) {
                return ApiResponse::error('Forbidden', [
                    'data' => 'Role ini tidak diperbolehkan menjadi pelatih ekstrakurikuler'
                ]);
            }

            // ❌ satu pelatih hanya boleh satu ekskul per tahun
            $cekPelatih = PelatihEkskul::where('pelatih_id', $validated['pelatih_id'])
                ->where('tahun_akademik_id', $tahunId)
                ->where('id', '!=', $pelatihEkskul->id)
                ->exists();

            if ($cekPelatih) {
                return ApiResponse::error('Double', [
                    'data' => 'Pelatih sudah melatih ekskul lain pada tahun akademik ini'
                ]);
            }
        }

        /* ======================
        * ATURAN 1 EKSKUL 1 PELATIH
        * ====================== */
        $ekskulLama = $pelatihEkskul->ekstrakurikuler_id;
        
            $cekEkskul = PelatihEkskul::where('ekstrakurikuler_id', $ekskulLama)
                ->where('tahun_akademik_id', $tahunId)
                ->where('id', '!=', $pelatihEkskul->id)
                ->exists();

            if ($cekEkskul) {
                return ApiResponse::error('Double', [
                    'data' => 'Ekstrakurikuler ini sudah memiliki pelatih pada tahun akademik ini'
                ]);
            }

        // update data
        $pelatihEkskul->update($validated);

        $pelatihEkskul->load([
            'tahunAkademik',
            'pelatih',
            'ekstrakurikuler'
        ]);

        return ApiResponse::success(
            [
                'id' => $pelatihEkskul->id,
                'pelatih' => $pelatihEkskul->pelatih->nama,
                'ekstrakurikuler' => $pelatihEkskul->ekstrakurikuler->nama_ekstrakurikuler,
                'tahun_akademik' => $pelatihEkskul->tahunAkademik->tahun_akademik,
            ],
            'Data pelatih ekstrakurikuler berhasil diperbarui'
        );
    }


    /**
     * ✅ spa
     */
    public function destroy(string $id)
    {
        $pelatih = PelatihEkskul::with('tahunAkademik')->find($id);

        if (!$pelatih) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        // kalo T.A = arsip maka tidak boleh
        if ($pelatih->tahunAkademik->status == 'arsip') {        
            return ApiResponse::error('Tidak bisa', ['arsip' => 'Hanya bisa dihapus pada saat tahun akademik aktif']);
        }        

        $pelatih->delete();        

        return ApiResponse::success(null, 'Data pelatih berhasil dihapus');
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

        // pelatih
        $data2 = Kepegawaian::where('status', 'aktif')
        ->where('role', '!=', 'super_admin')
        ->where('role', '!=', 'kepsek')
        ->where('role', '!=', 'tu')
        ->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('No data', ['data' => 'Data tidak ditemukan']);
        }

        $pelatih = $data2->map(function ($p) {
            return [
                'pelatih_id' => $p->id ?? null,
                'nama_pelatih' => $p->nama ?? null,
                'nip' => $p->nip ?? null,
                'nuptk' => $p->nuptk ?? null,
                'role' => $p->role ?? null,
            ];
        })->values();    

        return ApiResponse::success([
            'pelatih' => $pelatih,
            'ekskul' => $ekskul,
        ], 'Data select berhasil diambil');
    }
}
