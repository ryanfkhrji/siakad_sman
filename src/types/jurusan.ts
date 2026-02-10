// Base Jurusan type
export interface Jurusan {
  id: number;
  nama_jurusan: string;
  kode_jurusan: string;
  status: 'aktif' | 'arsip';
}

// Rombel in Jurusan detail
export interface JurusanRombel {
  rombel_id: number;
  nama_rombel: string;
  status: string;
}

// Kelas detail in Jurusan
export interface JurusanKelasDetail {
  kelas_id: number;
  nama_kelas: string;
  tingkat: number;
  status: string;
  rombel: JurusanRombel[];
}

// Detail Jurusan (for show endpoint)
export interface JurusanDetail extends Jurusan {
  details: JurusanKelasDetail[];
}

// API Response types
export interface JurusanListResponse {
  status: string;
  message: string;
  data: Jurusan[];
}

export interface JurusanDetailResponse {
  status: string;
  message: string;
  data: JurusanDetail;
}

export interface JurusanCreateUpdateResponse {
  status: string;
  message: string;
  data: Jurusan;
}

export interface JurusanDeleteResponse {
  status: string;
  message: string;
  data: null;
}

// Form types
export interface JurusanFormData {
  nama_jurusan: string;
  kode_jurusan: string;
  status?: 'aktif' | 'arsip';
}

export interface JurusanCreateFormData {
  nama_jurusan: string;
  kode_jurusan: string;
}

export interface JurusanUpdateFormData {
  nama_jurusan?: string;
  kode_jurusan?: string;
  status?: 'aktif' | 'arsip';
}

// Error response type
export interface JurusanErrorResponse {
  status: string;
  message: string;
  errors: {
    [key: string]: string[];
  };
}