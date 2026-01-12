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
        Schema::create('siswa_jadwal_pelajaran', function (Blueprint $table) {
            $table->id();

            $table->foreignId('siswa_id')
                ->constrained('siswas')
                ->cascadeOnDelete();

            $table->foreignId('jadwal_pelajaran_id')
                ->constrained('jadwal_pelajarans')
                ->cascadeOnDelete();
                
                $table->timestamps();
                                
            // setiap siswa tidak boleh ambil jadwal yang sama lebih dari sekali
            $table->unique(['siswa_id', 'jadwal_pelajaran_id']);
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswa_jadwal_pelajaran');
    }
};

/**
 * siswa (belongs)
 * jurusan (belongs)
 * jadwalPelajaran (hasMany)
 * absensiSiswa (hasMany)
 */