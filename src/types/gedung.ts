export interface GetAllGedung {
  id: number;
  foto_gedung: string | null;
  kode_gedung: string;
  nama_gedung: string;
  status: string;
}

export interface GedungDetail {
  id: number;
  foto_gedung: string | null;
  kode_gedung: string;
  nama_gedung: string;
  jumlah_lantai: number;
  luas_bangunan: string;
  tahun_dibangun: string;
  kondisi: string;
  keterangan: string;
  status_gedung: string;
  lokasi: string;
  ruangan: [
    {
      id: number;
      kode_ruangan: string;
      nama_ruangan: string;
      jenis_ruangan: string;
      lantai: number;
      kapasitas: number;
      luas_ruangan: string;
      kondisi: string;
      fasilitas: string;
      keterangan: string;
      status_ruangan: string;
    },
  ];
}

export interface FormGedungPayload {
  foto_gedung: string | null;
  kode_gedung: string;
  nama_gedung: string;
  jumlah_lantai: number;
  luas_bangunan: string;
  tahun_dibangun: string;
  kondisi: string;
  lokasi: string;
  keterangan: string;
}