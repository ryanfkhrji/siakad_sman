SPA: Jadwal Pelajaran:
1. print lembaran angket untuk siswa kelas 10 menuju 11 memilih mapel pilihan. ketentuan angket adalah maksimal pilih 3 mapel dengan 2 serumpun dan 1 berbeda rumpun, minimalnya pilih 1 mapel
2. Setelah itu sortir angket sesuai pilihan, misal tim A untuk mayoritas Pilihan: bahasa, bahasa, sains, tim B untuk mayoritas pilihan: sains, sains, bahasa.
3. Setelah disortir, buat rombel XI-A-1 untuk tim A, dan XI-A-2 untuk tim B.
4. Lalu buat jadwal sesuai mapel yang masuk ke dalam rombel. Guru yang mapelnya (misal: B. jepang) tidak masuk ke dalam rombel tidak dibuatkan jadwal mapelnya (misal B. jepang), melainkan dialihkan mengajar mapel lain (baik mapel yang kelebihan peminat maupun yang tidak) atau menjadi pembina dan pelatih ekskul
5. Setelah jadwal jadi, isi tabel beban_kerja_guru untuk mencatat tugas dan jp guru secara manual.


Kurikulum_mata_pelajaran:
Baca di pdf catatan





SPA:

- Cache Cleaner

--------------------------------------------------------------------------------

- Register

--------------------------------------------------------------------------------

- Login

--------------------------------------------------------------------------------

- Get Detail Diri
  - Logout
  - Ubah Pass Diri
  - Update Diri
  - Lupa Pass

--------------------------------------------------------------------------------

- identitas sekolah
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail

--------------------------------------------------------------------------------

- Gedung
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail

--------------------------------------------------------------------------------

- Ruangan
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail

--------------------------------------------------------------------------------

- Kepegawaian
  - Guru
    - Ubah Password
    - Create
    - Update
    - Delete
    - Get All
    - Get Detail => kasih aja button di detail buat ngelink ke bawah ini
      - Wali rombel                     : histori menjadi wali
      - Guru jadwal pelajaran           : histori jadwal
      - Absensi pegawai                 : show satu guru dan absennya
      - Absensi guru - pelajaran        : histori absensi
      - Pembina eksktrakurikuler        : Histori membina
      - Pelatih ekstrakurikuler         : Histori melatih

  - Selain Guru
    - Ubah Password
    - Create
    - Update
    - Delete
    - Get All
    - Get Detail => kasih aja button di detail buat ngelink ke bawah ini      
      - Absensi pegawai                 : show satu guru dan absennya      
      - Pembina eksktrakurikuler        : Histori membina
      - Pelatih ekstrakurikuler         : Histori melatih        

--------------------------------------------------------------------------------

- Penerimaan Siswa Baru
  - CRUD
  - Export
  - Import

--------------------------------------------------------------------------------

- Siswa
  - Ubah Pass
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail => Kasih button di detail buat ngelink ke bawah ini
    - Siswa rombel                    : Histori rombel (Data select ga dipake + dihapus)
    - Siswa jadwal pelajaran          : Get detail siswa dan jadwalnya
    - Absensi Siswa - Pelajaran       : Histori absensi (get all dihapus)
    - Siswa - Ekstrakurikuler         : Histori ikut ekskul
    - Prestasi                        : Histori prestasi
    - Data Nilai Siswa                : Cetak satu siswa dan semua nilainya (Ini belum dibuat)

--------------------------------------------------------------------------------

- Jurusan
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail

--------------------------------------------------------------------------------

- Kelas
  - CRUD
  - Get Detail (halaman baru untuk show detail kelas):
    - Kasih button create rombel di halaman detail kelas ini ==> Rombel: Create
    - Masing masing rombel dikasih button update, delete, detail ==> Rombel: Update, Delete, Detail Tahun Aktif
    - Saat klik detail rombel maka masuk ke halaman **(detail rombel)** ==> Rombel: Detail Tahun Aktif (diliat ini hasil runnya gimana)
      - Kalo belum ada data, kosongin halaman atau beri pesan "belum ada data pada tahun ini"
      - mau ada data atau engga, buat button Create wali di halaman ini **(detail rombel)** ==> Wali Rombel: Create
        - after create wali nanti muncul list wali pada halaman ini **(detail rombel)**, kasih button update dan delete
      - Mau ada data atau engga, buat button create siswa rombel sebelah create wali di halaman ini **(detail rombel)** ==> Siswa Rombel: Create
        - After create siswa nanti muncul list siswa pada halaman ini, kasih button update dan delete masing-masingnya
      - Mau ada data atau engga, buat button create guru jadwal pelajaran di halaman ini ==> Guru Jadwal Pelajaran: create
        - After create jadwal nanti muncul list jadwal pada halaman ini, kasih button update dan delete
      - Mau ada data atau engga, buat button sebelah create jadwal untuk lihat histori per periode ==> Rombel: Detail Histori
      - Rombel: Get all, nanti bakal dihapus, jadi jangan digunakan
      - Guru Jadwal Pelajaran: Get all jangan digunakan

--------------------------------------------------------------------------------

- Kurikulum

--------------------------------------------------------------------------------

- Mata Pelajaran

--------------------------------------------------------------------------------

- Tahun Akademik

--------------------------------------------------------------------------------

- Semester

--------------------------------------------------------------------------------

- Kurikulum_mata_pelajaran

--------------------------------------------------------------------------------

- Kompetensi:
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail => Kasih button di detail buat ngelink ke bawah ini
    - Atp_master : Get detail

--------------------------------------------------------------------------------

- ATP Master:
  - Create
  - Update
  - Delete
  - Get All
  - Get Detail

--------------------------------------------------------------------------------

⚠️ Wali Rombel

--------------------------------------------------------------------------------

⚠️ Siswa Rombel

--------------------------------------------------------------------------------

- Guru jadwal pelajaran

--------------------------------------------------------------------------------

- Siswa jadwal pelajaran

--------------------------------------------------------------------------------

- Alur Tujuan Pembelajaran

--------------------------------------------------------------------------------

- Absensi Pegawai (yang histori absensi jangan, karna di guru udah)

--------------------------------------------------------------------------------

- Absensi Guru - Pelajaran (yang histori jangan)

--------------------------------------------------------------------------------

- Absensi siswa - Pelajaran (yang histori jangan)

--------------------------------------------------------------------------------

- Ekstrakurikuler    

--------------------------------------------------------------------------------

⚠️ Pembina Ekskul

--------------------------------------------------------------------------------

⚠️ Pelatih Ekskul

--------------------------------------------------------------------------------

⚠️ Siswa Ekskul

--------------------------------------------------------------------------------

- Prestasi




<!-- masih cek mana aja menu dan sub menu (misal guru jadwal pelajaran itu masuk sub menu tapi jadi menu juga apa engga) -->





Hiraukan yang dibawah ini (cuma catatan)

Hapus:
- Rombel        :   Get All     : http://127.0.0.1:8000/api/spa/rombel
                    Create      : Data select kelas dihapus karna posisi create ada di detail kelas

- Wali Rombel   :   Data Select : Rombel dihapus karna posisi create sudah ada di detail tahun aktif rombel
 
- Siswa Rombel  :   Data Select : Rombel dihapus karna posisi create sudah ada di detail tahun aktif rombel
  
- Guru - Jadwal :   Data Select : Rombel dihapus karna posisi create sudah ada di detail tahun aktif rombel




Ubah:
- Kelas         :   ✅ Get Detail