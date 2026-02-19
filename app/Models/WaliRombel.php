<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Kepegawaian;
use App\Models\Rombel;
use App\Models\TahunAkademik;

class WaliRombel extends Model
{
    use HasFactory;

    protected $table = 'wali_rombel';

    // protected $fillable = [
    //     'wali_rombel_id',
    //     'rombel_id',
    //     'tahun_akademik_id',
    // ];

    protected $guarded = ['id'];

    public function wali()
    {
        return $this->belongsTo(Kepegawaian::class, 'wali_rombel_id');
    }

    public function rombel()
    {
        return $this->belongsTo(Rombel::class, 'rombel_id');
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class);
    }
}
