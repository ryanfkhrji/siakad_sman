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


- Register


- Login


- Get Detail Diri
  - Logout
  - Ubah Pass Diri
  - Update Diri
  - Lupa Pass


- identitas sekolah
  - Create
  - Get All
  - Get Detail
  - Update
  - Delete


- Gedung
  - Create
  - Get All
  - Get Detail
  - Update
  - Delete


- Ruangan
  - Create
  - Get All
  - Get Detail
  - Update
  - Delete


- Kepegawiaan
  - Guru
    - Create
    - Ubah Password
    - Get All
    - Update
    - Delete
    - Get Detail => kasih aja button di detail buat ngelink ke bawah ini
      - Wali rombel                     : histori menjadi wali
      - Guru jadwal pelajaran           : histori jadwal
      - Absensi pegawai                 : show satu guru dan absennya
      - Absensi guru - pelajaran        : histori absensi
      - Pembina eksktrakurikuler        : Histori membina
      - Pelatih ekstrakurikuler         : Histori melatih

  - Selain Guru
    - Create
    - Ubah Password
    - Get All
    - Update
    - Delete
    - Get Detail => kasih aja button di detail buat ngelink ke bawah ini      
      - Absensi pegawai                 : show satu guru dan absennya      
      - Pembina eksktrakurikuler        : Histori membina
      - Pelatih ekstrakurikuler         : Histori melatih
        


- Penerimaan Siswa Baru
  - CRUD
  - Export
  - Import


- Siswa
  - Create
  - Get All
  - Update
  - Delete
  - Ubah Pass
  - Get Detail => Kasih button di detail buat ngelink ke bawah ini
    - Siswa rombel                    : Histori rombel (Data select ga dipake + dihapus)
    - Siswa jadwal pelajaran          : Get detail siswa dan jadwalnya
    - Absensi Siswa - Pelajaran       : Histori absensi (get all dihapus)
    - Siswa - Ekstrakurikuler         : Histori ikut ekskul
    - Prestasi                        : Histori prestasi
    - Data Nilai Siswa                : Cetak satu siswa dan semua nilainya (Ini belum dibuat)


- Jurusan
  - CRUD


- Kelas
  - Create
  - Get All
  - Update
  - Delete
  - Get Detail:
    - Rombel: rombel jangan buat menu lagi, menu rombel ada di detail kelas
      - Create (karna kita udah ada di detail kelas, maka pake aja id nya sebagai data select)
      - Update
      - Delete
      - Get Detail


- Kurikulum


- Mata Pelajaran


- Tahun Akademik


- Semester


- Kurikulum_mata_pelajaran


- Kompetensi => Kasih button di detail buat ngelink ke bawah ini
        Atp_master : Get detail (get all ga dipake)


- Guru jadwal pelajaran


- Siswa jadwal pelajaran


- Alur Tujuan Pembelajaran


- Absensi Pegawai (yang histori absensi jangan, karna di guru udah)


- Absensi Guru - Pelajaran (yang histori jangan)


- Absensi siswa - Pelajaran (yang histori jangan)


- Ekstrakurikuler    


- Prestasi










Hiraukan yang dibawah ini (cuma catatan)

Hapus:
- Rombel    :   Get All : http://127.0.0.1:8000/api/spa/rombel
                Create  : Data select kelas dihapus

Ubah:
- Kelas     :   ✅ Get Detail