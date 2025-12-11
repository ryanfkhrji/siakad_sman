import api from "@/api/axios";
import type { Keuangan } from "@/types/keuangan";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const keuanganService = {
  // ==================== SUPER ADMIN ========================
  // get all
  getAll: async (): Promise<ApiResponse<Keuangan[]>> => {
    const response = await api.get("/spa/keuangan");
    return response.data;
  },

  // get by id
  getDetail: async (id: number): Promise<ApiResponse<Keuangan>> => {
    const response = await api.get(`/spa/keuangan/${id}`);
    return response.data;
  },

  // create
  create: async (data: { nama_akun: string; debit: number; kredit: number; keterangan?: string }): Promise<ApiResponse<Keuangan>> => {
    const response = await api.post("/spa/keuangan", data);
    return response.data;
  },

  // update
  update: async (
    id: number,
    data: {
      nama_akun?: string;
      debit?: number;
      kredit?: number;
      keterangan?: string;
    }
  ): Promise<ApiResponse<Keuangan>> => {
    const response = await api.put(`/spa/keuangan/${id}`, data);
    return response.data;
  },

  // delete multi (bisa untuk satu atau beberapa data)
  deleteMultiple: async (ids: number[]): Promise<void> => {
    const params = new URLSearchParams();
    ids.forEach((id) => params.append("ids[]", id.toString()));
    await api.delete(`/spa/keuangan/destroy?${params.toString()}`);
  },

  // export excel (semua atau terpilih)
  exportExcel: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/keuangan/export";

    if (ids && ids.length > 0) {
      const params = new URLSearchParams();
      ids.forEach((id) => params.append("ids[]", id.toString()));
      url += `?${params.toString()}`;
    }

    const response = await api.get(url, {
      responseType: "blob",
    });
    return response.data;
  },
};