export interface Ruangan {
  id: number;
  nama_gedung: string;
  kode_ruangan: string;
  nama_ruangan: string;
  jenis_ruangan: string;
  lantai: number;
  kapasitas: number;
  luas_ruangan: string;
  kondisi: string;
  fasilitas: string;
  keterangan: string;
  status: string;
}

export interface FormCreateRuanganPayload {
  gedung_id: number;
  kode_ruangan: string;
  nama_ruangan: string;
  jenis_ruangan: string;
  lantai: number;
  kapasitas: number;
  luas_ruangan: string;
  kondisi: string;
  fasilitas: string;
  keterangan: string;
}

export interface FormEditRuanganPayload {
  gedung_id: number;
  kode_ruangan: string;
  nama_ruangan: string;
  jenis_ruangan: string;
  lantai: number;
  kapasitas: number;
  luas_ruangan: string;
  kondisi: string;
  fasilitas: string;
  keterangan: string;
  status: string;
}

export interface GedungSelectOption {
  gedung_id: number;
  nama_gedung: string;
  kode_gedung: string;
}