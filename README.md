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

========================================================================================================================================
Perbaikan

1. identitas_sekolah: (independen)
   - ☑️ Backend
   - Frontend:
         - ikutin insomnia
         - Ketika masih kosong, tombol tambah identitas muncul, ketika sudah ada data, tombol tambah identitas hilang
2. gedung: (independen)
   - ☑️ Backend:
   - Frontend:
          - ikutin insomnia
3. ruangan:
   - ☑️ Backend:
          - ✅ send data untuk select
   - Frontend:
          - ikutin insomnia
4. Kepegawaian: (independen)
    - ☑️ Backend:
          - ✅ samakan semua
    - Frontend: 
          - samakan dengan insomnia          
5. penerimaan_siswa_baru: (independen)
   - ☑️ Backend:
   - Frontend:
          - ikutin insomnia
6. Siswa: (independen)
    - ☑️ Backend:
          - ✅ samakan semua        
          - ❌ siswa: siswa tidak ada update dirinya sendiri (insomnia)
   - Frontend:
          - Samakan dengan insomnia
7. Jurusan: (independen)
    - ☑️ Backend: 
          - ✅ samakan semua
    - Frontend
          - ikutin insomnia          
8. Kelas: (independen)
    - ☑️ Backend:
          - ✅ samakan semua
          - ❌ (insomnia) semua milik spa
    - Frontend:
          - ikutin insomnia              
9. Kurikulum: (independen) 
   aturan main, menentukan kompetensi KD/CP, 
    - ☑️ Backend:
        - ✅ samakan semua
        - ❌ (insomnia) semua milik spa        
    - Frontend:
        - ikutin insomnia
        - jika tipe = MERDEKA, maka memiliki ATP (Alur Tujuan Pembelajaran)
        - jika tipe = K13, tidak memiliki ATP
10. mata_pelajaran: (independen)
    - ☑️ Backend:
        - ✅ samakan semua
        - ❌ (insomnia) semua milik spa
    - Frontend:
        - ikutin insomnia
        - selain super admin tidak ada bagian disini
11. tahun_akademik: (independen)
    - ☑️ Backend:
        - ✅ samakan semua
        - ❌ (insomnia) semua milik spa
    - Frontend:
        - ikutin insomnia
        - semua milik spa
12. semester:
    - ☑️ Backend:
        - ✅ samakan semua
        <!-- - ✅ send data untuk select (hanya tahun_akademik_id aktif saja) -->
    - Frontend:
        - Ikutin insomnia
13. kurikulum_mata_pelajaran:
   - ☑️ Backend:
          - ✅ samakan semua
          <!-- - ✅ send data untuk select -->
   - Frontend:
          - ikutin insomnia
          - Buat tampilannya (untuk spa saja)
14. ☑️ kompetensi:
    Target kemampuan siswa, lintas tahun
    - Backend:        
        - ✅ samakan semua
        - ✅ send data untuk select
    - Frontend:
        - samakan dengan insomnia
        - jika jenis = KD, tidak memiliki ATP (Alur Tujuan Pembelajaran)
        - jika jenis = CP, maka memiliki ATP
15. ☑️ alur_tujuan_pembelajaran:
    - ✅ Backend:
        - ✅ samakan semua
        - ✅ route
        - ✅ guru: data select
        - ✅ fitur approve (spa)
        - ✅ fitur clone (guru)    
    - Frontend:
        - ikutin insomnia
        - referensi tampilan ada di pdf e-raport halaman 143
        - kasih tombol clone pada semester (fitur clone semester tahun lalu) untuk guru        
        - Untuk UI guru silakan minta ke Winton
        - jika status = disetujui (karna sudah disetujui admin/lock), maka tombol update, tambah, dan clone hilang dari guru (spa gabisa crud, cuma bisa approve aja), kalo bingung, tanya Winton
16.  ❌ modul_ajar
17.  ❌ asesmen
18. rombel:
    - ☑️ Backend:
          - ✅ samakan semuanya
          - ✅ API dan insomnia
          - ✅ data select
          - ✅ sudah benar update dan storenya
    - Frontend:
          - ikutin insomnia      
          - wali_rombel = wali_kelas
          - hitung jumlah siswa di rombel
19. wali_rombel:
    - Backend:
          - Samakan semua
    - Frontend:
          - Ikutin insomnia
20. siswa_rombel:
    - ☑️ Backend:
          - ✅ samakan semuanya (M, S, C, R)          
          - ✅ data select
    - Frontend:
          - Ikutin insomnia
