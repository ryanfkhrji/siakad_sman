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
        Schema::create('semester', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tahun_akademik_id')
            ->constrained('tahun_akademik')
            ->cascadeOnDelete();

            $table->enum('semester', ['Ganjil', 'Genap']);
            
            $table->enum('status', ['aktif', 'arsip'])->default('aktif');            

            $table->timestamps();

            $table->unique([
                'tahun_akademik_id',
                'semester'
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('semester');
    }
};