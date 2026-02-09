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

            $table->foreignId('tahun_akademik_id')->constrained('tahun_akademik')->cascadeOnDelete();
            
            $table->foreignId('semester_id')->constrained('semester')->cascadeOnDelete();

            $table->timestamps();

            $table->unique([
                'siswa_id',
                'jadwal_pelajaran_id',
                'hari',
                'tahun_akademik_id',
                'semester_id',
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

/**
 * foto dihapus maka kolomnya berubah jadi : Bukti sudah dihapus admin pada now()
 * batasi ukuran foto
 * convert foto jadi format webp biar kecil
 */