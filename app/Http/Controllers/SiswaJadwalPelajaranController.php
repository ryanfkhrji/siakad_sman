<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SiswaJadwalPelajaran;
use App\Models\Siswa;
use App\Models\JadwalPelajaran;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;

class SiswaJadwalPelajaranController extends Controller
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
                'siswa_id' => 'required|exists:siswas,id',
                'jadwal_pelajaran_id' => 'required|exists:jadwal_pelajarans,id'
            ],[
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'jadwal_pelajaran_id.required' => 'Jadwal pelajaran wajib diisi',
                'jadwal_pelajaran_id.exists' => 'Jadwal pelajaran tidak ditemukan',
            ]);

            // tidak boleh dobel pelajaran yang sama
            $existing = SiswaJadwalPelajaran::where('siswa_id', $validated['siswa_id'])
                ->where('jadwal_pelajaran_id', $validated['jadwal_pelajaran_id'])
                ->first();

            if ($existing) {
                return ApiResponse::error('Siswa sudah terdaftar di pelajaran ini', [
                    'siswa_id' => ['Siswa sudah terdaftar di pelajaran ini']
                ], 422);
            }

            $jadwalPivot = SiswaJadwalPelajaran::create($validated);

            $jadwalPivot->load('siswa', 'jadwal.mataPelajaran');
            
            return ApiResponse::success([
                'id' => $jadwalPivot->id ?? null,
                'nama_siswa' => $jadwalPivot->siswa->nama ?? null,
                'mata_pelajaran' => $jadwalPivot->jadwal->mataPelajaran->nama_pelajaran ?? null,
                'hari' => $jadwalPivot->jadwal->hari ?? null,
                'guru' => $jadwalPivot->jadwal->guru->nama ?? null,
                'kelas' => $jadwalPivot->jadwal->kelas->nama_kelas ?? null,
                'jam_pelajaran' => $jadwalPivot->jadwal->jam_pelajaran ?? null,
                'ruangan' => $jadwalPivot->jadwal->ruangan ?? null,
                'link_opsional' => $jadwalPivot->jadwal->link_opsional ?? null,
            ], 'Penetapan Jadwal Pelajaran Berhasil');

        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $jadwal = SiswaJadwalPelajaran::with([
            'siswa.kelas.wali',
            'siswa.jurusan',
            'siswa.ekstrakurikulers',
            'jadwal.mataPelajaran',
            'jadwal.guru',
            'jadwal.kelas'
        ])->find($id);

        if (!$jadwal) {
            return ApiResponse::error('Jadwal tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $jadwal->id,
            'nisn' => $jadwal->siswa->nisn,
            'nama' => $jadwal->siswa->nama,
            'email' => $jadwal->siswa->email,
            'nis' => $jadwal->siswa->nis,
            'nama_jurusan' => $jadwal->siswa->jurusan->nama_jurusan ?? null,
            'nama_ekstrakurikuler' => $jadwal->siswa->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
            'status' => $jadwal->siswa->status,
            'role' => $jadwal->siswa->role,
            'kelas' => [
                'id' => $jadwal->siswa->kelas->id ?? null,
                'nama_kelas' => $jadwal->siswa->kelas->nama_kelas ?? null,
                'jam_masuk' => $jadwal->siswa->kelas->jam_masuk ?? null,
                'wali_kelas' => [
                    'id' => $jadwal->siswa->kelas->wali->id ?? null,
                    'nama' => $jadwal->siswa->kelas->wali->nama ?? null,
                    'email' => $jadwal->siswa->kelas->wali->email ?? null,
                    'status' => $jadwal->siswa->kelas->wali->status ?? null,
                    'nip' => $jadwal->siswa->kelas->wali->nip ?? null,
                    'keterangan' => $jadwal->siswa->kelas->wali->keterangan ?? null,
                    'role' => $jadwal->siswa->kelas->wali->role ?? null,
                ],
            ],            
            'jadwal_pelajaran' => [
                    'id' => $jadwal->id,
                    'mata_pelajaran' => $jadwal->jadwal->mataPelajaran->nama_pelajaran ?? null,
                    'guru' => $jadwal->jadwal->guru->nama ?? null,
                    'kelas' => $jadwal->jadwal->kelas->nama_kelas ?? null,
                    'jam_pelajaran' => $jadwal->jadwal->jam_pelajaran ?? null,
                    'ruangan' => $jadwal->jadwal->ruangan ?? null,
                    'link_opsional' => $jadwal->jadwal->link_opsional ?? null,
            ]
        ];

        return ApiResponse::success($formatted, 'Detail jadwal berhasil diambil');
    }

    // public function show($id)
    // {
    //     $siswa = Siswa::with('kelas.wali', 'jurusan', 'ekstrakurikulers', 'jadwalPelajarans.mataPelajaran')->find($id);
    //     if (!$siswa) {
    //         return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
    //     }

    //     $formatted = [
    //         'id' => $siswa->id,
    //         'nisn' => $siswa->nisn,
    //         'nama' => $siswa->nama,
    //         'email' => $siswa->email,
    //         'nis' => $siswa->nis,
    //         'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
    //         'nama_ekstrakurikuler' => $siswa->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
    //         'status' => $siswa->status,
    //         'role' => $siswa->role,
    //         'kelas' => [
    //             'id' => $siswa->kelas->id ?? null,
    //             'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
    //             'jam_masuk' => $siswa->kelas->jam_masuk ?? null,
    //             'wali_kelas' => [
    //                 'id' => $siswa->kelas->wali->id ?? null,
    //                 'nama' => $siswa->kelas->wali->nama ?? null,
    //                 'email' => $siswa->kelas->wali->email ?? null,
    //                 'status' => $siswa->kelas->wali->status ?? null,
    //                 'nip' => $siswa->kelas->wali->nip ?? null,
    //                 'keterangan' => $siswa->kelas->wali->keterangan ?? null,
    //                 'role' => $siswa->kelas->wali->role ?? null,
    //             ],
    //         ],            
    //         'jadwal_pelajaran' => $siswa->jadwalPelajarans->map(function ($item) {
    //             return [
    //                 'id' => $item->id,
    //                 'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran,
    //                 'guru' => $item->guru->nama ?? null,
    //                 'kelas' => $item->kelas->nama_kelas ?? null,
    //                 'jam_pelajaran' => $item->jam_pelajaran ?? null,
    //                 'ruangan' => $item->ruangan ?? null,
    //                 'link_opsional' => $item->link_opsional ?? null,
    //             ];
    //         }),  
    //     ];

    //     return ApiResponse::success($formatted, 'Detail siswa berhasil diambil');
    // }

    // ✅ show jadwal sendiri untuk siswa
    public function showAllJadwalSendiri()
    {
        $user = Auth::guard('siswa')->user();

        $siswa = Siswa::with('kelas.wali', 'jurusan', 'ekstrakurikulers', 'jadwalPelajarans.mataPelajaran')->find($user->id);
        if (!$siswa) {
            return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $siswa->id,
            'nisn' => $siswa->nisn,
            'nama' => $siswa->nama,
            'email' => $siswa->email,
            'nis' => $siswa->nis,
            'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
            'nama_ekstrakurikuler' => $siswa->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
            'status' => $siswa->status,
            'role' => $siswa->role,
            'kelas' => [
                'id' => $siswa->kelas->id ?? null,
                'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
                'jam_masuk' => $siswa->kelas->jam_masuk ?? null,
                'wali_kelas' => [
                    'id' => $siswa->kelas->wali->id ?? null,
                    'nama' => $siswa->kelas->wali->nama ?? null,
                    'email' => $siswa->kelas->wali->email ?? null,
                    'status' => $siswa->kelas->wali->status ?? null,
                    'nip' => $siswa->kelas->wali->nip ?? null,
                    'keterangan' => $siswa->kelas->wali->keterangan ?? null,
                    'role' => $siswa->kelas->wali->role ?? null,
                ],
            ],            
            'jadwal_pelajaran' => $siswa->jadwalPelajarans->map(function ($item) {
                return [
                    'id' => $item->id,
                    'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran,
                    'guru' => $item->guru->nama ?? null,
                    'kelas' => $item->kelas->nama_kelas ?? null,
                    'jam_pelajaran' => $item->jam_pelajaran ?? null,
                    'ruangan' => $item->ruangan ?? null,
                    'link_opsional' => $item->link_opsional ?? null,
                ];
            }),  
        ];

        return ApiResponse::success($formatted, 'Semua jadwal siswa berhasil diambil');
    }

    /**
     * ✅ Update untuk super admin
     */
    public function update(Request $request, $id)
    {
        $pivot = SiswaJadwalPelajaran::find($id);

        if (!$pivot) {
            return ApiResponse::error('Siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'jadwal_pelajaran_id' => 'sometimes|required|exists:jadwal_pelajarans,id',
        ], [
            'jadwal_pelajaran_id.required' => 'Jadwal pelajaran wajib diisi',
            'jadwal_pelajaran_id.exists' => 'Jadwal pelajaran tidak ditemukan',
        ]);

       // tidak boleh dobel pelajaran yang sama
       $existing = SiswaJadwalPelajaran::where('siswa_id', $pivot->siswa_id)
       ->where('jadwal_pelajaran_id', $validated['jadwal_pelajaran_id'])
       ->first();

        if ($existing) {
            return ApiResponse::error('Siswa sudah terdaftar di pelajaran ini', [
                'jadwal_pelajaran_id' => ['Siswa sudah terdaftar di pelajaran ini']
            ], 422);
        }

       // Update hanya jadwal_pelajaran_id, siswa_id tidak boleh diubah
        $pivot->update([
            'jadwal_pelajaran_id' => $validated['jadwal_pelajaran_id']
        ]);

        // ambil siswa lengkap
        $siswa = $pivot->siswa()->with(
            'kelas.wali',
            'jurusan',
            'ekstrakurikulers',
            'jadwalPelajarans.mataPelajaran'
        )->first();

        return ApiResponse::success(
            [
                'id' => $siswa->id,
                'nisn' => $siswa->nisn,
                'nama' => $siswa->nama,
                'email' => $siswa->email,
                'nis' => $siswa->nis,
                'nama_jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                'nama_ekstrakurikuler' => $siswa->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
                'status' => $siswa->status,
                'role' => $siswa->role,
                'kelas' => [
                    'id' => $siswa->kelas->id ?? null,
                    'nama_kelas' => $siswa->kelas->nama_kelas ?? null,
                    'jam_masuk' => $siswa->kelas->jam_masuk ?? null,
                    'wali_kelas' => [
                        'id' => $siswa->kelas->wali->id ?? null,
                        'nama' => $siswa->kelas->wali->nama ?? null,
                        'email' => $siswa->kelas->wali->email ?? null,
                        'status' => $siswa->kelas->wali->status ?? null,
                        'nip' => $siswa->kelas->wali->nip ?? null,
                        'keterangan' => $siswa->kelas->wali->keterangan ?? null,
                        'role' => $siswa->kelas->wali->role ?? null,
                    ],
                ],            
                'jadwal_pelajaran' => $siswa->jadwalPelajarans->map(function ($item) {
                    return [
                        'id' => $item->id,
                        'mata_pelajaran' => $item->mataPelajaran->nama_pelajaran,
                        'guru' => $item->guru->nama ?? null,
                        'kelas' => $item->kelas->nama_kelas ?? null,
                        'jam_pelajaran' => $item->jam_pelajaran ?? null,
                        'ruangan' => $item->ruangan ?? null,
                        'link_opsional' => $item->link_opsional ?? null,
                    ];
                }),  
            ],
            'Jadwal siswa berhasil diperbarui'
        );
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $matpel = SiswaJadwalPelajaran::find($id);
        if (!$matpel) {
            return ApiResponse::error('Jadwal pelajaran siswa tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $matpel->delete();
        return ApiResponse::success(null, 'Jadwal pelajaran siswa berhasil dihapus');
    }
}
