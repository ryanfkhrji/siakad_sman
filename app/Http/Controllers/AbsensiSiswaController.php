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
        $absen = AbsensiSiswa::with('siswaJadwalPelajaran.jadwal.mataPelajaran', 'siswa.kelas', 'mataPelajaran')
            ->orderBy('hari', 'desc')
            ->get();
    
        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }
    
        // Kelompokkan berdasarkan guru_id
        $grouped = $absen->groupBy('siswa_id')->map(function ($item) {
            $siswaId = $item->first()->siswa->id ?? null;
            $namaSiswa = $item->first()->siswa->nama ?? null;
            $namaKelas = $item->first()->siswa->kelas->nama_kelas ?? null;
    
            return [
                'siswa_id' => $siswaId ?? null,
                'nama_siswa' => $namaSiswa ?? null,
                'kelas' => $namaKelas ?? null,
                'total_hadir' => $item->where('status', 'hadir')->count() ?? null,
                'total_izin' => $item->where('status', 'izin')->count() ?? null,
                'total_sakit' => $item->where('status', 'sakit')->count() ?? null,
                'total_alfa' => $item->where('status', 'alfa')->count() ?? null,
                'absensi' => $item->map(function ($abs) {
                    return [
                        'id' => $abs->id ?? null,
                        'mata_pelajaran' => $abs->mataPelajaran->nama_pelajaran ?? null,
                        'hari' => Carbon::parse($abs->hari)->translatedFormat('l, d F Y') ?? null,
                        'status' => $abs->status ?? null,
                        'bukti' => $abs->bukti ? asset(str_replace('public/', 'storage/', $abs->bukti)) : null,
                    ];
                })->values()
            ];
        })->values();
    
        return ApiResponse::success($grouped, 'Semua absensi berhasil diambil');
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
                'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
                'status' => 'required|in:hadir,izin,sakit,alfa',
                'bukti' => 'nullable|image|mimes:jpeg,png,jpg|max:2048'
            ],[
                'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
                'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
                'status.required' => 'Status wajib diisi',
                'status.in' => 'Pilihan hanya hadir, izin, sakit, alfa',
                'bukti.image' => 'Format bukti wajib berupa gambar atau foto',                
                'bukti.mimes' => 'Format bukti wajib berupa jpeg, png, jpg',                
                'bukti.max' => 'Ukuran foto bukti maksimal 2 MB',                
            ]);                                
            
            // gabisa absen 2x pada hari yang sama
            $hari = AbsensiSiswa::with('mataPelajaran')->where('siswa_id', $siswa->id)
            ->where('mata_pelajaran_id', $validated['mata_pelajaran_id'])
            ->where('kelas_id', $siswa->kelas_id)
            ->whereDate('hari', today())
            ->first();

            if ($hari) {
                return ApiResponse::error('Gagal', ['pesan' => 'Anda sudah absen pelajaran '.$hari->mataPelajaran->nama_pelajaran.' hari ini'], 422);
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
                    'siswa_id' => $siswa->id,
                    'kelas_id' => $siswa->kelas_id,
                    'mata_pelajaran_id' => $validated['mata_pelajaran_id'],
                    'hari' => Carbon::today()->toDateString(),
                    'status' => $validated['status'],
                    'bukti' => $validated['bukti']
                ]
            );

            $absensi->load('mataPelajaran', 'siswa.kelas');        

            return ApiResponse::success([
                'id' => $absensi->id ?? null,
                'siswa' => $absensi->siswa->nama ?? null,                
                'kelas' => $absensi->siswa->kelas->nama_kelas ?? null,
                'mata_pelajaran' => $absensi->mataPelajaran->nama_pelajaran ?? null,               
                'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
                'status' => $absensi->status ?? null,       
                'bukti' => $absensi->status ? asset(str_replace('public/', 'storage/', $absensi->bukti)) : null,       
                'rekapitulasi' => [
                    'hadir' => $absensi::where('status', 'hadir')->where('siswa_id', $siswa->id)->count(),
                    'izin' => $absensi::where('status', 'izin')->where('siswa_id', $siswa->id)->count(),
                    'sakit' => $absensi::where('status', 'sakit')->where('siswa_id', $siswa->id)->count(),
                    'alfa' => $absensi::where('status', 'alfa')->where('siswa_id', $siswa->id)->count(),
                ]
            ], 'Data absensi pelajaran '.$absensi->mataPelajaran->nama_pelajaran.' berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ✅ untuk spa
     */
    public function show(string $id)
    {
        $absen = AbsensiSiswa::with([
                'siswaJadwalPelajaran.jadwal.mataPelajaran',
                'mataPelajaran',
                'siswa.kelas'
            ])
            ->where('siswa_id', $id)
            ->orderBy('hari', 'desc')
            ->get();
    
        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }
    
        $grouped = $absen->groupBy('siswa_id')->map(function ($items) {
    
            $first = $items->first();
    
            return [
                'siswa_id'      => $first->siswa->id ?? null,
                'nama_siswa'    => $first->siswa->nama ?? null,
                'kelas'         => $first->siswa->kelas->nama_kelas ?? null,
    
                'total_hadir'   => $items->where('status', 'hadir')->count(),
                'total_izin'    => $items->where('status', 'izin')->count(),
                'total_sakit'   => $items->where('status', 'sakit')->count(),
                'total_alfa'    => $items->where('status', 'alfa')->count(),
    
                'absensi' => $items->map(function ($abs) {
                    return [
                        'id'              => $abs->id ?? null,
                        'mata_pelajaran'  => $abs->mataPelajaran->nama_pelajaran ?? null,
                        'hari'            => Carbon::parse($abs->hari)->translatedFormat('l, d F Y'),
                        'status'          => $abs->status ?? null,
                        'bukti'           => $abs->bukti ? asset(str_replace('public/', 'storage/', $abs->bukti)) : null,
                    ];
                })->values()
            ];
        })->values();
    
        return ApiResponse::success($grouped, 'Detail absensi berhasil diambil');
    }
    

    // ✅ show all absen sendiri (untuk siswa)
    public function showAbsenPelajaranSendiri()
    {
        $user = Auth::guard('siswa')->user();

        $absen = AbsensiSiswa::with([
            'mataPelajaran',
            'siswa.kelas'
        ])
        ->where('siswa_id', $user->id)
        ->orderBy('hari', 'desc')
        ->get();
        
        if ($absen->isEmpty()) {
            return ApiResponse::error('Not found', ['data' => 'Data absensi tidak ditemukan']);
        }

        $first = $absen->first();

        $result = [
            'siswa_id'   => $first->siswa->id ?? null,
            'nama_siswa' => $first->siswa->nama ?? null,
            'kelas'      => $first->siswa->kelas->nama_kelas ?? null,

            'total_hadir' => $absen->where('status', 'hadir')->count(),
            'total_izin'  => $absen->where('status', 'izin')->count(),
            'total_sakit' => $absen->where('status', 'sakit')->count(),
            'total_alfa'  => $absen->where('status', 'alfa')->count(),

            'absensi' => $absen->map(function ($abs) {
                return [
                    'id'                 => $abs->id,
                    'mata_pelajaran'    => $abs->mataPelajaran->nama_pelajaran ?? null,
                    'hari'               => Carbon::parse($abs->hari)->translatedFormat('l, d F Y'),
                    'status'             => $abs->status,
                    'bukti'              => $abs->bukti ? asset(str_replace('public/', 'storage/', $abs->bukti)) : null,
                ];
            })->values()
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
            'mata_pelajaran_id' => 'sometimes|required|exists:mata_pelajarans,id',        
            'status' => 'sometimes|required|in:hadir,izin,sakit,alfa',
            'bukti' => 'sometimes|nullable|image|mimes:jpeg,png,jpg|max:2048'
        ], [            
            'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
            'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
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

        return ApiResponse::success([
            'id' => $absensi->id ?? null,
            'siswa' => $absensi->siswa->nama ?? null,                
            'kelas' => $absensi->siswa->kelas->nama_kelas ?? null,
            'mata_pelajaran' => $absensi->mataPelajaran->nama_pelajaran ?? null,               
            'hari' => Carbon::parse($absensi->hari)->translatedFormat('l, d F Y') ?? null,
            'status' => $absensi->status ?? null,       
            'bukti' => $absensi->status ? asset(str_replace('public/', 'storage/', $absensi->bukti)) : null,       
            'rekapitulasi' => [
                'hadir' => $absensi::where('status', 'hadir')->where('siswa_id', $absensi->siswa_id)->count(),
                'izin' => $absensi::where('status', 'izin')->where('siswa_id', $absensi->siswa_id)->count(),
                'sakit' => $absensi::where('status', 'sakit')->where('siswa_id', $absensi->siswa_id)->count(),
                'alfa' => $absensi::where('status', 'alfa')->where('siswa_id', $absensi->siswa_id)->count(),
            ]
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
