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
        Schema::create('siswas', function (Blueprint $table) {
            $table->id();
            $table->string('nisn')->unique();
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('nis')->unique();
            // $table->foreignId('kelas_id')->nullable()->constrained('kelas')->onDelete('cascade'); // hapus semua yang berhubungan
            // $table->foreignId('ekskul_id')->nullable()->constrained('ekstrakurikulers')->onDelete('restrict'); 
            $table->foreignId('jurusan_id')->constrained('jurusans')->onDelete('restrict'); 
            $table->foreignId('kelas_id')->constrained('kelas')->onDelete('restrict'); // tidak bisa hapus yang berhubungan
            $table->text('status')->nullable();
            $table->string('password');
            $table->string('role')->default('siswa');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('siswas');
    }
};
