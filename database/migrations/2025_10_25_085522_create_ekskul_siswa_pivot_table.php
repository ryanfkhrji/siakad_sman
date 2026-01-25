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

            // siswa dihapus, maka ini juga dihapus
            $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade');
            
            $table->foreignId('ekstrakurikuler_id')->constrained('ekstrakurikulers')->onDelete('cascade');
        
            $table->foreignId('tahun_akademik_id')->nullable()->constrained('tahun_akademik');
            
            $table->enum('sikap', ['Sangat Baik','Baik','Cukup','Kurang'])->nullable();

            $table->enum('status', ['Aktif','Cukup Aktif','Kurang Aktif','Tidak Aktif'])->nullable();

            $table->unique(['siswa_id', 'ekstrakurikuler_id', 'tahun_akademik_id'],  'uniq_siswa_ekskul_ta'); // mencegah daftar ekskul yang sama > 1x

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
