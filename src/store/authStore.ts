import { create } from "zustand";
import axios from "axios";
import api from "../api/axios";
import type { NavigateFunction } from "react-router-dom";

export interface User {
  id: number;
  nama: string;
  role: "guru" | "staff" | "tu" | "kepsek" | "super_admin" | "siswa";
}

interface LoginResponse {
  status: string;
  message: string;
  data: any; // biarkan fleksibel untuk siswa & pegawai
}

type LoginData = Record<string, unknown>;

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  login: (endpoint: string, data: LoginData) => Promise<void>;
  logout: (navigate: NavigateFunction) => Promise<void>;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isCheckingAuth: true,

  // 🔹 LOGIN
  login: async (endpoint, data) => {
    try {
      // Hapus token lama lebih awal
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");

      const res = await api.post<LoginResponse>(endpoint, data);
      const { data: userData } = res.data;

      // Deteksi apakah siswa atau pegawai
      const isSiswa = userData.role === "siswa";

      // Map sesuai tipe user
      const user: User = {
        id: userData.id,
        nama: userData.nama || userData.name,
        role: userData.role,
      };

      const token = userData.token;

      // 💾 Simpan data user berbeda tergantung role
      if (isSiswa) {
        const siswaDetail = {
          id: userData.id,
          nisn: userData.nisn,
          nama: userData.nama,
          nis: userData.nis,
          nama_jurusan: userData.nama_jurusan,
          nama_ekstrakurikuler: userData.nama_ekstrakurikuler,
          status: userData.status,
          role: userData.role,
          kelas: userData.kelas?.nama_kelas,
          wali_kelas: userData.kelas?.wali_kelas?.nama,
          token: userData.token,
        };
        localStorage.setItem("user", JSON.stringify(siswaDetail));
      } else {
        // Pegawai (kepegawaian)
        localStorage.setItem("user", JSON.stringify(userData));
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", user.role);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      set({ user, token, isAuthenticated: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Login gagal:", err.response?.data ?? err.message);
        throw err;
      }
      console.error("Login gagal:", String(err));
      throw new Error(String(err));
    }
  },

  // 🔹 LOGOUT
  logout: async (navigate) => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    try {
      if (token && user?.role) {
        const endpoint = user.role === "siswa" ? "/logout/siswa" : "/logout/kepegawaian";

        await api.post(
          endpoint,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }
    } catch (err) {
      console.warn("Logout gagal di server (mungkin token sudah tidak valid)", err);
    } finally {
      localStorage.clear();
      delete api.defaults.headers.common["Authorization"];

      const redirectPath = user?.role && ["guru", "staff", "tu", "kepsek", "super_admin"].includes(user.role) ? "/login-kepegawaian" : "/login-siswa";

      navigate(redirectPath, { replace: true });
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user }),

  // 🔹 CHECK AUTH
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (token && user) {
        // ⬇️ Tambahkan baris ini supaya axios kirim token lagi setelah reload
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        set({
          token,
          user: JSON.parse(user),
          isAuthenticated: true,
          isCheckingAuth: false,
        });
      } else {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isCheckingAuth: false,
        });
      }
    } catch (err) {
      console.error("CheckAuth error:", err);
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isCheckingAuth: false,
      });
    }
  },
}));
