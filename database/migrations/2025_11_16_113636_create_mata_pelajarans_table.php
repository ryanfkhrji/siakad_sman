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
        Schema::create('mata_pelajarans', function (Blueprint $table) {
            $table->id();
            $table->string('nama_pelajaran');
            $table->string('kode_mapel_diknas')->unique();
            // $table->enum('status', ['wajib', 'pilihan', 'jurusan']); // karna wajib di IPA belum tentu wajib di IPS
            // $table->decimal('nilai_kkm', 5, 2)->nullable()->default(0); // KKM IPA dan IPS berbeda
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mata_pelajarans');
    }
};
