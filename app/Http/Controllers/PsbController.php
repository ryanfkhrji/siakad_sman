<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Psb;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
// use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule;
use App\Helpers\ApiResponse;
use App\Exports\PsbExport;
use App\Imports\PsbImport;
use ZipArchive;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Validator;
use File;

class PsbController extends Controller
{
    public function index()
    {
        $psb = Psb::get();

        $formatted = $psb->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_siswa' => $item->nama_siswa,
                'nisn' => $item->nisn,
                'jk' => $item->jk,
                'tempat_lahir' => $item->tempat_lahir,
                'tanggal_lahir' => $item->tanggal_lahir,
                'agama' => $item->agama,
                'alamat' => $item->alamat,
                'no_hp_siswa' => $item->no_hp_siswa,
                'data_ayah' => [
                    'nama_ayah' => $item->nama_ayah,
                    'pekerjaan_ayah' => $item->pekerjaan_ayah,
                    'no_hp_ayah' => $item->no_hp_ayah,
                ],
                'data_ibu' => [
                    'nama_ibu' => $item->nama_ibu,
                    'pekerjaan_ibu' => $item->pekerjaan_ibu,
                    'no_hp_ibu' => $item->no_hp_ibu,
                ],
                'data_wali' => [
                    'nama_wali' => $item->nama_wali,
                    'pekerjaan_wali' => $item->pekerjaan_wali,
                    'no_hp_wali' => $item->no_hp_wali,
                ],
                'sekolah_asal' => $item->sekolah_asal,
                'alamat_sekolah_asal' => $item->alamat_sekolah_asal,
                'kelas_terakhir' => $item->kelas_terakhir,
                'nilai_raport_terakhir' => $item->nilai_raport_terakhir,
                'alasan_pindah' => $item->alasan_pindah,
                'berkas_raport' => route('berkas.view', [
                    'jenis'    => 'berkas_raport',
                    'filename' => basename($item->berkas_raport),
                ]),                
                'suket_pindah' => route('berkas.view', [
                    'jenis'    => 'suket_pindah',
                    'filename' => basename($item->suket_pindah),
                ]),                 
                'berkas_kartu_keluarga' => route('berkas.view', [
                    'jenis'    => 'berkas_kartu_keluarga',
                    'filename' => basename($item->berkas_kartu_keluarga),
                ]),                 
                'berkas_akta_lahir' => route('berkas.view', [
                    'jenis'    => 'berkas_akta_lahir',
                    'filename' => basename($item->berkas_akta_lahir),
                ]),                                 
                'foto_siswa' => $item->foto_siswa ? asset(str_replace('public/', 'storage/', $item->foto_siswa)) : null,
            ];
        });

        return ApiResponse::success($formatted, 'Daftar peserta berhasil diambil');

    }

    public function show($id)
    {
        $psb = Psb::find($id);

        if (!$psb) {
            return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $psb->id,
            'nama_siswa' => $psb->nama_siswa,
            'nisn' => $psb->nisn,
            'jk' => $psb->jk,
            'tempat_lahir' => $psb->tempat_lahir,
            'tanggal_lahir' => $psb->tanggal_lahir,
            'agama' => $psb->agama,
            'alamat' => $psb->alamat,
            'no_hp_siswa' => $psb->no_hp_siswa,
            'data_ayah' => [
                'nama_ayah' => $psb->nama_ayah,
                'pekerjaan_ayah' => $psb->pekerjaan_ayah,
                'no_hp_ayah' => $psb->no_hp_ayah,
            ],
            'data_ibu' => [
                'nama_ibu' => $psb->nama_ibu,
                'pekerjaan_ibu' => $psb->pekerjaan_ibu,
                'no_hp_ibu' => $psb->no_hp_ibu,
            ],
            'data_wali' => [
                'nama_wali' => $psb->nama_wali,
                'pekerjaan_wali' => $psb->pekerjaan_wali,
                'no_hp_wali' => $psb->no_hp_wali,
            ],
            'sekolah_asal' => $psb->sekolah_asal,
            'alamat_sekolah_asal' => $psb->alamat_sekolah_asal,
            'kelas_terakhir' => $psb->kelas_terakhir,
            'nilai_raport_terakhir' => $psb->nilai_raport_terakhir,
            'alasan_pindah' => $psb->alasan_pindah,
            'berkas_raport' => route('berkas.view', [
                'jenis'    => 'berkas_raport',
                'filename' => basename($psb->berkas_raport),
            ]),                
            'suket_pindah' => route('berkas.view', [
                'jenis'    => 'suket_pindah',
                'filename' => basename($psb->suket_pindah),
            ]),                 
            'berkas_kartu_keluarga' => route('berkas.view', [
                'jenis'    => 'berkas_kartu_keluarga',
                'filename' => basename($psb->berkas_kartu_keluarga),
            ]),                 
            'berkas_akta_lahir' => route('berkas.view', [
                'jenis'    => 'berkas_akta_lahir',
                'filename' => basename($psb->berkas_akta_lahir),
            ]),                                 
            'foto_siswa' => $psb->foto_siswa ? asset(str_replace('public/', 'storage/', $psb->foto_siswa)) : null,        
        ];

        return ApiResponse::success($formatted, 'Detail peserta berhasil diambil');
    }

    private function simpanBerkas($file, $folder, $nama_siswa, $jenis)
    {
        $extension = $file->getClientOriginalExtension();
        $uuid = substr(Str::uuid(), 0, 3);
        $namaSiswaSlug = Str::slug($nama_siswa, '-');

        // Tentukan nama file sesuai jenis
        switch ($jenis) {
            case 'foto_siswa':
                $disk = 'public';
                $subfolder = 'foto_siswa';
                $namaFile = "{$uuid}-{$namaSiswaSlug}.{$extension}";
                break;

            case 'berkas_raport':
                $disk = 'private';
                $subfolder = 'berkas_raport';
                $namaFile = "{$uuid}-{$namaSiswaSlug}.{$extension}";
                break;

            case 'suket_pindah':
                $disk = 'private';
                $subfolder = 'suket_pindah';
                $namaFile = "{$uuid}-{$namaSiswaSlug}.{$extension}";
                break;

            case 'berkas_kartu_keluarga':
                $disk = 'private';
                $subfolder = 'berkas_kartu_keluarga';
                $namaFile = "{$uuid}-{$namaSiswaSlug}.{$extension}";
                break;

            default:
                $disk = 'private';
                $subfolder = 'berkas_akta_lahir';
                $namaFile = "{$uuid}-{$namaSiswaSlug}.{$extension}";
                break;
        }

        // Simpan file di dalam subfolder
        $path = $file->storeAs($subfolder, $namaFile, $disk);

        // Simpan path lengkap dengan prefix disk di database
        return "{$disk}/{$path}";
    }


    public function tampilkanBerkas($jenis, $filename)
    {
        // Cek apakah file berada di folder
        $publicPath = storage_path("app/public/{$jenis}/{$filename}");
        $privatePath = storage_path("app/private/{$jenis}/{$filename}");

        // Tentukan path yang valid
        if (file_exists($publicPath)) {
            $path = $publicPath;
        } elseif (file_exists($privatePath)) {
            $path = $privatePath;
        } else {
            abort(404, 'File tidak ditemukan');
        }

        // Tentukan tipe konten berdasarkan ekstensi file
        $extension = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $mimeTypes = [
            'pdf'  => 'application/pdf',
            'xls'  => 'application/vnd.ms-excel',
            'xlsx' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'doc'  => 'application/msword',
            'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'png'  => 'image/png',
            'gif'  => 'image/gif',
            'bmp'  => 'image/bmp',
            'webp' => 'image/webp',
        ];        

        $mimeType = $mimeTypes[$extension] ?? mime_content_type($path);

        return response()->file($path, [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . basename($path) . '"'
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_siswa' => 'required|string',
                'nisn' => 'required|unique:penerimaan_siswa_baru,nisn',
                'jk' => 'required',
                'tempat_lahir' => 'required|string',
                'tanggal_lahir' => 'required|date',
                'agama' => 'required|string',
                'alamat' => 'required|string',
                'no_hp_siswa' => 'required',

                'nama_ayah' => 'required|string',
                'pekerjaan_ayah' => 'required|string',
                'no_hp_ayah' => 'required',

                'nama_ibu' => 'required|string',
                'pekerjaan_ibu' => 'required|string',
                'no_hp_ibu' => 'required',

                'nama_wali' => 'string|nullable',
                'pekerjaan_wali' => 'string|nullable',
                'no_hp_wali' => 'string|nullable',

                'sekolah_asal' => 'required|string',
                'alamat_sekolah_asal' => 'required|string',
                'kelas_terakhir' => 'string|nullable',
                'nilai_raport_terakhir' => 'string|nullable',
                'alasan_pindah' => 'string|nullable',
                'berkas_raport' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'suket_pindah' => 'nullable|file|mimes:pdf,doc,docx,xls,xlsx',
                'berkas_kartu_keluarga' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'berkas_akta_lahir' => 'required|image|mimes:jpeg,png,jpg|max:2048',
                'foto_siswa' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            ],[
                'nama_siswa.required' => 'Nama siswa wajib diisi',
                'nisn.required' => 'NISN wajib diisi',
                'nisn.unique' => 'Terdeteksi NISN ganda',
                'jk.required' => 'Kolom jenis kelamin wajib diisi',
                'tempat_lahir.required' => 'Tempat lahir wajib diisi',
                'tanggal_lahir.required' => 'Tanggal lahir wajib diisi',
                'agama.required' => 'Wajib diisi',
                'alamat.required' => 'Wajib diisi',
                'no_hp_siswa.required' => 'Wajib diisi',
                'nama_ayah.required' => 'Wajib diisi',
                'pekerjaan_ayah.required' => 'Wajib diisi',
                'no_hp_ayah.required' => 'Wajib diisi',
                'nama_ibu.required' => 'Wajib diisi',
                'pekerjaan_ibu.required' => 'Wajib diisi',
                'no_hp_ibu.required' => 'Wajib diisi',
                'sekolah_asal.required' => 'Wajib diisi',
                'alamat_sekolah_asal.required' => 'Wajib diisi',

                'berkas_raport.required' => 'Wajib diisi',
                'berkas_raport.image' => 'Harus berupa gambar atau foto',
                'berkas_raport.mimes' => 'Format foto tidak didukung',
                'berkas_raport.max' => 'Ukuran foto maksimal 2 MB',

                'suket_pindah.file' => 'Harus berupa file',
                'suket_pindah.mimes' => 'Format harus pdf, word, atau excel',                

                'berkas_kartu_keluarga.required' => 'Wajib diisi',
                'berkas_kartu_keluarga.image' => 'Harus berupa gambar atau foto',
                'berkas_kartu_keluarga.mimes' => 'Format foto tidak didukung',
                'berkas_kartu_keluarga.max' => 'Ukuran foto maksimal 2 MB',

                'berkas_akta_lahir.required' => 'Wajib diisi',
                'berkas_akta_lahir.image' => 'Harus berupa gambar atau foto',
                'berkas_akta_lahir.mimes' => 'Format foto tidak didukung',
                'berkas_akta_lahir.max' => 'Ukuran foto maksimal 2 MB',

                'foto_siswa.required' => 'Wajib diisi',
                'foto_siswa.image' => 'Harus berupa gambar atau foto',
                'foto_siswa.mimes' => 'Format foto tidak didukung',
                'foto_siswa.max' => 'Ukuran foto maksimal 2 MB',
            ]);           

            // 🔹 Proses upload semua file (public & private)
            $fileFields = [
                'foto_siswa' => 'public',
                'berkas_raport' => 'private',
                'suket_pindah' => 'private',
                'berkas_kartu_keluarga' => 'private',
                'berkas_akta_lahir' => 'private',
            ];

            foreach ($fileFields as $field => $disk) {
                if ($request->hasFile($field)) {
                    $validated[$field] = $this->simpanBerkas(
                        $request->file($field),
                        $field, // folder penyimpanan
                        $request->nama_siswa,
                        $field // jenis file
                    );
                }
            }                
            
            $psb = Psb::create($validated);

            return ApiResponse::success([
                'id' => $psb->id,
                'nama_siswa' => $psb->nama_siswa,
                'nisn' => $psb->nisn,
                'jk' => $psb->jk,
                'tempat_lahir' => $psb->tempat_lahir,
                'tanggal_lahir' => $psb->tanggal_lahir,
                'agama' => $psb->agama,
                'alamat' => $psb->alamat,
                'no_hp_siswa' => $psb->no_hp_siswa,
                'data_ayah' => [
                    'nama_ayah' => $psb->nama_ayah,
                    'pekerjaan_ayah' => $psb->pekerjaan_ayah,
                    'no_hp_ayah' => $psb->no_hp_ayah,
                ],
                'data_ibu' => [
                    'nama_ibu' => $psb->nama_ibu,
                    'pekerjaan_ibu' => $psb->pekerjaan_ibu,
                    'no_hp_ibu' => $psb->no_hp_ibu,
                ],
                'data_wali' => [
                    'nama_wali' => $psb->nama_wali,
                    'pekerjaan_wali' => $psb->pekerjaan_wali,
                    'no_hp_wali' => $psb->no_hp_wali,
                ],
                'sekolah_asal' => $psb->sekolah_asal,
                'alamat_sekolah_asal' => $psb->alamat_sekolah_asal,
                'kelas_terakhir' => $psb->kelas_terakhir,
                'nilai_raport_terakhir' => $psb->nilai_raport_terakhir,
                'alasan_pindah' => $psb->alasan_pindah,                
                'berkas_raport' => route('berkas.view', [
                    'jenis'    => 'berkas_raport',
                    'filename' => basename($psb->berkas_raport),
                ]),                
                'suket_pindah' => route('berkas.view', [
                    'jenis'    => 'suket_pindah',
                    'filename' => basename($psb->suket_pindah),
                ]),                 
                'berkas_kartu_keluarga' => route('berkas.view', [
                    'jenis'    => 'berkas_kartu_keluarga',
                    'filename' => basename($psb->berkas_kartu_keluarga),
                ]),                 
                'berkas_akta_lahir' => route('berkas.view', [
                    'jenis'    => 'berkas_akta_lahir',
                    'filename' => basename($psb->berkas_akta_lahir),
                ]),                                 
                'foto_siswa' => $psb->foto_siswa ? asset(str_replace('public/', 'storage/', $psb->foto_siswa)) : null,    
            ], 'Peserta berhasil mendaftar');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }    

    public function update(Request $request, $id)
    {
        $psb = Psb::find($id);
        if (!$psb) {
            return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_siswa' => 'sometimes|required|string',
            'nisn' => [
                'sometimes',
                'required',
                Rule::unique('penerimaan_siswa_baru')->ignore($id)
            ],
            'jk' => 'sometimes|required',
            'tempat_lahir' => 'sometimes|required',
            'tanggal_lahir' => 'sometimes|required|date',
            'agama' => 'sometimes|required|string',
            'alamat' => 'sometimes|required|string',
            'no_hp_siswa' => 'sometimes|required',
            'nama_ayah' => 'sometimes|required|string',
            'pekerjaan_ayah' => 'sometimes|required|string',
            'no_hp_ayah' => 'sometimes|required',
            'nama_ibu' => 'sometimes|required|string',
            'pekerjaan_ibu' => 'sometimes|required|string',
            'no_hp_ibu' => 'sometimes|required',
            'nama_wali' => 'sometimes',
            'pekerjaan_wali' => 'sometimes',
            'no_hp_wali' => 'sometimes',
            'sekolah_asal' => 'sometimes|required|string',
            'alamat_sekolah_asal' => 'sometimes|required|string',
            'kelas_terakhir' => 'sometimes',
            'nilai_raport_terakhir' => 'sometimes',
            'alasan_pindah' => 'sometimes',
            'berkas_raport' => 'sometimes|image|mimes:jpeg,jpg,png|max:2048',
            'suket_pindah' => 'sometimes|file|mimes:pdf,doc,docx,xls,xlsx|max:2048',
            'berkas_kartu_keluarga' => 'sometimes|image|mimes:jpeg,jpg,png|max:2048',
            'berkas_akta_lahir' => 'sometimes|image|mimes:jpeg,jpg,png|max:2048',
            'foto_siswa' => 'sometimes|image|mimes:jpeg,jpg,png|max:2048',
        ], [
            'nama_siswa.required' => 'Nama siswa wajib diisi',
            'nisn.required' => 'NISN wajib diisi',
            'nisn.unique' => 'NISN sudah ada',
            'jk.required' => 'Jenis kelamin wajib diisi',
            'tempat_lahir.required' => 'Tempat lahir wajib diisi',
            'tanggal_lahir.required' => 'Tanggal lahir wajib diisi',
            'tanggal_lahir.date' => 'Format tanggal tidak sesuai',
            'agama.required' => 'Wajib diisi',
            'alamat.required' => 'Wajib diisi',
            'no_hp_siswa.required' => 'Wajib diisi',
            'nama_ayah.required' => 'Wajib diisi',
            'pekerjaan_ayah.required' => 'Wajib diisi',
            'no_hp_ayah.required' => 'Wajib diisi',
            'nama_ibu.required' => 'Wajib diisi',
            'pekerjaan_ibu.required' => 'Wajib diisi',
            'no_hp_ibu.required' => 'Wajib diisi',
            'sekolah_asal.required' => 'Wajib diisi',
            'alamat_sekolah_asal.required' => 'Wajib diisi',
            'berkas_raport.image' => 'Format harus foto atau gambar',
            'berkas_raport.mimes' => 'Format harus jpeg, jpg, atau png',
            'berkas_raport.max' => 'Maksimal 2 MB',
            'suket_pindah.file' => 'Format harus berupa file',
            'suket_pindah.mimes' => 'Format harus pdf, word, atau excel',
            'suket_pindah.max' => 'Maksimal 2 MB',
            'berkas_kartu_keluarga.image' => 'Format harus foto atau gambar',
            'berkas_kartu_keluarga.mimes' => 'Format harus jpeg, jpg, atau png',
            'berkas_kartu_keluarga.max' => 'Maksimal 2 MB',
            'berkas_akta_lahir.image' => 'Format harus foto atau gambar',
            'berkas_akta_lahir.mimes' => 'Format harus jpeg, jpg, atau png',
            'berkas_akta_lahir.max' => 'Maksimal 2 MB',
            'foto_siswa.image' => 'Format harus foto atau gambar',
            'foto_siswa.mimes' => 'Format harus jpeg, jpg, atau png',
            'foto_siswa.max' => 'Maksimal 2 MB',
        ]);

        // 🔹 File fields dengan disk
        $fileFields = [
            'foto_siswa' => 'public',
            'berkas_raport' => 'private',
            'suket_pindah' => 'private',
            'berkas_kartu_keluarga' => 'private',
            'berkas_akta_lahir' => 'private',
        ];

        foreach ($fileFields as $field => $disk) {
            if ($request->hasFile($field)) {
        
                // Ambil path lama
                $oldPath = $psb->$field;
        
                // Simpan file baru dulu
                $validated[$field] = $this->simpanBerkas(
                    $request->file($field),
                    $field, // folder
                    $request->nama_siswa ?? $psb->nama_siswa,
                    $field  // jenis
                );
                
                try {
                    // Setelah file baru berhasil disimpan, hapus file lama
                    if ($oldPath) {
                        // Hilangkan prefix 'public/' atau 'private/' agar sesuai dengan disk
                        $relativePath = str_replace($disk . '/', '', $oldPath);
                        if (Storage::disk($disk)->exists($relativePath)) {
                            Storage::disk($disk)->delete($relativePath);
                        }
                    }
                } catch (\Exception $e) {
                    \Log::warning("Gagal hapus file lama {$oldPath}: " . $e->getMessage());
                }
            }
        }        

        // Update data ke database
        $psb->update($validated);

        // 🔹 Response
        return ApiResponse::success([
            'id' => $psb->id,
            'nama_siswa' => $psb->nama_siswa,
            'nisn' => $psb->nisn,
            'jk' => $psb->jk,
            'tempat_lahir' => $psb->tempat_lahir,
            'tanggal_lahir' => $psb->tanggal_lahir,
            'agama' => $psb->agama,
            'alamat' => $psb->alamat,
            'no_hp_siswa' => $psb->no_hp_siswa,
            'data_ayah' => [
                'nama_ayah' => $psb->nama_ayah,
                'pekerjaan_ayah' => $psb->pekerjaan_ayah,
                'no_hp_ayah' => $psb->no_hp_ayah,
            ],
            'data_ibu' => [
                'nama_ibu' => $psb->nama_ibu,
                'pekerjaan_ibu' => $psb->pekerjaan_ibu,
                'no_hp_ibu' => $psb->no_hp_ibu,
            ],
            'data_wali' => [
                'nama_wali' => $psb->nama_wali,
                'pekerjaan_wali' => $psb->pekerjaan_wali,
                'no_hp_wali' => $psb->no_hp_wali,
            ],
            'sekolah_asal' => $psb->sekolah_asal,
            'alamat_sekolah_asal' => $psb->alamat_sekolah_asal,
            'kelas_terakhir' => $psb->kelas_terakhir,
            'nilai_raport_terakhir' => $psb->nilai_raport_terakhir,
            'alasan_pindah' => $psb->alasan_pindah,
            'berkas_raport' => route('berkas.view', [
                'jenis'    => 'berkas_raport',
                'filename' => basename($psb->berkas_raport),
            ]),                
            'suket_pindah' => route('berkas.view', [
                'jenis'    => 'suket_pindah',
                'filename' => basename($psb->suket_pindah),
            ]),                 
            'berkas_kartu_keluarga' => route('berkas.view', [
                'jenis'    => 'berkas_kartu_keluarga',
                'filename' => basename($psb->berkas_kartu_keluarga),
            ]),                 
            'berkas_akta_lahir' => route('berkas.view', [
                'jenis'    => 'berkas_akta_lahir',
                'filename' => basename($psb->berkas_akta_lahir),
            ]),                                 
            'foto_siswa' => $psb->foto_siswa ? asset(str_replace('public/', 'storage/', $psb->foto_siswa)) : null,  
        ], 'Peserta berhasil diperbarui');
    }

    // public function destroy($id)
    // {
    //     $psb = Psb::find($id);

    //     if (!$psb) {
    //         return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
    //     }

    //     // Daftar kolom yang menyimpan file
    //     $fileColumns = [
    //         'foto_siswa',
    //         'berkas_raport',
    //         'suket_pindah',
    //         'berkas_kartu_keluarga',
    //         'berkas_akta_lahir',
    //     ];

    //     foreach ($fileColumns as $field) {
    //         $filePath = $psb->$field;
    //         if (!$filePath) continue;

    //         // Tentukan disk berdasarkan prefix
    //         if (str_starts_with($filePath, 'public/')) {
    //             $disk = 'public';
    //             $relativePath = substr($filePath, strlen('public/'));
    //         } elseif (str_starts_with($filePath, 'private/')) {
    //             $disk = 'private';
    //             $relativePath = substr($filePath, strlen('private/'));
    //         } else {
    //             // Jika tidak ada prefix, skip
    //             continue;
    //         }

    //         // Hapus file jika ada
    //         if (Storage::disk($disk)->exists($relativePath)) {
    //             Storage::disk($disk)->delete($relativePath);
    //         }
    //     }

    //     // Hapus record dari database
    //     $psb->delete();

    //     return ApiResponse::success(null, 'Peserta berhasil dihapus');
    // }

    // ✅ Hapus bannyak sekaligus
    public function destroyMultiple(Request $request, $id = null)
    {
        /*
        * PRIORITAS PENGAMBILAN IDS:
        * 1. id[] dari query param
        * 2. id dari body JSON
        * 3. id dari path parameter
        */
    
        // 1. id[] dari query param
        $ids = $request->query('id');
    
        // 2. Kalau query param kosong → cek body
        if (!$ids) {
            $ids = $request->input('id');
        }
    
        // 3. Kalau body kosong → cek path
        if (!$ids && $id !== null) {
            $ids = [$id];
        }
    
        if (!$ids) {
            return ApiResponse::error('Not found', ['id' => 'Peserta tidak ditemukan']);
        }
    
        // Normalisasi: harus array
        if (!is_array($ids)) {
            $ids = [$ids];
        }
    
        // Bersihkan nilai kosong/null
        $ids = array_filter($ids);
    
        if (empty($ids)) {
            return ApiResponse::error('ID tidak valid', ['id' => ['Minimal 1 ID harus ada']], 422);
        }
    
        // pengecekan id yang tidak ditemukan
        $validIds = Psb::whereIn('id', $ids)->pluck('id')->toArray();
    
        // Cari ID yang tidak ada di database
        $missingIds = array_diff($ids, $validIds);
    
        if (count($missingIds) > 0) {
            return response()->json([
                'status' => 'error',
                'message' => 'Beberapa ID tidak ditemukan',
                'missing_ids' => array_values($missingIds),
            ], 404);
        }
    
        // Ambil data lengkap PSB setelah dipastikan semua valid
        $psbs = Psb::whereIn('id', $ids)->get();
    
        // Kolom file yang akan dihapus
        $fileColumns = [
            'foto_siswa',
            'berkas_raport',
            'suket_pindah',
            'berkas_kartu_keluarga',
            'berkas_akta_lahir',
        ];
    
        foreach ($psbs as $psb) {
            foreach ($fileColumns as $field) {
                $filePath = $psb->$field;
                if (!$filePath) continue;
    
                if (str_starts_with($filePath, 'public/')) {
                    $disk = 'public';
                    $relativePath = substr($filePath, 7);
                } elseif (str_starts_with($filePath, 'private/')) {
                    $disk = 'private';
                    $relativePath = substr($filePath, 8);
                } else {
                    continue;
                }
    
                if (Storage::disk($disk)->exists($relativePath)) {
                    Storage::disk($disk)->delete($relativePath);
                }
            }
        }
    
        // Hapus dari database
        Psb::whereIn('id', $ids)->delete();
    
        return ApiResponse::success(null, 'Peserta berhasil dihapus');
    }
    
    /** 
     * ✅ Export data menggunakan app/Exports/PsbExport.php
     * php artisan make:export PsbExport --model=Psb
     * Export all data /api/export-psb
     * Export id data tertentu /api/export-psb?id[]=2&id[]=4 
    */    
    public function exportExcel(Request $request)
    {
        $ids = $request->input('id'); // bisa null atau array

        // Validasi ID jika ada
        if ($ids) {
            $validIds = Psb::whereIn('id', $ids)->pluck('id')->toArray();
            $missingIds = array_diff($ids, $validIds);

            if (count($missingIds) > 0) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Beberapa ID tidak ditemukan',
                    'missing_ids' => array_values($missingIds),
                ], 404);
            }
        }

        try {
            // Kirim file langsung sebagai download response
            return Excel::download(new PsbExport($ids), 'data_psb.xlsx');
        } catch (\Exception $e) {
            // Tangani error ekspor
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengekspor data',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Export berkas (gambar/file)
     * Bisa export all data atau id data tertentu
     * Export all data /api/export-berkas-zip
     * Export id data tertentu /api/export-berkas-zip?id[]=2&id[]=4 
     */       
    public function exportBerkasZip(Request $request)
    {
        $ids = $request->input('id');
        $psbList = $ids ? Psb::whereIn('id', $ids)->get() : Psb::all();

        $zipFileName = 'berkas_psb.zip';
        $tempZipPath = tempnam(sys_get_temp_dir(), 'zip_psb_');

        $zip = new \ZipArchive;
        if ($zip->open($tempZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['error' => 'Tidak dapat membuat file ZIP'], 500);
        }

        foreach ($psbList as $psb) {
            $files = [
                'foto_siswa' => $psb->foto_siswa,
                'berkas_raport' => $psb->berkas_raport,
                'suket_pindah' => $psb->suket_pindah,
                'berkas_kartu_keluarga' => $psb->berkas_kartu_keluarga,
                'berkas_akta_lahir' => $psb->berkas_akta_lahir,
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

    /**
     * ✅ Import data menggunakan app\Imports\PsbImport.php
     * php artisan make:import PsbImport --model=Psb
     */
    public function importExcel(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls'
        ]);
        
        Excel::import(new PsbImport, $request->file('file'));
        
        return response()->json(['message' => 'Import berhasil']);
    }


    /**
     * ✅ Import berkas
     */
    public function importBerkasZip(Request $request)
    {
        $request->validate([
            'zip_file' => 'required|file|mimes:zip',
        ]);

        $zipFile = $request->file('zip_file');

        // Simpan sementara file ZIP di storage
        $tempPath = $zipFile->getRealPath();

        $zip = new ZipArchive;
        if ($zip->open($tempPath) !== true) {
            return response()->json(['error' => 'Tidak dapat membuka file ZIP'], 400);
        }

        // Loop semua file di ZIP
        for ($i = 0; $i < $zip->numFiles; $i++) {
            $entry = $zip->getNameIndex($i);

            // Skip folder kosong
            if (substr($entry, -1) === '/') continue;

            // Tentukan folder disk berdasarkan prefix
            if (str_starts_with($entry, 'public/')) {
                $disk = 'public';
                $relativePath = substr($entry, strlen('public/'));
            } elseif (str_starts_with($entry, 'private/')) {
                $disk = 'private';
                $relativePath = substr($entry, strlen('private/'));
            } else {
                // Jika folder tidak dikenal, lewati
                continue;
            }

            // Pastikan direktori tujuan ada
            $dir = dirname($relativePath);
            if (!Storage::disk($disk)->exists($dir)) {
                Storage::disk($disk)->makeDirectory($dir);
            }

            // Ambil isi file
            $fileContents = $zip->getFromIndex($i);

            // Simpan file ke storage sesuai disk
            Storage::disk($disk)->put($relativePath, $fileContents);
        }

        $zip->close();

        return response()->json(['success' => 'File berhasil diimport']);
    }

}
