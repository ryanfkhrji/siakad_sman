<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SiswaJadwalPelajaran;
use App\Models\Siswa;
use App\Models\TahunAkademik;
use App\Models\JadwalPelajaran;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class SiswaJadwalPelajaranController extends Controller
{
    /**
     * ✅ untuk spa
     * siswa (belongs)
     * jurusan (belongs)
     * jadwalPelajarans (hasMany)
     * absensiSiswas (hasMany)
     */
    public function index()
    {
        $siswas = Siswa::with([
            'jurusan',
            'jadwalPelajarans.kelas',
            'jadwalPelajarans.guru',
            'jadwalPelajarans.kurikulumMataPelajaran.mataPelajaran',
            'jadwalPelajarans.kurikulumMataPelajaran.jurusan',
            'jadwalPelajarans.kurikulumMataPelajaran.tahunAkademik',
        ])->get();

        if ($siswas->isEmpty()) {
            return ApiResponse::error(
                'Data siswa tidak ditemukan',
                [],
                404
            );
        }

        $result = $siswas->map(function ($siswa) {
            return [
                'siswa_id'   => $siswa->id ?? null,
                'nisn'        => $siswa->nisn ?? null,
                'nama_siswa' => $siswa->nama ?? null,
                'nis'        => $siswa->nis ?? null,
                'jurusan'    => $siswa->jurusan->nama_jurusan ?? null,

                'jadwal_pelajaran' => $siswa->jadwalPelajarans->map(function ($jadwal) {

                    $kurikulum = $jadwal->kurikulumMataPelajaran;

                    return [
                        'siswa_jadwal_pelajaran_id' => $jadwal->pivot->id ?? null,
                        'siswa_id' => $jadwal->pivot->siswa_id ?? null,
                        'jadwal_pelajaran_id' => $jadwal->id ?? null,
                        'guru'        => $jadwal->guru->nama ?? null,
                        'hari'        => $jadwal->hari ?? null,
                        'kelas'       => $jadwal->kelas->nama_kelas ?? null,
                        'jam_mulai'   => $jadwal->jam_mulai ?? null,
                        'jam_selesai' => $jadwal->jam_selesai ?? null,
                        'ruangan'     => $jadwal->ruangan ?? null,
                        'link_opsional' => $jadwal->link_opsional ?? null,

                        'kurikulum_mata_pelajaran' => [
                            'kurikulum_id' => $kurikulum->kurikulum->id ?? null,
                            'nama_kurikulum' => $kurikulum->kurikulum->nama_kurikulum ?? null,

                            'mata_pelajaran_id' => $kurikulum->mataPelajaran->id ?? null,
                            'nama_mata_pelajaran' => $kurikulum->mataPelajaran->nama_pelajaran ?? null,
                            
                            'jurusan_pelajaran' => $kurikulum->jurusan->nama_jurusan ?? null,
                                                        
                            'tingkat' => $kurikulum->tingkat ?? null,
                            'status_mata_pelajaran' => $kurikulum->status_mata_pelajaran ?? null,

                            'tahun_akademik_id' => $kurikulum->tahunAkademik->id ?? null,
                            'tahun_akademik' => $kurikulum->tahunAkademik->tahun_akademik ?? null,
                            'status_tahun_akademik' => $kurikulum->tahunAkademik->status ?? null,
                            'semester' => $kurikulum->tahunAkademik->semester ?? null,
                            'status_semester' => $kurikulum->tahunAkademik->status ?? null,
                        ],
                    ];
                })->values(),
            ];
        });

        // Data untuk select
        $siswa = Siswa::get()->with(['jurusan', 'kelas'])->map(function ($item) {
            return [
                'siswa_id' => $item->id ?? null,
                'nisn' => $item->nisn ?? null,                
                'nama_siswa' => $item->nama ?? null,                
                'jurusan' => $item->jurusan->nama_jurusan ?? null,                
                'kelas' => $item->kelas->nama_kelas ?? null,
            ];
        });        


        $jadwalPelajaran = JadwalPelajaran::get()
        ->with(
            [
                'kurikulumMataPelajaran.mataPelajaran',
                'guru',
                'kelas',
                'tahunAkademik',
                'jurusan',                
            ])->map(function ($item) {
            return [
                'jadwal_pelajaran_id' => $item->id ?? null,
                'nama_mata_pelajaran' => $item->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                'jurusan_pelajaran' => $item->jurusan->nama_jurusan ?? null,
                'guru' => $item->guru->nama ?? null,
                'kelas' => $item->kelas->nama_kelas ?? null,
                'tahun_akademik' => $item->tahunAkademik->tahun_akademik ?? null,
                'status_pelajaran' => $item->kurikulumMataPelajaran->status_aktif ?? null,
            ];
        });        


        $tahunAkademik = TahunAkademik::get()->map(function ($item) {
            return [
                'tahun_akademik_id' => $item->id ?? null,
                'nama_tahun_akademik' => $item->tahun_akademik ?? null,                
                'status_tahun_akademik' => $item->status ?? null,                
                'semester' => $item->semester ?? null,                
                'status_semester' => $item->status ?? null,                
            ];
        });   
        // Data untuk select


        return ApiResponse::success(
            [   
                'data_untuk_tampil' => $result,
                'data_untuk_select' => [
                    'siswa' => $siswa,
                    'jadwal_pelajaran' => $jadwalPelajaran,
                    'tahun_akademik' => $tahunAkademik,
                ]
            ], 'Daftar siswa dan jadwal pelajarannya berhasil diambil');
    }


    /**
     * ✅ untuk spa
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                // ⚠️ Ini inputannya untuk create @Ryan
                'siswa_id' => 'required|exists:siswas,id',
                'jadwal_pelajaran_id' => 'required|exists:jadwal_pelajarans,id',
                // 'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
            ],[
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'jadwal_pelajaran_id.required' => 'Jadwal pelajaran wajib diisi',
                'jadwal_pelajaran_id.exists' => 'Jadwal pelajaran tidak ditemukan',
                // 'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
                // 'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',
            ]);

            // tidak boleh dobel pelajaran yang sama
            $existing = SiswaJadwalPelajaran::where('siswa_id', $validated['siswa_id'])
                ->where('jadwal_pelajaran_id', $validated['jadwal_pelajaran_id'])
                // ->where('tahun_akademik_id', $validated['tahun_akademik_id'])
                ->exists();

            if ($existing) {
                return ApiResponse::error('Siswa sudah terdaftar di pelajaran ini dan pada tahun ini', [
                    'siswa_id' => ['Siswa sudah terdaftar di pelajaran ini']
                ], 422);
            }

            $siswaJadwalPelajaran = SiswaJadwalPelajaran::create($validated);

            $siswaJadwalPelajaran->load('siswa', 'jurusan', 'jadwalPelajaran.mataPelajaran');
            
            return ApiResponse::success([
                'id' => $siswaJadwalPelajaran->id ?? null,
                'nama_siswa' => $siswaJadwalPelajaran->siswa->nama ?? null,
                'mata_pelajaran' => $siswaJadwalPelajaran->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,
                'hari' => $siswaJadwalPelajaran->jadwalPelajaran->hari ?? null,
                'guru' => $siswaJadwalPelajaran->jadwalPelajaran->guru->nama ?? null,
                'kelas' => $siswaJadwalPelajaran->jadwalPelajaran->kelas->nama_kelas ?? null,
                'jam_mulai' => $siswaJadwalPelajaran->jadwalPelajaran->jam_mulai ?? null,
                'jam_selesai' => $siswaJadwalPelajaran->jadwalPelajaran->jam_selesai ?? null,
                'ruangan' => $siswaJadwalPelajaran->jadwalPelajaran->ruangan ?? null,
                'link_opsional' => $siswaJadwalPelajaran->jadwalPelajaran->link_opsional ?? null,
            ], 'Penetapan Jadwal Pelajaran Siswa Berhasil');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ untuk spa/siswa
     */
    public function show($id)
    {
        $siswaJadwalPelajaran = SiswaJadwalPelajaran::with('siswa', 'jurusan', 'jadwalPelajaran')->find($id);

        if (!$siswaJadwalPelajaran) {
            return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $kurikulumMataPelajaran = $siswaJadwalPelajaran->jadwalPelajaran->kurikulumMataPelajaran;

        $formatted = [
            'siswa_jadwal_pelajaran_id' => $siswaJadwalPelajaran->id ?? null,
            'siswa_id' => $siswaJadwalPelajaran->siswa->id ?? null,
            'nisn' => $siswaJadwalPelajaran->siswa->nisn ?? null,
            'nama' => $siswaJadwalPelajaran->siswa->nama ?? null,
            'nis' => $siswaJadwalPelajaran->siswa->nis ?? null,
            'nama_jurusan' => $siswaJadwalPelajaran->siswa->jurusan->nama_jurusan ?? null,
            'nama_kelas' => $siswaJadwalPelajaran->siswa->kelas->nama_kelas ?? null,
            'jadwal_pelajaran' => [                                
                'jadwal_pelajaran_id' => $siswaJadwalPelajaran->jadwalPelajaran->id ?? null,
                'guru'        => $siswaJadwalPelajaran->jadwalPelajaran->guru->nama ?? null,
                'hari'        => $siswaJadwalPelajaran->jadwalPelajaran->hari ?? null,
                'kelas'       => $siswaJadwalPelajaran->jadwalPelajaran->kelas->nama_kelas ?? null,
                'jam_mulai'   => $siswaJadwalPelajaran->jadwalPelajaran->jam_mulai ?? null,
                'jam_selesai' => $siswaJadwalPelajaran->jadwalPelajaran->jam_selesai ?? null,
                'ruangan'     => $siswaJadwalPelajaran->jadwalPelajaran->ruangan ?? null,
                'link_opsional' => $siswaJadwalPelajaran->jadwalPelajaran->link_opsional ?? null,

                'kurikulum_mata_pelajaran' => [
                    'kurikulum_mata_pelajaran_id' => $kurikulumMataPelajaran->id ?? null,

                    'kurikulum_id' => $kurikulumMataPelajaran->kurikulum->id ?? null,
                    'nama_kurikulum' => $kurikulumMataPelajaran->kurikulum->nama_kurikulum ?? null,

                    'mata_pelajaran_id' => $kurikulumMataPelajaran->mataPelajaran->id ?? null,
                    'nama_mata_pelajaran' => $kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                        
                    'jurusan_pelajaran' => $kurikulumMataPelajaran->jurusan->nama_jurusan ?? null,
                                        
                    'tingkat' => $kurikulumMataPelajaran->tingkat ?? null,
                    'status_mata_pelajaran' => $kurikulumMataPelajaran->status_mata_pelajaran ?? null,

                    'tahun_akademik_id' => $kurikulumMataPelajaran->tahunAkademik->id ?? null,
                    'tahun_akademik' => $kurikulumMataPelajaran->tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik' => $kurikulumMataPelajaran->tahunAkademik->status ?? null,
                    'semester' => $kurikulumMataPelajaran->tahunAkademik->semester ?? null,
                    'status_semester' => $kurikulumMataPelajaran->tahunAkademik->status ?? null,
                ],    
            ],
        ];            

        return ApiResponse::success($formatted, 'Detail jadwal siswa berhasil diambil');
    }    


    // ✅ untuk siswa
    public function showAllJadwalSendiri() {
        $siswa = Auth::guard('siswa')->user();

        $jadwal = SiswaJadwalPelajaran::with([
            'siswa',
            'jurusan',
            'jadwalPelajaran.mataPelajaran',
            'jadwalPelajaran.guru',
            'jadwalPelajaran.kelas'
        ])
        ->where('siswa_id', $siswa->id)
        ->get();

        $hasil = $jadwal->map(function ($item) {

            $jadwalPelajaran = $item->jadwalPelajaran;
            $kurmap = $jadwalPelajaran->kurikulumMataPelajaran;

            return [
                'siswa_jadwal_pelajaran_id' => $item->id ?? null,
                'siswa_id' => $item->siswa_id ?? null,
                'jadwal_pelajaran_id' => $jadwalPelajaran->id ?? null,
                'guru' => $jadwalPelajaran->guru->nama ?? null,        
                'hari' => $jadwalPelajaran->hari ?? null,        
                'kelas_id' => $jadwalPelajaran->kelas->id ?? null,        
                'nama_kelas' => $jadwalPelajaran->kelas->nama_kelas ?? null,        
                'jam_mulai' => $jadwalPelajaran->jam_mulai ?? null,        
                'jam_selesai' => $jadwalPelajaran->jam_selesai ?? null,        
                'ruangan' => $jadwalPelajaran->ruangan ?? null,        
                'link_opsional' => $jadwalPelajaran->link_opsional ?? null,   
                
                'kurikulum_mata_pelajaran' => [
                    'kurikulum_mata_pelajaran_id' => $kurmap->id ?? null,

                    'kurikulum_id' => $kurmap->kurikulum->id ?? null,
                    'nama_kurikulum' => $kurmap->kurikulum->nama_kurikulum ?? null,

                    'mata_pelajaran_id' => $kurmap->mataPelajaran->id ?? null,
                    'nama_mata_pelajaran' => $kurmap->mataPelajaran->nama_pelajaran ?? null,
                    
                    'jurusan_pelajaran' => $kurmap->jurusan->nama_jurusan ?? null,
                                        
                    'tingkat' => $kurmap->tingkat ?? null,
                    'status_mata_pelajaran' => $kurmap->status_mata_pelajaran ?? null,

                    'tahun_akademik_id' => $kurmap->tahunAkademik->id ?? null,
                    'tahun_akademik' => $kurmap->tahunAkademik->tahun_akademik ?? null,
                    'status_tahun_akademik' => $kurmap->tahunAkademik->status ?? null,
                    'semester' => $kurmap->tahunAkademik->semester ?? null,
                    'status_semester' => $kurmap->tahunAkademik->status ?? null,
                ],
            ];
        });

        return response()->json([
            'status'       => 'success',
            'message'         => 'Semua jadwal '.$siswa->nama.' berhasil diambil',
            'total_jadwal' => $hasil->count(),
            'data'         => $hasil
        ]);
    }


    /**
     * ✅ Update untuk super admin
     */
    public function update(Request $request, $id)
    {
        $siswaJadwalPelajaran = SiswaJadwalPelajaran::find($id);

        if (!$siswaJadwalPelajaran) {
            return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            // ⚠️ Ini inputannya untuk update @Ryan
            'jadwal_pelajaran_id' => 'sometimes|required|exists:jadwal_pelajarans,id',
        ], [
            'jadwal_pelajaran_id.required' => 'Jadwal pelajaran wajib diisi',
            'jadwal_pelajaran_id.exists' => 'Jadwal pelajaran tidak ditemukan',
        ]);

       // Update hanya jadwal_pelajaran_id, siswa_id tidak boleh diubah
        $siswaJadwalPelajaran->update([
            'jadwal_pelajaran_id' => $validated['jadwal_pelajaran_id']
        ]);

        // ambil siswa lengkap
        $siswaJadwalPelajaran->load('siswa', 'jurusan', 'jadwalPelajaran.mataPelajaran');

        return ApiResponse::success(
            [
                'id' => $siswaJadwalPelajaran->id ?? null,
                'nama_siswa' => $siswaJadwalPelajaran->siswa->nama ?? null,
                'mata_pelajaran' => $siswaJadwalPelajaran->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,
                'hari' => $siswaJadwalPelajaran->jadwalPelajaran->hari ?? null,
                'guru' => $siswaJadwalPelajaran->jadwalPelajaran->guru->nama ?? null,
                'kelas' => $siswaJadwalPelajaran->jadwalPelajaran->kelas->nama_kelas ?? null,
                'jam_mulai' => $siswaJadwalPelajaran->jadwalPelajaran->jam_mulai ?? null,
                'jam_selesai' => $siswaJadwalPelajaran->jadwalPelajaran->jam_selesai ?? null,
                'ruangan' => $siswaJadwalPelajaran->jadwalPelajaran->ruangan ?? null,
                'link_opsional' => $siswaJadwalPelajaran->jadwalPelajaran->link_opsional ?? null,
            ],
            'Jadwal siswa berhasil diperbarui'
        );
    }

    /**
     * ✅ Untuk spa
     */
    public function destroy(string $id)
    {
        $matpel = SiswaJadwalPelajaran::find($id);
        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $matpel->delete();
        return ApiResponse::success(null, 'Jadwal pelajaran siswa berhasil dihapus');
    }
}
