<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Models\Kepegawaian;
use App\Models\Jurusan;
use App\Models\Kelas;
use App\Models\Ekstrakurikuler;
use App\Models\Siswa;
use App\Models\EkskulSiswaPivot;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // \App\Models\User::factory(10)->create();

        // \App\Models\User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        // Seed Kepegawaian
        Kepegawaian::insert([
            [
                'nama' => 'Super Admin',
                'email' => 'sp@gmail.com',
                'status' => 'honorer',
                'nip' => '123450',
                'keterangan' => 'Super Admin',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'super_admin',
                'remember_token' => Str::random(10),
            ],
            [
                'nama' => 'Kepsek',
                'email' => 'kepsek@gmail.com',
                'status' => 'pns',
                'nip' => '123451',
                'keterangan' => 'Kepala Sekolah',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'kepsek',
                'remember_token' => Str::random(10),
            ],
            [
                'nama' => 'TU',
                'email' => 'tu@gmail.com',
                'status' => 'honorer',
                'nip' => '123452',
                'keterangan' => 'Staff TU',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'tu',
                'remember_token' => Str::random(10),
            ],
            [
                'nama' => 'Staff Kebersihan Pengajar Pramuka',
                'email' => 'staff@gmail.com',
                'status' => 'honorer',
                'nip' => '123453',
                'keterangan' => 'Staff Kebersihan',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'staff',
                'remember_token' => Str::random(10),
            ],
            [
                'nama' => 'Guru IPA Pengajar Paskibra',
                'email' => 'guruipa@gmail.com',
                'status' => 'pns',
                'nip' => '123454',
                'keterangan' => 'Guru IPA',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
            ],
            [
                'nama' => 'Guru IPS Pengajar Tari',
                'email' => 'guruips@gmail.com',
                'status' => 'honorer',
                'nip' => '123455',
                'keterangan' => 'Guru IPS',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'guru',
                'remember_token' => Str::random(10),
            ],
        ]);

        // Seed Jurusan
        Jurusan::insert([
            ['nama_jurusan' => 'IPA'],
            ['nama_jurusan' => 'IPS'],
        ]);

        // Seed Kelas
        Kelas::insert([
            [
                'nama_kelas' => 'X IPA',
                'jam_masuk' => '07:00',
                'wali_kelas' => 5, // ID dari kepegawaian guru
            ],
            [
                'nama_kelas' => 'X IPS',
                'jam_masuk' => '07:00',
                'wali_kelas' => 6,
            ],
        ]);

        // Seed Ekstrakurikuler
        Ekstrakurikuler::insert([
            [
                'nama_ekstrakurikuler' => 'Pramuka',
                'pengajar_id' => 4,
                'anggaran' => 1500000,
                'status' => 'wajib',
            ],
            [
                'nama_ekstrakurikuler' => 'Paskibra',
                'pengajar_id' => 5,
                'anggaran' => 2000000,
                'status' => 'pilihan',
            ],
            [
                'nama_ekstrakurikuler' => 'Tari',
                'pengajar_id' => 6,
                'anggaran' => 5000000,
                'status' => 'jurusan',
            ],
        ]);

        // Seed Siswa
        Siswa::insert([
            [
                'nisn' => '123451',
                'nama' => 'Andi Siswa IPS Kelas X IPS',
                'email' => 'andi@gmail.com',
                'nis' => '123451',
                'jurusan_id' => 2,
                'kelas_id' => 2,
                'email' => 'andiswa@example.com',
                'status' => 'aktif',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
            ],
            [
                'nisn' => '123452',
                'nama' => 'Rina Siswa IPA Kelas X IPA',
                'email' => 'rina@gmail.com',
                'nis' => '123452',
                'jurusan_id' => 1,
                'kelas_id' => 1,
                'email' => 'rinasiswa@example.com',
                'status' => 'aktif',
                'password' => Hash::make('K3ps3k.'),
                'role' => 'siswa',
                'remember_token' => Str::random(10),
            ],
        ]);

        // Seed Siswa daftar ke ekstrakurikuler
        EkskulSiswaPivot::insert([
            [
                'siswa_id' => 1,
                'ekstrakurikuler_id' => 3,
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 1,
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 2,
            ],
            [
                'siswa_id' => 2,
                'ekstrakurikuler_id' => 3,
            ],
        ]);
    }
}
