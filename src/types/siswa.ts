// Base types
export interface TahunAkademik {
  id: number;
  tahun_akademik: string;
  status: string;
}

export interface Jurusan {
  id: number;
  nama_jurusan: string;
}

export interface Kelas {
  id: number;
  nama_kelas: string;
  tingkat: number;
  jurusan?: Jurusan;
}

export interface Guru {
  id: number;
  nama: string;
}

export interface Rombel {
  id: number;
  nama_rombel: string;
  kelas?: Kelas;
  tahunAkademik?: TahunAkademik;
  waliRombel?: Guru;
}

export interface MataPelajaran {
  id: number;
  nama_pelajaran: string;
}

export interface Ruangan {
  id: number;
  nama_ruangan: string;
}

export interface Semester {
  id: number;
  semester: string;
  tahunAkademik?: TahunAkademik;
}

export interface KurikulumMataPelajaran {
  id: number;
  mataPelajaran?: MataPelajaran;
  jurusan?: Jurusan;
  tahunAkademik?: TahunAkademik;
  tingkat: number;
}

export interface JadwalPelajaran {
  id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  link_opsional?: string;
  semester?: Semester;
  guru?: Guru;
  ruangan?: Ruangan;
  kurikulumMataPelajaran?: KurikulumMataPelajaran;
}

export interface SiswaRombel {
  id: number;
  rombel?: Rombel & {
    jadwalPelajarans?: JadwalPelajaran[];
  };
}

export interface Ekstrakurikuler {
  id: number;
  nama_ekstrakurikuler: string;
  anggaran?: number;
  status: string;
}

export interface EkskulSiswa {
  id: number;
  sikap?: string;
  status: string;
  tahunAkademik?: TahunAkademik;
  ekstrakurikuler?: Ekstrakurikuler;
}

export interface Prestasi {
  id: number;
  prestasi_diraih: string;
  tingkat?: string;
  juara?: string;
  tahunAkademik?: TahunAkademik;
}

// Main Siswa type
export interface Siswa {
  id: number;
  siswa_id?: number;
  nisn: string;
  nis: string;
  nama: string;
  email: string;
  role: string;
  status: string;
  nama_jurusan?: string;

  // Relations
  siswaRombels?: SiswaRombel[];
  ekskulSiswa?: EkskulSiswa[];
  prestasis?: Prestasi[];

  // Legacy compatibility
  kelas?: string | Kelas & {
    wali_kelas?: Guru;
  };
  nama_ekstrakurikuler?: string;
}

// API Response types
export interface SiswaListResponse {
  status: string;
  message: string;
  data: {
    status: string;
    total: number;
    siswa: Siswa[];
  }[];
}

export interface SiswaDetailResponse {
  status: string;
  message: string;
  data: {
    siswa_id: number;
    nama: string;
    nisn: string;
    nis: string;
    email: string;
    status: string;
    jurusan_siswa?: string;
    histori_rombel: HistoriRombel[];
    histori_ekstrakurikuler: HistoriEkstrakurikuler[];
    histori_prestasi: HistoriPrestasi[];
  };
}

export interface HistoriRombel {
  rombel_id: number;
  nama_rombel: string;
  kelas_id: number;
  kelas: string;
  tingkat: number;
  jurusan_kelas: string;
  wali_rombel: string;
  tahun_akademik_rombel_id: number;
  tahun_akademik_rombel: string;
  status_tahun_akademik_rombel: string;
  histori_jadwal_pelajaran: HistoriJadwalPelajaran[];
}

export interface HistoriJadwalPelajaran {
  semester_id: number;
  semester: string;
  tahun_akademik_semester: string;
  jadwal_pelajaran: JadwalDetail[];
}

export interface JadwalDetail {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string;
  jurusan_pelajaran: string;
  tahun_akademik_jadwal: string;
  tingkat: number;
  hari: string;
  guru_pengajar: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string;
  link_opsional?: string;
}

export interface HistoriEkstrakurikuler {
  tahun_akademik_ekskul_id: number;
  tahun_akademik_ekskul: string;
  status_tahun_akademik_ekskul: string;
  ekstrakurikuler: {
    ekskul_id: number;
    nama_ekskul: string;
    anggaran_ekskul?: number;
    status_ekskul: string;
    sikap?: string;
    status_aktif: string;
  }[];
}

export interface HistoriPrestasi {
  tahun_akademik_prestasi_id: number;
  tahun_akademik_prestasi: string;
  status_tahun_akademik_prestasi: string;
  prestasi: {
    prestasi_id: number;
    prestasi_diraih: string;
  }[];
}

// Form types
export interface SiswaFormData {
  nisn: string;
  nis: string;
  nama: string;
  email: string;
  status: string;
}

export interface SiswaCreateFormData extends SiswaFormData {
  password: string;
  password_confirmation: string;
}