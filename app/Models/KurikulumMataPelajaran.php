<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KurikulumMataPelajaran extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $table = 'kurikulum_mata_pelajaran';

    public function kurikulum()
    {
        return $this->belongsTo(Kurikulum::class, 'kurikulum_id');
    }

    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'mata_pelajaran_id');
    }

    // kurmap punya banyak jadwal
    public function jadwalPelajarans()
    {
        return $this->hasMany(
            JadwalPelajaran::class,
            'kurikulum_mata_pelajaran_id'
        );
    }
   
    public function dataNilaiSiswa()
    {
        return $this->belongsTo(DataNilaiSiswa::class, 'kurikulum_mata_pelajaran_id');
    }

}
