import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface PublicRouteProps {
  children: React.ReactNode;
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { user, isAuthenticated } = useAuthStore();

  // Fungsi untuk redirect ke dashboard sesuai role
  const getDashboardPath = (userRole: string) => {
    switch (userRole) {
      case "siswa":
        return "/siswa/dashboard";
      case "super_admin":
        return "/superadmin/dashboard";
      case "guru":
        return "/guru/dashboard";
      case "staff":
      case "tu":
        return "/staff/dashboard";
      case "kepsek":
        return "/kepsek/dashboard";
      default:
        return "/unauthorized";
    }
  };

  // 🔄 Jika sudah login, redirect ke dashboard
  if (isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  // ✅ Belum login, tampilkan halaman public (login/register)
  return <>{children}</>;
}
