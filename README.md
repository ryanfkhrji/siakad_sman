## Tentang Projek

Pengelolaan data Sekolah Menengah Atas Negeri (SMAN) menggunakan LARAVEL 10 (RestAPI) dan ReactJS. Sudah include LMS dan Ujian Online.

-   [Gmail Frontend](ryanfakhroji09@gmail.com).
-   [Gmail Backend](wintonalmundarisna@gmail.com).

## Cara Penggunaan Backend

-   git clone https://github.com/wintonalmundarisna/siakad_sman.git atau download zip
-   composer install
-   generate key jika diperintahkan
-   buat db, lalu sesuaikan di .env
-   php artisan migrate
-   php artisan serve
-   lalu gunakan API yang tersedia

## Cara Penggunaan Frontend

<!-- done sampe tu -->

Perbaikan

1. Guru - JadwalPelajaran

    - kolom jurusan_id menjadi jurusan_pelajaran_id
    - penambahan kolom jurusan_pelajaran_id pada create dan update

2. DataNilaiSiswa
    - Penambahan kolom jurusan_pelajaran_id dan guru_id
    - Hilangkan kolom mata_pelajaran_id pada create dan tambahkan kolom jurusan_pelajaran_id pada create dan update

Todo

1. export dataNilaiSiswa
2. buat cadangan grouping datanilaisiswa all milik pegawai agar di group berdasarkan jurusan_pelajaran_id (kaya si all punya spa)
