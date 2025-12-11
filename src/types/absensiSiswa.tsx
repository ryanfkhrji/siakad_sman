export interface AbsensiDetail {
  id: number;
  mata_pelajaran: string;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
}

export interface AbsensiSiswa {
  siswa_id: number;
  nama_siswa: string;
  kelas: string;
  total_hadir: number;
  total_alfa: number;
  total_sakit: number;
  total_izin: number;
  absensi: AbsensiDetail[];
}

// Struktur flat untuk tabel (setiap row adalah satu absensi)
export interface AbsensiSiswaFlat {
  id: number;
  nama_siswa: string;
  kelas: string;
  mata_pelajaran: string;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
  total_hadir: number;
  total_alfa: number;
  total_sakit: number;
  total_izin: number;
}

// ===============================  SELF SISWA ============================
// Response dari API untuk self (siswa login)
export interface AbsensiSiswaSelf {
  siswa_id: number;
  nama_siswa: string;
  kelas: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alfa: number;
  absensi: AbsensiDetailSelf[];
}

// Detail absensi untuk siswa self
export interface AbsensiDetailSelf {
  id: number;
  mata_pelajaran: string;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
}

// Request body untuk create absensi (siswa)
export interface CreateAbsensiSiswaRequest {
  mata_pelajaran_id: number;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti?: File | null;
}

// Response setelah create absensi
export interface CreateAbsensiSiswaResponse {
  id: number;
  siswa: string;
  kelas: string;
  mata_pelajaran: string;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
  rekapitulasi: {
    hadir: number;
    izin: number;
    sakit: number;
    alfa: number;
  };
}

// Untuk dropdown mata pelajaran (jika diperlukan)
export interface MataPelajaran {
  pivot_id: number;
  mata_pelajaran_id: number; // ✅ Sekarang akan ada dari backend
  nama_pelajaran: string;
}