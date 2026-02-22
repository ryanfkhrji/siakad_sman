// ================================================================
// TIPE DATA EKSTRAKURIKULER
// Disesuaikan dengan response API terbaru
// ================================================================

// ── GET ALL (/spa/ekstrakurikuler) ──────────────────────────────
export interface EkskulItem {
  id: number;
  nama_ekskul: string;
  anggaran: string | number;
  status: "wajib" | "pilihan" | "jurusan";
  status_aktif: "aktif" | "arsip";
}

// ── GET DETAIL (/spa/ekstrakurikuler/:id) ───────────────────────
export interface SiswaPeriode {
  siswa_id: number;
  siswa_pivot_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  sikap: string | null;
  status: string | null;
  tahun_akademik: string;
}

export interface PembinaAnggota {
  pembina_id: number | null;
  pembina_pivot_id: number | null;
  nama_pembina: string | null;
  tahun_membina: string | null;
}

export interface PelatihAnggota {
  pelatih_id: number | null;
  pelatih_pivot_id: number | null;
  nama_pelatih: string | null;
  tahun_melatih: string | null;
}

export interface AnggotaPeriode {
  pembina: PembinaAnggota;
  pelatih: PelatihAnggota;
  siswa: SiswaPeriode[];
}

export interface PeriodeEkskul {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  anggota: AnggotaPeriode;
}

export interface EkskulDetail {
  id: number;
  nama_ekskul: string;
  anggaran: string | number;
  status: "wajib" | "pilihan" | "jurusan";
  status_aktif: "aktif" | "arsip";
  periode: PeriodeEkskul[];
}

// ── CREATE REQUEST ──────────────────────────────────────────────
export interface CreateEkskulRequest {
  nama_ekstrakurikuler: string;
  anggaran: number;
  status: "wajib" | "pilihan" | "jurusan";
}

// ── UPDATE REQUEST ──────────────────────────────────────────────
export interface UpdateEkskulRequest {
  nama_ekstrakurikuler?: string;
  anggaran?: number;
  status?: "wajib" | "pilihan" | "jurusan";
  status_aktif?: "aktif" | "arsip";
}

// ── API RESPONSE WRAPPER ────────────────────────────────────────
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ── DETAIL RESPONSE (data dibungkus array) ──────────────────────
export interface EkskulDetailResponse {
  data: EkskulDetail[];
}
