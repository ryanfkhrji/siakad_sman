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
        Schema::create('identitas_sekolah', function (Blueprint $table) {
            $table->id();
            
            // Identitas umum
            $table->string('npsn')->unique()->nullable();       // Nomor Pokok Sekolah Nasional
            $table->string('nama_sekolah')->unique();
            $table->string('status_sekolah')->nullable();      // Negeri/Swasta
            $table->string('jenjang')->nullable();             // SD/SMP/SMA/SMK
            $table->string('akreditasi')->nullable();          

            // Alamat
            $table->string('alamat')->nullable();
            $table->string('desa_kelurahan')->nullable();
            $table->string('kecamatan')->nullable();
            $table->string('kabupaten_kota')->nullable();
            $table->string('provinsi')->nullable();
            $table->string('kode_pos')->nullable();

            // Kontak
            $table->string('email')->nullable();
            $table->string('no_telepon')->nullable();

            // Data tambahan
            $table->string('kepala_sekolah')->nullable();
            $table->string('nip_kepala_sekolah')->nullable();

            $table->text('visi')->nullable();
            $table->text('misi')->nullable();

            // Logo jika disimpan path
            $table->string('logo')->nullable();  // path file

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('identitas_sekolah');
    }
};
