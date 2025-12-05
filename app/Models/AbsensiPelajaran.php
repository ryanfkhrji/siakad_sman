<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbsensiPelajaran extends Model
{
    use HasFactory;
    protected $table = 'absensi_pelajaran';

    protected $guarded = ['id'];

    public function jadwalPelajaran()
    {
        return $this->belongsTo(JadwalPelajaran::class, 'jadwal_pelajaran_id');
    }

    public function guru()
    {
        return $this->belongsTo(Kepegawaian::class, 'guru_pengajar_id');
    }
}
