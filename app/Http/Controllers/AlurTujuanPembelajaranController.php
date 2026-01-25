<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ApiResponse;
use App\Models\AlurTujuanPembelajaran;
use App\Models\Kompetensi;
use App\Models\TahunAkademik;
use App\Models\Kepegawaian;
use App\Models\Semester;
use Illuminate\Support\Facades\DB;

// di hal 143
class AlurTujuanPembelajaranController extends Controller
{
    /**    
        * ✅ index (spa), hanya bisa melihat yang status = diajukan
        * yang sudah disetujui masuk ke show kompetensi        
    */
    public function index()
    {
        $atps = AlurTujuanPembelajaran::with([
            'kompetensi.mataPelajaran',
            'tahunAkademik',
            'semesterRelasi',
            'approved',
            'guru'
        ])
        ->where('approval_status', 'diajukan')
        ->get();

        if ($atps->isEmpty()) {
            return ApiResponse::error('No data', ['data' => null]);
        }

        $formatted = $atps
            ->groupBy('kompetensi_id')
            ->map(function ($groupByKompetensi) {

                $kompetensi = $groupByKompetensi->first()->kompetensi;

                return [
                    'kompetensi_id' => $kompetensi->id,
                    'mata_pelajaran' => $kompetensi->mataPelajaran->nama_pelajaran,
                    'judul_kompetensi' => $kompetensi->judul_kompetensi,
                    'jenis_kompetensi' => $kompetensi->jenis,
                    'fase' => $kompetensi->fase,
                    'status_kompetensi' => $kompetensi->status,

                    'periode' => $groupByKompetensi
                        ->groupBy('tahun_akademik_id')
                        ->map(function ($groupByTahun) {

                            $tahun = $groupByTahun->first()->tahunAkademik;

                            return [
                                'tahun_akademik_id' => $tahun->id,
                                'tahun_akademik' => $tahun->tahun_akademik,
                                'status_tahun_akademik' => $tahun->status,

                                'semesters' => $groupByTahun
                                    ->groupBy('semester_id')
                                    ->map(function ($groupBySemester) {

                                        $semester = $groupBySemester->first()->semesterRelasi;

                                        if (!$semester) {
                                            return null;
                                        }

                                        return [
                                            'semester_id' => $semester->id,
                                            'semester' => $semester->semester,

                                            'guru' => $groupBySemester
                                                ->groupBy('guru_id')
                                                ->map(function ($groupByGuru) {

                                                    $guru = $groupByGuru->first()->guru;

                                                    return [
                                                        'guru_id' => $guru->id,
                                                        'nama_guru' => $guru->nama,

                                                        'histori_atp' => $groupByGuru
                                                            ->sortBy('urutan')
                                                            ->values()
                                                            ->map(function ($atp) {
                                                                return [
                                                                    'atp_id' => $atp->id,
                                                                    'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
                                                                    'urutan' => $atp->urutan,
                                                                    'approval_status' => $atp->approval_status,
                                                                    'approved_by' => $atp->approved_by,
                                                                    'approved_at' => $atp->approved_at,
                                                                    'catatan_penolakan' => $atp->catatan_penolakan,
                                                                    'is_locked' => $atp->is_locked,
                                                                ];
                                                            }),
                                                    ];
                                                })
                                                ->values(),
                                        ];
                                    })
                                    ->filter()
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return ApiResponse::success($formatted, 'Data ATP (diajukan) berhasil diambil');
    }


    // ✅ get all atp sendiri (guru)    
    public function getAllAtpSendiri()
    {
        $user = Auth::guard('kepegawaian')->user();

        $atps = AlurTujuanPembelajaran::with([
            'kompetensi.mataPelajaran',
            'tahunAkademik',
            'semesterRelasi'
        ])
        ->where('guru_id', $user->id)
        ->whereHas('semester', function ($q) {
            $q->where('status', 'aktif');
        })
        ->get();

        if ($atps->isEmpty()) {
            return ApiResponse::error('No data', ['data' => null]);
        }

        $formatted = $atps
            ->groupBy('kompetensi_id')
            ->map(function ($groupByKompetensi) {

                $kompetensi = $groupByKompetensi->first()->kompetensi;

                return [
                    'kompetensi_id' => $kompetensi->id,
                    'mata_pelajaran' => $kompetensi->mataPelajaran->nama_pelajaran,
                    'judul_kompetensi' => $kompetensi->judul_kompetensi,
                    'jenis_kompetensi' => $kompetensi->jenis,
                    'fase' => $kompetensi->fase,
                    'status_kompetensi' => $kompetensi->status,

                    'periode' => $groupByKompetensi
                        ->groupBy('tahun_akademik_id')
                        ->map(function ($groupByTahun) {

                            $tahun = $groupByTahun->first()->tahunAkademik;

                            return [
                                'tahun_akademik_id' => $tahun->id,
                                'tahun_akademik' => $tahun->tahun_akademik,
                                'status_tahun_akademik' => $tahun->status,

                                'semesters' => $groupByTahun
                                    ->groupBy('semester_id')
                                    ->map(function ($groupBySemester) {

                                        $semester = $groupBySemester->first()->semester;

                                        return [
                                            'semester_id' => $semester->id,
                                            'semester' => $semester->semester,

                                            'histori_atp' => $groupBySemester
                                                ->sortBy('urutan')
                                                ->values()
                                                ->map(function ($atp) {
                                                    return [
                                                        'atp_id' => $atp->id,
                                                        'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
                                                        'urutan' => $atp->urutan,
                                                        'approval_status' => $atp->approval_status,
                                                        'approved_by' => $atp->approved_by,
                                                        'approved_at' => $atp->approved_at,
                                                        'catatan_penolakan' => $atp->catatan_penolakan,
                                                        'is_locked' => $atp->is_locked,
                                                    ];
                                                }),
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
            'Data ATP milik guru (semester aktif) berhasil diambil'
        );
    }


    /**
     * ✅ guru
     * 
     * Guru tidak bisa:
     * bikin ATP untuk K13
     * bikin ATP di tahun arsip
     * loncat urutan sembarangan
     * edit ATP yang sudah dikunci
     * set approve sendiri
     * 
     * Guru bisa:
     * create saat status = draft
     * clone dari tahun lalu
     */
    public function store(Request $request)
    {
        $user = Auth::guard('kepegawaian')->user();

        // 1. Validasi dasar input
        $validated = $request->validate([
            'kompetensi_id' => 'required|exists:kompetensi,id',            
            'tujuan_pembelajaran' => 'required|string',
            'urutan' => 'required|integer|min:1',
        ], [
            'kompetensi_id.required' => 'Kompetensi wajib diisi',
            'kompetensi_id.exists' => 'Kompetensi tidak ditemukan',            
            'tujuan_pembelajaran.required' => 'Tujuan pembelajaran wajib diisi',
            'urutan.required' => 'Urutan ATP wajib diisi',
        ]);        

        // 2. Ambil kompetensi & pastikan CP (MERDEKA)
        $kompetensi = Kompetensi::find($validated['kompetensi_id']);

        if (! $kompetensi) {
            return ApiResponse::error(
                'Kompetensi tidak ditemukan',
                ['kompetensi_id' => 'Data tidak ditemukan'],
                404
            );
        }

        if ($kompetensi->jenis !== 'CP') {
            return ApiResponse::error(
                'Tidak valid',
                ['kompetensi' => 'ATP hanya boleh dibuat untuk Kurikulum Merdeka (CP)'],
                422
            );
        }

        // 3. Pastikan tahun akademik dan semester AKTIF        
        $tahunAkademik = TahunAkademik::where('status', 'aktif')->first();

        if (!$tahunAkademik) {
            return ApiResponse::error('Not supported', ['data' => 'Belum ada tahun akademik yang aktif']);
        }
        
        $semester = Semester::where('status', 'aktif')->first();

        if (!$semester) {
            return ApiResponse::error('Not supported', ['data' => 'Belum ada semester yang aktif']);
        }

        // 4. Cegah input jika ATP sudah disetujui & dikunci
        // $locked = AlurTujuanPembelajaran::where('kompetensi_id', $validated['kompetensi_id'])
        //     ->where('tahun_akademik_id', $tahunAkademik->id)
        //     ->where('semester', $semester->id)
        //     ->where('is_locked', true)
        //     ->exists();

        // if ($locked) {
        //     return ApiResponse::error(
        //         'Dikunci',
        //         ['atp' => 'ATP untuk semester ini sudah disetujui dan dikunci'],
        //         403
        //     );
        // }

        // 5. Cegah duplikasi urutan
        $duplicateUrutan = AlurTujuanPembelajaran::where('kompetensi_id', $validated['kompetensi_id'])
            ->where('tahun_akademik_id', $tahunAkademik->id)
            ->where('semester', $semester->id)
            ->where('urutan', $validated['urutan'])
            ->exists();

        if ($duplicateUrutan) {
            return ApiResponse::error(
                'Duplikasi',
                ['urutan' => 'Urutan ATP sudah digunakan pada semester ini'],
                422
            );
        }

        // 6. Cegah duplikasi
        $duplicateUrutan = AlurTujuanPembelajaran::where('kompetensi_id', $validated['kompetensi_id'])
            ->where('tahun_akademik_id', $tahunAkademik->id)
            ->where('semester', $semester->id)
            ->where('urutan', $validated['urutan'])
            ->where('guru_id', $validated['guru_id'])
            ->exists();

        if ($duplicateUrutan) {
            return ApiResponse::error(
                'Duplikasi',
                ['urutan' => 'ATP sudah ada'],
                422
            );
        }

        // 7. Simpan ATP (SELALU DRAFT)
        $atp = AlurTujuanPembelajaran::create([
            'kompetensi_id' => $validated['kompetensi_id'],
            'tahun_akademik_id' => $tahunAkademik->id,
            'guru_id' => $user->id,
            'semester_id' => $semester->id,
            'tujuan_pembelajaran' => $validated['tujuan_pembelajaran'],
            'urutan' => $validated['urutan'],
            'approval_status' => 'draft',
            'is_locked' => false,
        ]);

        $atp->load('tahunAkademik', 'semesterRelasi', 'guru');

        return ApiResponse::success([
            'atp_id' => $atp->id,
            'kompetensi_id' => $atp->kompetensi_id,
            'tahun_akademik' => $atp->tahunAkademik->tahun_akademik,
            'guru' => $atp->guru->nama,
            'semester' => $atp->semester->semester,
            'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
            'urutan' => $atp->urutan,
            'approval_status' => $atp->approval_status,
            'is_locked' => $atp->is_locked,
        ], 'ATP berhasil dibuat (status: draft)');
    }

    // ✅ guru    
    public function cloneFromPreviousYear(Request $request)
    {
        // =========================
        // 1. VALIDASI REQUEST
        // =========================
        $request->validate([
            'kompetensi_id' => 'required|exists:kompetensi,id',
            'from_tahun_akademik_id' => 'required|exists:tahun_akademik,id',
            'from_semester_id' => 'required|exists:semester,id',
        ]);

        // =========================
        // 2. VALIDASI KOMPETENSI (HARUS CP)
        // =========================
        $kompetensi = Kompetensi::find($request->kompetensi_id);

        if (! $kompetensi || $kompetensi->jenis !== 'CP') {
            return ApiResponse::error(
                'Tidak valid',
                ['kompetensi' => 'ATP hanya untuk Kurikulum Merdeka (CP)'],
                422
            );
        }

        // =========================
        // 3. AMBIL TAHUN AKADEMIK AKTIF (TUJUAN)
        // =========================
        $toTahun = TahunAkademik::where('status', 'aktif')->first();

        if (! $toTahun) {
            return ApiResponse::error(
                'Tahun aktif tidak ditemukan',
                ['tahun_akademik' => 'Tidak ada tahun akademik aktif'],
                404
            );
        }

        if ($request->from_tahun_akademik_id == $toTahun->id) {
            return ApiResponse::error(
                'Kesalahan',
                ['tahun' => 'Tidak bisa clone ke tahun yang sama'],
                422
            );
        }

        // =========================
        // 4. AMBIL SEMESTER AKTIF (TUJUAN)
        // =========================
        $toSemester = Semester::where('status', 'aktif')->first();

        if (! $toSemester) {
            return ApiResponse::error(
                'Semester aktif tidak ditemukan',
                ['semester' => 'Tidak ada semester aktif'],
                404
            );
        }

        // =========================
        // 5. AMBIL ATP SUMBER (1 SEMESTER SAJA)
        // =========================
        $oldAtps = AlurTujuanPembelajaran::where('kompetensi_id', $request->kompetensi_id)
            ->where('tahun_akademik_id', $request->from_tahun_akademik_id)
            ->where('semester_id', $request->from_semester_id)
            ->where('approval_status', 'disetujui')
            ->orderBy('urutan')
            ->get();

        if ($oldAtps->isEmpty()) {
            return ApiResponse::error(
                'Tidak ada data',
                ['atp' => 'ATP semester sumber belum disetujui'],
                422
            );
        }

        // =========================
        // 6. CEGAH CLONE JIKA SUDAH DIKUNCI
        // =========================
        // $locked = AlurTujuanPembelajaran::where('kompetensi_id', $request->kompetensi_id)
        //     ->where('tahun_akademik_id', $toTahun->id)
        //     ->where('semester_id', $toSemester->id)
        //     ->where('is_locked', true)
        //     ->exists();

        // if ($locked) {
        //     return ApiResponse::error(
        //         'Dikunci',
        //         ['atp' => 'ATP semester aktif sudah dikunci'],
        //         403
        //     );
        // }

        // =========================
        // 7. PROSES CLONE
        // =========================
        DB::beginTransaction();

        try {
            foreach ($oldAtps as $atp) {

                $target = AlurTujuanPembelajaran::where([
                    'kompetensi_id' => $atp->kompetensi_id,
                    'tahun_akademik_id' => $toTahun->id,
                    'semester_id' => $toSemester->id,
                    'urutan' => $atp->urutan,
                    'guru_id' => $atp->guru_id,
                ])->first();
            
                // ⛔ jika sudah ada & dikunci → lewati
                if ($target && $target->is_locked) {
                    continue;
                }
            
                // ⛔ jika sudah ada tapi belum dikunci → lewati (atau bisa update kalau mau)
                if ($target) {
                    continue;
                }
            
                // ✅ baru buat
                AlurTujuanPembelajaran::create([
                    'kompetensi_id' => $atp->kompetensi_id,
                    'tahun_akademik_id' => $toTahun->id,
                    'semester_id' => $toSemester->id,
                    'guru_id' => $atp->guru_id,
                    'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
                    'urutan' => $atp->urutan,
                    'approval_status' => 'draft',
                    'is_locked' => false,
                ]);
            }
            

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            return ApiResponse::error(
                'Gagal clone',
                ['error' => $e->getMessage()],
                500
            );
        }

        // =========================
        // 8. RESPONSE
        // =========================
        return ApiResponse::success([
            'tahun_akademik_tujuan' => $toTahun->tahun_akademik,
            'semester_tujuan' => $toSemester->semester,
        ], 'ATP berhasil di-clone ke semester aktif');
    }


    // ✅ guru
    public function diajukan($id)
    {
        $atp = AlurTujuanPembelajaran::findOrFail($id);

        // Cegah ajukan ulang
        if ($atp->approval_status !== 'draft') {
            return ApiResponse::error(
                'Tidak valid',
                ['status' => 'ATP hanya bisa diajukan dari status draft'],
                422
            );
        }

        if ($atp->is_locked) {
            return ApiResponse::error(
                'Dikunci',
                ['atp' => 'ATP sudah dikunci dan tidak bisa diajukan'],
                403
            );
        }

        $atp->update([
            'approval_status' => 'diajukan',
            'approved_by' => null,
            'approved_at' => null,
            'is_locked' => false,
        ]);

        return ApiResponse::success(null, 'ATP berhasil diajukan untuk persetujuan');
    }

    // ✅ spa
    public function diterima($id)
    {
        $atp = AlurTujuanPembelajaran::findOrFail($id);

        if ($atp->approval_status !== 'diajukan') {
            return ApiResponse::error(
                'Tidak valid',
                ['status' => 'ATP hanya bisa disetujui jika status diajukan'],
                422
            );
        }

        $pegawai = Auth::guard('kepegawaian')->user();

        $atp->update([
            'approval_status' => 'disetujui',
            'approved_by' => $pegawai->id,
            'approved_at' => now(),
            'is_locked' => true,
        ]);

        return ApiResponse::success(null, 'ATP disetujui dan dikunci');
    }


    // ✅ spa
    public function ditolak(Request $request, $id)
    {
        $request->validate([
            'catatan_penolakan' => 'nullable|string'
        ]);
    
        $atp = AlurTujuanPembelajaran::findOrFail($id);
    
        if ($atp->approval_status !== 'diajukan') {
            return ApiResponse::error(
                'Tidak valid',
                ['status' => 'ATP hanya bisa ditolak jika status diajukan'],
                422
            );
        }
    
        $pegawai = Auth::guard('kepegawaian')->user();
    
        $atp->update([
            'approval_status' => 'ditolak',
            'approved_by' => $pegawai->id,
            'approved_at' => now(),
            'is_locked' => false,
        ]);
    
        return ApiResponse::success(null, 'ATP ditolak, silakan guru melakukan revisi');
    }
    

    /**
     * ✅ spa dan guru
     */
    public function show(string $id)
    {
        $atp = AlurTujuanPembelajaran::with([
            'kompetensi.mataPelajaran',
            'tahunAkademik',
            'semesterRelasi',
            'approved',
            'guru'
        ])
        ->find($id);

        if(!$atp) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $formatted = [
            'atp_id' => $atp->id,
            'mata_pelajaran' => $atp->kompetensi->mataPelajaran->nama_pelajaran,
            'judul_kompetensi' => $atp->kompetensi->judul_kompetensi,
            'jenis_kompetensi' => $atp->kompetensi->jenis,
            'fase' => $atp->kompetensi->fase,
            'deskripsi_kompetensi' => $atp->kompetensi->deskripsi,
            'status_kompetensi' => $atp->kompetensi->status,
            'tahun_akademik' => $atp->tahunAkademik->tahun_akademik,
            'semester' => $atp->semesterRelasi->semester,
            'nama_guru' => $atp->guru->id,
            'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
            'urutan' => $atp->urutan,
            'approval_status' => $atp->approval_status,
            'is_locked' => $atp->is_locked,
        ];

        return ApiResponse::success($formatted, 'Detail ATP berhasil didapatkan');
    }

    /**
     * ✅ guru
     * | Kondisi                       | Boleh Update?  |
     * | ----------------------------- | -------------  |
     * | `approval_status = draft`     | ✅             |
     * | `approval_status = ditolak`   | ✅ (revisi)    |
     * | `approval_status = diajukan`  | ❌             |
     * | `approval_status = disetujui` | ❌             |
     * | `is_locked = true`            | ❌             |
     * | Tahun akademik tidak aktif    | ❌             |
     * | Kompetensi bukan CP           | ❌             |
     * | Bukan pemilik ATP             | ❌             |

     */
    public function update(Request $request, string $id)
    {
        $user = Auth::guard('kepegawaian')->user();

        // 1. Ambil ATP
        $atp = AlurTujuanPembelajaran::with('tahunAkademik', 'semester')->find($id);

        if (! $atp) {
            return ApiResponse::error(
                'Tidak ditemukan',
                ['atp' => 'Data ATP tidak ditemukan'],
                404
            );
        }

        // 2. Pastikan pemilik (guru pembuat)
        if ($atp->guru_id !== $user->id) {
            return ApiResponse::error(
                'Akses ditolak',
                ['atp' => 'Anda tidak berhak mengubah ATP ini'],
                403
            );
        }

        // 3. Tidak boleh ubah jika dikunci
        if ($atp->is_locked) {
            return ApiResponse::error(
                'Dikunci',
                ['atp' => 'ATP sudah dikunci dan tidak bisa diubah'],
                403
            );
        }

        // 4. Tidak boleh ubah jika sudah diajukan / disetujui
        if (in_array($atp->approval_status, ['diajukan', 'disetujui'])) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['atp' => 'ATP yang sudah diajukan atau disetujui tidak dapat diubah'],
                403
            );
        }

        // 5. Validasi input
        $validated = $request->validate([
            'kompetensi_id' => 'required|exists:kompetensi,id',
            // 'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
            // 'semester' => 'required|in:Ganjil,Genap',
            'tujuan_pembelajaran' => 'required|string',
            'urutan' => 'required|integer|min:1',
        ], [
            'kompetensi_id.required' => 'Kompetensi wajib diisi',
            'kompetensi_id.exists' => 'Kompetensi tidak ditemukan',
            // 'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
            // 'semester.in' => 'Semester harus Ganjil atau Genap',
            'tujuan_pembelajaran.required' => 'Tujuan pembelajaran wajib diisi',
            'urutan.required' => 'Urutan ATP wajib diisi',
        ]);

        // 6. Pastikan kompetensi adalah CP (Merdeka)
        $kompetensi = Kompetensi::find($validated['kompetensi_id']);

        if ($kompetensi->jenis !== 'CP') {
            return ApiResponse::error(
                'Tidak valid',
                ['kompetensi' => 'ATP hanya berlaku untuk Kurikulum Merdeka (CP)'],
                422
            );
        }

        // 7. Pastikan tahun akademik dan semester aktif        
        if ($atp->tahunAkademik->status !== 'aktif') {
            return ApiResponse::error(
                'Tidak valid',
                ['tahun_akademik' => 'Perubahan ATP hanya boleh pada tahun akademik aktif'],
                422
            );
        }

        if ($atp->semester->status !== 'aktif') {
            return ApiResponse::error(
                'Tidak valid',
                ['semester' => 'Perubahan ATP hanya boleh pada semester aktif'],
                422
            );
        }

        // 8. Cegah duplikasi urutan (kecuali dirinya sendiri)
        $duplicate = AlurTujuanPembelajaran::where('id', '!=', $atp->id)
            ->where('kompetensi_id', $validated['kompetensi_id'])
            ->where('tahun_akademik_id', $atp->tahunAkademik->id)
            ->where('semester', $atp->semester->id)
            ->where('urutan', $validated['urutan'])
            ->where('guru_id', $user->id)
            ->exists();

        if ($duplicate) {
            return ApiResponse::error(
                'Duplikasi',
                ['urutan' => 'Urutan ATP sudah digunakan pada semester ini'],
                422
            );
        }

        // 9. Update ATP (kembali ke draft jika revisi)
        $atp->update([
            'kompetensi_id' => $validated['kompetensi_id'],
            'tahun_akademik_id' => $atp->tahunAkademik->id,
            'semester_id' => $atp->semester->id,
            'tujuan_pembelajaran' => $validated['tujuan_pembelajaran'],
            'urutan' => $validated['urutan'],
            'approval_status' => 'draft',
            'approved_by' => null,
            'approved_at' => null,
            'catatan_penolakan' => null,
            'is_locked' => false,
        ]);

        return ApiResponse::success([
            'atp_id' => $atp->id,
            'kompetensi_id' => $atp->kompetensi_id,
            'tahun_akademik' => $atp->tahunAkademik->tahun_akademik,
            'semester' => $atp->semester->semester,
            'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
            'urutan' => $atp->urutan,
            'approval_status' => $atp->approval_status,
            'is_locked' => $atp->is_locked,
        ], 'ATP berhasil diperbarui (status: draft)');
    }


    /**
     * ✅ guru
     */
    public function destroy(string $id)
    {
        $user = Auth::guard('kepegawaian')->user();

        // 1. Ambil ATP
        $atp = AlurTujuanPembelajaran::find($id);

        if (! $atp) {
            return ApiResponse::error(
                'Tidak ditemukan',
                ['atp' => 'Data ATP tidak ditemukan'],
                404
            );
        }

        // 2. Pastikan pemilik (guru pembuat)
        if ($atp->guru_id !== $user->id) {
            return ApiResponse::error(
                'Akses ditolak',
                ['atp' => 'Anda tidak berhak menghapus ATP ini'],
                403
            );
        }

        // 3. Tidak boleh hapus jika dikunci
        if ($atp->is_locked) {
            return ApiResponse::error(
                'Dikunci',
                ['atp' => 'ATP sudah dikunci dan tidak bisa dihapus'],
                403
            );
        }

        // 4. Tidak boleh hapus jika sudah diajukan / disetujui
        if (in_array($atp->approval_status, ['diajukan', 'disetujui'])) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['atp' => 'ATP yang sudah diajukan atau disetujui tidak dapat dihapus'],
                403
            );
        }

        // 5. Pastikan tahun akademik dan semester aktif
        $tahunAkademik = TahunAkademik::find($atp->tahun_akademik_id);

        if (! $tahunAkademik || $tahunAkademik->status !== 'aktif') {
            return ApiResponse::error(
                'Tidak valid',
                ['tahun_akademik' => 'Penghapusan ATP hanya boleh pada tahun akademik aktif'],
                422
            );
        }

        $semester = Semester::find($atp->semester_id);

        if (! $semester || $semester->status !== 'aktif') {
            return ApiResponse::error(
                'Tidak valid',
                ['semester' => 'Penghapusan ATP hanya boleh pada semester aktif'],
                422
            );
        }

        // 6. Pastikan tidak  dipakai pada modul ajar
        // if ($atp->modulAjar()->exists()) {
        //     return ApiResponse::error(
        //         'Tidak diizinkan',
        //         ['atp' => 'ATP sudah digunakan pada modul ajar'],
        //         422
        //     );
        // }        

        // 7. Hapus ATP
        $atp->delete();

        return ApiResponse::success(null, 'ATP berhasil dihapus');
    }    

    // guru
    public function dataSelectAtp() {
        // kompetensi
        $data1 = Kompetensi::with('kurikulum', 'mataPelajaran')
        ->where('status', 'aktif')
        ->get();

        if($data1->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $kompetensi = $data1->map(function ($komp) {
            if ($komp->jenis == 'KD') {
                return [
                    'kompetensi_id' => $komp->id,
                    'judul_kompetensi' => $komp->judul_kompetensi,
                    'kurikulum' => $komp->kurikulum->nama_kurikulum,
                    'mata_pelajaran' => $komp->mataPelajaran->nama_pelajaran,
                    'tingkat' => $komp->tingkat,
                    'aspek' => $komp->aspek,
                ];
            }

            return [
                'kompetensi_id' => $komp->id,
                'judul_kompetensi' => $komp->judul_kompetensi,
                'kurikulum' => $komp->kurikulum->nama_kurikulum,
                'mata_pelajaran' => $komp->mataPelajaran->nama_pelajaran,
                'fase' => $komp->fase,
            ];
            
        });


        // tahun akademik
        // $data2 = TahunAkademik::select('id', 'tahun_akademik', 'status')
        // ->where('status', 'aktif')
        // ->first();

        // if (!$data2) {
        //     return ApiResponse::error('Not found', ['data' => 'Tahun akademik aktif tidak ditemukan']);
        // }

        // $tahunAkademik = [
        //     'tahun_akademik_id' => $data2->id,
        //     'tahun_akademik' => $data2->tahun_akademik,
        //     'status_tahun_akademik' => $data2->status,
        // ];


        // guru
        $data3 = Kepegawaian::select('id', 'nama', 'nip', 'nuptk')
        ->where('role', 'guru')
        ->where('status', 'aktif')
        ->get();

        if ($data3->isEmpty()) {
            return ApiResponse::error(
                'Data kosong',
                ['data' => 'Tidak ada guru aktif']
            );
        }     

        $guru = $data3->map(function ($g) {
            return [
                'guru_id' => $g->id,
                'nama_guru' => $g->nama,
                'nip' => $g->nip ?? null,
                'nuptk' => $g->nuptk ?? null,
            ];
        });


        // semester
        // $data4 = Semester::with('tahunAkademik')
        // ->whereHas('tahunAkademik', function ($q) {
        //     $q->where('status', 'aktif');
        // })
        // ->where('status', 'aktif')
        // ->first();

        // if (!$data4) {
        //     return ApiResponse::error( 'Data kosong', ['data' => 'Tidak ada semester aktif'] );
        // }   
        
        // $semester = [
        //     'semester_id' => $data4->id,
        //     'semester' => $data4->semester,
        //     'status_semester' => $data4->status,
        //     'tahun_akademik' => $data4->tahunAkademik->tahun_akademik ?? null,
        //     'status_tahun_akademik' => $data4->tahunAkademik->status ?? null,
        // ];

        return ApiResponse::success([
            'kompetensi' => $kompetensi ?? null,
            'guru' => $guru ?? null,
            // 'tahun_akademik' => $tahunAkademik ?? null,
            // 'semester' => $semester ?? null
        ], 'Data select berhasil diambil');

    }
}
