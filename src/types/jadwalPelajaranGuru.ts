// ============================================================
// Types untuk Jadwal Pelajaran — sesuai response backend
// ============================================================

// ── Data Select (GET /spa/data-select/jadwal-pelajaran) ──────

export interface KurikulumMataPelajaranForSelect {
  kurikulum_mata_pelajaran_id: number;
  kurikulum: string;
  mata_pelajaran: string;
  tingkat: number;
  status_mata_pelajaran: "wajib" | "pilihan";
}

export interface GuruForSelectJadwal {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  nuptk: string | null;
}

export interface RombelForSelectJadwal {
  rombel_id: number;
  nama_rombel: string;
  jurusan: string | null;
  kelas: string;
  tingkat: number;
}

export interface RuanganForSelect {
  ruangan_id: number;
  nama_ruangan: string;
  kode_ruangan: string;
  jenis_ruangan: string | null;
}

export interface DataSelectJadwalPelajaran {
  kurikulum_mata_pelajaran: KurikulumMataPelajaranForSelect[];
  guru: GuruForSelectJadwal[];
  rombel: RombelForSelectJadwal[];
  ruangan: RuanganForSelect[];
}

export interface DataSelectJadwalPelajaranResponse {
  status: string;
  message: string;
  data: DataSelectJadwalPelajaran;
}

// ── Index (GET /spa/jadwal-pelajaran) ────────────────────────

export interface JadwalPelajaranItem {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string;
  hari: Hari;
  jam_mulai: string; // "07:30:00"
  jam_selesai: string; // "08:30:00"
  rombel: string;
  jurusan: string | null;
  ruangan: string | null;
  link_opsional: string | null;
}

export interface GuruInIndex {
  guru_id: number;
  guru: string;
  jadwals: JadwalPelajaranItem[];
}

export interface SemesterInIndex {
  semester_id: number;
  semester: string;
  gurus: GuruInIndex[];
}

export interface TahunAkademikInIndex {
  tahun_akademik_id: number;
  tahun_akademik: string;
  semesters: SemesterInIndex[];
}

export interface JadwalPelajaranIndexResponse {
  status: string;
  message: string;
  data: TahunAkademikInIndex[];
}

// ── Histori per Guru (GET /spa/jadwal-pelajaran/:guru_id) ────

export interface JadwalPelajaranInHistori {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string;
  hari: Hari;
  rombel: string;
  jurusan: string | null;
  tingkat: number;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string | null;
  link_opsional: string | null;
}

export interface SemesterInHistori {
  semester_id: number;
  semester: string;
  status_semester: "aktif" | "arsip";
  jadwal_pelajarans: JadwalPelajaranInHistori[];
}

export interface PeriodeJadwalPelajaran {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun: "aktif" | "arsip";
  semesters: SemesterInHistori[];
}

export interface HistoriJadwalPelajaran {
  guru_id: number;
  nama: string;
  nip: string | null;
  nuptk: string | null;
  periode: PeriodeJadwalPelajaran[];
}

export interface HistoriJadwalPelajaranResponse {
  status: string;
  message: string;
  data: HistoriJadwalPelajaran[]; // ⚠️ array!
}

// ── Form Data ────────────────────────────────────────────────

export type Hari = "Senin" | "Selasa" | "Rabu" | "Kamis" | "Jumat" | "Sabtu" | "Minggu";

export const HARI_OPTIONS: Hari[] = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export interface JadwalPelajaranCreateFormData {
  kurikulum_mata_pelajaran_id: number | string;
  hari: Hari | "";
  guru_id: number | string;
  rombel_id: number | string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan_id: number | string;
  link_opsional: string;
}

export interface JadwalPelajaranEditFormData {
  kurikulum_mata_pelajaran_id: number | string;
  hari: Hari | "";
  guru_id: number | string;
  rombel_id: number | string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan_id: number | string;
  link_opsional: string;
}
