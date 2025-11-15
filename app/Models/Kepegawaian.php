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


    /**
     * Satu kelas = satu wali, yang datanya diambil dari tabel kepegawaians. 
     * Kolom wali_kelas di tabel kelas menyimpan id dari kepegawaian yang menjadi wali.
     * Relasi ini adalah one-to-one (inverse): kelas → kepegawaian.
     */
    // public function wali()
    // {
    //     return $this->hasOne(Kelas::class, 'wali_kelas');
    // }

    /**
     * Seorang pegawai bisa menjadi wali dari satu kelas.
     * Laravel akan mencari di tabel kelas di mana wali_kelas = id pegawai.
     * Ini adalah relasi one-to-one: kepegawaian → kelas
     */
    public function kelas()
    {
        return $this->hasOne(Kelas::class, 'wali_kelas');
    }

    
    public function ekstrakurikuler()
    {
        return $this->hasOne(Ekstrakurikuler::class, 'pengajar_id');
    }

    
}
