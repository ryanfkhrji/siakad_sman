<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rombel;
use App\Models\Kelas;
use App\Models\Jurusan;
use App\Models\TahunAkademik;
use App\Models\Kepegawaian;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class RombelController extends Controller
{
    /**
     * ✅ Untuk spa
     */
    public function index()
    {
        $rombels = Rombel::with([
            'kelas',
            'jurusan'
        ])->get();

        if ($rombels->isEmpty()) {
            return ApiResponse::error(
                'No data',
                ['data' => 'Belum ada data rombel']
            );
        }

        $formatted = $rombels->map(function ($r) {
            return [
                'rombel_id'     => $r->id,
                'nama_rombel'   => $r->nama_rombel,
                'status_rombel' => $r->status,

                'kelas' => [
                    'kelas_id'     => $r->kelas?->id,
                    'nama_kelas'   => $r->kelas?->nama_kelas,
                    'tingkat'      => $r->kelas?->tingkat,
                    'status_kelas' => $r->kelas?->status,
                ],

                'jurusan' => [
                    'jurusan_id'     => $r->jurusan?->id,
                    'nama_jurusan'   => $r->jurusan?->nama_jurusan,
                    'status_jurusan' => $r->jurusan?->status,
                ],
            ];
        })->values();

        return ApiResponse::success(
            $formatted,
            'Data rombel berhasil diambil'
        );
    }



    /**
     * ✅ untuk spa
     */
    public function store(Request $request)
    {
        try {
            // 1. Validasi input
            $validated = $request->validate([
                'kelas_id'    => 'required|exists:kelas,id',
                'nama_rombel' => 'required|string',        
                'jurusan_id'  => 'nullable|exists:jurusans,id'
            ], [
                'kelas_id.required'      => 'Kelas wajib diisi',
                'kelas_id.exists'        => 'Kelas tidak ditemukan',
                'nama_rombel.required'   => 'Nama rombel wajib diisi',                                
                'jurusan_id.exists'      => 'Jurusan tidak ditemukan',
            ]);                 

            // 2. Unik nama rombel per tahun akademik
            $existsNama = Rombel::where('nama_rombel', $validated['nama_rombel'])
                ->where('kelas_id', $validated['kelas_id'])
                ->where('jurusan_id', $validated['jurusan_id'])
                ->exists();

            if ($existsNama) {
                return ApiResponse::error(
                    'Duplicated',
                    ['pesan' => 'Rombel tersebut sudah ada']
                );
            }            

            // 3. Simpan data
            $rombel = Rombel::create([
                'kelas_id' => $validated['kelas_id'],
                'nama_rombel' => $validated['nama_rombel'],
                'jurusan_id' => $validated['jurusan_id'] ?? null,
                'status' => 'aktif'
            ]);

            // 7. Load relasi
            $rombel->load('kelas', 'jurusan');

            // 8. Response
            return ApiResponse::success([
                'id' => $rombel->id,
                'nama_rombel' => $rombel->nama_rombel,
                'kelas' => $rombel->kelas->nama_kelas ?? null,
                'tingkat' => $rombel->kelas->tingkat ?? null,
                'jurusan' => $rombel->jurusan->nama_jurusan ?? null,
                'status_rombel' => $rombel->status ?? null,
            ], 'Berhasil membuat rombel');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    /**
     * ✅ untuk spa dan guru     
     */
    public function show($id)
    {
        $rombel = Rombel::with([
            'kelas',
            'jurusan',
            'waliRombels.wali',
            'waliRombels.tahunAkademik',
            'siswaRombels.siswa',
            'siswaRombels.tahunAkademik',
            'jadwalPelajarans.semester',
            'jadwalPelajarans.guru',
            'jadwalPelajarans.ruangan',
            'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
        ])->find($id);

        if (!$rombel) {
            return ApiResponse::error(
                'Rombel tidak ditemukan',
                ['rombel_id' => ['Data tidak ditemukan']],
                404
            );
        }

        // 🔑 Ambil SEMUA tahun akademik (periode utama)
        $tahunAkademiks = TahunAkademik::orderBy('tahun_akademik')->get();

        $periode = $tahunAkademiks->map(function ($ta) use ($rombel) {

            // wali rombel per tahun akademik (boleh null)
            $wali = $rombel->waliRombels
                ->where('tahun_akademik_id', $ta->id)
                ->first();

            // siswa rombel per tahun akademik (boleh kosong)
            $siswa = $rombel->siswaRombels
                ->where('tahun_akademik_id', $ta->id)
                ->map(function ($sr) {
                    return [
                        'siswa_id'   => $sr->siswa?->id,
                        'nama_siswa' => $sr->siswa?->nama,
                        'nisn'       => $sr->siswa?->nisn,
                        'nis'        => $sr->siswa?->nis,
                    ];
                })
                ->values();

            // jadwal rombel per tahun akademik
            $jadwalTA = $rombel->jadwalPelajarans
                ->where('tahun_akademik_id', $ta->id);

            // semester (boleh kosong)
            $semester = $jadwalTA
                ->groupBy('semester_id')
                ->map(function ($jadwals) {

                    $semester = $jadwals->first()?->semester;

                    return [
                        'semester_id' => $semester?->id,
                        'semester'    => $semester?->semester,
                        'jadwal_pelajaran' => $jadwals->map(function ($j) {
                            return [
                                'jadwal_id'      => $j->id,
                                'mata_pelajaran' => $j->kurikulumMataPelajaran
                                    ?->mataPelajaran
                                    ?->nama_pelajaran,
                                'hari'           => $j->hari,
                                'guru_pengajar'  => $j->guru?->nama,
                                'jam_mulai'      => $j->jam_mulai,
                                'jam_selesai'    => $j->jam_selesai,
                                'ruangan'        => $j->ruangan?->nama_ruangan,
                                'link_opsional'  => $j->link_opsional,
                            ];
                        })->values(),
                    ];
                })
                ->values();

            return [
                'tahun_akademik_id'     => $ta->id,
                'tahun_akademik'        => $ta->tahun_akademik,
                'status_tahun_akademik' => $ta->status,

                'wali' => $wali ? [
                    'wali_id'   => $wali->wali?->id,
                    'nama_wali' => $wali->wali?->nama,
                ] : null,

                'siswa'    => $siswa,
                'semester' => $semester,
            ];
        });

        $data = [
            'rombel_id'     => $rombel->id,
            'nama_rombel'   => $rombel->nama_rombel,
            'status_rombel' => $rombel->status,

            'kelas' => [
                'kelas_id' => $rombel->kelas?->id,
                'kelas'    => $rombel->kelas?->nama_kelas,
                'tingkat'  => $rombel->kelas?->tingkat,
            ],

            'jurusan' => [
                'jurusan_id'   => $rombel->jurusan?->id,
                'nama_jurusan' => $rombel->jurusan?->nama_jurusan,
            ],

            'periode' => $periode,
        ];

        return ApiResponse::success(
            $data,
            'Detail rombel berhasil diambil'
        );
    }



    
    // ✅ untuk guru (diambil yang aktif aja)
    public function getAllRombelSendiri()
    {
        $user = Auth::guard('kepegawaian')->user();
    
        $rombels = Rombel::where('wali_rombel_id', $user->id)
        ->whereHas('tahunAkademik', fn ($q) => $q->where('status', 'aktif'))
        ->with([
            'waliRombel:id,nama',
            'tahunAkademik:id,tahun_akademik,status',
            'kelas:id,nama_kelas',
            'siswaRombels.siswa:id,nama,nisn',
        ])
        ->first();

    
        if (!$rombels) {
            return ApiResponse::error(
                'Rombel tidak ditemukan',
                ['wali_rombel_id' => ['Belum memiliki rombel']],
                404
            );
        }
    
        $data = [
            'wali_rombel' => [
                'id' => $user->id,
                'nama' => $user->nama,
            ],
            'rombel' => [
                    'rombel_id' => $rombel->id,
                    'nama_rombel' => $rombel->nama_rombel,
    
                    'tahun_akademik' => [
                        'id' => $rombel->tahunAkademik?->id,
                        'tahun_akademik' => $rombel->tahunAkademik?->tahun_akademik,
                        'status' => $rombel->tahunAkademik?->status,
                    ],
    
                    'kelas' => [
                        'id' => $rombel->kelas?->id,
                        'nama_kelas' => $rombel->kelas?->nama_kelas,
                    ],
    
                    'anggota' => $rombel->siswaRombels->map(function ($siswaRombel) {
                        return [
                            'siswa_rombel_id' => $siswaRombel->id,
                            'siswa_id' => $siswaRombel->siswa?->id,
                            'nama_siswa' => $siswaRombel->siswa?->nama,
                            'nisn' => $siswaRombel->siswa?->nisn,
                        ];
                    })->values(),
                ],
        ];
    
        return ApiResponse::success(
            ['data' => $data],
            'Rombel berhasil diambil'
        );
    }
    

    /**
     * ! ✅ untuk spa (masuk sini)
     */
    public function update(Request $request, string $id)
    {
        // 1. Ambil rombel + relasi kelas & jurusan
        $rombel = Rombel::with('kelas.jurusan')->find($id);

        if (!$rombel) {
            return ApiResponse::error(
                'Not Found',
                ['id' => 'Data rombel tidak ditemukan'],
                404
            );
        }

        // 2. Cek status rombel (BUKAN tahun akademik)
        if ($rombel->status === 'arsip') {
            return ApiResponse::error(
                'Arsip',
                ['status' => 'Rombel sudah berstatus arsip, tidak bisa diubah'],
                422
            );
        }

        // 3. Validasi input (update parsial)
        $validated = $request->validate([
            'kelas_id'    => 'sometimes|required|exists:kelas,id',
            'nama_rombel' => 'sometimes|required|string|max:50',
            'status'      => 'sometimes|required|in:aktif,arsip',
        ], [
            'kelas_id.required'    => 'Kelas wajib diisi',
            'kelas_id.exists'      => 'Kelas tidak ditemukan',
            'nama_rombel.required' => 'Nama rombel wajib diisi',
            'status.required'      => 'Status wajib diisi',
            'status.in'            => 'Status hanya boleh aktif atau arsip',
        ]);

        // 4. Tentukan nilai final (lama / baru)
        $kelasIdFinal  = $validated['kelas_id']    ?? $rombel->kelas_id;
        $namaRombelFinal = $validated['nama_rombel'] ?? $rombel->nama_rombel;

        // 5. Cek unik nama rombel per kelas
        $existsNama = Rombel::where('kelas_id', $kelasIdFinal)
            ->where('nama_rombel', $namaRombelFinal)
            ->where('id', '!=', $rombel->id)
            ->exists();

        if ($existsNama) {
            return ApiResponse::error(
                'Duplicated',
                ['nama_rombel' => 'Rombel dengan nama tersebut sudah ada di kelas ini'],
                422
            );
        }

        // 6. Update rombel
        $rombel->update([
            'kelas_id'    => $kelasIdFinal,
            'nama_rombel' => $namaRombelFinal,
            'status'      => $validated['status'] ?? $rombel->status,
        ]);

        // 7. Reload relasi terbaru
        $rombel->load('kelas.jurusan');

        // 8. Response
        return ApiResponse::success([
            'rombel_id'   => $rombel->id,
            'nama_rombel' => $rombel->nama_rombel,
            'status'      => $rombel->status,
            'kelas' => [
                'kelas_id'   => $rombel->kelas?->id,
                'nama_kelas' => $rombel->kelas?->nama_kelas,
                'tingkat'    => $rombel->kelas?->tingkat,
                'jurusan'    => $rombel->kelas?->jurusan?->nama_jurusan,
            ],
        ], 'Berhasil mengubah data rombel');
    }



    /**
     * ✅ untuk spa
     */
    public function destroy(string $id)
    {
        $rombel = Rombel::find($id);

        if (!$rombel) {
            return ApiResponse::error('Data tidak ditemukan', ['id' => 'Rombel tidak ditemukan']);
        }

        if ($rombel->status == 'arsip') {
            return ApiResponse::error('Tidak bisa', ['data' => 'Rombel sudah menjadi arsip']);
        }

        if ($rombel->siswaRombels()->exists()) {
            return ApiResponse::error('Rombel tidak bisa dihapus karena sudah memiliki siswa', [
                'id' => ['Rombel ini masih digunakan oleh siswa']
            ], 422);
        }

        if ($rombel->waliRombels()->exists()) {
            return ApiResponse::error('Rombel tidak bisa dihapus', [
                'id' => ['Rombel ini masih digunakan oleh wali kelas']
            ], 422);
        }

        if ($rombel->jadwalPelajarans()->exists()) {
            return ApiResponse::error('Rombel tidak bisa dihapus', [
                'id' => ['Rombel telah digunakan oleh jadwal pelajaran']
            ], 422);
        }

        $rombel->delete();

        return ApiResponse::success('null', 'Data rombel berhasil dihapus');
    }



    public function dataSelect() {
        // kelas
        $data = Kelas::where('status', 'aktif')->select('id', 'nama_kelas', 'tingkat')->get();

        if ($data->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $kelas = $data->map(function ($k) {
            return [
                'kelas_id' => $k->id ?? null,
                'nama_kelas' => $k->nama_kelas ?? null,
                'tingkat_kelas' => $k->tingkat ?? null,                
            ];
        })->values();        


        // Jurusan
        $data2 = Jurusan::where('status', 'aktif')->get();

        $jurusan = $data2->map(function ($j) {
            return [
                'jurusan_id'    => $j->id,
                'nama_jurusan'  => $j->nama_jurusan,
            ];
        })->values();

        return ApiResponse::success([
            'kelas'   => $kelas,
            'jurusan' => $jurusan
        ], 'Data select berhasil diambil');
    }
}