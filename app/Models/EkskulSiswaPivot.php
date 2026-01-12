<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class EkskulSiswaPivot extends Model
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'ekskul_siswa_pivot';

    protected $guarded = ['id'];

    public function ekstrakurikuler()
    {
        return $this->belongsTo(Ekstrakurikuler::class, 'ekstrakurikuler_id');
    }
    
    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }    
    
    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }
}
