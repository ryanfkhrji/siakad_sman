<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Kepegawaian extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'kepegawaians';

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
    
    public function rombels()
    {
        return $this->hasMany(Rombel::class, 'wali_rombel_id');
    }    

    public function waliRombels()
    {
        return $this->hasMany(WaliRombel::class, 'wali_rombel_id');
    }

    public function pembinaEkskul()
    {
        return $this->hasMany(PembinaEkskul::class, 'pembina_id');
    }

    public function pelatihEkskul()
    {
        return $this->hasMany(PelatihEkskul::class, 'pelatih_id');
    }

    public function jadwalPelajarans()
    {
        return $this->hasMany(JadwalPelajaran::class, 'guru_id'); 
    }

    public function absensiKepegawaians()
    {
        return $this->hasMany(AbsensiPegawai::class, 'guru_id'); 
    }

    public function absensiPelajarans()
    {
        return $this->hasMany(AbsensiPelajaran::class, 'guru_pengajar_id'); 
    }

    public function dataNilaiSiswas()
    {
        return $this->hasMany(DataNilaiSiswa::class, 'guru_id'); 
    }
}
