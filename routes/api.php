<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KepegawaianController;
use App\Http\Controllers\JurusanController;
use App\Http\Controllers\KelasController;
use App\Http\Controllers\EkstrakurikulerController;
use App\Http\Controllers\SiswaController;
use App\Http\Controllers\EkskulSiswaPivotController;
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
// Route::get('/me', [SiswaController::class, 'me']);

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// ? ===================================================================================== ?
// ?                                        PEGAWAI
// ? ===================================================================================== ?
// ✅ register pegawai
Route::post('/kepegawaian/register', [KepegawaianController::class, 'registerKepegawaian']);

// ✅login pegawai
Route::post('/kepegawaian/login', [KepegawaianController::class, 'loginKepegawaian']);

Route::middleware('auth:kepegawaian')->group(function () {

    // -------------------------------------------------------------------------------------
    // ✅ Ubah password super admin oleh dirinya sendiri
    Route::put('/spa/ubah-password/diri', [KepegawaianController::class, 'ubahPassDiri']);
    
    // ✅ Ubah password pegawai oleh super admin
    Route::post('/spa/ubah-password/kepegawaian', [KepegawaianController::class, 'ubahPassword']);

    // ✅ ubah password siswa oleh super admin
    Route::post('/spa/ubah-password/siswa', [SiswaController::class, 'ubahPassword']);
    
    // ✅ CRUD Super Admin
    Route::apiResource('/spa/kepegawaian', KepegawaianController::class)->except(['store']);

    // ✅ Super Admin Show Diri Sendiri
    Route::get('/spa/show/diri', [KepegawaianController::class, 'showDiriSendiri']);    

    // ✅ Super admin Update diri sendiri (tinggal debug)
    Route::put('/spa/update/diri', [KepegawaianController::class, 'updateDirinyaSendiri']);

    // ✅ CRUD Super Admin
    Route::apiResource('/spa/jurusan', JurusanController::class);

    // ✅ CRUD Super admin
    Route::apiResource('/spa/kelas', KelasController::class);

    // ! super admin set kelas dan pengajarnya (bukan wali kelas), satu guru bisa ngajar di banyak kelas

    // ✅ CRUD Super Admin
    Route::apiResource('/spa/siswa', SiswaController::class)->except(['store']);
    
    // ✅ CRUD Super Admin
    Route::apiResource('/spa/ekstrakurikuler', EkstrakurikulerController::class);

    // ✅ CRUD Keikutsertaan Siswa ke Ekstrakurikuler oleh super admin
    Route::apiResource('/spa/siswa/ekskul', EkskulSiswaPivotController::class)->only(['store', 'destroy']);

    // ✅ CRUD Penerimaan Siswa Baru Oleh  Super Admin
    Route::apiResource('psb', PsbController::class);
    Route::get('/export-data-psb', [PsbController::class, 'exportExcel']);
    Route::get('/export-berkas-zip', [PsbController::class, 'exportBerkasZip']);
    Route::post('/import-data-psb', [PsbController::class, 'importExcel']);
    Route::post('/import-berkas-zip', [PsbController::class, 'importBerkasZip']);
    // -------------------------------------------------------------------------------------


    // -------------------------------------------------------------------------------------
    // ✅ Ubah password pegawai oleh dirinya sendiri
    Route::put('/pegawai/ubah-password/diri', [KepegawaianController::class, 'ubahPassDiri']);
        
    // ✅ Pegawai Show Diri Sendiri
    Route::get('/pegawai/show/diri', [KepegawaianController::class, 'showDiriSendiri']);        
    
    // ✅ Pegawai Update diri sendiri
    Route::put('/pegawai/update/diri', [KepegawaianController::class, 'updateDirinyaSendiri']);

    // ✅ Get kelas sendiri
    Route::get('/pegawai/kelas/show/diri', [KelasController::class, 'showKelasPegawai']);

    // ✅ Update kelas sendiri
    Route::put('/pegawai/kelas/update/diri', [KelasController::class, 'updateKelasPegawai']);
    
    // ✅ Read siswa oleh pegawai
    Route::apiResource('/pegawai/siswa', SiswaController::class)->only(['index', 'show']);

    // ✅ Get ekskul sendiri
    Route::get('/pegawai/ekskul/show/diri', [EkstrakurikulerController::class, 'showEkskulSendiri']);

    // ✅ CRUD peserta ekstrakurikuler oleh pegawai
    Route::apiResource('/pegawai/siswa/ekskul', EkskulSiswaPivotController::class)->only(['store', 'destroy']);
    // -------------------------------------------------------------------------------------
     

     // ✅ Logout pegawai dan SPA
    Route::post('/kepegawaian/logout', [KepegawaianController::class, 'logoutKepegawaian']);    
});
// ? ===================================================================================== ?

// ✅ membersihkan cache oleh super admin
Route::get('/cache-cleaner', [CacheCleanerController::class, 'triggerCacheCleanup']);

// ✅ untuk menampilkan berkas / foto yang private
Route::get('/tampil-berkas/{jenis}/{filename}', [PsbController::class, 'tampilkanBerkas']);

// ✅ akses jurusan di register
Route::get('/jurusan-register', [JurusanController::class, 'index']);

// ✅ akses kelas di register
Route::get('/kelas-register', [KelasController::class, 'index']);

// ✅ lupa password untuk dirinya sendiri
// ! tinggal di debug
Route::post('/kepegawaian/lupa-password', [KepegawaianController::class, 'sendResetLink']);

// ✅ lupa password siswa
// ! belum di debug
Route::post('/siswa/lupa-password', [SiswaController::class, 'sendResetLink']);

// ? ===================================================================================== ?
// ?                                        SISWA
// ? ===================================================================================== ?

// ✅ register siswa
Route::post('/siswa/register', [SiswaController::class, 'registerSiswa']);

// ✅ login siswa
Route::post('/siswa/login', [SiswaController::class, 'loginSiswa']);

Route::middleware('auth:siswa')->group(function () {

    // ✅ ubah password siswa untuk dirinya sendiri
    Route::put('/siswa/ubah-password/diri', [SiswaController::class, 'ubahPassDiri']);

    // ✅ show dirinya sendiri
    Route::get('/siswa/show/diri', [SiswaController::class, 'showDiriSendiri']);    

    // ✅ update siswa oleh diri sendiri
    Route::put('/siswa/update/diri', [SiswaController::class, 'updateDirinyaSendiri']);

    // ✅ logout siswa
    Route::post('/siswa/logout', [SiswaController::class, 'logoutSiswa']);

    // ✅ get kelas sendiri
    Route::get('/siswa/kelas/diri', [KelasController::class, 'showKelasSendiri']);
    
    // ✅ get all ekskul untuk siswa
    Route::apiResource('/siswa/ekstrakurikuler/all', EkstrakurikulerController::class)->only(['index', 'show']);

    // ✅ get all ekskul yang diikuti
    Route::get('/siswa/ekstrakurikuler/diri/diikuti', [EkskulSiswaPivotController::class, 'getAllEkskulSendiri']);

    // ✅ siswa mendaftarkan diri sendiri ke ekskul
    Route::post('/siswa/ekstrakurikuler/daftar/{id}', [EkskulSiswaPivotController::class, 'storeSiswa']);

    // ✅ siswa hapus diri sendiri dari ekskul
    Route::delete('/siswa/ekstrakurikuler/keluar/{id}', [EkskulSiswaPivotController::class, 'destroySiswa']);

});