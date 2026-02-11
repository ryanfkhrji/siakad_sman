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

1. ♻️X identitas_sekolah: (independen)
   - ☑️ Backend:
         - 
   - Frontend:
         - ikutin insomnia
         - Ketika masih kosong, tombol tambah identitas muncul, ketika sudah ada data, tombol tambah identitas hilang
--------------------------------------
2. ♻️X gedung: (independen)
   - ☑️ Backend:
         - ✅ Nambah kolom status pada (get all, detail, update) (create engga)
   - Frontend:
          - ikutin insomnia
          - Nambah kolom status pada (get all, detail, update) (create engga)
          - penambahan kolom lokasi pada get detail, dan semua response sukses
--------------------------------------
3. ♻️X ruangan:
   - ☑️ Backend:
          - ✅ nambah kolom status pada (get all, detail, update, data select) (create engga)
   - Frontend:
          - ikutin insomnia
          - Nambah kolom status pada (get all, detail, update) (create engga)
--------------------------------------
4. ♻️X Kepegawaian: (independen)
    - ☑️ Backend:
          - ✅ samakan semua
    - Frontend: 
          - samakan dengan insomnia       
--------------------------------------
5. penerimaan_siswa_baru: (independen)
   - ☑️ Backend:
   - Frontend:
          - ikutin insomnia
--------------------------------------
6. ♻️X Siswa: (independen)
    - ☑️ Backend:
          - ✅ samakan semua        
          - ❌ siswa: siswa tidak ada update dirinya sendiri (insomnia)
   - Frontend:
          - Samakan dengan insomnia
          - Nambah kolom status pada selain create
--------------------------------------            
7. ♻️X Jurusan: (independen)
    - ☑️ Backend: 
          - ✅ samakan semua
    - Frontend
          - ikutin insomnia          
--------------------------------------        
8. ♻️X Kelas: (independen) (sampe sini)
    - ☑️ Backend:
          - ✅ samakan semua
          - ✅ hapus kolom jurusan_id
          - ❌ (insomnia) semua milik spa
    - Frontend:
          - ikutin insomnia
          - Nambah kolom status pada selain create
--------------------------------------           
9. ♻️X Kurikulum: (independen) 
   aturan main, menentukan kompetensi KD/CP, 
    - ☑️ Backend:
        - ✅ samakan semua
        - ❌ (insomnia) semua milik spa        
    - Frontend:
        - ikutin insomnia
        - jika tipe = MERDEKA, maka memiliki ATP (Alur Tujuan Pembelajaran)
        - jika tipe = K13, tidak memiliki ATP
--------------------------------------          
10. ♻️X mata_pelajaran: (independen)
    - ☑️ Backend:
        - ✅ samakan semua
        - ❌ (insomnia) semua milik spa
    - Frontend:
        - ikutin insomnia
        - selain super admin tidak ada bagian
--------------------------------------          
11. tahun_akademik: (independen)
    - ☑️ Backend:
        - ✅ samakan semua
        - ❌ (insomnia) semua milik spa
    - Frontend:
        - ikutin insomnia
        - semua milik spa
--------------------------------------                  
12. semester:
    - ☑️ Backend:
        - ✅ samakan semua        
    - Frontend:
        - Ikutin insomnia
--------------------------------------                  
13. ♻️X kurikulum_mata_pelajaran:
   - ☑️ Backend:
          - ✅ samakan semua
          - ✅ send data untuk select
          - ✅ hapus kolom tahun_akademik dan jurusan
   - Frontend:
          - ikutin insomnia
          - Buat tampilannya (untuk spa saja)
--------------------------------------                          
14. ♻️X kompetensi (1 mapel 2-4 CP):
    Target kemampuan siswa, lintas tahun
    - ☑️ Backend:        
        - ✅ samakan semua
        - ✅ send data untuk select
    - Frontend:
        - samakan dengan insomnia
        - jika user pilih jenis = KD, inputan fase disable/hilang
        - jika user pilih jenis = CP, inputan tingkat dan aspek disable/hilang
--------------------------------------                                  
15. ♻️X atp_master (1 CP 1-3 ATP)
    - Backend:
        - samakan semua
    - Frontend:
        - Ikutin Insomnia
--------------------------------------                                  
16. ♻️❌⚠️ tugas_tambahan_guru: (untuk guru yang tidak terpilih dalam jurusan oleh siswa)
17. ❌⚠️ modul_ajar
18. ❌⚠️ asesmen
--------------------------------------                                  
19. ♻️X rombel:
    - ☑️ Backend:
          - ✅ samakan semuanya
          - ✅ API dan insomnia
          - ✅ data select
          - ✅ sudah benar update dan storenya
          - ✅ tambah kolom jurusan_id
    - Frontend:
          - ikutin insomnia      
          - wali_rombel = wali_kelas
          - hitung jumlah siswa di rombel
