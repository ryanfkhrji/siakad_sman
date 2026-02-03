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
        // sains, sains, bahasa = diterima (maks 2 sama, 1 beda)
        // sains, bahasa, sosial = ditolak (beda semua)
        Schema::create('mata_pelajarans', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pelajaran');
            $table->string('kode_mapel_diknas')->unique();
            $table->enum('kelompok', ['umum', 'sains', 'ipa', 'sosial', 'ips', 'bahasa', 'seni'])->default('umum');        
            $table->enum('status', ['aktif', 'arsip'])->default('aktif');        
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mata_pelajarans');
    }
};