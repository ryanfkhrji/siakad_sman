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
            ? AbsensiPelajaran::whereIn('id', $this->ids)->with('jadwalPelajaran.mataPelajaran', 'guru')->get()
            : AbsensiPelajaran::with('jadwalPelajaran.mataPelajaran', 'guru')->get();

        return $query->map(function($item) {
            return [
                $item->guru->nama ?? null,
                $item->jadwalPelajaran->mataPelajaran->nama_pelajaran ?? null,
                $item->guru->kelas->nama_kelas ?? null,
                Carbon::parse($item->hari)->translatedFormat('l, d F Y') ?? null,                
                $item->status ?? null,
                $item->tahunAkademik->tahun_akademik ?? null,
                $item->tahunAkademik->semester ?? null,
            ];
        });
    }

    public function headings(): array
    {
        return ['Nama Guru', 'Mata Pelajaran', 'Kelas', 'Hari', 'Status', 'Tahun Akademik', 'Semester'];
    }
}
