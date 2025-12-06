import api from "@/api/axios";
import type { AbsensiPelajaran } from "@/types/absensiPelajaran";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const absensiPelajaranService = {
  // GET all absensi pelajaran
  getAll: async (): Promise<ApiResponse<AbsensiPelajaran[]>> => {
    const response = await api.get("/spa/absensi/pegawai/pelajaran");
    return response.data;
  },

  // Get detail absensi by guru_id
  getDetail: async (guruId: number) => {
    const response = await api.get(`/spa/absensi/pegawai/pelajaran/${guruId}`);
    return response.data;
  },

  // UPDATE status absensi
  update: async (id: number, data: { status: "hadir" | "tidak hadir" }): Promise<ApiResponse<any>> => {
    const response = await api.put(`/spa/absensi/pegawai/pelajaran/${id}`, data);
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
    const response = await api.delete(`/spa/absensi/pegawai/pelajaran/destroy${params}`);
    return response.data;
  },

  // EXPORT Excel (all, selected, or single)
  exportExcel: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/absensi/pegawai/pelajaran/export";

    if (ids && ids.length > 0) {
      const params = ids.map((id) => `ids[]=${id}`).join("&");
      url += `?${params}`;
    }

    const response = await api.get(url, {
      responseType: "blob",
    });

    return response.data;
  },
};
