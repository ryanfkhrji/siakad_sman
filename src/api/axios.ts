import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 🔹 Middleware untuk menyisipkan token otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")?.trim();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Middleware untuk handle response error (misalnya token expired)
api.interceptors.response.use(
  (response) => response, // biarkan response sukses lewat
  (error) => {
    if (error.response) {
      // Cek jika token sudah expired / invalid / unauthorized
      if (error.response.status === 401) {
        // Hapus token dari localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user"); // kalau kamu juga simpan data user
        // Redirect ke halaman login
        window.location.href = "/login-kepegawaian";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
