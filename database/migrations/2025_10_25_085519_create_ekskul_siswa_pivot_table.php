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
        Schema::create('ekskul_siswa_pivot', function (Blueprint $table) {
            $table->id();

            // ketika siswa di tabel siswa dihapus, maka yang mengandung id siswa tsb di pivot ini juga dihapus
            $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade');

            // ketika ekskul di tabel ekskul dihapus, maka yang mengandung id ekskul tsb di pivot ini juga dihapus
            $table->foreignId('ekstrakurikuler_id')->constrained('ekstrakurikulers')->onDelete('cascade');

            $table->unique(['siswa_id', 'ekstrakurikuler_id']); // mencegah daftar ekskul yang sama > 1x

            $table->foreignId('tahun_akademik_id')->nullable()->constrained('tahun_akademik');

            $table->enum('sikap', ['Sangat Baik','Baik','Cukup','Kurang'])->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ekskul_siswa_pivot');
    }
};
