// Type untuk mata pelajaran dalam satu tingkat
export interface MataPelajaranInKurikulum {
  kurikulum_mata_pelajaran_id?: number; // ID dari tabel kurikulum_mata_pelajaran
  mata_pelajaran_id: number;
  nama_pelajaran: string;
  kode_mapel_diknas: string;
  nilai_kkm: string;
  kelompok: string | null;
  status_mapel: "wajib" | "pilihan" | "jurusan" | "mulok";
  status_aktif: "aktif" | "arsip";
}

// Type untuk tingkat dalam kurikulum
export interface TingkatInKurikulum {
  tingkat: number;
  mata_pelajaran: MataPelajaranInKurikulum[];
}

// Type untuk kurikulum dengan mata pelajaran (response index)
export interface KurikulumWithMapel {
  kurikulum_id: number;
  kurikulum: string;
  tipe: "KTSP" | "K13" | "MERDEKA";
  status_kurikulum: "aktif" | "arsip";
  tingkat: TingkatInKurikulum[];
}

// Type untuk detail kurikulum mata pelajaran (response show)
export interface KurikulumMataPelajaranDetail {
  kurikulum_mata_pelajaran_id: number;
  kurikulum: {
    kurikulum_id: number;
    nama_kurikulum: string;
    tipe_kurikulum: "KTSP" | "K13" | "MERDEKA";
  };
  mata_pelajaran: {
    mata_pelajaran_id: number;
    nama_pelajaran: string;
    kelompok: string | null;
    status_aktif_mapel: "aktif" | "arsip";
  };
  tingkat: number;
  nilai_kkm: string;
  status_mata_pelajaran: "wajib" | "pilihan" | "jurusan" | "mulok";
  status_aktif_kurmap: "aktif" | "arsip";
}

// Type untuk data select (create/edit)
export interface MataPelajaranSelect {
  mata_pelajaran_id: number;
  nama_pelajaran: string;
  status: "aktif" | "arsip";
}

export interface KelompokMataPelajaran {
  kelompok: string;
  mata_pelajaran: MataPelajaranSelect[];
}

export interface KurikulumSelect {
  kurikulum_id: number;
  nama_kurikulum: string;
  tipe_kurikulum: "KTSP" | "K13" | "MERDEKA";
  status_kurikulum: "aktif" | "arsip";
}

export interface DataSelectKurmap {
  kurikulum: KurikulumSelect[];
  mata_pelajaran: KelompokMataPelajaran[];
}

// Type untuk form create
export interface KurmapCreateFormData {
  kurikulum_id: number | string;
  mata_pelajaran_id: number | string;
  tingkat: number | string;
  nilai_kkm: number | string;
  status_mata_pelajaran: "wajib" | "pilihan" | "jurusan" | "mulok" | "";
}

// Type untuk form edit
export interface KurmapEditFormData extends KurmapCreateFormData {
  status: "aktif" | "arsip" | "";
}

// Type untuk response API
export interface KurmapResponse {
  status: string;
  message: string;
  data: KurikulumWithMapel[];
}

export interface KurmapDetailResponse {
  status: string;
  message: string;
  data: KurikulumMataPelajaranDetail;
}

export interface KurmapSelectResponse {
  status: string;
  message: string;
  data: DataSelectKurmap;
}
