<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Kelas;
use Illuminate\Support\Facades\Hash;
use App\Models\Kepegawaian;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class KelasController extends Controller
{
    // ✅ show all kelas oleh super admin
    public function index()
    {
        $kelas = Kelas::with('wali', 'jurusan')->withCount('siswa')->get();

        $formatted = $kelas->map(function ($item) {
            return [
                'id' => $item->id ?? null,
                'nama_kelas' => $item->nama_kelas ?? null,
                'nama_jurusan' => $item->jurusan->nama_jurusan ?? null,
                'jam_masuk' => $item->jam_masuk ?? null,
                'jumlah_siswa' => $item->siswa_count ?? null,
                'wali_kelas' => [
                    'id' => $item->wali->id ?? null,
                    'nama' => $item->wali->nama ?? null,
                    'role' => $item->wali->role ?? null,
                ]
            ];
        });

        return ApiResponse::success($formatted, 'Daftar kelas berhasil diambil');

    }

    // ✅ show kelas oleh super admin
    public function show($id)
    {
        $kelas = Kelas::with('siswa.jurusan', 'wali', 'jurusan')
            ->withCount('siswa')
            ->find($id);

        if (!$kelas) {
            return ApiResponse::error('Kelas tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
                'id' => $kelas->id,
                'nama_kelas' => $kelas->nama_kelas,
                'jurusan' => $kelas->jurusan->nama_jurusan,
                'jam_masuk' => $kelas->jam_masuk,                
                'jumlah_siswa' => $kelas->siswa_count,                
                'wali' => [
                    'id' => $kelas->wali->id ?? null,
                    'nama' => $kelas->wali->nama ?? null,
                    'role' => $kelas->wali->role ?? null,
                ],
                'siswa' => $kelas->siswa->map(function ($siswa) {
                    return [
                        'id' => $siswa->id,
                        'nama_siswa' => $siswa->nama,
                        'jurusan' => $siswa->jurusan->nama_jurusan ?? null,
                        'kelas' => $siswa->kelas->nama_kelas ?? null,
                    ];
                }),
                
            ];

        return ApiResponse::success($formatted, 'Detail kelas berhasil diambil');
    }

    // ✅ show kelas sendiri oleh siswa
    public function showKelasSendiri()
    {
        $siswa = Auth::guard('siswa')->user();

        $kelas = Kelas::with('siswa.jurusan', 'wali', 'jurusan')
            ->withCount('siswa')
            ->find($siswa->kelas_id);

        if (!$kelas) {
            return ApiResponse::error('Kelas tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
                'id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'nama_jurusan' => $kelas->jurusan->nama_jurusan ?? null,
                'jam_masuk' => $kelas->jam_masuk ?? null,                
                'jumlah_siswa' => $kelas->siswa_count ?? null,                
                'wali' => [
                    'id' => $kelas->wali->id ?? null,
                    'nama' => $kelas->wali->nama ?? null,
                    'role' => $kelas->wali->role ?? null,
                ],
            ];

        return ApiResponse::success($formatted, 'Detail kelas berhasil diambil');
    }

    // ✅ show kelas sendiri oleh pegawai
    public function showKelasPegawai()
    {
        $pegawai = Auth::guard('kepegawaian')->user();

        $kelas = Kelas::with('siswa.jurusan', 'wali', 'jurusan')
            ->withCount('siswa')
            ->where('wali_kelas', $pegawai->id)
            ->first();

        if (!$kelas) {
            return ApiResponse::error('Kelas tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $formatted = [
            'id' => $kelas->id ?? null,
            'nama_kelas' => $kelas->nama_kelas ?? null,
            'nama_jurusan' => $kelas->jurusan->nama_jurusan ?? null,
            'jam_masuk' => $kelas->jam_masuk ?? null,
            'jumlah_siswa' => $kelas->siswa_count ?? null,
            'wali' => [
                'id' => $kelas->wali->id ?? null,
                'nama' => $kelas->wali->nama ?? null,
                'role' => $kelas->wali->role ?? null,
            ],
            'anggota' => $kelas->siswa->map(function ($s) {
                return [
                    'id' => $s->id,
                    'nisn' => $s->nisn,
                    'nama' => $s->nama,
                    'email' => $s->email,
                    'nis' => $s->nis,
                    'nama_jurusan' => $s->jurusan->nama_jurusan ?? null,
                    'nama_ekstrakurikuler' => $s->ekstrakurikulers->pluck('nama_ekstrakurikuler')->implode(', '),
                    'status' => $s->status,
                ];
            }),
        ];        

        return ApiResponse::success($formatted, 'Detail kelas berhasil diambil');
    }

    // ✅ create kelas oleh super admin
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'nama_kelas' => 'required|string',
                'jurusan_id' => 'nullable|exists:jurusans,id',
                'jam_masuk' => 'required|string',
                'wali_kelas' => 'required|exists:kepegawaians,id|unique:kelas,wali_kelas',
            ], [
                'nama_kelas.required' => 'Nama kelas wajib diisi',
                'jurusan_id.exists' => 'Jurusan tidak ditemukan',
                'jam_masuk.required' => 'Jam masuk wajib diisi',
                'wali_kelas.required' => 'Wali kelas wajib diisi id guru',
                'wali_kelas.unique' => 'Tidak bisa, guru ini sudah menjadi wali kelas',
                'wali_kelas.exists' => 'Wali kelas tidak ditemukan',
            ]);
    
            // temukan id yang sesuai
            $wali = Kepegawaian::find($validated['wali_kelas']);
            
            // kalo role nya bukan guru, maka gabisa jadi wali kelas
            if (!$wali || $wali->role !== 'guru') {
                return ApiResponse::error('Wali kelas tidak ditemukan', [
                    'wali_kelas' => ['Wali kelas tidak ditemukan']
                ], 422);
            }
    
            $kelas = Kelas::create($validated);
            $kelas->load('wali', 'jurusan');
            
            return ApiResponse::success([
                'id' => $kelas->id,
                'nama_kelas' => $kelas->nama_kelas,
                'nama_jurusan' => $kelas->jurusan->nama_jurusan,
                'jam_masuk' => $kelas->jam_masuk,
                'wali_kelas' => $kelas->wali_kelas,
                'wali' => [
                    'id' => $kelas->wali->id ?? null,
                    'nama' => $kelas->wali->nama ?? null,
                    'role' => $kelas->wali->role ?? null,
                ]
            ], 201);
    
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ update kelas oleh super admin
    public function update(Request $request, $id)
    {
        $kelas = Kelas::find($id);
        if (!$kelas) {
            return ApiResponse::error('Kelas tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_kelas' => [
                'sometimes',
                'required',
                Rule::unique('kelas')->ignore($id) // Periksa semua unik kecuali yang sedang diedit
            ],
            'jurusan_id' => 'sometimes|nullable',
            'jam_masuk' => 'sometimes|required',
            'wali_kelas' => [
                'sometimes',
                'required',
                'exists:kepegawaians,id',
                Rule::unique('kelas')->ignore($id) // 1 guru cuma bisa jadi 1 wali kelas
            ],
        ],[
            'nama_kelas.required' => 'Nama kelas wajib diisi',
            'nama_kelas.unique' => 'Nama kelas sudah ada',
            'jam_masuk.required' => 'Jam masuk wajib diisi',
            'wali_kelas.exists' => 'Wali kelas tidak ditemukan',
            'wali_kelas.unique' => 'Tidak bisa, guru ini sudah menjadi wali kelas',
        ]);

        if (isset($validated['wali_kelas'])) {
            $wali = Kepegawaian::find($validated['wali_kelas']);
            if (!$wali || $wali->role !== 'guru') {
                return ApiResponse::error('Wali kelas tidak ditemukan atau bukan guru', [
                    'wali_kelas' => ['Wali kelas tidak ditemukan']
                ], 422);
            }
        }

        $kelas->update($validated);
        $kelas->load('jurusan');
        
        return ApiResponse::success(
            [
                'id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'nama_jurusan' => $kelas->jurusan->nama_jurusan ?? null,
                'jam_masuk' => $kelas->jam_masuk ?? null,
                'wali_kelas' => $kelas->wali_kelas ?? null,
            ], 'Kelas berhasil diperbarui');
    }

    // ✅ update kelas pegawai oleh diri sendiri
    public function updateKelasPegawai(Request $request)
    {
        
        $pegawai = Auth::guard('kepegawaian')->user();

        $kelas = Kelas::with('wali')
            ->where('wali_kelas', $pegawai->id)
            ->first();

        if (!$kelas) {
            return ApiResponse::error('Kelas tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $validated = $request->validate([
            'nama_kelas' => [
                'sometimes',
                'required',
                Rule::unique('kelas')->ignore($pegawai->id) // Periksa semua unik kecuali yang sedang diedit
            ],
            'jurusan_id' => 'sometimes|nullable',
            'jam_masuk' => 'sometimes|required',
            'wali_kelas' => [
                'sometimes',
                'required',
                'exists:kepegawaians,id',
                Rule::unique('kelas')->ignore($pegawai->id) // 1 guru cuma bisa jadi 1 wali kelas
            ],
        ],[
            'nama_kelas.required' => 'Nama kelas wajib diisi',
            'nama_kelas.unique' => 'Nama kelas sudah ada',
            'jam_masuk.required' => 'Jam masuk wajib diisi',
            'wali_kelas.exists' => 'Wali kelas tidak ditemukan',
            'wali_kelas.unique' => 'Tidak bisa, guru ini sudah menjadi wali kelas',
        ]);

        if (isset($validated['wali_kelas'])) {
            $wali = Kepegawaian::find($validated['wali_kelas']);
            if (!$wali || $wali->role !== 'guru') {
                return ApiResponse::error('Wali kelas tidak ditemukan atau bukan guru', [
                    'wali_kelas' => ['Wali kelas tidak ditemukan']
                ], 422);
            }
        }

        $kelas->update([
            'nama_kelas' => $validated['nama_kelas'] ?? null,
            'jurusan_id' => $validated['jurusan_id'] ?? null,
            'jam_masuk' => $validated['jam_masuk'] ?? null,
            'wali_kelas' => $pegawai->id ?? null,
        ]);

        $kelas->load('jurusan');
        
        return ApiResponse::success(
            [
                'id' => $kelas->id ?? null,
                'nama_kelas' => $kelas->nama_kelas ?? null,
                'nama_jurusan' => $kelas->jurusan->nama_jurusan ?? null,
                'jam_masuk' => $kelas->jam_masuk ?? null,
                'wali_kelas' => $kelas->wali->nama ?? null,
            ], 'Kelas berhasil diperbarui');
    }

    // ✅ destroy kelas oleh super admin
    public function destroy($id)
    {
        $kelas = Kelas::find($id);
        if (!$kelas) {
            return ApiResponse::error('Kelas tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        // Cek apakah kelas masih punya siswa
        if ($kelas->siswa()->exists()) {
            return ApiResponse::error('Kelas tidak bisa dihapus karena masih memiliki siswa', [
                'kelas_id' => ['Kelas ini masih digunakan oleh siswa']
            ], 422);
        }

        $kelas->delete();
        return ApiResponse::success(null, 'Kelas berhasil dihapus');
    }

}
