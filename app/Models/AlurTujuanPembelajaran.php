<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlurTujuanPembelajaran extends Model
{
    use HasFactory;
    protected $table = 'alur_tujuan_pembelajaran';
    protected $guarded = ['id'];

    public function kompetensi() 
    {
        return $this->belongsTo(Kompetensi::class, 'kompetensi_id');
    } 

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }

    public function approved()
    {
        return $this->belongsTo(Kepegawaian::class, 'approved_by');
    }

    public function guru()
    {
        return $this->belongsTo(Kepegawaian::class, 'guru_id');
    }
}