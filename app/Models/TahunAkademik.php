<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Rapor;
use App\Models\EkskulSiswaPivot;
use App\Models\WaliRombel;
use App\Models\PembinaEkskul;
use App\Models\PelatihEkskul;
use App\Models\Prestasi;
use App\Models\Semester;
use App\Models\DataBerkas;
use App\Models\WaliKelas;
use App\Models\SiswaRombel;
use App\Models\AbsensiSiswa;

class TahunAkademik extends Model
{
    use HasFactory;
    protected $table = 'tahun_akademik';
    protected $guarded = ['id'];

    public function rapor()
    {
        return $this->hasMany(Rapor::class);
    }

    public function ekskulSiswaPivots()
    {
        return $this->hasMany(EkskulSiswaPivot::class, 'tahun_akademik_id');
    }

    public function waliRombels()
    {
        return $this->hasMany(WaliRombel::class);
    }

    public function pembinaEkskul()
     { 
        return $this->hasMany(PembinaEkskul::class, 'tahun_akademik_id');
     }

    public function pelatihEkskul()
     { 
        return $this->hasMany(PelatihEkskul::class, 'tahun_akademik_id');
     }

    public function prestasi()
     { 
        return $this->hasMany(Prestasi::class, 'tahun_akademik_id');
     }

    public function semester()
    {
        return $this->hasMany(Semester::class, 'tahun_akademik_id');
    }

    public function dataBerkas()
    {
        return $this->hasMany(DataBerkas::class);
    }

    public function rombels()
    {
        return $this->hasMany(WaliKelas::class);
    }

    public function siswaRombel()
    {
        return $this->hasMany(SiswaRombel::class);
    }

    public function absensis()
    {
        return $this->hasMany(AbsensiSiswa::class, 'jadwal_pelajaran_id');
    }
}
