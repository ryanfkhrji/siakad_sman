<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Gedung;
use App\Models\Ruangan;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Response;
use ZipArchive;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use File;
use Illuminate\Support\Facades\Auth;

class GedungController extends Controller
{
    /**
     * spa/tu
     */
    public function index()
    {
        $gedung = Gedung::get();            
        
        if (!$gedung) {
            return ApiResponse::error('Not found', ['data' => 'Data gedung tidak ditemukan']);
        }

        $formatted = $gedung->map(function ($item) {
            return [
                'id' => $item->id,
                'foto_gedung' => $item->foto_gedung ? asset(str_replace('public/', 'storage/', $item->foto_gedung)) : null,
                'nama_gedung' => $item->nama_gedung,
                'kode_gedung' => $item->kode_gedung,                
                'status' => $item->status,
            ];
        })->values();

        return ApiResponse::success($formatted, 'Daftar gedung berhasil diambil');

    }

    private function simpanFoto($file, $folder, $nama_gedung)
    {
        $extension = $file->getClientOriginalExtension();
        $uuid = substr(Str::uuid(), 0, 3);
        $namaGedungSlug = Str::slug($nama_gedung, '-');

        $disk = 'public';
        $subfolder = 'foto_gedung';
        $namaFile = "{$uuid}-{$namaGedungSlug}.{$extension}";

        // Simpan file di dalam subfolder
        $path = $file->storeAs($subfolder, $namaFile, $disk);

        // Simpan path lengkap dengan prefix disk di database
        return "{$disk}/{$path}";
    }

