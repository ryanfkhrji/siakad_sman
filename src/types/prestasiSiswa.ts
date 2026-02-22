// ============================================================
// Types untuk Prestasi Siswa
// ============================================================

// ── DATA SELECT ──────────────────────────────────────────────
export interface SiswaSelect {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
}

export interface TahunAkademikSelect {
  tahun_akademik_id: number;
  tahun_akademik: string;
  status_tahun_akademik: string;
}

export interface DataSelectPrestasi {
  siswa: SiswaSelect[];
  tahun_akademik: TahunAkademikSelect[];
}

// ── DETAIL / HISTORI (GET by siswa_id) ───────────────────────
export interface PrestasiItem {
  id: number;
  prestasi_diraih: string;
}

export interface PeriodePrestasi {
  tahun_akademik_id: number;
  tahun_akademik: string;
  prestasi: PrestasiItem[];
}

export interface PrestasiSiswaDetail {
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  periode: PeriodePrestasi[];
}

// ── CREATE / UPDATE RESPONSE ─────────────────────────────────
export interface PrestasiResponseData {
  siswa_id: number;
  nama_siswa: string;
  prestasi: {
    id: number;
    tahun_akademik: string;
    status_tahun_akademik: string;
    prestasi_diraih: string;
  };
}

// ── FORM ─────────────────────────────────────────────────────
export interface PrestasiFormData {
  siswa_id: string;
  tahun_akademik_id: string;
  prestasi_diraih: string;
}

export interface PrestasiFormErrors {
  siswa_id: string[];
  tahun_akademik_id: string[];
  prestasi_diraih: string[];
}
