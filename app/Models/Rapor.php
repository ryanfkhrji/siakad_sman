<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rapor extends Model
{
    use HasFactory;

    public function nilaiMapel()
    {
        return $this->hasMany(
            RaporNilaiSiswa::class,
            'rapor_id'
        );
    }

    public function nilaiEkskul()
    {
        return $this->hasMany(
            RaporNilaiEkskul::class,
            'rapor_id'
        );
    }

    public function nilaiP5()
    {
        return $this->hasMany(
            RaporNilaiP5::class,
            'rapor_id'
        );
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }

    public function waliRombel()
    {
        return $this->belongsTo(
            Kepegawaian::class,
            'wali_rombel_id'
        );
    }
}
