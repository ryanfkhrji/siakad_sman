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
        Schema::create('absensi_pelajaran', function (Blueprint $table) {
            $table->id();

            // Foreign keys
            $table->unsignedBigInteger('guru_pengajar_id');
            $table->unsignedBigInteger('jadwal_pelajaran_id'); // mata_pelajaran
            $table->unsignedBigInteger('kelas_id');            

            // Kolom lainnya
            $table->date('hari');
            $table->time('jam'); // ga disii otomatis
            $table->enum('status', ['hadir', 'tidak hadir']);
 
            $table->timestamps();             
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensi_pelajaran');
    }
};
