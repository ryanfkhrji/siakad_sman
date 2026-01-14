<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kurikulum;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class KurikulumController extends Controller
{
    /**
     * ✅ untuk spa
     */
    public function index()
    {
        $data = Kurikulum::get();

        $formatted = $data->map(function ($item) {
           return [
                'id' => $item->id ?? null,
                'nama_kurikulum' => $item->nama_kurikulum ?? null,
                'kode_kurikulum' => $item->kode_kurikulum ?? null,
                'tipe' => $item->tipe ?? null,
                'tahun_mulai' => $item->tahun_mulai ?? null,
                'tahun_selesai' => $item->tahun_selesai ?? null,
                'deskripsi' => $item->deskripsi ?? null,
                'status' => $item->status ?? null,
            ];
        });

        return ApiResponse::success($formatted, 'Semua kurikulum berhasil diambil');
    }

    /**
     * ✅ untuk spa
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_kurikulum' => 'required',
                'kode_kurikulum' => 'required|unique:kurikulum,kode_kurikulum',
                'tipe' => 'required|in:K13,MERDEKA',
                'tahun_mulai' => 'nullable',
                'tahun_selesai' => 'nullable',
                'deskripsi' => 'nullable',
            ], [
                'nama_kurikulum.required' => 'Nama kurikulum wajib diisi',
                'kode_kurikulum.required' => 'Kode kurikulum wajib diisi',
                'kode_kurikulum.unique' => 'Kode kurikulum sudah ada',
                'tipe.required' => 'Tipe wajib diisi',
                'tipe.in' => 'Pilihan hanya K13 atau MERDEKA'
            ]);

            $kurikulum = Kurikulum::create($validated);

            return ApiResponse::success([
                'id' => $kurikulum->id ?? null,
                'nama_kurikulum' => $kurikulum->nama_kurikulum ?? null,
                'kode_kurikulum' => $kurikulum->kode_kurikulum ?? null,
                'tipe' => $kurikulum->tipe ?? null,
                'tahun_mulai' => $kurikulum->tahun_mulai ?? null,
                'tahun_selesai' => $kurikulum->tahun_selesai ?? null,
                'deskripsi' => $kurikulum->deskripsi ?? null,
                'status' => 'aktif',
            ], 'Data kurikulum berhasil dibuat');
        } catch (ValidationException $e)  {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ untuk spa
     * kurikulum
     *  
     */
    public function show(string $id)
    {
        $kurikulum = Kurikulum::with([
            'kompetensi.mataPelajaran'
        ])->find($id);

        if (! $kurikulum) {
            return ApiResponse::error(
                'Data tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        // =========================
        // KURIKULUM KD
        // =========================
        if ($kurikulum->jenis === 'KD') {

            $histori = $kurikulum->kompetensi
                ->groupBy('tingkat')
                ->map(function ($groupByTingkat) {

                    return [
                        'tingkat' => $groupByTingkat->first()->tingkat,

                        // group by mapel
                        'mata_pelajaran' => $groupByTingkat
                            ->groupBy('mata_pelajaran_id')
                            ->map(function ($groupByMapel) {

                                $mapel = $groupByMapel->first()->mataPelajaran;

                                return [
                                    'mata_pelajaran_id' => $mapel->id,
                                    'mata_pelajaran' => $mapel->nama_pelajaran,

                                    // daftar kompetensi
                                    'kompetensi' => $groupByMapel->map(function ($kompetensi) {
                                        return [
                                            'kompetensi_id' => $kompetensi->id,
                                            'judul_kompetensi' => $kompetensi->judul_kompetensi,
                                            'jenis' => $kompetensi->jenis,
                                            'kode' => $kompetensi->kode,
                                            'aspek' => $kompetensi->aspek,
                                            'deskripsi' => $kompetensi->deskripsi,
                                            'status_kompetensi' => $kompetensi->status,
                                        ];
                                    })->values(),
                                ];
                            })->values(),
                    ];
                })->values();

        }
        // =========================
        // KURIKULUM CP (MERDEKA)
        // =========================
        else {

            $histori = $kurikulum->kompetensi
                ->groupBy('fase')
                ->map(function ($groupByFase) {

                    return [
                        'fase' => $groupByFase->first()->fase,

                        // group by mapel
                        'mata_pelajaran' => $groupByFase
                            ->groupBy('mata_pelajaran_id')
                            ->map(function ($groupByMapel) {

                                $mapel = $groupByMapel->first()->mataPelajaran;

                                return [
                                    'mata_pelajaran_id' => $mapel->id,
                                    'mata_pelajaran' => $mapel->nama_pelajaran,

                                    // daftar kompetensi
                                    'kompetensi' => $groupByMapel->map(function ($kompetensi) {
                                        return [
                                            'kompetensi_id' => $kompetensi->id,
                                            'judul_kompetensi' => $kompetensi->judul_kompetensi,
                                            'jenis' => $kompetensi->jenis,
                                            'kode' => $kompetensi->kode,
                                            'deskripsi' => $kompetensi->deskripsi,
                                            'status_kompetensi' => $kompetensi->status,
                                        ];
                                    })->values(),
                                ];
                            })->values(),
                    ];
                })->values();
        }

        return ApiResponse::success([
            'id' => $kurikulum->id,
            'nama_kurikulum' => $kurikulum->nama_kurikulum,
            'kode_kurikulum' => $kurikulum->kode_kurikulum,
            'tipe' => $kurikulum->tipe,
            'tahun_mulai' => $kurikulum->tahun_mulai,
            'tahun_selesai' => $kurikulum->tahun_selesai,
            'deskripsi' => $kurikulum->deskripsi,
            'status_kurikulum' => $kurikulum->status,
            'histori_kompetensi' => $histori,
        ], 'Detail kurikulum berhasil diambil');
    }



    /**
     * ✅ untuk spa
     */
    public function update(Request $request, string $id)
    {
        $kurikulum = Kurikulum::find($id);

        if (!$kurikulum) {
            return ApiResponse::error('Kurikulum tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_kurikulum' => [
                'sometimes',
                'required',                
            ],
            'kode_kurikulum' => [
                'sometimes',
                'required',
                Rule::unique('kurikulum')->ignore($id)
            ],
            'tipe' => 'sometimes|required|in:K13,MERDEKA',
            'tahun_mulai' => 'sometimes|nullable',
            'tahun_selesai' => 'sometimes|nullable',
            'deskripsi' => 'sometimes|nullable',
            'status' => 'sometimes|required|in:aktif,arsip',
        ], [
            'nama_kurikulum.required' => 'Nama kurikulum wajib diisi',
            'kode_kurikulum.required' => 'Kode kurikulum wajib diisi',
            'kode_kurikulum.unique' => 'Kode kurikulum sudah ada',
            'tipe.required' => 'Tipe kurikulum wajib diisi',
            'tipe.in' => 'Pilihan tipe hanya K13 atau MERDEKA',
            'status.required' => 'Status kurikulum wajib diisi',
            'status.in' => 'Pilihan hanya aktif atau arsip'
        ]);

        $kurikulum->update($validated);

        return ApiResponse::success(
            [
                'id' => $kurikulum->id ?? null,
                'nama_kurikulum' => $kurikulum->nama_kurikulum ?? null,
                'kode_kurikulum' => $kurikulum->kode_kurikulum ?? null,
                'tipe' => $kurikulum->tipe ?? null,
                'tahun_mulai' => $kurikulum->tahun_mulai ?? null,
                'tahun_selesai' => $kurikulum->tahun_selesai ?? null,
                'deskripsi' => $kurikulum->deskripsi ?? null,
                'status' => $kurikulum->status ?? null,
            ], 
            'Kurikulum berhasil diperbarui'
        );
    }

    /**
     * ✅ untuk spa
     */
    public function destroy(string $id)
    {
        $kurikulum = Kurikulum::find($id);

        if (!$kurikulum) {
            return ApiResponse::error('Kurikulum tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek apakah kurikulum sedang digunakan oleh kompetensi dasar
        if ($kurikulum->kompetensiDasars()->exists()) {
            return ApiResponse::error('Kurikulum tidak bisa dihapus karena masih digunakan pada kompetensi dasar', [
                'nama_kurikulum' => ['Kurikulum ini masih digunakan pada kompetensi']
            ], 422);
        }
        
        // Cek apakah kurikulum sedang digunakan oleh kurmap
        if ($kurikulum->kurikulumMataPelajaran()->exists()) {
            return ApiResponse::error('Kurikulum tidak bisa dihapus karena masih digunakan pada kurikulum mata pelajaran', [
                'nama_kurikulum' => ['Kurikulum masih digunakan']
            ], 422);
        }

        $kurikulum->delete();
        return ApiResponse::success(null, 'Kurikulum berhasil dihapus');
    }
}
