import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
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

const SettingUserSuperAdmin = () => {
  const navigate = useNavigate();
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

  // ✅ Ambil data super admin
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<Pegawai[]>>(`/kepegawaian`);

        if (res.data.status === "success") {
          // Ambil user dengan role super_admin
          const superAdmin = res.data.data.find((p) => p.role === "super_admin");

          if (superAdmin) {
            setPegawai(superAdmin);
          } else {
            Swal.fire("Error", "Data super admin tidak ditemukan", "error");
          }
        } else {
          Swal.fire("Error", res.data.message || "Gagal mengambil data", "error");
        }
      } catch (error) {
        console.error("Gagal mengambil data super admin:", error);
        Swal.fire("Error", "Gagal mengambil data super admin", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const clearErrors = () => {
    setErrors({});
    setGeneralError("");
  };

  // ✅ Update data super admin
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    if (!pegawai?.nip) {
      setErrors((prev) => ({ ...prev, nip: "Data super admin tidak valid" }));
      return;
    }

    if (!passwordLama) return setErrors({ password_lama: "Password lama wajib diisi" });
    if (!passwordBaru) return setErrors({ password_baru: "Password baru wajib diisi" });
    if (passwordBaru !== confirmPassword) return setErrors({ konfirmasi_password: "Konfirmasi password tidak cocok" });

    setIsLoading(true);

    try {
      const payload = {
        nip: pegawai.nip,
        password_lama: passwordLama,
        password_baru: passwordBaru,
        konfirmasi_password: confirmPassword,
      };

      const res = await api.post("/ubah-password-pegawai", payload);

      if (res.data?.status === "success") {
        await Swal.fire("Berhasil", res.data.message || "Data berhasil diperbarui", "success");
        navigate("/superadmin/settings");
      } else {
        Swal.fire("Gagal", res.data?.message || "Terjadi kesalahan", "error");
      }
    } catch (err: any) {
      console.error("Error API ubah password:", err);
      Swal.fire("Gagal", "Terjadi kesalahan", "error");

      if (err.response) {
        const statusCode = err.response.status;
        const data = err.response.data;

        if (statusCode === 422 && data.errors) {
          const fieldErrors: Record<string, string> = {};
          for (const key of Object.keys(data.errors)) {
            fieldErrors[key] = Array.isArray(data.errors[key]) ? data.errors[key][0] : data.errors[key];
          }
          setErrors(fieldErrors);
        } else {
          const message = data?.message || (statusCode === 401 ? "Password lama salah" : `Terjadi kesalahan server (${statusCode})`);
          setGeneralError(message);
          Swal.fire("Gagal", message, "error");
        }
      } else {
        setGeneralError("Tidak dapat terhubung ke server");
        Swal.fire("Error", "Gagal terhubung ke server", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <PageTitle title="Edit User Super Admin" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit User Super Admin</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : pegawai ? (
            <div className="bg-white rounded shadow p-5">
              {generalError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{generalError}</div>}

              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIP */}
                <div>
                  <label className="block font-semibold text-foreground">NIP</label>
                  <input type="text" value={pegawai.nip} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                {/* Nama */}
                <div>
                  <label className="block font-semibold text-foreground">Nama Lengkap</label>
                  <input type="text" value={pegawai.nama} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-foreground">Status</label>
                  <input type="text" value={(pegawai as any).status ?? "Aktif"} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                {/* Role (readonly) */}
                <div>
                  <label className="block font-semibold text-foreground">Role</label>
                  <input type="text" value={(pegawai as any).role ?? "super_admin"} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                </div>

                {/* Password Lama */}
                <div>
                  <label className="block font-semibold text-foreground">Password Lama</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordLama}
                    onChange={(e) => setPasswordLama(e.target.value)}
                    className={`border p-2 w-full mt-2 rounded ${errors.password_lama ? "border-red-500" : ""}`}
                    required
                    placeholder="Password Lama"
                    autoComplete="current-password"
                  />
                  {errors.password_lama && <p className="text-sm text-red-600 mt-1">{errors.password_lama}</p>}
                </div>

                {/* Password Baru */}
                <div>
                  <label className="block font-semibold text-foreground">Password Baru</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={passwordBaru}
                    onChange={(e) => setPasswordBaru(e.target.value)}
                    className={`border p-2 w-full mt-2 rounded ${errors.password_baru ? "border-red-500" : ""}`}
                    required
                    autoComplete="new-password"
                    placeholder="Min 5 karakter kombinasi huruf & simbol"
                  />
                  {errors.password_baru && <p className="text-sm text-red-600 mt-1">{errors.password_baru}</p>}
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label className="block font-semibold text-foreground">Konfirmasi Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`border p-2 w-full mt-2 rounded ${errors.konfirmasi_password ? "border-red-500" : ""}`}
                    required
                    autoComplete="current-password"
                    placeholder="Konfirmasi Password"
                  />
                  {errors.konfirmasi_password && <p className="text-sm text-red-600 mt-1">{errors.konfirmasi_password}</p>}
                </div>

                {/* Checkbox tampilkan password */}
                <div className="flex items-center gap-2 mt-2">
                  <input id="showPwd" type="checkbox" checked={showPassword} onChange={() => setShowPassword((s) => !s)} />
                  <label htmlFor="showPwd" className="text-sm">
                    Tampilkan password
                  </label>
                </div>

                {/* Tombol aksi */}
                <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
                  <Button type="submit" className="bg-primary flex items-center gap-2" disabled={isLoading}>
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
          ) : (
            <p className="text-center text-gray-600 mt-6">Data super admin tidak ditemukan.</p>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default SettingUserSuperAdmin;
