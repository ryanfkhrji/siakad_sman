// ========================
// TYPE: GetAll TahunAkdemik
// ========================
export interface TahunAkademik {
  id: number;
  tahun_akademik: string;
  keterangan: string;
  status: "aktif" | "arsip";
}

// ========================
// TYPE: GetDetail TahunAkdemik
// ========================
export interface TahunAkademikDetail {
  tahun_akademik_id: number;
  tahun_akademik: string;
  keterangan: string;
  status_tahun_akademik: "aktif" | "arsip";
  semester: SemesterItems[];
}

export interface SemesterItems {
  semester_id: number;
  semester: string;
  status_semester: "aktif" | "arsip";
}