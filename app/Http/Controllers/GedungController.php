<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Gedung;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Response;
use ZipArchive;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use File;

class GedungController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $gedung = Gedung::get();

        $formatted = $gedung->map(function ($item) {
            return [
                'id' => $item->id,
                'foto_gedung' => $item->foto_gedung ? asset(str_replace('public/', 'storage/', $item->foto_gedung)) : null,
                'kode_gedung' => $item->kode_gedung,
                'nama_gedung' => $item->nama_gedung,
                'jumlah_lantai' => $item->jumlah_lantai,
                'luas_bangunan' => $item->luas_bangunan,
                'tahun_dibangun' => $item->tahun_dibangun,
                'kondisi' => $item->kondisi,
                'keterangan' => $item->keterangan,
            ];
        });

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
     * Store a newly created resource in storage.
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

            $gedung = Gedung::create($validated);
            
            return ApiResponse::success([
                'id' => $gedung->id,
                'foto_gedung' => $gedung->foto_gedung ? asset(str_replace('public/', 'storage/', $gedung->foto_gedung)) : null,            
                'kode_gedung' => $gedung->kode_gedung,
                'nama_gedung' => $gedung->nama_gedung,
                'jumlah_lantai' => $gedung->jumlah_lantai,
                'luas_bangunan' => $gedung->luas_bangunan,
                'tahun_dibangun' => $gedung->tahun_dibangun,
                'kondisi' => $gedung->kondisi,
                'lokasi' => $gedung->lokasi,
                'keterangan' => $gedung->keterangan,
            ], 'Data gedung berhasil dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }   

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $gedung = Gedung::find($id);

        if (!$gedung) {
            return ApiResponse::error('Data gedung tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
                'id' => $gedung->id,
                'foto_gedung' => $gedung->foto_gedung ? asset(str_replace('public/', 'storage/', $gedung->foto_gedung)) : null,
                'kode_gedung' => $gedung->kode_gedung,
                'nama_gedung' => $gedung->nama_gedung,
                'jumlah_lantai' => $gedung->jumlah_lantai,
                'luas_bangunan' => $gedung->luas_bangunan,
                'tahun_dibangun' => $gedung->tahun_dibangun,
                'kondisi' => $gedung->kondisi,
                'keterangan' => $gedung->keterangan,
        ];

        return ApiResponse::success($formatted, 'Detail gedung berhasil diambil');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $gedung = Gedung::find($id);

        if (!$gedung) {
            return ApiResponse::error('Data gedung tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'foto_gedung' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:2048',
            'kode_gedung' => [
                'required',
                'sometimes',
                Rule::unique('gedung')->ignore($id)
            ],
            'nama_gedung' => [
                'required',
                'sometimes',
                Rule::unique('gedung')->ignore($id)
            ],
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

            // Ambil path lama dari database
            $oldPath = $gedung->foto_gedung;
        
            // Simpan file baru
            $validated['foto_gedung'] = $this->simpanFoto(
                $request->file('foto_gedung'),
                'foto_gedung',      // folder
                $request->nama_gedung ?? $gedung->nama_gedung,
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
        
        $gedung->update($validated);

        return ApiResponse::success([
            'id' => $gedung->id,
            'foto_gedung' => $gedung->foto_gedung ? asset(str_replace('public/', 'storage/', $gedung->foto_gedung)) : null,            
            'kode_gedung' => $gedung->kode_gedung,
            'nama_gedung' => $gedung->nama_gedung,
            'jumlah_lantai' => $gedung->jumlah_lantai,
            'luas_bangunan' => $gedung->luas_bangunan,
            'tahun_dibangun' => $gedung->tahun_dibangun,
            'kondisi' => $gedung->kondisi,
            'lokasi' => $gedung->lokasi,
            'keterangan' => $gedung->keterangan,
        ], 'Data gedung berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $gedung = Gedung::find($id);

        if (!$gedung) {
            return ApiResponse::error('Data gedung tidak ada', ['id' => 'Data gedung tidak ditemukan']);
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
