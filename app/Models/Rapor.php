<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\RaporNilaiEkskul;
use App\Models\RaporNilaiP5;
use App\Models\Siswa;
// use App\Models\Kepegawaian;
use App\Models\WaliRombel;
use App\Models\SiswaRombel;
use App\Models\TahunAkademik;
use App\Models\Semester;
use App\Models\DataNilaiSiswa;

class Rapor extends Model
{
    use HasFactory;

    protected $table = 'rapor';

    protected $guarded = ['id'];

    public function nilaiEkskul()
    {
        return $this->hasMany(
            RaporNilaiEkskul::class,
            'rapor_id'
        );
    }

    public function nilaiP5()
    {
        return $this->hasMany(
            RaporNilaiP5::class,
            'rapor_id'
        );
    }

    public function siswa()
    {
        return $this->belongsTo(Siswa::class);
    }

    public function waliRombel()
    {
        return $this->belongsTo(
            WaliRombel::class,
            'wali_rombel_id'
        );
    }    

    public function siswaRombel()
    {
        return $this->belongsTo(SiswaRombel::class);
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }    

    // relasi ke data nilai siswa (WAJIB ada rapor_id di data_nilai_siswa)
    public function nilaiMapel()
    {
        return $this->hasMany(DataNilaiSiswa::class, 'rapor_id');
    }
}
