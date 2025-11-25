import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Pegawai } from "@/types";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const EditPasswordSuperAdmin = () => {
  // const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pegawai, setPegawai] = useState<Pegawai | null>(null);

  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ==========================================
  // 🔹 Helper - Bersihkan error
  // ==========================================
  const clearErrors = () => {
    setErrors({});
    setGeneralError("");
  };

  // ==========================================
  // 🔹 Helper - Validasi Password
  // ==========================================
  const validatePasswords = () => {
    const err: Record<string, string> = {};

    if (!passwordLama) err.password_lama = "Password lama wajib diisi";
    if (!passwordBaru) err.password_baru = "Password baru wajib diisi";
    if (passwordBaru !== confirmPassword) err.konfirmasi_password = "Konfirmasi password tidak cocok";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ==========================================
  // 🔹 Ambil Data Super Admin
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get<ApiResponse<Pegawai>>("/spa/show/diri");

        if (res.data.status !== "success") {
          return Swal.fire("Error", res.data.message || "Gagal mengambil data", "error");
        }

        const user = res.data.data;

        if (user.role !== "super_admin") {
          Swal.fire("Error", "User ini bukan super admin", "error");
          return;
        }

        setPegawai(user);
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        Swal.fire("Error", "Terjadi kesalahan mengambil data super admin", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ==========================================
  // 🔹 Submit Update Password
  // ==========================================
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    if (!pegawai?.nip) {
      setErrors({ nip: "NIP tidak valid" });
      return;
    }

    // Validasi terlebih dahulu
    if (!validatePasswords()) return;

    setIsLoading(true);

    try {
      const payload = {
        nip: pegawai.nip,
        email: pegawai.email,
        password_lama: passwordLama,
        password_baru: passwordBaru,
        konfirmasi_password: confirmPassword,
      };

      const res = await api.put("/spa/ubah-password/diri", payload);

      if (res.data?.status === "success") {
        await Swal.fire({
          title: "Berhasil",
          text: res.data.message || "Password berhasil diubah",
          icon: "success",
          confirmButtonText: "OK",
        });

        localStorage.clear();
        sessionStorage.clear();

        try {
          await api.post("/logout");
        } catch (e) {}

        window.location.href = "/login-kepegawaian";
        return;
      }

      Swal.fire("Gagal", res.data?.message || "Terjadi kesalahan", "error");
    } catch (err: any) {
      console.error("Error API ubah password:", err);

      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 422 && data?.errors) {
        const extracted: Record<string, string> = {};
        Object.keys(data.errors).forEach((key) => {
          extracted[key] = Array.isArray(data.errors[key]) ? data.errors[key][0] : data.errors[key];
        });
        setErrors(extracted);
      } else {
        const msg = data?.message || (status === 401 ? "Password lama salah" : "Terjadi kesalahan server");
        setGeneralError(msg);
        Swal.fire("Gagal", msg, "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit User Super Admin" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Password Super Admin</h1>

          {/* ⏳ Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : !pegawai ? (
            <p className="text-center text-gray-600 mt-6">Data super admin tidak ditemukan.</p>
          ) : (
            <div className="bg-white rounded shadow p-5">
              {/* Error general */}
              {generalError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{generalError}</div>}

              {/* FORM */}
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Readonly fields */}
                <div>
                  <label className="block font-semibold">NIP</label>
                  <input type="text" value={pegawai.nip} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block font-semibold">Nama Lengkap</label>
                  <input type="text" value={pegawai.nama} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block font-semibold">Email</label>
                  <input type="text" value={pegawai.email} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block font-semibold">Status</label>
                  <input type="text" value={(pegawai as any).status ?? "Aktif"} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                <div>
                  <label className="block font-semibold">Role</label>
                  <input type="text" value={(pegawai as any).role ?? "super_admin"} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                {/* Password Lama */}
                <div>
                  <label className="block font-semibold">Password Lama</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordLama}
                    onChange={(e) => setPasswordLama(e.target.value)}
                    placeholder="Password Lama"
                    className={`border p-2 w-full mt-2 rounded ${errors.password_lama ? "border-red-500" : ""}`}
                  />
                  {errors.password_lama && <p className="text-sm text-red-600 mt-1">{errors.password_lama}</p>}
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block font-semibold">Password Baru</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordBaru}
                    onChange={(e) => setPasswordBaru(e.target.value)}
                    placeholder="Minimal 5 karakter"
                    className={`border p-2 w-full mt-2 rounded ${errors.password_baru ? "border-red-500" : ""}`}
                  />
                  {errors.password_baru && <p className="text-sm text-red-600 mt-1">{errors.password_baru}</p>}
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label className="block font-semibold">Konfirmasi Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Konfirmasi Password"
                    className={`border p-2 w-full mt-2 rounded ${errors.konfirmasi_password ? "border-red-500" : ""}`}
                  />
                  {errors.konfirmasi_password && <p className="text-sm text-red-600 mt-1">{errors.konfirmasi_password}</p>}
                </div>

                {/* Tampilkan password */}
                <div className="flex items-center gap-2 mt-2">
                  <input id="showPwd" type="checkbox" checked={showPassword} onChange={() => setShowPassword((v) => !v)} />
                  <label htmlFor="showPwd" className="text-sm">
                    Tampilkan password
                  </label>
                </div>

                {/* Tombol */}
                <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
                  <Button disabled={isLoading} type="submit" className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>

                  <Link to="/superadmin/dashboard">
                    <Button className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon />
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditPasswordSuperAdmin;
