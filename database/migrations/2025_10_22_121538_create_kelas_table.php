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
        Schema::create('kelas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_kelas');
            $table->unsignedTinyInteger('tingkat');
            $table->foreignId('jurusan_id')->nullable()->constrained('jurusans');
            $table->foreignId('kurikulum_id')->nullable()->constrained('kurikulum');
            $table->unsignedBigInteger('wali_kelas'); // menyimpan id dari guru
            $table->foreign('wali_kelas')->references('id')->on('kepegawaians')->onDelete('restrict'); // tidak bisa hapus yang memakai id ini
            $table->time('jam_mulai');
            $table->time('jam_selesai');
            $table->timestamps();
        });
        // $table->string('jam_masuk');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kelas');
    }
};
