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
        Schema::create('rombels', function (Blueprint $table) {
            $table->id();

            // Jenjang / tingkat (X, XI, XII)
            $table->foreignId('kelas_id')
            ->constrained('kelas')
            ->restrictOnDelete();

            // Tahun akademik
            $table->foreignId('tahun_akademik_id')
                ->constrained('tahun_akademik')
                ->restrictOnDelete();

            // Identitas rombel
            $table->string('nama_rombel'); // contoh: X-1, XI-IPA-2            

            // Wali kelas
            $table->foreignId('wali_rombel_id')
                ->constrained('kepegawaians')
                ->restrictOnDelete();

            $table->timestamps();        
            
            // 1 rombel unik per tahun
            $table->unique(['nama_rombel', 'tahun_akademik_id']);

            // 1 guru hanya boleh jadi wali 1 rombel per tahun
            $table->unique(['wali_rombel_id', 'tahun_akademik_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rombels');
    }
};
