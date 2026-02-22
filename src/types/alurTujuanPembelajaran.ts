// ============================================================
// Types untuk Alur Tujuan Pembelajaran (ATP) - Super Admin
// ============================================================

export interface HistoriAtp {
  atp_id: number;
  atp_master_id: number;
  tujuan_pembelajaran: string;
  urutan: number;
  approval_status: "draft" | "diajukan" | "disetujui" | "ditolak";
  approved_by: number | null;
  approved_at: string | null;
  catatan_penolakan: string | null;
  is_locked: number | boolean;
}

export interface GuruAtp {
  guru_id: number;
  nama_guru: string;
  histori_atp: HistoriAtp[];
}

export interface SemesterAtp {
  semester_id: number;
  semester: string;
  status_semester: string;
  guru: GuruAtp[];
}

export interface PeriodeAtp {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
  semesters: SemesterAtp[];
}

export interface AtpKompetensi {
  kompetensi_id: number;
  mata_pelajaran: string;
  judul_kompetensi: string;
  jenis_kompetensi: string;
  fase: string | null;
  status_kompetensi: string;
  periode: PeriodeAtp[];
}

// Untuk modal tolak
export interface TolakAtpBody {
  catatan_penolakan: string;
}
