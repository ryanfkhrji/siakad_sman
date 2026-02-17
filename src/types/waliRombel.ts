// ============================================================
// Types untuk Wali Rombel — sesuai response backend
// ============================================================

// ── Data Select (GET /spa/data-select/wali-rombel) ───────────

export interface GuruForSelect {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  nuptk: string | null;
}

export interface RombelForSelect {
  rombel_id: number;
  nama_rombel: string;
  kelas: string;
  jurusan: string | null;
  tingkat: number;
}

export interface DataSelectWaliRombel {
  guru: GuruForSelect[];
  rombel: RombelForSelect[];
}

export interface DataSelectWaliRombelResponse {
  status: string;
  message: string;
  data: DataSelectWaliRombel;
}

// ── Histori (GET /spa/wali-rombel/:guru_id) ──────────────────

// Satu entry rombel di dalam periode
// ⚠️ field "rombel" bukan "nama_rombel"
export interface RombelInPeriode {
  wali_rombel_id: number;
  rombel: string; // "X-B-1"
  kelas: string; // "X"
  jurusan: string | null;
  tingkat: number;
}

// Satu periode per tahun akademik
export interface PeriodeWaliRombel {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  rombels: RombelInPeriode[];
}

// Root data histori
export interface WaliRombelHistori {
  guru_id: number;
  nama_guru: string;
  nip: string | null;
  nuptk: string | null;
  periode: PeriodeWaliRombel[];
}

export interface WaliRombelHistoriResponse {
  status: string;
  message: string;
  data: WaliRombelHistori;
}

// ── Form Data ────────────────────────────────────────────────

export interface WaliRombelCreateFormData {
  wali_rombel_id: number | string;
  rombel_id: number | string;
}

export interface WaliRombelEditFormData {
  wali_rombel_id: number | string;
}

// ── Index view (flatten untuk tabel) ────────────────────────

export interface WaliRombelItem {
  wali_rombel_id: number;
  nama_guru: string;
  nip: string | null;
  nama_rombel: string; // dari RombelInPeriode.rombel
  kelas: string;
  jurusan: string | null;
  tingkat: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
}
