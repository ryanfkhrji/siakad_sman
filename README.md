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

<!-- Untuk SPA dan Pegawai -->

-   Kelas (kolom jurusan_id)
-   guru - pelajaran atau jadwal-pelajaran (kolom jurusan_id)
-   dataNilaiSiswa (CRUD)
-   Penambahan mata_pelajaran_id dan sikap pada create dataNilaiSiswa




1 guru = 1 matpel
1 matpel = 2 jurusan => B.Indo ada di jurusan IPA dan IPS
1 matpel = banyak kelas => B.Indo di kelas X, XI, XII
