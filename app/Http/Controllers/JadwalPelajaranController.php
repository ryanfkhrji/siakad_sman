<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Helpers\ApiResponse;
use App\Models\JadwalPelajaran;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;

class JadwalPelajaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $jadwal = JadwalPelajaran::with(['mataPelajaran', 'guru', 'kelas', 'siswas'])->get();

        $formatted = $jadwal->map(function ($item) {
            return [
                'id' => $item->id,
                'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran,
                'hari' => $item->hari,
                'guru' => $item->guru->nama,
                'kelas' => $item->kelas->nama_kelas,
                'jam_pelajaran' => $item->jam_pelajaran,
                'ruangan' => $item->ruangan,
                'link_opsional' => $item->link_opsional,
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

        return ApiResponse::success($formatted, 'Daftar jadwal pelajaran berhasil diambil');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'mata_pelajaran_id' => 'required|exists:mata_pelajarans,id',
                'hari' => 'required',
                'guru_id' => 'required|exists:kepegawaians,id',
                'kelas_id' => 'required|exists:kelas,id',
                'jam_pelajaran' => 'required',
                'ruangan' => 'nullable',
                'link_opsional' => 'nullable'
            ], [
                'mata_pelajaran_id.required' => 'Mata pelajaran wajib diisi',
                'mata_pelajaran_id.exists' => 'Mata pelajaran tidak ditemukan',
                'hari.required' => 'Hari wajib diisi',
                'guru_id.required' => 'Guru wajib diisi',
                'guru_id.exists' => 'Guru tidak ditemukan',
                'kelas_id.required' => 'Kelas wajib diisi',
                'kelas_id.exists' => 'Kelas tidak ditemukan',
                'jam_pelajaran' => 'Jam pelajaran wajib diisi'
            ]);

            // tidak boleh dobel pelajaran yang sama
            // $existing = JadwalPelajaran::where('guru_id', $validated['guru_id'])
            //     ->where('mata_pelajaran_id', $validated['mata_pelajaran_id'])
            //     ->first();

            // if ($existing) {
            //     return ApiResponse::error('Guru sudah terdaftar di pelajaran ini', [
            //         'guru_id' => ['Guru sudah terdaftar di pelajaran ini']
            //     ], 422);
            // }

            // pelajaran harus sama dan tidak boleh berbeda
            $existing = JadwalPelajaran::where('guru_id', $validated['guru_id'])->first();

            if ($existing) {
                if ($existing->mata_pelajaran_id != $validated['mata_pelajaran_id']) {
                    return ApiResponse::error('Not allowed', [
                        'pesan' => ['Satu guru hanya boleh satu mata pelajaran']
                    ], 422);
                }
            }
    
            $matpel = JadwalPelajaran::create($validated);
            
            $matpel->load('mataPelajaran', 'guru', 'kelas');
            
            return ApiResponse::success([
                'id' => $matpel->id,
                'mata_pelajaran' => $matpel->mataPelajaran->nama_pelajaran,
                'hari' => $matpel->hari,
                'guru' => $matpel->guru->nama,
                'kelas' => $matpel->kelas->nama_kelas,
                'jam_pelajaran' => $matpel->jam_pelajaran,
                'ruangan' => $matpel->ruangan,
                'link_opsional' => $matpel->link_opsional,
            ], 'Jadwal Pelajaran Berhasil Dibuat');
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $matpel = JadwalPelajaran::with(['mataPelajaran', 'guru', 'kelas', 'siswas'])->find($id);

        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $matpel->id,
            'mata_pelajaran' => $matpel->mataPelajaran->nama_pelajaran,
            'hari' => $matpel->hari,
            'guru' => $matpel->guru->nama,
            'kelas' => $matpel->kelas->nama_kelas,
            'jam_pelajaran' => $matpel->jam_pelajaran,
            'ruangan' => $matpel->ruangan,
            'link_opsional' => $matpel->link_opsional,    
            'peserta' => $matpel->siswas->map(function ($siswa) {
                return [
                    'id' => $siswa->id,
                    'nama_siswa' => $siswa->nama,
                    'jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                    'kelas' => $siswa->kelas->nama_kelas ?? null,
                ];
            }),             
        ];

        return ApiResponse::success($formatted, 'Detail jadwal pelajaran berhasil diambil');
    }

    // ✅ show jadwal sendiri untuk pegawai
    public function showAllJadwalSendiri()
    {
        $pegawai = Auth::guard('kepegawaian')->user();

        $jadwal = JadwalPelajaran::with(['mataPelajaran', 'guru', 'kelas'])
            ->where('guru_id', $pegawai->id)
            ->get(); // pakai get kalau guru punya banyak jadwal

        if ($jadwal->isEmpty()) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'nama' => $pegawai->nama,
            'jadwal' => $jadwal->map(function ($item) {
                return [
                    'id' => $item->id,
                    'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran,
                    'hari' => $item->hari,
                    'kelas' => $item->kelas->nama_kelas,
                    'jam_pelajaran' => $item->jam_pelajaran,
                    'ruangan' => $item->ruangan,
                    'link_opsional' => $item->link_opsional,
                ];
            }),
        ];

        return ApiResponse::success($formatted, 'Jadwal pelajaran berhasil diambil');
    }    

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $matpel = JadwalPelajaran::find($id);

        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'hari' => 'sometimes|required',
            'kelas_id' => 'sometimes|required|exists:kelas,id',
            'jam_pelajaran' => 'sometimes|required',
            'ruangan' => 'sometimes|nullable',
            'link_opsional' => 'sometimes|nullable',
        ],[
            'hari.required' => 'Hari wajib diisi',
            'kelas_id.required' => 'Kelas wajib diisi',
            'kelas_id.exists' => 'Kelas tidak ditemukan',
            'jam_pelajaran.required' => 'Jam pelajaran wajib diisi',
        ]);

       // guru_id dan mata_pelajaran_id tidak boleh diupdate (karna harus sama)
        $matpel->update([        
            'hari' => $validated['hari'],
            'kelas_id' => $validated['kelas_id'],
            'jam_pelajaran' => $validated['jam_pelajaran'],
            'ruangan' => $validated['ruangan'],
            'link_opsional' => $validated['link_opsional'],
        ]);

        $matpel->load(['mataPelajaran', 'guru', 'kelas']);
        
        return ApiResponse::success(
            [
                'id' => $matpel->id,
                'mata_pelajaran' => $matpel->mataPelajaran->nama_pelajaran,
                'hari' => $matpel->hari,
                'guru' => $matpel->guru->nama,
                'kelas' => $matpel->kelas->nama_kelas,
                'jam_pelajaran' => $matpel->jam_pelajaran,
                'ruangan' => $matpel->ruangan,
                'link_opsional' => $matpel->link_opsional,
            ], 'Jadwal pelajaran berhasil diperbarui');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $matpel = JadwalPelajaran::find($id);
        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $matpel->delete();
        return ApiResponse::success(null, 'Jadwal pelajaran berhasil dihapus');
    }
}
