export interface AbsensiDetailPelajaran {
  id: number;
  kelas: string;
  hari: string;
  jam: string;
  status: "hadir" | "tidak hadir";
}

export interface AbsensiPelajaran {
  nama_guru: string;
  wali_kelas: string;
  mata_pelajaran: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiDetailPelajaran[];
}

export interface AbsensiPelajaranFlat {
  id: number;
  nama_guru: string;
  wali_kelas: string;
  mengajar: string;
  kelas: string;
  hari: string;
  jam: string;
  status: "hadir" | "tidak hadir";
  total_hadir: number;
  total_tidak_hadir: number;
}

// ============ SELF SERVICE (PEGAWAI) ============
export interface AbsensiPelajaranDetail {
  id: number;
  kelas: string;
  hari: string;
  jam: string;
  status: "hadir" | "tidak hadir";
}

export interface AbsensiPelajaranSelf {
  guru_pengajar_id: number;
  nama_guru: string;
  mengajar: string;
  wali_kelas: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiPelajaranDetail[];
}

export interface CreateAbsensiPelajaranResponse {
  id: number;
  guru_pengajar_id: string;
  mata_pelajaran_id: string;
  kelas: string;
  hari: string;
  jam: string;
  status: string;
  rekapitulasi: {
    hadir: number;
    tidak_hadir: number;
  };
}
