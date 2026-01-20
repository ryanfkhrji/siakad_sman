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
        Schema::create('data_nilai_siswa', function (Blueprint $table) {
            $table->id();

            // Relasi
            $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade');
            
            $table->foreignId('kurikulum_mata_pelajaran_id')->constrained('kurikulum_mata_pelajaran'); // sudah memuat mata_pelajaran_id dan jurusan_pelajaran_id
            
            // tidak ada, tapi get
            // $table->foreignId('tahun_akademik_id')
            // ->constrained('tahun_akademik')
            // ->restrictOnDelete();

            $table->foreignId('semester_id')
            ->constrained('semester')
            ->restrictOnDelete();

            $table->foreignId('guru_id')->constrained('kepegawaians');


            // Point nilai (gunakan rumus)            
            $table->decimal('point_absensi', 5, 2)->default(0);

            $table->decimal('point_tugas', 5, 2)->default(0);
            $table->decimal('point_uts', 5, 2)->default(0);
            $table->decimal('point_uas', 5, 2)->default(0);
            
            $table->enum('sikap', ['Sangat Baik','Baik','Cukup','Kurang'])->nullable();

            $table->unique([
                'siswa_id',
                'kurikulum_mata_pelajaran_id',
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
        Schema::dropIfExists('data_nilai_siswa');
    }
};