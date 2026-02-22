// ================================================================
// TIPE DATA PEMBINA EKSTRAKURIKULER
// Disesuaikan dengan response API
// ================================================================

// ── GET DETAIL (histori membina per pembina_id) ─────────────────
export interface EkskulPeriodePembina {
  ekskul_id: number;
  nama_ekskul: string;
  anggaran: string | number;
  status_ekskul: "wajib" | "pilihan" | "jurusan";
  status_aktif_ekskul: "aktif" | "arsip";
}

export interface PeriodePembina {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  ekstrakurikuler: EkskulPeriodePembina[];
}

export interface DetailPembinaEkskul {
  pembina_id: number;
  nama_pembina: string;
  nip: string;
  nuptk: string;
  periode: PeriodePembina[];
}

// ── GET DATA SELECT ─────────────────────────────────────────────
export interface PembinaSelectItem {
  pembina_id: number;
  nama_pembina: string;
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

export interface DataSelectPembinaEkskul {
  pembina: PembinaSelectItem[];
  ekskul: EkskulSelectItem[];
}

// ── CREATE REQUEST ──────────────────────────────────────────────
export interface CreatePembinaEkskulRequest {
  pembina_id: number;
  ekstrakurikuler_id: number;
}

// ── UPDATE REQUEST ──────────────────────────────────────────────
export interface UpdatePembinaEkskulRequest {
  pembina_id: number;
}

// ── CREATE RESPONSE ─────────────────────────────────────────────
export interface CreatePembinaEkskulResponse {
  id: number; // pivot id
  pembina: string;
  ekstrakurikuler: string;
  tahun_akademik: string;
}
