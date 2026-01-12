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

            $table->foreignId('semester_id')
                ->constrained('semester')
                ->restrictOnDelete(); // tidak boleh hapus
            
            $table->enum('hari', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']);

            $table->foreignId('guru_id')
                ->nullable()
                ->constrained('kepegawaians')
                ->nullOnDelete(); // set null jika induk dihapus

            $table->foreignId('rombel_id')->constrained('rombels')->restrictOnDelete(); // tidak boleh hapus

            $table->time('jam_mulai');
            $table->time('jam_selesai');

            $table->string('ruangan')->nullable();
                        
            $table->string('link_opsional')->nullable();        

            $table->timestamps();

            $table->unique([
                'rombel_id',
                'semester_id',
                'hari',
                'jam_mulai',
                'jam_selesai'
            ], 'uq_rmb_smt_har_jam');
            
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