<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\EkskulSiswaPivot;
use App\Models\Siswa;
use App\Models\Ekstrakurikuler;
use Illuminate\Support\Facades\Hash;
use App\Helpers\ApiResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class EkskulSiswaPivotController extends Controller
{
    // ✅ get all ekskul sendiri (siswa)
    public function getAllEkskulSendiri()
    {
        $siswa = Auth::guard('siswa')->user();
    
        $ekskul = EkskulSiswaPivot::with([
                'ekstrakurikuler.pelatihEkskul.pelatih',
                'ekstrakurikuler.pembinaEkskul.pembina',
                'ekstrakurikuler.peserta.siswa',
                'tahunAkademik'
            ])
            ->where('siswa_id', $siswa->id)
            ->whereHas('tahunAkademik', fn ($q) => $q->where('status', 'aktif'))
            ->get();
    
        $hasil = $ekskul
            ->groupBy('tahun_akademik_id')
            ->map(function ($items) {
    
                $tahun = $items->first()->tahunAkademik;
    
                return [
                    'tahun_akademik_id' => $tahun->id,
                    'tahun_akademik' => $tahun->tahun_akademik,
                    'status_tahun_akademik' => $tahun->status,
    
                    'daftar_ekstrakurikuler' => $items
                        ->groupBy('ekstrakurikuler_id')
                        ->map(function ($ekskulItems) {
    
                            $pivot = $ekskulItems->first();
                            $ekskul = $pivot->ekstrakurikuler;
                            $tahunId = $pivot->tahun_akademik_id;
    
                            return [
                                'ekskul_id' => $ekskul->id,
                                'nama_ekskul' => $ekskul->nama_ekstrakurikuler,
    
                                /* ===== PEMBINA (1 per tahun) ===== */
                                'pembina' => $ekskul->pembinaEkskul
                                    ->where('tahun_akademik_id', $tahunId)
                                    ->first()?->pembina->nama,
    
                                /* ===== PELATIH (1 per tahun) ===== */
                                'pelatih' => $ekskul->pelatihEkskul
                                    ->where('tahun_akademik_id', $tahunId)
                                    ->first()?->pelatih->nama,
    
                                /* ===== PESERTA (BANYAK per tahun) ===== */
                                'peserta' => $ekskul->peserta
                                    ->where('tahun_akademik_id', $tahunId)
                                    ->map(function ($peserta) {
                                        return [
                                            'siswa_id' => $peserta->siswa->id,
                                            'nama_siswa' => $peserta->siswa->nama,
                                            'sikap' => $peserta->sikap,
                                            'status' => $peserta->status,
                                        ];
                                    })
                                    ->values(),
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();
    
        return ApiResponse::success($hasil, 'Data ekstrakurikuler siswa');
    }
    /**
     * tahun_akademik
     *      nama_ekskul, pelatih, pembina
     *          peserta
     */
    


    // ✅ mendaftarkan siswa oleh pelatih/pembina
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'siswa_id' => 'required|exists:siswas,id',
                'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id',
                'tahun_akademik_id' => 'nullable|exists:tahun_akademik,id',
            ], [
                'siswa_id.required' => 'Siswa wajib diisi',
                'siswa_id.exists' => 'Siswa tidak ditemukan',
                'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
                'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',
                'tahun_akademik_id.exists' => 'Tahun akademik tidak ditemukan',
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
                ->where('tahun_akademik_id', $validated['tahun_akademik_id'])
                ->exists();

            if ($existing) {
                return ApiResponse::error('Siswa sudah terdaftar di ekskul ini', [
                    'siswa_id' => ['Siswa sudah terdaftar di ekskul ini']
                ], 422);
            }

            $pivot = EkskulSiswaPivot::create([
                'siswa_id' => $validated['siswa_id'],
                'ekstrakurikuler_id' => $validated['ekstrakurikuler_id'],
                'tahun_akademik_id' => $validated['tahun_akademik_id'],
                'status' => 'Aktif',
            ]);
            
            $pivot->load('siswa', 'ekstrakurikuler', 'tahunAkademik');

            return ApiResponse::success([
                'id' => $pivot->id,
                'nama_siswa' => $pivot->siswa->nama,
                'nama_ekskul' => $pivot->ekstrakurikuler->nama_ekstrakurikuler,                
                'tahun_akademik' => $pivot->tahunAkademik->tahun_akademik,
                'status' => $pivot->status
            ], 'Pendaftaran berhasil');
        } catch (ValidationException $e) {
            return ApiResponse::error('Validasi gagal', $e->errors(), 422);
        }
    }

    // ✅ untuk pelatih/pembina
    public function update(Request $request, string $id)
    {
        $ekskul = EkskulSiswaPivot::with('ekstrakurikuler', 'siswa')->find($id);

        if (!$ekskul) {
            return ApiResponse::error('Not found', ['id', 'Data tidak ditemukan']);
        }

        $validated = $request->validate([            
            'sikap' => 'sometimes|nullable|in:Sangat Baik,Baik,Cukup,Kurang', 
            'status' => 'sometimes|nullable|in:Aktif,Cukup Aktif,Kurang Aktif,Tidak Aktif', 
        ],[            
            'sikap.in' => 'Pilihan sikap hanya Sangat Baik, Baik, Cukup, Kurang',
            'status.in' => 'Pilihan status hanya Aktif, Cukup Aktif, Kurang Aktif, Tidak Aktif',
        ]);       

        $ekskul->update($validated);

        $ekskul->load('siswa', 'ekstrakurikuler', 'tahunAkademik');

        return ApiResponse::success([
            'ekskul_siswa_pivot_id' => $ekskul->id ?? null,
            'nama_siswa' => $ekskul->siswa->nama ?? null,
            'nama_ekskul' => $ekskul->ekstrakurikuler->nama_ekstrakurikuler ?? null,
            'tahun_akademik' => $ekskul->tahunAkademik->tahun_akademik ?? null,
            'sikap' => $ekskul->sikap ?? null,
            'status' => $ekskul->status ?? null,
        ], 'Data berhasil diperbarui');
    }

    // ✅ destroy buat pelatih/pembina
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
    public function storeSiswa(Request $request)
    {

        // ambil id siswa yang lagi login
        $siswa = Auth::guard('siswa')->user();

        $validated = $request->validate([
            'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id'
        ],[
            'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
            'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',
        ]);

        $tahunAkademik = TahunAkademik::where('status', 'aktif')->first();

        // cocokkan dengan id eskul yang di klik
        $existing = EkskulSiswaPivot::where('siswa_id', $siswa->id)
            ->where('ekstrakurikuler_id', $validated['ekstrakurikuler_id'])
            ->where('tahun_akademik_id', $tahunAkademik->id)
            ->exists();

        if ($existing) {
            return ApiResponse::error('Anda sudah terdaftar di ekskul ini', [
                'siswa_id' => ['Anda sudah terdaftar di ekskul ini']
            ], 422);
        }

        $pivot = EkskulSiswaPivot::create([
            'siswa_id' => $siswa->id,
            'ekstrakurikuler_id' => $validated['ekstrakurikuler_id'],
            'tahun_akademik_id' => $tahunAakademik->id ?? null,
            'status' => 'Aktif',
        ]);

        $pivot->load('siswa', 'ekstrakurikuler', 'tahunAkademik');

        return ApiResponse::success([
            'id' => $pivot->id,
            'nama_siswa' => $pivot->siswa->nama,
            'nama_ekskul' => $pivot->ekstrakurikuler->nama_ekstrakurikuler,
            'tahun_akademik' => $pivot->tahunAkademik->tahun_akademik ?? null,
            'status' => $pivot->status ?? null,            
        ], 'Pendaftaran berhasil');
    }


    // ✅ destroy buat siswa (diri sendiri)    
    public function destroySiswa(Request $request)
    {
        $siswa = Auth::guard('siswa')->user();

        $validated = $request->validate([
            'ekstrakurikuler_id' => 'required|exists:ekstrakurikulers,id'
        ],[
            'ekstrakurikuler_id.required' => 'Ekstrakurikuler wajib diisi',
            'ekstrakurikuler_id.exists' => 'Ekstrakurikuler tidak ditemukan',
        ]);

        $tahunAkademik = TahunAkademik::where('status', 'aktif')->first();

        $pivot = EkskulSiswaPivot::where([
            ['siswa_id', '=', $siswa->id],
            ['ekstrakurikuler_id', '=', $validated['ekstrakurikuler_id']],
            ['tahun_akademik_id', '=', $tahunAkademik->id],
        ])->first();

        if (!$pivot) {
            return ApiResponse::error('Peserta tidak ditemukan', ['id' => ['Data tidak ditemukan']], 404);
        }

        $pivot->delete();
        $pivot->load('ekstrakurikuler');

        return ApiResponse::success(null, 'Peserta berhasil keluar dari ekskul '.$pivot->ekstrakurikuler->nama_ekstrakurikuler);
    }
}
