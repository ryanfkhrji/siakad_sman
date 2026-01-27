<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kepegawaian;
use App\Models\Rombel;
use App\Models\WaliRombel;
use App\Models\TahunAkademik;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class WaliRombelController extends Controller
{
    /**
     * ✅ spa/tu (SAMPE SINI)
     * get guru dan histori menjadi wali
     */
    public function show(string $id)
    {
        // 1. Ambil semua data wali rombel berdasarkan guru
        $waliRombel = WaliRombel::with([
            'wali',
            'rombel.kelas.jurusan',
            'tahunAkademik'
        ])
        ->where('wali_rombel_id', $id)
        ->get();

        if ($waliRombel->isEmpty()) {
            return ApiResponse::error('No data', ['data' => 'Belum ada data']);
        }

        // 2. Ambil data guru (cukup sekali)
        $guru = $waliRombel->first()->wali;

        // 3. Group berdasarkan tahun akademik
        $periode = $waliRombel
            ->groupBy('tahun_akademik_id')
            ->map(function ($items) {
                $tahun = $items->first()->tahunAkademik;

                return [
                    'tahun_akademik_id'     => $tahun->id,
                    'tahun_akademik'        => $tahun->tahun_akademik,
                    'status_tahun_akademik' => $tahun->status,
                    'rombels' => $items->map(function ($item) {
                        return [
                            'wali_rombel_id' => $item->id,
                            'rombel'         => $item->rombel->nama_rombel,
                            'kelas'          => $item->rombel->kelas->nama_kelas,
                            'jurusan'        => $item->rombel->kelas->jurusan->nama_jurusan ?? null,
                            'tingkat'        => $item->rombel->kelas->tingkat,
                        ];
                    })->values(),
                ];
            })->values();

        // 4. Final response
        return ApiResponse::success([
            'guru_id'   => $guru->id,
            'nama_guru' => $guru->nama,
            'nip'       => $guru->nip ?? null,
            'nuptk'     => $guru->nuptk ?? null,
            'periode'   => $periode,
        ], 'Detail wali berhasil diambil');
    }


    /**
     * ✅ spa/tu
     */
    public function store(Request $request)
    {
        // 1. Validasi input dasar
        $validated = $request->validate([
            'wali_rombel_id' => 'required|exists:kepegawaians,id',
            'rombel_id'      => 'required|exists:rombels,id',
        ], [
            'wali_rombel_id.required' => 'Data wali wajib diisi',
            'wali_rombel_id.exists'   => 'Data wali tidak ditemukan',
            'rombel_id.required'      => 'Data rombel wajib diisi',
            'rombel_id.exists'        => 'Data rombel tidak ditemukan',
        ]);

        // 2. Pastikan role = guru
        $guru = Kepegawaian::find($validated['wali_rombel_id']);
        if (!$guru || $guru->role !== 'guru') {
            return ApiResponse::error(
                'Kesalahan',
                ['wali_rombel_id' => 'Role bukan guru, tidak bisa menjadi wali kelas'],
                422
            );
        }

        // 3. Ambil tahun akademik aktif
        $tahunAktif = TahunAkademik::where('status', 'aktif')->first();
        if (!$tahunAktif) {
            return ApiResponse::error(
                'Kesalahan',
                ['tahun_akademik' => 'Belum ada tahun akademik aktif'],
                422
            );
        }

        // 4. Cek duplikasi wali + rombel + tahun
        $duplikasi = WaliRombel::where('wali_rombel_id', $validated['wali_rombel_id'])
            ->where('rombel_id', $validated['rombel_id'])
            ->where('tahun_akademik_id', $tahunAktif->id)
            ->exists();

        if ($duplikasi) {
            return ApiResponse::error(
                'Duplikasi',
                ['data' => 'Guru sudah menjadi wali pada rombel ini di tahun akademik tersebut'],
                422
            );
        }

        // 5. Satu guru hanya boleh satu rombel per tahun akademik
        $existsWali = WaliRombel::where('wali_rombel_id', $validated['wali_rombel_id'])
            ->where('tahun_akademik_id', $tahunAktif->id)
            ->exists();

        if ($existsWali) {
            return ApiResponse::error(
                'Kesalahan',
                ['data' => 'Guru ini sudah menjadi wali rombel lain pada tahun akademik ini'],
                422
            );
        }

        // 6. rombel sudah punya wali
        $cekRombel = WaliRombel::where('rombel_id', $validated['rombel_id'])
            ->where('tahun_akademik_id', $tahunAktif->id)
            ->exists();

        if ($cekRombel) {
            return ApiResponse::error('Not supported', [
                'data' => 'Rombel sudah memiliki wali pada tahun ini'
            ]);
        }

        // 7. Simpan data wali rombel
        $wali = WaliRombel::create([
            'wali_rombel_id'    => $validated['wali_rombel_id'],
            'rombel_id'         => $validated['rombel_id'],
            'tahun_akademik_id' => $tahunAktif->id,
        ]);

        // 8. Load relasi untuk response
        $wali->load([
            'wali',
            'rombel',
            'tahunAkademik',
        ]);

        // 9. Response sukses
        return ApiResponse::success([
            'id'             => $wali->id,
            'wali'           => $wali->wali?->nama,
            'rombel'         => $wali->rombel?->nama_rombel,
            'tahun_akademik' => $wali->tahunAkademik?->tahun_akademik,
        ], 'Data wali rombel berhasil dibuat', 201);
    }
   

    // guru
    public function getAllRombelSendiri(string $id)
    {
        //
    }

    /**
     * ✅ spa/tu
     */
    public function update(Request $request, string $id)
    {
        // 1. Ambil data wali rombel
        $waliRombel = WaliRombel::with([
            'wali',
            'rombel',
            'tahunAkademik'
        ])->find($id);

        if (!$waliRombel) {
            return ApiResponse::error('Not Found', [
                'data' => 'Data tidak ditemukan'
            ]);
        }

        // 2. Hanya boleh update pada tahun akademik aktif
        if ($waliRombel->tahunAkademik->status === 'arsip') {
            return ApiResponse::error('Tidak bisa diubah', [
                'arsip' => 'Hanya bisa diubah pada saat tahun akademik aktif'
            ]);
        }

        // 3. Validasi input (khusus update)
        $validated = $request->validate([
            'wali_rombel_id' => 'sometimes|required|exists:kepegawaians,id'
        ], [
            'wali_rombel_id.required' => 'Data wali wajib diisi',
            'wali_rombel_id.exists'   => 'Data wali tidak ditemukan',
        ]);

        // 4. Jika tidak ada data yang dikirim
        if (empty($validated)) {
            return ApiResponse::error('Bad Request', [
                'data' => 'Tidak ada data yang diubah'
            ]);
        }

        // 5. Validasi wali baru (jika diubah)
        if ($request->filled('wali_rombel_id')) {

            $pegawai = Kepegawaian::find($validated['wali_rombel_id']);

            if ($pegawai->role !== 'guru') {
                return ApiResponse::error('Forbidden', [
                    'data' => 'Role selain guru tidak boleh menjadi wali kelas'
                ]);
            }

            // ❗ 1 guru hanya boleh menjadi wali 1 rombel per tahun akademik
            $cekGuru = WaliRombel::where('wali_rombel_id', $validated['wali_rombel_id'])
                ->where('tahun_akademik_id', $waliRombel->tahun_akademik_id)
                ->where('id', '!=', $waliRombel->id)
                ->exists();

            if ($cekGuru) {
                return ApiResponse::error('Double', [
                    'data' => 'Guru sudah menjadi wali pada rombel lain di tahun ini'
                ]);
            }            
        }

        // 6. Update data
        $waliRombel->update($validated);

        // 7. Reload relasi
        $waliRombel->load([
            'wali',
            'rombel',
            'tahunAkademik'
        ]);

        // 8. Response
        return ApiResponse::success([
            'id'                    => $waliRombel->id,
            'nama_wali'             => $waliRombel->wali->nama,
            'rombel'                => $waliRombel->rombel->nama_rombel,
            'tahun_akademik'        => $waliRombel->tahunAkademik->tahun_akademik,
            'status_tahun_akademik' => $waliRombel->tahunAkademik->status,
        ], 'Data wali berhasil diperbarui');
    }


    /**
     * ✅ spa/tu
     */
    public function destroy(string $id)
    {
        $wali = WaliRombel::with('tahunAkademik')->find($id);

        if (!$wali) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        // jika tahun_akademik sudah arsip maka tidak boleh     
        if ($wali->tahunAkademik->status == 'arsip') {        
            return ApiResponse::error('Tidak bisa', ['arsip' => 'Hanya bisa dihapus pada saat tahun akademik aktif']);
        }        

        $wali->delete();        

        return ApiResponse::success(null, 'Data wali berhasil dihapus');
    }

    // ✅ spa/tu
    public function dataSelect()
    {
        // role guru saja
        $data = Kepegawaian::where('role', 'guru')
        ->where('status', 'aktif')
        ->get();

        if ($data->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Tidak ada guru aktif']
            );
        }     

        $guru = $data->map(function ($g) {
            return [
                'guru_id' => $g->id,
                'nama_guru' => $g->nama,
                'nip' => $g->nip ?? null,
                'nuptk' => $g->nuptk ?? null,
            ];
        });

        // semua rombel
        $data2 = Rombel::with('kelas.jurusan')->where('status', 'aktif')->get();

        $rombel = $data2->map(function ($r) {
            return [
                'rombel_id' => $r->id,
                'nama_rombel' => $r->nama_rombel,
                'kelas' => $r->kelas->nama_kelas,
                'jurusan' => $r->kelas->jurusan->nama_jurusan ?? null,
                'tingkat' => $r->kelas->tingkat,
            ];
        })->values();

        return ApiResponse::success(
            [
                'guru' => $guru,
                'rombel' => $rombel,
            ],
            'Data select berhasil diambil'
        );
    }
}
