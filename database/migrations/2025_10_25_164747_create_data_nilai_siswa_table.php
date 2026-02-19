<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_nilai_siswa', function (Blueprint $table) {
            $table->id();

            // Relasi
            $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade');

            $table->foreignId('guru_id')->constrained('kepegawaians');

            $table->foreignId('siswa_rombel_id')->constrained('siswa_rombel')->onDelete('cascade');
            
            $table->foreignId('kurikulum_mata_pelajaran_id')->constrained('kurikulum_mata_pelajaran');           

            $table->foreignId('tahun_akademik_id')
            ->constrained('tahun_akademik')
            ->restrictOnDelete();

            $table->foreignId('semester_id')
            ->constrained('semester')
            ->restrictOnDelete();
                        
            $table->enum('jenis_penilaian', ['PTS','PAS','Susulan PTS','Susulan PAS','Remedial PTS','Remedial PAS']);
                        
            $table->decimal('point_absensi', 5, 2)->default(0);

            $table->decimal('point_tugas', 5, 2)->default(0);

            $table->decimal('point_uts', 5, 2)->default(0);

            $table->decimal('point_uas', 5, 2)->default(0);    
            
            $table->decimal('nilai_akhir', 5, 2)->nullable();

            $table->string('predikat', 10)->nullable();

            $table->text('deskripsi')->nullable();

            $table->foreignId('rapor_id')->nullable()->constrained('rapor')->nullOnDelete();

            $table->unique([
                'siswa_id',
                'kurikulum_mata_pelajaran_id',
                'tahun_akademik_id',
                'semester_id',
                'jenis_penilaian',
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

