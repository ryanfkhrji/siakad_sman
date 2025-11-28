<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class JadwalPelajaran extends Model
{
    use HasFactory;
    protected $table = 'jadwal_pelajarans';
    protected $guarded = ['id'];

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'mata_pelajaran_id');
    }    

    public function guru()
    {
        return $this->belongsTo(Kepegawaian::class, 'guru_id');
    }


    public function kelas()
    {
        return $this->belongsTo(Kelas::class, 'kelas_id');
    }

    // 1 siswa bisa ambil banyak jadwal
    // public function siswas()
    // {
    //     return $this->belongsToMany(
    //         Siswa::class,
    //         'siswa_jadwal_pelajaran', // menentukan tabel pivot
    //         'jadwal_pelajaran_id',
    //         'siswa_id'
    //     )
    //     ->using(SiswaJadwalPelajaran::class)
    //     ->withTimestamps();
    // }

    public function siswas()
    {
        return $this->belongsToMany(Siswa::class, 'siswa_jadwal_pelajaran')
            ->withPivot('id')
            ->withTimestamps();
    }
}
