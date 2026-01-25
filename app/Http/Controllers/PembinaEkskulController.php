<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PembinaEkskul;
use App\Models\Kepegawaian;
use App\Models\TahunAkademik;
use App\Models\Ekstrakurikuler;
use App\Helpers\ApiResponse;

class PembinaEkskulController extends Controller
{
    /**
     * ✅ spa
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'pembina_id' => 'required|exists:kepegawaians,id',
                'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id',
            ], [
                'pembina_id.required' => 'Pembina wajib diisi',
                'pembina_id.exists' => 'Pembina tidak ditemukan',
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

            // ambil data pembina
            $pembina = Kepegawaian::find($validated['pembina_id']);

            // ATURAN 2: role terlarang
            $roleTerlarang = ['super_admin', 'kepsek', 'siswa'];

            if (in_array(strtolower($pembina->role), $roleTerlarang)) {
                return ApiResponse::error('Forbidden', [
                    'data' => 'Role ini tidak diperbolehkan menjadi pembina ekstrakurikuler'
                ]);
            }

            // ATURAN: tidak boleh dobel (pembina + ekskul + tahun)
            $cekDuplikat = PembinaEkskul::where('pembina_id', $validated['pembina_id'])
                ->where('ekstrakurikuler_id', $validated['ekstrakurikuler_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->exists();

            if ($cekDuplikat) {
                return ApiResponse::error('Double', [
                    'data' => 'Data ini sudah ada'
                ]);
            }

            // ATURAN 1: satu pembina hanya satu ekskul per tahun
            $cekPembina = PembinaEkskul::where('pembina_id', $validated['pembina_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->exists();

            if ($cekPembina) {
                return ApiResponse::error('Double', [
                    'data' => 'Pembina sudah membina ekskul lain pada tahun akademik ini'
                ]);
            }

            // ekskul sudah memiliki pembina
            $cekPembina = PembinaEkskul::where('ekstrakurikuler_id', $validated['ekstrakurikuler_id'])
                ->where('tahun_akademik_id', $tahunAktif->id)
                ->exists();

            if ($cekPembina) {
                return ApiResponse::error('Double', [
                    'data' => 'Ekstrakurikuler sudah memiliki pembina pada tahun akademik ini'
                ]);
            }

            // simpan
            $pembinaEkskul = PembinaEkskul::create([
                'pembina_id' => $validated['pembina_id'],
                'ekstrakurikuler_id' => $validated['ekstrakurikuler_id'],
                'tahun_akademik_id' => $tahunAktif->id,
            ]);

            $pembinaEkskul->load([
                'tahunAkademik',
                'pembina',
                'ekstrakurikuler'
            ]);

            return ApiResponse::success([
                'id' => $pembinaEkskul->id,
                'pembina' => $pembinaEkskul->pembina->nama,
                'ekstrakurikuler' => $pembinaEkskul->ekstrakurikuler->nama_ekstrakurikuler,
                'tahun_akademik' => $pembinaEkskul->tahunAkademik->tahun_akademik,
            ], 'Berhasil menetapkan pembina ekstrakurikuler');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    /**
     * ✅ spa dan guru
     */
    public function show(string $id)
    {
        $pembinaEkskul = PembinaEkskul::with([
            'tahunAkademik',
            'pembina',
            'ekstrakurikuler'
        ])
        ->where('pembina_id', $id)
        ->get();

        if ($pembinaEkskul->isEmpty()) {
            return ApiResponse::error(
                'No data',
                ['data' => 'Data pembina tidak ditemukan']
            );
        }

        // ambil data pembina (cukup sekali)
        $pembina = $pembinaEkskul->first()->pembina;

        $formatted = [
            'pembina_id'   => $pembina?->id,
            'nama_pembina' => $pembina?->nama,
            'nip'          => $pembina?->nip,
            'nuptk'        => $pembina?->nuptk,

            'periode' => $pembinaEkskul
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
            'Detail pembina berhasil diambil'
        );
    }