21. jadwal_pelajarans:
    - ☑️ Backend:
        - ✅ Guru: Tampilkan tahun_akademik dan semester aktif saja 
        - ✅ spa: tidak bisa hapus jika sudah digunakan pada siswa_jadwal_pelajaran dan absensi_pelajaran
        - ✅ send data untuk select
    - Frontend:
        - samakan dengan insomnia
22. siswa_jadwal_pelajaran
   - ☑️ Backend:
        - ✅ spa
        - ✅ siswa: tahun dan semester aktif saja
   - Frontend:
        - samakan dengan insomnia
23. absensi_pegawai:
    - ☑️ Backend:
        - ✅ samakan dengan migrasi
    - Frontend:
        - ikutin insomnia (baca docs jika ada)
        - jika status pada tahun_akademik atau semester = 'arsip', maka button delete dan update hilang...update dan delete hanya berlaku saat TA dan semester aktif saja
24. absensi_pelajaran:
    - ☑️ Backend:
        - ✅ samakan semua
        - ✅ show menggunakan id guru
    - Frontend
        - samakan dengan insomnia
25.  absensi_siswa:
    - ☑️ Backend:
        - ✅ samakan (seeder, controller) dengan migrasi
        - ❌ tambahkan fitur guru bisa absenkan siswa di controller        
        - ❌ bisa ekstrak ke pdf         
        - ✅ show menggunakan id siswa
    - Frontend:        
        - Ikutin insomnia
        - Alur absen siswa: (milik siswa)
            a. Klik semua jadwal yang siswa punya
            b. pilih jadwal, lalu absen (poin a sudah kirim rombel_id, jadwal_pelajaran_id dan tahun_akademik_id untuk di use, jadi siswa hanya isi status dan bukti saja untuk yang manual)
        - Alur guru absenkan siswa: (milik guru)
            a. klik semua jadwal yang guru punya 
            b. Klik detail (nanti bisa dapet data siswanya)
            c. lalu absenkan siswa (jika bingung, baca AbsensiSiswaController, function guruAbsenkanSiswa)
            d. guru isi manual cuma siswa_id, status, dan bukti. sedangkan rombel_id, jadwal_pelajaran_id, dan tahun_akademik_id terisi otomatis dari poin b
26. ekstrakurikuler:
    - ☑️ Backend:
        - ✅ migrasi, seeder, controller
    - Frontend:
        - ikutin insomnia
        - filter jika ada lebih dari 1 tahun_akademik
27. pembina_ekskul:
    - ☑️ Backend:
        - (migrasi, model, seeder)
        - ✅ controller
        - ✅ route
        - ✅ data select
    - Frontend:
        - ikutin insomnia
28. pelatih_ekskul:
    - ☑️ Backend:
        - ✅ (migrasi, model, seeder)
        - ✅ controller
        - ✅ route
        - ✅ data select
    - Frontend:
        - ikutin insomnia
29. ☑️ ekskul_siswa_pivot:
    - Backend:
        - ✅ (Migrasi, Seeder, Controller)
        - ✅ data select
    - Frontend:
        - ikutin insomnia
        - alur siswa daftar sendiri: get all ekskul -> klik daftar, sehingga siswa tidak menginputkan apapun secara manual (semua otomatis terisi)
30. prestasi:
    - ☑️ Backend:
        - ✅ (Seeder, Migrasi, Controller) Hapus kolom kelas_id dan jurusan_id
        - ✅ jangan otomatis, gunakan data select manual aja (takutnya mau ngedata prestasi yang lampau)
    - Frontend:
        - ikutin insomnia
31. data_nilai_siswa:
    kumpulan hasil asesmen (uts/uas, absensi, dll)
    - Backend:
          - ❌samakan semua
    - Frontend:
          - Gua gatau ini gimana, coba cari referensi dari oss urindo
32. rapor_nilai_siswa
    hasil akhir data_nilai_siswa
    - Backend:
          - ❌
33. projek_p5:
    - ❌ Backend:
34. data_nilai_p5:
    kumpulan hasil projek_p5
    - ❌ Backend:
35. data_nilai_ekskul
    kumpulan hasil ekskul_siswa_pivot
    - Backend:
          - ❌
36. rapor (wajib export excel)
    hasil final rapor_nilai_siswa, ekskul, p5
    - Backend:
          - ❌
37. membuat data_berkas:
    - ❌ Backend:        
38. keuangan:
    - ❌ Backend:        
