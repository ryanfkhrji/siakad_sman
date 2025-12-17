<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataNilaiSiswa;
use App\Models\JadwalPelajaran;
use App\Models\Siswa;
use Illuminate\Validation\Rule;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DataNilaiSiswaController extends Controller
{
    // ✅ untuk spa
    public function All() 
    {
        $nilai = DataNilaiSiswa::with('siswa.kelas', 'jurusan', 'siswa.jurusan', 'siswa.prestasis', 'mataPelajaran', 'guru')->get();

        if ($nilai->isEmpty()) {
            return ApiResponse::error('Not found', ['Data tidak ditemukan']);
        }
        
        $formatted = $nilai
            ->groupBy(function ($item) {
                return $item->mata_pelajaran_id . '-' . $item->jurusan_pelajaran_id;
            })
            ->map(function ($data) {

                $first = $data->first();

                return [
                    'mata_pelajaran_id'      => $first->mataPelajaran->id,
                    'nama_pelajaran'         => $first->mataPelajaran->nama_pelajaran,

                    'jurusan_pelajaran_id'   => $first->jurusan->id,
                    'nama_jurusan_pelajaran' => $first->jurusan->nama_jurusan,

                    'guru_id'                => $first->guru->id,
                    'nama_guru'              => $first->guru->nama,

                    'nilai' => $data->map(function ($item) {
                        return [
                            'data_nilai_id' => $item->id,

                            'siswa_id'      => $item->siswa->id,
                            'nama_siswa'    => $item->siswa->nama,

                            'jurusan_siswa_id'   => $item->siswa->jurusan->id,
                            'nama_jurusan_siswa' => $item->siswa->jurusan->nama_jurusan,

                            'kelas_siswa_id' => $item->siswa->kelas->id,
                            'nama_kelas_siswa' => $item->siswa->kelas->nama_kelas,

                            'point_absensi' => $item->point_absensi,
                            'point_tugas'   => $item->point_tugas,
                            'point_uts'     => $item->point_uts,
                            'point_uas'     => $item->point_uas,
                            'point_ekskul'  => $item->point_ekskul,
                            'sikap'         => $item->sikap,

                            'prestasi' => $item->siswa->prestasis->map(function ($prestasi) {
                                return [
                                    'prestasi_id'   => $prestasi->id,
                                    'nama_prestasi' => $prestasi->prestasi_diraih,
                                ];
                            })->values(),
                        ];
                    })->values()
                ];
            })->values();

        return ApiResponse::success($formatted, ['Data nilai berhasil ditampilkan']);
    }

    // ✅ filter hanya milik guru tertentu (untuk guru)
    public function index() {

        $user = Auth::guard('kepegawaian')->user();

        $matpel = JadwalPelajaran::where('guru_id', $user->id)->first();

        $nilai = DataNilaiSiswa::with('siswa.kelas', 'siswa.jurusan', 'siswa.prestasis')->where('mata_pelajaran_id', $matpel->mata_pelajaran_id)->get();

        if ($nilai == null) {
            return ApiResponse::error('Not found', ['Data tidak ditemukan']);
        }
        
        $formatted = $nilai->map(function ($data) {
            return [
                'data_nilai_id'     => $data->id,

                'siswa_id'          => $data->siswa->id,
                'nama_siswa'        => $data->siswa->nama,
                'jurusan_siswa_id'  => $data->siswa->jurusan->id,
                'nama_jurusan_siswa'  => $data->siswa->jurusan->nama_jurusan,
                'kelas_siswa_id'    => $data->siswa->kelas->id,
                'nama_kelas_siswa'  => $data->siswa->kelas->nama_kelas,

                'mata_pelajaran_id' => $data->mataPelajaran->id,
                'nama_pelajaran'    => $data->mataPelajaran->nama_pelajaran,
                'jurusan_pelajaran_id' => $data->jurusan_pelajaran_id,
                'nama_jurusan_pelajaran' => $data->jurusan->nama_jurusan,
                'guru_id'           => $data->guru_id,
                'nama_guru'         => $data->guru->nama,

                'point_absensi' => $data->point_absensi,
                'point_tugas'   => $data->point_tugas,
                'point_uts'     => $data->point_uts,
                'point_uas'     => $data->point_uas,
                'point_ekskul'  => $data->point_ekskul,
                'sikap'         => $data->sikap,

                'prestasi' => $data->siswa->prestasis->map(function ($prestasi) {
                    return [
                        'prestasi_id' => $prestasi->id ?? null,
                        'nama_prestasi' => $prestasi->prestasi_diraih ?? null,
                    ];
                }),
            ];
        });

        return ApiResponse::success($formatted, ['Data nilai berhasil ditampilkan']);
    }

    /**
     * ✅ untuk guru
     */
    public function store(Request $request)
    {
        $user = Auth::guard('kepegawaian')->user();

        $matpel = JadwalPelajaran::where('guru_id', $user->id)->first();

        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',
                'jurusan_pelajaran_id' => 'required|exists:jurusans,id',
                'point_absensi' => 'required|numeric',
                'point_tugas' => 'required|numeric',
                'point_uts' => 'required|numeric',
                'point_uas' => 'required|numeric',
                'point_ekskul' => 'required|numeric',
                'sikap' => 'nullable|in:Sangat Baik,Baik,Cukup,Kurang',
            ], [
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',

                'jurusan_pelajaran_id.required' => 'Jurusan pelajaran wajib diisi',
                'jurusan_pelajaran_id.exists' => 'Jurusan pelajaran tidak ditemukan',
                
                'point_absensi.required' => 'Point absensi wajib diisi',
                'point_absensi.numeric' => 'Wajib diisi angka',

                'point_tugas.required' => 'Point tugas wajib diisi',
                'point_tugas.numeric' => 'Wajib diisi angka',
                
                'point_uts.required' => 'Point uts wajib diisi',
                'point_uts.numeric' => 'Wajib diisi angka',
                
                'point_uas.required' => 'Point uas wajib diisi',
                'point_uas.numeric' => 'Wajib diisi angka',
                
                'point_ekskul.required' => 'Point ekskul wajib diisi',
                'point_ekskul.numeric' => 'Wajib diisi angka',

                'sikap.in' => 'Pilihan hanya Sangat Baik, Baik, Cukup, Kurang'
            ]);            
            
        if (!in_array($user->role, ['guru', 'super_admin'])) {
            return ApiResponse::error('Kesalahan', [
                'pesan' => ['Anda tidak berhak menentukan nilai siswa']
            ], 403);
        }            

        $sama = DataNilaiSiswa::where('mata_pelajaran_id', $matpel->mata_pelajaran_id)
            ->where('siswa_id', $validated['siswa_id'])
            ->where('jurusan_pelajaran_id', $validated['jurusan_pelajaran_id'])
            ->first();

        if ($sama != null) {
            return ApiResponse::error('Duplicated', ['Pesan' => 'Siswa dengan mata pelajaran dan jurusan ini sudah ada']);
        }
    
        $nilai = DataNilaiSiswa::create([
            'siswa_id' => $validated['siswa_id'],
            'jurusan_pelajaran_id' => $validated['jurusan_pelajaran_id'],
            'mata_pelajaran_id' => $matpel->mata_pelajaran_id,
            'guru_id' => $user->id,
            'point_absensi' => $validated['point_absensi'],
            'point_tugas' => $validated['point_tugas'],
            'point_uts' => $validated['point_uts'],
            'point_uas' => $validated['point_uas'],
            'point_ekskul' => $validated['point_ekskul'],
            'sikap' => $validated['sikap'],
        ]);

        $nilai->load('siswa.prestasis', 'siswa.kelas', 'siswa.jurusan', 'mataPelajaran', 'jurusan', 'guru');

        $formatted = [
            'data_nilai_id'     => $nilai->id,
            'siswa_id'          => $nilai->siswa->id,
            'nama_siswa'        => $nilai->siswa->nama,
            'jurusan_siswa_id'  => $nilai->siswa->jurusan->id,
            'nama_jurusan_siswa'  => $nilai->siswa->jurusan->nama_jurusan,
            'kelas_siswa_id'    => $nilai->siswa->kelas->id,
            'nama_kelas_siswa'  => $nilai->siswa->kelas->nama_kelas,
            'mata_pelajaran_id' => $nilai->mataPelajaran->id,
            'nama_pelajaran'    => $nilai->mataPelajaran->nama_pelajaran,
            'jurusan_pelajaran_id' => $nilai->jurusan_pelajaran_id,
            'nama_jurusan_pelajaran' => $nilai->jurusan->nama_jurusan,
            'guru_id'           => $user->id,
            'nama_guru'         => $nilai->guru->nama,

            'point_absensi' => $nilai->point_absensi,
            'point_tugas'   => $nilai->point_tugas,
            'point_uts'     => $nilai->point_uts,
            'point_uas'     => $nilai->point_uas,
            'point_ekskul'  => $nilai->point_ekskul,
            'sikap'         => $nilai->sikap,

            'prestasi' => $nilai->siswa->prestasis->map(function ($prestasi) {
                return [
                    'prestasi_id' => $prestasi->id ?? null,
                    'nama_prestasi' => $prestasi->prestasi_diraih ?? null,
                ];
            }),
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ untuk spa/guru
     */
    public function show(Request $request, string $siswaId)
    {
        // ambil request di params, masukkan ke body
        $request->merge($request->query());

        $request->validate([
            'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
            'jurusan_pelajaran_id' => 'required|exists:jurusans,id',
        ], [
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
            'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
            'jurusan_pelajaran_id.required' => 'Jurusan pelajaran wajib diisi',
            'jurusan_pelajaran_id.exists' => 'Jurusan pelajaran tidak ditemukan'
        ]);
    
        $data = DataNilaiSiswa::with([
            'siswa.prestasis',
            'siswa.kelas',
            'siswa.jurusan',
            'mataPelajaran',
            'jurusan',
            'guru'
        ])
        ->where('siswa_id', $siswaId)
        ->where('mata_pelajaran_id', $request->mata_pelajaran_id)
        ->where('jurusan_pelajaran_id', $request->jurusan_pelajaran_id)
        ->first();

        if (!$data) {
            return ApiResponse::error(
                'Not found',
                ['data' => ['Data nilai siswa tidak ditemukan']],
                404
            );
        }
    
        $formatted = [
            'data_nilai_id'     => $data->id,

            'siswa_id'          => $data->siswa->id,
            'nama_siswa'        => $data->siswa->nama,
            'jurusan_siswa_id'  => $data->siswa->jurusan->id,
            'nama_jurusan_siswa'  => $data->siswa->jurusan->nama_jurusan,
            'kelas_siswa_id'    => $data->siswa->kelas->id,
            'nama_kelas_siswa'  => $data->siswa->kelas->nama_kelas,

            'mata_pelajaran_id' => $data->mataPelajaran->id,
            'nama_pelajaran'    => $data->mataPelajaran->nama_pelajaran,
            'jurusan_pelajaran_id' => $data->jurusan_pelajaran_id,
            'nama_jurusan_pelajaran' => $data->jurusan->nama_jurusan,
            'guru_id'           => $data->guru_id,
            'nama_guru'         => $data->guru->nama,

            'point_absensi' => $data->point_absensi,
            'point_tugas'   => $data->point_tugas,
            'point_uts'     => $data->point_uts,
            'point_uas'     => $data->point_uas,
            'point_ekskul'  => $data->point_ekskul,
            'sikap'         => $data->sikap,

            'prestasi' => $data->siswa->prestasis->map(function ($prestasi) {
                return [
                    'prestasi_id' => $prestasi->id ?? null,
                    'nama_prestasi' => $prestasi->prestasi_diraih ?? null,
                ];
            }),
        ];
    
        return ApiResponse::success($formatted, 'Detail nilai berhasil diambil');
    }
    

    /**
     * ✅ untuk guru
     */
    public function update(Request $request, string $id)
    {
        $nilai = DataNilaiSiswa::find($id);

        $user = Auth::guard('kepegawaian')->user();

        if (!$nilai) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'jurusan_pelajaran_id' => 'sometimes|required|exists:jurusans,id',            
            'point_absensi' => 'sometimes|required|numeric',            
            'point_tugas' => 'sometimes|required|numeric',            
            'point_uts' => 'sometimes|required|numeric',            
            'point_uas' => 'sometimes|required|numeric',            
            'point_ekskul' => 'sometimes|required|numeric',            
            'sikap' => 'nullable|in:Sangat Baik,Baik,Cukup,Kurang',
        ], [
            'jurusan_pelajaran_id.exists' => 'Jurusan tidak ditemukan',

            'point_absensi.required' => 'Point absensi wajib diisi',
            'point_absensi.numeric' => 'Wajib diisi angka',

            'point_tugas.required' => 'Point tugas wajib diisi',
            'point_tugas.numeric' => 'Wajib diisi angka',
                
            'point_uts.required' => 'Point uts wajib diisi',
            'point_uts.numeric' => 'Wajib diisi angka',
                
            'point_uas.required' => 'Point uas wajib diisi',
            'point_uas.numeric' => 'Wajib diisi angka',
                
            'point_ekskul.required' => 'Point ekskul wajib diisi',
            'point_ekskul.numeric' => 'Wajib diisi angka',

            'sikap.in' => 'Pilihan hanya Sangat Baik, Baik, Cukup, Kurang'
        ]);

        if (!in_array($user->role, ['guru', 'super_admin'])) {
            return ApiResponse::error('Kesalahan', [
                'pesan' => ['Anda tidak berhak menentukan nilai siswa']
            ], 403);
        }            

        $sama = DataNilaiSiswa::where('mata_pelajaran_id', $nilai->mata_pelajaran_id)
            ->where('siswa_id', $nilai->siswa_id)
            ->where('jurusan_pelajaran_id', $validated['jurusan_pelajaran_id'])
            ->first();

        if ($sama != null) {
            return ApiResponse::error('Duplicated', ['Pesan' => 'Siswa dengan mata pelajaran dan jurusan ini sudah ada']);
        }

        // yang tidak boleh diubah: siswa_id, mata_pelajaran_id, guru_id
        $nilai->update(
            [
                'siswa_id' => $nilai->siswa_id ?? null,
                'mata_pelajaran_id' => $nilai->mata_pelajaran_id ?? null,
                'guru_id' => $nilai->guru_id ?? null,
                'jurusan_pelajaran_id' => $validated['jurusan_pelajaran_id'] ?? null,
                'point_absensi' => $validated['point_absensi'] ?? null,
                'point_tugas' => $validated['point_tugas'] ?? null,
                'point_uts' => $validated['point_uts'] ?? null,
                'point_uas' => $validated['point_uas'] ?? null,
                'point_ekskul' => $validated['point_ekskul'] ?? null,
                'sikap' => $validated['sikap'] ?? null,
            ]
        );
        
        $nilai->load('siswa.prestasis', 'siswa.kelas', 'siswa.jurusan', 'mataPelajaran', 'jurusan', 'guru');

        $formatted = [
            'data_nilai_id'     => $nilai->id,
            'siswa_id'          => $nilai->siswa->id,
            'nama_siswa'        => $nilai->siswa->nama,
            'jurusan_siswa_id'  => $nilai->siswa->jurusan->id,
            'nama_jurusan_siswa'  => $nilai->siswa->jurusan->nama_jurusan,
            'kelas_siswa_id'    => $nilai->siswa->kelas->id,
            'nama_kelas_siswa'  => $nilai->siswa->kelas->nama_kelas,
            'mata_pelajaran_id' => $nilai->mataPelajaran->id,
            'nama_pelajaran'    => $nilai->mataPelajaran->nama_pelajaran,
            'jurusan_pelajaran_id' => $nilai->jurusan_pelajaran_id,
            'nama_jurusan_pelajaran' => $nilai->jurusan->nama_jurusan,
            'guru_id'           => $nilai->guru_id,
            'nama_guru'         => $nilai->guru->nama,

            'point_absensi' => $nilai->point_absensi,
            'point_tugas'   => $nilai->point_tugas,
            'point_uts'     => $nilai->point_uts,
            'point_uas'     => $nilai->point_uas,
            'point_ekskul'  => $nilai->point_ekskul,
            'sikap'         => $nilai->sikap,

            'prestasi' => $nilai->siswa->prestasis->map(function ($prestasi) {
                return [
                    'prestasi_id' => $prestasi->id ?? null,
                    'nama_prestasi' => $prestasi->prestasi_diraih ?? null,
                ];
            }),
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil diupdate');
    }

    /**
     * ✅ untuk guru
     * Remove the specified resource from storage.
     * Beberapa data = DELETE /pegawai/data-nilai-siswa/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /pegawai/data-nilai-siswa/destroy?ids=7
     */ 
    public function destroyData(Request $request)
    {
        $ids = $request->ids;        

        // HAPUS BEBERAPA DATA
        if (is_array($ids)) {
            $validIds = DataNilaiSiswa::whereIn('id', $ids)->pluck('id')->toArray();
            $invalidIds = array_diff($ids, $validIds);

            // Jika terdapat id yang tidak ada
            if (!empty($invalidIds)) {
                return response()->json([
                    'message' => 'Beberapa ID tidak ditemukan.',
                    'invalid_ids' => array_values($invalidIds)
                ], 404);
            }

            DataNilaiSiswa::whereIn('id', $validIds)->delete();
            return response()->json([
                'message' => 'Beberapa data nilai siswa berhasil dihapus.',
                'deleted_ids' => $validIds
            ]);
        }

        // HAPUS SATU DATA
        if (is_numeric($ids)) {
            $absensi = DataNilaiSiswa::find($ids);

            if (!$absensi) {
                return response()->json([
                    'message' => 'Data tidak ditemukan.',
                    'invalid_id' => $ids
                ], 404);
            }

            $absensi->delete();
            return response()->json([
                'message' => 'Data nilai siswa berhasil dihapus.',
                'deleted_id' => $ids
            ]);
        }

        return response()->json([
            'message' => 'Parameter ids tidak valid. Kirimkan satu id, atau array id.'
        ], 422);
    }


    // ! tinggal export data ke excel
}
