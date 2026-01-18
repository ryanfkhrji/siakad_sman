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
use App\Models\JadwalPelajaran;
use App\Models\Kurikulum;
use App\Models\KurikulumMataPelajaran;
use App\Models\Kompetensi;
use App\Models\AlurTujuanPembelajaran;
use App\Models\Ekstrakurikuler;
use App\Models\PembinaEkskul;
use App\Models\PelatihEkskul;
use App\Models\Siswa;
use App\Models\SiswaRombel;
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
                'Keterangan' => 'Silakan isi sendiri'
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
                'Keterangan' => 'Silakan isi sendiri'
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
            'keterangan' => 'Buka sampai jam 8 malam'
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
            'keterangan' => 'Tutup saat jam makan siang'
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
            'keterangan' => 'Khusus praktik dan ujian'
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
                'nama' => 'Staff Kebersihan Pengajar Pramuka',
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
                'nama' => 'Guru MTK',
                'email' => 'gurumtk@gmail.com',
                'nip' => '123454',
                'nuptk' => '0123454',
                'keterangan' => 'Guru MTK',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                'nama' => 'Guru Indo',
                'email' => 'guruindo@gmail.com',
                'nip' => '123455',
                'nuptk' => '0123455',
                'keterangan' => 'Guru Indo',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
                'status' => 'aktif',
            ],
            [
                'nama' => 'Guru Sunda',
                'email' => 'gurusunda@gmail.com',
                'nip' => '123456',
                'nuptk' => '0123456',
                'keterangan' => 'Guru Sunda',
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
                'nisn' => '123451',
                'nama' => 'Bagas',
                'nis' => '123451',                
                'email' => 'bagas@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
            ],
            [
                'nisn' => '123452',
                'nama' => 'Winton',
                'nis' => '123452',                
                'email' => 'winton@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
            ],
            [
                'nisn' => '123453',
                'nama' => 'Sanita',
                'nis' => '123453',                
                'email' => 'sanita@gmail.com',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
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
                'status' => 'aktif',
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
                'kode_kelas' => 'K12-IPA',                
                'tingkat' => 11,                
                'jurusan_id' => null, // IPA                                                                            
            ],
            [
                'nama_kelas' => 'XI IPS',
                'kode_kelas' => 'K22.IPS',                
                'tingkat' => 11,                
                'jurusan_id' => null, // IPS                                                                            
            ],
            [
                'nama_kelas' => 'XII',
                'kode_kelas' => 'K11-IPA',                
                'tingkat' => 10,                
                'jurusan_id' => 1, // IPA                                                                            
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
                'tipe' => 'K13',
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
            [
                'nama_pelajaran' => 'Matematika',
                'kode_mapel_diknas' => '013',                
                'status' => 'aktif',                
            ],
            [
                'nama_pelajaran' => 'Bahasa Indonesia',
                'kode_mapel_diknas' => '156',                
                'status' => 'aktif',                
            ],
            [
                'nama_pelajaran' => 'Bahasa Sunda',
                'kode_mapel_diknas' => '224',                
                'status' => 'aktif',                
            ],
        ]);  

        /**
         * 🎯✅ spa: CRUD
         * tu: CRUD
         * 
         */
        TahunAkademik::insert([
            [
                'tahun_akademik' => '2013/2023',                
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
                'status' => 'arsip'
            ],
            [
                'tahun_akademik_id' => 2,
                'semester' => 'Genap',
                'status' => 'aktif'
            ],
        ]);
    
        /**
         * Dibuat tiap tahun
         * 🎯✅ spa: CRUD
         */
        KurikulumMataPelajaran::insert([
            [
                'kurikulum_id' => 2, // Kurtilas
                'mata_pelajaran_id' => 1, // MTK
                'jurusan_pelajaran_id' => 1, // IPA
                'tahun_akademik_id' => 1, // 2013/2023
                'tingkat' => 11,
                'nilai_kkm' => 75.55,
                'status_mata_pelajaran' => 'jurusan',                
            ],
            [
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 1, // MTK
                'jurusan_pelajaran_id' => null,
                'tahun_akademik_id' => 2, // 2024/2025
                'tingkat' => 10,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
            ],            
            [
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 2, // B. Indo
                'jurusan_pelajaran_id' => null,
                'tahun_akademik_id' => 2,
                'tingkat' => 10,
                'nilai_kkm' => 80,
                'status_mata_pelajaran' => 'wajib',                
            ],            
            [
                'kurikulum_id' => 3, // Merdeka
                'mata_pelajaran_id' => 3, // B. Sunda
                'jurusan_pelajaran_id' => null,
                'tahun_akademik_id' => 2,
                'tingkat' => 10,
                'nilai_kkm' => 70,
                'status_mata_pelajaran' => 'pilihan',                
            ]
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
                'mata_pelajaran_id' => 1, // Matematika
                'judul_kompetensi' => 'Memahami konsep persamaan linear satu variabel',
                'jenis' => 'KD',                
                'kode' => 'KD-1.1',
                'tingkat' => '10',
                'aspek' => 'pengetahuan',
                'fase' => null,
                'deskripsi' => 'Memahami konsep persamaan linear satu variabel dan penerapannya di kehidupan sehari-hari',                
                'status' => 'arsip'
            ],
            [
                // 2
                'kurikulum_id' => 2, // K13
                'mata_pelajaran_id' => 1, // Matematika
                'judul_kompetensi' => 'Menyelesaikan persamaan linear satu variabel',
                'jenis' => 'KD',                
                'kode' => 'KD-1.2',
                'tingkat' => '10',
                'aspek' => 'keterampilan',
                'fase' => null,
                'deskripsi' => 'Menyelesaikan masalah yanng berkaitan dengan persamaan satu variabel',                
                'status' => 'arsip'
            ],
            [
                // 3
                'kurikulum_id' => 2, // K13
                'mata_pelajaran_id' => 1, // Matematika
                'judul_kompetensi' => 'Menunjukkan sikap teliti dan jujur dalam menyelesaikan masalah matematika',
                'jenis' => 'KD',
                'kode' => 'KD-1.3',
                'tingkat' => '10',
                'aspek' => 'sikap',
                'fase' => null,
                'deskripsi' => 'Menunjukkan sikap teliti, jujur, dan bertanggung jawab dalam proses pembelajaran matematika',                
                'status' => 'arsip'
            ],            
            [
                // 4
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 1, // Matematika
                'judul_kompetensi' => 'Bernalar menggunakan persamaan dan pertidaksamaan linear',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-E1',
                'tingkat' => null,
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu bernalar dan memecahkan masalah kontekstual matematika',                
                'status' => 'aktif'
            ],
            [
                // 5
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 1, // Matematika
                'judul_kompetensi' => 'Menganalisis hubungan antar variabel dalam bentuk aljabar',
                'jenis' => 'CP',                
                'kode' => 'CP-MAT-E2',
                'tingkat' => null,
                'aspek' => null,
                'fase' => 'E',
                'deskripsi' => 'Peserta didik mampu menganalisis hubungan antar variabel dan menyelesaikannya',                
                'status' => 'aktif'
            ],
            [
                // 6
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 2, // Indo
                'judul_kompetensi' => 'Menulis sesuai KBBI',
                'jenis' => 'CP',
                'kode' => 'CP-IND-F1',
                'tingkat' => null,
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu menulis sesuai KBBI dan menerapkannya dalam kehidupan sehari-hari',                
                'status' => 'aktif'
            ],            
            [
                // 7
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 2, // Indo
                'judul_kompetensi' => 'Memahami tanda baca pada kalimat',
                'jenis' => 'CP',
                'kode' => 'CP-IND-F2',
                'tingkat' => null,
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu membedakan tanda baca beserta kegunaannya',                
                'status' => 'aktif'
            ],            
            [
                // 8
                'kurikulum_id' => 3, // MERDEKA
                'mata_pelajaran_id' => 2, // Indo
                'judul_kompetensi' => 'Memahami awal paragraf',
                'jenis' => 'CP',
                'kode' => 'CP-IND-F3',
                'tingkat' => null,
                'aspek' => null,
                'fase' => 'F',
                'deskripsi' => 'Peserta didik mampu membedakan paragraf',                
                'status' => 'aktif'
            ],            
        ]);

        // guru (tiap awal tahun akademik/ganjil)
        /**
         * 🎯✅ spa: Index, Show, Diterima, Ditolak
         */
        AlurTujuanPembelajaran::insert([            
            [
                'kompetensi_id' => 4, // MERDEKA || Matematika
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 5, // Guru IPA
                'semester' => 'Ganjil',
                'tujuan_pembelajaran' => 'Peserta didik mampu menjelaskan pengertian persamaan linear satu variabel melalui contoh kontekstual',
                'urutan' => 1,
                'approval_status' => 'draft',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                'kompetensi_id' => 4, // MERDEKA || Matematika
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 5, // Guru IPA
                'semester' => 'Ganjil',
                'tujuan_pembelajaran' => 'Peserta didik mampu menyusun dan menyelesaikan persamaan linear satu variabel dari masalah kontekstual',
                'urutan' => 2,
                'approval_status' => 'draft',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                'kompetensi_id' => 4, // MERDEKA || Matematika
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 5,
                'semester' => 'Ganjil',
                'tujuan_pembelajaran' => 'Peserta didik mampu mengevaluasi kebenarsan solusi persamaan linear dan mengomunikasikannya secara lisan maupun tertulis',
                'urutan' => 3,
                'approval_status' => 'draft',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                'kompetensi_id' => 6, // MERDEKA || Indo || Menulis sesuai KBBI
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 6, // Guru IPS
                'semester' => 'Ganjil',
                'tujuan_pembelajaran' => 'Peserta didik mampu menjelaskan konsep KBBI',
                'urutan' => 1,
                'approval_status' => 'draft',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                'kompetensi_id' => 7, // MERDEKA || Indo || Memahami Tanda baca pada kalimat
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 6, // Guru IPS
                'semester' => 'Ganjil',
                'tujuan_pembelajaran' => 'Peserta didik mampu menyusun dan menyelesaikan teks menggunakan tanda baca yang benar',
                'urutan' => 2,
                'approval_status' => 'draft',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                'kompetensi_id' => 8, // MERDEKA || Indo || Memahami awal paragraf
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 6, // Guru IPS
                'semester' => 'Ganjil',
                'tujuan_pembelajaran' => 'Peserta didik mampu memahami awal dan akhir sebuah paragraf',
                'urutan' => 3,
                'approval_status' => 'draft',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
        ]);        

        // modul_ajar

        // asesmen

        /**
         * 🎯✅ spa: CRUD    
         */
        Rombel::insert([
            [
                'kelas_id' => 1, // X
                'tahun_akademik_id' => 2, // 2024/2025
                'nama_rombel' => 'X-A',
                'wali_rombel_id' => 5, // Guru mtk
            ],
            [
                'kelas_id' => 1, // X
                'tahun_akademik_id' => 2, // 2024/2025
                'nama_rombel' => 'X-B',
                'wali_rombel_id' => 6, // Guru Indo
            ],            
            [
                'kelas_id' => 1, // X
                'tahun_akademik_id' => 2, // 2024/2025
                'nama_rombel' => 'X-C',
                'wali_rombel_id' => 7, // Guru Sunda
            ],                        
            [
                'kelas_id' => 2, // XI
                'tahun_akademik_id' => 1, // 2013/2023
                'nama_rombel' => 'XI-A',
                'wali_rombel_id' => 7, // Guru Sunda
            ],                        
        ]);

        // 🎯✅ spa: Create dan Delete
        SiswaRombel::insert([
            [
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1, // X-1A - J.IPA                
            ],
            [
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-1B - J.IPS                
            ],
            [
                'siswa_id' => 2, // Winton
                'rombel_id' => 4, // X1-A
            ],
            [
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-1B - J.IPS                
            ],
        ]);

        /** 
         * 🎯✅ spa: CRUD
         * tu: GET, SHOW
         * guru: GET/SHOW
         * Kepsek: GET, SHOW
         * */ 
        JadwalPelajaran::insert([            
            [
                // 1
                'kurikulum_mata_pelajaran_id' => 2, // merdeka - MTK
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Senin',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 1, // X-A
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 2
                'kurikulum_mata_pelajaran_id' => 2, // merdeka - MTK
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Selasa',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 2, // X-B
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 3
                'kurikulum_mata_pelajaran_id' => 2, // merdeka - MTK
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Selasa',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 3, // X-C
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],      
            [
                // 4                   
                'kurikulum_mata_pelajaran_id' => 3, // MERDEKA - Indo
                'semester_id' => 4, // 2024/2025 = Ganjil
                'hari' => 'Selasa',
                'guru_id' => 6, // Guru Indo
                'rombel_id' => 1, //X-A
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 3,
                'link_opsional' => '',                            
            ],          
            [
                // 5
                'kurikulum_mata_pelajaran_id' => 3, // MERDEKA - Indo
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Rabu',
                'guru_id' => 6, // Guru Indo
                'rombel_id' => 2, // X-B
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 1,
                'link_opsional' => '',                
            ],            
            [
                // 6
                'kurikulum_mata_pelajaran_id' => 4, // MERDEKA - Sunda
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Rabu',
                'guru_id' => 7, // Guru Sunda
                'rombel_id' => 1, // X-A
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],            
            [
                // 7
                'kurikulum_mata_pelajaran_id' => 4, // MERDEKA - Sunda
                'semester_id' => 4, // 2013/2023 = Genap
                'hari' => 'Rabu',
                'guru_id' => 7, // Guru Sunda
                'rombel_id' => 2, // X-B
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],   
            [
                // 8
                'kurikulum_mata_pelajaran_id' => 1, // K13 - MTK
                'semester_id' => 1, // 2013/2023 = Genap
                'hari' => 'Kamis',
                'guru_id' => 7, // Guru MTK
                'rombel_id' => 3, // X-C
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],   
            [
                // 9
                'kurikulum_mata_pelajaran_id' => 1, // K13 - Sunda
                'semester_id' => 2, // 2013/2023 = Genap
                'hari' => 'Rabu',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 4, // XI-A
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],   
                 
        ]);              

        /**
         * 🎯 spa: CRUD
         * kepsek: GET, SHOW
         * guru: CREATE
         */
        AbsensiPegawai::insert([
            [
                'guru_id' => 5,
                'mata_pelajaran_id' => 1,
                'hari' => '2025-05-24',
                'status' => 'hadir',
                'tahun_akademik_id' => 1,
            ],
            [
                'guru_id' => 6,
                'mata_pelajaran_id' => null,
                'hari' => '2025-05-24',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
            ],
        ]);

        /**
         * 🎯 spa: CRUD
         * kepsek: GET, SHOW
         * guru: CREATE
         */
        AbsensiPelajaran::insert([
            [
                'guru_pengajar_id' => 5,
                'jadwal_pelajaran_id' => 1,                
                'hari' => '2025-05-24',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
            ],
            [
                'guru_pengajar_id' => 6,
                'jadwal_pelajaran_id' => 2,                
                'hari' => '2025-05-24',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
            ],
            
        ]);

        /**
         * 🎯 spa: CRUD
         * kepsek: GET, SHOW
         * guru: CRUD
         */
        AbsensiSiswa::insert([
            [
                'siswa_id' => 1, // Andi
                'kelas_id' => 2, 
                'jadwal_pelajaran_id' => 2, // B.Indonesia
                'hari' => '2025-10-17', // B.Indonesia
                'status' => 'hadir',
                'bukti' => null,                                
            ],
            [
                'siswa_id' => 1, // Andi
                'kelas_id' => 2, 
                'jadwal_pelajaran_id' => 1, // IPA
                'hari' => '2025-10-24', // IPA
                'status' => 'sakit',
                'bukti' => 'sakit.jpg',                                
            ],
            [
                'siswa_id' => 2, // Rina
                'kelas_id' => 1, 
                'jadwal_pelajaran_id' => 1, // IPA
                'hari' => '2025-10-10', // IPA
                'status' => 'alfa',
                'bukti' => 'alfa.jpg',                                
            ],
            [
                'siswa_id' => 2, // Rina
                'kelas_id' => 1, 
                'jadwal_pelajaran_id' => 2, // B.Indonesia
                'hari' => '2025-10-25', // B.Indonesia
                'status' => 'izin',
                'bukti' => 'izin.jpg',                                
            ],
        ]);        

        /**
         * 🎯 SPA: CRUD
         *  */ 
        Ekstrakurikuler::insert([
            [
                'nama_ekstrakurikuler' => 'Pramuka',                
                'anggaran' => 1500000,
                'status' => 'wajib',
            ],
            [
                'nama_ekstrakurikuler' => 'Paskibra',                
                'anggaran' => 2000000,
                'status' => 'pilihan',
            ],
            [
                'nama_ekstrakurikuler' => 'Tari',                
                'anggaran' => 5000000,
                'status' => 'jurusan',
            ],
        ]);

        // seed pembina ekskul
        PembinaEkskul::insert([
            [
                'pembina_id' => 3, // staff tu
                'ekstrakurikuler_id' => 2, // PASKIB
                'tahun_akademik_id' => 2, // 2024/2025
            ],
            [
                'pembina_id' => 4, // staff kebersihan
                'ekstrakurikuler_id' => 3, // Tari
                'tahun_akademik_id' => 2, // 2024/2025
            ],
        ]);

        // seed pelatih ekskul
        PelatihEkskul::insert([
            [
                'pelatih_id' => 5, // Guru IPA pengajar PASKIB
                'ekstrakurikuler_id' => 2, // PASKIB
                'tahun_akademik_id' => 2, // 2024/2025
            ],
            [
                'pelatih_id' => 6, // Guru IPS pengajar Tari
                'ekstrakurikuler_id' => 3, // Tari
                'tahun_akademik_id' => 2, // 2024/2025
            ],
        ]);                    

        // Seed Siswa daftar ke ekstrakurikuler
        EkskulSiswaPivot::insert([
            [
                'siswa_id' => 1,
                'ekstrakurikuler_id' => 3,
                'tahun_akademik_id' => 2,
                'sikap' => 'Sangat Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 1,
                'tahun_akademik_id' => 2,
                'sikap' => 'Baik',
                'status' => 'Cukup Aktif'
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 2,
                'tahun_akademik_id' => 1,
                'sikap' => 'Cukup',
                'status' => 'Kurang Aktif'
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 3,
                'tahun_akademik_id' => 2,
                'sikap' => 'Kurang',
                'status' => 'Tidak Aktif'
            ],
        ]);

        /**
         * 🎯 spa: CRUD
         * kepsek: GET, SHOW
         * guru
         */
        Prestasi::insert([
            [
                'siswa_id' => 1, // Bagas                                
                'tahun_akademik_id' => 2, // 2024/2025 (Merdeka)
                'prestasi_diraih' => 'Juara 2 lomba renang tingkat kabupaten',
            ],
            [
                'siswa_id' => 2, // Winton                                
                'tahun_akademik_id' => 1, // 
                'prestasi_diraih' => 'Rangking satu umum angkatan 2021',
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
        DataNilaiSiswa::insert([
            [
                'siswa_id' => 1, // Bagas jurusan IPA
                'kurikulum_mata_pelajaran_id' => 2, // Fisika jurusan IPA                           
                'semester_id' => 3, // Fisika jurusan IPA           
                'guru_id' => 5, // Guru IPA
                'point_absensi' => 78.5,
                'point_tugas' => 80.0,
                'point_uts' => 90.5,
                'point_uas' => 88.5,                
                'sikap' => 'Cukup'
            ],
            [
                'siswa_id' => 2, // Winton
                'kurikulum_mata_pelajaran_id' => 3, // B.Indo jurusan IPS                
                'semester_id' => 3, // B.Indo jurusan IPS
                'guru_id' => 6, // Guru IPS
                'point_absensi' => 90,
                'point_tugas' => 80,
                'point_uts' => 70,
                'point_uas' => 88,                
                'sikap' => 'Baik'
            ],
            [
                'siswa_id' => 2, // Winton
                'kurikulum_mata_pelajaran_id' => 4, // Sunda jurusan IPS                
                'semester_id' => 4, // Sunda jurusan IPS
                'guru_id' => 6, // Guru IPS
                'point_absensi' => 90,
                'point_tugas' => 90,
                'point_uts' => 90,
                'point_uas' => 90,                
                'sikap' => 'Sangat Baik'
            ]
        ]);

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
