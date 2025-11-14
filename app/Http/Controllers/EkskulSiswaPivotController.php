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
    // ✅ get all menggunakan EkstrakurikulerController::@index
    // public function index()
    // {
    //     $ekskul = Ekstrakurikuler::with(['peserta.siswa.jurusan', 'peserta.siswa.kelas'])->get();

    //     $formatted = $ekskul->map(function ($item) {
    //         return [
    //             'id' => $item->id,
    //             'nama_ekskul' => $item->nama_ekstrakurikuler,
    //             'jumlah_peserta' => $item->peserta->count(),
    //             'peserta' => $item->peserta->map(function ($pivot) {
    //                 $siswa = $pivot->siswa;
    //                 return [
    //                     'id' => $siswa->id,
    //                     'nama_siswa' => $siswa->nama,
    //                     'jurusan' => $siswa->jurusan->nama_jurusan ?? null,
    //                     'kelas' => $siswa->kelas->nama_kelas ?? null,
    //                 ];
    //             }),
    //         ];
    //     });

    //     return ApiResponse::success($formatted, 'Daftar ekstrakurikuler dan pesertanya berhasil diambil');
    // }

    // show nya menggunakan EkstrakurikulerController::@show

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

    // ! tidak ada update

    // destroy buat pegawai/pembina
    public function destroy($id)
    {
        $pivot = EkskulSiswaPivot::find($id);
        if (!$pivot) {
            return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $pivot->delete();
        return ApiResponse::success(null, 'Peserta berhasil dihapus');
    }


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


    // destroy buat siswa (diri sendiri)
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