39. ❌⚠️ membuat jurnal_kbm
40. ❌⚠️ membuat forum diskusi
41. ❌⚠️ membuat tugas (lms)
42. ❌⚠️ membuat K1 (Kompetensi Inti) = (atasannya KD/Kompetensi)
43. ====================================================================================================================================
44. ❌⚠️ modul_ajar: ()
    rencana pembelajaran untuk mencapai kompetensi, menciptakan asesmen (uts/uas), dibuat tiap tahun
45. ❌⚠️ asesmen:
    alat ukur modul ajar (uts/uas), menilai kompetensi
46. ❌⚠️ asesmen_kompetensi:
    menetapkan bobot kompetensi pada asesmen
47. ❌⚠️ asesmen_siswa:
    nilai mentah per asesmen
48. ❌⚠️ nilai_kompetensi_siswa
    hasil kalkulasi dari asesmen_kompetensi dan asesmen_siswa
========================================================================================================================================

❌ (belum dikerjakan)
✅ (sudah dikerjakan)
⬅️ (lakukan)
⚠️(coming soon)
☑️ (done)
🎯 (target) 

==================================================
- Digunakan ulang
1. jurusan
2. kurikulum
3. mata_pelajaran
4. Kompetensi
5. Identitas sekolah
6. Gedung
7. Ruangan
8. Keuangan
9. pegawai
10. siswa
11. Ekstrakurikuler
12. kelas


- Dibuat tiap semester:
1. semester
4. Buka tutup penerimaan siswa baru
5. jadwal_pelajaran
6. siswa_jadwal_pelajaran
7. absensi pegawai
8. absensi pelajaran
9. absensi siswa
10. prestasi
11. data_nilai_siswa


- Dibuat tiap tahun (saat semester ganjil):
1. tahun_kademik
2. kurikulum_mata_pelajaran
3. Alur Tujuan Pembelajaran (ATP)
4. rombel
5. siswa_rombel
6. wali_rombel
7. pelatih_ekskul
8. pembina_ekskul
9. ekskul_siswa_pivot

==================================================





==================================================================================================================
# = tidak dibuat tiap tahun
  = dibuat tiap tahun


- Alur pertama kali program berjalan:
1. # spa        : membuat jurusan
2. spa          : membuat tahun_akademik
3. # spa        : membuat kurikulum
4. # spa        : membuat mata_pelajaran
5. spa          : membuat kurikulum_mata_pelajaran
6. # spa        : membuat kompetensi
7. spa          : membuat alur_tujuan_pembelajaran
8. # spa        : membuat data identitas sekolah
9. # spa        : membuat data gedung
10. # spa        : membuat data ruangan
11. #           : spa membuat data keuangan
12. # pegawai   : daftar
13. # siswa     : daftar
14. spa         : membuka/menutup penerimaan siswa baru
15. spa         : membuat kelas
16. spa         : membuat siswa_kelas
17. spa         : membuat jadwal pelajaran
18. spa         : membuat siswa_jadwal_pelajaran
19. guru        : absensi pegawai
20. guru        : absensi pelajaran
21. siswa       : absensi pelajaran
22. # spa       : membuat ekstrakurikuler
23. guru/siswa  : masuk ekskul_siswa_pivot
24. spa         : membuat data prestasi
25. guru        : mengisi data_nilai_siswa


- Alur per tahun/tiap naik kelas:
1. spa          : membuat tahun akademik (yang lama set status = arsip, otomatis semua data berikut kosong)
2. spa          : membuat kurikulum_mata_pelajaran (menggunakan kurikulum dan mapel lama)
3. spa          : membuka/menutup penerimaan siswa baru
4. spa          : membuat kelas (kelas lama set status = arsip)
5. spa          : membuat siswa_kelas (siswa_kelas lama set status = arsip)
6. spa          : membuat jadwal_pelajaran (jadwal lama set status = arsip) 
7. spa          : membuat siswa_jadwal_pelajaran (yang lama set status = arsip)
8. guru         : absen pegawai (yang lama set arsip)
9.  guru        : absen pelajaran (yang lama set arsip)
10. siswa       : absen pelajaran (yang lama set arsip)
11. guru/siswa  : masuk ekskul (yang lama set arsip)
12. spa         : membuat data prestasi (prestasi lama set = arsip)
13. guru        : mengiri data_nilai_siswa (yang lama set status = arsip)
==================================================================================================================





==================================================================================================================
Back do:
1. Berikan pagination pada data yang banyak (back dan front, misal per 10)
2. Kasih update pada halaman arsip


Ryan:
Front do:
1. Kelas di kelompokkan per tingkat, jangan campur (untuk spa)
2. Buat halaman arsip untuk melihat yang statusnya = arsip
==================================================================================================================





