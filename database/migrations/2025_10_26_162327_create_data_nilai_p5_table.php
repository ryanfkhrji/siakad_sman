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
        Schema::create('data_nilai_p5', function (Blueprint $table) {
            $table->id();
        
            // Relasi utama
            $table->foreignId('siswa_id')
                ->constrained('siswas')
                ->cascadeOnDelete();
        
            $table->foreignId('projek_p5_id')
                ->constrained('projek_p5')
                ->cascadeOnDelete();
        
            // Dimensi Profil Pelajar Pancasila
            $table->enum('dimensi', [
                'Beriman dan Bertakwa kepada Tuhan YME',
                'Berkebinekaan Global',
                'Gotong Royong',
                'Mandiri',
                'Bernalar Kritis',
                'Kreatif'
            ]);
        
            // Predikat perkembangan
            $table->enum('predikat', [
                'BB',   // Belum Berkembang
                'MB',   // Mulai Berkembang
                'BSH',  // Berkembang Sesuai Harapan
                'SAB'   // Sangat Berkembang
            ])->nullable();
        
            // Catatan observasi guru
            $table->text('deskripsi')->nullable();
        
            // Status pengisian (opsional tapi berguna)
            $table->enum('status', ['draft', 'final'])
                ->default('draft');
        
            $table->timestamps();
        
            // 1 siswa hanya boleh punya 1 nilai per dimensi dalam 1 projek
            $table->unique([
                'siswa_id',
                'projek_p5_id',
                'dimensi'
            ], 'unik');
        });        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_nilai_p5');
    }
};
