<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KepegawaianController;
use App\Http\Controllers\JurusanController;
use App\Http\Controllers\MataPelajaranController;
use App\Http\Controllers\JadwalPelajaranController;
use App\Http\Controllers\SiswaJadwalPelajaranController;
use App\Http\Controllers\KurikulumController;
use App\Http\Controllers\KompetensiController;
use App\Http\Controllers\AlurTujuanPembelajaranController;
use App\Http\Controllers\GedungController;
use App\Http\Controllers\RuanganController;
use App\Http\Controllers\TahunAkademikController;
use App\Http\Controllers\SemesterController;
use App\Http\Controllers\KurikulumMataPelajaranController;
use App\Http\Controllers\PrestasiController;
use App\Http\Controllers\IdentitasSekolahController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\RombelController;
use App\Http\Controllers\SiswaRombelController;
use App\Http\Controllers\EkstrakurikulerController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\DataNilaiSiswaController;
use App\Http\Controllers\EkskulSiswaPivotController;
use App\Http\Controllers\AbsensiPegawaiController;
use App\Http\Controllers\AbsensiPelajaranController;
use App\Http\Controllers\KeuanganController;
use App\Http\Controllers\AbsensiSiswaController;
use App\Http\Controllers\PsbController;
use App\Http\Controllers\CacheCleanerController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });


// ? ================================================= SUPER ADMIN ============================================================= ?
// ✅ register pegawai
Route::post('/kepegawaian/register', [KepegawaianController::class, 'registerKepegawaian']);

// ✅ login pegawai
Route::post('/kepegawaian/login', [KepegawaianController::class, 'loginKepegawaian']);