--------------------------------------                                            
20. X wali_rombel:
    - ☑️ Backend:
          - Samakan semua
    - Frontend:
          - Ikutin insomnia
--------------------------------------                                            
21. X siswa_rombel:
    - ☑️ Backend:
          - ✅ samakan semuanya (M, S, C, R)          
          - ✅ data select
    - Frontend:
          - Ikutin insomnia
--------------------------------------                                            
22. X guru_jadwal_pelajarans:
    - ☑️ Backend:
        - ✅ Guru: Tampilkan tahun_akademik dan semester aktif saja 
        - ✅ spa: tidak bisa hapus jika sudah digunakan pada siswa_jadwal_pelajaran dan absensi_pelajaran
        - ✅ send data untuk select
        - ✅ Nambah kolom tahun_akademik_id
    - Frontend:
        - samakan dengan insomnia
--------------------------------------                                            
23. X siswa_jadwal_pelajaran:
    - ☑️ Backend:
        - ✅ Cuma bisa view aja
    - Frontend:
        - samakan dengan insomnia
--------------------------------------                                            
24. X alur_tujuan_pembelajaran:
    - ☑️ Backend:
        - ✅ samakan semua
        - ✅ route
        - ✅ guru: data select
        - ✅ fitur approve (spa)
        - ✅ hapus fitur clone (guru)    
    - Frontend:
        - ikutin insomnia
        - referensi tampilan ada di pdf e-raport halaman 143
        - Untuk UI guru silakan minta ke Winton
        - jika status = disetujui (karna sudah disetujui admin/lock), maka tombol update, dan tambah hilang dari guru (spa gabisa crud, cuma bisa approve aja), kalo bingung, tanya Winton
--------------------------------------                                            
25. ❌⚠️ beban_kerja_guru: (untuk menentukan total JP (jam pelajaran) guru)
   - ☑️ Backend:
        - ✅ spa
        - ✅ siswa: tahun dan semester aktif saja
   - Frontend:
        - samakan dengan insomnia
--------------------------------------                                            
26. X absensi_pegawai: (MASUK SINI)
    - ☑️ Backend:
        - ✅ samakan dengan migrasi
    - Frontend:
        - ikutin insomnia (baca docs jika ada)
        - jika status pada tahun_akademik atau semester = 'arsip', maka button delete dan update hilang...update dan delete hanya berlaku saat TA dan semester aktif saja
--------------------------------------                                            
27. X absensi_pelajaran:
    - ☑️ Backend:
        - ✅ samakan semua
        - ✅ show menggunakan id guru
    - Frontend
        - samakan dengan insomnia
--------------------------------------                                            
28. X absensi_siswa:
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
--------------------------------------                                            
29. ♻️X ekstrakurikuler:
    - ☑️ Backend:
        - ✅ migrasi, seeder, controller
    - Frontend:
        - ikutin insomnia
        - filter jika ada lebih dari 1 tahun_akademik
--------------------------------------                                            
30. X pembina_ekskul:
    - ☑️ Backend:
        - (migrasi, model, seeder)
        - ✅ controller
        - ✅ route
        - ✅ data select
    - Frontend:
        - ikutin insomnia
--------------------------------------                                                    
31. X pelatih_ekskul:
    - ☑️ Backend:
        - ✅ (migrasi, model, seeder)
        - ✅ controller
        - ✅ route
        - ✅ data select
    - Frontend:
        - ikutin insomnia
--------------------------------------                                                    
32. X ekskul_siswa_pivot:
    - ☑️ Backend:
        - ✅ (Migrasi, Seeder, Controller)
        - ✅ data select
    - Frontend:
        - ikutin insomnia
        - alur siswa daftar sendiri: get all ekskul -> klik daftar, sehingga siswa tidak menginputkan apapun secara manual (semua otomatis terisi)
--------------------------------------                                                    
33. X prestasi:
    - ☑️ Backend:
        - ✅ (Seeder, Migrasi, Controller) Hapus kolom kelas_id dan jurusan_id
        - ✅ jangan otomatis, gunakan data select manual aja (takutnya mau ngedata prestasi yang lampau)
    - Frontend:
        - ikutin insomnia
--------------------------------------                                                    
34. data_nilai_siswa:
    kumpulan hasil asesmen (uts/uas, absensi, dll)
    - Backend:
          - ❌samakan semua
    - Frontend:
          - Desain coba ikutin excel leger ya. Atau kalo ada yang lebih baik, silakan aja dicoba
          - Baca docs insomnia ya          
--------------------------------------                                                              
1.  rapor_nilai_siswa
    hasil akhir data_nilai_siswa
    - Backend:
          - ❌
2.  projek_p5:
    - ❌ Backend:
3.  data_nilai_p5:
    kumpulan hasil projek_p5
    - ❌ Backend:
