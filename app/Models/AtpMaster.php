<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AtpMaster extends Model
{
    use HasFactory;

    protected $table = 'atp_master';

    protected $guarded = ['id'];

     // ATP Master milik 1 Kompetensi
     public function kompetensi()
     {
         return $this->belongsTo(Kompetensi::class, 'kompetensi_id');
     }
 
     // ATP Master punya banyak implementasi
     public function alurTujuanPembelajarans()
     {
         return $this->hasMany(
             AlurTujuanPembelajaran::class,
             'atp_master_id'
         );
     }
 
     // (opsional) relasi ke semester
     public function semester()
     {
         return $this->belongsTo(Semester::class, 'semester_id');
     }
}
