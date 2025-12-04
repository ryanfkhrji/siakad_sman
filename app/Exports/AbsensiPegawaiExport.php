<?php

namespace App\Exports;

use App\Models\AbsensiPegawai;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;

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
            ? AbsensiPegawai::whereIn('id', $this->ids)->with('mataPelajaran', 'guru')->get()
            : AbsensiPegawai::with('mataPelajaran', 'guru')->get();

        return $query->map(function($item) {
            return [
                $item->guru->nama,
                $item->mataPelajaran->nama_pelajaran,
                $item->tanggal,
                $item->status,
            ];
        });
    }

    public function headings(): array
    {
        return ['Nama Guru', 'Mata Pelajaran', 'Tanggal', 'Status'];
    }
}
