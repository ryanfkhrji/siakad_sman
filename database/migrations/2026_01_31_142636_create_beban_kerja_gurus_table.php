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
        Schema::create('beban_kerja_gurus', function (Blueprint $table) {
            $table->id();
        
            // guru
            $table->foreignId('guru_id')
                ->constrained('kepegawaians')
                ->restrictOnDelete();
        
            // tahun akademik
            $table->foreignId('tahun_akademik_id')
                ->constrained('tahun_akademik')
                ->restrictOnDelete();
        
            // semester
            $table->foreignId('semester_id')
                ->constrained('semester')
                ->restrictOnDelete();
        
            /**
             * jenis beban kerja
             * - mengajar  → dari jadwal pelajaran
             * - tambahan  → wakasek, wali kelas, ekskul, P5, dll
             */
            $table->enum('jenis', [
                'mengajar',
                'tugas_tambahan'
            ]);
        
            /**
             * referensi opsional
             * - jika mengajar → jadwal_pelajarans.id
             * - jika tugas    → tugas_tambahan_gurus.id (opsional)
             */
            $table->unsignedBigInteger('referensi_id')->nullable();
        
            // nama tugas / mapel
            $table->string('nama');
        
            /**
             * jumlah jam pelajaran
             * - mengajar → JP asli
             * - tugas    → JP ekuivalen
             */
            $table->unsignedTinyInteger('jp');
        
            // status validasi kurikulum / kepala sekolah
            $table->enum('status', [
                'draft',
                'disetujui',
                'ditolak'
            ])->default('draft');
        
            $table->timestamps();
        
            // satu guru tidak boleh punya beban kerja identik
            $table->unique([
                'guru_id',
                'tahun_akademik_id',
                'semester_id',
                'jenis',
                'referensi_id'
            ], 'uq_beban_guru');
        });        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('beban_kerja_gurus');
    }
};
