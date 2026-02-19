<?php

namespace App\Http\Controllers;

use App\Helpers\ApiResponse;
use App\Models\Kurikulum;
use App\Models\KurikulumMataPelajaran;
use App\Models\MataPelajaran;
// use App\Models\Jurusan;
// use App\Models\TahunAkademik;
// use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
// use Illuminate\Support\Facades\Validator;

class KurikulumMataPelajaranController extends Controller
{
    /**
     * ✅ SPA
     */
    public function index()
    {
        $kurmap = KurikulumMataPelajaran::with([
                'kurikulum',
                'mataPelajaran',
            ])
            ->orderBy('kurikulum_id')
            ->orderBy('tingkat')
            ->orderByRaw("
                FIELD(status_mata_pelajaran,
                    'wajib',
                    'pilihan',
                    'jurusan',
                    'mulok'
                )
            ")
            ->get();

        if ($kurmap->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                ['data' => 'Data tidak ditemukan'],
                404
            );
        }

        $data = $kurmap
            ->groupBy('kurikulum_id')
            ->map(function ($items) {

                $kurikulum = $items->first()->kurikulum;

                return [
                    'kurikulum_id'     => $kurikulum->id,
                    'kurikulum'        => $kurikulum->nama_kurikulum,
                    'tipe'             => $kurikulum->tipe,
                    'status_kurikulum' => $kurikulum->status,
                    'tingkat' => $items
                        ->groupBy('tingkat')
                        ->map(function ($perTingkat) {

                            return [
                                'tingkat' => $perTingkat->first()->tingkat,
                                'mata_pelajaran' => $perTingkat->map(function ($mapel) {
                                    return [
                                        'kurikulum_mata_pelajaran_id' => $mapel->id,
                                        'mata_pelajaran_id' => $mapel->mataPelajaran->id,
                                        'nama_pelajaran'    => $mapel->mataPelajaran->nama_pelajaran,
                                        'kode_mapel_diknas' => $mapel->mataPelajaran->kode_mapel_diknas,
                                        'nilai_kkm'         => $mapel->nilai_kkm,
                                        'kelompok'          => $mapel->mataPelajaran->kelompok ?? null,
                                        'status_mapel'      => $mapel->status_mata_pelajaran,
                                        'status_aktif'      => $mapel->mataPelajaran->status,
                                    ];
                                })->values(),
                            ];
                        })->values(),
                ];
            })->values();

        return ApiResponse::success(
            $data,
            'Daftar kurikulum mata pelajaran berhasil diambil'
        );
    }



