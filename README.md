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

1. Kepegawaian
    - Backend:
          - ✅ nambah nuptk (nullable)
          - ✅ nip menjadi nullable
    - Frontend: 
          - tambahin kolom nuptk pada register (tapi nullable)
          - NIP pada regsiter ubah jadi nullable
2. Mata Pelajaran:
    - Backend:
          - ✅ Nambah kolom kode_mapel_diknas
          - ✅ hapus kolom status
          - ✅ hapus kolom nilai_kkm
    - Frontend:
          - Nambah inputan kode_mapel_diknas
          - hilangkan inputan status
          - hilangkan inputan nilai_kkm
3. Kurikulum:
    - Backend:
          - (Seeder, Migrasi, Controller) Nambah kode_kurikulum
          - (Seeder, Migrasi, Controller) nama_kurikulum tidak unique lagi
          - (Seeder, Migrasi, controller) tahun_berlaku diubah jadi tahun_mulai
          - (Seeder, Migrasi, controller) menambah kolom tahun_selesai
    - Frontend:
          - Nambah inputan kode_kurikulum
          - ubah inputan tahun_berlaku menjadi tahun_mulai
          - nambah inputan tahun_selesai
4. Jurusan:
    - Nambah kode_jurusan
    - nama_jurusan tidak unique lagi
5. Kelas
    - nama_kelas tidak unique lagi
    - nambah kolom tingkat
    - nambah kolom kurikulum_id
    - kolom jam_masuk dihapus
6. Membuat pivot kurikulum_mata_pelajaran
7. data_nilai_siswa:
    - ganti mata_pelajaran_id dan jurusan_pelajaran_id dengan kurikulum_mata_pelajaran_id
    - buat cadangan grouping datanilaisiswa all milik pegawai agar di group berdasarkan jurusan_pelajaran_id (kaya si all punya spa)
    - hitung total absensi siswa per mata pelajaran untuk menentukan point absensinya
    - jabarin ekskul yang diikuti dan sikap pada ekskul
    - Buat export data nilai siswa
8. ekstrakurikuler:
    - status pilihan hanya aktif dan tidak aktif
9. ekskul_siswa_pivot:
    - nambah kolom tahun_akademik_id
10. tahun_akademik:
    - kolom status, nonaktif jadi tidak aktif
11. jadwal_pelajarans:
    - jam_pelajaran diganti jadi jam_mulai dan jam_selesai
12. kelas:
    - penambahan kolom jam_mulai dan jam_selesai
13. kompetensi_dasar:
    - nambah kolom tingkat
14. prestasi:
    - nambah kolom tahun_akademik_id
15. jadwal_pelajarans:
    - ubah kolom mata_pelajaran_id menjadi kurikulum_mata_pelajaran_id
16. absensi_siswa:
    - ubah kolom mata_pelajaran_id menjadi jadwal_pelajaran_id
    - nambah kolom tahun_akademik_id
    - absensisiswacontroller sebaiknya di group berdasarkan mata pelajaran, karna satu siswa > 1 mapel untuk absen

Fin
