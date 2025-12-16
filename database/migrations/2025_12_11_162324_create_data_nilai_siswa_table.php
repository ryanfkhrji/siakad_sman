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
            $table->foreignId('mata_pelajaran_id')->constrained('mata_pelajarans');

            // karna nilainya tetap per siswa, bisa ambil dari tabel langsung
            // $table->foreignId('kelas_id')->nullable()->constrained('kelas')->nullOnDelete();
            // $table->foreignId('jurusan_id')->nullable()->constrained('jurusans')->nullOnDelete();

            // tidak diadakan karna hanya view langsung dari tabel prestasi
            // $table->foreignId('prestasi_id')->nullable()->constrained('prestasi')->onDelete('set null');

            // Point nilai
            $table->decimal('point_absensi', 5, 2)->default(0);
            $table->decimal('point_tugas', 5, 2)->default(0);
            $table->decimal('point_uts', 5, 2)->default(0);
            $table->decimal('point_uas', 5, 2)->default(0);
            $table->decimal('point_ekskul', 5, 2)->nullable()->default(0);
            $table->enum('sikap', ['Sangat Baik','Baik','Cukup','Kurang'])->nullable();

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
