// ================================================================
// TIPE DATA SISWA EKSTRAKURIKULER
// ================================================================

// ── GET DETAIL (histori ekskul per siswa_id) ────────────────────
export interface EkskulPeriodeSiswa {
  ekskul_id: number;
  nama_ekskul: string;
  anggaran: string | number;
  status_ekskul: "wajib" | "pilihan" | "jurusan";
  status_aktif_ekskul: "aktif" | "arsip";
  sikap: "Sangat Baik" | "Baik" | "Cukup" | "Kurang" | null;
  status_kehadiran: "Aktif" | "Cukup Aktif" | "Kurang Aktif" | "Tidak Aktif" | null;
}

export interface PeriodeSiswaEkskul {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  ekstrakurikulers: EkskulPeriodeSiswa[];
}

export interface DetailSiswaEkskul {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  periode: PeriodeSiswaEkskul[];
}

// ── GET DATA SELECT ─────────────────────────────────────────────
export interface SiswaSelectItem {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
}

export interface EkskulSelectItem {
  ekskul_id: number;
  nama_ekskul: string;
  anggaran: string | number;
  status: "wajib" | "pilihan" | "jurusan";
  status_aktif: "aktif" | "arsip";
}

export interface DataSelectSiswaEkskul {
  siswa: SiswaSelectItem[];
  ekskul: EkskulSelectItem[];
}

// ── CREATE REQUEST ──────────────────────────────────────────────
export interface CreateSiswaEkskulRequest {
  siswa_id: number;
  ekstrakurikuler_id: number;
}

// ── UPDATE REQUEST ──────────────────────────────────────────────
export interface UpdateSiswaEkskulRequest {
  sikap?: "Sangat Baik" | "Baik" | "Cukup" | "Kurang" | null;
  status?: "Aktif" | "Cukup Aktif" | "Kurang Aktif" | "Tidak Aktif" | null;
}
