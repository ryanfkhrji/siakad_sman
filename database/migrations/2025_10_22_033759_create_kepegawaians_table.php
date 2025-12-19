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
        Schema::create('kepegawaians', function (Blueprint $table) {
            $table->id();
            $table->string('nama');
            $table->string('email')->unique();
            $table->string('status')->nullable();
            $table->string('nip')->nullable()->unique();
            $table->string('nuptk')->nullable();
            $table->text('keterangan')->nullable();
            $table->string('password');
            $table->enum('role', ['super_admin', 'kepsek', 'guru', 'staff', 'tu'])->default('staff');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('kepegawaians');
    }
};
