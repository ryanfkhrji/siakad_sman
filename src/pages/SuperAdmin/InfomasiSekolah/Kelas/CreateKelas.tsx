import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  nama_kelas?: string[];
  kode_kelas?: string[];
  tingkat?: string[];
}

const CreateKelas = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    nama_kelas: "",
    kode_kelas: "",
    tingkat: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validasi input di frontend
    const newErrors: FormErrors = {};

    if (!formData.nama_kelas.trim()) {
      newErrors.nama_kelas = ["Nama kelas wajib diisi"];
    }

    if (!formData.kode_kelas.trim()) {
      newErrors.kode_kelas = ["Kode kelas wajib diisi"];
    }

    if (!formData.tingkat) {
      newErrors.tingkat = ["Tingkat kelas wajib dipilih"];
    }

    // Kalau ada error, tampilkan pesan dan hentikan submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);

      Swal.fire({
        icon: "warning",
        title: "Validasi Gagal!",
        text: "Semua field wajib diisi.",
        confirmButtonColor: "#EAB308",
      });

      return;
    }

    try {
      const payload = {
        nama_kelas: formData.nama_kelas,
        kode_kelas: formData.kode_kelas,
        tingkat: Number(formData.tingkat),
      };

      const res = await api.post("/spa/kelas", payload);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kelas berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-sekolah/kelas");
      }
    } catch (err: any) {
      console.error("Error response:", err.response);

      // Tangani error dari backend
      if (err.response?.status === 422) {
        // Validasi gagal dari backend
        const backendErrors = err.response.data?.errors || {};
        setErrors(backendErrors);

        // Tampilkan pesan error pertama
        const firstError = Object.values(backendErrors)[0];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : "Periksa kembali form Anda.";

        Swal.fire({
          icon: "error",
          title: "Validasi Gagal!",
          text: errorMessage,
        });
      } else if (err.response?.data?.message) {
        // Error lainnya dengan message
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: err.response.data.message,
        });
      } else {
        // Error koneksi atau lainnya
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Tidak dapat terhubung ke server.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Tambah Kelas" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Kelas</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Nama Kelas */}
              <div className="mb-6">
                <label htmlFor="nama_kelas" className="block font-semibold text-foreground">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_kelas"
                  placeholder="Contoh: X, XI, XII"
                  value={formData.nama_kelas}
                  onChange={(e) => {
                    setFormData({ ...formData, nama_kelas: e.target.value });
                    // Clear error saat user mengetik
                    if (errors.nama_kelas) {
                      setErrors({ ...errors, nama_kelas: undefined });
                    }
                  }}
                  className={`border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.nama_kelas ? "border-red-500" : ""}`}
                />
                {errors.nama_kelas && <p className="text-red-500 text-sm mt-1">{errors.nama_kelas[0]}</p>}
              </div>

              {/* Kode Kelas */}
              <div className="mb-6">
                <label htmlFor="kode_kelas" className="block font-semibold text-foreground">
                  Kode Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="kode_kelas"
                  placeholder="Contoh: K10, K11, K12"
                  value={formData.kode_kelas}
                  onChange={(e) => {
                    setFormData({ ...formData, kode_kelas: e.target.value });
                    // Clear error saat user mengetik
                    if (errors.kode_kelas) {
                      setErrors({ ...errors, kode_kelas: undefined });
                    }
                  }}
                  className={`border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.kode_kelas ? "border-red-500" : ""}`}
                />
                {errors.kode_kelas && <p className="text-red-500 text-sm mt-1">{errors.kode_kelas[0]}</p>}
              </div>

              {/* Tingkat */}
              <div className="mb-6">
                <label htmlFor="tingkat" className="block font-semibold text-foreground">
                  Tingkat <span className="text-red-500">*</span>
                </label>
                <select
                  name="tingkat"
                  value={formData.tingkat}
                  onChange={(e) => {
                    setFormData({ ...formData, tingkat: e.target.value });
                    // Clear error saat user memilih
                    if (errors.tingkat) {
                      setErrors({ ...errors, tingkat: undefined });
                    }
                  }}
                  className={`border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary ${errors.tingkat ? "border-red-500" : ""}`}
                >
                  <option value="">Pilih Tingkat</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
                {errors.tingkat && <p className="text-red-500 text-sm mt-1">{errors.tingkat[0]}</p>}
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Link to="/superadmin/informasi-sekolah/kelas">
                  <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                    <CircleXIcon size={18} />
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateKelas;
