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
        Schema::create('ruangan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('gedung_id')
                ->constrained('gedung')
                ->onDelete('cascade'); // ketika gedung dihapus, ruangannya ikut terhapus

            $table->string('kode_ruangan')->unique();      // kode ruangan, misal R-101
            $table->string('nama_ruangan')->unique();      // nama ruangan, misal Laboratorium Kimia
            $table->string('jenis_ruangan')->nullable();   // kelas, lab, aula, kantor, gudang, dll
            $table->integer('lantai')->nullable();         // ruangan ada di lantai berapa
            $table->integer('kapasitas')->nullable();      // kapasitas orang
            $table->string('luas_ruangan')->nullable();    // m2
            $table->string('kondisi')->nullable();         // baik, rusak ringan, rusak berat, dll
            $table->text('fasilitas')->nullable();         // daftar fasilitas, opsional
            $table->text('keterangan')->nullable();        // catatan tambahan
            $table->timestamps();
        });
    }


    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ruangan');
    }
};
