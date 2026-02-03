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
        Schema::create('kompetensi', function (Blueprint $table) {
            $table->id();
        
            $table->foreignId('kurikulum_id')->constrained('kurikulum')->cascadeOnDelete(); // gabungan

            $table->foreignId('mata_pelajaran_id')->constrained('mata_pelajarans')->cascadeOnDelete(); // gabungan
            
            $table->string('judul_kompetensi'); // Misal: "Aljabar Linear"

            $table->enum('jenis', ['KD', 'CP']); // gabungan

            $table->string('kode')->nullable(); // KD-3.1 atau CP-MAT-F (bukan dari pemerintah)
                        
            $table->enum('tingkat', ['10', '11', '12'])->nullable(); // K13

            $table->enum('aspek', ['sikap', 'pengetahuan', 'keterampilan'])->nullable(); // K13
                
            $table->enum('fase', ['A','B','C','D','E','F'])->nullable(); // merdeka
        
            $table->text('deskripsi'); // Gabungan

            $table->enum('status', ['aktif', 'arsip'])->default('aktif');

            $table->unique([
                'kurikulum_id',
                'mata_pelajaran_id',
                'jenis',
                'kode',
                'tingkat',
                'aspek'
            ], 'unik_k13');

            $table->unique([
                'kurikulum_id',
                'jenis',
                'mata_pelajaran_id',
                'kode',
                'fase',
            ], 'unik_merdeka');
        
            $table->timestamps();
        });
              
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kompetensi');
    }
};


/**
* KD K13
*   id     kurikulum       mapel      jenis       Kode    kelas      aspek              deskripsi
*   1         K13           IPA         KD        3.1      10        pengetahuan        Mengnalisis..
*   2         K13           IPS         KD        4.1      11        keterampilan       Menyajikan...
*/


/**
* MERDEKA
*   id     kurikulum       mapel      jenis       fase     deskripsi
*   3       merdeka        B.Indo       CP         E       Memahami konsep...
*   4       merdeka         IPA         CP         E       Mengidentifikasi sumber...
*   5       merdeka         IPA         CP         E       Menjelaskan perubahan...
**/


// Fase E = Kelas X
// Fase F = Kelas XI - XII