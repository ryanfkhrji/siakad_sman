<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Jurusan extends Model
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'jurusans';
    protected $guarded = ['id'];

    // 1 jurusan = banyak siswa
    public function siswas()
    {
        return $this->hasMany(Siswa::class);
    }

    public function nilaiSiswa()
    {
        return $this->hasMany(DataNilaiSiswa::class, 'jurusan_pelajaran_id');
    }

    public function rombels()
    {
        return $this->hasMany(Rombel::class, 'jurusan_id');
    }
    
    public function jadwalPelajarans()
    {
        return $this->hasMany(JadwalPelajaran::class, 'jurusan_id');
    }

}
