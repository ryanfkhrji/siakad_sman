<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Nilai</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid black; padding: 6px; }
        th { background: #f2f2f2; }
        .no-border td { border: none; }
    </style>
</head>
<body>

    <center>
        <h3>LAPORAN HASIL BELAJAR {{ strtoupper($jenis) }}</h3>
    </center>

    <table class="no-border">
        <tr>
            <td width="15%">Nama</td>
            <td width="2%">:</td>
            <td>{{ $siswa->nama }}</td>
        </tr>
        <tr>
            <td>NIS</td>
            <td>:</td>
            <td>{{ $siswa->nis }}</td>
        </tr>
        <tr>
            <td>Kelas</td>
            <td>:</td>
            <td>{{ $siswa->siswaRombel->rombel->nama ?? '-' }}</td>
        </tr>
        <tr>
            <td>Semester</td>
            <td>:</td>
            <td>{{ $semester }}</td>
        </tr>
    </table>

    <br>

    <table>
        <thead>
            <tr>
                <th width="5%">No</th>
                <th>Mata Pelajaran</th>
                <th width="20%">Nilai</th>
            </tr>
        </thead>
        <tbody>
            @foreach($nilai as $index => $item)
                <tr>
                    <td align="center">{{ $index+1 }}</td>
                    <td>{{ $item->kurikulumMataPelajaran->mataPelajaran->nama }}</td>
                    <td align="center">{{ $item->nilai_akhir }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <br><br>

    <table class="no-border">
        <tr>
            <td width="50%"></td>
            <td align="center">
                {{ now()->format('d F Y') }}<br>
                Wali Kelas<br><br><br>
                _______________________
            </td>
        </tr>
    </table>

</body>
</html>
