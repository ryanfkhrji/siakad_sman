<?php

namespace App\Imports;

use App\Models\Psb;
use Maatwebsite\Excel\Concerns\ToModel;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Illuminate\Support\Str;

class PsbImport implements ToCollection
{
    public function collection(Collection $rows)
    {
        $rows->skip(1)->each(function ($row) {
            Psb::create([
                'foto_siswa' => $this->cleanPath($row[0]),
                'nama_siswa' => $row[1],
                'nisn' => $this->cleanText($row[2]),
                'jk' => $row[3],
                'tempat_lahir' => $row[4],
                'tanggal_lahir' => $row[5],
                'agama' => $row[6],
                'alamat' => $row[7],
                'no_hp_siswa' => $this->cleanText($row[8]),
                'nama_ayah' => $row[9],
                'pekerjaan_ayah' => $row[10],
                'no_hp_ayah' => $this->cleanText($row[11]),
                'nama_ibu' => $row[12],
                'pekerjaan_ibu' => $row[13],
                'no_hp_ibu' => $this->cleanText($row[14]),
                'nama_wali' => $row[15],
                'pekerjaan_wali' => $row[16],
                'no_hp_wali' => $this->cleanText($row[17]),
                'sekolah_asal' => $row[18],
                'alamat_sekolah_asal' => $row[19],
                'kelas_terakhir' => $row[20],
                'nilai_raport_terakhir' => $this->cleanText($row[21]),
                'alasan_pindah' => $row[22],
                'berkas_raport' => $row[23],
                'suket_pindah' => $row[24],
                'berkas_kartu_keluarga' => $row[25],
                'berkas_akta_lahir' => $row[26],
            ]);
        });
    }

    // bersihkan tanda '
    private function cleanText($value)
    {
        return Str::startsWith($value, "' ") ? Str::replaceFirst("' ", '', $value) : $value;
    }

    private function cleanPath($value)
    {
        return $this->cleanText($value); // cukup bersihkan prefix ' jika ada
    }
}
