import api from "@/api/axios";
import type { AbsensiSiswa } from "@/types/absensiSiswa";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export const absensiSiswaService = {
  // ========== SUPER ADMIN ==========

  /**
   * Mengambil semua data absensi siswa
   * GET /spa/absensi/siswa/pelajaran
   */
  getAll: async (): Promise<ApiResponse<AbsensiSiswa[]>> => {
    const response = await api.get("/spa/absensi/siswa/pelajaran");
    return response.data;
  },

  /**
   * Mengambil detail absensi siswa berdasarkan ID siswa
   * GET /spa/absensi/siswa/pelajaran/{id}
   */
  getDetail: async (siswaId: number): Promise<ApiResponse<AbsensiSiswa[]>> => {
    const response = await api.get(`/spa/absensi/siswa/pelajaran/${siswaId}`);
    return response.data;
  },

  /**
   * Mengambil single absensi berdasarkan absensi ID
   * Menggunakan getAll lalu filter by ID
   */
  getSingleAbsensi: async (absensiId: number) => {
    const response = await api.get("/spa/absensi/siswa/pelajaran");

    if (response.data.status === "success") {
      // Flatten dan cari absensi yang sesuai
      for (const siswa of response.data.data) {
        const absensi = siswa.absensi.find((abs: any) => abs.id === absensiId);
        if (absensi) {
          return {
            status: "success",
            data: {
              id: absensi.id,
              siswa_id: siswa.siswa_id,
              nama_siswa: siswa.nama_siswa,
              kelas: siswa.kelas,
              mata_pelajaran: absensi.mata_pelajaran,
              hari: absensi.hari,
              status: absensi.status,
              bukti: absensi.bukti,
            },
          };
        }
      }
    }

    throw new Error("Absensi tidak ditemukan");
  },

  /**
   * Update status absensi siswa
   * PUT /spa/absensi/siswa/pelajaran/{id}
   * FormData: status, mata_pelajaran_id (optional), bukti (file, optional)
   */
  update: async (
    id: number,
    data: {
      status?: "hadir" | "izin" | "sakit" | "alfa";
      mata_pelajaran_id?: number;
      bukti?: File | null;
    }
  ) => {
    const formData = new FormData();

    formData.append("_method", "PUT");

    if (data.status) {
      formData.append("status", data.status);
    }

    if (data.mata_pelajaran_id) {
      formData.append("mata_pelajaran_id", data.mata_pelajaran_id.toString());
    }

    if (data.bukti) {
      formData.append("bukti", data.bukti);
    }

    const response = await api.post(`/spa/absensi/siswa/pelajaran/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  /**
   * Hapus satu atau beberapa data absensi
   * DELETE /spa/absensi/siswa/pelajaran/destroy
   * Query params: SELALU gunakan format ids[] (array)
   */
  deleteMultiple: async (ids: number[]) => {
    let url = "/spa/absensi/siswa/pelajaran/destroy";

    // SELALU gunakan format ids[] untuk konsistensi
    // Baik 1 data maupun banyak data
    const params = ids.map((id) => `ids[]=${id}`).join("&");
    url += `?${params}`;

    const response = await api.delete(url);
    return response.data;
  },

  /**
   * Export data ke Excel
   * GET /spa/absensi/siswa/pelajaran/export
   * Query params: SELALU gunakan format ids[] (array)
   */
  exportExcel: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/absensi/siswa/pelajaran/export";

    if (ids && ids.length > 0) {
      // SELALU gunakan format ids[] untuk konsistensi
      const params = ids.map((id) => `ids[]=${id}`).join("&");
      url += `?${params}`;
    }

    const response = await api.get(url, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Export bukti izin dalam format ZIP
   * GET /spa/absensi/siswa/pelajaran/zip
   * Query params: SELALU gunakan format ids[] (array)
   */
  exportZip: async (ids?: number[]): Promise<Blob> => {
    let url = "/spa/absensi/siswa/pelajaran/zip";

    if (ids && ids.length > 0) {
      // SELALU gunakan format ids[] untuk konsistensi
      const params = ids.map((id) => `ids[]=${id}`).join("&");
      url += `?${params}`;
    }

    const response = await api.get(url, {
      responseType: "blob",
    });
    return response.data;
  },

  // ========== SISWA SELF SERVICE ==========
};
