<?php

namespace App\Exports;

use App\Models\AbsensiPegawai;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\Exportable;
use Carbon\Carbon;

class AbsensiPegawaiExport implements FromQuery, WithMapping, WithHeadings
{
    use Exportable;

    protected $ids;

    public function __construct($ids = null)
    {
        $this->ids = $ids;
    }

    public function query()
    {
        $query = AbsensiPegawai::with([
            'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            'guru',
            'tahunAkademik',
            'semester'
        ]);

        if ($this->ids) {
            $query->whereIn('id', $this->ids);
        }

        return $query;
    }

    public function map($item): array
    {
        return [
            $item->guru->nama ?? '-',
            $item->jadwalPelajaran
                ?->kurikulumMataPelajaran
                ?->mataPelajaran
                ?->nama_pelajaran ?? '-',
            $item->hari
                ? Carbon::parse($item->hari)->translatedFormat('l, d F Y')
                : '-',
            $item->status ?? '-',
            $item->tahunAkademik->tahun_akademik ?? '-',
            $item->semester->semester ?? '-',
        ];
    }

    public function headings(): array
    {
        return [
            'Nama Pegawai',
            'Mata Pelajaran',
            'Hari',
            'Status',
            'Tahun Akademik',
            'Semester'
        ];
    }
}
