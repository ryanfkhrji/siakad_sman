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
        // ! yang input nilai adalah wali kelas, bukan pembina/pelatih
        // ! cek halaman 168
        Schema::create('data_nilai_ekskul', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('siswa_id')->constrained('siswas')->cascadeOnDelete();
            $table->foreignId('ekstrakurikuler_id')->constrained('ekstrakurikulers')->cascadeOnDelete();
        
            $table->foreignId('tahun_akademik_id')->constrained('tahun_akademik');
            $table->foreignId('semester_id')->constrained('semester');
        
            $table->enum('predikat', ['Sangat Baik','Baik','Cukup','Kurang']);
            $table->text('deskripsi')->nullable();
        
            $table->unique([
                'siswa_id',
                'ekstrakurikuler_id',
                'tahun_akademik_id',
                'semester_id'
            ], 'unik');
        
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_nilai_ekskul');
    }
};
