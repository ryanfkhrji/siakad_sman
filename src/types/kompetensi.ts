// Type untuk data kompetensi dalam index (grouped)
export interface KompetensiInGroup {
  kompetensi_id: number;
  judul_kompetensi: string;
  jenis: "KD" | "CP";
  kode: string;
  aspek?: "sikap" | "pengetahuan" | "keterampilan"; // Hanya untuk KD (K13)
  status: "aktif" | "arsip";
}

export interface MataPelajaranInKompetensi {
  mata_pelajaran_id: number;
  mata_pelajaran: string;
  kompetensi: KompetensiInGroup[];
}

// Untuk K13 (KD) - grouped by tingkat
export interface TingkatInKompetensi {
  tingkat: string; // "10", "11", "12"
  mata_pelajaran: MataPelajaranInKompetensi[];
}

// Untuk Merdeka (CP) - grouped by fase
export interface FaseInKompetensi {
  fase: "A" | "B" | "C" | "D" | "E" | "F";
  mata_pelajaran: MataPelajaranInKompetensi[];
}

// Type untuk response index yang grouped by tipe kurikulum
export interface KompetensiGroupedByTipe {
  tipe_kurikulum: "K13" | "MERDEKA" | "KTSP";
  data: TingkatInKompetensi[] | FaseInKompetensi[];
}

// Type untuk detail kompetensi (response show)
export interface KompetensiDetail {
  id: number;
  kurikulum: string;
  mata_pelajaran: string;
  judul_kompetensi: string;
  jenis: "KD" | "CP";
  kode: string;
  tingkat?: string; // Untuk KD (K13)
  aspek?: "sikap" | "pengetahuan" | "keterampilan"; // Untuk KD (K13)
  fase?: "A" | "B" | "C" | "D" | "E" | "F"; // Untuk CP (Merdeka)
  status_kompetensi: "aktif" | "arsip";
  deskripsi?: string; // Untuk CP (Merdeka)
}

// Type untuk data select (dropdown)
export interface KurikulumSelect {
  kurikulum_id: number;
  nama_kurikulum: string;
  tipe: "KTSP" | "K13" | "MERDEKA";
  status: "aktif" | "arsip";
}

export interface MataPelajaranSelect {
  mata_pelajaran_id: number;
  nama_pelajaran: string;
  kode_mapel_diknas: string;
  kelompok: string;
  status: "aktif" | "arsip";
}

export interface DataSelectKompetensi {
  kurikulum: KurikulumSelect[];
  mata_pelajaran: MataPelajaranSelect[];
}

// Type untuk form create
export interface KompetensiCreateFormData {
  kurikulum_id: number | string;
  mata_pelajaran_id: number | string;
  judul_kompetensi: string;
  jenis: "KD" | "CP" | "";
  kode: string;
  tingkat?: string; // Untuk KD (K13)
  aspek?: "sikap" | "pengetahuan" | "keterampilan" | ""; // Untuk KD (K13)
  fase?: "A" | "B" | "C" | "D" | "E" | "F" | ""; // Untuk CP (Merdeka)
  deskripsi: string;
}

// Type untuk form edit
export interface KompetensiEditFormData extends KompetensiCreateFormData {
  status: "aktif" | "arsip" | "";
}

// Type untuk response API
export interface KompetensiResponse {
  status: string;
  message: string;
  data: KompetensiGroupedByTipe[];
}

export interface KompetensiDetailResponse {
  status: string;
  message: string;
  data: KompetensiDetail;
}

export interface KompetensiSelectResponse {
  status: string;
  message: string;
  data: DataSelectKompetensi;
}
