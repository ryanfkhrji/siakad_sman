export interface AbsensiDetailPelajaran {
  id: number;
  kelas: string;
  hari: string;
  jam: string;
  status: "hadir" | "tidak hadir";
}

export interface AbsensiPelajaran {
  mata_pelajaran: string;
  guru_pengajar: string;
  kelas: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiDetailPelajaran[];
}

export interface AbsensiPelajaranFlat {
  id: number;
  mata_pelajaran: string;
  guru_pengajar: string;
  kelas: string;
  hari: string;
  jam: string;
  status: "hadir" | "tidak hadir";
  total_hadir: number;
  total_tidak_hadir: number;
}
