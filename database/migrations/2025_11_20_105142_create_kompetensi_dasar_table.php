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
        Schema::create('kompetensi_dasar', function (Blueprint $table) {
            $table->id();

            // relasi ke tabel mata_pelajarans
            $table->foreignId('mata_pelajaran_id')
                ->constrained('mata_pelajarans')
                ->cascadeOnDelete(); // hapus ini jika mata_pelajaran dihapus

            $table->string('judul_kompetensi_dasar');

            $table->unsignedTinyInteger('tingkat'); // 10, 11, 12
            
            $table->text('deskripsi')->nullable();

            $table->foreignId('kurikulum_id')
                ->nullable()
                ->constrained('kurikulum')
                ->onDelete('restrict'); // kasih tau bahwa masih digunakan

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kompetensi_dasar');
    }
};
