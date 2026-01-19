<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rombel;
use App\Models\Kelas;
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
        $data = Rombel::with([
            'tahunAkademik',
            'kelas',
            'waliRombel',
            'siswaRombels.siswa',
        ])
        ->orderBy('tahun_akademik_id')
        ->orderBy('kelas_id')
        ->get()
        ->groupBy('tahun_akademik_id')
        ->map(function ($groupByTahun) {
    
            $tahun = $groupByTahun->first()->tahunAkademik;
    
            return [
                'tahun_akademik_id' => $tahun->id,
                'tahun_akademik' => $tahun->tahun_akademik,
                'status_tahun_akademik' => $tahun->status,
    
                'daftar_kelas' => $groupByTahun
                    ->groupBy('kelas_id')
                    ->map(function ($groupByKelas) {
    
                        $kelas = $groupByKelas->first()->kelas;
    
                        return [
                            'kelas_id' => $kelas?->id,
                            'nama_kelas' => $kelas?->nama_kelas,
    
                            'daftar_rombel' => $groupByKelas->map(function ($rombel) {
                                return [
                                    'rombel_id' => $rombel->id,
                                    'nama_rombel' => $rombel->nama_rombel,
    
                                    'wali_rombel' => [
                                        'id' => $rombel->waliRombel?->id,
                                        'nama' => $rombel->waliRombel?->nama,
                                    ],                                    
                                ];
                            })->values(),
                        ];
                    })->values(),
            ];
        })->values();    

            return ApiResponse::success($data, 'Data rombel berhasil diambil');
    }
