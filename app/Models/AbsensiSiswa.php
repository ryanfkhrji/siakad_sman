<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbsensiSiswa extends Model
{
    use HasFactory;
    protected $table = 'absensi_siswa';
    protected $guarded = ['id'];

    public function siswaJadwalPelajaran()
    {
        return $this->belongsTo(SiswaJadwalPelajaran::class, 'mata_pelajaran_id');
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'mata_pelajaran_id');
    }

}
