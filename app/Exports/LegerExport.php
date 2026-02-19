<?php

namespace App\Exports;

use App\Models\Rombel;
use App\Models\SiswaRombel;
use App\Models\DataNilaiSiswa;
use App\Models\AbsensiSiswa;
use App\Models\Kelas;
use App\Models\TahunAkademik;
use App\Models\Semester;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;

use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;

use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Color;

class LegerExport implements WithMultipleSheets
{
    protected $tahunAkademik;
    protected $semester;
    protected $kelas;
    protected $allNilai;
    protected $allAbsensi;
    protected $parRanking;
    protected $mapelList;
    public function __construct($tahunAkademikId, $semesterId, $kelasId)
    {
        $this->tahunAkademik = TahunAkademik::findOrFail($tahunAkademikId);
        $this->semester = Semester::findOrFail($semesterId);
        $this->kelas = Kelas::findOrFail($kelasId);
        $this->prepareData();
    }
    private function prepareData()
    {
        $rombels = Rombel::where('kelas_id', $this->kelas->id)->pluck('id');
        $siswa = SiswaRombel::whereIn('rombel_id', $rombels)
            ->where('tahun_akademik_id', $this->tahunAkademik->id)
            ->get();
        $siswaIds = $siswa->pluck('siswa_id');
        $this->allNilai = DataNilaiSiswa::with('kurikulumMataPelajaran.mataPelajaran')
            ->whereIn('siswa_id', $siswaIds)
            ->where('tahun_akademik_id', $this->tahunAkademik->id)
            ->where('semester_id', $this->semester->id)
            ->get()
            ->groupBy('siswa_id');
        // ===============================
        // HITUNG PAR (ANTAR ROMBEL PER TINGKAT)
        // ===============================
        $tingkat = $this->kelas->tingkat;
        // Jika tingkat kosong, fallback agar tidak error
        if (!$tingkat) {
            $tingkat = 0;
        }
        $kelasTingkatIds = Kelas::where('tingkat', $tingkat)->pluck('id');
        // Jika tidak ada kelas lain, ambil hanya kelas saat ini
        if ($kelasTingkatIds->isEmpty()) {
            $kelasTingkatIds = collect([$this->kelas->id]);
        }
        $rombelsTingkat = Rombel::whereIn('kelas_id', $kelasTingkatIds)->pluck('id');
        $siswaTingkat = SiswaRombel::whereIn('rombel_id', $rombelsTingkat)
            ->where('tahun_akademik_id', $this->tahunAkademik->id)
            ->get();
        $siswaTingkatIds = $siswaTingkat->pluck('siswa_id')->map(fn($id) => (int) $id)->unique();
        $nilaiTingkat = DataNilaiSiswa::whereIn('siswa_id', $siswaTingkatIds)
            ->where('tahun_akademik_id', $this->tahunAkademik->id)
            ->where('semester_id', $this->semester->id)
            ->get()
            ->groupBy('siswa_id');
        $totalpAR = collect();
        foreach ($siswaTingkatIds as $siswaId) {
            $nilai = $nilaiTingkat[$siswaId] ?? collect();
            $totalNilai = $nilai->sum(function ($item) {
                return $item->nilai_akhir ?? 0;
            });
            $totalpAR->push([
                'siswa_id' => $siswaId,
                'total'    => $totalNilai
            ]);
        }

        $sortedPAR = $totalpAR->sortByDesc('total')->values();

        $lastTotal = null;
        $lastRank  = 0;
        $position  = 0;

        $sortedPAR = $sortedPAR->map(function ($row) use (&$lastTotal, &$lastRank, &$position) {

            $position++;

            if ($lastTotal === $row['total']) {
                $rank = $lastRank;
            } else {
                $rank = $position;
                $lastRank = $position;
                $lastTotal = $row['total'];
            }

            $row['rank'] = $rank;

            return $row;
        });

        // Simpan sebagai Collection Biasa (Tanpa KeyBy)        
        $this->parRanking = $sortedPAR->mapWithKeys(function ($item) {
            return [(int)$item['siswa_id'] => $item['rank']];
        });

        
        
        // ===============================
        // ABSENSI
        // ===============================
        // $this->allAbsensi = AbsensiSiswa::whereIn('siswa_id', $siswaIds)
        //     ->where('tahun_akademik_id', $this->tahunAkademik->id)
        //     ->where('semester_id', $this->semester->id)
        //     ->get()
        //     ->groupBy(['siswa_id', 'status']);

        $this->allAbsensi = AbsensiSiswa::selectRaw("
        siswa_id,
        SUM(CASE WHEN status = 'hadir' THEN 1 ELSE 0 END) as hadir,
        SUM(CASE WHEN status = 'sakit' THEN 1 ELSE 0 END) as sakit,
        SUM(CASE WHEN status = 'izin' THEN 1 ELSE 0 END) as izin,
        SUM(CASE WHEN status = 'alpa' THEN 1 ELSE 0 END) as alpa
        ")
        ->whereIn('siswa_id', $siswaIds)
        ->where('tahun_akademik_id', $this->tahunAkademik->id)
        ->where('semester_id', $this->semester->id)
        ->groupBy('siswa_id')
        ->get()
        ->keyBy('siswa_id');



        // ===============================
        // MAPEL LIST
        // ===============================
        $mapels = collect();
        foreach ($this->allNilai as $nilai) {
            foreach ($nilai as $n) {
                $mapels->push($n->kurikulumMataPelajaran->mataPelajaran->nama_pelajaran);
            }
        }
        $this->mapelList = $mapels->unique()->values();
    }
    public function sheets(): array
    {
        $sheets = [];
        $rombels = Rombel::where('kelas_id', $this->kelas->id)
            ->with('jurusan')
            ->get();
        foreach ($rombels as $rombel) {
            $sheets[] = new class(
                $rombel,
                $this->tahunAkademik,
                $this->semester,
                $this->kelas,
                $this->allNilai,
                $this->allAbsensi,
                $this->parRanking,
                $this->mapelList
            ) implements FromCollection, WithTitle, WithEvents {
                protected $rombel;
                protected $tahunAkademik;
                protected $semester;
                protected $kelas;
                protected $allNilai;
                protected $allAbsensi;
                protected $parRanking;
                protected $mapelList;
                public function __construct(
                    $rombel,
                    $tahunAkademik,
                    $semester,
                    $kelas,
                    $allNilai,
                    $allAbsensi,
                    $parRanking,
                    $mapelList
                ) {
                    $this->rombel = $rombel;
                    $this->tahunAkademik = $tahunAkademik;
                    $this->semester = $semester;
                    $this->kelas = $kelas;
                    $this->allNilai = $allNilai;
                    $this->allAbsensi = $allAbsensi;
                    $this->parRanking = $parRanking;
                    $this->mapelList = $mapelList;
                }
                public function title(): string
                {
                    return $this->rombel->nama_rombel;
                }
                public function collection()
                {
                    $header = ['No', 'NAMA SISWA', 'NISN', 'NIS'];
                    foreach ($this->mapelList as $mapel) {
                        $header[] = $mapel;
                    }
                    $header = array_merge($header, [
                        'Total',
                        'Rata-rata',
                        'Kelas',
                        'PAR',
                        'Hadir',
                        'Sakit',
                        'Izin',
                        'Alpa'
                    ]);
                    $siswaRombel = SiswaRombel::with('siswa')
                        ->where('rombel_id', $this->rombel->id)
                        ->where('tahun_akademik_id', $this->tahunAkademik->id)
                        ->get();
                    $rows = [];
                    foreach ($siswaRombel as $sr) {
                        $siswaId = (int) $sr->siswa_id;
                        $nilaiSiswa = $this->allNilai[$siswaId] ?? collect();
                        $nilaiMapel = [];
                        $total = 0;
                        foreach ($this->mapelList as $mapel) {                        
                            $dataNilai = $nilaiSiswa->firstWhere(
                                'kurikulumMataPelajaran.mataPelajaran.nama_pelajaran',
                                $mapel
                            );
                            $nilai = $dataNilai && $dataNilai->nilai_akhir !== null
                                ? $dataNilai->nilai_akhir
                                : 0;
                            $nilaiMapel[] = $nilai;
                            $total += $nilai;
                        }
                        $rerata = count($this->mapelList)
                            ? round($total / count($this->mapelList), 2)
                            : 0;                        

                        $abs = $this->allAbsensi[$siswaId] ?? null;

                        $hadir = $abs->hadir ?? 0;
                        $sakit = $abs->sakit ?? 0;
                        $izin  = $abs->izin ?? 0;
                        $alpa  = $abs->alpa ?? 0;
                            

                        // --- CARI PAR DENGAN AMAN ---
                        $parRank = $this->parRanking[$siswaId] ?? '-';
                        $rows[] = [
                            'nama' => $sr->siswa->nama,
                            'nisn' => $sr->siswa->nisn,
                            'nis'  => $sr->siswa->nis,
                            'nilai_mapel' => $nilaiMapel,
                            'total' => $total,
                            'rerata' => $rerata,
                            'par_rank' => $parRank,
                            'hadir' => $hadir,
                            'sakit' => $sakit,
                            'izin' => $izin,
                            'alpa' => $alpa,
                        ];
                    }
                    // Ranking kelas per rombel
                    // $sortedRows = collect($rows)->sortByDesc('total')->values();
                    // Urut berdasarkan abjad nama
                    $sortedRows = collect($rows)->sortBy('nama')->values();
                    $finalRows = [];
                    $lastTotal = null;
                    $lastRank  = 0;
                    $position  = 0;
                    foreach ($sortedRows as $index => $row) {
                        $position++;
                        if ($lastTotal === $row['total']) {
                            $rankingKelas = $lastRank;
                        } else {
                            $rankingKelas = $position;
                            $lastRank = $position;
                            $lastTotal = $row['total'];
                        }                        
                        $rowData = [
                            $index + 1,
                            $row['nama'],
                            $row['nisn'],
                            $row['nis'],
                        ];
                        foreach ($row['nilai_mapel'] as $n) {
                            $rowData[] = $n;
                        }
                        $rowData[] = $row['total'];
                        $rowData[] = $row['rerata'];
                        $rowData[] = $rankingKelas;
                        $rowData[] = $row['par_rank'];
                        $rowData[] = $row['hadir'];
                        $rowData[] = $row['sakit'];
                        $rowData[] = $row['izin'];
                        $rowData[] = $row['alpa'];
                        $finalRows[] = $rowData;
                    }
                    array_unshift($finalRows, $header);
                    return collect($finalRows);
                }
                public function registerEvents(): array
                {
                    return [
                        AfterSheet::class => function (AfterSheet $event) {
                            $sheet = $event->sheet->getDelegate();
                            $sheet->insertNewRowBefore(1, 6);

                            // Merge
                            // ===============================
                            // GROUP HEADER (2 BARIS)
                            // ===============================

                            $mapelCount = count($this->mapelList);

                            // Posisi kolom dinamis
                            $startMapelCol = 'E';
                            $startMapelIndex = 5; // Kolom E
                            $endMapelIndex = $startMapelIndex + $mapelCount - 1;
                            $endMapelCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($endMapelIndex);

                            // Kolom setelah mapel
                            $totalColIndex = $endMapelIndex + 1;
                            $rerataColIndex = $endMapelIndex + 2;
                            $rankKelasColIndex = $endMapelIndex + 3;
                            $parColIndex = $endMapelIndex + 4;
                            $hadirColIndex = $endMapelIndex + 5;
                            $sakitColIndex = $endMapelIndex + 6;
                            $izinColIndex = $endMapelIndex + 7;
                            $alpaColIndex = $endMapelIndex + 8;

                            $totalCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($totalColIndex);
                            $rerataCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($rerataColIndex);
                            $rankKelasCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($rankKelasColIndex);
                            $parCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($parColIndex);
                            $hadirCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($hadirColIndex);
                            $sakitCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($sakitColIndex);
                            $izinCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($izinColIndex);
                            $alpaCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($alpaColIndex);

                            // Geser header detail ke baris 8
                            $sheet->insertNewRowBefore(7, 1);

                            // GROUP HEADER (Row 7)
                            $sheet->setCellValue('E7', 'MATA PELAJARAN');
                            $sheet->mergeCells("E7:{$endMapelCol}7");

                            $sheet->setCellValue("{$totalCol}7", 'JUMLAH');
                            $sheet->mergeCells("{$totalCol}7:{$rerataCol}7");

                            $sheet->setCellValue("{$rankKelasCol}7", 'PERINGKAT');
                            $sheet->mergeCells("{$rankKelasCol}7:{$parCol}7");

                            $sheet->setCellValue("{$hadirCol}7", 'ABSENSI');
                            $sheet->mergeCells("{$hadirCol}7:{$alpaCol}7");

                            // Styling group header
                            $groupHeaderRange = "A7:{$alpaCol}7";
                            $sheet->getStyle($groupHeaderRange)->getFont()->setBold(true);
                            $sheet->getStyle($groupHeaderRange)->getAlignment()
                                ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                                ->setVertical(Alignment::VERTICAL_CENTER);
                            $sheet->getStyle($groupHeaderRange)->getFill()
                                ->setFillType(Fill::FILL_SOLID)
                                ->getStartColor()->setRGB('C6E0B4');                                                
                            // Merge
                            

                            $highestColumn = $sheet->getHighestColumn();
                            $highestRow = $sheet->getHighestRow();

                            // Auto width semua kolom
                            $highestColumnIndex = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($highestColumn);

                            for ($col = 1; $col <= $highestColumnIndex; $col++) {
                                $columnLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
                                $sheet->getColumnDimension($columnLetter)->setAutoSize(true);
                            }

                            // Center isi kolom
                            $dataStartRow = 9; // karena sekarang header 2 baris
                            $dataRange = "A{$dataStartRow}:{$highestColumn}{$highestRow}";

                            // Center semua
                            $sheet->getStyle($dataRange)
                            ->getAlignment()
                            ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER)
                            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);

                            // $sheet->getStyle($dataRange)
                            //     ->getAlignment()
                            //     ->setHorizontal(Alignment::HORIZONTAL_CENTER);

                            // Kembalikan kolom Nama agar rata kiri
                            $sheet->getStyle("B{$dataStartRow}:B{$highestRow}")
                                ->getAlignment()
                                ->setHorizontal(Alignment::HORIZONTAL_LEFT);

                            // wrap text untuk isi terlalu panjang
                            $sheet->getStyle("A7:{$highestColumn}{$highestRow}")
                                ->getAlignment()
                                ->setWrapText(true);                            

                            // Background Hijau
                            $sheet->getStyle("A7:{$highestColumn}8")
                            ->getFill()
                            ->setFillType(Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('A9D08E');

                            // Border tebal luar tabel
                            $outerRange = "A7:{$highestColumn}{$highestRow}";
                            $sheet->getStyle($outerRange)->getBorders()->getOutline()->setBorderStyle(Border::BORDER_THICK);


                            // ===============================
                            // BORDER BAWAH HEADER HITAM TEBAL
                            // ===============================
                            $headerBottomRange = "A8:{$highestColumn}8";

                            $sheet->getStyle($headerBottomRange)
                                ->getBorders()
                                ->getBottom()
                                ->setBorderStyle(Border::BORDER_THICK)
                                ->setColor(new Color('FF000000')); // Hitam


                            // Ambil Jurusan
                            $jurusan = '';
                            if (!empty($this->rombel->jurusan)) {
                                $jurusan = ' / JURUSAN ' . $this->rombel->jurusan->nama_jurusan;
                            }
                            // --- KOP (Header Info) ---
                            $sheet->setCellValue('A1', 'LEGER NILAI RAPOR SISWA');
                            $sheet->setCellValue('A2', 'TAHUN PELAJARAN ' . $this->tahunAkademik->tahun_akademik . ' SEMESTER ' . $this->semester->semester);
                            $sheet->setCellValue('A3', 'SEKOLAH : SMAN 42 JAKARTA'); 
                            $sheet->setCellValue('A4', 'KELAS : ' . $this->kelas->nama_kelas . ' (' . $this->kelas->tingkat . ')');
                            $sheet->setCellValue('A5', 'ROMBEL : ' . $this->rombel->nama_rombel . $jurusan);
                            // Merge cells untuk kop
                            $sheet->mergeCells("A1:{$highestColumn}1");
                            $sheet->mergeCells("A2:{$highestColumn}2");
                            $sheet->mergeCells("A3:{$highestColumn}3");
                            $sheet->mergeCells("A4:{$highestColumn}4");
                            $sheet->mergeCells("A5:{$highestColumn}5");
                            $sheet->mergeCells("A6:{$highestColumn}6");
                            // Styling Kop
                            $sheet->getStyle('A1:A2')->getFont()->setBold(true)->setSize(14);
                            $sheet->getStyle('A3:A5')->getFont()->setBold(true);
                            // --- Tabel Header ---
                            $headerRange = "A7:{$highestColumn}7";
                            $sheet->getStyle($headerRange)->getFont()->setBold(true);
                            $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
                            // $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setRGB('E0E0E0');
                            $sheet->getStyle("A7:{$highestColumn}8")
                            ->getFill()
                            ->setFillType(\PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID)
                            ->getStartColor()
                            ->setRGB('A9D08E'); // hijau
                            $sheet->getStyle("A7:{$highestColumn}8")
                            ->getAlignment()
                            ->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER)
                            ->setVertical(\PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER);
                            $sheet->getStyle("A7:{$highestColumn}8")
                            ->getFont()
                            ->setBold(true);


                            // --- Borders ---
                            $tableRange = "A7:{$highestColumn}{$highestRow}";
                            $sheet->getStyle($tableRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->setColor(new Color('FF000000'));
                            $sheet->getStyle($tableRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
                            // --- FrozenPane ---
                            // $sheet->freezePane('A8');
                            $sheet->freezePane('A9');
                            // Set column widths
                            $sheet->getColumnDimension('A')->setWidth(5); 
                            $sheet->getColumnDimension('B')->setWidth(25); 
                            $sheet->getColumnDimension('C')->setWidth(15); 
                            $sheet->getColumnDimension('D')->setWidth(15);
                        }
                    ];
                }
            };
        }
        return $sheets;
    }
}


/**
 * ! tambahin rerata, maksimal, minimal di bawah 
 */