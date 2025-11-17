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

    /**
     * Satu kelas = satu wali, yang datanya diambil dari tabel kepegawaians. 
     * Kolom wali_kelas di tabel kelas menyimpan id dari kepegawaian yang menjadi wali.
     * Relasi ini adalah one-to-one (inverse): kelas → kepegawaian.
     */
    public function wali()
    {
        return $this->belongsTo(Kepegawaian::class, 'wali_kelas');
    }

    /**
     * Satu kelas = banyak siswa
     * id = kelas_id pada tabel kelas
     * Relasi ini adalah one-to-many (inverse): kelas → siswa.
     */
    public function siswa()
    {
        return $this->hasMany(Siswa::class);
    }

    public function jadwalPelajarans()
    {
        return $this->hasMany(JadwalPelajaran::class, 'kelas_id');
    }
}
