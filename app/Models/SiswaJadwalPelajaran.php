<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\Pivot;

class SiswaJadwalPelajaran extends Pivot
{
    use HasFactory;
    
    protected $table = 'siswa_jadwal_pelajaran';

    protected $fillable = [
        'siswa_id',
        'jadwal_pelajaran_id'
    ];

    // agar id bisa ditampilkan di response sukses
    public $incrementing = true;
    protected $primaryKey = 'id';
    protected $keyType = 'int';

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function jurusan()
    {
        return $this->belongsTo(Jurusan::class, 'jurusan_id');
    }   

    public function jadwal()
    {
        return $this->belongsTo(JadwalPelajaran::class, 'jadwal_pelajaran_id');
    }

    public function absensiSiswas()
    {
        return $this->hasMany(AbsensiSiswa::class, 'siswa_id'); 
    }
}
