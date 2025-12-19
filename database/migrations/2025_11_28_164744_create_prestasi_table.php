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
        Schema::create('prestasi', function (Blueprint $table) {
            $table->id();

            // Relasi ke siswa -> jika siswa dihapus, prestasi ikut terhapus
            $table->foreignId('siswa_id')
                  ->constrained('siswas')
                  ->onDelete('cascade');

            // Relasi ke kelas -> jika kelas masih dipakai, tidak bisa dihapus
            $table->foreignId('kelas_id')
                  ->constrained('kelas')
                  ->onDelete('restrict');

            // Relasi ke jurusan -> jika jurusan masih dipakai, tidak bisa dihapus
            $table->foreignId('jurusan_id')
                  ->constrained('jurusans')
                  ->onDelete('restrict');

            $table->foreignId('tahun_akademik_id')
                ->nullable()
                ->constrained('tahun_akademik')
                ->onDelete('restrict');


            $table->text('prestasi_diraih');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('prestasi');
    }
};