    /**
     * Spa/tu
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'foto_gedung' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
                'kode_gedung' => 'required|unique:gedung,kode_gedung',
                'nama_gedung' => 'required|unique:gedung,nama_gedung',
                'jumlah_lantai' => 'nullable',
                'luas_bangunan' => 'nullable',
                'tahun_dibangun' => 'nullable',
                'kondisi' => 'nullable',
                'lokasi' => 'nullable',
                'keterangan' => 'nullable',
            ], [
                'foto_gedung.image' => 'Hanya boleh berisi gambar atau foto',
                'foto_gedung.mimes' => 'Format foto harus jpg, jpeg, atau webp',
                'foto_gedung.max' => 'Maksimal ukuran foto 2 mb',
                'kode_gedung.required' => 'Kode gedung wajib diisi',
                'kode_gedung.unique' => 'Kode gedung sudah ada',
                'nama_gedung.required' => 'Nama gedung wajib diisi',
                'nama_gedung.unique' => 'Nama gedung sudah ada',
            ]);
    
            if ($request->hasFile('foto_gedung')) {
                $validated['foto_gedung'] = $this->simpanFoto(
                    $request->file('foto_gedung'),
                    'foto_gedung', // folder penyimpanan
                    $request->nama_gedung
                );
            }

            $gedung = Gedung::create([
                'foto_gedung' => $validated['foto_gedung'],
                'kode_gedung' => $validated['kode_gedung'],
                'nama_gedung' => $validated['nama_gedung'],
                'jumlah_lantai' => $validated['jumlah_lantai'] ?? null,
                'luas_bangunan' => $validated['luas_bangunan'] ?? null,
                'tahun_dibangun' => $validated['tahun_dibangun'] ?? null,
                'kondisi' => $validated['kondisi'] ?? null,
                'lokasi' => $validated['lokasi'] ?? null,
                'keterangan' => $validated['keterangan'] ?? null,
                'status' => 'aktif',
            ]);
            
            return ApiResponse::success([
                'id' => $gedung->id,
                'foto_gedung' => $gedung->foto_gedung ? asset(str_replace('public/', 'storage/', $gedung->foto_gedung)) : null,            
                'kode_gedung' => $gedung->kode_gedung,
                'nama_gedung' => $gedung->nama_gedung,
                'jumlah_lantai' => $gedung->jumlah_lantai ?? null,
                'luas_bangunan' => $gedung->luas_bangunan ?? null,
                'tahun_dibangun' => $gedung->tahun_dibangun ?? null,
                'kondisi' => $gedung->kondisi ?? null,
                'lokasi' => $gedung->lokasi ?? null,
                'keterangan' => $gedung->keterangan ?? null,
                'status' => $gedung->status,
            ], 'Data gedung berhasil dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }   

    /**
     * spa/tu
     */
    public function show(string $id)
    {
        $gedung = Gedung::with('ruangan')->find($id);

        if (!$gedung) {
            return ApiResponse::error('Data gedung tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
                'id' => $gedung->id,
                'foto_gedung' => $gedung->foto_gedung ? asset(str_replace('public/', 'storage/', $gedung->foto_gedung)) : null,
                'nama_gedung' => $gedung->nama_gedung ?? null,
                'kode_gedung' => $gedung->kode_gedung ?? null,
                'jumlah_lantai' => $gedung->jumlah_lantai ?? null,
                'luas_bangunan' => $gedung->luas_bangunan ?? null,
                'tahun_dibangun' => $gedung->tahun_dibangun ?? null,
                'kondisi' => $gedung->kondisi ?? null,
                'lokasi' => $gedung->lokasi ?? null,
                'keterangan' => $gedung->keterangan ?? null,
                'status_gedung' => $gedung->status ?? null,
                'ruangan' => $gedung->ruangan->map(function ($item) {
                    return [
                        'id' => $item->id ?? null,
                        'kode_ruangan' => $item->kode_ruangan ?? null,
                        'nama_ruangan' => $item->nama_ruangan ?? null,
                        'jenis_ruangan' => $item->jenis_ruangan ?? null,
                        'lantai' => $item->lantai ?? null,
                        'kapasitas' => $item->kapasitas ?? null,
                        'luas_ruangan' => $item->luas_ruangan ?? null,
                        'kondisi' => $item->kondisi ?? null,
                        'fasilitas' => $item->fasilitas ?? null,
                        'keterangan' => $item->keterangan ?? null,
                        'status_ruangan' => $item->status ?? null,
                    ];
                }),
        ];

        return ApiResponse::success($formatted, 'Detail gedung berhasil diambil');
    }

    /**
     * spa/tu
     */    
    public function update(Request $request, string $id)
    {
        $gedung = Gedung::find($id);

        if (!$gedung) {
            return ApiResponse::error(
                'Data gedung tidak ditemukan',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $validated = $request->validate([
            'foto_gedung' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:2048',

            'kode_gedung' => [
                'sometimes',
                'filled',
                Rule::unique('gedung', 'kode_gedung')->ignore($id),
            ],

            'nama_gedung' => [
                'sometimes',
                'filled',
                Rule::unique('gedung', 'nama_gedung')->ignore($id),
            ],

            'jumlah_lantai' => 'sometimes|nullable|integer|min:1',
            'luas_bangunan' => 'sometimes|nullable|string|max:50',
            'tahun_dibangun' => 'sometimes|nullable|digits:4',
            'kondisi' => 'sometimes|nullable|string|max:100',
            'lokasi' => 'sometimes|nullable|string|max:255',
            'keterangan' => 'sometimes|nullable|string',
            'status' => 'sometimes|nullable|in:aktif,arsip',

        ], [
            'foto_gedung.image' => 'Hanya boleh berisi gambar',
            'foto_gedung.mimes' => 'Format foto harus jpg, jpeg, png, atau webp',
            'foto_gedung.max' => 'Ukuran foto maksimal 2 MB',

            'kode_gedung.filled' => 'Kode gedung wajib diisi',
            'kode_gedung.unique' => 'Kode gedung sudah digunakan',

            'nama_gedung.filled' => 'Nama gedung wajib diisi',
            'nama_gedung.unique' => 'Nama gedung sudah digunakan',

            'jumlah_lantai.integer' => 'Jumlah lantai harus berupa angka',
            'tahun_dibangun.digits' => 'Tahun dibangun harus 4 digit',
            'status.in' => 'Status hanya boleh aktif atau arsip',
        ]);

        // Handle upload foto
        if ($request->hasFile('foto_gedung')) {

            $oldPath = $gedung->foto_gedung;

            $validated['foto_gedung'] = $this->simpanFoto(
                $request->file('foto_gedung'),
                'foto_gedung',
                $request->nama_gedung ?? $gedung->nama_gedung
            );

            if ($oldPath) {
                try {
                    $relativePath = str_replace('public/', '', $oldPath);

                    if (Storage::disk('public')->exists($relativePath)) {
                        Storage::disk('public')->delete($relativePath);
                    }
                } catch (\Exception $e) {
                    \Log::warning("Gagal hapus foto gedung lama: {$oldPath}", [
                        'error' => $e->getMessage()
                    ]);
                }
            }
        }

        $gedung->update($validated);

        return ApiResponse::success([
            'id' => $gedung->id,
            'foto_gedung' => $gedung->foto_gedung
                ? asset('storage/' . str_replace('public/', '', $gedung->foto_gedung))
                : null,
            'kode_gedung' => $gedung->kode_gedung,
            'nama_gedung' => $gedung->nama_gedung,
            'jumlah_lantai' => $gedung->jumlah_lantai,
            'luas_bangunan' => $gedung->luas_bangunan,
            'tahun_dibangun' => $gedung->tahun_dibangun,
            'kondisi' => $gedung->kondisi,
            'lokasi' => $gedung->lokasi,
            'keterangan' => $gedung->keterangan,
            'status' => $gedung->status,
        ], 'Data gedung berhasil diperbarui');
    }


    /**
     * spa/tu
     */
    public function destroy($id)
    {
        $gedung = Gedung::find($id);

        if (!$gedung) {
            return ApiResponse::error('Data gedung tidak ada', ['id' => 'Data gedung tidak ditemukan']);
        }

        if ($gedung->ruangan()->exists()) {
            return ApiResponse::error(
                'Tidak diizinkan',
                ['ruangan' => 'Gedung sudah digunakan pada ruangan, update status sebagai solusi'],
                403
            );
        }

        // Nilai contoh: "public/foto_gedung/31e-lab-fisika.jpg"
        $storedPath = $gedung->foto_gedung;

        // Normalisasi ke path relatif disk 'public' → "foto_gedung/31e-lab-fisika.jpg"
        $relativePath = ltrim(Str::of($storedPath)->replaceFirst('public/', ''), '/');

        // Hapus file bila ada
        if ($relativePath && Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }

        // Hapus record
        $gedung->delete();

        return ApiResponse::success(null, 'Data gedung berhasil dihapus');
    }
}
