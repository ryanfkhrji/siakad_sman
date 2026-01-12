<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PembinaEkskul extends Model
{
    use HasFactory;

    protected $table = 'pembina_ekskul';
    protected $guarded = ['id'];

    public function pembina()
    {
        return $this->belongsTo(Kepegawaian::class, 'pembina_id');
    }

    public function ekstrakurikuler()
    {
        return $this->belongsTo(Ekstrakurikuler::class);
    }

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class);
    }
}
