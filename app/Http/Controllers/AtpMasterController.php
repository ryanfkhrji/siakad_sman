<?php

namespace App\Http\Controllers;
use App\Models\AtpMaster;
use App\Models\Kompetensi;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;

use Illuminate\Http\Request;

class AtpMasterController extends Controller
{
    /**
     * spa/tu/guru
     */
    public function index()
    {
        $atp = AtpMaster::with('kompetensi')->get();

        if ($atp->isEmpty()) {
            return ApiResponse::error('Not found', ['Data' => 'Belum ada data ATP']);
        }

        $formatted = $atp->groupBy('status')
        ->map(function ($a) {
            return [
                'status' => $a->first()->status,
                'kompetensi' => $a->groupBy('kompetensi_id')
                ->map(function ($komp) {
                    return [
                        'kompetensi_id' => $komp->first()->kompetensi->id,
                        'judul_kompetensi' => $komp->first()->kompetensi->judul_kompetensi,
                        'fase' => $komp->first()->kompetensi->fase ?? null,
                        'tingkat' => $komp->first()->kompetensi->tingkat ?? null,
                        'atp' => $komp->map (function ($tp) {
                            return [
                                'atp_id' => $tp->id,
                                'urutan' => $tp->urutan,
                                'tujuan_pembelajaran' => $tp->tujuan_pembelajaran,
                            ];
                        })->values(),
                    ];
                })->values(),                
            ];
        })->values();

        return ApiResponse::success($formatted, 'ATP Master berhasil diambil');
    }

