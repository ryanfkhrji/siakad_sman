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
    
    public function ekskulSiswa()
    {
        return $this->hasMany(EkskulSiswaPivot::class);
    }

    // 1 siswa = 1 jurusan
    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class);
    }    

    public function siswaRombels()
    {
        return $this->hasMany(SiswaRombel::class, 'siswa_id');
    }

    public function rombelAktif()
    {
        return $this->hasOne(SiswaRombel::class)
            ->whereHas('rombel.tahunAkademik', fn ($q) => $q->where('status', 'aktif'));
    }


    public function pengajar()
    {
        return $this->belongsTo(Kepegawaian::class, 'pengajar_id');
    }    

    public function jadwalPelajarans()
    {
        return $this->belongsToMany(
            JadwalPelajaran::class,
            'siswa_jadwal_pelajaran',
            'siswa_id',
            'jadwal_pelajaran_id'
        );
    }


    public function absensis()
    {
        return $this->hasMany(AbsensiSiswa::class, 'siswa_id'); 
    }

    public function kurikulumMataPelajarans()
    {
        return $this->hasMany(KurikulumMataPelajaran::class, 'siswa_id'); 
    }

    public function dataNilaiSiswas()
    {
        return $this->hasMany(DataNilaiSiswa::class, 'siswa_id');
    }

    public function prestasis()
    {
        return $this->hasMany(Prestasi::class, 'siswa_id');
    }
}
