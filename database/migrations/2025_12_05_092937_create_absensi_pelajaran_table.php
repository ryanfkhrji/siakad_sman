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
            $table->foreignId('guru_pengajar_id')->constrained('kepegawaians')->onDelete('cascade');;
            $table->foreignId('jadwal_pelajaran_id')->constrained('jadwal_pelajarans')->onDelete('cascade');;
            $table->foreignId('kelas_id')->constrained('kelas');

            // Kolom lainnya
            $table->date('hari');
            $table->time('jam');
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