    /**
     * spa/tu
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'kompetensi_id' => ['required', 'exists:kompetensi,id'],
            'urutan' => ['required', 'integer', 'min:1'],
            'tujuan_pembelajaran' => ['required', 'string'],
        ], [
            'kompetensi_id.required' => 'Kompetensi wajib diisi',
            'kompetensi_id.exists'   => 'Kompetensi tidak ditemukan',
            'urutan.required'        => 'Urutan wajib diisi',
            'urutan.integer'         => 'Urutan harus berupa angka bulat',
            'urutan.min'             => 'Urutan minimal bernilai 1',
            'tujuan_pembelajaran.required' => 'Tujuan pembelajaran wajib diisi',
            'tujuan_pembelajaran.string'   => 'Tujuan pembelajaran harus berupa teks',
        ]);

        // Cek duplikasi urutan dalam satu kompetensi
        $exists = AtpMaster::where('kompetensi_id', $validated['kompetensi_id'])
            ->where('urutan', $validated['urutan'])
            ->exists();

        if ($exists) {
            return ApiResponse::error(
                'Duplicated',
                ['data' => 'Urutan ATP untuk kompetensi ini sudah digunakan']
            );
        }

        $atpMaster = AtpMaster::create([
            'kompetensi_id'       => $validated['kompetensi_id'],
            'urutan'              => $validated['urutan'],
            'tujuan_pembelajaran' => $validated['tujuan_pembelajaran'],
            'status'              => 'aktif',
        ]);

        $atpMaster->load('kompetensi');

        return ApiResponse::success([
            'id'                  => $atpMaster->id,
            'kompetensi'          => $atpMaster->kompetensi->judul_kompetensi,
            'urutan'              => $atpMaster->urutan,
            'tujuan_pembelajaran' => $atpMaster->tujuan_pembelajaran,
            'status'              => $atpMaster->status,
        ], 'Data ATP Master berhasil dibuat');
    }

    /**
     * spa/tu/guru
     */
    public function show(string $id)
    {
        $atp = AtpMaster::with('kompetensi.kurikulum', 'kompetensi.mataPelajaran')->find($id);

        if (!$atp) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        $formatted = [
            'kurikulum_id' => $atp->kompetensi->kurikulum->id,
            'kurikulum' => $atp->kompetensi->kurikulum->tipe,
            'kompetensi' => [
                'kompetensi_id' => $atp->kompetensi->id,
                'mata_pelajaran' => $atp->kompetensi->mataPelajaran->nama_pelajaran,
                'judul_kompetensi' => $atp->kompetensi->judul_kompetensi,
                'fase' => $atp->kompetensi->fase,
                'status_kompetensi' => $atp->kompetensi->status,
                'deskripsi' => $atp->kompetensi->deskripsi,
                'atp_master' => [
                    'atp_id' => $atp->id,
                    'urutan' => $atp->urutan,
                    'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
                    'status_atp' => $atp->status,
                ],
            ],
        ];

        return ApiResponse::success($formatted, 'Detail ATP Master berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $atpMaster = AtpMaster::find($id);

        if (!$atpMaster) {
            return ApiResponse::error(
                'Not Found',
                ['data' => 'Data ATP Master tidak ditemukan']
            );
        }

        $validated = $request->validate([
            'kompetensi_id' => ['required', 'exists:kompetensi,id'],
            'urutan' => ['required', 'integer', 'min:1'],
            'tujuan_pembelajaran' => ['required', 'string'],
            'status' => ['required', Rule::in(['aktif', 'arsip'])],
        ], [
            'kompetensi_id.required' => 'Kompetensi wajib diisi',
            'kompetensi_id.exists'   => 'Kompetensi tidak ditemukan',
            'urutan.required'        => 'Urutan wajib diisi',
            'urutan.integer'         => 'Urutan harus berupa angka bulat',
            'urutan.min'             => 'Urutan minimal bernilai 1',
            'tujuan_pembelajaran.required' => 'Tujuan pembelajaran wajib diisi',
            'status.required'        => 'Status wajib diisi',
            'status.in'              => 'Status hanya boleh aktif atau arsip',
        ]);

        // Cek duplikasi (kecuali dirinya sendiri)
        $exists = AtpMaster::where('kompetensi_id', $validated['kompetensi_id'])
            ->where('urutan', $validated['urutan'])
            ->where('id', '!=', $atpMaster->id)
            ->exists();

        if ($exists) {
            return ApiResponse::error(
                'Duplicated',
                ['data' => 'Urutan ATP untuk kompetensi ini sudah digunakan']
            );
        }

        $atpMaster->update([
            'kompetensi_id'       => $validated['kompetensi_id'],
            'urutan'              => $validated['urutan'],
            'tujuan_pembelajaran' => $validated['tujuan_pembelajaran'],
            'status'              => $validated['status'], // aktif ↔ arsip
        ]);

        $atpMaster->load('kompetensi');

        return ApiResponse::success([
            'id'                  => $atpMaster->id,
            'kompetensi'          => $atpMaster->kompetensi->judul_kompetensi,
            'urutan'              => $atpMaster->urutan,
            'tujuan_pembelajaran' => $atpMaster->tujuan_pembelajaran,
            'status'              => $atpMaster->status,
        ], 'Data ATP Master berhasil diperbarui');
    }

    /**
     * spa/tu
     */
    public function destroy(string $id)
    {
        $atp = AtpMaster::find($id);

        if (!$atp) {
            return ApiResponse::error('Not found', ['data' => 'Data tidak ditemukan']);
        }

        if ($atp->alurTujuanPembelajarans()->exists()) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['atp' => 'ATP Master telah digunakan oleh guru, update status sebagai solusi'],
                403
            );
        }

        $atp->delete();

        return ApiResponse::success(null, 'ATP Master berhasil dihapus');    
    }

    // spa/tu
    public function dataSelect() {
        $data1 = Kompetensi::with('mataPelajaran', 'kurikulum')->where('status', 'aktif')->get();

        $kompetensi = $data1->groupBy('jenis')
        ->map(function ($komp) {
            return [
                'jenis'             => $komp->first()->jenis,
                'daftar_kompetensi' => $komp->map(function ($k) {
                    return [
                        'kompetensi_id'    => $k->id,
                        'judul_kompetensi' => $k->judul_kompetensi,
                        'mata_pelajaran'   => $k->mataPelajaran->nama_pelajaran,
                        'kurikulum'        => $k->kurikulum->tipe,
                    ];
                })->values(),
            ];
        })->values();

        return ApiResponse::success($kompetensi, 'Data select berhasil diambil');
    }
}