/**
 * tahun: [
 *      daftar_kelas: [
 *          daftar_rombel: []              
 *      ]
 * ]
 */


    /**
     * ✅ untuk spa
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'kelas_id' => 'required|exists:kelas,id',
                'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
                'nama_rombel' => 'required',
                'wali_rombel_id' => 'required|exists:kepegawaians,id',
            ],[
                'kelas_id.required' => 'Kelas wajib diisi',
                'kelas_id.exists' => 'Kelas tidak ditemukan',
                'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
                'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',
                'nama_rombel.required' => 'Nama rombel wajib diisi',
                'wali_rombel_id.required' => 'Wali kelas wajib diisi',
                'wali_rombel_id.exists' => 'Wali kelas tidak ditemukan',
            ]);
            
            // jika role bukan guru, maka tidak boleh jadi wali kelas
            $role = Kepegawaian::where('id', 'wali_rombel_id')->first();
            if ($role->role != 'guru') {
                return ApiResponse::error('Kesalahan', ['pesan' => 'Role bukan guru, tidak bisa menjadi wali kelas']);
            }

            // 1 rombel unik per tahun
            $unikSatu = Rombel::where('nama_rombel', $valdited['nama_rombel'])
            ->where('tahun_akademik_id', $validated['tahun_akademik_id'])
            ->exists();        
            if ($unikSatu) {
                return ApiResponse::error('Duplicated', ['pesan' => 'Rombel tersebut sudah ada pada tahun ini']);
            }
                        
            // 1 rombel hanya boleh satu wali per tahun
            $unikDua = Rombel::where('wali_rombel_id', $validated['wali_rombel_id'])
            ->where('tahun_akademik_id', $validated['tahun_akademik_id'])
            ->exists();
            if ($unikDua) {
                return ApiResponse::error('Kesalahan', ['pesan' => 'Guru ini sudah menjadi wali pada kelas lain pada tahun ini']);
            }

            $rombel = Rombel::create([
                'kelas_id' => $validated['kelas_id'],
                'tahun_akademik_id' => $validated['tahun_akademik_id'],
                'nama_rombel' => $validated['nama_rombel'],
                'wali_rombel_id' => $validated['wali_rombel_id'],
            ]);

            $rombel->load(['kelas', 'tahunAkademik', 'waliRombel']);

            return ApiResponse::success([
                'id' => $rombel->id ?? null,                
                'nama_kelas' => $rombel->kelas->nama_kelas ?? null,
                'tahun_akademik' => $rombel->tahunAkademik->tahun_akademik ?? null,
                'status_tahun_akademik' => $rombel->tahunAkademik->status ?? null,
                'nama_rombel' => $rombel->nama_rombel ?? null,
                'wali_rombel' => $rombel->waliRombel->nama ?? null,
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
        // 1. Ambil rombel + data inti
        $rombel = Rombel::with([
            'tahunAkademik',
            'kelas',
            'waliRombel',
            'siswaRombels.siswa',
            'siswaRombels.tahunAkademik',
        ])->find($id);

        if (! $rombel) {
            return ApiResponse::error(
                'Rombel tidak ditemukan',
                ['rombel_id' => ['Data tidak ditemukan']],
                404
            );
        }

        // 2. Ambil jadwal pelajaran
        //    Filter tahun akademik LEWAT kurikulum_mata_pelajaran
        $jadwalPelajarans = $rombel->jadwalPelajarans()
            ->whereHas('kurikulumMataPelajaran', function ($q) use ($rombel) {
                $q->where('tahun_akademik_id', $rombel->tahun_akademik_id);
            })
            ->with([
                'semester',
                'guru',
                'kurikulumMataPelajaran.mataPelajaran',
                'kurikulumMataPelajaran.jurusan',
            ])
            ->orderBy('semester_id')
            ->orderBy('hari')
            ->orderBy('jam_mulai')
            ->get();

        // 3. Format response
        $data = [
            'rombel_id' => $rombel->id,
            'nama_rombel' => $rombel->nama_rombel,

            'tahun_akademik' => [
                'tahun_akademik_id' => $rombel->tahunAkademik?->id,
                'tahun_akademik' => $rombel->tahunAkademik?->tahun_akademik,
                'status' => $rombel->tahunAkademik?->status,
            ],

            'kelas' => [
                'kelas_id' => $rombel->kelas?->id,
                'nama_kelas' => $rombel->kelas?->nama_kelas,
            ],

            'wali_rombel' => [
                'id' => $rombel->waliRombel?->id,
                'nama' => $rombel->waliRombel?->nama,
            ],

            'anggota_rombel' => $rombel->siswaRombels->map(function ($siswaRombel) {
                return [
                    'siswa_rombel_id' => $siswaRombel->id,
                    'siswa_id' => $siswaRombel->siswa?->id,
                    'nama_siswa' => $siswaRombel->siswa?->nama,
                    'nisn' => $siswaRombel->siswa?->nisn,
                    'nis' => $siswaRombel->siswa?->nis,
                ];
            })->values(),

            'histori_jadwal_pelajaran' => $jadwalPelajarans
                ->groupBy('semester_id')
                ->map(function ($jadwals) {

                    $semester = $jadwals->first()->semester;

                    return [
                        'semester_id' => $semester?->id,
                        'semester' => $semester?->semester,
                        'jadwal_pelajaran' => $jadwals->map(function ($jadwal) {
                            return [
                                'jadwal_pelajaran_id' => $jadwal->id,
                                'mata_pelajaran' => $jadwal
                                    ->kurikulumMataPelajaran
                                    ?->mataPelajaran
                                    ?->nama_pelajaran,
                                'jurusan_pelajaran' => $jadwal
                                    ->kurikulumMataPelajaran
                                    ?->jurusan
                                    ?->nama_jurusan,
                                'guru' => $jadwal->guru?->nama,
                                'hari' => $jadwal->hari,
                                'jam_mulai' => $jadwal->jam_mulai,
                                'jam_selesai' => $jadwal->jam_selesai,
                                'ruangan' => $jadwal->ruangan,
                            ];
                        })->values(),
                    ];
                })
                ->values(),
        ];

        return ApiResponse::success(
            ['data' => $data],
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
     * ✅ untuk spa
     */
    public function update(Request $request, string $id)
    {
        $rombel = Rombel::find($id);

        if (!$rombel) {
            return ApiResponse::error('Not Found', ['id' => 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'kelas_id' => 'sometimes|required|exists:kelas,id',
            'tahun_akademik_id' => 'sometimes|required|exists:tahun_akademik,id',
            'nama_rombel' => 'sometimes|required',
            'wali_rombel_id' => 'sometimes|required|exists:kepegawaians,id',
        ], [
            'kelas_id.required' => 'Kelas wajib diisi',
            'kelas_id.exists' => 'Kelas tidak ditemukan',
            'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
            'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',
            'nama_rombel.required' => 'Nama rombel wajib diisi',
            'wali_rombel_id.required' => 'Wali kelas wajib diisi',
            'wali_rombel_id.exists' => 'Wali kelas tidak ditemukan',
        ]);

        // jika role bukan guru, maka tidak boleh jadi wali kelas
        $role = Kepegawaian::where('id', 'wali_rombel_id')->first();
        if ($role->role != 'guru') {
            return ApiResponse::error('Kesalahan', ['pesan' => 'Role bukan guru, tidak bisa menjadi wali kelas']);
        }

        // 1 rombel unik per tahun
        $unikSatu = Rombel::where('nama_rombel', $valdited['nama_rombel'])
        ->where('tahun_akademik_id', $validated['tahun_akademik_id'])
        ->exists();        
        if ($unikSatu) {
            return ApiResponse::error('Duplicated', ['pesan' => 'Rombel tersebut sudah ada pada tahun ini']);
        }
                    
        // 1 rombel hanya boleh satu wali per tahun
        $unikDua = Rombel::where('wali_rombel_id', $validated['wali_rombel_id'])
        ->where('tahun_akademik_id', $validated['tahun_akademik_id'])
        ->exists();
        if ($unikDua) {
            return ApiResponse::error('Kesalahan', ['pesan' => 'Guru ini sudah menjadi wali pada kelas lain pada tahun ini']);
        }

        $rombel->update($validated);
        $rombel->load(['kelas', 'tahunAkademik', 'waliRombel']);        

        return ApiResponse::success([
            'id' => $rombel->id ?? null,                
            'nama_kelas' => $rombel->kelas->nama_kelas ?? null,
            'tahun_akademik' => $rombel->tahunAkademik->tahun_akademik ?? null,
            'status_tahun_akademik' => $rombel->tahunAkademik->status ?? null,
            'nama_rombel' => $rombel->nama_rombel ?? null,
            'wali_rombel' => $rombel->waliRombel->nama ?? null,
        ], 'Berhasil mengubah rombel');
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

        if ($kelas->siswaRombels()->exists()) {
            return ApiResponse::error('Rombel tidak bisa dihapus karena sudah memiliki siswa', [
                'id' => ['Rombel ini masih digunakan oleh siswa']
            ], 422);
        }

        $rombel->delete();

        return ApiResponse::success('null', 'Data rombel berhasil dihapus');
    }

    public function dataSelect() {
        // kelas
        $data = Kelas::select('id', 'nama_kelas', 'tingkat', 'jurusan_id')
        ->with('jurusan')
        ->get();

        if ($data->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $kelas = $data->map(function ($k) {
            return [
                'kelas_id' => $k->id ?? null,
                'nama_kelas' => $k->nama_kelas ?? null,
                'tingkat_kelas' => $k->tingkat ?? null,
                'jurusan_kelas' => $k->jurusan->nama_jurusan ?? null,
            ];
        })->values();


        // tahun akademik
        $data2 = TahunAkademik::select('id', 'tahun_akademik', 'status')->where('status', 'aktif')->first();

        if (!$data2) {
            return ApiResponse::error('Not found', ['data' => null]);
        }

        $tahunAkademik = [
            'tahun_akademik_id' => $data2->id,
            'tahun_akademik' => $data2->tahun_akademik,
            'status_tahun_akademik' => $data2->status,
        ];


        // wali rombel
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

        $wali = $data3->map(function ($w) {
            return [
                'wali_rombel_id' => $w->id,
                'nama_guru' => $w->nama,
                'nip' => $w->nip ?? null,
                'nuptk' => $w->nuptk ?? null,
            ];
        });


        return ApiResponse::success([
            'kelas' => $kelas,
            'tahun_akademik' => $tahunAkademik,
            'wali_rombel' => $wali
        ], 'Data select berhasil diambil');
    }
}