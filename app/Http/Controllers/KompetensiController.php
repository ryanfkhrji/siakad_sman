<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kompetensi;
use App\Models\Kurikulum;
use App\Models\MataPelajaran;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class KompetensiController extends Controller
{
    /**
     * ✅ spa
     */
    public function index()
    {
        $data = Kompetensi::with(['kurikulum', 'mataPelajaran'])->get();

        if ($data->isEmpty()) {
            return ApiResponse::error(
                'Not found',
                ['data' => 'Belum ada data']
            );
        }

        // ambil tipe dari data pertama (diasumsikan 1 endpoint = 1 tipe)
        $tipeKurikulum = $data->first()->kurikulum->tipe ?? null;

        // =========================
        // KURIKULUM K13
        // =========================
        if ($tipeKurikulum === 'K13') {

            $formatted = $data
                ->groupBy('tingkat')
                ->map(function ($groupByTingkat) {

                    return [
                        'tingkat' => $groupByTingkat->first()->tingkat,

                        'mata_pelajaran' => $groupByTingkat
                            ->groupBy('mata_pelajaran_id')
                            ->map(function ($groupByMapel) {

                                $mapel = $groupByMapel->first()->mataPelajaran;

                                return [
                                    'mata_pelajaran_id' => $mapel->id,
                                    'mata_pelajaran' => $mapel->nama_pelajaran,

                                    'kompetensi' => $groupByMapel
                                        ->map(function ($kompetensi) {
                                            return [
                                                'kompetensi_id' => $kompetensi->id,
                                                'judul_kompetensi' => $kompetensi->judul_kompetensi,
                                                'jenis' => $kompetensi->jenis,
                                                'kode' => $kompetensi->kode,
                                                'aspek' => $kompetensi->aspek,
                                                'deskripsi' => $kompetensi->deskripsi,
                                                'status' => $kompetensi->status,
                                            ];
                                        })
                                        ->values(),
                                ];
                            })
                            ->values(),
                    ];
                })
                ->values();

            return ApiResponse::success(
                $formatted,
                'Kompetensi K13 berhasil diambil'
            );
        }

        // =========================
        // KURIKULUM MERDEKA
        // =========================
        $formatted = $data
            ->groupBy('fase')
            ->map(function ($groupByFase) {

                return [
                    'fase' => $groupByFase->first()->fase,

                    'mata_pelajaran' => $groupByFase
                        ->groupBy('mata_pelajaran_id')
                        ->map(function ($groupByMapel) {

                            $mapel = $groupByMapel->first()->mataPelajaran;

                            return [
                                'mata_pelajaran_id' => $mapel->id,
                                'mata_pelajaran' => $mapel->nama_pelajaran,

                                'kompetensi' => $groupByMapel
                                    ->map(function ($kompetensi) {
                                        return [
                                            'kompetensi_id' => $kompetensi->id,
                                            'judul_kompetensi' => $kompetensi->judul_kompetensi,
                                            'jenis' => $kompetensi->jenis,
                                            'kode' => $kompetensi->kode,
                                            'deskripsi' => $kompetensi->deskripsi,
                                            'status' => $kompetensi->status,
                                        ];
                                    })
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return ApiResponse::success(
            $formatted,
            'Kompetensi Kurikulum Merdeka berhasil diambil'
        );
    }
        

    /**
     * ✅ spa
     */
    public function store(Request $request)
    {
        $kepegawaian = Auth::guard('kepegawaian')->user();

        if (! in_array($kepegawaian->role, ['tu', 'super_admin'])) {
            return ApiResponse::error('Not supported', ['role' => 'Anda tidak memiliki hak']);
        }        

        // Validasi input
        $validated = $request->validate([
            'kurikulum_id' => 'required|exists:kurikulum,id',
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'judul_kompetensi' => 'required|string',
            'jenis' => 'required|in:KD,CP',
            'kode' => 'nullable|string',
            'tingkat' => 'nullable|in:10,11,12',
            'aspek' => 'nullable|in:sikap,pengetahuan,keterampilan',
            'fase' => 'nullable|in:A,B,C,D,E,F',
            'deskripsi' => 'required|string',
        ], [
            'kurikulum_id.required' => 'Kurikulum wajib diisi',
            'kurikulum_id.exists' => 'Kurikulum tidak ditemukan',
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
            'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
            'judul_kompetensi.required' => 'Judul kompetensi wajib diisi',
            'jenis.required' => 'Jenis kompetensi wajib diisi',
            'jenis.in' => 'Jenis kompetensi hanya KD atau CP',
            'tingkat.in' => 'Tingkat hanya boleh 10, 11, atau 12',
            'aspek.in' => 'Aspek hanya boleh sikap, pengetahuan, atau keterampilan',
            'fase.in' => 'Fase hanya boleh A, B, C, D, E, atau F',
            'deskripsi.required' => 'Deskripsi wajib diisi',
        ]);

        // Validasi logika berdasarkan jenis kompetensi
        if ($validated['jenis'] === 'KD') {
            if (empty($validated['tingkat']) || empty($validated['aspek'])) {
                return ApiResponse::error(
                    'Kesalahan',
                    ['data' => 'Untuk KD (K13), tingkat dan aspek wajib diisi'],
                    422
                );
            }
        }

        if ($validated['jenis'] === 'CP') {
            if (empty($validated['fase'])) {
                return ApiResponse::error(
                    'Kesalahan',
                    ['data' => 'Untuk CP (Merdeka), fase wajib diisi'],
                    422
                );
            }
        }

        // Cek duplikasi (sesuai UNIQUE constraint tabel)
        $isDuplicate = Kompetensi::where('kurikulum_id', $validated['kurikulum_id'])
            ->where('mata_pelajaran_id', $validated['mata_pelajaran_id'])
            ->where('jenis', $validated['jenis'])
            ->where('kode', $validated['kode'] ?? null)
            ->where('tingkat', $validated['tingkat'] ?? null)
            ->where('fase', $validated['fase'] ?? null)
            ->exists();

        if ($isDuplicate) {
            return ApiResponse::error(
                'Duplikasi',
                ['unique' => ['Kompetensi dengan kombinasi ini sudah ada']],
                422
            );
        }

        // Simpan data
        $kd = Kompetensi::create([
            'kurikulum_id' => $validated['kurikulum_id'],
            'mata_pelajaran_id' => $validated['mata_pelajaran_id'],
            'judul_kompetensi' => $validated['judul_kompetensi'],
            'jenis' => $validated['jenis'],
            'kode' => $validated['kode'] ?? null,
            'tingkat' => $validated['tingkat'] ?? null,
            'aspek' => $validated['aspek'] ?? null,
            'fase' => $validated['fase'] ?? null,
            'deskripsi' => $validated['deskripsi'],
            'status' => 'aktif',
        ]);

        // Load relasi yang memang ada
        $kd->load('kurikulum', 'mataPelajaran');

        // Response
        return ApiResponse::success([
            'id' => $kd->id,
            'kurikulum' => $kd->kurikulum->nama_kurikulum,
            'mata_pelajaran' => $kd->mataPelajaran->nama_pelajaran,
            'judul_kompetensi' => $kd->judul_kompetensi,
            'jenis' => $kd->jenis,
            'kode' => $kd->kode,
            'tingkat' => $kd->tingkat,
            'aspek' => $kd->aspek,
            'fase' => $kd->fase,
            'deskripsi' => $kd->deskripsi,
            'status' => $kd->status,
        ], 'Data kompetensi berhasil dibuat');
    }


    /**
     * ✅ spa 
     * hanya yang approve saja, yg belum approve ada di menu atp
     */
    public function show(string $id)
    {
        $kd = Kompetensi::where('id', $id)->with('kurikulum', 'atps.guru', 'mataPelajaran', 'atps.tahunAkademik', 'atps.kompetensi')->first();

        if (!$kd) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        if ($kd->jenis == 'KD') {
            $formatted = [
                'id' => $kd->id,
                'kurikulum' => $kd->kurikulum->nama_kurikulum,
                'mata_pelajaran' => $kd->mataPelajaran->nama_pelajaran,
                'judul_kompetensi' => $kd->judul_kompetensi,
                'jenis' => $kd->jenis,
                'kode' => $kd->kode,
                'tingkat' => $kd->tingkat,
                'aspek' => $kd->aspek,
                'status_kompetensi' => $kd->status,
            ];
    
            return ApiResponse::success($formatted, 'Detail kompetensi berhasil diambil');
        } else {
            $formatted = [
                'id' => $kd->id,
                'kurikulum' => $kd->kurikulum->nama_kurikulum,
                'mata_pelajaran' => $kd->mataPelajaran->nama_pelajaran,
                'judul_kompetensi' => $kd->judul_kompetensi,
                'jenis' => $kd->jenis,
                'kode' => $kd->kode,
                'fase' => $kd->fase,
                'deskripsi' => $kd->deskripsi,
                'status_kompetensi' => $kd->status,
        
                'histori_atp' => $kd->atps
                    // ✅ hanya yang disetujui
                    ->where('approval_status', 'disetujui')
        
                    // ✅ urut global
                    ->sortBy([
                        ['tahun_akademik_id', 'asc'],
                        ['semester', 'asc'],
                        ['guru_id', 'asc'],
                        ['urutan', 'asc'],
                    ])
        
                    // ✅ group tahun akademik
                    ->groupBy('tahun_akademik_id')
                    ->map(function ($groupByTahun) {
        
                        $tahun = $groupByTahun->first()->tahunAkademik;
        
                        return [
                            'tahun_akademik_id' => $tahun->id,
                            'tahun_akademik' => $tahun->tahun_akademik,
        
                            // ✅ group semester
                            'semester' => $groupByTahun
                                ->groupBy('semester')
                                ->map(function ($groupBySemester, $semester) {
        
                                    return [
                                        'nama_semester' => $semester,
        
                                        // 🔥 GROUP BY GURU
                                        'guru' => $groupBySemester
                                            ->groupBy('guru_id')
                                            ->map(function ($groupByGuru) {
        
                                                $guru = $groupByGuru->first()->guru;
        
                                                return [
                                                    'guru_id' => $guru->id,
                                                    'nama_guru' => $guru->nama,
        
                                                    // ✅ daftar ATP per guru
                                                    'daftar_atp' => $groupByGuru
                                                        ->sortBy('urutan')
                                                        ->map(function ($atp) {
                                                            return [
                                                                'atp_id' => $atp->id,
                                                                'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
                                                                'urutan' => $atp->urutan,
                                                                'approval_status' => $atp->approval_status,
                                                                'approved_by' => $atp->approved_by,
                                                                'approved_at' => $atp->approved_at,
                                                                'terkunci' => $atp->is_locked,
                                                            ];
                                                        })
                                                        ->values(),
                                                ];
                                            })
                                            ->values(),
                                    ];
                                })
                                ->values(),
                        ];
                    })
                    ->values(),
            ];
        
            return ApiResponse::success($formatted, 'Detail kompetensi berhasil diambil');
        }        
    }

    /**
     * ✅ spa
     */
    public function update(Request $request, string $id)
    {
        // Ambil data kompetensi (kompetensi TIDAK terkait langsung tahun akademik)
        $kd = Kompetensi::with('kurikulum', 'mataPelajaran')->find($id);

        if (! $kd) {
            return ApiResponse::error(
                'Kompetensi tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        // Validasi input
        $validated = $request->validate([
            'kurikulum_id' => 'sometimes|required|exists:kurikulum,id',
            'mata_pelajaran_id' => 'sometimes|required|exists:mata_pelajarans,id',
            'judul_kompetensi' => 'sometimes|required|string',
            'jenis' => 'sometimes|required|in:KD,CP',
            'kode' => 'sometimes|nullable|string',
            'tingkat' => 'sometimes|nullable|in:10,11,12',
            'aspek' => 'sometimes|nullable|in:sikap,pengetahuan,keterampilan',
            'fase' => 'sometimes|nullable|in:A,B,C,D,E,F',
            'deskripsi' => 'sometimes|required|string',
            'status' => 'sometimes|in:aktif,arsip',
        ], [
            'kurikulum_id.required' => 'Kurikulum wajib diisi',
            'kurikulum_id.exists' => 'Kurikulum tidak ditemukan',
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
            'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
            'judul_kompetensi.required' => 'Judul kompetensi wajib diisi',
            'jenis.required' => 'Jenis kompetensi wajib diisi',
            'jenis.in' => 'Jenis kompetensi hanya KD atau CP',
            'tingkat.in' => 'Tingkat hanya boleh 10, 11, atau 12',
            'aspek.in' => 'Aspek hanya boleh sikap, pengetahuan, atau keterampilan',
            'fase.in' => 'Fase hanya boleh A, B, C, D, E, atau F',
            'deskripsi.required' => 'Deskripsi wajib diisi',
            'status.in' => 'Status hanya boleh aktif atau arsip',
        ]);

        // Ambil nilai lama jika field tidak dikirim (karena update partial)
        $kurikulumId      = $validated['kurikulum_id'] ?? $kd->kurikulum_id;
        $mapelId          = $validated['mata_pelajaran_id'] ?? $kd->mata_pelajaran_id;
        $jenis            = $validated['jenis'] ?? $kd->jenis;
        $kode             = $validated['kode'] ?? $kd->kode;
        $tingkat          = $validated['tingkat'] ?? $kd->tingkat;
        $aspek            = $validated['aspek'] ?? $kd->aspek;
        $fase             = $validated['fase'] ?? $kd->fase;

        // Validasi logika berdasarkan jenis kompetensi
        if ($jenis === 'KD') {
            if (empty($tingkat) || empty($aspek)) {
                return ApiResponse::error(
                    'Kesalahan',
                    ['data' => 'Untuk KD (K13), tingkat dan aspek wajib diisi'],
                    422
                );
            }
        }

        if ($jenis === 'CP') {
            if (empty($fase)) {
                return ApiResponse::error(
                    'Kesalahan',
                    ['data' => 'Untuk CP (Merdeka), fase wajib diisi'],
                    422
                );
            }
        }

        // Cek duplikasi (HARUS exclude data sendiri)
        $isDuplicate = Kompetensi::where('kurikulum_id', $kurikulumId)
            ->where('mata_pelajaran_id', $mapelId)
            ->where('jenis', $jenis)
            ->where('kode', $kode)
            ->where('tingkat', $tingkat)
            ->where('fase', $fase)
            ->where('id', '!=', $kd->id)
            ->exists();

        if ($isDuplicate) {
            return ApiResponse::error(
                'Duplikasi',
                ['unique' => ['Kompetensi dengan kombinasi ini sudah ada']],
                422
            );
        }

        // Update data
        $kd->update($validated);

        // Reload relasi
        $kd->load('kurikulum', 'mataPelajaran');

        // Response
        return ApiResponse::success([
            'id' => $kd->id,
            'kurikulum' => $kd->kurikulum->nama_kurikulum,
            'mata_pelajaran' => $kd->mataPelajaran->nama_pelajaran,
            'judul_kompetensi' => $kd->judul_kompetensi,
            'jenis' => $kd->jenis,
            'kode' => $kd->kode,
            'tingkat' => $kd->tingkat,
            'aspek' => $kd->aspek,
            'fase' => $kd->fase,
            'deskripsi' => $kd->deskripsi,
            'status' => $kd->status,
        ], 'Data kompetensi berhasil diperbarui');
    }


    /**
     * ✅ spa
     */
    public function destroy(string $id)
    {
        $kd = Kompetensi::find($id);

        if (!$kd) {
            return ApiResponse::error('Kompetensi tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek apakah sudah dipakai atp
        if ($kelas->atps()->exists()) {
            return ApiResponse::error('Tidak bisa dihapus', [
                'id' => ['Kompetensi sudah digunakan pada Tujuan Pembelajaran atau Alur Tujuan Pembelajaran']
            ], 422);
        }

        $kd->delete();
        return ApiResponse::success(null, 'Kompetensi berhasil dihapus');
    }

    // data select
    public function dataSelectKompetensi() {
        // kurikulum
        $data1 = Kurikulum::select('id', 'nama_kurikulum', 'tipe')->where('status', 'aktif')->first();
        if (!$data1) {
            return ApiResponse::error('Not found', ['data' => null]);
        }
        $kurikulum = [
            'kurikulum_id' => $data1->id,
            'nama_kurikulum' => $data1->nama_kurikulum,
            'tipe' => $data1->tipe,
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
                'kode_mapel_diknas' => $mapel->kode_mapel_diknas,
            ];
        });

        return ApiResponse::success([
            'kurikulum' => $kurikulum,
            'mata_pelajaran' => $mataPelajaran
        ], 'Data select berhasil diambil');
    }
}
