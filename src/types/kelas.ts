// Type untuk Kelas di list (getAll)
export interface Kelas {
  kelas_id: number;
  nama_kelas: string;
  tingkat: number;
  status: "aktif" | "arsip";
}

// Type untuk Rombel dalam detail kelas
export interface Rombel {
  rombel_id: number;
  nama_rombel: string;
}

// Type untuk daftar rombel berdasarkan jurusan
export interface DaftarRombelByJurusan {
  jurusan_id: number;
  jurusan: string;
  rombel: Rombel[];
}

// Type untuk detail kelas (getDetail)
export interface KelasDetail {
  kelas_id: number;
  nama_kelas: string;
  kode_kelas: string;
  tingkat: number;
  status: "aktif" | "arsip";
  daftar_rombel: DaftarRombelByJurusan[];
}
