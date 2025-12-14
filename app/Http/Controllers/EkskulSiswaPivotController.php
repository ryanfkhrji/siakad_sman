<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EkskulSiswaPivot;
use App\Models\Siswa;
use App\Models\Ekstrakurikuler;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;

class EkskulSiswaPivotController extends Controller
{
    // ✅ get all ekskul sendiri (siswa)
    public function getAllEkskulSendiri()
    {
        $siswa = Auth::guard('siswa')->user();

        $ekskul = EkskulSiswaPivot::with([
                'siswa',
                'ekstrakurikuler.pengajar', // tambahkan relasi pengajar dari pivot
                'ekstrakurikuler.siswas'
            ])
            ->where('siswa_id', $siswa->id)
            ->get();

        $hasil = $ekskul->map(function ($item) {
            return [
                'pivot_id'      => $item->id,
                'nama_ekskul'   => $item->ekstrakurikuler->nama_ekstrakurikuler ?? null,
                'nama_pengajar' => optional($item->ekstrakurikuler->pengajar)->nama, // ambil dari pivot
                'jumlah_peserta'  => $item->ekstrakurikuler->siswas->count() ?? 0,
                'peserta' => $item->ekstrakurikuler->siswas->map(function ($sis) {
                    return [
                        'id' => $sis->id,
                        'nama_siswa' => $sis->nama,
                        'jurusan' => $sis->jurusan->nama_jurusan ?? null,
                        'kelas' => $sis->kelas->nama_kelas ?? null,
                        'sikap' => $sis->sikap ?? null,
                    ];
                }), 
            ];
        });

        return response()->json([
            'status'       => 'success',
            'nama'         => $siswa->nama,
            'total_ekskul' => $hasil->count(),
            'data'         => $hasil
        ]);
    }


    // ✅ mendaftarkan siswa oleh spa/guru
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',
                'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id',
            ], [
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
                'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',
            ]);

            // temukan id yang sesuai
            $siswa = Siswa::find($validated['siswa_id']);

            // kalo role nya bukan siswa, maka gabisa ikut ekskul
            if (!$siswa || $siswa->role !== 'siswa') {
                return ApiResponse::error('Siswa tidak ditemukan', [
                    'siswa_id' => ['Siswa tidak ditemukan']
                ], 422);
            }

            $existing = EkskulSiswaPivot::where('siswa_id', $validated['siswa_id'])
                ->where('ekstrakurikuler_id', $validated['ekstrakurikuler_id'])
                ->first();

            if ($existing) {
                return ApiResponse::error('Siswa sudah terdaftar di ekskul ini', [
                    'siswa_id' => ['Siswa sudah terdaftar di ekskul ini']
                ], 422);
            }

            $pivot = EkskulSiswaPivot::create($validated);
            $pivot->load('siswa', 'ekstrakurikuler');

            return ApiResponse::success([
                'id' => $pivot->id,
                'nama_siswa' => $pivot->siswa->nama,
                'nama_ekskul' => $pivot->ekstrakurikuler->nama_ekstrakurikuler,
                'nama_pengajar' => $pivot->ekstrakurikuler->pengajar->nama,
            ], 'Pendaftaran berhasil');
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ untuk spa/guru
    public function update(Request $request, string $id)
    {
        $ekskul = EkskulSiswaPivot::with('ekstrakurikuler', 'siswa')->find($id);

        if (!$ekskul) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([
            'sikap' => 'sometimes|nullable|in:Sangat Baik,Baik,Cukup,Kurang',            
        ],[
            'sikap.in' => 'Pilihan hanya Sangat Baik, Baik, Cukup, Kurang'
        ]);       

        $ekskul->update($validated);

        return ApiResponse::success([
            'ekskul_siswa_pivot_id' => $ekskul->id ?? null,
            'nama_siswa' => $ekskul->siswa->nama ?? null,
            'nama_ekskul' => $ekskul->ekstrakurikuler->nama_ekstrakurikuler ?? null,
            'sikap' => $ekskul->sikap ?? null,
        ], 'Data berhasil diperbarui');
    }

    // ✅ destroy buat pegawai/pembina oleh super admim
    public function destroy($id)
    {
        $pivot = EkskulSiswaPivot::find($id);
        if (!$pivot) {
            return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $pivot->delete();
        return ApiResponse::success(null, 'Peserta berhasil dihapus');
    }


    // ✅ siswa daftar sendiri
    public function storeSiswa($id)
    {

        // ambil id siswa yang lagi login
        $siswa = Auth::id();

        // cocokkan dengan id eskul yang di klik
        $existing = EkskulSiswaPivot::where('siswa_id', $siswa)
            ->where('ekstrakurikuler_id', $id)
            ->first();

        if ($existing) {
            return ApiResponse::error('Siswa sudah terdaftar di ekskul ini', [
                'siswa_id' => ['Siswa sudah terdaftar di ekskul ini']
            ], 422);
        }

        $pivot = EkskulSiswaPivot::create([
            'siswa_id' => $siswa,
            'ekstrakurikuler_id' => $id
        ]);

        $pivot->load('siswa', 'ekstrakurikuler');

        return ApiResponse::success([
            'id' => $pivot->id,
            'nama_siswa' => $pivot->siswa->nama,
            'nama_ekskul' => $pivot->ekstrakurikuler->nama_ekstrakurikuler,
            'nama_pengajar' => $pivot->ekstrakurikuler->pengajar->nama,
        ], 'Pendaftaran berhasil');
    }


    // ✅ destroy buat siswa (diri sendiri)
    /**
     * Delete:
       * 1. id -> login (2)
       * 2. ambil id eskul (2)
       * 3. cocokin id dimana id_siswa = id && id_eskul = id_eskul = 1
     */
    public function destroySiswa($id)
    {
        $id_siswa = Auth::id();

        $pivot = EkskulSiswaPivot::where([
            ['siswa_id', '=', $id_siswa],
            ['ekstrakurikuler_id', '=', $id],
        ])->first();

        if (!$pivot) {
            return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $pivot->delete();
        return ApiResponse::success(null, 'Peserta berhasil keluar');
    }
}
