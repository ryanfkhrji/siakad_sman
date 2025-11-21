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
        Schema::create('gedung', function (Blueprint $table) {
            $table->id();
            $table->string('foto_gedung')->nullable();
            $table->string('kode_gedung')->unique();
            $table->string('nama_gedung');
            $table->integer('jumlah_lantai')->nullable();
            $table->string('luas_bangunan')->nullable(); // m2
            $table->year('tahun_dibangun')->nullable();
            $table->string('kondisi')->nullable(); // baik, rusak ringan, dll
            $table->string('lokasi')->nullable();
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gedung');
    }
};
