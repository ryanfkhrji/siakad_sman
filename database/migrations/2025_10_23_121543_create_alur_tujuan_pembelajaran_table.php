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
        Schema::create('alur_tujuan_pembelajaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kompetensi_id')->constrained('kompetensi')->cascadeOnDelete();
            $table->foreignId('tahun_akademik_id')->constrained('tahun_akademik')->cascadeOnDelete();
            $table->foreignId('guru_id')
            ->nullable()
            ->constrained('kepegawaians')
            ->nullOnDelete();

            $table->enum('semester', ['Ganjil','Genap']); 
            $table->text('tujuan_pembelajaran'); // TP
            $table->unsignedInteger('urutan'); // ATP
            
            // untuk spa
            $table->enum('approval_status', ['draft', 'diajukan', 'disetujui', 'ditolak'])
            ->default('draft');
      
            $table->foreignId('approved_by')
                    ->nullable()
                    ->constrained('kepegawaians');
        
            $table->timestamp('approved_at')->nullable();

            $table->text('catatan_penolakan')->nullable();
        
            $table->boolean('is_locked')->default(false); // diterima = true, ditolak = false

            // cegah guru bikin ganda
            $table->unique([
                'kompetensi_id',
                'tahun_akademik_id',
                'semester',
                'urutan',
                'guru_id'
            ]);
            

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alur_tujuan_pembelajaran');
    }
};


/**
*   id     kompetensi_id (wajib jenis CP)      tahun_akademik_id    tujuan_pembelajaran     Urutan    semester    status
*   1      1 (K13)                                      2           Siswa mengenal...       1         Ganjil      arsip
*   2      3 (MERDEKA)                                  3           Siswa memahami...       1         Ganjil      arsip
*   2      3 (MERDEKA)                                  3           Siswa mencoba...        2         Genap       aktif
*/            