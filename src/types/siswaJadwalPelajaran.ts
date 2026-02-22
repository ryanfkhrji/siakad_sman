// ============================================================
// Types untuk Siswa Jadwal Pelajaran (Super Admin)
// Disesuaikan dengan response GET /spa/siswa/jadwal-pelajaran/{id}
// ============================================================

// Untuk tabel index — dari /spa/siswa
export interface WaliKelas {
  id: number;
  nama: string;
  email: string;
  status: string;
  nip: string | null;
  keterangan: string | null;
  role: string;
}

export interface KelasSiswa {
  id: number;
  nama_kelas: string;
  jam_masuk: string;
  wali_kelas: WaliKelas | null;
}

export interface SiswaForTable {
  id: number;
  nisn: string | null;
  nama: string;
  email: string;
  nis: string | null;
  nama_jurusan: string | null;
  nama_ekstrakurikuler: string | null;
  status: string;
  role: string;
  kelas: KelasSiswa | null;
}

// ============================================================
// Types untuk detail siswa + jadwal
// GET /spa/siswa/jadwal-pelajaran/{siswa_id}
// ============================================================

export interface JadwalPelajaranDetail {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  guru: string;
  ruangan: string | null;
  link_opsional: string | null;
}

export interface SemesterJadwal {
  semester_id: number;
  semester: string;
  status_semester: string;
  jadwal_pelajarans: JadwalPelajaranDetail[];
}

export interface RombelSiswa {
  rombel_id: number;
  nama_rombel: string;
  kelas: string;
  wali_rombel: string | null;
}

export interface PeriodeSiswaJadwal {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  rombel: RombelSiswa;
  jadwal: SemesterJadwal[];
}

export interface SiswaDetailJadwal {
  siswa_id: number;
  nama_siswa: string;
  periode: PeriodeSiswaJadwal[];
}

export interface SiswaDetailJadwalResponse {
  status: string;
  message: string;
  data: SiswaDetailJadwal;
}

// Urutan hari untuk sorting
export const URUTAN_HARI: Record<string, number> = {
  Senin: 1,
  Selasa: 2,
  Rabu: 3,
  Kamis: 4,
  Jumat: 5,
  Sabtu: 6,
  Minggu: 7,
};
