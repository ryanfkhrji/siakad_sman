<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Helpers\ApiResponse;
use App\Models\AlurTujuanPembelajaran;
use App\Models\Kompetensi;
use App\Models\TahunAkademik;
use Illuminate\Support\Facades\DB;

// di hal 143
class AlurTujuanPembelajaranController extends Controller
{
    /**
     * ! spa
     */
    public function index()
    {
        //
    }

    /**
     * ✅ guru
     * 
     * Guru tidak bisa:
     * bikin ATP untuk K13
     * bikin ATP di tahun arsip
     * loncat urutan sembarangan
     * edit ATP yang sudah dikunci
     * set approve sendiri
     * 
     * Guru bisa:
     * create saat status = draft
     * clone dari tahun lalu
     */
    public function store(Request $request)
    {
        $user = Auth::guard('kepegawaian')->user();

        // 1. Validasi dasar input
        $validated = $request->validate([
            'kompetensi_id' => 'required|exists:kompetensi,id',
            'tahun_akademik_id' => 'required|exists:tahun_akademik,id',
            'semester' => 'required|in:Ganjil,Genap',
            'tujuan_pembelajaran' => 'required|string',
            'urutan' => 'required|integer|min:1',
        ], [
            'kompetensi_id.required' => 'Kompetensi wajib diisi',
            'kompetensi_id.exists' => 'Kompetensi tidak ditemukan',
            'tahun_akademik_id.required' => 'Tahun akademik wajib diisi',
            'semester.in' => 'Semester harus Ganjil atau Genap',
            'tujuan_pembelajaran.required' => 'Tujuan pembelajaran wajib diisi',
            'urutan.required' => 'Urutan ATP wajib diisi',
        ]);

        // 2. Ambil kompetensi & pastikan CP (MERDEKA)
        $kompetensi = Kompetensi::find($validated['kompetensi_id']);

        if (! $kompetensi) {
            return ApiResponse::error(
                'Kompetensi tidak ditemukan',
                ['kompetensi_id' => 'Data tidak ditemukan'],
                404
            );
        }

        if ($kompetensi->jenis !== 'CP') {
            return ApiResponse::error(
                'Tidak valid',
                ['kompetensi' => 'ATP hanya boleh dibuat untuk Kurikulum Merdeka (CP)'],
                422
            );
        }

        // 3. Pastikan tahun akademik AKTIF
        $tahunAkademik = TahunAkademik::find($validated['tahun_akademik_id']);

        if ($tahunAkademik->status !== 'aktif') {
            return ApiResponse::error(
                'Tidak valid',
                ['tahun_akademik' => 'ATP hanya boleh dibuat pada tahun akademik aktif'],
                422
            );
        }

        // 4. Cegah input jika ATP sudah disetujui & dikunci
        $locked = AlurTujuanPembelajaran::where('kompetensi_id', $validated['kompetensi_id'])
            ->where('tahun_akademik_id', $validated['tahun_akademik_id'])
            ->where('semester', $validated['semester'])
            ->where('is_locked', true)
            ->exists();

        if ($locked) {
            return ApiResponse::error(
                'Dikunci',
                ['atp' => 'ATP untuk semester ini sudah disetujui dan dikunci'],
                403
            );
        }

        // 5. Cegah duplikasi urutan
        $duplicateUrutan = AlurTujuanPembelajaran::where('kompetensi_id', $validated['kompetensi_id'])
            ->where('tahun_akademik_id', $validated['tahun_akademik_id'])
            ->where('semester', $validated['semester'])
            ->where('urutan', $validated['urutan'])
            ->exists();

        if ($duplicateUrutan) {
            return ApiResponse::error(
                'Duplikasi',
                ['urutan' => 'Urutan ATP sudah digunakan pada semester ini'],
                422
            );
        }

        // 6. Simpan ATP (SELALU DRAFT)
        $atp = AlurTujuanPembelajaran::create([
            'kompetensi_id' => $validated['kompetensi_id'],
            'tahun_akademik_id' => $validated['tahun_akademik_id'],
            'semester' => $validated['semester'],
            'tujuan_pembelajaran' => $validated['tujuan_pembelajaran'],
            'urutan' => $validated['urutan'],
            'approval_status' => 'draft',
            'is_locked' => false,
        ]);

        return ApiResponse::success([
            'atp_id' => $atp->id,
            'kompetensi_id' => $atp->kompetensi_id,
            'tahun_akademik_id' => $atp->tahun_akademik_id,
            'semester' => $atp->semester,
            'urutan' => $atp->urutan,
            'approval_status' => $atp->approval_status,
        ], 'ATP berhasil dibuat (status: draft)');
    }

