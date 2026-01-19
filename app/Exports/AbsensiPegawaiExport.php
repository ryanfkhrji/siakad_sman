<?php

namespace App\Exports;

use App\Models\AbsensiPegawai;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;
use Carbon\Carbon;

class AbsensiPegawaiExport implements FromCollection, WithHeadings
{
    use Exportable;

    protected $ids;

    public function __construct($ids = null) {
        $this->ids = $ids;
    }

    /**
     * bawaan
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        $query = $this->ids
            ? AbsensiPegawai::whereIn('id', $this->ids)->with([
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
                'guru',
                'jadwalPelajaran.tahunAkademik',
                'jadwalPelajaran.semester',
                'semester'
            ])->get()
            : AbsensiPegawai::with([
                'jadwalPelajaran.kurikulumMataPelajaran.mataPelajaran',
                'guru',
                'jadwalPelajaran.tahunAkademik',
                'jadwalPelajaran.semester',
                'semester'
            ])->get();

        return $query->map(function($item) {
            $mataPelajaran = $item->jadwalPelajaran->kurikulumMataPelajaran->mataPelajaran;
            return [
                $item->guru->nama ?? null,
                $mataPelajaran->nama_pelajaran ?? null,
                Carbon::parse($item->hari)->translatedFormat('l, d F Y') ?? null,
                $item->status ?? null,
                $item->jadwalPelajaran->tahunAkademik->tahun_akademik ?? null,
                $item->jadwalPelajaran->semester->semester ?? null,
            ];
        });
    }

    public function headings(): array
    {
        return ['Nama Guru', 'Mata Pelajaran', 'Hari', 'Status', 'Tahun Akademik', 'Semester'];
    }
}
