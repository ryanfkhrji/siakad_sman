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
        Schema::create('jadwal_pelajarans', function (Blueprint $table) {
            $table->id();

            // relasi ke tabel pivot kurikulum_pelajaras
            $table->foreignId('kurikulum_mata_pelajaran_id')
                ->constrained('kurikulum_mata_pelajaran')
                ->cascadeOnDelete(); // hapus ini jika mata_pelajaran dihapus

            $table->foreignId('jurusan_pelajaran_id')->nullable()->constrained('jurusans')->nullOnDelete();
            
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']);

            // relasi ke tabel kepegawaians (guru)
            $table->foreignId('guru_id')
                ->nullable()
                ->constrained('kepegawaians')
                ->nullOnDelete(); // set null jika induk dihapus

            // relasi ke tabel kelas
            $table->foreignId('kelas_id')
                ->nullable()
                ->constrained('kelas')
                ->nullOnDelete();

            // $table->string('jam_pelajaran'); // contoh: "07:00 - 08:30"
            $table->time('jam_mulai');
            $table->time('jam_selesai');

            // ruangan opsional
            $table->string('ruangan')->nullable();

            // link opsional (misal zoom/google meet)
            $table->string('link_opsional')->nullable();

            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('jadwal_pelajarans');
    }
};
