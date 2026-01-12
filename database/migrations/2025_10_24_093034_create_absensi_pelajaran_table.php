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

            // Kolom lainnya
            $table->date('hari');
            $table->enum('status', ['hadir', 'tidak hadir']);

            $table->foreignId('tahun_akademik_id')->constrained('tahun_akademik')->cascadeOnDelete();
            $table->timestamps();             

            $table->unique([
                'guru_pengajar_id',
                'jadwal_pelajaran_id',
                'hari',
                'tahun_akademik_id'
            ], 'unik');
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
