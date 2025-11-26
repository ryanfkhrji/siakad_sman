<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\IdentitasSekolah;
use Illuminate\Support\Facades\Storage;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;

class IdentitasSekolahController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $identitas = IdentitasSekolah::all();

        return ApiResponse::success([
            'id' => $identitas->id,
            'npsn' => $identitas->npsn,
            'nama_sekolah' => $identitas->nama_sekolah,
            'status_sekolah' => $identitas->status_sekolah,
            'jenjang' => $identitas->jenjang,
            'alamat' => $identitas->alamat,
            'desa_kelurahan' => $identitas->desa_kelurahan,
            'kecamatan' => $identitas->kecamatan,
            'kabupaten_kota' => $identitas->kabupaten_kota,
            'provinsi' => $identitas->provinsi,
            'kode_pos' => $identitas->kode_pos,
            'email' => $identitas->email,
            'no_telepon' => $identitas->no_telepon,
            'kepala_sekolah' => $identitas->kepala_sekolah,
            'nip_kepala_sekolah' => $identitas->nip_kepala_sekolah,
            'visi' => $identitas->visi,
            'misi' => $identitas->misi,
            'logo' => $gedung->logo ? asset(str_replace('public/', 'storage/', $gedung->logo)) : null,     
        ], 'Identitas sekolah berhasil diambil');
    }

    private function simpanFoto($file, $folder, $nama_sekolah)
    {
        $extension = $file->getClientOriginalExtension();
        $uuid = substr(Str::uuid(), 0, 3);
        $namaLogo = Str::slug($nama_sekolah, '-');

        $disk = 'public';
        $subfolder = 'logo';
        $namaFile = "{$uuid}-{$namaLogo}.{$extension}";

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
                'npsn' => 'nullable|string',
                'nama_sekolah' => 'required|string',
                'status_sekolah' => 'nullable|string',
                'jenjang' => 'nullable|string',
                'alamat' => 'nullable|string',
                'desa_kelurahan' => 'nullable|string',
                'kecamatan' => 'nullable|string',
                'kabupaten_kota' => 'nullable|string',
                'provinsi' => 'nullable|string',
                'kode_pos' => 'nullable|string|max:20',
                'email' => 'nullable|email',
                'no_telepon' => 'nullable|string',
                'kepala_sekolah' => 'nullable|string',
                'nip_kepala_sekolah' => 'nullable|string',
                'visi' => 'nullable|string',
                'misi' => 'nullable|string',
                'logo' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:2048'
            ], [
                'nama_sekolah.required' => 'Nama sekolah wajib diisi',
                'email.email' => 'Format tidak valid',
                'logo.image' => 'Hanya boleh berisi gambar atau foto',
                'logo.mimes' => 'Format foto harus jpg, jpeg, atau webp',
                'logo.max' => 'Ukuran maksimal 2 MB'
            ]);

            if ($request->hasFile('logo')) {
                $validated['logo'] = $this->simpanFoto(
                    $request->file('logo'),
                    'logo', // folder penyimpanan
                    'logo' // nama si file
                );
            }

            $identitas = IdentitasSekolah::create($validated);

            return ApiResponse::success([
                'id' => $identitas->id,
                'npsn' => $identitas->npsn,
                'nama_sekolah' => $identitas->nama_sekolah,
                'status_sekolah' => $identitas->status_sekolah,
                'jenjang' => $identitas->jenjang,
                'alamat' => $identitas->alamat,
                'desa_kelurahan' => $identitas->desa_kelurahan,
                'kecamatan' => $identitas->kecamatan,
                'kabupaten_kota' => $identitas->kabupaten_kota,
                'provinsi' => $identitas->provinsi,
                'kode_pos' => $identitas->kode_pos,
                'email' => $identitas->email,
                'no_telepon' => $identitas->no_telepon,
                'kepala_sekolah' => $identitas->kepala_sekolah,
                'nip_kepala_sekolah' => $identitas->nip_kepala_sekolah,
                'visi' => $identitas->visi,
                'misi' => $identitas->misi,
                'logo' => $gedung->logo ? asset(str_replace('public/', 'storage/', $gedung->logo)) : null,                    
            ], 'Data identitas berhasil dibuat');
       } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
       }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            $identitas = IdentitasSekolah::find($id);

            if (!$identitas) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Data tidak ditemukan'
                ], 404);
            }

            $validated = $request->validate([
                'npsn' => 'nullable|string',
                'nama_sekolah' => 'sometimes|required|string',
                'status_sekolah' => 'nullable|string',
                'jenjang' => 'nullable|string',
                'alamat' => 'nullable|string',
                'desa_kelurahan' => 'nullable|string',
                'kecamatan' => 'nullable|string',
                'kabupaten_kota' => 'nullable|string',
                'provinsi' => 'nullable|string',
                'kode_pos' => 'nullable|string',
                'email' => 'nullable|email',
                'no_telepon' => 'nullable|string',
                'kepala_sekolah' => 'nullable|string',
                'nip_kepala_sekolah' => 'nullable|string',
                'visi' => 'nullable|string',
                'misi' => 'nullable|string',
                'logo' => 'sometimes|nullable|image|mimes:jpg,jpeg,png,webp|max:2048',                
            ], [
                'nama_sekolah.required' => 'Nama sekolah wajib diisi',
                'email.email' => 'Format tidak valid',
                'logo.image' => 'Hanya boleh berisi gambar atau foto',
                'logo.mimes' => 'Format foto harus jpg, jpeg, atau webp',
                'logo.max' => 'Maksimal ukuran foto 2 mb',
            ]);

            if ($request->hasFile('logo')) {

                // Ambil path lama dari database
                $oldPath = $identitas->logo;
            
                // Simpan file baru
                $validated['logo'] = $this->simpanFoto(
                    $request->file('logo'),
                    'logo',      // folder
                    $request->logo ?? $identitas->logo,
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

            $identitas->update($validated);

            return ApiResponse::success([
                'id' => $identitas->id,
                'npsn' => $identitas->npsn,
                'nama_sekolah' => $identitas->nama_sekolah,
                'status_sekolah' => $identitas->status_sekolah,
                'jenjang' => $identitas->jenjang,
                'alamat' => $identitas->alamat,
                'desa_kelurahan' => $identitas->desa_kelurahan,
                'kecamatan' => $identitas->kecamatan,
                'kabupaten_kota' => $identitas->kabupaten_kota,
                'provinsi' => $identitas->provinsi,
                'kode_pos' => $identitas->kode_pos,
                'email' => $identitas->email,
                'no_telepon' => $identitas->no_telepon,
                'kepala_sekolah' => $identitas->kepala_sekolah,
                'nip_kepala_sekolah' => $identitas->nip_kepala_sekolah,
                'visi' => $identitas->visi,
                'misi' => $identitas->misi,
                'logo' => $gedung->logo ? asset(str_replace('public/', 'storage/', $gedung->logo)) : null,                    
            ], 'Data identitas berhasil diperbarui');
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $identitas = IdentitasSekolah::find($id);

        if (!$identitas) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data tidak ditemukan'
            ], 404);
        }

        // Nilai contoh: "public/logo/logo.jpg"
        $storedPath = $identitas->logo;

        // Normalisasi ke path relatif disk 'public' → "logo/logo.jpg"
        $relativePath = ltrim(Str::of($storedPath)->replaceFirst('public/', ''), '/');

        // Hapus file bila ada
        if ($relativePath && Storage::disk('public')->exists($relativePath)) {
            Storage::disk('public')->delete($relativePath);
        }

        $identitas->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Data berhasil dihapus'
        ]);
    }
}
