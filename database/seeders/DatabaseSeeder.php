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
                'tingkat' => 10,                
                'jurusan_id' => null, // IPA                                                                            
            ],
            [
                'nama_kelas' => 'XI',
                'kode_kelas' => 'K22.IPS',                
                'tingkat' => 11,                
                'jurusan_id' => null, // IPS                                                                            
            ],
            [
                'nama_kelas' => 'XII',
                'kode_kelas' => 'K11-IPA',                
                'tingkat' => 12,                
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
            [
                'nama_pelajaran' => 'Bahasa Inggris',
                'kode_mapel_diknas' => '225',                
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
                'tahun_akademik' => '2013/2024',                
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
                'semester_id' => 3, // Ganjil
                'tujuan_pembelajaran' => 'Peserta didik mampu menjelaskan pengertian persamaan linear satu variabel melalui contoh kontekstual',
                'urutan' => 1,
                'approval_status' => 'diajukan',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],            
            [
                'kompetensi_id' => 4, // MERDEKA || Matematika
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 5, // Guru IPA
                'semester_id' => 3, // Ganjil
                'tujuan_pembelajaran' => 'Peserta didik mampu menyusun dan menyelesaikan persamaan linear satu variabel dari masalah kontekstual',
                'urutan' => 2,
                'approval_status' => 'diajukan',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                'kompetensi_id' => 4, // MERDEKA || Matematika
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 5,
                'semester_id' => 4, // Genap
                'tujuan_pembelajaran' => 'Peserta didik mampu mengevaluasi kebenarsan solusi persamaan linear dan mengomunikasikannya secara lisan maupun tertulis',
                'urutan' => 1,
                'approval_status' => 'diajukan',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                'kompetensi_id' => 6, // MERDEKA || Indo || Menulis sesuai KBBI
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 6, // Guru IPS
                'semester_id' => 3, // Ganjil
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
                'semester_id' => 3, // Ganjil
                'tujuan_pembelajaran' => 'Peserta didik mampu menyusun dan menyelesaikan teks menggunakan tanda baca yang benar',
                'urutan' => 2,
                'approval_status' => 'diajukan',
                'approved_by' => null,
                'approved_at' => null,
                'catatan_penolakan' => null,
                'is_locked' => false,                
            ],
            [
                'kompetensi_id' => 8, // MERDEKA || Indo || Memahami awal paragraf
                'tahun_akademik_id' => 2, // 2024/2025
                'guru_id' => 6, // Guru IPS
                'semester_id' => 3, // Ganjil
                'tujuan_pembelajaran' => 'Peserta didik mampu memahami awal dan akhir sebuah paragraf',
                'urutan' => 3,
                'approval_status' => 'diajukan',
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
                'rombel_id' => 4, // XI-A - J.IPA                
                'tahun_akademik_id' => 1, // 2013/2024
            ],
            [
                'siswa_id' => 2, // Winton
                'rombel_id' => 4, // XI-A
                'tahun_akademik_id' => 1, // 2013/2024
            ],            
            [
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1, // X-A - J.IPA                
                'tahun_akademik_id' => 2, // 2024/2025
            ],
            [
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B - J.IPS                
                'tahun_akademik_id' => 2, // 2024/2025
            ],            
            [
                'siswa_id' => 3, // Sanita
                'rombel_id' => 3, // X-B - J.IPS                
                'tahun_akademik_id' => 2, // 2024/2025
            ],
        ]);

        /** 
         * 🎯✅ spa: CRUD
         * tu: GET, SHOW
         * guru: GET/SHOW
         * Kepsek: GET, SHOW
         * */ 
        JadwalPelajaran::insert([            
            // MTK
            [
                // 1
                'kurikulum_mata_pelajaran_id' => 1, // K13 - MTK
                'semester_id' => 1, // 2013/2023 = Ganjil
                'hari' => 'Kamis',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 4, // XI-A
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 2,
                'link_opsional' => '',              
            ],
            // ---------------------            
            [
                // 2
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
                // 3
                'kurikulum_mata_pelajaran_id' => 2, // merdeka - MTK
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Senin',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 2, // X-B
                'jam_mulai' => '09:31',
                'jam_selesai' => '12:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 4
                'kurikulum_mata_pelajaran_id' => 2, // merdeka - MTK
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Selasa',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 3, // X-C
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com', 
            ],    
            [
                // 5
                'kurikulum_mata_pelajaran_id' => 2, // merdeka - MTK
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Senin',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 1, // X-A
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 1,                
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 6
                'kurikulum_mata_pelajaran_id' => 2, // merdeka - MTK
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Senin',
                'guru_id' => 5, // Guru MTK
                'rombel_id' => 2, // X-B
                'jam_mulai' => '09:31',
                'jam_selesai' => '12:30',
                'ruangan_id' => 2,
                'link_opsional' => 'www.youtube.com',                
            ],
            [
                // 7
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
            // MTK
            // ---------------------            
            // Indo
            [
                // 8
                'kurikulum_mata_pelajaran_id' => 3, // MERDEKA - Indo
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Selasa',
                'guru_id' => 6, // Guru Indo
                'rombel_id' => 1, // X-A
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 3,
                'link_opsional' => '',                            
            ],          
            [
                // 9
                'kurikulum_mata_pelajaran_id' => 3, // MERDEKA - Indo
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Rabu',
                'guru_id' => 6, // Guru Indo
                'rombel_id' => 2, // X-B
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 1,
                'link_opsional' => '',                
            ],            
            [
                // 10
                'kurikulum_mata_pelajaran_id' => 3, // MERDEKA - Indo
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Rabu',
                'guru_id' => 6, // Guru Indo
                'rombel_id' => 3, // X-C
                'jam_mulai' => '10:00',
                'jam_selesai' => '12:30',
                'ruangan_id' => 1,
                'link_opsional' => '',                
            ],            
            [
                // 11
                'kurikulum_mata_pelajaran_id' => 3, // MERDEKA - Indo
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Selasa',
                'guru_id' => 6, // Guru Indo
                'rombel_id' => 1, // X-A
                'jam_mulai' => '07:30',
                'jam_selesai' => '09:30',
                'ruangan_id' => 3,
                'link_opsional' => '',                            
            ],          
            [
                // 12
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
                // 13
                'kurikulum_mata_pelajaran_id' => 3, // MERDEKA - Indo
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Rabu',
                'guru_id' => 6, // Guru Indo
                'rombel_id' => 3, // X-C
                'jam_mulai' => '10:00',
                'jam_selesai' => '12:30',
                'ruangan_id' => 1,
                'link_opsional' => '',                
            ],            
            // Indo
            // ---------------------            
            // Sunda
            [
                // 14
                'kurikulum_mata_pelajaran_id' => 4, // MERDEKA - Sunda
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Rabu',
                'guru_id' => 7, // Guru Sunda
                'rombel_id' => 1, // X-A
                'jam_mulai' => '10:00',
                'jam_selesai' => '12:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],            
            [
                // 15
                'kurikulum_mata_pelajaran_id' => 4, // MERDEKA - Sunda
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Kamis',
                'guru_id' => 7, // Guru Sunda
                'rombel_id' => 2, // X-B
                'jam_mulai' => '10:00',
                'jam_selesai' => '12:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],                                                   
            [
                // 16
                'kurikulum_mata_pelajaran_id' => 4, // MERDEKA - Sunda
                'semester_id' => 3, // 2024/2025 = Ganjil
                'hari' => 'Kamis',
                'guru_id' => 7, // Guru Sunda
                'rombel_id' => 3, // X-C
                'jam_mulai' => '13:00',
                'jam_selesai' => '15:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],                                                   
            [
                // 17
                'kurikulum_mata_pelajaran_id' => 4, // MERDEKA - Sunda
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Rabu',
                'guru_id' => 7, // Guru Sunda
                'rombel_id' => 1, // X-A
                'jam_mulai' => '10:00',
                'jam_selesai' => '12:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],            
            [
                // 18
                'kurikulum_mata_pelajaran_id' => 4, // MERDEKA - Sunda
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Kamis',
                'guru_id' => 7, // Guru Sunda
                'rombel_id' => 2, // X-B
                'jam_mulai' => '10:00',
                'jam_selesai' => '12:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],                                                   
            [
                // 19
                'kurikulum_mata_pelajaran_id' => 4, // MERDEKA - Sunda
                'semester_id' => 4, // 2024/2025 = Genap
                'hari' => 'Kamis',
                'guru_id' => 7, // Guru Sunda
                'rombel_id' => 3, // X-C
                'jam_mulai' => '13:00',
                'jam_selesai' => '15:30',
                'ruangan_id' => 2,
                'link_opsional' => '',                
            ],                                                   
        ]);              

        /**
         * 🎯✅ spa: CRUD
         * kepsek: GET, SHOW
         * guru: CREATE
         */
        AbsensiPegawai::insert([
            [
                'guru_id' => 5, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2014-02-27',
                'status' => 'hadir',
                'tahun_akademik_id' => 1,  // 13/24
                'semester_id' => 2, // Genap
            ],
            [
                'guru_id' => 5, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2025-05-24',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 3, // Ganjil
            ],
            [
                'guru_id' => 5, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2025-05-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 3, // Ganjil
            ],
            [
                'guru_id' => 5, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2025-05-26',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 3, // Ganjil
            ],
            [
                'guru_id' => 5, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2026-01-23',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 4, // Genap
            ],
            [
                'guru_id' => 5, // Guru MTK
                'jadwal_pelajaran_id' => null,
                'hari' => '2026-01-24',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 4, // Genap
            ],
            [
                'guru_id' => 5, // Guru MTK
                'jadwal_pelajaran_id' => 1,
                'hari' => '2026-01-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 2, 
                'semester_id' => 4, // Genap
            ],
            // ---------------------------------------------------
            [
                'guru_id' => 6,
                'jadwal_pelajaran_id' => 2, // Indon
                'hari' => '2025-05-24',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 6,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2025-05-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 6,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2025-05-26',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 6,
                'jadwal_pelajaran_id' => 2, // Indon
                'hari' => '2026-01-01',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                'guru_id' => 6,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2026-01-02',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                'guru_id' => 6,
                'jadwal_pelajaran_id' => 2,
                'hari' => '2026-01-03',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            // ----------------------------------------------
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 3, // Sunda
                'hari' => '2025-05-24',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 3, // Sunda
                'hari' => '2025-05-25',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 3, // Sunda
                'hari' => '2025-05-26',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 3, // Sunda
                'hari' => '2026-01-04',
                'status' => 'tidak hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 3, // Sunda
                'hari' => '2026-01-05',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                'guru_id' => 7,
                'jadwal_pelajaran_id' => 3, // Sunda
                'hari' => '2026-01-06',
                'status' => 'hadir',
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
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
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | XI-A      
                'hari' => '2023-05-25',
                'status' => 'hadir',                
                'tahun_akademik_id' => 1, // 13/24
                'semester_id' => 1 // Ganjil
            ],
            // ---------------------            
            [
                // 2
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 2, // MTK | 24/25 | Ganjil | X-A      
                'hari' => '2024-05-05', // Senin
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
            [
                // 3
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 2, // MTK | 24/25 | Ganjil | X-A     
                'hari' => '2024-05-12', // Senin
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
            [
                // 4
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 2, // MTK | 24/25 | Ganjil | X-A     
                'hari' => '2024-05-19', // Senin
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3 // Ganjil
            ],
            [
                // 5 (id 3)
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 3, // MTK | 24/25 | Ganjil | X-B      
                'hari' => '2024-05-05',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3  // Ganjil
            ],
            [
                // 6
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 3, // MTK | 24/25 | Ganjil | X-B      
                'hari' => '2024-05-12',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3  // Ganjil
            ],
            [
                // 7
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 3, // MTK | 24/25 | Ganjil | X-B      
                'hari' => '2024-05-19',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3  // Ganjil
            ],
            [
                // 8 (id 4)
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 4, // MTK | 24/25 | Ganjil | X-C      
                'hari' => '2024-05-06', // Selasa
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3  // Ganjil
            ],
            [
                // 9
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 4, // MTK | 24/25 | Ganjil | X-C      
                'hari' => '2024-05-13',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3  // Ganjil
            ],
            [
                // 10
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 4, // MTK | 24/25 | Ganjil | X-C      
                'hari' => '2024-05-20',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 3  // Ganjil
            ],
            [
                // 11 (id 5)
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 5, // MTK | 24/25 | Genap | X-A      
                'hari' => '2025-05-05', // Senin
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4 // Genap
            ],
            [
                // 12
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 5, // MTK | 24/25 | Genap | X-A     
                'hari' => '2025-05-12', // Senin
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4 // Genap
            ],
            [
                // 13
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 5, // MTK | 24/25 | Genap | X-A     
                'hari' => '2025-05-19', // Senin
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4 // Genap
            ],            
            [
                // 14 (id 6)
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 6, // MTK | 24/25 | Genap | X-B      
                'hari' => '2025-05-05',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],
            [
                // 15
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 6, // MTK | 24/25 | Genap | X-B      
                'hari' => '2025-05-12',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],
            [
                // 16
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 6, // MTK | 24/25 | Genap | X-B      
                'hari' => '2025-05-19',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],
            [
                // 17 (id 7)
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 7, // MTK | 24/25 | Genap | X-C      
                'hari' => '2025-05-06',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],
            [
                // 18
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 7, // MTK | 24/25 | Genap | X-C      
                'hari' => '2025-05-13',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],
            [
                // 19
                'guru_pengajar_id' => 5, /// Guru MTK
                'jadwal_pelajaran_id' => 7, // MTK | 24/25 | Genap | X-C      
                'hari' => '2025-05-20',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2, // 24/25
                'semester_id' => 4  // Genap
            ],        
            // ---------------------  
            [
                // 20
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 8, // Indo | 24/25 | Ganjil | X-A
                'hari' => '2024-05-06',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],                   
            [
                // 21
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 8, // Indo | 24/25 | Ganjil | X-A
                'hari' => '2024-05-13',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],                   
            [
                // 22
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 8, // Indo | 24/25 | Ganjil | X-A
                'hari' => '2024-05-20',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],                   
            [
                // 23
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 9, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-05-07',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],
            [
                // 24
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 9, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-05-14',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 3
            ],
            [
                // 25
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 9, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-05-21',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 3
            ],
            [
                // 26
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 10, // Indo | 24/25 | Ganjil | X-C
                'hari' => '2024-05-07',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],
            [
                // 27
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 10, // Indo | 24/25 | Ganjil | X-C
                'hari' => '2024-05-14',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 3
            ],
            [
                // 28
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 10, // Indo | 24/25 | Ganjil | X-C
                'hari' => '2024-05-21',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 3
            ],
            [
                // 29
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 11, // Indo | 24/25 | Genap | X-A
                'hari' => '2025-01-07',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],                   
            [
                // 30
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 11, // Indo | 24/25 | Genap | X-A
                'hari' => '2025-01-14',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],                   
            [
                // 31
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 11, // Indo | 24/25 | Genap | X-A
                'hari' => '2025-01-21',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],                   
            [
                // 32
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 12, // Indo | 24/25 | Genap | X-B
                'hari' => '2025-01-08',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],
            [
                // 33
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 12, // Indo | 24/25 | Genap | X-B
                'hari' => '2025-01-15',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 4
            ],
            [
                // 34
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 12, // Indo | 24/25 | Genap | X-B
                'hari' => '2025-01-22',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 4
            ],
            [
                // 35
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 13, // Indo | 24/25 | Genap | X-C
                'hari' => '2025-01-29',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],
            [
                // 36
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 13, // Indo | 24/25 | Genap | X-C
                'hari' => '2025-02-08',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 4
            ],
            [
                // 37
                'guru_pengajar_id' => 6, // Guru Indo
                'jadwal_pelajaran_id' => 13, // Indo | 24/25 | Genap | X-C
                'hari' => '2025-02-15',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 4
            ],            
            // ---------------------  
            [
                // 38
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 14, // Indo | 24/25 | Ganjil | X-A
                'hari' => '2024-04-02',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],                   
            [
                // 39
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 14, // Indo | 24/25 | Ganjil | X-A
                'hari' => '2024-04-09',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],                   
            [
                // 40
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 14, // Indo | 24/25 | Ganjil | X-A
                'hari' => '2024-04-16',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],                   
            [
                // 41
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 15, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-04-03',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],
            [
                // 42
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 15, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-04-10',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 3
            ],
            [
                // 43
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 15, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-04-17',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 3
            ],
            [
                // 44
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 16, // Indo | 24/25 | Ganjil | X-C
                'hari' => '2024-08-07',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 3
            ],
            [
                // 45
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 16, // Indo | 24/25 | Ganjil | X-C
                'hari' => '2024-08-14',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 3
            ],
            [
                // 46
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 16, // Indo | 24/25 | Ganjil | X-C
                'hari' => '2024-08-21',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 3
            ],
            [
                // 47
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 17, // Indo | 24/25 | Genap | X-A
                'hari' => '2025-01-08',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],                   
            [
                // 48
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 17, // Indo | 24/25 | Genap | X-A
                'hari' => '2025-01-15',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],                   
            [
                // 49
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 17, // Indo | 24/25 | Genap | X-A
                'hari' => '2025-01-22',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],                   
            [
                // 50
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 18, // Indo | 24/25 | Genap | X-B
                'hari' => '2025-01-09',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],
            [
                // 51
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 18, // Indo | 24/25 | Genap | X-B
                'hari' => '2025-01-16',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 4
            ],
            [
                // 52
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 18, // Indo | 24/25 | Genap | X-B
                'hari' => '2025-01-23',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 4
            ],
            [
                // 53
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 19, // Indo | 24/25 | Genap | X-C
                'hari' => '2025-01-09',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,
                'semester_id' => 4
            ],
            [
                // 54
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 19, // Indo | 24/25 | Genap | X-C
                'hari' => '2025-01-16',
                'status' => 'hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 4
            ],
            [
                // 55
                'guru_pengajar_id' => 7, // Guru Sunda
                'jadwal_pelajaran_id' => 19, // Indo | 24/25 | Genap | X-C
                'hari' => '2025-02-23',
                'status' => 'tidak hadir',                
                'tahun_akademik_id' => 2,                
                'semester_id' => 4
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
                'siswa_id' => 1, // Bagas
                'rombel_id' => 4,  // XI-A
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | XI-A
                'hari' => '2024-12-05',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 2
                'siswa_id' => 1, // Bagas
                'rombel_id' => 4,  // XI-A
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | XI-A
                'hari' => '2024-12-12',
                'status' => 'alfa',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 1,
                'semester_id' => 1, // Ganjil
            ],            
            [
                // 3
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1,  // X-A
                'jadwal_pelajaran_id' => 2, // MTK | 24/25 | Ganjil | X-A
                'hari' => '2024-12-09',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 4
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1,  // X-A
                'jadwal_pelajaran_id' => 2, // MTK | 24/25 | Ganjil | X-A
                'hari' => '2024-12-16',
                'status' => 'hadir',
                'bukti' => null, // hadir, izin, sakit, alfa                            
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 5
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1,  // X-A
                'jadwal_pelajaran_id' => 5, // MTK | 24/25 | Genap | X-A
                'hari' => '2025-05-06',
                'status' => 'izin',
                'bukti' => 'izin.jpg',                                
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            [
                // 6
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1,  // X-A
                'jadwal_pelajaran_id' => 8, // Indo | 24/25 | Ganjil | X-A
                'hari' => '2024-12-10',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 7
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1,  // X-A
                'jadwal_pelajaran_id' => 11, // Indo | 24/25 | Genap | X-A
                'hari' => '2025-05-06',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            [
                // 8
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1,  // X-A
                'jadwal_pelajaran_id' => 14, // Sunda | 24/25 | Ganjil | X-A
                'hari' => '2024-05-07',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 3, // Ganjil
            ],            
            [
                // 9
                'siswa_id' => 1, // Bagas
                'rombel_id' => 1,  // X-A
                'jadwal_pelajaran_id' => 17, // Sunda | 24/25 | Genap | X-A
                'hari' => '2025-05-07',
                'status' => 'hadir',
                'bukti' => null,  
                'tahun_akademik_id' => 2,
                'semester_id' => 4, // Genap
            ],            
            // -------------------------------------------------------------
            [
                // 10
                'siswa_id' => 2, // Winton
                'rombel_id' => 4, // XI-A
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | XI-A
                'hari' => '2024-12-05', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
            ],
            [
                // 11
                'siswa_id' => 2, // Winton
                'rombel_id' => 4, // XI-A
                'jadwal_pelajaran_id' => 1, // MTK | 13/24 | Ganjil | XI-A
                'hari' => '2024-12-12', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 1,
                'semester_id' => 1,
            ],
            [
                // 12
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 3, // MTK | 24/25 | Ganjil | X-B
                'hari' => '2024-12-02', 
                'status' => 'izin',
                'bukti' => 'acara-keluarga-dummy.png',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                // 13
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 6, // MTK | 24/25 | Genap | X-B
                'hari' => '2025-05-05', 
                'status' => 'alfa',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                // 14
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 9, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-12-04', 
                'status' => 'sakit',
                'bukti' => 'surat-dokter-dummy.jpg',
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                // 15
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 9, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-12-11', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                // 16
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 12, // Indo | 24/25 | Genap | X-B
                'hari' => '2025-05-07', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                // 17
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 15, // Sunda | 24/25 | Ganjil | X-B
                'hari' => '2024-12-05', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                // 18
                'siswa_id' => 2, // Winton
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 18, // Sunda | 24/25 | Genap | X-B
                'hari' => '2025-05-08', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            // -------------------------------------------------------------   
            [
                // 19
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 3, // MTK | 24/25 | Ganjil | X-B
                'hari' => '2024-12-02', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                // 20
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 6, // MTK | 24/25 | Genap | X-B
                'hari' => '2025-05-06', 
                'status' => 'alfa',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                // 21
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 9, // Indo | 24/25 | Ganjil | X-B
                'hari' => '2024-12-04', 
                'status' => 'alfa',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                // 22
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 12, // Indo | 24/25 | Genap | X-B
                'hari' => '2025-05-07', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],
            [
                // 23
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 15, // Sunda | 24/25 | Ganjil | X-B
                'hari' => '2024-12-05', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 3,
            ],
            [
                // 24
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 18, // Sunda | 24/25 | Genap | X-B
                'hari' => '2025-05-08', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
            ],                  
            [
                // 25
                'siswa_id' => 3, // Sanita
                'rombel_id' => 2, // X-B
                'jadwal_pelajaran_id' => 18, // Sunda | 24/25 | Genap | X-B
                'hari' => '2025-05-15', 
                'status' => 'hadir',
                'bukti' => null,
                'tahun_akademik_id' => 2,
                'semester_id' => 4,
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
                'pembina_id' => 5, // guru MTK
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 1, // 2013/2024
            ],
            [
                'pembina_id' => 5, // guru MTK
                'ekstrakurikuler_id' => 1, // Pramuka
                'tahun_akademik_id' => 2, // 2024/2025
            ],
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
            [
                'pembina_id' => 7, // guru sunda
                'ekstrakurikuler_id' => 4, // Futsal
                'tahun_akademik_id' => 2, // 2024/2025
            ],
        ]);

        // 🎯✅ seed pelatih ekskul
        PelatihEkskul::insert([
            [
                'pelatih_id' => 5, // Guru MTK
                'ekstrakurikuler_id' => 1, // pramuka
                'tahun_akademik_id' => 1, // 2013/2024
            ],
            [
                'pelatih_id' => 3, // Staf Tu
                'ekstrakurikuler_id' => 1, // pramuka
                'tahun_akademik_id' => 2, // 2024/2025
            ],
            [
                'pelatih_id' => 6, // Guru indon
                'ekstrakurikuler_id' => 2, // paskibra
                'tahun_akademik_id' => 2, // 2024/2025
            ],
            [
                'pelatih_id' => 7, // Guru Sunda
                'ekstrakurikuler_id' => 3, // tari
                'tahun_akademik_id' => 2, // 2024/2025
            ],
            [
                'pelatih_id' => 4, // staff kebersihan
                'ekstrakurikuler_id' => 4, // futsal
                'tahun_akademik_id' => 2, // 2024/2025
            ],
        ]);                    

        // 🎯 Seed Siswa daftar ke ekstrakurikuler
        EkskulSiswaPivot::insert([
            [
                'siswa_id' => 1,
                'ekstrakurikuler_id' => 1,
                'tahun_akademik_id' => 1,
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 1,
                'tahun_akademik_id' => 1,
                'sikap' => 'Sangat Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 1,
                'ekstrakurikuler_id' => 1,
                'tahun_akademik_id' => 2,
                'sikap' => 'Baik',
                'status' => 'Cukup Aktif'
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 1,
                'tahun_akademik_id' => 2,
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 2,
                'tahun_akademik_id' => 2,
                'sikap' => 'Baik',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 3,
                'ekstrakurikuler_id' => 3,
                'tahun_akademik_id' => 2,
                'sikap' => 'Kurang',
                'status' => 'Tidak Aktif'
            ],
            [
                'siswa_id' => 1,
                'ekstrakurikuler_id' => 4,
                'tahun_akademik_id' => 1,
                'sikap' => 'Cukup',
                'status' => 'Aktif'
            ],
            [
                'siswa_id' => 1,
                'ekstrakurikuler_id' => 4,
                'tahun_akademik_id' => 2,
                'sikap' => 'Sangat Baik',
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
