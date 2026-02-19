<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Rapor;
use App\Models\SiswaRombel;
use App\Models\Siswa;
use App\Models\KurikulumMataPelajaran;
use App\Models\TahunAkademik;
use App\Models\Semester;
use App\Models\Kepegawaian;
use App\Models\Kelas;
use App\Models\Jurusan;
use App\Models\Prestasi;
use App\Models\MataPelajaran;
class DataNilaiSiswa extends Model
{
    use HasFactory;
    protected $table = 'data_nilai_siswa';
    protected $guarded = ['id'];       

    public function siswaRombel()
     {
         return $this->belongsTo(SiswaRombel::class, 'siswa_rombel_id');
     }

     // Data nilai dimiliki oleh siswa
     public function siswa()
     {
         return $this->belongsTo(Siswa::class, 'siswa_id');
     }

     public function kurikulumMataPelajaran()
     {
         return $this->belongsTo(KurikulumMataPelajaran::class);
     }
 
     public function tahunAkademik()
     {
         return $this->belongsTo(TahunAkademik::class, 'tahun_akademik_id');
     }

     public function semester()
     {
         return $this->belongsTo(Semester::class, 'semester_id');
     }

     public function guru()
     {
         return $this->belongsTo(Kepegawaian::class, 'guru_id');
     } 

     public function rapor()
     {
         return $this->belongsTo(Rapor::class, 'rapor_id');
     } 

     // Data nilai dimiliki oleh kelas
     public function kelas()
     {
         return $this->belongsTo(Kelas::class, 'kelas_id');
     }

     // Data nilai dimiliki oleh jurusan
     public function jurusan()
     {
         return $this->belongsTo(Jurusan::class, 'jurusan_pelajaran_id');
     }
     
     public function prestasi()
     {
         return $this->belongsTo(Prestasi::class, 'prestasi_id');
     }

     // Prestasi (opsional)
     public function mataPelajaran()
     {
         return $this->belongsTo(MataPelajaran::class, 'mata_pelajaran_id');
     }                     
}