Route::middleware('auth:kepegawaian')->group(function () {

    // -------------------------------------------------------------------------------------
    
    // ✅☑️ Ubah password super admin oleh dirinya sendiri
    Route::put('/spa/ubah-password/diri', [KepegawaianController::class, 'ubahPassDiri']);
    
    // ✅☑️ Super Admin Show Diri Sendiri
    Route::get('/spa/show/diri', [KepegawaianController::class, 'showDiriSendiri']);    
    
    // ✅☑️ Super admin Update diri sendiri ((insomnia))
    Route::put('/spa/update/diri', [KepegawaianController::class, 'updateDirinyaSendiri']);
    
    // ✅☑️ CRUD identitas sekolah oleh tu dan super admin
    Route::apiResource('/spa/identitas-sekolah', IdentitasSekolahController::class);
    
    // ✅☑️ CRUD gedung
    Route::apiResource('/spa/gedung', GedungController::class);
    
    // ✅☑️ Ruangan
    Route::apiResource('/spa/ruangan', RuanganController::class);
    Route::get('/spa/data-select/ruangan', [RuanganController::class, 'dataSelectRuangan']);
    
    // ✅☑️ CRUD Kepegawaian
    Route::apiResource('/spa/kepegawaian', KepegawaianController::class);

    // ✅☑️ Ubah password pegawai oleh super admin
    Route::post('/spa/ubah-password/kepegawaian', [KepegawaianController::class, 'ubahPassword']);

    // ✅☑️ CRUD Penerimaan Siswa Baru Oleh  Super Admin
    Route::delete('/psb/destroy-multiple/{id?}', [PsbController::class, 'destroyMultiple']);
    Route::apiResource('psb', PsbController::class)->except('destroy');

    // ✅☑️ Ubah password siswa oleh super admin
    Route::post('/spa/ubah-password/siswa', [SiswaController::class, 'ubahPassword']);
    
    // ✅☑️ CRUD Siswa
    Route::apiResource('/spa/siswa', SiswaController::class);

    // ✅☑️ CRUD Jurusan
    Route::apiResource('/spa/jurusan', JurusanController::class);

    // ✅☑️ CRUD Kelas
    Route::apiResource('/spa/kelas', KelasController::class);

    // ✅☑️ kurikulum
    Route::apiResource('/spa/kurikulum', KurikulumController::class);

    // ✅☑️ CRUD mata pelajaran
    Route::apiResource('/spa/mata-pelajaran', MataPelajaranController::class);

    // ✅☑️ Tahun Akademik
    Route::apiResource('/spa/tahun-akademik', TahunAkademikController::class);
    
    // ✅☑️ Semester
    Route::apiResource('/spa/semester', SemesterController::class);
    Route::get('/spa/data-select/semester', [SemesterController::class, 'dataSelectSemester']);
    
    // ✅☑️ Kurikulum Mata Pelajran
    Route::apiResource('/spa/kurikulum-mata-pelajaran', KurikulumMataPelajaranController::class);
    Route::get('/spa/data-select/kurmap', [KurikulumMataPelajaranController::class, 'dataSelectKurmap']);
    
    // ✅☑️ CRUD kompetensi
    Route::apiResource('/spa/kompetensi', KompetensiController::class);     
    Route::get('/spa/data-select/kompetensi', [KompetensiController::class, 'dataSelectKompetensi']);
    
    // ✅☑️ CRUD ATP
    Route::apiResource('/spa/atp', AlurTujuanPembelajaranController::class)->only(['index', 'show']);  
    Route::put('/spa/atp-diterima/{id}', [AlurTujuanPembelajaranController::class, 'diterima']);   
    Route::put('/spa/atp-ditolak/{id}', [AlurTujuanPembelajaranController::class, 'ditolak']);   
    
    // ✅☑️ CRUD rombel
    Route::apiResource('/spa/rombel', RombelController::class);    
    Route::get('/spa/data-select/rombel', [RombelController::class, 'dataSelect']);       
    
    // ✅☑️ Create dan Delete siswa rombel
    Route::apiResource('/spa/siswa-rombel', SiswaRombelController::class);    
    Route::get('/spa/siswa/data-select/rombel', [SiswaRombelController::class, 'dataSelect']);       
    
    // ✅☑️ CRUD jadwal pelajaran
    Route::apiResource('/spa/jadwal-pelajaran', JadwalPelajaranController::class);
    Route::get('/spa/data-select/jadwal-pelajaran', [JadwalPelajaranController::class, 'dataUntukSelect']);       
    
    // ✅☑️ get jadwal pelajaran siswa
    Route::get('/spa/siswa/jadwal-pelajaran/all', [SiswaJadwalPelajaranController::class, 'getAllSiswaAktif']);       
    Route::get('/spa/siswa/jadwal-pelajaran/{id}', [SiswaJadwalPelajaranController::class, 'showSiswaJadwal']);       

    // ✅☑️ Absensi Pegawai Ke Sekolah    
    Route::get('/spa/pegawai/absensi/pegawai/sekolah/export', [AbsensiPegawaiController::class, 'export']);
    Route::delete('/spa/absensi/pegawai/sekolah/destroy/{id?}', [AbsensiPegawaiController::class, 'destroyData']);
    Route::apiResource('/spa/absensi/pegawai/sekolah', AbsensiPegawaiController::class)->except('store', 'destroy');  

    // ! ✅ Absensi Pegawai ke Pelajaran (MASUK SINI)
    Route::get('/spa/absensi/pegawai/pelajaran/export', [AbsensiPelajaranController::class, 'export']);
    Route::delete('/spa/absensi/pegawai/pelajaran/destroy/{id?}', [AbsensiPelajaranController::class, 'destroyData']);
    Route::apiResource('/spa/absensi/pegawai/pelajaran', AbsensiPelajaranController::class)->except('store', 'destroy');  

    

    // ✅ CRUD Ekstrakurikuler
    Route::apiResource('/spa/ekstrakurikuler', EkstrakurikulerController::class);

    // ✅ CRUD Keikutsertaan Siswa ke Ekstrakurikuler oleh super admin
    Route::apiResource('/spa/siswa/ekskul', EkskulSiswaPivotController::class);            

    // ✅ Prestasi
    Route::apiResource('/spa/prestasi', PrestasiController::class);   
    
    // ! ✅ Data Nilai Siswa (belum masuk tahap ini)
    Route::get('/spa/data-nilai-siswa/all', [DataNilaiSiswaController::class, 'All']);   
    Route::apiResource('/spa/data-nilai-siswa', DataNilaiSiswaController::class)->only('show');       
        

    // ✅ Absensi Siswa ke Pelajaran
    Route::get('/spa/absensi/siswa/pelajaran/export', [AbsensiSiswaController::class, 'export']);
    Route::get('/spa/absensi/siswa/pelajaran/zip', [AbsensiSiswaController::class, 'exportBerkasZip']);
    Route::delete('/spa/absensi/siswa/pelajaran/destroy/{id?}', [AbsensiSiswaController::class, 'destroyData']);
    Route::apiResource('/spa/absensi/siswa/pelajaran', AbsensiSiswaController::class)->except('store', 'destroy');  
    
    // ✅ Keuangan
    Route::delete('/spa/keuangan/destroy/{id?}', [KeuanganController::class, 'destroyData']);
    Route::get('/spa/keuangan/export', [KeuanganController::class, 'exportExcel']);
    Route::apiResource('/spa/keuangan', KeuanganController::class)->except('destroy');      

    Route::get('/export-data-psb', [PsbController::class, 'exportExcel']);
    Route::get('/export-berkas-zip', [PsbController::class, 'exportBerkasZip']);
    Route::post('/import-data-psb', [PsbController::class, 'importExcel']);
    Route::post('/import-berkas-zip', [PsbController::class, 'importBerkasZip']);    
// ? =========================================================================================================================== ?




// ? ======================================================= TU ================================================================= ?
// ✅☑️ CRUD
Route::apiResource('/tu/identitas-sekolah', IdentitasSekolahController::class);

// ✅☑️ Ubah password
Route::put('/tu/ubah-password/diri', [KepegawaianController::class, 'ubahPassDiri']);

// ✅☑️ Show diri
Route::get('/tu/show/diri', [KepegawaianController::class, 'showDiriSendiri']);    

// ! ✅ Update diri sendiri (insomnia)
Route::put('/tu/update/diri', [KepegawaianController::class, 'updateDirinyaSendiri']);
// ? =========================================================================================================================== ?




// ? ======================================================= TU ================================================================= ?
    // ubah pass diri
    // show diri
    // identitas sekolah
// ? =========================================================================================================================== ?




    
// ? ======================================================= GURU ============================================================ ?
    // ✅☑️ identitas sekolah menggunakan Global: /all/identitas-sekolah

    // ✅☑️ Ubah password guru oleh dirinya sendiri
    Route::put('/guru/ubah-password/diri', [KepegawaianController::class, 'ubahPassDiri']);
        
    // ✅☑️ guru Show Diri Sendiri
    Route::get('/guru/show/diri', [KepegawaianController::class, 'showDiriSendiri']);        
    
    // ✅ guru Update diri sendiri
    Route::put('/guru/update/diri', [KepegawaianController::class, 'updateDirinyaSendiri']);

    // ! ✅ Get all rombel sendiri
    // Route::get('/guru/kelas/show/diri', [KelasController::class, 'showKelasPegawai']);

    // ✅ Update kelas sendiri
    Route::put('/guru/kelas/update/diri', [KelasController::class, 'updateKelasPegawai']);

    // ! rombel (belum dibuat insomnianya)
    Route::get('/guru/rombel/all/diri', [RombelController::class, 'getAllRombelSendiri']);    
    
    // ! ✅ Alur Tujuan Pembelajaran
    Route::apiResource('/guru/atp/self', AlurTujuanPembelajaranController::class)->only('show');
    Route::get('/guru/data-select/atp', [AlurTujuanPembelajaranController::class, 'dataSelectAtp']);

    // ✅ Get detail jadwal pelajaran sendiri
    Route::get('/guru/jadwal-pelajaran/all/self', [JadwalPelajaranController::class, 'getAllJadwalSendiri']);        
    
    // ✅ Read siswa oleh pegawai
    Route::apiResource('/guru/siswa', SiswaController::class)->only(['index', 'show']);

    // ✅ Get ekskul sendiri
    Route::get('/guru/ekskul/show/diri', [EkstrakurikulerController::class, 'showEkskulSendiri']);

    // ✅ CRUD peserta ekstrakurikuler oleh pegawai
    Route::apiResource('/guru/siswa/ekskul', EkskulSiswaPivotController::class);

    // ✅ CRUD kompetensi
    Route::apiResource('/guru/kompetensi', KompetensiController::class)->only(['index', 'show']);

     // ✅ Absensi Sekolah
    Route::apiResource('/guru/absensi/sekolah', AbsensiPegawaiController::class)->only('store');
    Route::get('/guru/absensi/sekolah/all/self', [AbsensiPegawaiController::class, 'showAbsenSendiri']);
    Route::get('/guru/absensi/sekolah/export', [AbsensiPegawaiController::class, 'export']);
    
    // ✅ Absensi Pelajaran (baca readme)
    Route::apiResource('/guru/absensi/pelajaran', AbsensiPelajaranController::class)->only('store');
    Route::get('/guru/absensi/pelajaran/all/self', [AbsensiPelajaranController::class, 'showAbsenPelajaranSendiri']);
    Route::get('/guru/absensi/pelajaran/export', [AbsensiPelajaranController::class, 'export']);
    
    // ! ✅ Guru absenkan siswa (tinggal debug)
    Route::post('/guru/absensi/siswa', [AbsensiSiswaController::class, 'guruAbsenkanSiswa']);


    // ! ✅ Data Nilai Siswa
    // ini belom masuk insomnia
    Route::get('/guru/data-nilai-siswa/self/all', [DataNilaiSiswaController::class, 'getAllDataNilaiSendiri']);
    
    Route::apiResource('/guru/data-nilai-siswa', DataNilaiSiswaController::class)->except('destroy');   
    Route::delete('/guru/data-nilai-siswa/destroy/{id?}', [DataNilaiSiswaController::class, 'destroyData']);
    // -------------------------------------------------------------------------------------
     

     // ✅ Logout pegawai dan SPA
    Route::post('/kepegawaian/logout', [KepegawaianController::class, 'logoutKepegawaian']);    
});
// ? ============================================================================================================================ ?




