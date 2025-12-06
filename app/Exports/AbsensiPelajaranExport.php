<?php

namespace App\Exports;

use App\Models\AbsensiPelajaran;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Carbon\Carbon;

class AbsensiPelajaranExport implements FromCollection, WithHeadings
{
    use Exportable;

    protected $ids;

    public function __construct($ids = null) {
        $this->ids = $ids;
    }

    public function collection()
    {
        $query = $this->ids
            ? AbsensiPelajaran::whereIn('id', $this->ids)->with('jadwalPelajaran.mataPelajaran', 'guru', 'kelas')->get()
            : AbsensiPelajaran::with('jadwalPelajaran.mataPelajaran', 'guru', 'kelas')->get();

        return $query->map(function($item) {
            return [
                $item->guru->nama,
                $item->jadwalPelajaran->mataPelajaran->nama_pelajaran,
                $item->kelas->nama_kelas,
                Carbon::parse($item->hari)->translatedFormat('l, d F Y'),
                $item->jam,
                $item->status,
            ];
        });
    }

    public function headings(): array
    {
        return ['Nama Guru', 'Mata Pelajaran', 'Kelas', 'Hari', 'Jam', 'Status'];
    }
}
