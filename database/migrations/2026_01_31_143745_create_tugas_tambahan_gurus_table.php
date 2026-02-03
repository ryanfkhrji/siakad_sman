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
        Schema::create('tugas_tambahan_gurus', function (Blueprint $table) {
            $table->id();
        
            $table->string('nama'); // Wali Kelas, Wakasek, Koord P5, dll
            $table->unsignedTinyInteger('jp_ekuivalen'); // pengganti jp biasa
        
            $table->timestamps();
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tugas_tambahan_gurus');
    }
};
