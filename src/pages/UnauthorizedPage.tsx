import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleBackToDashboard = () => {
    // Redirect ke dashboard sesuai role
    switch (user?.role) {
      case "siswa":
        navigate("/siswa/dashboard");
        break;
      case "super_admin":
        navigate("/superadmin/dashboard");
        break;
      case "guru":
        navigate("/guru/dashboard");
        break;
      case "staff":
      case "tu":
        navigate("/staff/dashboard");
        break;
      case "kepsek":
        navigate("/kepsek/dashboard");
        break;
      default:
        navigate("/login-kepegawaian");
    }
  };

  const handleLogout = async () => {
    // Simpan role sebelum logout
    const userRole = user?.role;

    // Logout (hapus token & user data)
    await logout(navigate);

    // Redirect sesuai role
    if (userRole === "siswa") {
      navigate("/login-siswa");
    } else {
      navigate("/login-kepegawaian");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Tidak Diizinkan</h1>
        <p className="text-gray-600 mb-6">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={handleBackToDashboard} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Kembali ke Dashboard
          </button>
          <button onClick={handleLogout} className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
