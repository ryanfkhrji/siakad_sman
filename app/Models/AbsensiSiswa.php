<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbsensiSiswa extends Model
{
    use HasFactory;
    protected $table = 'absensi_siswa';
    protected $guarded = ['id'];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function jadwalPelajaran()
    {
        return $this->belongsToMany(JadwalPelajaran::class, 'siswa_jadwal_pelajaran')
        ->withPivot(
            [
                'siswa_id',
                'jadwal_pelajaran_id',
                'tahun_akademik_id',
                'status',        
            ]);
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class, 'semester_id');
    }
}