<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kurikulum extends Model
{
    use HasFactory;
    protected $table = 'kurikulum';
    protected $guarded = ['id'];

    public function kompetensi()
    {
        return $this->hasMany(Kompetensi::class, 'kurikulum_id');
    }    

    public function kurikulumMataPelajaran()
    {
        return $this->hasMany(KurikulumMataPelajaran::class);
    }
}