==================================================================================================================
ATURAN PROJEK (Masih dipertimbangkan)
Tahun akademik:
1. Hanya ada satu tahun akademik yang aktif
2. Jika ingin create TA baru, maka TA yang aktif wajib di arsip
3. Tidak boleh update status arsip menjadi aktif kembali
   

Jadwal pelajaran:
4. Satu guru hanya boleh satu mata pelajaran (lakukan update nama atau tukar mapel dengan guru lain jika mendesak)
==================================================================================================================





==================================================================================================================
1. Tahap Perencanaan:
- Awal Tahun: {
                               Oleh       Frekuensi                                 Waktu                     Catatan
    Kurikulum               => spa/tu ||  -+ 3-5 tahun (sampe ganti kurikulum)  ||  awal ganti kurikulum   ||  Guru tidak boleh ubah
        ↓
    Kompetensi              => spa/tu ||  reusable sampe ganti kurikulum        ||  awal kurikulum         ||  import dari pusat/tidak ketika manual
        ↓
    ATP                     => guru   ||  1x pertahun (clone daari tahun lalu)  ||  awal tahun ajaran      ||  guru tidak membuat dari nol
}
- Sebelum Mengajar: {
        ↓
    Modul Ajar              => guru   || 1x per-topik                           ||   sebelum mengajar      ||  bisa copy modul tahun lalu
        ↓
    Asesmen                 => guru   || ikut modul ajar                        ||   sebelum&saat mengajar ||  2-4 asesmen / modul
        ↓
    asesmen_kompetensi      => auto   || otomatis                               ||   saat asesmen diuuat   ||  guru cukup centang CP
}

1. Tahap Pelaksanaan
- Saat belajar: {
        ↓
    asesmen_siswa           => guru   || setiap asesmen                         ||   setelah pelaksanaan   || bisa import/bulk input
        ↓
    nilai_kompetensi_siswa  => auto   || realtime                               ||   setelah nilai masuk   || guru tidak input manual
}

1. Tahap Rekap & Rapor
- Akhir Periode: {
        ↓
    data_nilai_siswa        => auto   || realtime                               ||   setelah asesmen       || guruhanya review dan koreksi
        ↓
    Rapor                   => walas  || 1x per-semester                        ||    akhir semester       || guru tidak input ulang
}


CONTOH:
1. Tahap Perencanaan:
   - kurikulum
     id     nama_kurikulum          tipe
     1      Kurikulum Merdeka       MERDEKA

   - kompetensi (CP)
     id     kode        judul                               fase
     101    CP-MAT-F    Menerapkan konsep aljabar           F
     102    CP-MAT-P    Menyelesaikan masalah kontekstual   F

   - ATP
     id     kompetensi_id   tahun_akademik_id   tujuan_pembelajaran                     urutan
     201    101             2024/2025           Siswa memahami persamaan linear         1
     202    102             2024/2025           Siswa mampu menyelesaikan soal SPLDV    2

   - modul_ajar (silabus)
     id     atp_id      judul_modul                         alokasi_waktu       status
     301    201         Persamaan linear dua variabel       6 JP                approved

   - asesmen (alat ukur: UTS/UAS/Observasi)
     id     modul_ajar_id       nama_asesmen        jenis       bobot
     401    301                 UTS Matematika      sumatif     40
     402    301                 Proyek SPLDV        sumatif     60

   - asesmen_kompetensi
     asesmen_id     kompetensi_id
     401            101
     401            102
     402            102


2. Tahap Pelaksanaan (saat belajar)
   - asesmen_siswa (nilai/skor mentah)
     asesmen_id     siswa_id       skor
     401            1              80
     401            2              75
     401            3              90

     402            1              85
     402            2              70
     402            3              88

   - nilai_kompetensi_siswa (hasil olahan asesmen_siswa berbasis CP)
     siswa_id       kompetensi_id   nilai
     1              101             80
     1              102             83
     2              101             75
     2              102             72
     3              101             90
     3              102             89


3. Tahap rekap dan rapor
   - data_nilai_siswa (rekap nilai mapel per-siswa)
     siswa_id       kurikulum_mata_pelajaran_id     point_tugas     point_uts       point_uas       sikap
     1              10                              85              80              0               Baik
     2              10                              70              75              0               Cukup
     3              10                              88              90              0               Sangat Baik

   - rapor
     siswa_id       mapel               nilai_akhir     predikat        deskripsi
     1              "Matematika"        83              B               Mampu memahami dan menyelesaikan maasalah SPLDV dengan baik
