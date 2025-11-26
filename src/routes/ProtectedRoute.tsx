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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 🔄 Tampilkan loading saat cek sesi
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg">Memeriksa sesi login...</p>
      </div>
    );
  }

  const isSiswaRoute = location.pathname.startsWith("/siswa");

  // 🚫 Jika belum login, redirect ke halaman login
  if (!token || !isAuthenticated) {
    const loginPath = isSiswaRoute ? "/login-siswa" : "/login-kepegawaian";
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  // ✅ User sudah login, validasi role
  if (isAuthenticated && user) {
    // ⚠️ Validasi role sesuai yang diizinkan di route ini
    if (roles && !roles.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
