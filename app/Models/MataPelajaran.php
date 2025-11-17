<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MataPelajaran extends Model
{
    use HasFactory;

    protected $table = 'mata_pelajarans';
    protected $guarded = ['id'];

    public function jadwalPelajarans()
    {
        return $this->hasMany(JadwalPelajaran::class, 'mata_pelajaran_id');
    }

}
