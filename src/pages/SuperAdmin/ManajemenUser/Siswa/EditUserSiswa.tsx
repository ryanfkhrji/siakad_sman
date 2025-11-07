import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Siswa } from "@/types";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const EditUserSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Satu objek siswa untuk semua data
  const [siswa, setSiswa] = useState<Siswa | null>(null);

  // Password form
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ✅ Ambil data siswa
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<Siswa>>(`/siswa/${id}`);

        if (res.data.status === "success") {
          setSiswa(res.data.data);
        } else {
          Swal.fire("Error", res.data.message || "Gagal mengambil data siswa", "error");
        }
      } catch (error) {
        console.error("Gagal mengambil data siswa:", error);
        Swal.fire("Error", "Gagal mengambil data siswa", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const clearErrors = () => {
    setErrors({});
    setGeneralError("");
  };

  // ✅ Update password siswa
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    if (!siswa?.nisn) {
      setErrors((prev) => ({ ...prev, nisn: "Data siswa tidak valid" }));
      return;
    }

    if (!passwordLama) return setErrors({ password_lama: "Password lama wajib diisi" });
    if (!passwordBaru) return setErrors({ password_baru: "Password baru wajib diisi" });
    if (passwordBaru !== confirmPassword) return setErrors({ konfirmasi_password: "Konfirmasi password tidak cocok" });

    setIsLoading(true);

    try {
      const payload = {
        nisn: siswa.nisn,
        password_lama: passwordLama,
        password_baru: passwordBaru,
        konfirmasi_password: confirmPassword,
      };

      const res = await api.post("/ubah-password-siswa", payload);

      if (res.data?.status === "success") {
        await Swal.fire("Berhasil", res.data.message || "Password berhasil diperbarui", "success");
        navigate("/superadmin/manajemen-user/siswa");
      } else {
        Swal.fire("Gagal", res.data?.message || "Terjadi kesalahan", "error");
      }
    } catch (err: any) {
      console.error("Error API ubah password:", err);

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
        <PageTitle title="Edit User Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit User Siswa</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : siswa ? (
            <>
              <div className="bg-white rounded shadow p-5">
                {generalError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">{generalError}</div>}

                <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NISN */}
                  <div>
                    <label className="block font-semibold text-foreground">NISN</label>
                    <input type="text" value={siswa.nisn} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100" />
                  </div>

                  {/* Nama */}
                  <div>
                    <label className="block font-semibold text-foreground">Nama Lengkap</label>
                    <input type="text" value={siswa.nama} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100" disabled />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block font-semibold text-foreground">Status</label>
                    <input type="text" value={(siswa as any).status ?? "Aktif"} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100" disabled />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block font-semibold text-foreground">Role</label>
                    <input type="text" value={(siswa as any).role ?? "siswa"} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100" disabled />
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
                      placeholder="Min 5 karakter kombinasi huruf & simbol"
                      autoComplete="new-password"
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
                      placeholder="Konfirmasi Password"
                      autoComplete="current-password"
                    />
                    {errors.konfirmasi_password && <p className="text-sm text-red-600 mt-1">{errors.konfirmasi_password}</p>}
                  </div>

                  {/* Tampilkan password */}
                  <div className="flex items-center gap-2 mt-2">
                    <input id="showPwd" type="checkbox" checked={showPassword} onChange={() => setShowPassword((s) => !s)} />
                    <label htmlFor="showPwd" className="text-sm">
                      Tampilkan password
                    </label>
                  </div>

                  {/* Tombol Aksi */}
                  <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
                    <Button type="submit" className="bg-primary flex items-center gap-2" disabled={isLoading}>
                      <FilePlus size={18} />
                      {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                    <Link to="/superadmin/manajemen-user/siswa">
                      <Button className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                        <CircleXIcon />
                        Batal
                      </Button>
                    </Link>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600 mt-6">Data siswa tidak ditemukan.</p>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditUserSiswa;
