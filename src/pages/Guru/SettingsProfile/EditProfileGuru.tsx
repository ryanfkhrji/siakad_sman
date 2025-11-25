import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarGuru } from "@/components/SidebarGuru";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Pegawai } from "@/types";
import { CircleXIcon, Save, Loader2Icon } from "lucide-react";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const EditProfileGuru = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nip: "",
    nama: "",
    email: "",
    status: "",
    keterangan: "",
    role: "",
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
  // 🔹 Fetch Data Super Admin
  // ==========================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get<ApiResponse<Pegawai>>("/pegawai/show/diri");

        if (res.data.status !== "success") {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: res.data.message || "Gagal mengambil data",
          });
          navigate("/guru/dashboard");
          return;
        }

        const user = res.data.data;

        if (user.role !== "guru") {
          await Swal.fire({
            icon: "error",
            title: "Error",
            text: "User ini bukan guru",
          });
          navigate("/guru/dashboard");
          return;
        }

        // Set form data dari response
        setFormData({
          nip: user.nip || "",
          nama: user.nama || "",
          email: user.email || "",
          status: (user as any).status || "",
          keterangan: (user as any).keterangan || "",
          role: user.role || "",
        });
      } catch (error: any) {
        console.error("Gagal mengambil data:", error);
        await Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Terjadi kesalahan mengambil data guru",
        });
        navigate("/guru/dashboard");
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

    if (!formData.nip.trim()) {
      err.nip = "NIP wajib diisi";
    }

    if (!formData.role) {
      err.role = "Role wajib diisi";
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
        nama: formData.nama.trim(),
        email: formData.email.trim(),
        status: formData.status.trim(),
        nip: formData.nip.trim(),
        keterangan: formData.keterangan.trim(),
        role: formData.role,
      };

      const res = await api.put("/pegawai/update/diri", payload);

      if (res.data?.status === "success") {
        await Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: res.data.message || "Profil berhasil diperbarui",
          confirmButtonText: "OK",
        });

        navigate("/guru/settings-profile/ubah-profile");
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
      } else if (status === 403) {
        // Handle forbidden (role sudah digunakan)
        const msg = data?.message || "Tidak memiliki akses";
        setGeneralError(msg);

        await Swal.fire({
          icon: "error",
          title: "Akses Ditolak",
          text: msg,
        });
      } else if (status === 401) {
        // Unauthorized
        await Swal.fire({
          icon: "error",
          title: "Sesi Berakhir",
          text: "Silakan login kembali",
        });
        navigate("/login-kepegawaian");
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
      <SidebarGuru isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <PageTitle title="Edit Profil Guru" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profil Guru</h1>
            <p className="text-sm text-gray-500 mt-2">Perbarui informasi profil anda sebagai guru</p>
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
                  {/* NIP */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      NIP <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nip"
                      value={formData.nip}
                      onChange={handleChange}
                      placeholder="Masukkan NIP"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.nip ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"} ${
                        isLoading ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.nip && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CircleXIcon size={14} />
                        {errors.nip}
                      </p>
                    )}
                  </div>

                  {/* Nama Lengkap */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Lengkap <span className="text-red-500">*</span>
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
                      Email <span className="text-red-500">*</span>
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

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <input
                      type="text"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      placeholder="Contoh: PNS, Honorer, Kontrak"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.status ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"} ${
                        isLoading ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.status && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CircleXIcon size={14} />
                        {errors.status}
                      </p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.role ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"} ${
                        isLoading ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">-- Pilih Role --</option>
                      <option value="guru">Guru</option>
                      <option value="staff">Staff</option>
                      <option value="tu">TU (Tata Usaha)</option>
                      <option value="kepsek">Kepala Sekolah</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    {errors.role && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CircleXIcon size={14} />
                        {errors.role}
                      </p>
                    )}
                    <p className="text-xs text-amber-600 mt-1 flex items-start gap-1">
                      <span className="mt-0.5">⚠️</span>
                      <span>Role super_admin dan kepsek tidak dapat diubah setelah ditetapkan</span>
                    </p>
                  </div>

                  {/* Keterangan - Full Width */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Keterangan</label>
                    <input
                      type="text"
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      placeholder="Masukkan keterangan (opsional)"
                      disabled={isLoading}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary transition-colors ${errors.keterangan ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-primary"} ${
                        isLoading ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    />
                    {errors.keterangan && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <CircleXIcon size={14} />
                        {errors.keterangan}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tombol */}
                <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
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

                  <Link to="/guru/dashboard">
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

export default EditProfileGuru;
