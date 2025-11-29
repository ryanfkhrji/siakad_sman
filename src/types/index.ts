export interface Kelas {
  id: number;
  nama_kelas: string | null;
  jam_masuk: string | null;
  jumlah_siswa?: number;
  wali_kelas: Pegawai | null;
}

export interface Pegawai {
  id: number;
  nama: string;
  status?: string;
  nip: string;
  email: string;
  keterangan?: string;
  role: string;
  kelas?: Kelas | null;
}

export interface Siswa {
  id: number;
  nisn: string;
  nama: string;
  email: string;
  nis: string;
  kelas: Kelas | string | null;
  status: string;
  nama_jurusan?: string | null;
  nama_ekstrakurikuler?: string | null;
  role: string;
}

export interface Jurusan {
  id: number;
  nama_jurusan: string;
  jumlah_siswa: number;
  siswa: Siswa[];
}

export interface MataPelajaran {
  id: number;
  nama_pelajaran: string;
  status: string;
}

export interface JadwalPelajaran {
  id: number;
  mata_pelajaran: string;
  hari: string;
  guru: Pegawai[] | string;
  kelas: Kelas[] | string;
  jam_pelajaran: string;
  ruangan: string;
  link_opsional: string | null;
  peserta: [
    {
      id: number;
      nama_siswa: string;
      jurusan: string;
      kelas: string | Kelas | null;
    }
  ];
}

export interface JadwalPelajaranSiswa {
  id: number;
  nisn: string;
  nama: string;
  email: string;
  nis: string;
  nama_jurusan?: string | null;
  nama_ekstrakurikuler?: string | null;
  status: string;
  role: string;
  kelas: Kelas | null;
  jadwal_pelajaran: JadwalPelajaran | null;
}

export interface Ekskul {
  id: number;
  nama_ekstrakurikuler: string;
  nama_pengajar: string | null;
  anggaran: number;
  status: string;
  jumlah_peserta: number;
  peserta: Siswa[];
}

export interface Kurikulum {
  id: number;
  nama_kurikulum: string;
  tahun_berlaku: string;
  status: string;
  deskripsi: string;
}

export interface KompetensiDasar {
  id: number;
  mata_pelajaran_id: string;
  judul_kompetensi_dasar: string;
  deskripsi: string;
  kurikulum_id: string;
}

export interface Gedung {
  id: number;
  foto_gedung: string | null;
  kode_gedung: string;
  nama_gedung: string;
  jumlah_lantai: number;
  luas_bangunan: string;
  tahun_dibangun: string;
  kondisi: string;
  keterangan: string;
}

export interface DetailKelasSiswa {
  id: number;
  nama_kelas: string;
  jam_masuk: string;
  jumlah_siswa: number;
  wali: {
    id: number;
    nama: string;
    role: string;
  }
}

export interface IdentitasSekolah {
  id: number;
  npsn: string;
  nama_sekolah: string;
  status_sekolah: string;
  jenjang: string;
  akreditasi: string | null;
  alamat: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  kode_pos: string;
  email: string;
  no_telepon: string;
  kepala_sekolah: string;
  nip_kepala_sekolah: string;
  visi: string;
  misi: string;
  logo: string;
}

export interface Ruangan {
  id: number;
  nama_gedung: string;
  kode_ruangan: string;
  nama_ruangan: string;
  jenis_ruangan: string;
  lantai: number;
  kapasitas: number;
  luas_ruangan: string;
  kondisi: string;
  fasilitas: string;
  keterangan: string;
}

export interface TahunAkademik {
  id: number;
  tahun_akademik: string;
  semester: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  status: string;
  keterangan: string;
}

export interface PrestasiSiswa {
  id: number;
  siswa_id: string;
  kelas_id: string;
  jurusan_id: string;
  prestasi_diraih: string;
}