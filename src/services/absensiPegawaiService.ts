import api from "@/api/axios";
import type { AbsensiPegawai } from "@/types/absensiPegawai";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const absensiPegawaiService = {
  // GET all absensi pegawai
  getAll: async (): Promise<ApiResponse<AbsensiPegawai[]>> => {
    const response = await api.get("/spa/absensi/pegawai/sekolah");
    return response.data;
  },

  // Get detail absensi by guru_id
  getDetail: async (guruId: number) => {
    const response = await api.get(`/spa/absensi/pegawai/sekolah/${guruId}`);
    return response.data;
  },

  // UPDATE status absensi
  update: async (id: number, data: { status: "hadir" | "tidak hadir" }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/spa/absensi/pegawai/sekolah/${id}`, data);
    return response.data;
  },

  // DELETE single or multiple
  deleteMultiple: async (ids: number[]): Promise<any> => {
    let params = "";
    if (ids.length === 1) {
      params = `?ids=${ids[0]}`;
    } else {
      params = `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.delete(`/spa/absensi/pegawai/sekolah/destroy${params}`);
    return response.data;
  },

  // EXPORT Excel (all, selected, or single)
  exportExcel: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/absensi/pegawai/sekolah/export";

    if (ids && ids.length > 0) {
      const params = ids.map((id) => `ids[]=${id}`).join("&");
      url += `?${params}`;
    }

    const response = await api.get(url, {
      responseType: "blob",
    });

    return response.data;
  },

  // CREATE absensi (untuk pegawai)
  create: async (data: { status: "hadir" | "tidak hadir" }) => {
    const response = await api.post("/pegawai/absensi/sekolah", data);
    return response.data;
  },

  // GET all absensi sendiri
  getAllSelf: async () => {
    const response = await api.get("/pegawai/absensi/sekolah/all/self");
    return response.data;
  },

  // EXPORT absensi sendiri
  exportSelf: async (ids?: number[]) => {
    let url = "/pegawai/absensi/sekolah/export";
    if (ids && ids.length > 0) {
      const params = ids.map((id) => `ids[]=${id}`).join("&");
      url += `?${params}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },
};
