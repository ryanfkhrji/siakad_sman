import api from "@/api/axios";
import type { Psb, PsbFormData } from "@/types/psb";

export const psbService = {
  // Get all PSB
  getAll: async () => {
    const response = await api.get<{ status: string; data: Psb[]; message: string }>("/psb");
    return response.data;
  },

  // Get detail PSB
  getDetail: async (id: number) => {
    const response = await api.get<{ status: string; data: Psb; message: string }>(`/psb/${id}`);
    return response.data;
  },

  // Create PSB
  create: async (data: PsbFormData) => {
    const formData = new FormData();

    // Append text fields
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof PsbFormData];
      if (value !== null && value !== undefined && !(value instanceof File)) {
        formData.append(key, String(value));
      }
    });

    // Append files
    if (data.foto_siswa) formData.append("foto_siswa", data.foto_siswa);
    if (data.berkas_raport) formData.append("berkas_raport", data.berkas_raport);
    if (data.suket_pindah) formData.append("suket_pindah", data.suket_pindah);
    if (data.berkas_kartu_keluarga) formData.append("berkas_kartu_keluarga", data.berkas_kartu_keluarga);
    if (data.berkas_akta_lahir) formData.append("berkas_akta_lahir", data.berkas_akta_lahir);

    const response = await api.post("/psb", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Update PSB
  update: async (id: number, data: Partial<PsbFormData>) => {
    const formData = new FormData();

    // Override method Laravel
    formData.append("_method", "PUT");

    // Append text fields
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof PsbFormData];
      if (value !== null && value !== undefined && !(value instanceof File)) {
        formData.append(key, String(value));
      }
    });

    // Append file jika ada
    if (data.foto_siswa instanceof File) formData.append("foto_siswa", data.foto_siswa);
    if (data.berkas_raport instanceof File) formData.append("berkas_raport", data.berkas_raport);
    if (data.suket_pindah instanceof File) formData.append("suket_pindah", data.suket_pindah);
    if (data.berkas_kartu_keluarga instanceof File) formData.append("berkas_kartu_keluarga", data.berkas_kartu_keluarga);
    if (data.berkas_akta_lahir instanceof File) formData.append("berkas_akta_lahir", data.berkas_akta_lahir);

    const response = await api.post(`/psb/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  },

  // Delete multiple PSB
  deleteMultiple: async (ids: number[]) => {
    const response = await api.delete("/psb/destroy-multiple", {
      data: { id: ids },
    });
    return response.data;
  },

  // Export Excel (all or selected)
  exportExcel: async (ids?: number[]) => {
    const params = ids && ids.length > 0 ? { id: ids } : {};
    const response = await api.get("/export-data-psb", {
      params,
      paramsSerializer: (params) => {
        if (params.id) {
          return params.id.map((id: number) => `id[]=${id}`).join("&");
        }
        return "";
      },
      responseType: "blob",
    });
    return response.data;
  },

  // Export Berkas ZIP (all or selected)
  exportBerkasZip: async (ids?: number[]) => {
    const params = ids && ids.length > 0 ? { id: ids } : {};
    const response = await api.get("/export-berkas-zip", {
      params,
      paramsSerializer: (params) => {
        if (params.id) {
          return params.id.map((id: number) => `id[]=${id}`).join("&");
        }
        return "";
      },
      responseType: "blob",
    });
    return response.data;
  },

  // Import Excel
  importExcel: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/import-data-psb", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Import Berkas ZIP
  importBerkasZip: async (file: File) => {
    const formData = new FormData();
    formData.append("zip_file", file);
    const response = await api.post("/import-berkas-zip", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
