<?php

namespace App\Http\Controllers;

use App\Models\AbsensiSiswa;
use App\Models\SiswaJadwalPelajaran;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use File;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use App\Exports\AbsensiSiswaExport;

class AbsensiSiswaController extends Controller
{
    /**
     * ✅ Untuk spa
     */
    public function index()
    {
        $absensi = AbsensiSiswa::with([
            'siswa.kelas',
            'jadwalPelajaran.mataPelajaran',
            'tahunAkademik'
        ])
        ->orderBy('hari')
        ->get();

        if ($absensi->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Data absensi tidak ditemukan'
            ]);
        }

        $result = $absensi
            ->groupBy('siswa_id')
            ->map(function ($absenSiswa) {

                $siswa = $absenSiswa->first()->siswa;

                return [
                    'siswa_id'   => $siswa->id,
                    'nama_siswa' => $siswa->nama,
                    'kelas'      => $siswa->kelas->nama_kelas ?? null,

                    // 🔹 GROUP BERDASARKAN STRING TAHUN AKADEMIK
                    'absensi' => $absenSiswa
                        ->groupBy(fn ($abs) => $abs->tahunAkademik->tahun_akademik)
                        ->map(function ($absenPerTahun, $tahunAkademik) {

                            // 🔹 GROUP PER SEMESTER
                            $semester = $absenPerTahun
                                ->groupBy(fn ($abs) => $abs->tahunAkademik->semester)
                                ->map(function ($absenSemester, $semester) {

                                    return [
                                        'semester' => $semester,

                                        // TOTAL PER SEMESTER
                                        'total' => [
                                            'hadir' => $absenSemester->where('status', 'hadir')->count(),
                                            'izin'  => $absenSemester->where('status', 'izin')->count(),
                                            'sakit' => $absenSemester->where('status', 'sakit')->count(),
                                            'alfa'  => $absenSemester->where('status', 'alfa')->count(),
                                        ],

                                        // 🔹 RINCIAN PER MAPEL
                                        'rincian' => $absenSemester
                                            ->groupBy('jadwal_pelajaran_id')
                                            ->map(function ($absenMapel) {

                                                $mapel = $absenMapel->first()
                                                    ->jadwalPelajaran
                                                    ->mataPelajaran;

                                                return [
                                                    'mata_pelajaran' =>
                                                        $mapel->nama_pelajaran ?? null,

                                                    'detail' => $absenMapel->map(function ($abs) {
                                                        return [
                                                            'hari' => Carbon::parse($abs->hari)
                                                                ->translatedFormat('l, d F Y'),
                                                            'status' => $abs->status,
                                                            'bukti' => $abs->bukti
                                                                ? asset(str_replace(
                                                                    'public/',
                                                                    'storage/',
                                                                    $abs->bukti
                                                                ))
                                                                : null,
                                                        ];
                                                    })->values(),
                                                ];
                                            })->values(),
                                    ];
                                })->values();

                            return [
                                'tahun_akademik' => $tahunAkademik,
                                'status_tahun_akademik' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                                'semester' => $semester,
                                'status_semester' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                            ];
                        })->values(),
                ];
            })->values();

        return ApiResponse::success($result, 'Semua absensi berhasil diambil');
    }


    private function simpanFoto($file, $folder, $nama_siswa)
    {
        $extension = $file->getClientOriginalExtension();
        $uuid = substr(Str::uuid(), 0, 3);
        $namaSiswaSlug = Str::slug($nama_siswa, '-');

        $disk = 'public';
        $subfolder = 'bukti';
        $namaFile = "{$uuid}-{$namaSiswaSlug}.{$extension}";

        // Simpan file di dalam subfolder
        $path = $file->storeAs($subfolder, $namaFile, $disk);

        // Simpan path lengkap dengan prefix disk di database
        return "{$disk}/{$path}";
    }


    /**
     * ✅ untuk siswa
     */
    public function store(Request $request)
    {
        Carbon::setLocale('id');

        $siswa = Auth::guard('siswa')->user();

        try {
            $validated = $request->validate([          
                // @Ryan...Yang kelas, jadwal pelajaran, dan tahun akademik terisi otomatis
                'kelas_id' => 'required|exists:kelas,id', // dari SiswaJadwalPelajaranController::showAllJadwalSendiri
                'jadwal_pelajaran_id' => 'required|exists:jadwal_pelajarans,id', // dari SiswaJadwalPelajaranController::showAllJadwalSendiri
                'status' => 'required|in:hadir,izin,sakit,alfa',
                'bukti' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'tahun_akademik_id' => 'required|exists:tahun_akademik,id' // dari SiswaJadwalPelajaranController::showAllJadwalSendiri
                
            ],[
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir, izin, sakit, alfa',
                'bukti.image' => 'Format bukti wajib berupa gambar atau foto',                
                'bukti.mimes' => 'Format bukti wajib berupa jpeg, png, jpg',                
                'bukti.max' => 'Ukuran foto bukti maksimal 2 MB',                
                'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',                
                'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',                
            ]);                                
            
            // gabisa absen 2x pada hari yang sama
            $hari = AbsensiSiswa::with(
                'siswa.kelas',
                'jadwalPelajaran.mataPelajaran',
                'tahunAkademik'
            )
            ->where('siswa_id', $siswa->id)
            ->where('jadwal_pelajaran_id', $validated['jadwal_pelajaran_id'])
            ->where('kelas_id', $validated['kelas_id'])
            ->whereDate('hari', today())
            ->exists();

            if ($hari) {
                return ApiResponse::error('Gagal', ['pesan' => 'Anda sudah absen pelajaran '.$hari->jadwalPelajaran->mataPelajaran->nama_pelajaran.' hari ini'], 422);
            }
           
            if ($request->hasFile('bukti')) {
                $validated['bukti'] = $this->simpanFoto(
                    $request->file('bukti'),
                    'bukti', // folder penyimpanan
                    $siswa->nama
                );
            }   

            $tahunAkademikAktif = TahunAkademik::where('status', 'aktif')->first();

            $siswaKelas = SiswaKelas::with('kelas', 'tahunAkademik')
            ->where('siswa_id', $siswa->id)
            ->where('tahun_akademik_id', $tahunAkademikAktif)
            ->first();

            $absensi = AbsensiSiswa::create(
                [
                    'siswa_id' => $siswa->id ?? null,
                    'kelas_id' => $validated['kelas_id'] ?? null,
                    'jadwal_pelajaran_id' => $validated['jadwal_pelajaran_id'] ?? null,
                    'hari' => Carbon::today()->toDateString() ?? null,
                    'status' => $validated['status'] ?? null,
                    'bukti' => $validated['bukti'] ?? null,
                    'tahun_akademik_id' => $validated['tahun_akademik_id'] ?? null
                ]
            );

            $absensi->load('jadwalPelajaran.mataPelajaran', 'siswa.kelas', 'tahunAkademik');        

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'siswa' => $absensi->siswa->nama ?? null,                
                'kelas' => $absensi->siswa->kelas->nama_kelas ?? null,
                'mata_pelajaran' => $absensi->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,               
                'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
                'status_kehadiran' => $absensi->status ?? null,       
                'bukti' => $absensi->bukti ? asset(str_replace('public/', 'storage/', $absensi->bukti)) : null,                
                'tahun_akademik_id' => $absensi->tahunAkademik->id ?? null,               
                'tahun_akademik' => $absensi->tahunAkademik->tahun_akademik ?? null,               
                'status_tahun_akademik' => $absensi->tahunAkademik->status ?? null,               
                'semester' => $absensi->tahunAkademik->semester ?? null,               
                'status_semester' => $absensi->tahunAkademik->status ?? null,               
            ], 'Data absensi pelajaran '.$absensi->jadwalPelajaran->mataPelajaran->nama_pelajaran.' berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    // ✅ guru bisa absenkan siswa
    public function guruAbsenkanSiswa(Request $request)
    {
        Carbon::setLocale('id');

        try {
            $validated = $request->validate([          
                // semua inputan otomatis terisi kecuali siswa_id, status, dan bukti
                'siswa_id' => 'required|exists:siswa,id', // ini manual dipilih oleh guru
                'kelas_id' => 'required|exists:kelas,id', // otomatis
                'jadwal_pelajaran_id' => 'required|exists:jadwal_pelajarans,id', // otomatis
                'status' => 'required|in:hadir,izin,sakit,alfa', // Ini manual dipilih oleh guru
                'bukti' => 'nullable|image|mimes:jpeg,png,jpg|max:2048', // ini juga manual
                'tahun_akademik_id' => 'required|exists:tahun_akademik,id' // otomatis
                
            ],[
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'kelas_id.required' => 'Kelas wajib diisi',
                'kelas_id.exists' => 'Kelas tidak ditemukan',
                'jadwal_pelajaran_id.required' => 'Jadwal pelajaran wajib diisi',
                'jadwal_pelajaran_id.exists' => 'Jadwal pelajaran tidak ditemukan',
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir, izin, sakit, alfa',
                'bukti.image' => 'Format bukti wajib berupa gambar atau foto',                
                'bukti.mimes' => 'Format bukti wajib berupa jpeg, png, jpg',                
                'bukti.max' => 'Ukuran foto bukti maksimal 2 MB',                
                'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',                
                'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',                
            ]);                                
            
            // gabisa absen 2x pada hari yang sama
            $hari = AbsensiSiswa::with(
                'siswa.kelas',
                'jadwalPelajaran.mataPelajaran',
                'tahunAkademik'
            )
            ->where('siswa_id', $validated['siswa_id'])
            ->where('jadwal_pelajaran_id', $validated['jadwal_pelajaran_id'])
            ->where('kelas_id', $validated['kelas_id'])
            ->whereDate('hari', today())
            ->exists();

            if ($hari) {
                return ApiResponse::error('Gagal', ['pesan' => 'Siswa ini sudah absen pelajaran '.$hari->jadwalPelajaran->mataPelajaran->nama_pelajaran.' hari ini'], 422);
            }
           
            if ($request->hasFile('bukti')) {
                $validated['bukti'] = $this->simpanFoto(
                    $request->file('bukti'),
                    'bukti', // folder penyimpanan
                    $siswa->nama
                );
            }              

            $absensi = AbsensiSiswa::create(
                [
                    'siswa_id' => $validated['siswa_id'] ?? null,
                    'kelas_id' => $validated['kelas_id'] ?? null,
                    'jadwal_pelajaran_id' => $validated['jadwal_pelajaran_id'] ?? null,
                    'hari' => Carbon::today()->toDateString() ?? null,
                    'status' => $validated['status'] ?? null,
                    'bukti' => $validated['bukti'] ?? null,
                    'tahun_akademik_id' => $validated['tahun_akademik_id'] ?? null
                ]
            );

            $absensi->load('jadwalPelajaran.mataPelajaran', 'siswa.kelas', 'tahunAkademik');        

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'siswa' => $absensi->siswa->nama ?? null,                
                'kelas' => $absensi->siswa->kelas->nama_kelas ?? null,
                'mata_pelajaran' => $absensi->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,               
                'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
                'status_kehadiran' => $absensi->status ?? null,       
                'bukti' => $absensi->bukti ? asset(str_replace('public/', 'storage/', $absensi->bukti)) : null,                
                'tahun_akademik_id' => $absensi->tahunAkademik->id ?? null,               
                'tahun_akademik' => $absensi->tahunAkademik->tahun_akademik ?? null,               
                'status_tahun_akaemik' => $absensi->tahunAkademik->status ?? null,               
                'semester' => $absensi->tahunAkademik->semester ?? null,               
                'status_semester' => $absensi->tahunAkademik->status ?? null,               
            ], 'Data absensi pelajaran '.$absensi->jadwalPelajaran->mataPelajaran->nama_pelajaran.' berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }


    /**
     * ✅ untuk spa
     * get siswa dan semua absennya
     */   
    public function show($id)
    {        
        $absen = AbsensiSiswa::with([
            'jadwalPelajaran.mataPelajaran',
            'siswa.kelas',
            'tahunAkademik'
        ])
        ->where('siswa_id', $id)
        ->orderBy('hari', 'desc')
        ->get();
    
        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Data absensi tidak ditemukan'
            ]);
        }
    
        $siswa = $absen->first()->siswa;
    
        $result = [
            'siswa_id'   => $siswa->id,
            'nama_siswa' => $siswa->nama,
            'kelas_id'   => $siswa->kelas->id ?? null,
            'kelas'      => $siswa->kelas->nama_kelas ?? null,
    
            // 🔹 GROUP BERDASARKAN STRING TAHUN AKADEMIK
            'tahun_akademik' => $absen
                ->groupBy(fn ($abs) => $abs->tahunAkademik->tahun_akademik)
                ->map(function ($absenPerTahun, $tahunAkademik) {
    
                    // 🔹 GROUP PER SEMESTER
                    $semester = $absenPerTahun
                        ->groupBy(fn ($abs) => $abs->tahunAkademik->semester)
                        ->map(function ($itemsSemester, $semester) {
    
                            return [
                                'semester' => $semester,
    
                                'total' => [
                                    'hadir' => $itemsSemester->where('status', 'hadir')->count(),
                                    'izin'  => $itemsSemester->where('status', 'izin')->count(),
                                    'sakit' => $itemsSemester->where('status', 'sakit')->count(),
                                    'alfa'  => $itemsSemester->where('status', 'alfa')->count(),
                                ],
    
                                'absensi' => $itemsSemester->map(function ($abs) {
                                    return [
                                        'id' => $abs->id,
                                        'mata_pelajaran' =>
                                            $abs->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,
                                        'hari' => Carbon::parse($abs->hari)
                                            ->translatedFormat('l, d F Y'),
                                        'status_kehadiran' => $abs->status,
                                        'bukti' => $abs->bukti
                                            ? asset(str_replace(
                                                'public/',
                                                'storage/',
                                                $abs->bukti
                                            ))
                                            : null,
                                    ];
                                })->values(),
                            ];
                        })->values();
    
                    return [
                        'tahun_akademik' => $tahunAkademik,
                        'status_tahun_akademik' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                        'semester' => $semester,
                        'status_semester' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                    ];
                })->values(),
        ];
    
        return ApiResponse::success($result, 'Absensi berhasil diambil');
    }
    
    

    // ✅ show all absen sendiri (untuk siswa)
    public function showAbsenPelajaranSendiri()
    {
        $user = Auth::guard('siswa')->user();
    
        $absen = AbsensiSiswa::with([
            'jadwalPelajaran.mataPelajaran',
            'siswa.kelas',
            'tahunAkademik'
        ])
        ->where('siswa_id', $user->id)
        ->orderBy('hari', 'desc')
        ->get();
    
        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', [
                'data' => 'Data absensi tidak ditemukan'
            ]);
        }
    
        $siswa = $absen->first()->siswa;
    
        $result = [
            'siswa_id'   => $siswa->id,
            'nama_siswa' => $siswa->nama,
            'kelas_id'   => $siswa->kelas->id ?? null,
            'kelas'      => $siswa->kelas->nama_kelas ?? null,
    
            // 🔹 GROUP BERDASARKAN STRING TAHUN AKADEMIK
            'tahun_akademik' => $absen
                ->groupBy(fn ($abs) => $abs->tahunAkademik->tahun_akademik)
                ->map(function ($absenPerTahun, $tahunAkademik) {
    
                    // 🔹 GROUP PER SEMESTER
                    $semester = $absenPerTahun
                        ->groupBy(fn ($abs) => $abs->tahunAkademik->semester)
                        ->map(function ($itemsSemester, $semester) {
    
                            return [
                                'semester' => $semester,
    
                                'total' => [
                                    'hadir' => $itemsSemester->where('status', 'hadir')->count(),
                                    'izin'  => $itemsSemester->where('status', 'izin')->count(),
                                    'sakit' => $itemsSemester->where('status', 'sakit')->count(),
                                    'alfa'  => $itemsSemester->where('status', 'alfa')->count(),
                                ],
    
                                'absensi' => $itemsSemester->map(function ($abs) {
                                    return [
                                        'id' => $abs->id,
                                        'mata_pelajaran' =>
                                            $abs->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,
                                        'hari' => Carbon::parse($abs->hari)
                                            ->translatedFormat('l, d F Y'),
                                        'status_kehadiran' => $abs->status,
                                        'bukti' => $abs->bukti
                                            ? asset(str_replace(
                                                'public/',
                                                'storage/',
                                                $abs->bukti
                                            ))
                                            : null,
                                    ];
                                })->values(),
                            ];
                        })->values();
    
                    return [
                        'tahun_akademik' => $tahunAkademik,
                        'status_tahun_akademik' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                        'semester' => $semester,
                        'status_semester' => $absenPerTahun->first()->tahunAkademik->status ?? null,
                    ];
                })->values(),
        ];
    
        return ApiResponse::success($result, 'Absensi berhasil diambil');
    }
    


    /**
     * ✅ untuk spa
     */
    public function update(Request $request, string $id)
    {
        $absensi = AbsensiSiswa::with('mataPelajaran', 'siswa.kelas')->find($id);

        if (!$absensi) {
            return ApiResponse::error('Not found', ['id' => 'Data tidak ditemukan']);
        }

        $validated = $request->validate([                
            'status' => 'sometimes|required|in:hadir,izin,sakit,alfa',
            'bukti' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:2048'
        ], [                        
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan hanya hadir, izin, sakit, alfa',
            'bukti.image' => 'Format bukti wajib berupa gambar atau foto',                
            'bukti.mimes' => 'Format bukti wajib berupa jpeg, png, jpg',                
            'bukti.max' => 'Ukuran foto bukti maksimal 2 MB',
        ]);        

        if ($request->hasFile('bukti')) {

            // Ambil path lama dari database
            $oldPath = $absensi->bukti;
        
            // Simpan file baru
            $validated['bukti'] = $this->simpanFoto(
                $request->file('bukti'),
                'bukti',      // folder
                $request->siswa->nama ?? $absensi->siswa->nama, // nama file
            );
        
            try {
                if ($oldPath) {
                    // Hilangkan prefix 'public/' agar sesuai dengan disk
                    $relativePath = str_replace('public/', '', $oldPath);
        
                    if (Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                }
            } catch (\Exception $e) {
                \Log::warning("Gagal hapus file lama {$oldPath}: " . $e->getMessage());
            }
        }

        $absensi->update($validated);

        $absensi->load('jadwalPelajaran.mataPelajaran', 'siswa.kelas', 'tahunAkademik');        


        return ApiResponse::success([
            'id' => $absensi->id ?? null,
            'siswa' => $absensi->siswa->nama ?? null,                
            'kelas' => $absensi->siswa->kelas->nama_kelas ?? null,
            'mata_pelajaran' => $absensi->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,               
            'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
            'status_kehadiran' => $absensi->status ?? null,       
            'bukti' => $absensi->bukti ? asset(str_replace('public/', 'storage/', $absensi->bukti)) : null,                
            'tahun_akademik_id' => $absensi->tahunAkademik->id ?? null,               
            'tahun_akademik' => $absensi->tahunAkademik->tahun_akademik ?? null,               
            'status_tahun_akademik' => $absensi->tahunAkademik->status ?? null,          
            'semester' => $absensi->tahunAkademik->semester ?? null,               
            'status_semester' => $absensi->tahunAkademik->status ?? null,          
        ], 'Data absensi pelajaran berhasil diperbarui');
    }

    /**
     * ✅ untuk spa
     * Beberapa data = DELETE /absensi/siswa/pelajaran/destroy?ids[]=3&ids[]=5&ids[]=9
     * Satu data = DELETE /absensi/siswa/pelajaran/destroy?ids=7
     */    
    public function destroyData(Request $request, $id = null)
    {
        // Kalau dikirim dari body berupa array: { "ids": [1,2,3] }
        $ids = $request->input('ids') ?? ($id ? [$id] : []);

        if (empty($ids)) {
            return ApiResponse::error('Invalid Request', [
                'ids' => 'Tidak ada ID yang dikirim'
            ]);
        }

        // Ambil data yang ada
        $absensis = AbsensiSiswa::whereIn('id', $ids)->get();

        // Cek jika ada ID yang tidak ditemukan
        $foundIds   = $absensis->pluck('id')->toArray();
        $missingIds = array_values(array_diff($ids, $foundIds));

        if (!empty($missingIds)) {
            return ApiResponse::error('Not found', [
                'missing_ids' => $missingIds
            ]);
        }

        // Hapus file satu per satu
        foreach ($absensis as $absensi) {
            if ($absensi->bukti) {

                // "public/bukti/xxx.jpg" → "bukti/xxx.jpg"
                $relativePath = ltrim(
                    Str::of($absensi->bukti)->replaceFirst('public/', ''),
                    '/'
                );

                if (Storage::disk('public')->exists($relativePath)) {
                    Storage::disk('public')->delete($relativePath);
                }
            }
        }

        // Hapus record database
        AbsensiSiswa::whereIn('id', $ids)->delete();

        return ApiResponse::success(null, 'Data absensi berhasil dihapus');
    }

    // ✅ Export data
    public function export(Request $request)
    {
        $ids = $request->input('ids'); // bisa null atau array        

         // Validasi ID jika ada
         if ($ids) {
            $validIds = AbsensiSiswa::whereIn('id', $ids)->pluck('id')->toArray();
            $missingIds = array_diff($ids, $validIds);

            if (count($missingIds) > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Beberapa ID tidak ditemukan',
                    'missing_ids' => array_values($missingIds),
                ], 404);
            }
        }

        return Excel::download(new AbsensiSiswaExport($ids), 'absensi-pelajaran-siswa.xlsx');
    }

    /**
     * ✅ Export berkas (gambar/file)
     * Export all data /api/spa/absensi/siswa/pelajaran/zip
     * Export id data tertentu /api/spa/absensi/siswa/pelajaran/zip?id[]=2&id[]=4 
     */       
    public function exportBerkasZip(Request $request)
    {
        $ids = $request->input('ids');
        $absList = $ids ? AbsensiSiswa::whereIn('id', $ids)->get() : AbsensiSiswa::all();

        $zipFileName = 'absensi-pelajaran-siswa.zip';
        $tempZipPath = tempnam(sys_get_temp_dir(), 'zip_absensi_siswa_');

        $zip = new \ZipArchive;
        if ($zip->open($tempZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['error' => 'Tidak dapat membuat file ZIP'], 500);
        }

        foreach ($absList as $abs) {
            $files = [
                'bukti' => $abs->bukti,
            ];

            foreach ($files as $label => $relativePath) {
                if (!$relativePath) continue;
            
                $parts = explode('/', $relativePath, 2);
                if (count($parts) < 2) continue;
            
                $disk = $parts[0]; // public / private
                $pathInDisk = $parts[1];
            
                if (!in_array($disk, ['public', 'private'])) continue;
                if (!Storage::disk($disk)->exists($pathInDisk)) continue;
            
                $fullPath = Storage::disk($disk)->path($pathInDisk);
                $filenameInZip = $relativePath;
            
                $zip->addFile($fullPath, $filenameInZip);
            }            
        }

        $zip->close();

        if (!file_exists($tempZipPath)) {
            return response()->json(['error' => 'Gagal membuat file ZIP'], 500);
        }

        // Kirim file ZIP (hapus otomatis setelah dikirim)
        return response()->download($tempZipPath, $zipFileName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }

}
