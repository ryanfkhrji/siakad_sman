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
   
    public function siswaEkskul()
    {
        return $this->hasMany(EkskulSiswaPivot::class, 'ekstrakurikuler_id');
    }

    public function pembinaEkskul()
    {
        return $this->hasMany(PembinaEkskul::class);
    }

    public function pelatihEkskul()
    {
        return $this->hasMany(PelatihEkskul::class);
    }
}
