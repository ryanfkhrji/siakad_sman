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
