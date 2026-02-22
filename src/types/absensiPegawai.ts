// ============================================================
// Types untuk Absensi Pegawai
// ============================================================

// ── GET ALL (INDEX) ──────────────────────────────────────────
// Field tanggal = "2026-01-30" (format ISO date)

export interface AbsensiItem {
  absensi_id: number;
  tanggal: string;
  status: "hadir" | "tidak hadir";
  mengajar: string | null;
}

export interface SemesterAbsensi {
  semester_id: number;
  semester: string;
  status_semester: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiItem[];
}

export interface PeriodeAbsensi {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  total_hadir: number;
  total_tidak_hadir: number;
  semester: SemesterAbsensi[];
}

export interface AbsensiGuru {
  guru_id: number;
  nama: string;
  nip: string | null;
  nuptk: string | null;
  role: string;
  periode: PeriodeAbsensi[];
}

// ── FLAT (untuk tabel index — hasil flatten dari AbsensiGuru) ─
export interface AbsensiPegawaiFlat {
  absensi_id: number;
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  role: string;
  tanggal: string;
  status: "hadir" | "tidak hadir";
  mengajar: string | null;
  tahun_akademik: string;
  status_tahun_akademik: string;
  semester: string;
  status_semester: string;
  total_hadir_all: number;
  total_tidak_hadir_all: number;
  // true hanya jika tahun akademik DAN semester keduanya aktif
  is_editable: boolean;
}

// ── GET DETAIL (SHOW BY GURU ID) ─────────────────────────────
// Field hari = "Selasa, 25 Februari 2014" (format string Indonesia)

export interface AbsensiDetailItem {
  absensi_id: number;
  hari: string;
  status: "hadir" | "tidak hadir";
  mata_pelajaran_id: number | null;
  nama_mata_pelajaran: string | null;
}

export interface SemesterAbsensiDetail {
  semester: string;
  status_semester: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiDetailItem[];
}

export interface PeriodeAbsensiDetail {
  tahun_akademik: string;
  status_tahun_akademik: string;
  total_hadir: number;
  total_tidak_hadir: number;
  semester: SemesterAbsensiDetail[];
}

export interface AbsensiGuruDetail {
  guru_id: number;
  nama: string;
  periode: PeriodeAbsensiDetail[];
}

// ── SELF SERVICE (PEGAWAI) ───────────────────────────────────

export interface AbsensiDetailSelf {
  id: number;
  hari: string;
  status: "hadir" | "tidak hadir";
}

export interface AbsensiSelf {
  nama: string;
  mata_pelajaran_id: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiDetailSelf[];
}

export interface CreateAbsensiResponse {
  id: number;
  guru_id: string;
  mata_pelajaran_id: string;
  hari: string;
  status: "hadir" | "tidak hadir";
  rekapitulasi: {
    hadir: number;
    tidak_hadir: number;
  };
}
