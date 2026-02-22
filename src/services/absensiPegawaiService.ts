import api from "@/api/axios";
import type { AbsensiGuru, AbsensiGuruDetail } from "@/types/absensiPegawai";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const absensiPegawaiService = {
  // GET all absensi pegawai (nested: guru → periode → semester → absensi)
  getAll: async (): Promise<ApiResponse<AbsensiGuru[]>> => {
    const response = await api.get("/spa/absensi/pegawai/sekolah");
    return response.data;
  },

  // GET detail absensi satu guru by guru_id
  getDetail: async (guruId: number): Promise<ApiResponse<AbsensiGuruDetail[]>> => {
    const response = await api.get(`/spa/absensi/pegawai/sekolah/${guruId}`);
    return response.data;
  },

  // PUT update status absensi by absensi_id
  update: async (absensiId: number, data: { status: "hadir" | "tidak hadir" }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/spa/absensi/pegawai/sekolah/${absensiId}`, data);
    return response.data;
  },

  // DELETE satu atau beberapa absensi
  // satu:      DELETE /destroy?ids=4
  // beberapa:  DELETE /destroy?ids[]=3&ids[]=5&ids[]=9
  deleteMultiple: async (ids: number[]): Promise<any> => {
    const params = ids.length === 1 ? `?ids=${ids[0]}` : `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    const response = await api.delete(`/spa/absensi/pegawai/sekolah/destroy${params}`);
    return response.data;
  },

  // GET export Excel
  // semua:      GET /export
  // beberapa:   GET /export?ids[]=1&ids[]=3
  exportExcel: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/absensi/pegawai/sekolah/export";
    if (ids && ids.length > 0) {
      url += `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },

  // ── SELF SERVICE (PEGAWAI) ────────────────────────────────

  // POST create absensi sendiri
  create: async (data: { status: "hadir" | "tidak hadir" }) => {
    const response = await api.post("/pegawai/absensi/sekolah", data);
    return response.data;
  },

  // GET semua absensi sendiri
  getAllSelf: async () => {
    const response = await api.get("/pegawai/absensi/sekolah/all/self");
    return response.data;
  },

  // GET export absensi sendiri
  exportSelf: async (ids?: number[]) => {
    let url = "/pegawai/absensi/sekolah/export";
    if (ids && ids.length > 0) {
      url += `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },
};
