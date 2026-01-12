<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataBerkas extends Model
{
    use HasFactory;
    protected $table = 'data_berkas';
    protected $guarded = ['id'];

    public function tahunAkademik()
    {
        return $this->belongsTo(TahunAkademik::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }
}
