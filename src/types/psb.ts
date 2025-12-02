export interface Psb {
  id: number;
  nama_siswa: string;
  nisn: string;
  jk: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  alamat: string;
  no_hp_siswa: string;
  data_ayah: {
    nama_ayah: string;
    pekerjaan_ayah: string;
    no_hp_ayah: string;
  };
  data_ibu: {
    nama_ibu: string;
    pekerjaan_ibu: string;
    no_hp_ibu: string;
  };
  data_wali: {
    nama_wali: string | null;
    pekerjaan_wali: string | null;
    no_hp_wali: string | null;
  };
  sekolah_asal: string;
  alamat_sekolah_asal: string;
  kelas_terakhir: string | null;
  nilai_raport_terakhir: string | null;
  alasan_pindah: string | null;
  berkas_raport: string;
  suket_pindah: string | null;
  berkas_kartu_keluarga: string;
  berkas_akta_lahir: string;
  foto_siswa: string | null;
}

export interface PsbFormData {
  nama_siswa: string;
  nisn: string;
  jk: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  alamat: string;
  no_hp_siswa: string;
  nama_ayah: string;
  pekerjaan_ayah: string;
  no_hp_ayah: string;
  nama_ibu: string;
  pekerjaan_ibu: string;
  no_hp_ibu: string;
  nama_wali?: string;
  pekerjaan_wali?: string;
  no_hp_wali?: string;
  sekolah_asal: string;
  alamat_sekolah_asal: string;
  kelas_terakhir?: string;
  nilai_raport_terakhir?: string;
  alasan_pindah?: string;
  berkas_raport: File | null;
  suket_pindah?: File | null;
  berkas_kartu_keluarga: File | null;
  berkas_akta_lahir: File | null;
  foto_siswa: File | null;
}
