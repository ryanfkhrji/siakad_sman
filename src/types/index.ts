

export interface Jurusan {
  id: number;
  nama_jurusan: string;
  jumlah_siswa: number;
}

export interface MataPelajaran {
  id: number;
  nama_pelajaran: string;
  status: string;
  nilai_kkm: number;
}

export interface Ekskul {
  id: number;
  nama_ekstrakurikuler: string;
  nama_pengajar: string | null;
  anggaran: number;
  status: string;
  jumlah_peserta: number;
  sikap: string | null;
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