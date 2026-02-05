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
            $table->string('nama_rombel'); // contoh: X-A, XI-A, XII-A-IPA

            $table->foreignId('jurusan_id')->nullable()->constrained('jurusans');            

            $table->enum('status', ['aktif', 'arsip'])->default('aktif');

            $table->unique(['kelas_id', 'nama_rombel', 'jurusan_id']);

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
