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
        Schema::create('atp_master', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kompetensi_id')->constrained('kompetensi')->cascadeOnDelete();
            $table->unsignedInteger('urutan');
            $table->text('tujuan_pembelajaran');
            $table->enum('status', ['aktif', 'arsip'])->default('aktif');
            $table->timestamps();
        
            $table->unique([
                'kompetensi_id',
                'urutan'
            ]);
        });
        
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('atp_master');
    }
};