// ? ====================================================== STAFF ==== ============================================================== ?
    // Ubah pass diri
    // show diri
    // identitas sekolah
// ? ============================================================================================================================ ?




// ? ====================================================== GLOBAL ============================================================== ?
// ✅☑️ membersihkan cache oleh super admin
Route::get('/cache-cleaner', [CacheCleanerController::class, 'triggerCacheCleanup']);

// ✅☑️ Guru, Kepsek, Staff, dan Siswa
Route::apiResource('/all/identitas-sekolah', IdentitasSekolahController::class)->only('index');

// ✅☑️ PSB Public
Route::apiResource('psb', PsbController::class)->only('store');

// ! export absensi pegawai
// Route::get('/spa/pegawai/absensi/harian/export', [AbsensiPegawaiController::class, 'export']);

// ✅ untuk menampilkan berkas / foto yang private
Route::get('/tampil-berkas/{jenis}/{filename}', [PsbController::class, 'tampilkanBerkas'])->name('berkas.view');

// ✅ akses jurusan di register
Route::get('/jurusan-register', [JurusanController::class, 'index']);

// ✅ akses kelas di register
Route::get('/kelas-register', [KelasController::class, 'index']);

// ✅ lupa password pegawai + super admin untuk dirinya sendiri
// 1. Button lupa password + send link via email
Route::post('/kepegawaian/lupa-password', [KepegawaianController::class, 'sendResetLink'])->name('password.email');
// 2. Tampilkan form reset password
Route::get('/kepegawaian/reset-password/{token}', [KepegawaianController::class, 'redirectToFrontendForm'])->name('password.reset');
// 3. Proses reset password
Route::post('kepegawaian/reset-password', [KepegawaianController::class, 'resetPassword'])->name('password.update');

