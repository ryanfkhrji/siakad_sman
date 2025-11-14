<?php

namespace App\Exports;

use App\Models\Psb;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Illuminate\Support\Str;

class PsbExport implements FromCollection, WithHeadings
{
    protected $ids;

    public function __construct(array $ids = null)
    {
        $this->ids = $ids;
    }

    private function cekIsi($path)
    {
        if (!$path) {
            return '';
        }

        if (Str::startsWith($path, 'public/foto_siswa')) {
            return $path;
        }

        if (
            Str::startsWith($path, 'private/berkas_') ||
            Str::startsWith($path, 'private/suket_pindah')
        ) {
            return $path;
        }

        return "' " . $path;
    }

    public function collection()
    {
        $query = $this->ids ? Psb::whereIn('id', $this->ids) : Psb::query();

        return $query->get()->map(function ($item) {
            return [
                $this->cekIsi($item->foto_siswa),
                $item->nama_siswa,
                $this->cekIsi($item->nisn),
                $item->jk,
                $item->tempat_lahir,
                $item->tanggal_lahir,
                $item->agama,
                $item->alamat,
                $this->cekIsi($item->no_hp_siswa),
                $item->nama_ayah,
                $item->pekerjaan_ayah,
                $this->cekIsi($item->no_hp_ayah),
                $item->nama_ibu,
                $item->pekerjaan_ibu,
                $this->cekIsi($item->no_hp_ibu),
                $item->nama_wali,
                $item->pekerjaan_wali,
                $this->cekIsi($item->no_hp_wali),
                $item->sekolah_asal,
                $item->alamat_sekolah_asal,
                $item->kelas_terakhir,
                $this->cekIsi($item->nilai_raport_terakhir),
                $item->alasan_pindah,
                $this->cekIsi($item->berkas_raport),
                $this->cekIsi($item->suket_pindah),
                $this->cekIsi($item->berkas_kartu_keluarga),
                $this->cekIsi($item->berkas_akta_lahir),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'Foto Siswa',
            'Nama Siswa',
            'NISN',
            'Jenis Kelamin',
            'Tempat Lahir',
            'Tanggal Lahir',
            'Agama',
            'Alamat',
            'No HP Siswa',
            'Nama Ayah',
            'Pekerjaan Ayah',
            'No HP Ayah',
            'Nama Ibu',
            'Pekerjaan Ibu',
            'No HP Ibu',
            'Nama Wali',
            'Pekerjaan Wali',
            'No HP Wali',
            'Sekolah Asal',
            'Alamat Sekolah Asal',
            'Kelas Terakhir',
            'Nilai Raport Terakhir',
            'Alasan Pindah',
            'Berkas Raport',
            'Surat Keterangan Pindah',
            'Berkas KK',
            'Berkas Akta Lahir',
        ];
    }
}
