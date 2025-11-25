import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSiswa } from "@/components/SidebarSiswa";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Siswa } from "@/types";
import { CircleXIcon, Save, Loader2Icon } from "lucide-react";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const EditProfileSiswa = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nisn: "",
    nama: "",
    email: "",
    nis: "",
    status: "",
    role: "",
    nama_jurusan: "",
    nama_kelas: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState("");

  // ==========================================
  // 🔹 Helper - Clear Errors
  // ==========================================
  const clearErrors = () => {
    setErrors({});
    setGeneralError("");
  };

  // ==========================================
  // 🔹 Fetch Data Siswa
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get<ApiResponse<Siswa>>("/siswa/show/diri");

        if (res.data.status !== "success") {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: res.data.message || "Gagal mengambil data",
          });
          navigate("/siswa/dashboard");
          return;
        }

        const user = res.data.data;

        if (user.role !== "siswa") {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "User ini bukan siswa",
          });
          navigate("/siswa/dashboard");
          return;
        }

        // Set form data dari response
        setFormData({
          nisn: user.nisn || "",
          nama: user.nama || "",
          email: user.email || "",
          nis: user.nis || "",
          status: user.status || "",
          role: user.role || "",
          nama_jurusan: user.nama_jurusan || "",
          nama_kelas: typeof user.kelas === "object" && user.kelas ? (user.kelas as any).nama_kelas || "" : "",
        });
      } catch (error: any) {
        console.error("Gagal mengambil data:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Terjadi kesalahan mengambil data siswa",
        });
        navigate("/siswa/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // ==========================================
  // 🔹 Handle Input Change
  // ==========================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error untuk field yang sedang diubah
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear general error saat user mulai mengetik
    if (generalError) {
      setGeneralError("");
    }
  };

  // ==========================================
  // 🔹 Validasi Form
  // ==========================================
  const validateForm = () => {
    const err: Record<string, string> = {};

    if (!formData.nama.trim()) {
      err.nama = "Nama wajib diisi";
    }

    if (!formData.email.trim()) {
      err.email = "Email wajib diisi";
    } else {
      // Validasi email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        err.email = "Format email tidak valid";
      }
    }

    if (!formData.nisn.trim()) {
      err.nisn = "NISN wajib diisi";
    }

    if (!formData.nis.trim()) {
      err.nis = "NIS wajib diisi";
    }

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ==========================================
  // 🔹 Submit Update Profil
  // ==========================================
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    if (!validateForm()) {
      await Swal.fire({
        icon: "warning",
        title: "Validasi Gagal",
        text: "Mohon lengkapi semua field yang wajib diisi",
      });
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        nisn: formData.nisn.trim(),
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        nis: formData.nis.trim(),
      };

      const res = await api.put("/siswa/update/diri", payload);

      if (res.data?.status === "success") {
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: res.data.message || "Profil berhasil diperbarui",
          confirmButtonText: "OK",
        });

        navigate("/siswa/dashboard");
        return;
      }

      await Swal.fire({
        icon: "error",
        title: "Gagal",
        text: res.data?.message || "Terjadi kesalahan",
      });
    } catch (err: any) {
      console.error("Error API update profil:", err);

      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 422 && data?.errors) {
        // Handle validation errors dari backend
        const extracted: Record<string, string> = {};
        Object.keys(data.errors).forEach((key) => {
          extracted[key] = Array.isArray(data.errors[key]) ? data.errors[key][0] : data.errors[key];
        });
        setErrors(extracted);

        await Swal.fire({
          icon: "error",
          title: "Validasi Gagal",
          text: data?.message || "Mohon periksa kembali form anda",
        });
      } else if (status === 404) {
        // Handle not found
        const msg = data?.message || "Data siswa tidak ditemukan";
        setGeneralError(msg);

        await Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: msg,
        });
      } else if (status === 401) {
        // Unauthorized
        await Swal.fire({
          icon: "error",
          title: "Sesi Berakhir",
          text: "Silakan login kembali",
        });
        navigate("/login-siswa");
      } else {
        const msg = data?.message || "Terjadi kesalahan server";
        setGeneralError(msg);

        await Swal.fire({
          icon: "error",
          title: "Gagal",
          text: msg,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <PageTitle title="Edit Profil Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profil Siswa</h1>
            <p className="text-sm text-gray-500 mt-2">Perbarui informasi profil Anda sebagai Siswa</p>
          </div>

          {/* ⏳ Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600 bg-white rounded-lg shadow">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              {/* Error general */}
              {generalError && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <CircleXIcon className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">{generalError}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* FORM */}
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* NISN */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NISN {/*<span className="text-red-500">*</span> */}
                    </label>
                    <input
                      type="text"
                      name="nisn"
                      value={formData.nisn}
                      onChange={handleChange}
                      placeholder="Masukkan NISN"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.nisn ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"} ${
                        isLoading ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.nisn && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CircleXIcon size={14} />
                        {errors.nisn}
                      </p>
                    )}
                  </div>

                  {/* NIS */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIS
                    </label>
                    <input
                      type="text"
                      name="nis"
                      value={formData.nis}
                      onChange={handleChange}
                      placeholder="Masukkan NIS"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.nis ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"} ${
                        isLoading ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.nis && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CircleXIcon size={14} />
                        {errors.nis}
                      </p>
                    )}
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      placeholder="Masukkan nama lengkap"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.nama ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"} ${
                        isLoading ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.nama && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CircleXIcon size={14} />
                        {errors.nama}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="contoh@email.com"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"} ${
                        isLoading ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CircleXIcon size={14} />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Status - Readonly */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <input type="text" name="status" value={formData.status} readOnly disabled className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed border-gray-300" />
                  </div>

                  {/* Role - Readonly */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <input type="text" name="role" value={formData.role} readOnly disabled className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed border-gray-300" />
                  </div>

                  {/* Jurusan - Readonly */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Jurusan</label>
                    <input type="text" name="nama_jurusan" value={formData.nama_jurusan || "-"} readOnly disabled className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed border-gray-300" />
                    <p className="text-xs text-gray-500 mt-1">Hubungi admin untuk mengubah jurusan</p>
                  </div>

                  {/* Kelas - Readonly */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Kelas</label>
                    <input type="text" name="nama_kelas" value={formData.nama_kelas || "-"} readOnly disabled className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed border-gray-300" />
                    <p className="text-xs text-gray-500 mt-1">Hubungi admin untuk mengubah kelas</p>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">Anda hanya dapat mengubah NISN, NIS, Nama, dan Email. Untuk perubahan data lain seperti kelas, jurusan, atau status, silakan hubungi administrator sekolah.</p>
                    </div>
                  </div>
                </div>

                {/* Tombol */}
                <div className="flex gap-3 pt-4">
                  <Button disabled={isLoading} type="submit" className="bg-primary hover:bg-primary/90 flex items-center gap-2 px-6">
                    {isLoading ? (
                      <>
                        <Loader2Icon size={18} className="animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>

                  <Link to="/siswa/dashboard">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon size={18} />
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

export default EditProfileSiswa;
