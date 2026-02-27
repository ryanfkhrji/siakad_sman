export interface IdentitasSekolah {
  id: number;
  npsn: string;
  nama_sekolah: string;
  status_sekolah: string;
  jenjang: string;
  akreditasi: string | null;
  alamat: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  kode_pos: string;
  email: string;
  no_telepon: string;
  kepala_sekolah: string;
  nip_kepala_sekolah: string;
  visi: string;
  misi: string;
  logo: string;
}
