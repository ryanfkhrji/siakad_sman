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
Route::post('/register/kepegawaian', [KepegawaianController::class, 'registerKepegawaian']);

// ✅login pegawai
Route::post('/login/kepegawaian', [KepegawaianController::class, 'loginKepegawaian']);

Route::middleware('auth:kepegawaian')->group(function () {

    // ✅ logout pegawai
    Route::post('/logout/kepegawaian', [KepegawaianController::class, 'logoutKepegawaian']);

    // ✅ ubah password pegawai oleh super admin
    Route::post('/ubah-password-pegawai', [KepegawaianController::class, 'ubahPassword']);

    // ! ubah password pegawai oleh dirinya sendiri

    // ✅ ubah password siswa untuk super admin
    Route::post('/ubah-password-siswa', [SiswaController::class, 'ubahPassword']);

    // ✅ CRUD Kepegawaian oleh Super Admin
    Route::apiResource('kepegawaian', KepegawaianController::class)->except(['store']);

    // ! update kepegawaian oleh dirinya sendiri

    // ✅ CRUD Jurusan oleh Super Admin
    Route::apiResource('jurusan', JurusanController::class)->except(['index']);

    // ✅ CRUD Kelas oleh super admin
    Route::apiResource('kelas', KelasController::class);

    // ! CRUD Kelas oleh pegawai
    
    // ✅ CRUD Ekstrakurikuler Oleh Super Admin
    Route::apiResource('ekstrakurikuler', EkstrakurikulerController::class);

    // ! CRUD ekstrakurikuler oleh pegawai
    
    // ✅ CRUD Siswa Oleh  Super Admin
    Route::apiResource('siswa', SiswaController::class)->except(['store']);
    
    // ✅ CRUD Keikutsertaan Siswa ke Ekstrakurikuler oleh super admin
    Route::apiResource('siswa-ekskul', EkskulSiswaPivotController::class)->except(['index','show','update']);
    
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
Route::post('/lupa-password-pegawai', [KepegawaianController::class, 'sendResetLink']);

// ✅ lupa password siswa
// ! belum di debug
Route::post('/lupa-password-siswa', [SiswaController::class, 'sendResetLink']);

// ? ===================================================================================== ?
// ?                                        SISWA
// ? ===================================================================================== ?

// ✅ register siswa
Route::post('/register/siswa', [SiswaController::class, 'registerSiswa']);

// ✅ login siswa
Route::post('/login/siswa', [SiswaController::class, 'loginSiswa']);

Route::middleware('auth:siswa')->group(function () {

    // ✅ ubah password siswa untuk dirinya sendiri
    Route::put('/ubah-password-siswa/diri', [SiswaController::class, 'ubahPassDiri']);

    // ✅ show dirinya sendiri
    Route::get('/show-siswa/diri', [SiswaController::class, 'showDiriSendiri']);    

    // ✅ update siswa oleh diri sendiri
    Route::put('update-siswa/diri', [SiswaController::class, 'updateDirinyaSendiri']);

    // ✅ logout siswa
    Route::post('/logout/siswa', [SiswaController::class, 'logoutSiswa']);

    // ! get kelas sendiri
    Route::get('kelas/diri', [KelasController::class, 'showKelasSendiri']);

    // ✅ get all ekskul untuk siswa
    Route::apiResource('ekstrakurikuler-siswa', EkstrakurikulerController::class)->only(['index', 'show']);

    // ✅ siswa mendaftarkan diri sendiri ke ekskul
    Route::post('/siswa-daftar-ekskul/{id}', [EkskulSiswaPivotController::class, 'storeSiswa']);

    // ✅ siswa hapus diri sendiri dari ekskul
    Route::delete('/siswa-keluar-ekskul/{id}', [EkskulSiswaPivotController::class, 'destroySiswa']);
});
