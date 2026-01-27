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
        Schema::create('wali_rombel', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wali_rombel_id')
                ->constrained('kepegawaians')
                ->cascadeOnDelete();
            $table->foreignId('rombel_id')
                ->constrained('rombels')
                ->restrictOnDelete();   
            $table->foreignId('tahun_akademik_id')
                ->constrained('tahun_akademik')
                ->restrictOnDelete();
            $table->timestamps();

            $table->unique(['wali_rombel_id', 'rombel_id', 'tahun_akademik_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wali_rombel');
    }
};
