import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 🔹 Middleware untuk menyisipkan token otomatis
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token")?.trim();
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Tentukan token berdasarkan role
  let token = "";
  if (user.role === "siswa") {
    token = localStorage.getItem("token_siswa") || "";
  } else {
    // Untuk guru, admin, superadmin, dll
    token = localStorage.getItem("token") || "";
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
});

// 🔹 Middleware untuk handle response error (misalnya token expired)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const isSiswa = user.role === "siswa";

      localStorage.removeItem("token");
      localStorage.removeItem("token_siswa");
      localStorage.removeItem("user");

      // Redirect sesuai role
      window.location.href = isSiswa ? "/login-siswa" : "/login-kepegawaian";
    }
    return Promise.reject(error);
  }
);

export default api;
