// ============================================================
// Types untuk Siswa Rombel — sesuai response backend
// ============================================================

// ── Data Select (GET /spa/siswa/data-select/rombel) ──────────

export interface SiswaForSelect {
  siswa_id: number;
  nama_siswa: string;
  nisn: string | null;
  nis: string | null;
}

export interface RombelForSelectSiswa {
  rombel_id: number;
  nama_rombel: string;
  jurusan: string | null;
}

export interface DataSelectSiswaRombel {
  siswa: SiswaForSelect[];
  rombels: RombelForSelectSiswa[]; // ⚠️ "rombels" bukan "rombel"
}

export interface DataSelectSiswaRombelResponse {
  status: string;
  message: string;
  data: DataSelectSiswaRombel;
}

// ── Histori (GET /spa/siswa-rombel/:siswa_id) ────────────────

export interface KelasInRombel {
  id: number;
  nama_kelas: string;
  tingkat: number;
  status: string;
}

export interface WaliRombelInHistori {
  id: number | null;
  nama: string | null;
  nip: string | null;
  nuptk: string | null;
  status: string | null;
}

export interface RombelInHistori {
  id: number;
  nama_rombel: string;
  jurusan: string | null;
  status: string;
  kelas: KelasInHistori;
  wali_rombel: WaliRombelInHistori;
}

export interface KelasInHistori {
  id: number;
  nama_kelas: string;
  tingkat: number;
  status: string;
}

export interface HistoriRombelItem {
  siswa_rombel_id: number;
  status_akhir: StatusAkhir | null;
  catatan: string | null;
  rombel: RombelInHistori;
}

export interface PeriodeSiswaRombel {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  histori_rombel: HistoriRombelItem[];
}

// Root data histori siswa — response: data adalah array
export interface SiswaRombelHistori {
  siswa_id: number;
  nama_siswa: string;
  nisn: string | null;
  nis: string | null;
  status_siswa: string;
  periode: PeriodeSiswaRombel[];
}

export interface SiswaRombelHistoriResponse {
  status: string;
  message: string;
  data: SiswaRombelHistori[]; // ⚠️ data adalah array!
}

// ── Form Data ────────────────────────────────────────────────

export interface SiswaRombelCreateFormData {
  siswa_id: number | string;
  rombel_id: number | string;
}

// Edit hanya bisa update status_akhir dan catatan
export type StatusAkhir = "naik_kelas" | "tinggal_kelas" | "pindah" | "pindahan" | "berhenti" | "diberhentikan" | "lulus";

export interface SiswaRombelEditFormData {
  status_akhir: StatusAkhir | "";
  catatan: string;
}

// Label display untuk status_akhir
export const STATUS_AKHIR_LABEL: Record<StatusAkhir, string> = {
  naik_kelas: "Naik Kelas",
  tinggal_kelas: "Tinggal Kelas",
  pindah: "Pindah",
  pindahan: "Pindahan",
  berhenti: "Berhenti",
  diberhentikan: "Diberhentikan",
  lulus: "Lulus",
};

// Warna badge untuk status_akhir
export const STATUS_AKHIR_COLOR: Record<StatusAkhir, string> = {
  naik_kelas: "bg-green-100 text-green-800",
  tinggal_kelas: "bg-red-100 text-red-800",
  pindah: "bg-yellow-100 text-yellow-800",
  pindahan: "bg-blue-100 text-blue-800",
  berhenti: "bg-gray-100 text-gray-800",
  diberhentikan: "bg-red-200 text-red-900",
  lulus: "bg-purple-100 text-purple-800",
};
