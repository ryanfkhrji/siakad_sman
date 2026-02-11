// ========================
// TYPE: MataPelajaran (item dalam list)
// ========================
export interface MataPelajaranItem {
  id: number;
  nama_pelajaran: string;
  kode_mapel_diknas: string;
  kelompok: string;
  status: "aktif" | "arsip";
}

// ========================
// TYPE: Struktur grouped getAll
// GET /spa/mata-pelajaran
// ========================
export interface MataPelajaranKelompok {
  kelompok: string;
  mata_pelajarans: Pick<MataPelajaranItem, "id" | "nama_pelajaran" | "kode_mapel_diknas">[];
}

export interface MataPelajaranGroup {
  status: "aktif" | "arsip";
  daftar_kelompok: MataPelajaranKelompok[];
}

// ========================
// TYPE: Detail
// GET /spa/mata-pelajaran/:id
// ========================
export interface MataPelajaranDetail {
  id: number;
  nama_pelajaran: string;
  kode_mapel_diknas: string;
  kelompok: string;
  status: "aktif" | "arsip";
}

// Alias flat untuk tabel (hasil flatten dari grouped)
export type MataPelajaran = MataPelajaranItem;
