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
        Schema::create('data_berkas', function (Blueprint $table) {
            $table->id();
            $table->string('nama_berkas');
            $table->string('berkas');
            $table->foreignId('tahun_akademik_id')
            ->constrained('tahun_akademik')
            ->restrictOnDelete();
            $table->foreignId('semester_id')
            ->constrained('semester')
            ->restrictOnDelete();
            $table->timestamps();

            $table->unique([
                'nama_berkas',
                'tahun_akademik_id',
                'semester_id'
            ], 'unik');

            // ! Pastikan semester milik tahun akademik yang sama
            // $table->foreign(['semester_id', 'tahun_akademik_id'])
            // ->references(['id', 'tahun_akademik_id'])
            // ->on('semester');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_berkas');
    }
};
