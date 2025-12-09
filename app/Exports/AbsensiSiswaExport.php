<?php

namespace App\Exports;

use App\Models\AbsensiSiswa;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Carbon\Carbon;

class AbsensiSiswaExport implements FromCollection, WithHeadings
{
    use Exportable;

    protected $ids;

    public function __construct($ids = null) {
        $this->ids = $ids;
    }

    public function collection()
    {
        $query = $this->ids
            ? AbsensiSiswa::whereIn('id', $this->ids)->with('mataPelajaran', 'siswa.kelas')->get()
            : AbsensiSiswa::with('mataPelajaran', 'siswa.kelas')->get();

        return $query->map(function($item) {
            return [
                $item->siswa->nama ?? null,
                $item->siswa->kelas->nama_kelas ?? null,
                $item->mataPelajaran->nama_pelajaran ?? null,
                Carbon::parse($item->hari)->translatedFormat('l, d F Y'),
                $item->status ?? null,
                $item->bukti ?? null,
            ];
        });
    }

    public function headings(): array
    {
        return ['Nama Siswa', 'Kelas', 'Mata Pelajaran', 'Hari', 'Status', 'Bukti'];
    }
}
