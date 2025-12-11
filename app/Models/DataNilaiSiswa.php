<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DataNilaiSiswa extends Model
{
    use HasFactory;
    protected $table = 'data_nilai_siswa';
    protected $guarded = ['id'];

     // Data nilai dimiliki oleh siswa
     public function siswa()
     {
         return $this->belongsTo(Siswa::class, 'siswa_id');
     }
 
     // Data nilai dimiliki oleh kelas
     public function kelas()
     {
         return $this->belongsTo(Kelas::class, 'kelas_id');
     }
 
     // Data nilai dimiliki oleh jurusan
     public function jurusan()
     {
         return $this->belongsTo(Jurusan::class, 'jurusan_id');
     }
 
     // Prestasi (opsional)
     public function prestasi()
     {
         return $this->belongsTo(Prestasi::class, 'prestasi_id');
     }
}
