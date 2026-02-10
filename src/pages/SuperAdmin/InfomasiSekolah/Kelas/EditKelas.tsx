import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  nama_kelas?: string[];
  kode_kelas?: string[];
  tingkat?: string[];
  status?: string[];
}

const EditKelas = () => {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    nama_kelas: "",
    kode_kelas: "",
    tingkat: "",
    status: "aktif",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  // Ambil data kelas berdasarkan ID
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        setIsLoading(true);

        const res = await api.get(`/spa/kelas/${id}`);
        if (res.data.status !== "success") {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: res.data.message || "Data kelas tidak ditemukan.",
          });
          navigate("/superadmin/informasi-sekolah/kelas");
          return;
        }

        const kelas = res.data.data;

        setFormData({
          nama_kelas: kelas.nama_kelas ?? "",
          kode_kelas: kelas.kode_kelas ?? "",
          tingkat: kelas.tingkat?.toString() ?? "",
          status: kelas.status ?? "aktif",
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Tidak dapat terhubung ke server.",
        });
        navigate("/superadmin/informasi-sekolah/kelas");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchKelas();
    }
  }, [id, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validasi sederhana di sisi frontend
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

    // Jika ada error → hentikan submit dan tampilkan pesan
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
        status: formData.status,
      };

      const res = await api.put(`/spa/kelas/${id}`, payload);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.data.message || "Data kelas berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        }).then(() => {
          navigate("/superadmin/informasi-sekolah/kelas");
        });
      } else if (res.data.status === "error" && res.data.errors) {
        setErrors(res.data.errors);
        Swal.fire({
          icon: "error",
          title: "Validasi Gagal!",
          text: "Periksa kembali form Anda.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat memperbarui kelas.",
        });
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
        Swal.fire({
          icon: "error",
          title: "Validasi Gagal!",
          text: err.response.data.message || "Periksa kembali form Anda.",
        });
      } else {
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
        <PageTitle title="Edit Kelas" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Kelas</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
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
                    onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })}
                    className="border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
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
                    onChange={(e) => setFormData({ ...formData, kode_kelas: e.target.value })}
                    className="border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {errors.kode_kelas && <p className="text-red-500 text-sm mt-1">{errors.kode_kelas[0]}</p>}
                </div>

                {/* Tingkat */}
                <div className="mb-6">
                  <label htmlFor="tingkat" className="block font-semibold text-foreground">
                    Tingkat <span className="text-red-500">*</span>
                  </label>
                  <select name="tingkat" value={formData.tingkat} onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })} className="border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Pilih Tingkat</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                  </select>
                  {errors.tingkat && <p className="text-red-500 text-sm mt-1">{errors.tingkat[0]}</p>}
                </div>

                {/* Status */}
                <div className="mb-6">
                  <label htmlFor="status" className="block font-semibold text-foreground">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select name="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="border p-2 w-full mt-2 rounded focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="aktif">Aktif</option>
                    <option value="arsip">Arsip</option>
                  </select>
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
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
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditKelas;
