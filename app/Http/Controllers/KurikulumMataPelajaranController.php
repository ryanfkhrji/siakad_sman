<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KurikulumMataPelajaran;
use App\Models\Kurikulum;
use App\Models\MataPelajaran;
use App\Models\Jurusan;
use App\Models\TahunAkademik;
use Illuminate\Validation\Rule;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;

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
                'jurusan',
                'tahunAkademik',
            ])->get();

        if ($kurmap->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                ['data' => 'Data tidak ditemukan'],
                404
            );
        }

        $data = $kurmap
            ->groupBy('tahun_akademik_id')
            ->map(function ($group) {

                $tahun = $group->first()->tahunAkademik;

                return [
                    'tahun_akademik_id' => $tahun?->id,
                    'nama_tahun_akademik' => $tahun?->tahun_akademik,
                    'status_tahun_akademik' => $tahun?->status,

                    'daftar_mata_pelajaran' => $group->map(function ($item) {
                        return [
                            'kurikulum_mata_pelajaran_id' => $item->id,

                            'kurikulum' => [
                                'id' => $item->kurikulum?->id,
                                'nama' => $item->kurikulum?->nama_kurikulum,
                            ],

                            'mata_pelajaran' => [
                                'id' => $item->mataPelajaran?->id,
                                'nama' => $item->mataPelajaran?->nama_pelajaran,
                            ],

                            'jurusan' => [
                                'id' => $item->jurusan?->id,
                                'nama' => $item->jurusan?->nama_jurusan,
                            ],

                            'tingkat' => $item->tingkat,
                            'nilai_kkm' => $item->nilai_kkm,
                            'status_mata_pelajaran' => $item->status_mata_pelajaran,
                        ];
                    })->values(),
                ];
            })
            ->values();

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
                'jurusan_pelajaran_id' => 'nullable|exists:jurusans,id',                 
                // 'tahun_akademik_id' => 'nullable|exists:tahun_akademik,id',                 
                'tingkat' => 'required|numeric',                 
                'nilai_kkm' => 'required|numeric',                 
                'status_mata_pelajaran' => 'required|in:wajib,pilihan,jurusan',                 
            ],[
                'kurikulum_id.required' => 'Kurikulum wajib diisi',
                'kurikulum_id.exists' => 'Kurikulum tidak ditemukan',                
                'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
                'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',                
                'jurusan_pelajaran_id.exists' => 'Jurusan tidak ditemukan',                
                // 'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',                
                'tingkat.required' => 'Tingkat wajib diisi',
                'tingkat.numeric' => 'Tingkat hanya boleh berisi angka',
                'nilai_kkm.required' => 'Nilai kkm wajib diisi',
                'nilai_kkm.numeric' => 'Nilai kkm hanya boleh berisi angka',
                'status_mata_pelajaran.required' => 'Status mata pelajaran wajib diisi',
                'status_mata_pelajaran.in' => 'Pilihan status mata pelajaran hanya wajib, pilihan, atau jurusan',
            ]);
            
            $tahunAkademik = TahunAkademik::where('status', 'aktif')->first();

            if (!$tahunAkademik) {
                return ApiResponse::error('Not supported', ['data' => 'Belum ada tahun akademik yang aktif']);
            }

            // ketika 4 hal ini sudah ada di db, maka tidak boleh
            $unik = KurikulumMataPelajaran::where('kurikulum_id', $validated['kurikulum_id'])
                ->where('mata_pelajaran_id', $validated['mata_pelajaran_id'])
                ->where('jurusan_pelajaran_id', $validated['jurusan_pelajaran_id'])
                ->where('tingkat', $validated['tingkat'])
                ->where('tahun_akademik_id', $tahunAkademik->id)
                ->exists();

            if ($unik) {
                return ApiResponse::error('Duplikasi', ['pesan' => 'Data yang sama sudah ada di database']);
            }

            // jika kurikulum->tipe = MERDEKA, maka jurusan_pelajaran_id wajib null
            $kurikulum = Kurikulum::where('id', $validated['kurikulum_id'])->first();
            if ($kurikulum->tipe === 'MERDEKA') {
                $request->merge([
                    'jurusan_pelajaran_id' => null,
                ]);
            }
            
            // jika kurikulum->tipe = K13 maka jurusan_pelajaran_id wajib ada
            if ($kurikulum->tipe === 'K13' && !$request->jurusan_pelajaran_id) {
                throw ValidationException::withMessages([
                    'jurusan_pelajaran_id' => 'Jurusan wajib untuk Kurikulum 2013'
                ]);
            }                    

            $kurmap = KurikulumMataPelajaran::create([
                'kurikulum_id' => $validated['kurikulum_id'],
                'mata_pelajaran_id' => $validated['mata_pelajaran_id'],
                'jurusan_pelajaran_id' => $validated['jurusan_pelajaran_id'],
                'tahun_akademik_id' => $tahunAkademik->id,
                'tingkat' => $validated['tingkat'],
                'nilai_kkm' => $validated['nilai_kkm'],
                'status_mata_pelajaran' => $validated['status_mata_pelajaran'],                
            ]);

            $kurmap->load('kurikulum', 'mataPelajaran', 'jurusan', 'tahunAkademik', 'dataNilaiSiswa');

            return ApiResponse::success([
                'kurikulum_mata_pelajaran_id' => $kurmap->id ?? null,

                'kurikulum_id' => $kurmap->kurikulum->id ?? null,                
                'nama_kurikulum' => $kurmap->kurikulum->nama_kurikulum ?? null,                

                'mata_pelajaran_id' => $kurmap->mataPelajaran->id ?? null,
                'nama_mata_pelajaran' => $kurmap->mataPelajaran->nama_pelajaran ?? null,

                'jurusan_pelajaran_id' => $kurmap->jurusan->id ?? null,
                'nama_jurusan' => $kurmap->jurusan->nama_jurusan ?? null,

                'tahun_akademik_id' => $kurmap->tahunAkademik->id ?? null,
                'nama_tahun_akademik' => $kurmap->tahunAkademik->tahun_akademik ?? null,

                'tingkat' => $kurmap->tingkat ?? null,
                'nilai_kkm' => $kurmap->nilai_kkm ?? null,
                'status_mata_pelajaran' => $kurmap->status_mata_pelajaran ?? null,                
            ], 'Data kurikulum mata pelajaran berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ SPA
    public function show(string $id)
    {
        $kurmap = KurikulumMataPelajaran::with('kurikulum', 'mataPelajaran', 'jurusan', 'tahunAkademik')->find($id);

        if (!$kurmap) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        $formatted = [
            'kurikulum_mata_pelajaran_id' => $kurmap->id ?? null,

            'kurikulum_id' => $kurmap->kurikulum->id ?? null,                
            'nama_kurikulum' => $kurmap->kurikulum->nama_kurikulum ?? null,                

            'mata_pelajaran_id' => $kurmap->mataPelajaran->id ?? null,
            'nama_mata_pelajaran' => $kurmap->mataPelajaran->nama_pelajaran ?? null,

            'jurusan_pelajaran_id' => $kurmap->jurusan->id ?? null,
            'nama_jurusan' => $kurmap->jurusan->nama_jurusan ?? null,

            'tahun_akademik_id' => $kurmap->tahunAkademik->id ?? null,
            'nama_tahun_akademik' => $kurmap->tahunAkademik->tahun_akademik ?? null,
            'status_tahun_akademik' => $kurmap->tahunAkademik->status ?? null,            

            'tingkat' => $kurmap->tingkat ?? null,
            'nilai_kkm' => $kurmap->nilai_kkm ?? null,
            'status_mata_pelajaran' => $kurmap->status_mata_pelajaran ?? null,            
        ];

        return ApiResponse::success($formatted, 'Detail kurikulum mata pelajaran berhasil diambil');    
    }

    /**
     * ✅ SPA
     */
    public function update(Request $request, string $id)
    {
        $kurmap = KurikulumMataPelajaran::with('tahunAkademik')->find($id);

        if (!$kurmap) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }
        
        if ($kurmap->tahunAkademik->status == 'arsip') {        
            return ApiResponse::error('Not supported', ['data', 'Tahun akademik sudah menjadi arsip']);
        }

        $validated = $request->validate([
            'kurikulum_id' => 'sometimes|required|exists:kurikulum,id',            
            'mata_pelajaran_id' => 'sometimes|required|exists:mata_pelajarans,id',            
            'jurusan_pelajaran_id' => 'sometimes|nullable|exists:jurusans,id',            
            // 'tahun_akademik_id' => 'sometimes|nullable|exists:tahun_akademik,id',            
            'tingkat' => 'sometimes|required|numeric',            
            'nilai_kkm' => 'sometimes|required|numeric',            
            'status_mata_pelajaran' => 'sometimes|required|in:wajib,pilihan,jurusan',                        
        ], [
            'kurikulum_id.required' => 'Kurikulum wajib diisi',
            'kurikulum_id.exists' => 'Kurikulum tidak ditemukan',                
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
            'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',                
            'jurusan_pelajaran_id.exists' => 'Jurusan tidak ditemukan',                
            // 'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',                
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
         ->where('jurusan_pelajaran_id', $validated['jurusan_pelajaran_id'])
         ->where('tingkat', $validated['tingkat'])
         ->where('tahun_akademik_id', $kurmap->tahun_akademik_id)
         ->exists();

        if ($unik) {
            return ApiResponse::error('Duplikasi', ['pesan' => 'Data yang sama sudah ada di database']);
        }

        // jika kurikulum->tipe = MERDEKA, maka jurusan_pelajaran_id wajib null
        $kurikulum = Kurikulum::where('id', $validated['kurikulum_id'])->first();
        if ($kurikulum->tipe === 'MERDEKA') {
            $request->merge([
                'jurusan_pelajaran_id' => null,
            ]);
        }
        
        // jika kurikulum->tipe = K13 maka jurusan_pelajaran_id wajib ada
        if ($kurikulum->tipe === 'K13' && !$request->jurusan_pelajaran_id) {
            throw ValidationException::withMessages([
                'jurusan_pelajaran_id' => 'Jurusan wajib untuk Kurikulum 2013'
            ]);
        }       

        $kurmap->update([
            'kurikulum_id' => $validated['kurikulum_id'],
            'mata_pelajaran_id' => $validated['mata_pelajaran_id'],
            'jurusan_pelajaran_id' => $validated['jurusan_pelajaran_id'],
            'tahun_akademik_id' => $kurmap->tahun_akademik_id, // ga berubah
            'tingkat' => $validated['tingkat'],
            'nilai_kkm' => $validated['nilai_kkm'],
            'status_mata_pelajaran' => $validated['status_mata_pelajaran'],    
        ]);

        $kurmap->load('kurikulum', 'mataPelajaran', 'jurusan', 'tahunAkademik');    

        return ApiResponse::success([
            'kurikulum_mata_pelajaran_id' => $kurmap->id ?? null,

            'kurikulum_id' => $kurmap->kurikulum->id ?? null,                
            'nama_kurikulum' => $kurmap->kurikulum->nama_kurikulum ?? null,                

            'mata_pelajaran_id' => $kurmap->mataPelajaran->id ?? null,
            'nama_mata_pelajaran' => $kurmap->mataPelajaran->nama_pelajaran ?? null,

            'jurusan_pelajaran_id' => $kurmap->jurusan->id ?? null,
            'nama_jurusan' => $kurmap->jurusan->nama_jurusan ?? null,

            'tahun_akademik_id' => $kurmap->tahunAkademik->id ?? null,
            'nama_tahun_akademik' => $kurmap->tahunAkademik->tahun_akademik ?? null,
            'status_tahun_akademik' => $kurmap->tahunAkademik->status ?? null,            

            'tingkat' => $kurmap->tingkat ?? null,
            'nilai_kkm' => $kurmap->nilai_kkm ?? null,
            'status_mata_pelajaran' => $kurmap->status_mata_pelajaran ?? null,            
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

        $tahunAkademik = TahunAkademik::where('id', $kurmap->tahun_akademik_id)->first();

        if ($tahunAkademik->status == 'arsip') {
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
        $data = Kurikulum::select('id', 'nama_kurikulum', 'tipe')->where('status', 'aktif')->first();

        if (!$data) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $kurikulum = [
            'kurikulum_id' => $data->id,
            'nama_kurikulum' => $data->nama_kurikulum,
            'tipe_kurikulum' => $data->tipe,
        ];


        // mata pelajaran
        $data2 = MataPelajaran::select('id', 'nama_pelajaran', 'kode_mapel_diknas')
        ->where('status', 'aktif')
        ->get();

        if ($data2->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $mataPelajaran = $data2->map(function ($mapel) {
            return [
                'mata_pelajaran_id' => $mapel->id,
                'nama_pelajaran' => $mapel->nama_pelajaran,
                'kode_mapel_diknas' => $mapel->kode_mapel_diknas
            ];
        });


        // jurusan
        $data3 = Jurusan::select('id', 'nama_jurusan', 'kode_jurusan')
        ->where('status', 'aktif')
        ->get();

        if ($data3->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $jurusanPelajaran = $data3->map(function ($j) {
            return [
                'jurusan_pelajaran_id' => $j->id,
                'nama_jurusan' => $j->nama_jurusan,
                'kode_jurusan' => $j->kode_jurusan
            ];
        });


        // tahun akademik
        $data4 = TahunAkademik::select('id', 'tahun_akademik', 'status')->where('status', 'aktif')->first();

        if (!$data4) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $tahunAkademik = [
            'tahun_akademik_id' => $data4->id,
            'tahun_akademik' => $data4->tahun_akademik,
            'status_tahun_akademik' => $data4->status,
        ];


        return ApiResponse::success([
            'kurikulum' => $kurikulum,
            'mata_pelajaran' => $mataPelajaran,
            'jurusan_pelajaran' => $jurusanPelajaran ?? null,
            'tahun_akademik' => $tahunAkademik,
        ], 'Data select berhasil diambil');
    }
}
