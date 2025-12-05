export interface AbsensiDetail {
  id: number;
  hari: string;
  status: "hadir" | "tidak hadir";
}

export interface AbsensiPegawai {
  nama_guru: string;
  mengajar: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiDetail[];
}

export interface AbsensiPegawaiFlat {
  id: number;
  nama_guru: string;
  mengajar: string;
  hari: string;
  status: "hadir" | "tidak hadir";
  total_hadir: number;
  total_tidak_hadir: number;
}

export interface CreateAbsensiResponse {
  id: number;
  guru_id: string;
  mata_pelajaran_id: string;
  hari: string;
  status: "hadir" | "tidak hadir";
  rekapitulasi: {
    hadir: number;
    tidak_hadir: number;
  };
}