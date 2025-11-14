<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Ekstrakurikuler extends Model
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'ekstrakurikulers';
    protected $guarded = ['id'];

    /**
     * 1 ekskul = banyak siswa
     * Menggunakan pivot table
     *  */
    public function siswas()
    {
        // return $this->belongsToMany(Siswa::class, 'ekskul_siswa_pivot');
        return $this->belongsToMany(Siswa::class, 'ekskul_siswa_pivot')
            ->withPivot('id')
            ->withTimestamps();
    }

    public function pengajar()
    {
        return $this->belongsTo(Kepegawaian::class, 'pengajar_id');
    }


    // untuk menampilkan anggota ekskul pada pivotcontroller
    public function peserta()
    {
        return $this->hasMany(EkskulSiswaPivot::class);
    }
}
