export interface TahunAkademik {
  id: number;
  tahun_akademik: string;
  status: string;
}

export interface Kelas {
  id: number;
  nama_kelas: string;
  tingkat: number;
  jurusan?: {
    nama_jurusan: string;
  };
}

export interface Rombel {
  id: number;
  nama_rombel: string;
  kelas: Kelas;
  tahunAkademik: TahunAkademik;
}

export interface Ekstrakurikuler {
  id: number;
  nama_ekstrakurikuler: string;
}

export interface PelatihEkskul {
  id: number;
  ekstrakurikuler_id: number;
  ekstrakurikuler: Ekstrakurikuler;
  tahunAkademik: TahunAkademik;
}

export interface PembinaEkskul {
  id: number;
  ekstrakurikuler_id: number;
  ekstrakurikuler: Ekstrakurikuler;
  tahunAkademik: TahunAkademik;
}

export interface MataPelajaran {
  id: number;
  nama_pelajaran: string;
}

export interface KurikulumMataPelajaran {
  id: number;
  mataPelajaran: MataPelajaran;
  jurusan?: {
    nama_jurusan: string;
  };
  tingkat: number;
  status_mata_pelajaran: string;
  nilai_kkm: number;
  tahunAkademik: TahunAkademik;
}

export interface Semester {
  id: number;
  semester: string;
  status: string;
  tahunAkademik: TahunAkademik;
}

export interface Ruangan {
  gedung_id: number;
  kode_ruangan: string;
  nama_ruangan: string;
  jenis_ruangan: string;
  lantai: number;
  kapasitas: number;
}

export interface JadwalPelajaran {
  id: number;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  rombel: {
    nama_rombel: string;
  };
  ruangan: Ruangan | null;
  link_opsional?: string;
  mataPelajaran: MataPelajaran;
  kurikulumMataPelajaran: KurikulumMataPelajaran;
  semester: Semester;
}

export interface Kepegawaian {
  id: number;
  nama: string;
  email?: string;
  nip: string;
  nuptk: string;
  keterangan?: string;
  role: string;
  status: string;
  // Relasi
  rombels?: Rombel[];
  pelatihEkskul?: PelatihEkskul[];
  pembinaEkskul?: PembinaEkskul[];
  jadwalPelajarans?: JadwalPelajaran[];
}

export interface KepegawaianDetail extends Kepegawaian {
  histori_wali_rombel: Array<{
    rombel_id: number;
    nama_rombel: string;
    kelas_id: number;
    nama_kelas: string;
    tingkat_kelas: number;
    jurusan_kelas?: string;
    tahun_akademik_rombel: string;
    status_tahun_akademik_rombel: string;
  }>;
  histori_pelatih_ekskul: Array<{
    pelatih_id: number;
    ekskul_id: number;
    nama_ekskul: string;
    tahun_akademik_melatih: string;
    status_tahun_akademik_melatih: string;
  }>;
  histori_pembina_ekstrakurikuler: Array<{
    pembina_id: number;
    ekstrakurikuler_id: number;
    nama_ekstrakurikuler: string;
    tahun_akademik_membina: string;
    status_tahun_akademik_membina: string;
  }>;
  histori_jadwal_pelajaran: Array<{
    tahun_akademik_id: number;
    tahun_akademik: string;
    status_tahun_akademik: string;
    semester: Array<{
      semester_id: number;
      semester: string;
      status_semester: string;
      jadwal: Array<{
        jadwal_pelajaran_id: number;
        hari: string;
        jam_mulai: string;
        jam_selesai: string;
        rombel: {
          nama_rombel?: string | null;
        };
        ruangan?: {
          kode_ruangan?: string | null;
          nama_ruangan?: string | null;
        } | null;
        link_opsional?: string | null;
        mata_pelajaran: {
          nama_pelajaran?: string | null;
          jurusan_pelajaran?: string | null;
          tingkat_pelajaran?: number | null;
          status_pelajaran?: string | null;
          kkm?: number | null;
          tahun_akdemik_pelajaran?: string | null;
          status_tahun_akdemik_pelajaran?: string | null;
        };
      }>;
    }>;
  }>;
}
