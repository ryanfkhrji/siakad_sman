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
        Schema::create('rapor', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('siswa_id')
                ->constrained('siswas')
                ->cascadeOnDelete();
        
            $table->foreignId('tahun_akademik_id')
                ->constrained('tahun_akademik')
                ->restrictOnDelete();
        
            $table->enum('semester', ['ganjil', 'genap']);
        
            // wali rombel yang mengesahkan
            $table->foreignId('wali_rombel_id')
                ->constrained('kepegawaians')
                ->restrictOnDelete();
        
            // status rapor
            $table->enum('status', ['draft', 'final'])
                ->default('draft');
        
            $table->date('tanggal_terbit')->nullable();
            $table->text('catatan_wali')->nullable();
        
            $table->timestamps();
        
            // 1 rapor per siswa per semester
            $table->unique([
                'siswa_id',
                'tahun_akademik_id',
                'semester'
            ], 'unik');
        });
           
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rapor');
    }
};
