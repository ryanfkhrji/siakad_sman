<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\IdentitasSekolah;
use App\Models\Gedung;
use App\Models\Ruangan;
use App\Models\TahunAkademik;
use App\Models\Semester;
use App\Models\Kepegawaian;
use App\Models\Jurusan;
use App\Models\MataPelajaran;
use App\Models\AbsensiPegawai;
use App\Models\AbsensiPelajaran;
use App\Models\Keuangan;
use App\Models\AbsensiSiswa;
use App\Models\Prestasi;
use App\Models\Kelas;
use App\Models\Rombel;
use App\Models\WaliRombel;
use App\Models\SiswaRombel;
use App\Models\JadwalPelajaran;
use App\Models\Kurikulum;
use App\Models\KurikulumMataPelajaran;
use App\Models\Kompetensi;
use App\Models\AtpMaster;
use App\Models\AlurTujuanPembelajaran;
use App\Models\Ekstrakurikuler;
use App\Models\PembinaEkskul;
use App\Models\PelatihEkskul;
use App\Models\Siswa;
use App\Models\EkskulSiswaPivot;
use App\Models\DataNilaiSiswa;
use App\Models\DataBerkas;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        /**
         * 🎯✅ spa: CRUD 
         * tu: CRUD
         * kepsek: Index
         * ✅ guru: Index
         * ✅ staff: Index (samakan dengan guru)
         * ✅ siswa: Index
         * 
        */
        IdentitasSekolah::insert([
            'npsn' => 'SMA/001/2020',
            'nama_sekolah' => 'SMA Negeri',
            'status_sekolah' => 'Negeri',
            'jenjang' => 'SMA',
            'akreditasi' => 'A',
            'alamat' => 'Jl. Raya Bogor',
            'desa_kelurahan' => 'Abadijaya',
            'kecamatan' => 'Sukmajaya',
            'kabupaten_kota' => 'Bogor',
            'provinsi' => 'Jawa Barat',
            'kode_pos' => '16417',
            'email' => 'smanegeri@gmail.com',
            'no_telepon' => '021 112 5567 82',
            'kepala_sekolah' => 'Winton Almundarinsa',
            'nip_kepala_sekolah' => '202143500065',
            'visi' => 'Menciptakan generasi yang unggul dan sejahtera',
            'misi' => 'Mencerdaskan bangsa melalui pendidikan',
            'logo' => 'public/logo/sma.png'
        ]);

        /**
         * 🎯✅ spa: CRUD
         * tu: CRUD
         *  */ 
        Gedung::insert([
            [
                'foto_gedung' => 'gedung1.jpg',
                'kode_gedung' => 'GD_01',
                'nama_gedung' => 'Gedung Pratama',
                'jumlah_lantai' => 3,
                'luas_bangunan' => '24 Meter Persegi',
                'tahun_dibangun' => 2019,
                'kondisi' => 'Baik',
                'lokasi' => 'Jl. Ampit Raya',
                'Keterangan' => 'Silakan isi sendiri',
                'status' => 'arsip'
            ],
            [
                'foto_gedung' => 'gedung2.jpg',
                'kode_gedung' => 'GD_02',
                'nama_gedung' => 'Gedung Secondary',
                'jumlah_lantai' => 2,
                'luas_bangunan' => '17 Meter Persegi',
                'tahun_dibangun' => 2024,
                'kondisi' => 'Rusak Ringan',
                'lokasi' => 'Jl. Raya',
                'Keterangan' => 'Silakan isi sendiri',
                'status' => 'aktif'
            ],
            [
                'foto_gedung' => 'gedung3.jpg',
                'kode_gedung' => 'GD_03',
                'nama_gedung' => 'Gedung Third',
                'jumlah_lantai' => 2,
                'luas_bangunan' => '17 Meter Persegi',
                'tahun_dibangun' => 2001,
                'kondisi' => 'Rusak Berat',
                'lokasi' => 'Jl. Raya',
                'Keterangan' => 'Silakan isi sendiri',
                'status' => 'arsip'
            ],
        ]);

        /**
         * 🎯✅ spa: CRUD
         * tu: CRUD
         *  */ 
        Ruangan::insert([
           [
            'gedung_id' => 1, // GD_01
            'kode_ruangan' => '1.3.3', // gedung, lantai, ruangan
            'nama_ruangan' => 'Ruang Olahraga',
            'jenis_ruangan' => 'Aula',
            'lantai' => 3,
            'kapasitas' => 50,
            'luas_ruangan' => 50,
            'kondisi' => 'Dalam Perbaikan',
            'fasilitas' => 'Matras, Voli, Basket',
            'keterangan' => 'Buka sampai jam 8 malam',
            'status' => 'arsip'
           ],
           [
            'gedung_id' => 2, // GD_02
            'kode_ruangan' => '2.2.1', // gedung, lantai, ruangan
            'nama_ruangan' => 'Kantor Kepala Sekolah',
            'jenis_ruangan' => 'Kantor',
            'lantai' => 2,
            'kapasitas' => 15,
            'luas_ruangan' => 30,
            'kondisi' => 'Baik',
            'fasilitas' => 'ATK, Dispenser, Rak Buku',
            'keterangan' => 'Tutup saat jam makan siang',
            'status' => 'aktif'
           ],
           [
            'gedung_id' => 2, // GD_02
            'kode_ruangan' => '2.2.2', // gedung, lantai, ruangan
            'nama_ruangan' => 'Lab Komputer',
            'jenis_ruangan' => 'Kantor',
            'lantai' => 2,
            'kapasitas' => 42,
            'luas_ruangan' => 30,
            'kondisi' => 'Baik',
            'fasilitas' => 'Komputer',
            'keterangan' => 'Khusus praktik dan ujian',
            'status' => 'arsip'
           ]
        ]);

         /**
          * 🎯✅ spa: CRUD
          * tu: CRUD          
          * kepsek : GET, SHOW
          * guru: 
          *
        */ 
        Kepegawaian::insert([
            [
                // 1
                'nama' => 'Super Admin',
                'email' => 'sp@gmail.com',
                'nip' => '123450',
                'nuptk' => '0123450',
                'keterangan' => 'Super Admin',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'super_admin',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 2
                'nama' => 'Kepsek',
                'email' => 'kepsek@gmail.com',
                'nip' => '123451',
                'nuptk' => '0123451',
                'keterangan' => 'Kepala Sekolah',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'kepsek',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 3
                'nama' => 'TU',
                'email' => 'tu@gmail.com',
                'nip' => '123452',
                'nuptk' => '0123452',
                'keterangan' => 'Staff TU',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'tu',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 4
                'nama' => 'Staff Kebersihan',
                'email' => 'staff@gmail.com',
                'nip' => '123453',
                'nuptk' => '0123453',
                'keterangan' => 'Staff Kebersihan',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'staff',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 5
                'nama' => 'Guru PAI',
                'email' => 'gurupai@gmail.com',
                'nip' => '123456',
                'nuptk' => '0123456',
                'keterangan' => 'Guru PAI',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 6
                'nama' => 'Guru PPKn',
                'email' => 'guruppkn@gmail.com',
                'nip' => '123454',
                'nuptk' => '0123454',
                'keterangan' => 'Guru PPKn',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 7
                'nama' => 'Guru Bahasa Indonesia',
                'email' => 'guruindonesia@gmail.com',
                'nip' => '123455',
                'nuptk' => '0123455',
                'keterangan' => 'Guru Bahasa Indonesia',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],            
            [
                // 8
                'nama' => 'Guru Bahasa Inggris',
                'email' => 'guruinggris@gmail.com',
                'nip' => '123457',
                'nuptk' => '0123457',
                'keterangan' => 'Guru Bahasa Inggris',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 9
                'nama' => 'Guru Matematika',
                'email' => 'gurumtk@gmail.com',
                'nip' => '123458',
                'nuptk' => '0123458',
                'keterangan' => 'Guru Matematika',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 10
                'nama' => 'Guru Sejarah',
                'email' => 'gurusejarah@gmail.com',
                'nip' => '123459',
                'nuptk' => '0123459',
                'keterangan' => 'Guru Sejarah',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 11
                'nama' => 'Guru PJOK',
                'email' => 'gurupjok@gmail.com',
                'nip' => '123460',
                'nuptk' => '0123460',
                'keterangan' => 'Guru PJOK',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 12
                'nama' => 'Guru Seni Budaya',
                'email' => 'gurusenibudaya@gmail.com',
                'nip' => '123461',
                'nuptk' => '0123461',
                'keterangan' => 'Guru Seni Budaya',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],            
            [
                // 13
                'nama' => 'Guru Informatika',
                'email' => 'guruinformatika@gmail.com',
                'nip' => '123462',
                'nuptk' => '0123462',
                'keterangan' => 'Guru Informatika',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 14
                'nama' => 'Guru Tidak Aktif',
                'email' => 'gurutidakaktif@gmail.com',
                'nip' => '123463',
                'nuptk' => '0123463',
                'keterangan' => 'Guru Tidak Aktif',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif',
            ],
            [
                // 15
                'nama' => 'Guru Projek P5',
                'email' => 'guruprojekp5@gmail.com',
                'nip' => '123464',
                'nuptk' => '0123464',
                'keterangan' => 'Guru Projek P5',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],

            // Kelompok Sains
            [
                // 16
                'nama' => 'Guru Fisika',
                'email' => 'gurufisika@gmail.com',
                'nip' => '123465',
                'nuptk' => '0123465',
                'keterangan' => 'Guru Fisika',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 17
                'nama' => 'Guru Kimia',
                'email' => 'gurukimia@gmail.com',
                'nip' => '123466',
                'nuptk' => '0123466',
                'keterangan' => 'Guru Kimia',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],

            // Kelompok Sosial
            [
                // 18
                'nama' => 'Guru Ekonomi',
                'email' => 'guruekonomi@gmail.com',
                'nip' => '123467',
                'nuptk' => '0123467',
                'keterangan' => 'Guru Ekonomi',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 19
                'nama' => 'Guru Sosiologi',
                'email' => 'gurusosiologi@gmail.com',
                'nip' => '123468',
                'nuptk' => '0123468',
                'keterangan' => 'Guru Sosiologi',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],

            // Kelompok Bahasa
            [
                // 20
                'nama' => 'Guru Bahasa Jepang',
                'email' => 'gurujepang@gmail.com',
                'nip' => '123469',
                'nuptk' => '0123469',
                'keterangan' => 'Guru Bahasa Jepang',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                // 21
                'nama' => 'Guru Bahasa Jerman',
                'email' => 'gurujerman@gmail.com',
                'nip' => '123470',
                'nuptk' => '0123470',
                'keterangan' => 'Guru Bahasa Jerman',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
        ]);

        /**
         * 🎯✅ SPA: CRUD
         */
        // Penerimaan Siswa Baru

        /**
         * 🎯✅ spa: CRUD
         * tu:
         * kepsek: GET, SHOW
         * guru: GET, SHOW
         */
        Siswa::insert([
            [
                // 1
                'nisn' => '123451',
                'nama' => 'Bagas',
                'nis' => '123451',                
                'email' => 'bagas@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 2
                'nisn' => '123452',
                'nama' => 'Winton',
                'nis' => '123452',                
                'email' => 'winton@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 3
                'nisn' => '123453',
                'nama' => 'Sanita',
                'nis' => '123453',                
                'email' => 'sanita@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 4
                'nisn' => '123454',
                'nama' => 'Rehan',
                'nis' => '123454',                
                'email' => 'rehan@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 5
                'nisn' => '123455',
                'nama' => 'Yuli',
                'nis' => '123455',                
                'email' => 'yuli@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'aktif'
            ],
            [
                // 6
                'nisn' => '123456',
                'nama' => 'Danang',
                'nis' => '123456',                
                'email' => 'danang@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif'
            ],
            [
                // 7
                'nisn' => '123457',
                'nama' => 'Selma',
                'nis' => '123457',                
                'email' => 'selma@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif'
            ],
            [
                // 8
                'nisn' => '123458',
                'nama' => 'Devi',
                'nis' => '123458',                
                'email' => 'devi@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
                'status' => 'tidak aktif'
            ],
        ]);

        /**
         * 🎯✅ spa: CRUD
         */
        Jurusan::insert([
            [
                'nama_jurusan' => 'IPA',
                'kode_jurusan' => '1',
                'status' => 'aktif',
            ],
            [
                'nama_jurusan' => 'IPS',
                'kode_jurusan' => '2',
                'status' => 'aktif',
            ],
            [
                'nama_jurusan' => 'Bahasa',
                'kode_jurusan' => '3',
                'status' => 'arsip',
            ],
        ]);

        /**
         * 🎯✅ spa: CRUD
         * tu: CRUD 
         * kepsek: GET, SHOW
         * guru:
         * **/
        Kelas::insert([
            [
                'nama_kelas' => 'X',
                'kode_kelas' => 'K10',                
                'tingkat' => 10,                                
                'status' => 'aktif'
            ],
            [
                'nama_kelas' => 'XI',
                'kode_kelas' => 'K11',                
                'tingkat' => 11,                                
                'status' => 'aktif'
            ],
            [
                'nama_kelas' => 'XII',
                'kode_kelas' => 'K112',                
                'tingkat' => 12,                                
                'status' => 'aktif'
            ],            
            [
                'nama_kelas' => 'XII-arsip',
                'kode_kelas' => 'K12-arsip',                
                'tingkat' => 12,                                
                'status' => 'arsip'
            ],            
        ]);

        /**
         * 🎯✅ spa: CRUD
         * tu (tidak berubah sampe ada kurikulum baru): CRUD
         *  */ 
        Kurikulum::insert([
            [
                'nama_kurikulum' => 'Kurikulum Tingkat Satuan Pendidikan (KTSP)',
                'kode_kurikulum' => '2006',
                'tipe' => 'KTSP',
                'tahun_mulai' => 2006,
                'tahun_selesai' => 2012,
                'deskripsi' => '
                - Sekolah Bebas Menentukan Kurikulum
                - Ada Standar Kompetensi (SK) dan Kompetensi Dasar (KD)',
                'status' => 'arsip',
            ],
            [
                'nama_kurikulum' => 'Kurikulum 2013',
                'kode_kurikulum' => '2013',
                'tipe' => 'K13',
                'tahun_mulai' => 2013,
                'tahun_selesai' => 2021,
                'deskripsi' => '
                - Ada Kompetensi Inti (KI) dan Kompetensi Dasar (KD)
                1. KI 1: Sikap Spriritual
                2. KI 2: Sikap Sosial
                3. KI 3: Pengetahuan
                4. KI 4: Keterampilan
                - Banyak Penilaian Formatif
                - Buku Tematik untuk SD
                - SMA Terbagi Menjadi:
                1. Mata Pelajaran Wajib
                2. Peminatan',
                'status' => 'arsip',
            ],
            [
                'nama_kurikulum' => 'Kurikulum Merdeka',
                'kode_kurikulum' => '2022',
                'tipe' => 'MERDEKA',
                'tahun_mulai' => 2022,
                'tahun_selesai' => 2025,
                'deskripsi' => '
                - Tidak ada lagi KI & KD, diganti Capaian Pembelajaran (CP)
                - Lebih fleksibel
                - Terdapat Projek Penguatan Profil Pelajar Pancasila (P5)
                - Mata Pelajaran Informatika Menjadi Wajib
                - SMA Kembali ke Umum Tanpa Jurusan (IPA/IPS dihapus)',
                'status' => 'aktif',
            ],
        ]);

        /**
         * 🎯✅ spa: CRUD
         * tu: CRUD
         * Kepsek: GET, SHOW
         * guru: GET, SHOW
         * */ 
        MataPelajaran::insert([            
            // Mapel Umum Fase E (10)
            [
                // 1
                'nama_pelajaran' => 'Pendidikan Agama & Budi Pekerti',
                'kode_mapel_diknas' => 'sesuai agama',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 2
                'nama_pelajaran' => 'PPKn',
                'kode_mapel_diknas' => '154',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],  
            [
                // 3
                'nama_pelajaran' => 'Bahasa Indonesia',
                'kode_mapel_diknas' => '156',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 4
                'nama_pelajaran' => 'Bahasa Inggris',
                'kode_mapel_diknas' => '157',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 5
                'nama_pelajaran' => 'Matematika',
                'kode_mapel_diknas' => '180',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 6
                'nama_pelajaran' => 'Sejarah',
                'kode_mapel_diknas' => '204',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 7
                'nama_pelajaran' => 'PJOK',
                'kode_mapel_diknas' => '220',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 8
                'nama_pelajaran' => 'Seni Budaya',
                'kode_mapel_diknas' => '217',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 9
                'nama_pelajaran' => 'Informatika',
                'kode_mapel_diknas' => '224',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],
            [
                // 10
                'nama_pelajaran' => 'Projek P5',
                'kode_mapel_diknas' => 'tidak ada standar',                
                'kelompok' => 'umum',
                'status' => 'aktif',                
            ],            

            // ---------------------------

            // Mapel Pilihan Fase F (11 dan 12)
            // Kelompok Sains
            [
                // 11
                'nama_pelajaran' => 'Fisika',
                'kode_mapel_diknas' => '184',                
                'kelompok' => 'sains',
                'status' => 'aktif',                
            ],
            [
                // 12
                'nama_pelajaran' => 'Kimia',
                'kode_mapel_diknas' => '187',                
                'kelompok' => 'sains',
                'status' => 'aktif',                
            ],                        
            [
                // 13
                'nama_pelajaran' => 'Biologi',
                'kode_mapel_diknas' => '190',                
                'kelompok' => 'sains',
                'status' => 'aktif',                
            ],
            [
                // 14
                'nama_pelajaran' => 'Matematika Tingkat Lanjut',
                'kode_mapel_diknas' => 'MTL',                
                'kelompok' => 'sains',
                'status' => 'aktif',                
            ],       
            
            // Kelompok sosial
            [
                // 15
                'nama_pelajaran' => 'Ekonomi',
                'kode_mapel_diknas' => '210',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],                                  
            [
                // 16
                'nama_pelajaran' => 'Geografi',
                'kode_mapel_diknas' => '207',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],                                  
            [
                // 17
                'nama_pelajaran' => 'Sosiologi',
                'kode_mapel_diknas' => '214',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],                                  
            [
                // 18
                'nama_pelajaran' => 'Antropologi',
                'kode_mapel_diknas' => '215',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],                             
            [
                // 19
                'nama_pelajaran' => 'Sejarah Lanjutan',
                'kode_mapel_diknas' => '204-L',                
                'kelompok' => 'sosial',
                'status' => 'aktif',                
            ],
            
            // Kelompok bahasa
            [
                // 20
                'nama_pelajaran' => 'Bahasa Jepang',
                'kode_mapel_diknas' => 'JP',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 21
                'nama_pelajaran' => 'Bahasa Mandarin',
                'kode_mapel_diknas' => 'MAN',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 22
                'nama_pelajaran' => 'Bahasa Korea',
                'kode_mapel_diknas' => 'KR',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 23
                'nama_pelajaran' => 'Bahasa Arab',
                'kode_mapel_diknas' => '239',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 24
                'nama_pelajaran' => 'Bahasa Jerman',
                'kode_mapel_diknas' => '160',                
                'kelompok' => 'bahasa',
                'status' => 'aktif',                
            ],
            [
                // 25
                'nama_pelajaran' => 'Bahasa Perancis',
                'kode_mapel_diknas' => '164',                
                'kelompok' => 'bahasa',
                'status' => 'tidak_aktif',                
            ],            
            [
                // 26
                'nama_pelajaran' => 'Bahasa Sunda',
                'kode_mapel_diknas' => 'SUND',                
                'kelompok' => 'bahasa',
                'status' => 'arsip',                
            ],            
        ]);  

        /**
         * 🎯✅ spa: CRUD
         */
        KurikulumMataPelajaran::insert([
            [
                // 1
                'kurikulum_id' => 2, // Kurtilas
                'mata_pelajaran_id' => 26, // Bahasa Sunda
                'tingkat' => 10,
                'nilai_kkm' => 75.55,
                'status_mata_pelajaran' => 'wajib',
                'status' => 'arsip'
            ],
            // ==========================================
            [
                // Kelompok Umum (E)
                // Kelas 10
                // 2
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 1, // Agama
                'tingkat' => 10,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 3
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 2, // PPKn
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 4
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 3, // Indo
                'tingkat' => 10,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 5
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 4, // Inggris
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 6
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 5, // Matematika
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 7
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 6, // Sejarah
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 8
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 7, // PJOK
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 9
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 8, // Seni Budaya
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 10
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 9, // Informatika
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 11
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 10, // Projek P5
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // Kelas 11
                // 12
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 1, // Agama
                'tingkat' => 11,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 13
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 2, // PPKn
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 14
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 3, // Indo
                'tingkat' => 11,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 15
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 4, // Inggris
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 16
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 5, // Matematika
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 17
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 6, // Sejarah
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 18
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 7, // PJOK
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 19
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 8, // Seni Budaya
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 20
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 9, // Informatika
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 21
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 10, // Projek P5
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // Kelas 12
                // 22
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 1, // Agama
                'tingkat' => 12,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 23
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 2, // PPKn
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 24
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 3, // Indo
                'tingkat' => 12,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],            
            [
                // 25
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 4, // Inggris
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 26
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 5, // Matematika
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 27
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 6, // Sejarah
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 28
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 7, // PJOK
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 29
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 8, // Seni Budaya
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 30
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 9, // Informatika
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],
            [
                // 31
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 10, // Projek P5
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'wajib',                
                'status' => 'aktif'
            ],

            // Kelompok Sains (F)
            // Kelas 11
            [
                // 32
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 11, // Fisika
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 33
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 12, // Kimia
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 34
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 13, // Biologi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 35
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 14, // MTK Lanjut
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            // Kelas 12
            [
                // 36
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 11, // Fisika
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 37
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 12, // Kimia
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 38
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 13, // Biologi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 39
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 14, // MTK Lanjut
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],

            // Kelompok Sosial (F)
            // Kelas 11
            [
                // 40
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 15, // Ekonomi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 41
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 16, // Geografi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 42
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 17, // Sosiologi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 43
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 18, // Antropologi
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 44
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 19, // Sejarah Lanjutan
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            // Kelas 12
            [
                // 45
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 15, // Ekonomi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 46
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 16, // Geografi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 47
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 17, // Sosiologi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 48
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 18, // Antropologi
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 49
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 19, // Sejarah Lanjutan
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],

            // Kelompok bahasa (F)
            // Kelas 11
            [
                // 50
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 20, // Bahasa Jepang
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 51
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 21, // Bahasa Mandarin
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 52
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 22, // Bahasa Korea
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 53
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 23, // Bahasa Arab
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 54
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 24, // Bahasa Jerman
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 55
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 25, // Bahasa Perancis
                'tingkat' => 11,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'tidak_aktif'
            ],            
            // Kelas 12
            [
                // 56
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 20, // Bahasa Jepang
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 57
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 21, // Bahasa Mandarin
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 58
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 22, // Bahasa Korea
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 59
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 23, // Bahasa Arab
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 60
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 24, // Bahasa Jerman
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'aktif'
            ],
            [
                // 61
                'kurikulum_id' => 3,
                'mata_pelajaran_id' => 25, // Bahasa Perancis
                'tingkat' => 12,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
                'status' => 'tidak_aktif'
            ],            
        ]);

        /**
         * 🎯✅ spa: CRUD
         * tu: CRUD
         * 
         */
        TahunAkademik::insert([
            [
                'tahun_akademik' => '2023/2024',                
                'keterangan' => 'Kurikulum 2013',
                'status' => 'arsip',
            ],
            [
                'tahun_akademik' => '2024/2025',                
                'keterangan' => 'Kurikulum Merdeka',
                'status' => 'aktif',
            ]
        ]);  
    
        /**
         * 🎯✅ spa: CRUD
         */
        Semester::insert([
            [
                'tahun_akademik_id' => 1,
                'semester' => 'Ganjil',
                'status' => 'arsip'
            ],
            [
                'tahun_akademik_id' => 1,
                'semester' => 'Genap',
                'status' => 'arsip'
            ],
            [
                'tahun_akademik_id' => 2,
                'semester' => 'Ganjil',
                'status' => 'aktif'
            ],
        ]);

        /**
         * tidak berubah selama kurikulum sama
         * 🎯✅ spa: CRUD
         * tu: CRUD
         * Kepsek: GET, SHOW
         * guru: GET, SHOW
         * */  
        Kompetensi::insert([
            [
                // 1
                'kurikulum_id' => 2, // K13
                'mata_pelajaran_id' => 26, // Bahasa Sunda
                'judul_kompetensi' => 'Memahami Bahasa Sunda',
                'jenis' => 'KD',                
                'kode' => 'KD-1.1',
                'tingkat' => '10',
                'aspek' => 'pengetahuan',
                'fase' => null,
                'deskripsi' => 'Memahami bahasa Sunda dalam kehidupan sehari-hari',
                'status' => 'arsip'
            ],
            [
                // 2
                'kurikulum_id' => 2, // K13
                'mata_pelajaran_id' => 26,
                'judul_kompetensi' => 'Mahir berbahasa Sunda',
                'jenis' => 'KD',                
                'kode' => 'KD-1.2',
                'tingkat' => '10',
                'aspek' => 'keterampilan',
                'fase' => null,
                'deskripsi' => 'Mahir menggunakan bahasa Sunda dalam kehidupan sehari-hari',
                'status' => 'aktif'
            ],            
            // ============================================== 

            // Fase E
            // Tingkat 10
            // MTK (10) (E)
            [
                // 3
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 5, // Matematika (10)
                'judul_kompetensi' => 'Pemahaman Konsep Aljabar dan Bilangan Real',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-10-E1',
                'tingkat' => '10',
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu memahami dan menerapkan konsep bilangan real, bentuk aljabar, persamaan, dan pertidaksamaan linear dalam menyelesaikan masalah matematis dan kontekstual secara sistematis, menggunakan penalaran logis dan prosedur yang tepat.',
                'status' => 'aktif'
            ],
            [
                // 4
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 5, // Matematika (10)
                'judul_kompetensi' => 'Representasi dan Komunikasi Matematis',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-10-E2',
                'tingkat' => '10',
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu menyajikan dan mengomunikasikan ide matematika melalui berbagai representasi seperti simbol, tabel, grafik, dan bahasa matematika, serta menunjukkan sikap teliti, jujur, dan percaya diri dalam proses pemecahan masalah.',
                'status' => 'aktif'
            ],

            // MTK (11) (F)
            [
                // 5
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 5, // Matematika (11)
                'judul_kompetensi' => 'Analisis Fungsi dan Trigonometri',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis dan menerapkan konsep fungsi, trigonometri, dan transformasinya untuk menyelesaikan masalah matematis dan masalah kontekstual, serta menjelaskan hubungan antar konsep secara logis dan sistematis.',      
                'status' => 'aktif'
            ],
            [
                // 6
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 5, // Matematika (11)
                'judul_kompetensi' => 'Penalaran dan Pemecahan Masalah Matematis',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menggunakan penalaran induktif dan deduktif dalam menyusun argumen matematis, memecahkan masalah, serta mengomunikasikan proses dan hasil penyelesaian secara runtut dan akurat.',
                'status' => 'aktif'
            ],

            // MTK (12) (F)
            [
                // 7
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 5, // Matematika (12)
                'judul_kompetensi' => 'Penerapan Kalkulus dalam Pemecahan Masalah',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami dan menerapkan konsep limit dan turunan fungsi aljabar untuk menganalisis perubahan, menentukan nilai optimum, dan menyelesaikan masalah kontekstual secara kritis dan bertanggung jawab.',      
                'status' => 'aktif'
            ],
            [
                // 8
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 5, // Matematika (12)
                'judul_kompetensi' => 'Analisis Data dan Peluang',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis data, menentukan peluang suatu kejadian, serta menggunakan konsep statistika dan peluang untuk menarik kesimpulan dan membuat keputusan berdasarkan data secara logis dan objektif.',
                'status' => 'aktif'
            ],


            // Fase E
            // Tingkat 10
            // Indonesia (10) (E)
            [
                // 9
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 3, // B. Indo (10)
                'judul_kompetensi' => 'Pemahaman dan Analisis Teks Informasi',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-10-E1',
                'tingkat' => '10',
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu memahami, mengidentifikasi, dan menganalisis isi, struktur, serta kebahasaan berbagai teks informasi (seperti teks laporan hasil observasi, eksposisi, dan prosedur) secara kritis, serta menyimpulkan informasi secara logis dan sistematis.',
                'status' => 'aktif'
            ],
            [
                // 10
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 3, // B. Indo (10)
                'judul_kompetensi' => 'Produksi Teks Informatif dan Komunikatif',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-10-E2',
                'tingkat' => '10',
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu menulis dan menyajikan teks informasi secara runtut, efektif, dan sesuai kaidah bahasa Indonesia dengan memperhatikan tujuan, konteks, serta audiens, serta menunjukkan sikap bertanggung jawab dalam berbahasa.',
                'status' => 'aktif'
            ],

            // Indo (11) (F)
            [
                // 11
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 3, // B. Indo (11)
                'judul_kompetensi' => 'Analisis dan Evaluasi Teks Sastra dan Nonfiksi',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis, mengevaluasi, dan membandingkan isi, struktur, serta nilai-nilai dalam berbagai teks sastra dan nonfiksi, serta mengaitkannya dengan konteks sosial dan budaya secara kritis dan reflektif.',      
                'status' => 'aktif'
            ],
            [
                // 12
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 3, // B. Indo (11)
                'judul_kompetensi' => 'Keterampilan Berbahasa untuk Berargumentasi',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu mengemukakan pendapat, argumen, dan tanggapan secara lisan dan tulis dengan bahasa yang santun, logis, dan persuasif, serta menggunakan sumber informasi yang relevan dan dapat dipercaya.',
                'status' => 'aktif'
            ],

            // Indo (12) (F)
            [
                // 13
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 3, // B. Indo (12)
                'judul_kompetensi' => 'Kreasi dan Apresiasi Teks Sastra dan Nonfiksi',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu mengapresiasi dan mencipta teks sastra dan nonfiksi secara kreatif dengan memperhatikan struktur, kaidah kebahasaan, serta nilai estetika, serta merefleksikan makna teks dalam konteks kehidupan nyata.',      
                'status' => 'aktif'
            ],
            [
                // 14
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 3, // B. Indo (12)
                'judul_kompetensi' => 'Komunikasi Akademik dan Publik',
                'jenis' => 'CP',                
                'kode' => 'CP-IND-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menyampaikan gagasan, hasil kajian, dan pendapat secara lisan dan tulis dalam konteks akademik dan publik dengan bahasa Indonesia yang baik dan benar, serta bertanggung jawab dalam penggunaan informasi.',
                'status' => 'aktif'
            ],



            // Sains (F)
            // Fisika (F) (11)
            [
                // 15
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 11, // Fisika (11)
                'judul_kompetensi' => 'Pemahaman Konsep dan Hukum Dasar Fisika',
                'jenis' => 'CP',                
                'kode' => 'CP-FIS-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami, menganalisis, dan menerapkan konsep serta hukum dasar fisika pada materi mekanika dan gelombang untuk menjelaskan fenomena alam secara kuantitatif dan kualitatif dengan menggunakan penalaran ilmiah.',      
                'status' => 'aktif'
            ],
            [
                // 16
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 11, // Fisika (11)
                'judul_kompetensi' => 'Penerapan Metode Ilmiah dan Analisis Eksperimen',
                'jenis' => 'CP',                
                'kode' => 'CP-FIS-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menerapkan metode ilmiah melalui kegiatan eksperimen fisika, mengolah dan menganalisis data hasil percobaan, serta mengomunikasikan hasilnya secara logis dan bertanggung jawab.',
                'status' => 'aktif'
            ],

            // Fisika (F) (12)
            [
                // 17
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 11, // Fisika (12)
                'judul_kompetensi' => 'Analisis Fenomena Fisika Lanjutan',
                'jenis' => 'CP',                
                'kode' => 'CP-FIS-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis, mengevaluasi, dan membandingkan isi, struktur, serta nilai-nilai dalam berbagai teks sastra dan nonfiksi, serta mengaitkannya dengan konteks sosial dan budaya secara kritis dan reflektif.',      
                'status' => 'aktif'
            ],
            [
                // 18
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 11, // Fisika (12)
                'judul_kompetensi' => 'Pemodelan, Eksperimen, dan Aplikasi Fisika',
                'jenis' => 'CP',                
                'kode' => 'CP-FIS-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu mengemukakan pendapat, argumen, dan tanggapan secara lisan dan tulis dengan bahasa yang santun, logis, dan persuasif, serta menggunakan sumber informasi yang relevan dan dapat dipercaya.',
                'status' => 'aktif'
            ],


            // Sosial (F)
            // Ekonomi (F) (11)
            [
                // 19
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 15, // Ekonomi (11)
                'judul_kompetensi' => 'Pemahaman Konsep Dasar Ekonomi dan Permasalahan Ekonomi',
                'jenis' => 'CP',                
                'kode' => 'CP-EKN-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami konsep kelangkaan, kebutuhan manusia, pilihan, biaya peluang, serta permasalahan ekonomi yang dihadapi individu, rumah tangga, dan masyarakat dalam kegiatan ekonomi sehari-hari.',      
                'status' => 'aktif'
            ],
            [
                // 20
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 15, // Ekonomi (11)
                'judul_kompetensi' => 'Analisis Kegiatan dan Pelaku Ekonomi dalam Sistem Perekonomian',
                'jenis' => 'CP',                
                'kode' => 'CP-EKN-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis peran pelaku ekonomi (rumah tangga, perusahaan, pemerintah, dan masyarakat luar negeri) serta interaksinya dalam kegiatan produksi, distribusi, dan konsumsi.',
                'status' => 'aktif'
            ],

            // Ekonomi (F) (12)
            [
                // 21
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 15, // Ekonomi (12)
                'judul_kompetensi' => 'Ekonomi Makro dan Kebijakan Pemerintah',
                'jenis' => 'CP',                
                'kode' => 'CP-EKN-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami konsep ekonomi makro seperti pendapatan nasional, inflasi, pengangguran, serta menganalisis peran pemerintah melalui kebijakan fiskal dan moneter dalam menjaga stabilitas ekonomi.',      
                'status' => 'aktif'
            ],
            [
                // 22
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 15, // Ekonomi (12)
                'judul_kompetensi' => 'Analisis Pembangunan Ekonomi dan Tantangan Global',
                'jenis' => 'CP',                
                'kode' => 'CP-EKN-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menganalisis konsep pembangunan ekonomi, indikator keberhasilan pembangunan, serta dampak globalisasi dan perdagangan internasional terhadap perekonomian nasional.',
                'status' => 'aktif'
            ],


            // Bahasa (F)
            // Jepang (F) (11)
            [
                // 23
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 20, // Jepang (11)
                'judul_kompetensi' => 'Pemahaman Dasar Bahasa Jepang dalam Konteks Kehidupan Sehari-hari',
                'jenis' => 'CP',                
                'kode' => 'CP-JPN-11-F1',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami dan menggunakan ungkapan dasar Bahasa Jepang untuk memperkenalkan diri, menyampaikan informasi sederhana, serta berinteraksi dalam situasi sehari-hari dengan memperhatikan unsur kebahasaan dan budaya.',      
                'status' => 'aktif'
            ],
            [
                // 24
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 20, // Jepang (11)
                'judul_kompetensi' => 'Pemahaman Struktur Bahasa Jepang dan Budaya dalam Konteks Sederhana',
                'jenis' => 'CP',                
                'kode' => 'CP-JPN-11-F2',
                'tingkat' => '11',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami penggunaan kosakata, tata bahasa dasar, serta mengenal unsur budaya Jepang yang berkaitan dengan penggunaan bahasa dalam komunikasi sederhana.',
                'status' => 'aktif'
            ],

            // Jepang (F) (12)
            [
                // 25
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 16, // Jepang (12)
                'judul_kompetensi' => 'Penggunaan Bahasa Jepang untuk Komunikasi Fungsional',
                'jenis' => 'CP',                
                'kode' => 'CP-JPN-12-F1',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menggunakan Bahasa Jepang untuk menyampaikan pendapat, pengalaman, dan rencana sederhana baik secara lisan maupun tulisan dengan memperhatikan struktur bahasa dan konteks budaya.',      
                'status' => 'aktif'
            ],
            [
                // 26
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 16, // Jepang (12)
                'judul_kompetensi' => 'Pemahaman Teks Sederhana dan Budaya Jepang dalam Konteks Global',
                'jenis' => 'CP',                
                'kode' => 'CP-JPN-12-F2',
                'tingkat' => '12',
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu memahami teks sederhana Bahasa Jepang serta menganalisis informasi budaya Jepang dan keterkaitannya dengan kehidupan global dan interaksi antarbudaya.',
                'status' => 'aktif'
            ],
        ]);

        // 🎯 spa/tu
        AtpMaster::insert([
            // MTK (E) (10)
            [
                // 1
                'kompetensi_id' => 3, // Ganjil || Aljabar dan Bilangan real
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami sifat-sifat bilangan real dan operasinya.',
                'status' => 'arsip'
            ],
            [
                // 2
                'kompetensi_id' => 3,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menyusun dan menyederhanakan bentuk aljabar.',
                'status' => 'arsip'
            ],
            [
                // 3
                'kompetensi_id' => 3,
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menyelesaikan persamaan dan pertidaksamaan linear satu variabel.',
                'status' => 'aktif'
            ],            
            [
                // 4
                'kompetensi_id' => 4, // Genap || Respresentasi dan Komunikasi Matematis                 
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami konsep relasi dan fungsi.',
                'status' => 'aktif'
            ],
            [
                // 5
                'kompetensi_id' => 4,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menentukan domain, kodomain, dan range suatu fungsi.',
                'status' => 'aktif'
            ],
            [
                // 6
                'kompetensi_id' => 4,
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menyajikan fungsi dalam bentuk tabel, grafik, dan persamaan.',
                'status' => 'aktif'
            ],            

            // MTK (F) (11)
            [
                // 7
                'kompetensi_id' => 5, // Ganjil || Fungsi & Trigonometri
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami perbandingan trigonometri pada segitiga siku-siku.',
                'status' => 'aktif'
            ],
            [
                // 8
                'kompetensi_id' => 5,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menentukan nilai fungsi trigonometri sudut istimewa.',
                'status' => 'aktif'
            ],
            [
                // 9
                'kompetensi_id' => 5,    
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menyelesaikan persamaan trigonometri sederhana.',
                'status' => 'aktif'
            ],            
            [
                // 10
                'kompetensi_id' => 6, // Genap || Penalaran dan Pemecahan Masalah Matematis          
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami konsep, jenis, dan notasi matriks.',
                'status' => 'aktif'
            ],
            [
                // 11
                'kompetensi_id' => 6,    
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Melakukan operasi dasar pada matriks.',
                'status' => 'aktif'
            ],
            [
                // 12
                'kompetensi_id' => 6,                
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menentukan determinan dan invers matriks ordo 2x2.',
                'status' => 'aktif'
            ],            

            // MTK (F) (12)
            [
                // 13
                'kompetensi_id' => 7, // Ganjil || Penerapan Kalkulus dalam Pemecahan Masalah
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami konsep limit fungsi aljabar.',
                'status' => 'aktif'
            ],
            [
                // 14
                'kompetensi_id' => 7,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menentukan nilai limit secara analitik.',
                'status' => 'aktif'
            ],
            [
                // 15
                'kompetensi_id' => 7,    
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Memahami konsep turunan sebagai laju perubahan.',
                'status' => 'aktif'
            ],                 
            [
                // 16
                'kompetensi_id' => 8, // Genap || Data dan Peluang  
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami konsep ruang sampel dan kejadian.',
                'status' => 'aktif'
            ],
            [
                // 17
                'kompetensi_id' => 8,    
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menentukan peluang suatu kejadian.',
                'status' => 'aktif'
            ],
            [
                // 18
                'kompetensi_id' => 8,                
                'urutan' => 3,
                'tujuan_pembelajaran' => 'Menerapkan aturan penjumlahan dan perkalian peluang.',
                'status' => 'aktif'
            ],           



            // Bahasa Indonesia (E) (10)
            [
                // 19
                'kompetensi_id' => 9, // Ganjil || Analisis Teks Informasi
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi tujuan dan informasi penting dalam teks informasi.',
                'status' => 'aktif'
            ],
            [
                // 20
                'kompetensi_id' => 9,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis struktur dan unsur kebahasaan teks informasi.',
                'status' => 'aktif'
            ],
            [
                // 21
                'kompetensi_id' => 10, // Genap || Produksi teks informatif dan produktif
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami ciri dan struktur teks laporan hasil observasi.',
                'status' => 'aktif'
            ],
            [
                // 22
                'kompetensi_id' => 10,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengumpulkan data dari hasil pengamatan.',
                'status' => 'aktif'
            ],            

            // Bahasa Indonesia (F) (11)
            [
                // 23
                'kompetensi_id' => 11, // Ganjil || Analisis Teks Sastra
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi unsur dan karakteristik teks sastra dan nonfiksi.',
                'status' => 'aktif'
            ],
            [
                // 24
                'kompetensi_id' => 11,    
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis struktur, isi, dan nilai dalam teks.',
                'status' => 'aktif'
            ],
            [
                // 25
                'kompetensi_id' => 12, // Genap || Keterampilan Argumentasi
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi ciri dan tujuan teks argumentasi.',
                'status' => 'aktif'
            ],
            [
                // 26
                'kompetensi_id' => 12,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis penggunaan fakta dan opini dalam teks argumentasi.',
                'status' => 'aktif'
            ],

            // Indonesia (F) (12)
            [
                // 27
                'kompetensi_id' => 13, // Ganjil || Kreasi Teks Sastra
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menganalisis unsur pembangun teks sastra modern.',
                'status' => 'aktif'
            ],
            [
                // 28
                'kompetensi_id' => 13,    
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengapresiasi nilai estetika dan pesan dalam teks sastra.',
                'status' => 'aktif'
            ],
            [
                // 29
                'kompetensi_id' => 14, // Genap || Komunikasi Akademik dan Publik
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi ciri dan sistematika komunikasi akademik.',
                'status' => 'aktif'
            ],
            [
                // 30
                'kompetensi_id' => 14,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Merumuskan topik dan tujuan penyampaian gagasan.',
                'status' => 'aktif'
            ],



            // Fisika (F)
            // Fisika (F) (11)
             [
                // 31
                'kompetensi_id' => 15, // Ganjil || Pemahaman Konsep dan Hukum Dasar Fisika
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menganalisis besaran fisis pada gerak lurus dan gerak melingkar.',
                'status' => 'aktif'
            ],
            [
                // 32
                'kompetensi_id' => 15,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menjelaskan konsep usaha, energi kinetik, dan energi potensial.',
                'status' => 'aktif'
            ],
            [
                // 33
                'kompetensi_id' => 16, // Genap || Penerapan Metode Ilmiah dan Analisis Eksperimen
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi karakteristik gelombang mekanik.',
                'status' => 'aktif'
            ],
            [
                // 34
                'kompetensi_id' => 16,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Merancang percobaan fisika sederhana sesuai tujuan.',
                'status' => 'aktif'
            ],

            // Fisika (F) (12)
            [
                // 35
                'kompetensi_id' => 17, // Ganjil || Analisis Fenomena Fisika Lanjutan                 
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menjelaskan konsep arus, tegangan, dan hambatan listrik.',
                'status' => 'aktif'
            ],
            [
                // 36
                'kompetensi_id' => 17,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengidentifikasi konsep medan magnet dan gaya Lorentz.',
                'status' => 'aktif'
            ],
            [
                // 37
                'kompetensi_id' => 18, // Genap || Pemodel, Eksperimen dan Aplikasi Fisika
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menjelaskan karakteristik gelombang elektromagnetik.',
                'status' => 'aktif'
            ],
            [
                // 38
                'kompetensi_id' => 18,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Merancang proyek atau eksperimen fisika berbasis masalah.',
                'status' => 'aktif'
            ],



            // Ekonomi (F)
            // Ekonomi (F) (11)
            [
                // 39
                'kompetensi_id' => 19, // Ganjil || Konsep dasar ekonomi & permasalahannya
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menganalisis konsep kelangkaan dan kebutuhan manusia dalam kehidupan sehari-hari.',
                'status' => 'aktif'
            ],
            [
                // 40
                'kompetensi_id' => 19,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menjelaskan konsep pilihan dan biaya peluang dalam pengambilan keputusan ekonomi.',
                'status' => 'aktif'
            ],
            [
                // 41
                'kompetensi_id' => 20, // Genap || Analisis kegiatan dan pelaku ekonomi
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengidentifikasi peran pelaku ekonomi dalam kegiatan produksi, distribusi, dan konsumsi.',
                'status' => 'aktif'
            ],
            [
                // 42
                'kompetensi_id' => 20,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis interaksi antar pelaku ekonomi dalam sistem perekonomian sederhana.',
                'status' => 'aktif'
            ],

            // Ekonomi (F) (12)
            [
                // 43
                'kompetensi_id' => 21, // Ganjil || Ekonomi Makro dan Kebijakan Pemerintah     
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menjelaskan konsep pendapatan nasional, inflasi, dan pengangguran.',
                'status' => 'aktif'
            ],
            [
                // 44
                'kompetensi_id' => 21,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis peran kebijakan fiskal dan moneter dalam mengatasi permasalahan ekonomi.',
                'status' => 'aktif'
            ],
            [
                // 45
                'kompetensi_id' => 22, // Genap || Analisis Pembangunan Ekonomi dan Tantangan Global
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menganalisis indikator dan tujuan pembangunan ekonomi.',
                'status' => 'aktif'
            ],
            [
                // 46
                'kompetensi_id' => 22,
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengevaluasi dampak globalisasi dan perdagangan internasional terhadap perekonomian Indonesia.',
                'status' => 'aktif'
            ],



            // Bahasa (F)
            // B. Jepang (F) (11)
            [
                // 47
                'kompetensi_id' => 23, // Ganjil || Pemahaman Dasar Bahasa Jepang
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami dan menggunakan ungkapan perkenalan diri, salam, dan identitas pribadi dalam Bahasa Jepang secara lisan dan tulisan.',
                'status' => 'aktif'
            ],
            [
                // 48
                'kompetensi_id' => 23,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menggunakan kosakata dan pola kalimat sederhana untuk menyampaikan informasi tentang aktivitas sehari-hari.',
                'status' => 'aktif'
            ],
            [
                // 49
                'kompetensi_id' => 24, // Genap || Pemahaman Struktur Bahasa Jepang
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Menggunakan pola kalimat dasar Bahasa Jepang (partikel, kata kerja dasar) dalam kalimat sederhana.',
                'status' => 'aktif'
            ],
            [
                // 50
                'kompetensi_id' => 24,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Mengidentifikasi unsur budaya Jepang yang berkaitan dengan kebiasaan berkomunikasi dan kehidupan sehari-hari.',
                'status' => 'aktif'
            ],     

            // B. Jepang (F) (12)
            [
                // 47
                'kompetensi_id' => 25, // Ganjil || Penggunaan Bahasa Jepang untuk Komunikasi Fungsional
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Mengungkapkan pengalaman dan rencana sederhana menggunakan pola kalimat Bahasa Jepang yang sesuai.',
                'status' => 'aktif'
            ],
            [
                // 48
                'kompetensi_id' => 25,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Melakukan percakapan sederhana terkait kegiatan sekolah dan kehidupan sehari-hari dengan lafal dan intonasi yang tepat.',
                'status' => 'aktif'
            ],
            [
                // 49
                'kompetensi_id' => 26, // Genap || Pemahaman teks sederhana
                'urutan' => 1,
                'tujuan_pembelajaran' => 'Memahami isi teks sederhana (dialog, pengumuman, deskripsi singkat) dalam Bahasa Jepang.',
                'status' => 'aktif'
            ],
            [
                // 50
                'kompetensi_id' => 26,                
                'urutan' => 2,
                'tujuan_pembelajaran' => 'Menganalisis nilai budaya Jepang yang tercermin dalam teks dan praktik komunikasi sehari-hari.',
                'status' => 'aktif'
            ],            
        ]);

        // guru (tiap awal tahun akademik/ganjil)
        /**
         * 🎯✅ spa: Index, Show, Diterima, Ditolak
         */
        AlurTujuanPembelajaran::insert([  
            //   MTK (E) (10)
            [
                // 1
                'atp_master_id' => 1,
                'guru_id' => 9, // Guru MTK
                'tahun_akademik_id' => 1, // 2013/2024
                'semester_id' => 1, // Ganjil                
                'approval_status' => 'disetujui',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => null,
                'is_locked' => true,                
            ],            
            [
                // 2
                'atp_master_id' => 2,
                'guru_id' => 9, // Guru MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil                
                'approval_status' => 'disetujui',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => null,
                'is_locked' => true,                
            ],
            [
                // 3
                'atp_master_id' => 3,
                'guru_id' => 9, // Guru MTK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,   
                'approval_status' => 'disetujui',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                // 4
                'atp_master_id' => 4,
                'guru_id' => 9,
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap  
                'approval_status' => 'diajukan',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                // 5
                'atp_master_id' => 5,
                'guru_id' => 9,
                'tahun_akademik_id' => 2,
                'semester_id' => 2,   
                'approval_status' => 'ditolak',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => 'Semester genap belum dimulai',
                'is_locked' => false,                
            ],
            [
                // 6
                'atp_master_id' => 6,
                'guru_id' => 9,
                'tahun_akademik_id' => 2,
                'semester_id' => 2,   
                'approval_status' => 'disetujui',
                'approved_by' => 1,
                'approved_at' => '2026-01-14 21:35:51',
                'catatan_penolakan' => null,
                'is_locked' => true,                
            ],                        
        ]);        

        // modul_ajar

        // asesmen

        /**
         * 🎯✅ spa: CRUD    
         */
        Rombel::insert([
            // X-1
            [
                // 1
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-A-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],
            [
                // 2
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-B-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                    
            [
                // 3
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-C-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],           
            
            // XI-1
            [
                // 4
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-A-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                        
            [
                // 5
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-B-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                                     
            [
                // 6
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-C-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                                     

            // XII-1
            [
                // 7
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-A-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                        
            [
                // 8
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-B-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                        
            [
                // 9
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-C-1',
                'jurusan_id' => 1,
                'status' => 'aktif',
            ],                        

            // IPS
            // X 2
            [
                // 10
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-A-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],
            [
                // 11
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-B-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                    
            [
                // 12
                'kelas_id' => 1, // X                
                'nama_rombel' => 'X-C-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                    
            
            // XI 2
            [
                // 13
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-A-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    
            [
                // 14
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-B-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    
            [
                // 15
                'kelas_id' => 2, // XI                
                'nama_rombel' => 'XI-C-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    

            // XII IPS
            [
                // 16
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-A-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    
            [
                // 17
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-B-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    
            [
                // 18
                'kelas_id' => 3, // XII                
                'nama_rombel' => 'XII-C-2',
                'jurusan_id' => 2,
                'status' => 'aktif',
            ],                                    

            // X ARSIP
            [
                // 19
                'kelas_id' => 1, // X
                'nama_rombel' => 'X-A-IPS-ARSIP',
                'jurusan_id' => 2,
                'status' => 'arsip',
            ],                        
        ]);

        // 🎯✅ spa        
        WaliRombel::insert([
            [
                'wali_rombel_id' => 9, // Guru MTK
                'rombel_id' => 2, // X-B-1
                'tahun_akademik_id' => 1, // 2023/2024
            ],
            [
                'wali_rombel_id' => 7, // Guru Indon
                'rombel_id' => 5, // XI-B-1
                'tahun_akademik_id' => 2, // 2025
            ],

            [
                'wali_rombel_id' => 7, // Guru Indon
                'rombel_id' => 1, // X-A-1
                'tahun_akademik_id' => 1, // 2013
            ],
            [
                'wali_rombel_id' => 9, // Guru MTK
                'rombel_id' => 14, // XI-B-2
                'tahun_akademik_id' => 2, // 2025
            ],
             
        ]);


        // 🎯✅ spa: Create dan Delete
        SiswaRombel::insert([
            // XII (24/25)
            [
                'siswa_id' => 8, // Devi
                'rombel_id' => 7, // XII-A-1
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'lulus',
                'catatan' => 'Peserta sudah lulus'
            ],            

            // XI (24/25)
            [
                'siswa_id' => 1, // Bagas
                'rombel_id' => 5, // XI-A-1
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'berhenti',
                'catatan' => 'Siswa berhenti sekolah pada pertengahan tahun 2024'
            ],
            [
                'siswa_id' => 2, // Winton
                'rombel_id' => 5, // XI-B-1
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'pindah',
                'catatan' => 'Pindah ke jurusan IPS',
            ],   
            [
                'siswa_id' => 4, // Rehan
                'rombel_id' => 13, // XI-A-2
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'diberhentikan',
                'catatan' => 'Siswa terkena DO oleh pihak sekolah pada tahun 2024',
            ],   
            [
                'siswa_id' => 5, // Yuli
                'rombel_id' => 14, // XI-B-2
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'pindah',
                'catatan' => 'Siswa pindah sekolah pada tahun 2024'
            ],          
            [
                'siswa_id' => 7, // Selma
                'rombel_id' => 14, // XI-B-2
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => 'pindahan',
                'catatan' => 'Siswa bergabung pada pertengahan tahun 2024'
            ],          
            
            // X (24/25)
            [
                'siswa_id' => 3, // Sanita
                'rombel_id' => 1, // X-A-1
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => null,
                'catatan' => null
            ],                       
            [
                'siswa_id' => 6, // Danang
                'rombel_id' => 11, // X-B-2
                'tahun_akademik_id' => 2, // 2024/2025
                'status_akhir' => null,
                'catatan' => null
            ],                       
            
            // X (13/24)
            [
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1, // X-A-1
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'naik_kelas',
                'catatan' => 'Naik ke kelas XI'
            ],                      
            [
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-A-1
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'naik_kelas',
                'catatan' => 'Naik ke kelas XI'
            ],            
            [
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B-1
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'tinggal_kelas',
                'catatan' => 'Belum memenuhi syarat untuk naik ke kelas XI'
            ],                      
            [
                'siswa_id' => 4, // Rehan
                'rombel_id' => 10, // X-A-2
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'naik_kelas',
                'catatan' => 'Naik ke kelas XI',
            ],              
            [
                'siswa_id' => 5, // Yuli
                'rombel_id' => 10, // X-A-2
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'naik_kelas',
                'catatan' => 'Naik ke kelas XI',
            ],              
            [
                'siswa_id' => 6, // Danang
                'rombel_id' => 11, // X-B-2
                'tahun_akademik_id' => 1, // 2013/2024
                'status_akhir' => 'tinggal_kelas',
                'catatan' => 'Belum memenuhi syarat untuk naik ke kelas XI'
            ],
        ]);

        /** 
         * 🎯✅ spa: CRUD
         * tu: GET, SHOW
         * guru: GET/SHOW
         * Kepsek: GET, SHOW
         * */ 
        JadwalPelajaran::insert([            
            // X-B-1
            // Ganjil
            [
                // 1
                'kurikulum_mata_pelajaran_id' => 6, // K13 - MTK
                'tahun_akademik_id' => 1, // 2023/2024
                'semester_id' => 1, // Ganjil
                'hari' => 'Senin',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 2
                'kurikulum_mata_pelajaran_id' => 4, // K13 - Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Senin',
                'guru_id' => 7, // Guru Indo
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 3
                'kurikulum_mata_pelajaran_id' => 2, // K13 - PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Selasa',
                'guru_id' => 5, // Guru PAI
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:00',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 4
                'kurikulum_mata_pelajaran_id' => 3, // K13 - PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Selasa',
                'guru_id' => 6, // Guru PPKn
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],                    
            [
                // 5
                'kurikulum_mata_pelajaran_id' => 5, // merdeka - Inggris
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Rabu',
                'guru_id' => 8, // Guru Inggris
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 6
                'kurikulum_mata_pelajaran_id' => 10, // merdeka - Informatika
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Rabu',
                'guru_id' => 13, // Guru Informatika
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 7
                'kurikulum_mata_pelajaran_id' => 7, // merdeka - Sejarah
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Kamis',
                'guru_id' => 10, // Guru Sejarah
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],    
            [
                // 8
                'kurikulum_mata_pelajaran_id' => 9, // merdeka - Seni Budaya
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Kamis',
                'guru_id' => 12, // Guru Senbud
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 9
                'kurikulum_mata_pelajaran_id' => 8, // merdeka - PJOK
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Jumat',
                'guru_id' => 11, // Guru PJOK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 10
                'kurikulum_mata_pelajaran_id' => 11, // merdeka - Projek P5
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
                'hari' => 'Jumat',
                'guru_id' => 15, // Guru P5
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],                                                               

            // Genap
            [
                // 11
                'kurikulum_mata_pelajaran_id' => 6, // K13 - MTK
                'tahun_akademik_id' => 1, // 2024/2025
                'semester_id' => 2, // Genap
                'hari' => 'Senin',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 12
                'kurikulum_mata_pelajaran_id' => 4, // K13 - Indo
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Senin',
                'guru_id' => 7, // Guru Indo
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 13
                'kurikulum_mata_pelajaran_id' => 2, // K13 - PAI
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Selasa',
                'guru_id' => 5, // Guru PAI
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:00',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 14
                'kurikulum_mata_pelajaran_id' => 3, // K13 - PPKn
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Selasa',
                'guru_id' => 6, // Guru PPKn
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],                    
            [
                // 15
                'kurikulum_mata_pelajaran_id' => 5, // merdeka - Inggris
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Rabu',
                'guru_id' => 8, // Guru Inggris
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 16
                'kurikulum_mata_pelajaran_id' => 10, // merdeka - Informatika
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Rabu',
                'guru_id' => 13, // Guru Informatika
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 17
                'kurikulum_mata_pelajaran_id' => 7, // merdeka - Sejarah
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Kamis',
                'guru_id' => 10, // Guru Sejarah
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],    
            [
                // 18
                'kurikulum_mata_pelajaran_id' => 9, // merdeka - Seni Budaya
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Kamis',
                'guru_id' => 12, // Guru Senbud
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 19
                'kurikulum_mata_pelajaran_id' => 8, // merdeka - PJOK
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Jumat',
                'guru_id' => 11, // Guru PJOK
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 20
                'kurikulum_mata_pelajaran_id' => 11, // merdeka - Projek P5
                'tahun_akademik_id' => 1,
                'semester_id' => 2,
                'hari' => 'Jumat',
                'guru_id' => 15, // Guru P5
                'rombel_id' => 2, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],     

            // XI-B-1
            // Ganjil
            [
                // 21
                'kurikulum_mata_pelajaran_id' => 16, // K13 - MTK
                'tahun_akademik_id' => 2, // 2024/2025
                'semester_id' => 3, // Ganjil
                'hari' => 'Senin',
                'guru_id' => 9, // Guru MTK
                'rombel_id' => 5, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 22
                'kurikulum_mata_pelajaran_id' => 14, // K13 - Indo
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Senin',
                'guru_id' => 7, // Guru Indo
                'rombel_id' => 5, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 23
                'kurikulum_mata_pelajaran_id' => 12, // K13 - PAI
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Selasa',
                'guru_id' => 5, // Guru PAI
                'rombel_id' => 5, // X-B-1
                'jam_mulai' => '07:00',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],        
            [
                // 24
                'kurikulum_mata_pelajaran_id' => 13, // K13 - PPKn
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Selasa',
                'guru_id' => 6, // Guru PPKn
                'rombel_id' => 5, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],                    
            [
                // 25
                'kurikulum_mata_pelajaran_id' => 15, // merdeka - Inggris
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Rabu',
                'guru_id' => 8, // Guru Inggris
                'rombel_id' => 5, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 26
                'kurikulum_mata_pelajaran_id' => 20, // merdeka - Informatika
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Rabu',
                'guru_id' => 13, // Guru Informatika
                'rombel_id' => 5, // X-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 27
                'kurikulum_mata_pelajaran_id' => 17, // merdeka - Sejarah
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Kamis',
                'guru_id' => 10, // Guru Sejarah
                'rombel_id' => 5, // X-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],    
            [
                // 28
                'kurikulum_mata_pelajaran_id' => 32, // Fisika
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Kamis',
                'guru_id' => 16, // Guru Fisika
                'rombel_id' => 5, // XI-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 29
                'kurikulum_mata_pelajaran_id' => 50, // Bahasa Jepang
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Jumat',
                'guru_id' => 20, // Guru Jepang
                'rombel_id' => 5, // XI-B-1
                'jam_mulai' => '07:30',
                'jam_selesai' => '08:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 30
                'kurikulum_mata_pelajaran_id' => 54, // Bahasa Jerman
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
                'hari' => 'Jumat',
                'guru_id' => 21, // Guru Jerman
                'rombel_id' => 5, // XI-B-1
                'jam_mulai' => '08:30',
                'jam_selesai' => '10:00',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],                                                                                                                 
        ]);              

        /**
         * 🎯✅ spa: CRUD
         * kepsek: GET, SHOW
         * guru: CREATE
         */
        AbsensiPegawai::insert([
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2014-02-27',
                'status' => 'hadir',
                'tahun_akademik_id' => 1,  // 13/24
                'semester_id' => 1, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2025-05-24',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 3, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2025-05-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 3, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2025-05-26',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 3, // Ganjil
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2026-01-23',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 2, // Genap
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2026-01-24',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 2, // Genap
            ],
            [
                'guru_id' => 9, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2026-01-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 2, // Genap
            ],
            // ---------------------------------------------------
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2, // Indon
                'hari' => '2025-05-24',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2025-05-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2025-05-26',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2, // Indon
                'hari' => '2026-01-01',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 2,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2026-01-02',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 2,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2026-01-03',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 2,
            ],            
        ]);

        /**
         * 🎯✅ spa: CRUD
         * kepsek: GET, SHOW
         * guru: CREATE
         */
        AbsensiPelajaran::insert([
            [
                // 1
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | X-A      
                'hari' => '2023-05-25',
                'status' => 'hadir',                
                'tahun_akademik_id' => 1, // 13/24
                'semester_id' => 1 // Ganjil
            ],
            // ---------------------            
            // Guru MTK
            [
                // 2
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | X-A-1
                'hari' => '2024-05-05', // Senin
                'status' => 'hadir',                
                'tahun_akademik_id' => 1, // 13/24
                'semester_id' => 1 // Ganjil
            ],
            [
                // 3
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2024-05-12',
                'status' => 'hadir',                
                'tahun_akademik_id' => 1,
                'semester_id' => 1 // Ganjil
            ],
            [
                // 4
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2024-05-19',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 1,
                'semester_id' => 1 // Ganjil
            ],
            [
                // 5
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 11,
                'hari' => '2025-05-05',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 2  // Genap
            ],
            [
                // 6
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 11,
                'hari' => '2025-01-02',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 2  // Genap
            ],
            [
                // 7
                'guru_pengajar_id' => 9, /// Guru MTK
                'jadwal_pelajaran_id' => 8,
                'hari' => '2024-01-09',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 2  // Genap
            ],
            
            // Guru Indo
            [
                // 8
                'guru_pengajar_id' => 7, /// Guru Indo
                'jadwal_pelajaran_id' => 2, // MTK | 13/24 | Ganjil | X-A-1
                'hari' => '2024-05-05', // Senin
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 1, // 13/24
                'semester_id' => 1 // Ganjil
            ],
            [
                // 3
                'guru_pengajar_id' => 7, /// Guru Indo
                'jadwal_pelajaran_id' => 2,
                'hari' => '2024-05-12',
                'status' => 'hadir',                
                'tahun_akademik_id' => 1,
                'semester_id' => 1 // Ganjil
            ],
            [
                // 4
                'guru_pengajar_id' => 7, /// Guru Indo
                'jadwal_pelajaran_id' => 2,
                'hari' => '2024-05-19',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 1,
                'semester_id' => 1 // Ganjil
            ],
            [
                // 5
                'guru_pengajar_id' => 7, /// Guru Indo
                'jadwal_pelajaran_id' => 2,
                'hari' => '2025-05-05',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 2  // Genap
            ],
            [
                // 6
                'guru_pengajar_id' => 7, /// Guru Indo
                'jadwal_pelajaran_id' => 2,
                'hari' => '2025-01-02',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 2  // Genap
            ],
            [
                // 7
                'guru_pengajar_id' => 7, /// Guru Indo
                'jadwal_pelajaran_id' => 2,
                'hari' => '2024-01-09',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 2  // Genap
            ],
        ]);

        /**
         * 🎯✅ spa: CRUD
         * kepsek: GET, SHOW
         * guru: CRUD
         */
        AbsensiSiswa::insert([
            [
                // 1
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 1, // MTK
                'hari' => '2024-12-02',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 2
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // XI-A-1
                'jadwal_pelajaran_id' => 2, // Indonesia
                'hari' => '2024-12-02',
                'status' => 'alfa',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 3
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 3, // PAI
                'hari' => '2024-12-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 4
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 4, // PPKn
                'hari' => '2024-12-03',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 5
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 5, // Inggris
                'hari' => '2024-12-04',
                'status' => 'izin',
                'bukti' => 'izin.jpg',                                
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 6
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 6, // Informatika
                'hari' => '2024-12-04',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 7
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 7, // Sejarah
                'hari' => '2024-12-05',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 8
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 8, // Seni Budaya
                'hari' => '2024-05-05',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 9, // PJOK
                'hari' => '2024-12-06',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 10, // P5
                'hari' => '2024-12-06',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],
            // -------------------------------------------------------------      
            [
                // 1
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 1, // MTK
                'hari' => '2024-12-09',
                'status' => 'alfa',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 2
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // XI-A-1
                'jadwal_pelajaran_id' => 2, // Indonesia
                'hari' => '2024-12-09',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 3
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 3, // PAI
                'hari' => '2024-12-10',
                'status' => 'alfa',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 4
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 4, // PPKn
                'hari' => '2024-12-10',
                'status' => 'izin',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 5
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 5, // Inggris
                'hari' => '2024-12-11',
                'status' => 'izin',
                'bukti' => 'izin.jpg',                                
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 6
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 6, // Informatika
                'hari' => '2024-12-11',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 7
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 7, // Sejarah
                'hari' => '2024-12-12',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 8
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 8, // Seni Budaya
                'hari' => '2024-12-12',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 9, // PJOK
                'hari' => '2024-12-13',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 10, // P5
                'hari' => '2024-12-13',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],                   
            
            // Genap
            [
                // 1
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 1, // MTK
                'hari' => '2025-01-13',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 2
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // XI-A-1
                'jadwal_pelajaran_id' => 2, // Indonesia
                'hari' => '2025-01-13',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 3
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 3, // PAI
                'hari' => '2025-01-14',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 4
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 4, // PPKn
                'hari' => '2025-01-14',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 5
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 5, // Inggris
                'hari' => '2025-01-15',
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 6
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 6, // Informatika
                'hari' => '2025-01-15',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 7
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 7, // Sejarah
                'hari' => '2025-01-16',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 8
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 8, // Seni Budaya
                'hari' => '2025-01-16',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 9, // PJOK
                'hari' => '2025-01-17',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 10, // P5
                'hari' => '2025-01-17',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],
            // -------------------------------------------------------------      
            [
                // 1
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 1, // MTK
                'hari' => '2025-01-20',
                'status' => 'alfa',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 2
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // XI-A-1
                'jadwal_pelajaran_id' => 2, // Indonesia
                'hari' => '2025-01-20',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 3
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 3, // PAI
                'hari' => '2025-01-21',
                'status' => 'alfa',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 4
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 4, // PPKn
                'hari' => '2025-01-21',
                'status' => 'alfa',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 5
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 5, // Inggris
                'hari' => '2025-01-22',
                'status' => 'izin',
                'bukti' => 'izin.jpg',                                
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 6
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 6, // Informatika
                'hari' => '2025-01-22',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 7
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 7, // Sejarah
                'hari' => '2025-01-23',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 8
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 8, // Seni Budaya
                'hari' => '2025-01-23',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 9, // PJOK
                'hari' => '2025-01-24',
                'status' => 'alfa',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],            
            [
                // 9
                'siswa_id' => 2, // Winton
                'rombel_id' => 1,  // X-A-1
                'jadwal_pelajaran_id' => 10, // P5
                'hari' => '2025-01-24',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 2, // Genap
            ],                   
                      
        ]);        

        /**
         * 🎯✅ SPA: CRUD
         *  */ 
        Ekstrakurikuler::insert([
            [
                'nama_ekstrakurikuler' => 'Pramuka',                
                'anggaran' => 1500000,
                'status' => 'wajib',
                'status_aktif' => 'aktif',
            ],
            [
                'nama_ekstrakurikuler' => 'Paskibra',                
                'anggaran' => 2000000,
                'status' => 'pilihan',
                'status_aktif' => 'aktif',
            ],
            [
                'nama_ekstrakurikuler' => 'Tari',                
                'anggaran' => 5000000,
                'status' => 'jurusan',
                'status_aktif' => 'aktif',
            ],
            [
                'nama_ekstrakurikuler' => 'Futsal',                
                'anggaran' => 2000000,
                'status' => 'pilihan',
                'status_aktif' => 'arsip',
            ],
        ]);

        // 🎯✅ seed pembina ekskul
        PembinaEkskul::insert([
            [
                'pembina_id' => 9, // guru MTK
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 1, // 2023/2024
            ],
            [
                'pembina_id' => 9, // guru MTK
                'ekstrakurikuler_id' => 2, // Paskib
                'tahun_akademik_id' => 2, // 2024/2025
            ],

            [
                'pembina_id' => 7, // Guru Indon
                'ekstrakurikuler_id' => 2, // PASKIB
                'tahun_akademik_id' => 1, // 2013/2024
            ],
            [
                'pembina_id' => 3, // staff tu
                'ekstrakurikuler_id' => 3, // Tari
                'tahun_akademik_id' => 2, // 2024/2025
            ],            
        ]);

        // 🎯✅ seed pelatih ekskul
        PelatihEkskul::insert([
            [
                'pelatih_id' => 9, // Guru MTK
                'ekstrakurikuler_id' => 1, // pramuka
                'tahun_akademik_id' => 1, // 2013/2024
            ],
            [
                'pelatih_id' => 9, // Guru MTK
                'ekstrakurikuler_id' => 3, // Tari
                'tahun_akademik_id' => 2, // 2024/2025
            ],

            [
                'pelatih_id' => 3, // Guru Staff TU
                'ekstrakurikuler_id' => 2, // paskibra
                'tahun_akademik_id' => 1, // 2013/2024
            ],            
        ]);                    

        // 🎯 Seed Siswa daftar ke ekstrakurikuler
        EkskulSiswaPivot::insert([
            [
                'siswa_id' => 1, // Bagas
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 1, // 13
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 1, // Bagas
                'ekstrakurikuler_id' => 2, // Paskibra
                'tahun_akademik_id' => 1, // 13
                'sikap' => 'Sangat Baik',
                'status' => 'Aktif'
            ],

            [
                'siswa_id' => 2, // Winton
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 1, // 13
                'sikap' => 'Baik',
                'status' => 'Cukup Aktif'
            ],
            [
                'siswa_id' => 2, // Winton
                'ekstrakurikuler_id' => 2, // Paskibra
                'tahun_akademik_id' => 1, // 13
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 2, // Winton
                'ekstrakurikuler_id' => 2, // Paskibra
                'tahun_akademik_id' => 2, // 24
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 3, // Sanita
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 2,
                'sikap' => 'Kurang',
                'status' => 'Tidak Aktif'
            ],            
        ]);

        /**
         * 🎯✅ spa: CRUD
         * kepsek: GET, SHOW
         * guru
         */
        Prestasi::insert([
            [
                'siswa_id' => 1, // Bagas                                
                'tahun_akademik_id' => 2, // 2024/2025 (Merdeka)
                'prestasi_diraih' => 'Juara 2 lomba renang tingkat sekolah',
            ],
            [
                'siswa_id' => 2, // Winton                                
                'tahun_akademik_id' => 1,
                'prestasi_diraih' => 'Rangking satu umum angkatan 2021',
            ],
            [
                'siswa_id' => 2, // Winton                                
                'tahun_akademik_id' => 2,
                'prestasi_diraih' => 'Juara lomba paskibra tingkat sekolah',
            ],
            [
                'siswa_id' => 2, // Winton                                
                'tahun_akademik_id' => 2,
                'prestasi_diraih' => 'Juara 1 lomba makan',
            ],
            [
                'siswa_id' => 3, // Sanita                                
                'tahun_akademik_id' => 1,
                'prestasi_diraih' => 'Rangking satu kelas',
            ]
        ]);
        
        /**
         * 🎯 spa: CRUD
         * kepsek:
         * guru: CRUD
         */
        // DataNilaiSiswa::insert([
        //     [
        //         'siswa_id' => 1, // Bagas jurusan IPA
        //         'kurikulum_mata_pelajaran_id' => 2, // Fisika jurusan IPA                           
        //         'semester_id' => 1, // Fisika jurusan IPA           
        //         'guru_id' => 5, // Guru IPA
        //         'point_absensi' => 78.5,
        //         'point_tugas' => 80.0,
        //         'point_uts' => 90.5,
        //         'point_uas' => 88.5,                
        //         'sikap' => 'Cukup'
        //     ],
        //     [
        //         'siswa_id' => 2, // Winton
        //         'kurikulum_mata_pelajaran_id' => 3, // B.Indo jurusan IPS                
        //         'semester_id' => 1, // B.Indo jurusan IPS
        //         'guru_id' => 6, // Guru IPS
        //         'point_absensi' => 90,
        //         'point_tugas' => 80,
        //         'point_uts' => 70,
        //         'point_uas' => 88,                
        //         'sikap' => 'Baik'
        //     ],
        //     [
        //         'siswa_id' => 2, // Winton
        //         'kurikulum_mata_pelajaran_id' => 4, // Sunda jurusan IPS                
        //         'semester_id' => 2, // Sunda jurusan IPS
        //         'guru_id' => 6, // Guru IPS
        //         'point_absensi' => 90,
        //         'point_tugas' => 90,
        //         'point_uts' => 90,
        //         'point_uas' => 90,                
        //         'sikap' => 'Sangat Baik'
        //     ]
        // ]);

        /**
         * 🎯 SPA: CRUD
         */
        // rapor_nilai_siswa

        /**
         * 🎯 SPA: CRUD
         */
        // projek_p5

        /**
         * 🎯 SPA: CRUD
         */
        // data_nilai_p5

        /**
         * 🎯 SPA: CRUD
         */
        // rapor

        /** 
         * 🎯 SPA: CRUD
         * tu: CRUD
         * */ 
        DataBerkas::insert([
            [
                'nama_berkas' => 'Bayaran SPP Budi',
                'berkas' => 'berkas-budi.jpg',
                'tahun_akademik_id' => 2, // 2024/2025
                'semester_id' => 2 // Genap
            ],
        ]);

        /**
         * SPA: CRUD
         * tu: CRUD
         * Kepsek: GET, SHOW
         *  */ 
        Keuangan::insert([
            [
                'nama_akun' => 'TU',
                'debit' => 0, // nambah
                'kredit' => 20000, // ngurang
                'keterangan' => 'Beli ATK'
            ],
            [
                'nama_akun' => 'Rina',
                'debit' => 50000,
                'kredit' => 0,
                'keterangan' => 'Bayaran SPP'
            ],
        ]);

        /**
         * 🎯 SPA: CRUD
         */
        // jurnal_kbm

        /**
         * 🎯 SPA: CRUD
         */
        // forum_diskusi

        /**
         * 🎯 SPA: CRUD
         */
        // lms

        /** 
         * 🎯 SPA: CURD
         */
        // Kompetensi Inti

    }
}