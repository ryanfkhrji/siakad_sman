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
  nip?: string;
  keterangan?: string;
  role: string;
  kelas?: Kelas | null;
}

export interface Siswa {
  id: number;
  nisn: string;
  nama: string;
  nis: string;
  kelas?: Kelas | null;
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

export interface Ekskul {
  id: number;
  nama_ekstrakurikuler: string;
  nama_pengajar: string | null;
  anggaran: number;
  status: string;
  jumlah_peserta: number;
  peserta: Siswa[];
}