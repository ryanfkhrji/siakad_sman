// ========================
// TYPE: Kurikulum (List)
// GET /spa/kurikulum
// ========================
export interface Kurikulum {
  id: number;
  nama_kurikulum: string;
  tipe: "KTSP" | "K13" | "MERDEKA";
  status: "aktif" | "arsip";
}

// ========================
// TYPE: Kurikulum Detail
// GET /spa/kurikulum/:id
// ========================
export interface KurikulumDetail {
  id: number;
  nama_kurikulum: string;
  kode_kurikulum: string;
  tipe: "KTSP" | "K13" | "MERDEKA";
  tahun_mulai: string | null;
  tahun_selesai: string | null;
  status: "aktif" | "arsip";
  deskripsi: string | null;
}
