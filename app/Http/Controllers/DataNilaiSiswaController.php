<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DataNilaiSiswa;
use App\Models\Siswa;
use Illuminate\Validation\Rule;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class DataNilaiSiswaController extends Controller
{
    /**
     * ✅ show all data siswa dan nilainya oleh spa/guru
     */
    public function index()
    {           
        $siswa = Siswa::with('ekstrakurikulers', 'kelas', 'jurusan', 'pengajar', 'prestasis', 'nilaiSiswa', 'absensis.mataPelajaran')->get();
        
        $formatted = $siswa->map(function ($item) {
            return [
                'siswa_id' => $item->id ?? null,
                'data_nilai_id' => $item->nilaiSiswa->id ?? null,
                'nama_siswa' => $item->nama ?? null,
                'nama_kelas' => $item->kelas->nama_kelas ?? null,
                'nama_jurusan' => $item->jurusan->nama_jurusan ?? null,
                'total_hadir' => $item->absensis->where('status', 'hadir')->count() ?? null,
                'total_izin' => $item->absensis->where('status', 'izin')->count() ?? null,
                'total_sakit' => $item->absensis->where('status', 'sakit')->count() ?? null,
                'total_alfa' => $item->absensis->where('status', 'alfa')->count() ?? null,
                'point_absensi' => $item->nilaiSiswa->point_absensi ?? null,
                'point_tugas' => $item->nilaiSiswa->point_tugas ?? null,
                'point_uts' => $item->nilaiSiswa->point_uts ?? null,
                'point_uas' => $item->nilaiSiswa->point_uas ?? null,
                'point_ekskul' => $item->nilaiSiswa->point_ekskul ?? null,
                'absensi' => $item->absensis->map(function ($absen) {
                    return [
                        'absensi_id' => $absen->id ?? null,
                        'mata_pelajaran' => $absen->mataPelajaran->nama_pelajaran ?? null,
                        'hari' => Carbon::parse($absen->hari)->translatedFormat('l, d F Y') ?? null,
                        'status' => $absen->status ?? null,
                        'bukti' => $absen->bukti ? asset(str_replace('public/', 'storage/', $absen->bukti)) : null,
                    ];
                }),
                'prestasi' => $item->prestasis->map(function ($prestasi) {
                    return [
                        'prestasi_id' => $prestasi->id ?? null,
                        'nama_prestasi' => $prestasi->prestasi_diraih ?? null,
                    ];
                }),                
                'ekskul' => $item->ekstrakurikulers->map(function ($ekskul) {
                    return [
                        'ekskul_id' => $ekskul->id ?? null,
                        'ekskul_pivot_id' => $ekskul->pivot->id ?? null,
                        'nama_ekskul' => $ekskul->nama_ekstrakurikuler ?? null,
                        'sikap' => $ekskul->pivot->sikap ?? null,
                    ];
                }),
            ];
        });

        return ApiResponse::success($formatted, 'Daftar nilai siswa berhasil diambil');
    
    }

    /**
     * ✅ untuk spa/guru
     */
    public function store(Request $request)
    {
        $user = Auth::guard('kepegawaian')->user();

        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id|unique:data_nilai_siswa,siswa_id',
                'point_absensi' => 'required|numeric',
                'point_tugas' => 'required|numeric',
                'point_uts' => 'required|numeric',
                'point_uas' => 'required|numeric',
                'point_ekskul' => 'required|numeric',
            ], [
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'siswa_id.unique' => 'Siswa sudah ada di tabel nilai',
                
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
            ]);            
            
        if (!in_array($user->role, ['guru', 'super_admin'])) {
            return ApiResponse::error('Kesalahan', [
                'pesan' => ['Anda tidak berhak menentukan nilai siswa']
            ], 403);
        }            
    
        $nilai = DataNilaiSiswa::create($validated);

        $siswa = Siswa::with('ekstrakurikulers', 'kelas', 'jurusan', 'pengajar', 'prestasis', 'nilaiSiswa', 'absensis.mataPelajaran')->find($validated['siswa_id']);        

        $formatted = [
            'siswa_id' => $siswa->id ?? null,
            'data_nilai_id' => $siswa->nilaiSiswa->id ?? null,
            'nama_siswa' => $siswa->nama ?? null,
            'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
            'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
            'total_hadir' => $siswa->absensis->where('status', 'hadir')->count() ?? null,
            'total_izin' => $siswa->absensis->where('status', 'izin')->count() ?? null,
            'total_sakit' => $siswa->absensis->where('status', 'sakit')->count() ?? null,
            'total_alfa' => $siswa->absensis->where('status', 'alfa')->count() ?? null,
            'point_absensi' => $siswa->nilaiSiswa->point_absensi ?? null,
            'point_tugas' => $siswa->nilaiSiswa->point_tugas ?? null,
            'point_uts' => $siswa->nilaiSiswa->point_uts ?? null,
            'point_uas' => $siswa->nilaiSiswa->point_uas ?? null,
            'point_ekskul' => $siswa->nilaiSiswa->point_ekskul ?? null,
            'absensi' => $siswa->absensis->map(function ($absen) {
                return [
                    'absensi_id' => $absen->id ?? null,
                    'mata_pelajaran' => $absen->mataPelajaran->nama_pelajaran ?? null,
                    'hari' => Carbon::parse($absen->hari)->translatedFormat('l, d F Y') ?? null,
                    'status' => $absen->status ?? null,
                    'bukti' => $absen->bukti ? asset(str_replace('public/', 'storage/', $absen->bukti)) : null,
                ];
            }),
            'prestasi' => $siswa->prestasis->map(function ($prestasi) {
                return [
                    'prestasi_id' => $prestasi->id ?? null,
                    'nama_prestasi' => $prestasi->prestasi_diraih ?? null,
                ];
            }),                
            'ekskul' => $siswa->ekstrakurikulers->map(function ($ekskul) {
                return [
                    'ekskul_id' => $ekskul->id ?? null,
                    'ekskul_pivot_id' => $ekskul->pivot->id ?? null,
                    'nama_ekskul' => $ekskul->nama_ekstrakurikuler ?? null,
                    'sikap' => $ekskul->pivot->sikap ?? null,
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
    public function show(string $id)
    {
        $siswa = Siswa::with('ekstrakurikulers', 'kelas', 'jurusan', 'pengajar', 'prestasis', 'nilaiSiswa', 'absensis.mataPelajaran')->find($id);

        if (!$siswa) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        $formatted = [
            'siswa_id' => $siswa->id ?? null,
            'data_nilai_id' => $siswa->nilaiSiswa->id ?? null,
            'nama_siswa' => $siswa->nama ?? null,
            'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
            'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
            'total_hadir' => $siswa->absensis->where('status', 'hadir')->count() ?? null,
            'total_izin' => $siswa->absensis->where('status', 'izin')->count() ?? null,
            'total_sakit' => $siswa->absensis->where('status', 'sakit')->count() ?? null,
            'total_alfa' => $siswa->absensis->where('status', 'alfa')->count() ?? null,
            'point_absensi' => $siswa->nilaiSiswa->point_absensi ?? null,
            'point_tugas' => $siswa->nilaiSiswa->point_tugas ?? null,
            'point_uts' => $siswa->nilaiSiswa->point_uts ?? null,
            'point_uas' => $siswa->nilaiSiswa->point_uas ?? null,
            'point_ekskul' => $siswa->nilaiSiswa->point_ekskul ?? null,
            'absensi' => $siswa->absensis->map(function ($absen) {
                return [
                    'absensi_id' => $absen->id ?? null,
                    'mata_pelajaran' => $absen->mataPelajaran->nama_pelajaran ?? null,
                    'hari' => Carbon::parse($absen->hari)->translatedFormat('l, d F Y') ?? null,
                    'status' => $absen->status ?? null,
                    'bukti' => $absen->bukti ? asset(str_replace('public/', 'storage/', $absen->bukti)) : null,
                ];
            }),
            'prestasi' => $siswa->prestasis->map(function ($prestasi) {
                return [
                    'prestasi_id' => $prestasi->id ?? null,
                    'nama_prestasi' => $prestasi->prestasi_diraih ?? null,
                ];
            }),                
            'ekskul' => $siswa->ekstrakurikulers->map(function ($ekskul) {
                return [
                    'ekskul_id' => $ekskul->id ?? null,
                    'ekskul_pivot_id' => $ekskul->pivot->id ?? null,
                    'nama_ekskul' => $ekskul->nama_ekstrakurikuler ?? null,
                    'sikap' => $ekskul->pivot->sikap ?? null,
                ];
            }),
        ];

        return ApiResponse::success($formatted, 'Detail nilai berhasil diambil');
    }

    /**
     * ✅ untuk spa/guru
     */
    public function update(Request $request, string $id)
    {
        $nilai = DataNilaiSiswa::find($id);

        if (!$nilai) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'point_absensi' => 'sometimes|required|numeric',            
            'point_tugas' => 'sometimes|required|numeric',            
            'point_uts' => 'sometimes|required|numeric',            
            'point_uas' => 'sometimes|required|numeric',            
            'point_ekskul' => 'sometimes|required|numeric',            
        ], [
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
        ]);

        $nilai->update(
            [
                'siswa_id' => $nilai->siswa_id ?? null,
                'point_absensi' => $validated['point_absensi'] ?? null,
                'point_tugas' => $validated['point_tugas'] ?? null,
                'point_uts' => $validated['point_uts'] ?? null,
                'point_uas' => $validated['point_uas'] ?? null,
                'point_ekskul' => $validated['point_ekskul'] ?? null,
            ]
        );
        
        $siswa = Siswa::with('ekstrakurikulers', 'kelas', 'jurusan', 'pengajar', 'prestasis', 'nilaiSiswa', 'absensis.mataPelajaran')->find($nilai['siswa_id']);        

        $formatted = [
            'siswa_id' => $siswa->id ?? null,
            'data_nilai_id' => $siswa->nilaiSiswa->id ?? null,
            'nama_siswa' => $siswa->nama ?? null,
            'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
            'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
            'total_hadir' => $siswa->absensis->where('status', 'hadir')->count() ?? null,
            'total_izin' => $siswa->absensis->where('status', 'izin')->count() ?? null,
            'total_sakit' => $siswa->absensis->where('status', 'sakit')->count() ?? null,
            'total_alfa' => $siswa->absensis->where('status', 'alfa')->count() ?? null,
            'point_absensi' => $siswa->nilaiSiswa->point_absensi ?? null,
            'point_tugas' => $siswa->nilaiSiswa->point_tugas ?? null,
            'point_uts' => $siswa->nilaiSiswa->point_uts ?? null,
            'point_uas' => $siswa->nilaiSiswa->point_uas ?? null,
            'point_ekskul' => $siswa->nilaiSiswa->point_ekskul ?? null,
            'absensi' => $siswa->absensis->map(function ($absen) {
                return [
                    'absensi_id' => $absen->id ?? null,
                    'mata_pelajaran' => $absen->mataPelajaran->nama_pelajaran ?? null,
                    'hari' => Carbon::parse($absen->hari)->translatedFormat('l, d F Y') ?? null,
                    'status' => $absen->status ?? null,
                    'bukti' => $absen->bukti ? asset(str_replace('public/', 'storage/', $absen->bukti)) : null,
                ];
            }),
            'prestasi' => $siswa->prestasis->map(function ($prestasi) {
                return [
                    'prestasi_id' => $prestasi->id ?? null,
                    'nama_prestasi' => $prestasi->prestasi_diraih ?? null,
                ];
            }),                
            'ekskul' => $siswa->ekstrakurikulers->map(function ($ekskul) {
                return [
                    'ekskul_id' => $ekskul->id ?? null,
                    'ekskul_pivot_id' => $ekskul->pivot->id ?? null,
                    'nama_ekskul' => $ekskul->nama_ekstrakurikuler ?? null,
                    'sikap' => $ekskul->pivot->sikap ?? null,
                ];
            }),
        ];

        return ApiResponse::success($formatted, 'Data nilai berhasil diupdate');
    }

    /**
     * ✅ untuk spa
     */
    public function destroy(string $id)
    {
        $nilai = DataNilaiSiswa::find($id);

        if (!$nilai) {
            return ApiResponse::error('Missing', ['id' => 'Data tidak ditemukan']);
        }

        $nilai->delete();

        return ApiResponse::success('null', 'Data berhasil dihapus');
    }
}
