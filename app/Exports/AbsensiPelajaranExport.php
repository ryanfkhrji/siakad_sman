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
            ? AbsensiPelajaran::whereIn('id', $this->ids)->with([
                'guru',
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
                'jadwalPelajaran.rombel',
                'tahunAkademik',
                'semester'
            ])->get()
            : AbsensiPelajaran::with([
                'guru',
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
                'rombel',
                'tahunAkademik',
                'semester'
            ])->get();

        return $query->map(function($item) {
            return [
                $item->guru->nama ?? null,
                $item->jadwalPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                $item->jadwalPelajaran->rombel->nama_rombel ?? null,
                Carbon::parse($item->hari)->translatedFormat('l, d F Y') ?? null,                
                $item->status ?? null,
                $item->tahunAkademik->tahun_akademik ?? null,
                $item->semester->semester ?? null,
            ];
        });
    }

    public function headings(): array
    {
        return ['Nama Guru', 'Mata Pelajaran', 'Kelas', 'Hari', 'Status', 'Tahun Akademik', 'Semester'];
    }
}
