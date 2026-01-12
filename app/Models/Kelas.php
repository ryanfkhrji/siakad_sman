<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Kelas extends Model
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'kelas';

    protected $guarded = ['id'];
    
    public function rombels()
    {
        return $this->hasMany(Rombel::class);
    }

    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_id');
    }

    public function siswas()
    {
        return $this->belongsToMany(Siswa::class, 'siswa_kelas')
            ->withPivot(['id', 'siswa_id', 'kelas_id', 'tahun_akademik'])
            ->withTimestamps();
    }

    public function jadwalPelajarans()
    {
        return $this->hasMany(JadwalPelajaran::class, 'kelas_id');
    }

    public function nilaiSiswa()
    {
        return $this->hasMany(DataNilaiSiswa::class, 'kelas_id');
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }

    public function kurikulum()
    {
        return $this->belongsTo(Kurikulum::class, 'kurikulum_id');
    }
}