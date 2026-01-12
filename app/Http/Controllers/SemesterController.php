<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Semester;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;

class SemesterController extends Controller
{
    /**
     * ✅ Untuk spa
     */
    public function index()
    {
        $semesters = Semester::with('tahunAkademik')->get();

        if ($semesters->isEmpty()) {
            return ApiResponse::error(
                'No data',
                ['data' => 'Belum ada data semester']
            );
        }

        $formatted = $semesters
            ->groupBy('tahun_akademik_id')
            ->map(function ($group) {
                $tahunAkademik = $group->first()->tahunAkademik;

                return [
                    'tahun_akademik_id' => $tahunAkademik->id,
                    'tahun_akademik' => $tahunAkademik->tahun_akademik,
                    'status_tahun_akademik' => $tahunAkademik->status,
                    'semesters' => $group->map(function ($semester) {
                        return [
                            'semester_id' => $semester->id,
                            'semester' => $semester->semester,
                            'status_semester' => $semester->status,
                        ];
                    })->values(),
                ];
            })
            ->values();

        return ApiResponse::success(
            $formatted,
            'Daftar semester berhasil diambil'
        );
    }


    /**
     * ✅ untuk spa
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([                
                'tahun_akademik_id' => 'required|exists:tahun_akademik,id',                
                'semester' => 'required|in:Ganjil,Genap',            
            ],[
                'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
                'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',                
                'semester.required' => 'Semester wajib diisi',
                'semester.in' => 'Pilihan semester hanya Ganjil dan Genap',
            ]);                        

            // cegah create sebelum semua semester menjadi arsip
            $semesterAktif = Semester::where('status', 'aktif')->exists();

            if ($semesterAktif) {
                return ApiResponse::error('Double aktif', ['pesan' => 'Masih ada semester lain yang aktif, arsipkan terlebih dahulu']);
            }

            // cek duplikasi
            if (
                isset($validated['tahun_akademik_id'], $validated['semester'])
            ) {
                $unik = Semester::where('tahun_akademik_id', $validated['tahun_akademik_id'])
                    ->where('semester', $validated['semester'])
                    ->where('id', '!=', $semester->id)
                    ->exists();
    
                if ($unik) {
                    return ApiResponse::error(
                        'Duplicated',
                        ['data' => 'Semester pada tahun akademik ini sudah ada'],
                        422
                    );
                }
            }

            $semester = Semester::create([
                'tahun_akademik_id' => $validated['tahun_akademik_id'],
                'semester' => $validated['semester'],
                'status' => 'aktif',
            ]);

            $semester->load('tahunAkademik');

            return ApiResponse::success([
                'id' => $semester->id ?? null,
                'tahun_akademik' => $semester->tahunAkademik->tahun_akademik ?? null,                
                'status' => $semester->status ?? null,
            ], 'Data semester berhasil dibuat');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * ! tidak ada (show menggunakan TahunAkademikController::show)
     */
    public function show(string $id)
    {
        //
    }

    /**
     * ✅ spa
     */
    public function update(Request $request, string $id)
    {
        $semester = Semester::find($id);

        if (! $semester) {
            return ApiResponse::error(
                'Not found',
                ['id' => ['Data tidak ditemukan']],
                404
            );
        }

        $validated = $request->validate([
            'tahun_akademik_id' => [
                'sometimes',
                'required',
                'exists:tahun_akademik,id',
            ],
            'semester' => 'sometimes|required|in:Ganjil,Genap',
            'status' => 'sometimes|required|in:aktif,arsip',
        ], [
            'tahun_akademik_id.required' => 'Wajib diisi',
            'tahun_akademik_id.exists' => 'Tahun akademik tidak valid',
            'status.required' => 'Status wajib diisi',
            'status.in' => 'Pilihan status hanya aktif dan arsip',
        ]);

        /**
         * 🚫 Larangan: arsip → aktif
         */
        if (
            $semester->status === 'arsip'
            && isset($validated['status'])
            && $validated['status'] === 'aktif'
        ) {
            return ApiResponse::error(
                'Kesalahan',
                ['status' => 'Semester yang sudah diarsipkan tidak dapat diaktifkan kembali'],
                422
            );
        }

        /**
         * 🔒 Cek duplikasi
         */
        if (
            isset($validated['tahun_akademik_id'], $validated['semester'])
        ) {
            $unik = Semester::where('tahun_akademik_id', $validated['tahun_akademik_id'])
                ->where('semester', $validated['semester'])
                ->where('id', '!=', $semester->id)
                ->exists();

            if ($unik) {
                return ApiResponse::error(
                    'Duplicated',
                    ['data' => 'Semester pada tahun akademik ini sudah ada'],
                    422
                );
            }
        }

        $semester->update($validated);
        $semester->load('tahunAkademik');

        return ApiResponse::success([
            'id' => $semester->id,
            'tahun_akademik' => $semester->tahunAkademik->tahun_akademik ?? null,
            'semester' => $semester->semester,
            'status' => $semester->status,
        ], 'Data semester berhasil diperbarui');
    }


    /**
     * ✅ spa
     */
    public function destroy(string $id)
    {
        $semester = Semester::find($id);

        if (!$semester) {
            return ApiResponse::error('Not found', ['id' => ['Data tidak ditemukan']], 404);
        }

        $dipakaiJadwal = $semester->jadwalPelajarans()->exists();
        $dipakaiBerkas = $semester->dataBerkas()->exists();

        if ($dipakaiJadwal) {
            return ApiResponse::error(
                'Semester tidak dapat dihapus',
                [
                    'pesan' => [
                        'Semester sudah digunakan pada jadwal pelajaran'
                    ]
                ],
                422
            );
        }
        if ($dipakaiBerkas) {
            return ApiResponse::error(
                'Semester tidak dapat dihapus',
                [
                    'pesan' => [
                        'Semester sudah digunakan pada data berkas'
                    ]
                ],
                422
            );
        }

        $semester->delete();
        return ApiResponse::success(null, 'Semester berhasil dihapus');
    }
}
