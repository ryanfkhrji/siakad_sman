// ================================================================
// TIPE DATA ABSENSI SISWA - PELAJARAN
// Disesuaikan dengan response API terbaru
// ================================================================

// ── GET ALL (/spa/absensi/siswa/pelajaran) ──────────────────────
export interface SiswaRekap {
  siswa_id: number;
  nama: string;
  nisn: string;
  hadir_pertahun: number;
  izin_pertahun: number;
  sakit_pertahun: number;
  alfa_pertahun: number;
}

export interface RombelRekap {
  rombel_id: number;
  nama_rombel: string;
  tingkat: number;
  siswa: SiswaRekap[];
}

export interface TahunAkademikAbsensiSiswa {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun: "aktif" | "arsip";
  rombel: RombelRekap[];
}

// ── GET DETAIL (/spa/absensi/siswa/pelajaran/:id) ───────────────
export interface AbsensiItem {
  absensi_id: number;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
}

export interface MataPelajaranAbsensi {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string;
  absensi: AbsensiItem[];
}

export interface TotalStatus {
  hadir: number;
  izin: number;
  sakit: number;
  alfa: number;
}

export interface SemesterAbsensi {
  semester_id: number;
  semester: string;
  status_semester: "aktif" | "arsip";
  total_status: TotalStatus;
  mata_pelajarans: MataPelajaranAbsensi[];
}

export interface PeriodeAbsensi {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun: "aktif" | "arsip";
  total_status_tahun: TotalStatus;
  semester: SemesterAbsensi[];
}

export interface HistoriRombel {
  rombel_id: number;
  nama_rombel: string;
  periode: PeriodeAbsensi[];
}

export interface DetailAbsensiSiswaData {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  histori_rombel: HistoriRombel[];
}

// ── UPDATE RESPONSE ─────────────────────────────────────────────
export interface UpdateAbsensiSiswaResponse {
  id: number;
  siswa: string;
  rombel: string;
  mata_pelajaran: string;
  hari: string;
  status_kehadiran: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  semester: string;
  status_semester: "aktif" | "arsip";
}

// ── FLAT ROW (untuk keperluan tabel di index page) ──────────────
// Hasil flatten dari TahunAkademikAbsensiSiswa[]
export interface AbsensiSiswaFlat {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  rombel_id: number;
  nama_rombel: string;
  tingkat: number;
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun: "aktif" | "arsip";
  hadir_pertahun: number;
  izin_pertahun: number;
  sakit_pertahun: number;
  alfa_pertahun: number;
}

// ── SELF (SISWA LOGIN) ──────────────────────────────────────────
export interface AbsensiSiswaSelf {
  siswa_id: number;
  nama_siswa: string;
  kelas_id: number | null;
  kelas: string | null;
  tahun_akademik: TahunAkademikSelf[];
}

export interface TahunAkademikSelf {
  tahun_akademik: string;
  status_tahun_akademik: string;
  semester: SemesterSelf[];
  status_semester: string;
}

export interface SemesterSelf {
  semester: string;
  total: TotalStatus;
  absensi: AbsensiSelfItem[];
}

export interface AbsensiSelfItem {
  id: number;
  mata_pelajaran: string;
  hari: string;
  status_kehadiran: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
}

// ── CREATE (SISWA) ──────────────────────────────────────────────
export interface CreateAbsensiSiswaRequest {
  mata_pelajaran_id: number;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti?: File | null;
}

export interface CreateAbsensiSiswaResponse {
  id: number;
  siswa: string;
  kelas: string;
  mata_pelajaran: string;
  hari: string;
  status_kehadiran: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
  tahun_akademik: string;
  status_tahun_akademik: string;
}

// ── LEGACY ALIAS (agar tidak breaking pada komponen lain) ───────
/** @deprecated Gunakan DetailAbsensiSiswaData */
export type AbsensiSiswa = DetailAbsensiSiswaData;
