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

    // ✅ Super admin
    Route::post('/kepegawaian/ubah-password/spa', [KepegawaianController::class, 'ubahPassword']);

    // ! ubah password super admin oleh dirinya sendiri (tinggal sebug)
    Route::put('/spa/ubah-password/diri', [KepegawianController::class, 'ubahPassDiri']);

    // ✅ ubah password siswa oleh super admin
    Route::post('/siswa/ubah-password/spa', [SiswaController::class, 'ubahPassword']);
    
    // ! ubah password pegawai oleh dirinya sendiri (tinggal debug)
    Route::put('/pegawai/ubah-password/diri', [KepegawianController::class, 'ubahPassDiri']);

    // ✅ CRUD Super Admin
    Route::apiResource('spa/kepegawaian', KepegawaianController::class)->except(['store']);

    // ! Super Admin Show Diri Sendiri (tinggal debug)
    Route::get('/spa/show/diri', [KepegawaianController::class, 'showDiriSendiri']);    

    // ! Pegawai Show Diri Sendiri (tinggal debug)
    Route::get('/pegawai/show/diri', [KepegawaianController::class, 'showDiriSendiri']);    

     // ! Super admin Update diri sendiri (tinggal debug)
     Route::put('/spa/update/diri', [KepegawaianController::class, 'updateDirinyaSendiri']);
     
     // ! Pegawai Update diri sendiri (tinggal debug)
     Route::put('/pegawai/update/diri', [KepegawaianController::class, 'updateDirinyaSendiri']);
     
     // ✅ Logout pegawai dan SPA
    Route::post('/kepegawaian/logout', [KepegawaianController::class, 'logoutKepegawaian']);

    // ✅ CRUD Super Admin
    Route::apiResource('spa/jurusan', JurusanController::class);

    // ✅ CRUD Super admin
    Route::apiResource('spa/kelas', KelasController::class);

    // ✅ CRUD Super Admin
    Route::apiResource('spa/siswa', SiswaController::class)->except(['store']);

    // ! CRUD Kelas oleh pegawai
    
    // ✅ CRUD Super Admin
    Route::apiResource('spa/ekstrakurikuler', EkstrakurikulerController::class);

    // ! CRUD ekstrakurikuler oleh pegawai
    
    
    // ✅ CRUD Keikutsertaan Siswa ke Ekstrakurikuler oleh super admin
    Route::apiResource('spa/siswa/ekskul', EkskulSiswaPivotController::class)->only(['store', 'destroy']);
    
    // ! CRUD Keikutsertaan Siswa ke Ekstrakurikuler oleh pegawai

    // ✅ CRUD Penerimaan Siswa Baru Oleh  Super Admin
    Route::apiResource('psb', PsbController::class);
    Route::get('/export-data-psb', [PsbController::class, 'exportExcel']);
    Route::get('/export-berkas-zip', [PsbController::class, 'exportBerkasZip']);
    Route::post('/import-data-psb', [PsbController::class, 'importExcel']);
    Route::post('/import-berkas-zip', [PsbController::class, 'importBerkasZip']);
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


// ! TERAKHIR KEPEGAWAIAN UPDATE DIRI SENDIRI, SEKARANG DEBUG ATAU KELAS