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
            
            $table->foreignId('kurikulum_mata_pelajaran_id')
                ->constrained('kurikulum_mata_pelajaran')
                ->restrictOnDelete(); // tidak boleh hapus

            $table->foreignId('tahun_akademik_id')
                ->constrained('tahun_akademik')
                ->restrictOnDelete(); // tidak boleh hapus

            $table->foreignId('semester_id')
                ->constrained('semester')
                ->restrictOnDelete(); // tidak boleh hapus
            
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']);            

            $table->foreignId('guru_id')->constrained('kepegawaians')->restrictOnDelete(); // tidak boleh hapus

            $table->foreignId('rombel_id')->constrained('rombels')->restrictOnDelete();

            $table->time('jam_mulai');
            $table->time('jam_selesai');

            $table->foreignId('ruangan_id')
            ->nullable()
            ->constrained('ruangan')
            ->nullOnDelete();
                        
            $table->string('link_opsional')->nullable();        

            $table->timestamps();

             /**
             * 1️⃣ 1 ROMBEL tidak boleh 2 pelajaran di jam sama
             */
            $table->unique([
                'rombel_id',
                'tahun_akademik_id',
                'semester_id',
                'hari',
                'jam_mulai',
                'jam_selesai'
            ], 'uq_rombel_jadwal');

            /**
             * 2️⃣ 1 GURU tidak boleh ngajar 2 kelas di jam sama
             */
            $table->unique([
                'guru_id',
                'tahun_akademik_id',
                'semester_id',
                'hari',
                'jam_mulai',
                'jam_selesai'
            ], 'uq_guru_jadwal');

            /**
             * 3️⃣ 1 MAPEL tidak boleh dobel di rombel & jam yang sama
             * (opsional tapi aman)
             */
            $table->unique([
                'kurikulum_mata_pelajaran_id',
                'rombel_id',
                'tahun_akademik_id',
                'semester_id',
                'hari',
                'jam_mulai',
                'jam_selesai'
            ], 'uq_mapel_rombel_jadwal');
            
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

/**
 * kurikulumMataPelajaran (belongTo)
 * guru (belongsTo)
 * kelas (belongsTo)
 * tahunAkademik (belongsTo)
 * jurusan (belongsTo)
 * jurusanPelajaran (belongsTo)
 * siswas (belongsToMany)
 * absensiPelajaran (hasMany)
 */