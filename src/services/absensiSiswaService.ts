import api from "@/api/axios";
import type { TahunAkademikAbsensiSiswa, DetailAbsensiSiswaData, UpdateAbsensiSiswaResponse, AbsensiSiswaSelf, CreateAbsensiSiswaRequest, CreateAbsensiSiswaResponse } from "@/types/absensiSiswa";
import type { MataPelajaran } from "@/types";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const absensiSiswaService = {
  // ================================================================
  // SUPER ADMIN
  // ================================================================

  /**
   * Mengambil semua rekap absensi siswa (digroup per tahun akademik → rombel → siswa)
   * GET /spa/absensi/siswa/pelajaran
   */
  getAll: async (): Promise<ApiResponse<TahunAkademikAbsensiSiswa[]>> => {
    const response = await api.get("/spa/absensi/siswa/pelajaran");
    return response.data;
  },

  /**
   * Mengambil detail histori absensi satu siswa (digroup per rombel → periode → semester → mapel)
   * GET /spa/absensi/siswa/pelajaran/:siswaId
   */
  getDetail: async (siswaId: number): Promise<ApiResponse<DetailAbsensiSiswaData>> => {
    const response = await api.get(`/spa/absensi/siswa/pelajaran/${siswaId}`);
    return response.data;
  },

  /**
   * Update status absensi siswa (termasuk upload bukti opsional)
   * POST /spa/absensi/siswa/pelajaran/:absensiId   (dengan _method=PUT)
   */
  update: async (
    absensiId: number,
    data: {
      status?: "hadir" | "izin" | "sakit" | "alfa";
      bukti?: File | null;
    },
  ): Promise<ApiResponse<UpdateAbsensiSiswaResponse>> => {
    const formData = new FormData();
    formData.append("_method", "PUT");

    if (data.status) formData.append("status", data.status);
    if (data.bukti) formData.append("bukti", data.bukti);

    const response = await api.post(`/spa/absensi/siswa/pelajaran/${absensiId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
    return response.data;
  },

  /**
   * Hapus satu atau beberapa data absensi
   * DELETE /spa/absensi/siswa/pelajaran/destroy?ids[]=3&ids[]=5
   *   - satu  : ?ids[]=7
   *   - banyak: ?ids[]=3&ids[]=5&ids[]=9
   */
  deleteMultiple: async (ids: number[]): Promise<ApiResponse<null>> => {
    const params = ids.map((id) => `ids[]=${id}`).join("&");
    const response = await api.delete(`/spa/absensi/siswa/pelajaran/destroy?${params}`);
    return response.data;
  },

  /**
   * Hapus hanya foto bukti (tanpa hapus record absensi)
   * DELETE /spa/absensi/siswa/bukti/destroy?ids[]=14&ids[]=21
   *   - satu  : ?ids[]=4
   *   - banyak: ?ids[]=3&ids[]=5&ids[]=9
   */
  deleteBukti: async (ids: number[]): Promise<ApiResponse<null>> => {
    const params = ids.map((id) => `ids[]=${id}`).join("&");
    const response = await api.delete(`/spa/absensi/siswa/bukti/destroy?${params}`);
    return response.data;
  },

  /**
   * Export data absensi ke Excel
   * GET /spa/absensi/siswa/pelajaran/export
   *   - semua : tanpa query params
   *   - pilihan: ?ids[]=3&ids[]=5
   */
  exportExcel: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/absensi/siswa/pelajaran/export";
    if (ids && ids.length > 0) {
      url += `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },

  /**
   * Export bukti absensi ke ZIP
   * GET /spa/absensi/siswa/pelajaran/zip
   *   - semua : tanpa query params
   *   - pilihan: ?ids[]=3&ids[]=5
   */
  exportZip: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/absensi/siswa/pelajaran/zip";
    if (ids && ids.length > 0) {
      url += `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },

  // ================================================================
  // SISWA SELF SERVICE
  // ================================================================

  /**
   * Mengambil semua absensi pelajaran milik siswa yang sedang login
   * GET /siswa/absensi/pelajaran/all/self
   */
  getAllSelf: async (): Promise<ApiResponse<AbsensiSiswaSelf>> => {
    const response = await api.get("/siswa/absensi/pelajaran/all/self");
    return response.data;
  },

  /**
   * Membuat absensi pelajaran baru (oleh siswa)
   * POST /siswa/absensi/pelajaran
   */
  create: async (data: CreateAbsensiSiswaRequest): Promise<ApiResponse<CreateAbsensiSiswaResponse>> => {
    const formData = new FormData();
    formData.append("mata_pelajaran_id", data.mata_pelajaran_id.toString());
    formData.append("status", data.status);
    if (data.bukti) formData.append("bukti", data.bukti);

    const response = await api.post("/siswa/absensi/pelajaran", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Mengambil daftar mata pelajaran yang tersedia untuk siswa
   * GET /siswa/jadwal-pelajaran/all/diri
   */
  getMataPelajaran: async (): Promise<ApiResponse<MataPelajaran[]>> => {
    const response = await api.get("/siswa/jadwal-pelajaran/all/diri");

    if (response.data.status === "success" && Array.isArray(response.data.data)) {
      const validData = response.data.data
        .filter((item: any) => !!item.mata_pelajaran_id)
        .map((item: any) => ({
          pivot_id: item.pivot_id,
          mata_pelajaran_id: item.mata_pelajaran_id,
          nama_pelajaran: item.nama_pelajaran,
        }));

      if (validData.length === 0) {
        throw new Error("Tidak ada mata pelajaran dengan ID valid. Hubungi admin untuk memastikan jadwal sudah diatur.");
      }

      return {
        status: response.data.status,
        message: response.data.message,
        data: validData,
      };
    }

    throw new Error("Invalid response structure");
  },

  /**
   * Export absensi sendiri ke Excel
   * GET /siswa/absensi/pelajaran/export
   */
  exportSelf: async (ids?: number[]): Promise<Blob> => {
    let url = "/siswa/absensi/pelajaran/export";
    if (ids && ids.length > 0) {
      url += `?${ids.map((id) => `ids[]=${id}`).join("&")}`;
    }
    const response = await api.get(url, { responseType: "blob" });
    return response.data;
  },
};
