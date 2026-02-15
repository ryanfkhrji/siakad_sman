export interface Semester {
  semester_id: number;
  semester: "Ganjil" | "Genap";
  status_semester: "aktif" | "arsip";
}

export interface TahunAkademikWithSemesters {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  semesters: Semester[];
}

// Type untuk response API
export interface SemesterResponse {
  status: string;
  message: string;
  data: TahunAkademikWithSemesters[];
}

// Type untuk form create/edit
export interface SemesterFormData {
  semester: "Ganjil" | "Genap";
  status?: "aktif" | "arsip";
}
