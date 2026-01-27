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

            // Identitas rombel
            $table->string('nama_rombel')->unique(); // contoh: X-A, XI-A, XII-A 

            $table->timestamps();        
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
