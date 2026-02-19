<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Rapor;
use App\Models\TahunAkademik;
use App\Models\DataBerkas;
use App\Models\JadwalPelajaran;
use App\Models\AbsensiPegawai;
use App\Models\AbsensiSiswa;

class Semester extends Model
{
    use HasFactory;

    protected $table = 'semester';
    protected $guarded = ['id'];

    public function rapor()
    {
        return $this->hasMany(Rapor::class);
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }

    public function dataBerkas()
    {
        return $this->hasMany(DataBerkas::class);
    }

    public function jadwalPelajarans()
    {
        return $this->hasMany(JadwalPelajaran::class);
    }

    public function prestasi()
     { 
        return $this->hasMany(AbsensiPegawai::class, 'semester_id');
     }

     public function absensis()
    {
        return $this->hasMany(AbsensiSiswa::class, 'semester_id');
    }
}