// ✅ lupa password siswa (done)
// 1. Button lupa password + send link via email
Route::post('/siswa/lupa-password', [SiswaController::class, 'sendResetLink'])->name('siswa.password.email');
// 2. Tampilkan form reset password
Route::get('/siswa/reset-password/{token}', [SiswaController::class, 'redirectToFrontendForm'])->name('siswa.password.reset');
// 3. Proses reset password
Route::post('/siswa/reset-password', [SiswaController::class, 'resetPassword'])->name('siswa.password.update');
// ? =========================================================================================================================== ?






// ? ======================================================= SISWA ============================================================== ?
// ✅ register siswa
Route::post('/siswa/register', [SiswaController::class, 'registerSiswa']);

// ✅ login siswa
Route::post('/siswa/login', [SiswaController::class, 'loginSiswa']);

Route::middleware('auth:siswa')->group(function () {
    // ✅☑️ identitas sekolah menggunakan Global: /all/identitas-sekolah

    // ✅☑️ ubah password siswa untuk dirinya sendiri
    Route::put('/siswa/ubah-password/diri', [SiswaController::class, 'ubahPassDiri']);

    // ✅☑️ show dirinya sendiri
    Route::get('/siswa/show/diri', [SiswaController::class, 'showDiriSendiri']);    
    

    // ✅ logout siswa
    Route::post('/siswa/logout', [SiswaController::class, 'logoutSiswa']);

    // ! ✅ get rombel sendiri (adanya getAllRombelSendiri)
    // Route::get('/siswa/kelas/diri', [KelasController::class, 'showKelasSendiri']);

    // ✅ get kompetensi
    // Route::apiResource('/siswa/kompetensi', KompetensiController::class)->only(['index', 'show']);
    
    // ✅ Get all jadwal pelajaran sendiri
    Route::apiResource('/siswa/jadwal-pelajaran', SiswaJadwalPelajaranController::class)->only('index');
    
     // ✅ Absensi Pelajaran
     Route::apiResource('/siswa/absensi/pelajaran', AbsensiSiswaController::class)->only('store');
     Route::get('/siswa/absensi/pelajaran/all/self', [AbsensiSiswaController::class, 'showAbsenPelajaranSendiri']);
     Route::get('/siswa/absensi/pelajaran/export', [AbsensiSiswaController::class, 'export']);         
    
    // ✅ Get detail jadwal pelajaran sendiri
    Route::get('/siswa/jadwal-pelajaran/show/diri/{id}', [SiswaJadwalPelajaranController::class, 'show']);

    // ✅ get all ekskul untuk siswa
    Route::apiResource('/siswa/ekstrakurikuler/all', EkstrakurikulerController::class)->only(['index', 'show']);

    // ✅ get all ekskul yang diikuti
    Route::get('/siswa/ekstrakurikuler/diri/diikuti', [EkskulSiswaPivotController::class, 'getAllEkskulSendiri']);

    // ✅ siswa mendaftarkan diri sendiri ke ekskul
    Route::post('/siswa/ekstrakurikuler/daftar/{id}', [EkskulSiswaPivotController::class, 'storeSiswa']);

    // ✅ siswa hapus diri sendiri dari ekskul
    Route::delete('/siswa/ekstrakurikuler/keluar/{id}', [EkskulSiswaPivotController::class, 'destroySiswa']);
});
// ? ============================================================================================================================== ?

