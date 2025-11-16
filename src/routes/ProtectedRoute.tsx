import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { token, user, isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
  const location = useLocation();

  // Jalankan checkAuth saat komponen dimount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🔄 Tampilkan loading sementara sedang cek sesi login
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Memeriksa sesi login...</p>
      </div>
    );
  }

  // 🔍 Deteksi apakah route milik siswa (berdasarkan path)
  const isSiswaRoute = location.pathname.startsWith("/siswa");
  const isOnLoginSiswa = location.pathname.startsWith("/login-siswa");
  const isOnLoginKepegawaian = location.pathname.startsWith("/login-kepegawaian");

  // 🚫 Jika user belum login
  if (!token || !isAuthenticated) {
    const loginPath = isSiswaRoute ? "/login-siswa" : "/login-kepegawaian";
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  // 🔁 Jika user sudah login tapi buka halaman login, redirect ke dashboard sesuai role
  if (isAuthenticated && user) {
    // Jika siswa mengakses login siswa → redirect ke dashboard siswa
    if (isOnLoginSiswa && user.role === "siswa") {
      return <Navigate to="/siswa/dashboard" replace />;
    }

    // Jika bukan siswa (admin/guru/dll) mengakses login siswa → redirect ke dashboard mereka
    if (isOnLoginSiswa && user.role !== "siswa") {
      return <Navigate to="/unauthorized" replace />;
    }

    // Jika non-siswa mengakses login kepegawaian → redirect ke dashboard mereka
    if (isOnLoginKepegawaian && user.role !== "siswa") {
      return <Navigate to="/unauthorized" replace />;
    }

    // Jika siswa mengakses login kepegawaian → redirect ke dashboard siswa
    if (isOnLoginKepegawaian && user.role === "siswa") {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ⚠️ Jika role tidak sesuai dengan yang diizinkan
  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Semua validasi lolos
  return <>{children}</>;
}
