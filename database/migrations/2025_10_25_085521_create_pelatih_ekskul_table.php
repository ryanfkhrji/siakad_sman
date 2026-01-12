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
        Schema::create('pelatih_ekskul', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pelatih_id')
                ->constrained('kepegawaians')
                ->restrictOnDelete();
            $table->foreignId('ekstrakurikuler_id')
                ->constrained('ekstrakurikulers')
                ->restrictOnDelete();
            $table->foreignId('tahun_akademik_id')
                ->constrained('tahun_akademik')
                ->restrictOnDelete();

            // tidak boleh dobel
            $table->unique(['pelatih_id', 'ekstrakurikuler_id', 'tahun_akademik_id'], 'unik');

            // 1 ekskul -> 1 pelatih -> 1 tahun
            $table->unique(['ekstrakurikuler_id', 'tahun_akademik_id'], 'unikDua');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pelatih_ekskul');
    }
};
