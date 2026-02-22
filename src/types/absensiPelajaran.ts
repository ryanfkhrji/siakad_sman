// ============================================================
// Types untuk Absensi Pelajaran Guru - Super Admin
// ============================================================

// ── GET ALL (INDEX) ──────────────────────────────────────────
// Response: tahun_akademik → guru[] (hanya rekap, bukan per absensi)

export interface GuruRekap {
  guru_id: number;
  nama_guru: string;
  hadir_pertahun: number;
  tidak_hadir_pertahun: number;
}

export interface TahunAkademikRekap {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  guru: GuruRekap[];
}

// Flat untuk tabel index (hasil flatten dari TahunAkademikRekap[])
export interface AbsensiPelajaranFlat {
  guru_id: number;
  nama_guru: string;
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  hadir_pertahun: number;
  tidak_hadir_pertahun: number;
  is_editable: boolean; // true jika status_tahun_akademik === "aktif"
}

// ── GET DETAIL (SHOW BY GURU ID) ─────────────────────────────
// Response: guru → periode → semesters → jadwal_pelajarans → absensi[]

export interface AbsensiItemDetail {
  absensi_id: number;
  hari: string; // "Minggu, 05 Mei 2024"
  status: "hadir" | "tidak hadir";
}

export interface JadwalPelajaranDetail {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string;
  hari: string; // "Senin" (hari jadwal, bukan tanggal)
  rombel: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string;
  link_opsional: string;
  absensi: AbsensiItemDetail[];
}

export interface SemesterDetail {
  semester_id: number;
  semester: string;
  status_semester: string;
  total_hadir_persemester: number;
  total_tidak_hadir_persemester: number;
  jadwal_pelajarans: JadwalPelajaranDetail[];
}

export interface PeriodeDetail {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  total_hadir_pertahun: number;
  total_tidak_hadir_pertahun: number;
  semesters: SemesterDetail[];
}

export interface GuruDetail {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  nuptk: string | null;
  periode: PeriodeDetail[];
}

// ── SELF SERVICE (PEGAWAI) ───────────────────────────────────

export interface AbsensiPelajaranDetail {
  id: number;
  kelas: string;
  hari: string;
  jam: string;
  status: "hadir" | "tidak hadir";
}

export interface AbsensiPelajaranSelf {
  guru_pengajar_id: number;
  nama_guru: string;
  mengajar: string;
  wali_kelas: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiPelajaranDetail[];
}

export interface CreateAbsensiPelajaranResponse {
  id: number;
  guru_pengajar_id: string;
  mata_pelajaran_id: string;
  kelas: string;
  hari: string;
  jam: string;
  status: string;
  rekapitulasi: {
    hadir: number;
    tidak_hadir: number;
  };
}
