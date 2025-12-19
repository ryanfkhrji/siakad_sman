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
          - ✅ (Seeder, Migrasi, Controller) nambah nuptk (nullable)
          - ✅ (Seeder, Migrasi, Controller) nip menjadi nullable
    - Frontend: 
          - tambahin kolom nuptk pada register (tapi nullable)
          - NIP pada regsiter ubah jadi nullable
2. Mata Pelajaran:
    - Backend:
          - ✅ (Seeder, Migrasi, Controller) Nambah kolom kode_mapel_diknas
          - ✅ (Seeder, Migrasi, Controller) hapus kolom status
          - ✅ (Seeder, Migrasi, Controller) hapus kolom nilai_kkm
    - Frontend:
          - Nambah inputan kode_mapel_diknas
          - hilangkan inputan status
          - hilangkan inputan nilai_kkm
3. Kurikulum:
    - Backend:
          - ✅ (Seeder, Migrasi, Controller) nama_kurikulum tidak unique lagi
          - ✅ (Seeder, Migrasi, Controller) Nambah kode_kurikulum (unik)
          - ✅ (Seeder, Migrasi, controller) tahun_berlaku diubah jadi tahun_mulai
          - ✅ (Seeder, Migrasi, controller) menambah kolom tahun_selesai
    - Frontend:
          - Nambah inputan kode_kurikulum
          - ubah inputan tahun_berlaku menjadi tahun_mulai
          - nambah inputan tahun_selesai
4. Jurusan:
    - Backend: 
          - ✅ (Seeder, Migrasi, Controller) nama_jurusan tidak unique lagi
          - ✅ (Seeder, Migrasi, Controller) Nambah kode_jurusan
    - Frontend
          - Nambah inputan kode_jurusan          
5. Kelas
    - Backend:
          - (Seeder, Migrasi, Controller) nama_kelas tidak unique lagi
          - (Seeder, Migrasi, Controller) nambah kolom tingkat
          - (Seeder, Migrasi, Controller) nambah kolom kurikulum_id
          - (Seeder, Migrasi, Controller) kolom jam_masuk dihapus
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
