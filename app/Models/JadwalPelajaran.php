<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalPelajaran extends Model
{
    use HasFactory;
    protected $table = 'jadwal_pelajarans';
    protected $guarded = ['id'];        

    /**
     * Jadwal ini milik 1 kurikulum_mata_pelajaran
     */
    public function kurikulumMataPelajaran()
    {
        return $this->belongsTo(
            KurikulumMataPelajaran::class,
            'kurikulum_mata_pelajaran_id'
        );
    }

    public function guru()
    {
        return $this->belongsTo(Kepegawaian::class, 'guru_id');
    }


    public function rombel()
    {
        return $this->belongsTo(
            Rombel::class,
            'rombel_id'
        );
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }   

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_id');
    }    

    public function jurusanPelajaran()
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_pelajaran_id');
    }    

    public function siswas()
    {
        return $this->belongsToMany(Siswa::class, 'siswa_jadwal_pelajaran')
            ->withPivot('id', 'jadwal_pelajaran_id')
            ->withTimestamps();
    }    

    // public function siswaJadwalPelajaran()
    // {
    //     return $this->belongsToMany(
    //         Siswa::class,
    //         'siswa_jadwal_pelajaran',
    //         'jadwal_pelajaran_id',
    //         'siswa_id'
    //     );
    // }

    public function siswa()
    {
        return $this->belongsToMany(
            Siswa::class,
            'siswa_jadwal_pelajaran',
            'jadwal_pelajaran_id',
            'siswa_id'
        );
    }

    public function absensiPelajaran()
    {
        return $this->hasMany(AbsensiPelajaran::class, 'jadwal_pelajaran_id');
    }

    public function absensiPegawai()
    {
        return $this->hasMany(AbsensiPegawai::class, 'jadwal_pelajaran_id');
    }

    public function ruangan()
    {
        return $this->belongsTo(
            Ruangan::class,
            'ruangan_id'
        );
    }
}
