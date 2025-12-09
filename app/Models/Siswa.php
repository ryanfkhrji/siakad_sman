<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class Siswa extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'siswas';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    // protected $fillable = [
    //     'nama',
    //     'nip',
    //     'password',
    //     'role',
    // ];

    protected $guarded = ['id'];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

     /**
     * 1 siswa = banyak ekskul
     * Menggunakan pivot table
     *  */ 
    public function ekstrakurikulers()
    {
        return $this->belongsToMany(Ekstrakurikuler::class, 'ekskul_siswa_pivot');
    }


    // 1 siswa = 1 jurusan
    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class);
    }

    /**
     * 1 siswa = 1 kelas
     * kelas_id = id pada tabel kelas
     */
    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function pengajar()
    {
        return $this->belongsTo(Kepegawaian::class, 'pengajar_id');
    }

    public function jadwalPelajarans()
    {
        return $this->belongsToMany(JadwalPelajaran::class, 'siswa_jadwal_pelajaran');
    }


    public function absensis()
    {
        return $this->hasMany(AbsensiSiswa::class, 'siswa_id'); 
    }
}
