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
        Schema::create('kurikulum_mata_pelajaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('kurikulum_id')->constrained('kurikulum');
            $table->foreignId('mata_pelajaran_id')->constrained('mata_pelajarans');
            $table->foreignId('jurusan_pelajaran_id')->nullable()->constrained('jurusans');
            $table->foreignId('tahun_akademik_id')->nullable()->constrained('tahun_akademik');

            $table->unsignedTinyInteger('tingkat'); // 10, 11, 12

            $table->integer('nilai_kkm');

            $table->enum('status', ['wajib', 'pilihan', 'jurusan']);

            $table->unique([
                'kurikulum_id',
                'mata_pelajaran_id',
                'jurusan_pelajaran_id',
                'tingkat'
            ]);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kurikulum_mata_pelajaran');
    }
};