    /**
     * ✅ SPA
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'kurikulum_id' => 'required|exists:kurikulum,id',
                'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',                 
                'tingkat' => 'required|numeric',                 
                'nilai_kkm' => 'required|numeric',                 
                'status_mata_pelajaran' => 'required|in:wajib,pilihan,jurusan',                 
            ],[
                'kurikulum_id.required' => 'Kurikulum wajib diisi',
                'kurikulum_id.exists' => 'Kurikulum tidak ditemukan',                
                'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
                'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',                
                'tingkat.required' => 'Tingkat wajib diisi',
                'tingkat.numeric' => 'Tingkat hanya boleh berisi angka',
                'nilai_kkm.required' => 'Nilai kkm wajib diisi',
                'nilai_kkm.numeric' => 'Nilai kkm hanya boleh berisi angka',
                'status_mata_pelajaran.required' => 'Status mata pelajaran wajib diisi',
                'status_mata_pelajaran.in' => 'Pilihan status mata pelajaran hanya wajib, pilihan, atau jurusan',
            ]);
            
            // ketika 4 hal ini sudah ada di db, maka tidak boleh
            $unik = KurikulumMataPelajaran::where('kurikulum_id', $validated['kurikulum_id'])
                ->where('mata_pelajaran_id', $validated['mata_pelajaran_id'])
                ->where('tingkat', $validated['tingkat'])
                ->exists();

            if ($unik) {
                return ApiResponse::error('Duplikasi', ['pesan' => 'Data yang sama sudah ada di database']);
            }                                

            $kurmap = KurikulumMataPelajaran::create([
                'kurikulum_id' => $validated['kurikulum_id'],
                'mata_pelajaran_id' => $validated['mata_pelajaran_id'],
                'tingkat' => $validated['tingkat'],
                'nilai_kkm' => $validated['nilai_kkm'],
                'status_mata_pelajaran' => $validated['status_mata_pelajaran'],
                'status' => 'aktif'
            ]);

            $kurmap->load('kurikulum', 'mataPelajaran');

            return ApiResponse::success([
                'kurikulum_mata_pelajaran_id' => $kurmap->id ?? null,
                'kurikulum' => $kurmap->kurikulum->nama_kurikulum ?? null,
                'mata_pelajaran' => $kurmap->mataPelajaran->nama_pelajaran ?? null,
                'tingkat' => $kurmap->tingkat ?? null,
                'nilai_kkm' => $kurmap->nilai_kkm ?? null,
                'status_mata_pelajaran' => $kurmap->status_mata_pelajaran ?? null,                
                'status_aktif' => $kurmap->status ?? null,                
            ], 'Data kurikulum mata pelajaran berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ SPA
    public function show(string $id)
    {
        $kurmap = KurikulumMataPelajaran::with('kurikulum', 'mataPelajaran')->find($id);

        if (!$kurmap) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        $formatted = [
            'kurikulum_mata_pelajaran_id' => $kurmap->id ?? null,
            'kurikulum' => [
                'kurikulum_id'   => $kurmap->kurikulum->id ?? null,                
                'nama_kurikulum' => $kurmap->kurikulum->nama_kurikulum ?? null,                
                'tipe_kurikulum' => $kurmap->kurikulum->tipe ?? null,                
            ],
            'mata_pelajaran' => [
                'mata_pelajaran_id'     => $kurmap->mataPelajaran->id ?? null,
                'nama_pelajaran'        => $kurmap->mataPelajaran->nama_pelajaran ?? null,
                'kelompok'              => $kurmap->mataPelajaran->kelompok ?? null,
                'status_aktif_mapel'    => $kurmap->mataPelajaran->status ?? null,
            ],
            'tingkat'               => $kurmap->tingkat ?? null,
            'nilai_kkm'             => $kurmap->nilai_kkm ?? null,
            'status_mata_pelajaran' => $kurmap->status_mata_pelajaran ?? null,
            'status_aktif_kurmap'   => $kurmap->status ?? null,
        ];

        return ApiResponse::success($formatted, 'Detail kurikulum mata pelajaran berhasil diambil');    
    }

    /**
     * ✅ SPA
     */
    public function update(Request $request, string $id)
    {
        $kurmap = KurikulumMataPelajaran::find($id);

        if (!$kurmap) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'kurikulum_id'          => 'sometimes|required|exists:kurikulum,id',
            'mata_pelajaran_id'     => 'sometimes|required|exists:mata_pelajarans,id',
            'tingkat'               => 'sometimes|required|numeric',
            'nilai_kkm'             => 'sometimes|required|numeric',
            'status_mata_pelajaran' => 'sometimes|required|in:wajib,pilihan,jurusan,mulok',
            'status'                => 'sometimes|required|in:aktif,arsip',
        ], [
            'kurikulum_id.required' => 'Kurikulum wajib diisi',
            'kurikulum_id.exists'   => 'Kurikulum tidak ditemukan',
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
            'mata_pelajaran_id.exists'   => 'Mata pelajaran tidak ditemukan',
            'tingkat.required'      => 'Tingkat wajib diisi',
            'tingkat.numeric'       => 'Tingkat wajib berisi angka',
            'nilai_kkm.required'    => 'Nilai kkm wajib diisi',
            'nilai_kkm.numeric'     => 'Nilai kkm wajib berisi angka',
            'status_mata_pelajaran.required'  => 'Status mata pelajaran wajib diisi',
            'status_mata_pelajaran.in'        => 'Pilihan status mata pelajaran hanya wajib, pilihan, jurusan, dan mulok',
            'status.required'       => 'Status aktif wajib diisi',
            'status.in'             => 'Pilihan status aktif hanya aktif dan arsip',
        ]);

        /**
         * ==================================================
         * ATURAN STATUS ARSIP
         * ==================================================
         */
        // ATURAN STATUS ARSIP (FINAL)
        // if (
        //     $kurmap->status === 'arsip' &&
        //     $request->has('status') &&
        //     $request->status !== 'arsip'
        // ) {
        //     return ApiResponse::error(
        //         'Not supported',
        //         ['status' => 'Status arsip tidak boleh diubah']
        //     );
        // }


        /**
         * ==================================================
         * CEK DUPLIKASI (KOMPOSIT UNIQUE)
         * ==================================================
         */
        if (
            isset($validated['kurikulum_id']) ||
            isset($validated['mata_pelajaran_id']) ||
            isset($validated['tingkat'])
        ) {
            $exists = KurikulumMataPelajaran::where('kurikulum_id', $validated['kurikulum_id'] ?? $kurmap->kurikulum_id)
                ->where('mata_pelajaran_id', $validated['mata_pelajaran_id'] ?? $kurmap->mata_pelajaran_id)
                ->where('tingkat', $validated['tingkat'] ?? $kurmap->tingkat)
                ->where('id', '!=', $kurmap->id)
                ->exists();

            if ($exists) {
                return ApiResponse::error(
                    'Duplikasi',
                    ['pesan' => 'Kurikulum, mata pelajaran, dan tingkat sudah ada']
                );
            }
        }

        /**
         * ==================================================
         * UPDATE (PARTIAL UPDATE AMAN)
         * ==================================================
         */
        $kurmap->update($validated);

        $kurmap->load('kurikulum', 'mataPelajaran');

        return ApiResponse::success([
            'kurikulum_mata_pelajaran_id' => $kurmap->id,
            'kurikulum'                  => $kurmap->kurikulum->nama_kurikulum ?? null,
            'mata_pelajaran'             => $kurmap->mataPelajaran->nama_pelajaran ?? null,
            'tingkat'                    => $kurmap->tingkat,
            'nilai_kkm'                  => $kurmap->nilai_kkm,
            'status_mata_pelajaran'      => $kurmap->status_mata_pelajaran,
            'status'                     => $kurmap->status,
        ], 'Data kurikulum mata pelajaran berhasil diperbarui');
    }


    /**
     * ✅ SPA
     */
    public function destroy(string $id)
    {
        $kurmap = KurikulumMataPelajaran::find($id);

        if (!$kurmap) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        if ($kurmap->status == 'arsip') {
            return ApiResponse::success('Tidak bisa dihapus', ['Arsip' => 'Data sudah berstatus arsip']);
        }
        
        if ($kurmap->jadwalPelajarans()->exists()) {        
            return ApiResponse::success('Tidak bisa dihapus', ['Jadwal' => 'Data sudah digunakan sebagai acuan jadwal pelajaran']);
        }

        $kurmap->delete();

        return ApiResponse::success(null, 'Data berhasil dihapus');
    }


    public function dataSelectKurmap() {
        // kurikulum
        $data = Kurikulum::select('id', 'nama_kurikulum', 'tipe', 'status')->get();

        if ($data->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Belum ada data kurikulum']);
        }

        $kurikulum = $data->map(function ($k) {
            return [
                'kurikulum_id' => $k->id,
                'nama_kurikulum' => $k->nama_kurikulum,
                'tipe_kurikulum' => $k->tipe,
                'status_kurikulum' => $k->status
            ];
        })->values();
    

        // mata pelajaran
        $data2 = MataPelajaran::select('id', 'nama_pelajaran', 'kelompok', 'status')        
        ->where('status', 'aktif')
        ->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $mataPelajaran = $data2->groupBy('kelompok')
        ->map(function ($items, $kelompok) {
            return [
                'kelompok' => $kelompok,
                'mata_pelajaran' => $items->map(function ($mapel) {
                    return [
                        'mata_pelajaran_id' => $mapel->id,
                        'nama_pelajaran'    => $mapel->nama_pelajaran,
                        'status'            => $mapel->status,
                    ];
                })->values()
            ];
        })->values();
     
        return ApiResponse::success([
            'kurikulum' => $kurikulum,
            'mata_pelajaran' => $mataPelajaran,
        ], 'Data select berhasil diambil');
    }
}
