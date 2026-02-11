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
        Schema::create('rapor_nilai_siswa', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('rapor_id')
                ->constrained('rapor')
                ->cascadeOnDelete();
        
            $table->foreignId('kurikulum_mata_pelajaran_id')
                ->constrained('kurikulum_mata_pelajaran')
                ->restrictOnDelete();
        
            $table->decimal('nilai_akhir', 5, 2);
            
            $table->string('predikat', 10);
        
            $table->text('deskripsi')->nullable();
        
            $table->timestamps();
        
            // 1 mapel hanya sekali di 1 rapor
            $table->unique([
                'rapor_id',
                'kurikulum_mata_pelajaran_id'
            ], 'unik');
        });                  
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapor_nilai_siswa');
    }
};
