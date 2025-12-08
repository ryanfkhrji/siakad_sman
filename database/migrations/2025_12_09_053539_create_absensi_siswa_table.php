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
            $table->string('nama_siswa');
            
            $table->string('kelas');
            
            $table->string('mata_pelajaran');        

            $table->boolean('masuk')->default(false);

            $table->boolean('izin')->default(false);
            $table->string('bukti_izin')->nullable();

            $table->boolean('sakit')->default(false);
            $table->string('bukti_sakit')->nullable();

            $table->boolean('alfa')->default(false);

            $table->timestamps();
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
