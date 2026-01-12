<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PelatihEkskul extends Model
{
    use HasFactory;

    protected $table = 'pelatih_ekskul';
    protected $guarded = ['id'];

    public function pelatih()
    {
        return $this->belongsTo(Kepegawaian::class, 'pelatih_id');
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
