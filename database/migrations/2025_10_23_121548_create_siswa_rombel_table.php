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
        Schema::create('siswa_rombel', function (Blueprint $table) {
            $table->id();

            // Relasi ke siswa
            $table->foreignId('siswa_id')
            ->constrained('siswas')
            ->cascadeOnDelete();

            // Relasi ke rombel
            $table->foreignId('rombel_id')
                ->constrained('rombels')
                ->restrictOnDelete();                          

            $table->foreignId('tahun_akademik_id')
                ->constrained('tahun_akademik')
                ->restrictOnDelete();
                
            $table->enum('status_akhir', [
                'naik_kelas',
                'tinggal_kelas',
                'lulus',
                'pindah',
                'berhenti',
                'diberhentikan'
            ])->nullable();
        
            $table->text('catatan')->nullable();
            
            $table->timestamps();            

            // siswa tidak boleh masuk 2x pada rombel yang sama pada tahun yang sama
            $table->unique(['siswa_id', 'rombel_id', 'tahun_akademik_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswa_rombel');
    }
};


 