    // ✅ guru    
    /**
     * ketika sebagian sudah dikunci maka tidak bisa clone
     * jika tahun lalu belum disetujui, maka tidak bisa clone
     */
    public function cloneFromPreviousYear(Request $request)
    {
        $request->validate([
            'kompetensi_id' => 'required|exists:kompetensi,id',
            'from_tahun_akademik_id' => 'required|exists:tahun_akademik,id',
        ]);

        // 1. Ambil kompetensi & pastikan CP
        $kompetensi = Kompetensi::find($request->kompetensi_id);

        if (! $kompetensi || $kompetensi->jenis !== 'CP') {
            return ApiResponse::error(
                'Tidak valid',
                ['kompetensi' => 'ATP hanya berlaku untuk Kurikulum Merdeka (CP)'],
                422
            );
        }

        // 2. Tahun tujuan = tahun aktif
        $toTahun = TahunAkademik::where('status', 'aktif')->first();

        if (! $toTahun) {
            return ApiResponse::error(
                'Tahun aktif tidak ditemukan',
                ['tahun_akademik' => 'Tidak ada tahun akademik aktif'],
                404
            );
        }

        if ($request->from_tahun_akademik_id == $toTahun->id) {
            return ApiResponse::error(
                'Kesalahan',
                ['tahun' => 'Tidak bisa clone ke tahun yang sama'],
                422
            );
        }

        // 3. Pastikan ATP sumber sudah disetujui
        $oldAtps = AlurTujuanPembelajaran::where('kompetensi_id', $request->kompetensi_id)
            ->where('tahun_akademik_id', $request->from_tahun_akademik_id)
            ->where('approval_status', 'disetujui')
            ->orderBy('semester')
            ->orderBy('urutan')
            ->get();

        if ($oldAtps->isEmpty()) {
            return ApiResponse::error(
                'Tidak ada ATP',
                ['data' => 'ATP tahun sebelumnya belum disetujui'],
                422
            );
        }

        // 4. Cegah clone jika target semester sudah dikunci
        $locked = AlurTujuanPembelajaran::where('kompetensi_id', $request->kompetensi_id)
            ->where('tahun_akademik_id', $toTahun->id)
            ->where('is_locked', true)
            ->exists();

        if ($locked) {
            return ApiResponse::error(
                'Dikunci',
                ['atp' => 'ATP tahun aktif sudah disetujui dan dikunci'],
                403
            );
        }

        DB::beginTransaction();

        try {
            foreach ($oldAtps as $atp) {
                $exists = AlurTujuanPembelajaran::where([
                    'kompetensi_id' => $atp->kompetensi_id,
                    'tahun_akademik_id' => $toTahun->id,
                    'semester' => $atp->semester,
                    'urutan' => $atp->urutan,
                ])->exists();

                if (! $exists) {
                    AlurTujuanPembelajaran::create([
                        'kompetensi_id' => $atp->kompetensi_id,
                        'tahun_akademik_id' => $toTahun->id,
                        'semester' => $atp->semester,
                        'tujuan_pembelajaran' => $atp->tujuan_pembelajaran,
                        'urutan' => $atp->urutan,
                        'approval_status' => 'draft',
                        'is_locked' => false,
                    ]);
                }
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return ApiResponse::error(
                'Gagal clone',
                ['error' => $e->getMessage()],
                500
            );
        }

        return ApiResponse::success([
            'tahun_akademik_tujuan' => $toTahun->tahun_akademik
        ], 'ATP berhasil di-clone ke tahun aktif');
    }

    // ✅ guru
    public function diajukan($id)
    {
        $atp = AlurTujuanPembelajaran::findOrFail($id);

        // Cegah ajukan ulang
        if ($atp->approval_status !== 'draft') {
            return ApiResponse::error(
                'Tidak valid',
                ['status' => 'ATP hanya bisa diajukan dari status draft'],
                422
            );
        }

        if ($atp->is_locked) {
            return ApiResponse::error(
                'Dikunci',
                ['atp' => 'ATP sudah dikunci dan tidak bisa diajukan'],
                403
            );
        }

        $atp->update([
            'approval_status' => 'diajukan',
            'approved_by' => null,
            'approved_at' => null,
            'is_locked' => false,
        ]);

        return ApiResponse::success(null, 'ATP berhasil diajukan untuk persetujuan');
    }

    // ✅ spa
    public function diterima($id)
    {
        $atp = AlurTujuanPembelajaran::findOrFail($id);

        if ($atp->approval_status !== 'diajukan') {
            return ApiResponse::error(
                'Tidak valid',
                ['status' => 'ATP hanya bisa disetujui jika status diajukan'],
                422
            );
        }

        $pegawai = Auth::guard('kepegawaian')->user();

        $atp->update([
            'approval_status' => 'disetujui',
            'approved_by' => $pegawai->id,
            'approved_at' => now(),
            'is_locked' => true,
        ]);

        return ApiResponse::success(null, 'ATP disetujui dan dikunci');
    }


    // ✅ ditolak
    public function ditolak(Request $request, $id)
    {
        $request->validate([
            'catatan_penolakan' => 'nullable|string'
        ]);
    
        $atp = AlurTujuanPembelajaran::findOrFail($id);
    
        if ($atp->approval_status !== 'diajukan') {
            return ApiResponse::error(
                'Tidak valid',
                ['status' => 'ATP hanya bisa ditolak jika status diajukan'],
                422
            );
        }
    
        $pegawai = Auth::guard('kepegawaian')->user();
    
        $atp->update([
            'approval_status' => 'ditolak',
            'approved_by' => $pegawai->id,
            'approved_at' => now(),
            'is_locked' => false,
        ]);
    
        return ApiResponse::success(null, 'ATP ditolak, silakan guru melakukan revisi');
    }
    

    /**
     * ! spa dan guru
     */
    public function show(string $id)
    {
        //
    }

    // ! getAllAtpSendiri (guru)

    /**
     * ! guru
     */
    public function update(Request $request, string $id)
    {
        // jika kompetensi->jenis != 'MERDEKA' gabisa (ini khusus MERDEKA)


        // jika sudah is_locked = true, maka tidak bisa ubah
        if ($atp->is_locked) {
            return ApiResponse::error(
                'Dikunci',
                ['atp' => 'ATP sudah dikunci dan tidak bisa diubah'],
                403
            );
        }
        
        
    }

    /**
     * ! guru
     */
    public function destroy(string $id)
    {
        // jika sudah is_locked = true, maka tidak bisa delete
        if ($atp->is_locked) {
            return ApiResponse::error(
                'Dikunci',
                ['atp' => 'ATP sudah dikunci dan tidak bisa dihapus'],
                403
            );
        }
        
    }
}
