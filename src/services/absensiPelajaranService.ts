import api from "@/api/axios";
import type { TahunAkademikRekap, GuruDetail } from "@/types/absensiPelajaran";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const absensiPelajaranService = {
  // ── SUPER ADMIN ──────────────────────────────────────────────

  // GET all: rekap per tahun akademik → guru
  // endpoint: GET /spa/guru/absensi/pelajaran
  getAll: async (): Promise<ApiResponse<TahunAkademikRekap[]>> => {
    const response = await api.get("/spa/guru/absensi/pelajaran");
    return response.data;
  },

  // GET detail satu guru: nested periode → semesters → jadwal → absensi
  // endpoint: GET /spa/guru/absensi/pelajaran/{guru_id}
  getDetail: async (guruId: number): Promise<ApiResponse<GuruDetail[]>> => {
    const response = await api.get(`/spa/guru/absensi/pelajaran/${guruId}`);
    return response.data;
  },

  // PUT update status satu absensi by absensi_id
  // endpoint: PUT /spa/guru/absensi/pelajaran/{absensi_id}
  update: async (id: number, data: { status: "hadir" | "tidak hadir" }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/spa/guru/absensi/pelajaran/${id}`, data);
    return response.data;
  },

  // DELETE satu atau beberapa absensi
  // satu:      DELETE /spa/absensi/guru/pelajaran/destroy?ids=4
  // beberapa:  DELETE /spa/absensi/guru/pelajaran/destroy?ids[]=3&ids[]=5&ids[]=9
  deleteMultiple: async (ids: number[]): Promise<any> => {
    const params = ids.length === 1 ? `?ids=${ids[0]}` : `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    const response = await api.delete(`/spa/absensi/guru/pelajaran/destroy${params}`);
    return response.data;
  },

  // GET export Excel
  // semua:     GET /spa/absensi/guru/pelajaran/export
  // beberapa:  GET /spa/absensi/guru/pelajaran/export?ids[]=3&ids[]=5
  exportExcel: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/absensi/guru/pelajaran/export";
    if (ids && ids.length > 0) {
      url += `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },

  // ── SELF SERVICE (PEGAWAI/GURU) ──────────────────────────────

  // POST create absensi sendiri
  create: async (data: { kelas_id: number; status: "hadir" | "tidak hadir" }) => {
    const response = await api.post("/pegawai/absensi/pelajaran", data);
    return response.data;
  },

  // GET absensi diri sendiri
  getAllSelf: async () => {
    const response = await api.get("/pegawai/absensi/pelajaran/all/self");
    return response.data;
  },

  // GET semua kelas (untuk select)
  getKelas: async () => {
    const response = await api.get("/spa/kelas");
    const items = response.data.data;
    return items.map((k: any) => ({ id: k.id, nama: k.nama_kelas }));
  },

  // GET export absensi sendiri
  exportSelf: async (ids?: number[]) => {
    let url = "/pegawai/absensi/pelajaran/export";
    if (ids && ids.length > 0) {
      url += `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },
};
