<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Rombel extends Model
{
    use HasFactory;

    protected $table = 'rombels';
    protected $guarded = ['id'];

    // Rombel → Kelas (X, XI, XII)
    public function kelas()
    {
        return $this->belongsTo(Kelas::class);
    }

    public function waliRombels()
    {
        return $this->hasMany(WaliRombel::class);
    }

    // Rombel → Tahun Akademik
    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class);
    }

    public function waliRombel()
    {
        return $this->belongsTo(Kepegawaian::class, 'wali_rombel_id');
    }

    /**
     * ========================
     * KEANGGOTAAN SISWA
     * ========================
     */

    // Rombel → Banyak siswa (pivot)
    public function siswa()
    {
        return $this->belongsToMany(
            Siswa::class,
            'siswa_rombel',
            'rombel_id',
            'siswa_id'
        )->withTimestamps();
    }

    // Alternatif: model pivot
    public function siswaRombels()
    {
        return $this->hasMany(SiswaRombel::class, 'rombel_id');
    }    

    /**
     * ========================
     * OPERASIONAL AKADEMIK
     * ========================
     */

    // Jadwal pelajaran
    public function jadwalPelajarans()
    {
        return $this->hasMany(
            JadwalPelajaran::class,
            'rombel_id'
        );
    }

    // Absensi siswa
    public function absensiSiswas()
    {
        return $this->hasMany(AbsensiSiswa::class);
    }

    // Rapor siswa
    // public function rapors()
    // {
    //     return $this->hasMany(Rapor::class);
    // }

    // Projek P5
    // public function projekP5()
    // {
    //     return $this->hasMany(ProjekP5::class);
    // }
}
