<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Siswa;
use App\Models\Rombel;
use App\Models\TahunAkademik;
use App\Models\Rapor;

class SiswaRombel extends Model
{
    use HasFactory;
    protected $table = 'siswa_rombel';
    protected $guarded = ['id'];

    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function rombel()
    {
        return $this->belongsTo(Rombel::class, 'rombel_id');
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
    }

    public function rapor()
    {
        return $this->hasMany(Rapor::class);
    }
}
