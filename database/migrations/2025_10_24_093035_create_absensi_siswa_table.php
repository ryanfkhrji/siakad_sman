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
        Schema::create('absensi_siswa', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswas')->cascadeOnDelete();
            
            $table->foreignId('rombel_id')->constrained('rombels');
            
            $table->foreignId('jadwal_pelajaran_id')->constrained('jadwal_pelajarans')->cascadeOnDelete();
            
            $table->date('hari');             
            
            $table->enum('status', ['hadir', 'izin', 'sakit', 'alfa']);
            
            $table->string('bukti')->nullable();                        

            $table->timestamps();

            $table->unique([
                'siswa_id',
                'jadwal_pelajaran_id',
                'hari',
            ], 'unik');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('absensi_siswa');
    }
};