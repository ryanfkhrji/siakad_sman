<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ruangan extends Model
{
    use HasFactory;

    protected $table = 'ruangan';
    protected $guarded = ['id'];

    public function gedung() 
    {
        return $this->belongsTo(Gedung::class, 'gedung_id');
    }    

    public function jadwalPelajarans()
    {
        return $this->hasMany(
            JadwalPelajaran::class,
            'ruangan_id'
        );
    }
}
