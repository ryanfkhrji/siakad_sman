<?php

namespace App\Exports;

use App\Models\Keuangan;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\Exportable;

class KeuanganExport implements FromCollection, WithHeadings
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
            ? Keuangan::whereIn('id', $this->ids)->get()
            : Keuangan::get();

        return $query->map(function($item) {
            return [
                $item->nama_akun,
                "' " . $item->debit,
                "' " . $item->kredit,
                $item->keterangan,
            ];
        });
    }

    public function headings(): array
    {
        return ['Nama Akun', 'Debit', 'Kredit', 'Keterangan'];
    }
}
