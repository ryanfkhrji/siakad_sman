// Type untuk ATP dalam list (grouped)
export interface AtpInGroup {
  atp_id: number;
  urutan: number;
  tujuan_pembelajaran: string;
}

// Type untuk kompetensi dalam index (grouped by kompetensi)
export interface KompetensiInAtpMaster {
  kompetensi_id: number;
  judul_kompetensi: string;
  fase?: string; // Untuk CP (Merdeka)
  tingkat?: string; // Untuk KD (K13)
  atp: AtpInGroup[];
}

// Type untuk index yang grouped by status
export interface AtpMasterGroupedByStatus {
  status: "aktif" | "arsip";
  kompetensi: KompetensiInAtpMaster[];
}

// Type untuk detail ATP Master
export interface AtpMasterDetail {
  kurikulum_id: number;
  kurikulum: "KTSP" | "K13" | "MERDEKA";
  kompetensi: {
    kompetensi_id: number;
    mata_pelajaran: string;
    judul_kompetensi: string;
    fase?: string; // Untuk CP
    tingkat?: string; // Untuk KD
    status_kompetensi: "aktif" | "arsip";
    deskripsi: string;
    atp_master: {
      atp_id: number;
      urutan: number;
      tujuan_pembelajaran: string;
      status_atp: "aktif" | "arsip";
    };
  };
}

// Type untuk data select
export interface KompetensiForSelect {
  kompetensi_id: number;
  judul_kompetensi: string;
  mata_pelajaran: string;
  kurikulum: "KTSP" | "K13" | "MERDEKA";
}

export interface DataSelectAtpMaster {
  jenis: "KD" | "CP";
  daftar_kompetensi: KompetensiForSelect[];
}

// Type untuk form create
export interface AtpMasterCreateFormData {
  kompetensi_id: number | string;
  urutan: number | string;
  tujuan_pembelajaran: string;
}

// Type untuk form edit
export interface AtpMasterEditFormData extends AtpMasterCreateFormData {
  status: "aktif" | "arsip" | "";
}

// Type untuk response API
export interface AtpMasterResponse {
  status: string;
  message: string;
  data: AtpMasterGroupedByStatus[];
}

export interface AtpMasterDetailResponse {
  status: string;
  message: string;
  data: AtpMasterDetail;
}

export interface AtpMasterSelectResponse {
  status: string;
  message: string;
  data: DataSelectAtpMaster[];
}
