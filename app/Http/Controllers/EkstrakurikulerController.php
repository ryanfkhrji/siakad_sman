<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ekstrakurikuler;
use App\Models\Kepegawaian;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;

class EkstrakurikulerController extends Controller
{
    public function index()
    {
        $ekskul = Ekstrakurikuler::with('siswas.pengajar')->withCount('siswas')->get();

        $formatted = $ekskul->map(function ($item) {
            return [
                'id' => $item->id,
                'nama_ekstrakurikuler' => $item->nama_ekstrakurikuler,
                'nama_pengajar' => $item->pengajar->nama ?? null,
                'anggaran' => $item->anggaran,
                'status' => $item->status,
                'jumlah_peserta' => $item->siswas->count(),
                'peserta' => $item->siswas->map(function ($siswa) {
                    return [
                        'id' => $siswa->id,
                        'nama_siswa' => $siswa->nama,
                        'jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                        'kelas' => $siswa->kelas->nama_kelas ?? null,
                    ];
                }),

            ];
        });

        return ApiResponse::success($formatted, 'Daftar Ekstrakurikuler berhasil diambil');
    }

    public function show($id)
    {
        $ekskul = Ekstrakurikuler::with('siswas.pengajar')
            ->withCount('siswas')
            ->find($id);

        if (!$ekskul) {
            return ApiResponse::error('Ekstrakurikuler tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $ekskul->id,
            'nama_ekstrakurikuler' => $ekskul->nama_ekstrakurikuler,
            'nama_pengajar' => $ekskul->pengajar->nama,
            'jumlah_peserta' => $ekskul->siswas_count,
            'anggaran' => $ekskul->anggaran,
            'status' => $ekskul->status,
            'peserta' => $ekskul->siswas->map(function ($siswa) {
                return [
                    'id_pivot' => $siswa->pivot->id,
                    'id' => $siswa->id,
                    'nama_siswa' => $siswa->nama,
                    'jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                    'kelas' => $siswa->kelas->nama_kelas ?? null,
                ];
            }),

        ];

        return ApiResponse::success($formatted, 'Detail ekstrakurikuler berhasil diambil');
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_ekstrakurikuler' => 'required|string|unique:ekstrakurikulers,nama_ekstrakurikuler',
                'pengajar_id' => 'exists:kepegawaians,id|unique:ekstrakurikulers,pengajar_id',
                'anggaran' => 'required|numeric',
                'status' => 'string',
            ], [
                'nama_ekstrakurikuler.required' => 'Nama ekskul wajib diisi',
                'nama_ekstrakurikuler.unique' => 'Nama ekskul sudah ada',
                'pengajar_id.required' => 'Pengajar wajib diisi',
                'pengajar_id.exists' => 'Pengajar tidak ditemukan',
                'pengajar_id.unique' => 'Tidak bisa, pegawai sudah menjadi pengajar',
                'anggaran.required' => 'Anggaran wajib diisi',
            ]);

            if (isset($validated['pengajar_id'])) {
                $wali = Kepegawaian::find($validated['pengajar_id']);
                if (!$wali || $wali->role !== 'guru' && $wali->role !== 'staff') {
                    return ApiResponse::error('Pengajar bukan guru atau staff', [
                        'pengajar_id' => ['Pengajar tidak ditemukan']
                    ], 422);
                }
            }

            $ekstrakurikuler = Ekstrakurikuler::create($validated);
            $ekstrakurikuler->load('pengajar');

            return ApiResponse::success([
                'id' => $ekstrakurikuler->id,
                'nama_ekstrakurikuler' => $ekstrakurikuler->nama_ekstrakurikuler,
                'pengajar' => $ekstrakurikuler->pengajar->nama,
                'anggaran' => $ekstrakurikuler->anggaran,
                'status' => $ekstrakurikuler->status,
            ], 'Ekstrakurikuler berhasil dibuat');
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    public function update(Request $request, $id)
    {
        $ekskul = Ekstrakurikuler::find($id);
        if (!$ekskul) {
            return ApiResponse::error('Ekstrakurikuler tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_ekstrakurikuler' => [
                'sometimes',
                'required',
                Rule::unique('ekstrakurikulers')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],
            'pengajar_id' => [
                'sometimes',
                'exists:kepegawaians,id',
                Rule::unique('ekstrakurikulers')->ignore($id) // 1 guru cuma bisa jadi 1 wali kelas
            ],
            'anggaran' => 'sometimes|required|numeric',
            'status' => 'sometimes'
        ], [
            'nama_ekstrakurikuler.required' => 'Nama ekskul wajib diisi',
            'nama_ekstrakurikuler.unique' => 'Nama ekskul sudah ada',
            'pengajar_id.exists' => 'Pengajar tidak ditemukan',
            'pengajar_id.unique' => 'Tidak bisa, pegawai ini sudah menjadi pengajar',
            'anggaran.required' => 'Anggaran wajib diisi',
        ]);

        if (isset($validated['pengajar_id'])) {
            $wali = Kepegawaian::find($validated['pengajar_id']);
            if (!$wali || $wali->role !== 'guru' && $wali->role !== 'staff') {
                return ApiResponse::error('Pengajar bukan guru atau staff', [
                    'pengajar_id' => ['Pengajar tidak ditemukan']
                ], 422);
            }
        }

        $ekskul->update($validated);
        $ekskul->load('pengajar');

        return ApiResponse::success(
            [
                'id' => $ekskul->id,
                'nama_ekstrakurikuler' => $ekskul->nama_ekstrakurikuler,
                'pengajar' => $ekskul->pengajar->nama,
                'anggaran' => $ekskul->anggaran,
                'status' => $ekskul->status,
            ],
            'Ekstrakurikuler berhasil diperbarui'
        );
    }

    public function destroy($id)
    {
        $ekskul = Ekstrakurikuler::find($id);
        if (!$ekskul) {
            return ApiResponse::error('Ekstrakurikuler tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek apakah kelas masih punya siswa
        if ($ekskul->siswas()->exists()) {
            return ApiResponse::error('Ekstrakurikuler tidak bisa dihapus karena masih memiliki siswa', [
                'nama_ekstrakurikuler' => ['Ekstrakurikuler ini masih digunakan oleh siswa']
            ], 422);
        }

        $ekskul->delete();
        return ApiResponse::success(null, 'Ekstrakurikuler berhasil dihapus');
    }
}
