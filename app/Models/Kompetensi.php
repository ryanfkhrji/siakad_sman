<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kompetensi extends Model
{
    use HasFactory;
    protected $table = 'kompetensi';
    protected $guarded = ['id'];

    public function kurikulum()
    {
        return $this->belongsTo(Kurikulum::class, 'kurikulum_id');
    }
    
    public function mataPelajaran()
    {
        return $this->belongsTo(MataPelajaran::class, 'mata_pelajaran_id');
    }

     // 1 Kompetensi punya banyak ATP Master
     public function atpMasters()
     {
         return $this->hasMany(AtpMaster::class, 'kompetensi_id');
     }
 
     // (opsional) shortcut ke ATP implementasi
     public function alurTujuanPembelajarans()
     {
         return $this->hasManyThrough(
             AlurTujuanPembelajaran::class,
             AtpMaster::class,
             'kompetensi_id',   // FK di atp_master
             'atp_master_id',   // FK di alur_tujuan_pembelajaran
             'id',
             'id'
         );
     }

}
