// Type untuk rombel dalam list (nested structure)
export interface RombelInList {
  rombel_id: number;
  nama_rombel: string;
  status_rombel: "aktif" | "arsip";
}

// Type untuk jurusan dalam index (nested by jurusan)
export interface JurusanInRombel {
  jurusan_id: number;
  nama_jurusan: string;
  status_jurusan: "aktif" | "arsip";
  rombels: RombelInList[];
}

// Type untuk kelas dalam index (top level grouping)
export interface KelasInRombel {
  kelas_id: number;
  nama_kelas: string;
  tingkat: number;
  status_kelas: "aktif" | "arsip";
  jurusans: JurusanInRombel[];
}

// Type untuk detail rombel - Wali
export interface WaliInPeriode {
  wali_id: number;
  nama_wali: string;
}

// Type untuk detail rombel - Siswa
export interface SiswaInPeriode {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  status_akhir?: "naik_kelas" | "tinggal_kelas" | "lulus" | "pindah" | "keluar" | null;
  catatan?: string | null;
}

// Type untuk detail rombel - Jadwal Pelajaran
export interface JadwalPelajaranDetail {
  jadwal_id: number;
  mata_pelajaran: string;
  hari: string;
  guru_pengajar: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string;
  link_opsional?: string;
}

// Type untuk detail rombel - Semester
export interface SemesterInPeriode {
  semester_id: number;
  semester: "Ganjil" | "Genap";
  jadwal_pelajaran: JadwalPelajaranDetail[];
}

// Type untuk detail rombel - Periode (per tahun akademik)
export interface PeriodeRombel {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  wali: WaliInPeriode | null;
  siswa: SiswaInPeriode[];
  semester: SemesterInPeriode[];
}

// Type untuk detail rombel (response show)
export interface RombelDetail {
  rombel_id: number;
  nama_rombel: string;
  status_rombel: "aktif" | "arsip";
  kelas: {
    kelas_id: number;
    kelas: string;
    tingkat: number;
  };
  jurusan: {
    jurusan_id: number;
    nama_jurusan: string;
  };
  periode: PeriodeRombel[];
}

// Type untuk data select
export interface KelasForSelect {
  kelas_id: number;
  nama_kelas: string;
  tingkat_kelas: number;
}

export interface JurusanForSelect {
  jurusan_id: number;
  nama_jurusan: string;
}

export interface DataSelectRombel {
  kelas: KelasForSelect[];
  jurusan: JurusanForSelect[];
}

// Type untuk form create
export interface RombelCreateFormData {
  kelas_id: number | string;
  nama_rombel: string;
  jurusan_id: number | string | null;
}

// Type untuk form edit
export interface RombelEditFormData extends RombelCreateFormData {
  status: "aktif" | "arsip" | "";
}

// Type untuk response API
export interface RombelResponse {
  status: string;
  message: string;
  data: KelasInRombel[];
}

export interface RombelDetailResponse {
  status: string;
  message: string;
  data: RombelDetail;
}

export interface RombelSelectResponse {
  status: string;
  message: string;
  data: DataSelectRombel;
}
