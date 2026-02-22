// ================================================================
// TIPE DATA PELATIH EKSTRAKURIKULER
// Disesuaikan dengan response API
// ================================================================

// ── GET DETAIL (histori melatih per pelatih_id) ─────────────────
export interface EkskulPeriodePelatih {
  ekskul_id: number;
  nama_ekskul: string;
  anggaran: string | number;
  status_ekskul: "wajib" | "pilihan" | "jurusan";
  status_aktif_ekskul: "aktif" | "arsip";
}

export interface PeriodePelatih {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  ekstrakurikuler: EkskulPeriodePelatih[];
}

export interface DetailPelatihEkskul {
  pelatih_id: number;
  nama_pelatih: string;
  nip: string;
  nuptk: string;
  periode: PeriodePelatih[];
}

// ── GET DATA SELECT ─────────────────────────────────────────────
export interface PelatihSelectItem {
  pelatih_id: number;
  nama_pelatih: string;
  nip: string;
  nuptk: string;
  role: string;
}

export interface EkskulSelectItem {
  ekskul_id: number;
  nama_ekskul: string;
  anggaran: string | number;
  status: "wajib" | "pilihan" | "jurusan";
  status_aktif: "aktif" | "arsip";
}

export interface DataSelectPelatihEkskul {
  pelatih: PelatihSelectItem[];
  ekskul: EkskulSelectItem[];
}

// ── CREATE REQUEST ──────────────────────────────────────────────
export interface CreatePelatihEkskulRequest {
  pelatih_id: number;
  ekstrakurikuler_id: number;
}

// ── UPDATE REQUEST ──────────────────────────────────────────────
export interface UpdatePelatihEkskulRequest {
  pelatih_id: number;
}

// ── CREATE RESPONSE ─────────────────────────────────────────────
export interface CreatePelatihEkskulResponse {
  id: number; // pivot id
  pelatih: string;
  ekstrakurikuler: string;
  tahun_akademik: string;
}
