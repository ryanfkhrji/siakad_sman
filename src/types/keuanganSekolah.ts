// ============================================================
// Types untuk Keuangan - Super Admin
// ============================================================

export interface Keuangan {
  id: number;
  nama_akun: string;
  debit: string; // backend return string "50000.00"
  kredit: string; // backend return string "20000.00"
  keterangan: string | null;
}

export interface KeuanganFormData {
  nama_akun: string;
  debit: number;
  kredit: number;
  keterangan: string;
}
