<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('penerimaan_siswa_baru', function (Blueprint $table) {
            $table->id();
            $table->string('foto_siswa');
            $table->string('nama_siswa');
            $table->string('nisn')->unique();
            $table->string('jk');
            $table->string('tempat_lahir');
            $table->date('tanggal_lahir');
            $table->string('agama');
            $table->text('alamat');
            $table->string('no_hp_siswa');
            $table->string('nama_ayah');
            $table->string('pekerjaan_ayah');
            $table->string('no_hp_ayah');
            $table->string('nama_ibu');
            $table->string('pekerjaan_ibu');
            $table->string('no_hp_ibu');
            $table->string('nama_wali')->nullable();
            $table->string('pekerjaan_wali')->nullable();
            $table->string('no_hp_wali')->nullable();
            $table->string('sekolah_asal');
            $table->text('alamat_sekolah_asal');
            $table->string('kelas_terakhir')->nullable();
            $table->string('nilai_raport_terakhir')->nullable();
            $table->string('alasan_pindah')->nullable();
            $table->string('berkas_raport');
            $table->string('suket_pindah')->nullable();
            $table->string('berkas_kartu_keluarga');
            $table->string('berkas_akta_lahir');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('penerimaan_siswa_baru');
    }
};