    /**
     * ✅ spa
     */
    public function update(Request $request, string $id)
    {
        // ambil data pivot pembina ekskul
        $pembinaEkskul = PembinaEkskul::with([
            'tahunAkademik',
            'pembina',
            'ekstrakurikuler'
        ])->find($id);

        if (!$pembinaEkskul) {
            return ApiResponse::error('Not found', [
                'data' => 'Data tidak ditemukan'
            ]);
        }

        // ❌ tidak boleh ubah jika tahun akademik arsip
        if ($pembinaEkskul->tahunAkademik?->status === 'arsip') {
            return ApiResponse::error('Tidak bisa ubah', [
                'arsip' => 'Hanya bisa diubah pada saat tahun akademik aktif'
            ]);
        }

        // validasi input
        $validated = $request->validate([
            'pembina_id' => 'sometimes|required|exists:kepegawaians,id',
            // 'ekstrakurikuler_id' => 'sometimes|required|exists:ekstrakurikulers,id',
        ], [
            'pembina_id.required' => 'Pembina wajib diisi',
            'pembina_id.exists' => 'Pembina tidak ditemukan',
            // 'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
            // 'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',
        ]);

        // gunakan tahun dari data lama (TIDAK BOLEH GANTI TAHUN)
        $tahunId = $pembinaEkskul->tahun_akademik_id;

        /* ======================
        * ATURAN ROLE PEMBINA
        * ====================== */
        if (isset($validated['pembina_id'])) {
            $pegawai = Kepegawaian::find($validated['pembina_id']);

            $roleTerlarang = ['super_admin', 'kepsek', 'siswa'];

            if (in_array(strtolower($pegawai->role), $roleTerlarang)) {
                return ApiResponse::error('Forbidden', [
                    'data' => 'Role ini tidak diperbolehkan menjadi pembina ekstrakurikuler'
                ]);
            }

            // ❌ satu pembina hanya boleh satu ekskul per tahun
            $cekPembina = PembinaEkskul::where('pembina_id', $validated['pembina_id'])
                ->where('tahun_akademik_id', $tahunId)
                ->where('id', '!=', $pembinaEkskul->id)
                ->exists();

            if ($cekPembina) {
                return ApiResponse::error('Double', [
                    'data' => 'Pembina sudah membina ekskul lain pada tahun akademik ini'
                ]);
            }
        }

        /* ======================
        * ATURAN 1 EKSKUL 1 PEMBINA
        * ====================== */
        // get id_ekskul lama
        $ekskulLama = $pembinaEkskul->ekstrakurikuler_id;

            $cekEkskul = PembinaEkskul::where('ekstrakurikuler_id', $ekskulLama)
                ->where('tahun_akademik_id', $tahunId)
                ->where('id', '!=', $pembinaEkskul->id)
                ->exists();

            if ($cekEkskul) {
                return ApiResponse::error('Double', [
                    'data' => 'Ekstrakurikuler ini sudah memiliki pembina pada tahun akademik ini'
                ]);
            }        

        // update data
        $pembinaEkskul->update($validated);

        $pembinaEkskul->load([
            'tahunAkademik',
            'pembina',
            'ekstrakurikuler'
        ]);

        return ApiResponse::success(
            [
                'id' => $pembinaEkskul->id,
                'pembina' => $pembinaEkskul->pembina->nama,
                'ekstrakurikuler' => $pembinaEkskul->ekstrakurikuler->nama_ekstrakurikuler,
                'tahun_akademik' => $pembinaEkskul->tahunAkademik->tahun_akademik,
            ],
            'Data pembina ekstrakurikuler berhasil diperbarui'
        );
    }


    /**
     * ✅ spa
     */
    public function destroy(string $id)
    {
        $pembina = PembinaEkskul::with('tahunAkademik')->find($id);

        if (!$pembina) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        // kalo T.A = arsip maka tidak boleh
        if ($pembina->tahunAkademik->status == 'arsip') {        
            return ApiResponse::error('Tidak bisa', ['arsip' => 'Hanya bisa dihapus pada saat tahun akademik aktif']);
        }        

        $pembina->delete();        

        return ApiResponse::success(null, 'Data pembina berhasil dihapus');
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

        // pembina
        $data2 = Kepegawaian::where('status', 'aktif')
        ->where('role', '!=', 'super_admin')
        ->where('role', '!=', 'kepsek')
        ->where('role', '!=', 'tu')
        ->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('No data', ['data' => 'Data tidak ditemukan']);
        }

        $pembina = $data2->map(function ($p) {
            return [
                'pembina_id' => $p->id ?? null,
                'nama_pembina' => $p->nama ?? null,
                'nip' => $p->nip ?? null,
                'nuptk' => $p->nuptk ?? null,
                'role' => $p->role ?? null,
            ];
        })->values();    

        return ApiResponse::success([
            'pembina' => $pembina,
            'ekskul' => $ekskul,
        ], 'Data select berhasil diambil');
    }
}