4.  data_nilai_ekskul
    kumpulan hasil ekskul_siswa_pivot
    - Backend:
          - ❌
5.  rapor (wajib export excel)
    hasil final rapor_nilai_siswa, ekskul, p5
    - Backend:
          - ❌
6.  membuat data_berkas:
    - ❌ Backend:        
7.  ♻️ keuangan:
    - ❌ Backend:        
8.  ❌⚠️ membuat jurnal_kbm
9.  ❌⚠️ membuat forum diskusi
44. ❌⚠️ membuat tugas (lms)
45. ❌⚠️ membuat K1 (Kompetensi Inti) = (atasannya KD/Kompetensi)
46. ====================================================================================================================================
47. ❌⚠️ modul_ajar: ()
    rencana pembelajaran untuk mencapai kompetensi, menciptakan asesmen (uts/uas), dibuat tiap tahun
48. ❌⚠️ asesmen:
    alat ukur modul ajar (uts/uas), menilai kompetensi
49. ❌⚠️ asesmen_kompetensi:
    menetapkan bobot kompetensi pada asesmen
50. ❌⚠️ asesmen_siswa:
    nilai mentah per asesmen
51. ❌⚠️ nilai_kompetensi_siswa
    hasil kalkulasi dari asesmen_kompetensi dan asesmen_siswa
========================================================================================================================================

❌ (belum dikerjakan)
✅ (sudah dikerjakan)
⬅️ (lakukan)
⚠️ (coming soon)
☑️ (done)
🎯 (target)
♻️ (digunakan ulang)

==================================================
- Digunakan ulang
1. Identitas sekolah
2. Gedung
3. Ruangan
4. pegawai
5. siswa
6. jurusan
7. kelas
8. kurikulum (sampe ganti kurikulum)
9. mata_pelajaran
10. kurikulum_mata_pelajaran (sampe ganti kurikulum)
11. Kompetensi (sampe ganti kurikulum)
12. atp master (sampe ganti kurikulum)
13. Ekstrakurikuler
14. Keuangan


- Dibuat tiap semester:
1. SPA  : Buka tutup penerimaan siswa baru
2. SPA  : semester
3. Guru : alur_tujuan_pembelajaran
4. SPA  : jadwal_pelajaran
5. SPA  : siswa_jadwal_pelajaran
<!-- <!-- 6. SPA  : data_nilai -->
<!-- 1. SPA  : rapor --> -->


- Dibuat tiap tahun (saat semester ganjil):
1. SPA  : tahun_kademik
2. SPA  : wali_rombel
3. SPA  : siswa_rombel
4. SPA  : pelatih_ekskul
5. SPA  : pembina_ekskul
6. SPA  : ekskul_siswa_pivot
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


Jadwal:
2013/2024,
Ganjil: [
    Jadwal: [
        X: [
            MTK, B. Jepang, Biologi
        ],
        XI: [
            PKN, B. Korea
        ],
        XII: [
            Algoritma, B. Inggris
        ]
    ]
],
Genap: [
    Jadwal: [
        X: [
            TIK, B. Jepang Lanjut
        ],
        XI: [
            Korespondensi, B. Korea Lanjut
        ],
        XII: [
            Algoritma Lanjut, B. Inggris Lanjut
        ]
    ] 
]


X = (MTK), (B. Jepang), (Biologi) | (TIK), (B. Jepang Lanjut)
XI = 

Guru:
5. MTK                  = MTK
6. Korea Lanjutan       = Agama
7. Sunda                = Bahasa Sunda
8. Jepang               = Jepang, Jepang Lanjutan
9. TIK                  = TIK, Informatika
10. Korea               = Korea, Korea Lanjutan
11. PKN                 = PKN
12. Inggris             = Inggris, Inggris Lanjutan
13. Korespondensi       = Korespondensi
14. Guru tidak aktif    = Seni Budaya
15. Inggris Lanjutan    = 
16. Algoritma           = Algoritma, Algoritma Lanjutan
17. Algortima Lanjutan  =
18. Jepang Lanjutan     = 
19. Informatika         = Informatika
20. Biologi             = Biologi
21. Fisika              = Fisika


Guru MTK
Mapel       Semester        Kelas
MTK         Ganjil          X


Alur Rapor
1. Guru isi data nilai siswa dan ada simulasi hasil_akhirnya
2. wali kelas buat data rapor siswa
3. sistem mengambil hasil akhir data_nilai_siswa
4. Jika rapor masih draft maka data_nilai_siswa bisa diubah dan nilai pada rapor_nilai_siswa pun bisa diubah 
5. jika rapor masih draft, maka nilai_akhir pada rapor bisa digenerate ulang
6. jika rapor sudah final, maka rapor tidak bisa generate ulang

BACA GPT KEMARIN