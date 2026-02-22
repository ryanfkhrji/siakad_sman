import api from "@/api/axios";
import type { Keuangan, KeuanganFormData } from "@/types/keuanganSekolah";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const keuanganService = {
  // GET all: /spa/keuangan
  getAll: async (): Promise<ApiResponse<Keuangan[]>> => {
    const response = await api.get("/spa/keuangan");
    return response.data;
  },

  // GET detail: /spa/keuangan/{id}
  getDetail: async (id: number): Promise<ApiResponse<Keuangan>> => {
    const response = await api.get(`/spa/keuangan/${id}`);
    return response.data;
  },

  // POST create: /spa/keuangan
  create: async (data: KeuanganFormData): Promise<ApiResponse<Keuangan>> => {
    const response = await api.post("/spa/keuangan", data);
    return response.data;
  },

  // PUT update: /spa/keuangan/{id}
  update: async (id: number, data: KeuanganFormData): Promise<ApiResponse<Keuangan>> => {
    const response = await api.put(`/spa/keuangan/${id}`, data);
    return response.data;
  },

  // DELETE: /spa/keuangan/destroy?ids[]=7          (satu)
  //         /spa/keuangan/destroy?ids[]=7&ids[]=9  (beberapa)
  // Catatan: selalu pakai ids[] (array), tidak ada ids=7
  deleteMultiple: async (ids: number[]): Promise<any> => {
    const params = ids.map((id) => `ids[]=${id}`).join("&");
    const response = await api.delete(`/spa/keuangan/destroy?${params}`);
    return response.data;
  },

  // GET export Excel
  // Semua data:    /spa/keuangan/export
  // Beberapa data: /spa/keuangan/export?ids[]=2&ids[]=4
  exportExcel: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/keuangan/export";
    if (ids && ids.length > 0) {
      url += `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },
};
