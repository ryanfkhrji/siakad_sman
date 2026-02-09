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
            ? AbsensiSiswa::whereIn('id', $this->ids)->with([
                'siswa',
                'rombel',
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
                'tahunAkademik',
                'semester',
            ])->get()
            : AbsensiSiswa::with([
                'siswa',
                'tahunAkademik',
                'semester',
                'rombel',
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
            ])->get();

        return $query->map(function($item) {
            return [
                $item->siswa->nama ?? null,
                $item->rombel->nama_rombel ?? null,
                $item->jadwalPelajaran->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran ?? null,
                Carbon::parse($item->hari)->translatedFormat('l, d F Y'),
                $item->status ?? null,
                $item->bukti ?? null,
                $item->tahunAkademik->tahun_akademik ?? null,
                $item->semester->semester ?? null,
            ];
        });
    }

    public function headings(): array
    {
        return ['Nama Siswa', 'Kelas', 'Mata Pelajaran', 'Hari', 'Status', 'Bukti', 'Tahun Akademik', 'Semester'];
    }
}
