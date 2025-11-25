import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleX, FilePlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  nama_kelas?: string[];
  jam_masuk?: string[];
}

const EditKelasGuru = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState<{
    nama_kelas: string;
    jam_masuk: string;
  }>({
    nama_kelas: "",
    jam_masuk: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();

  // Ambil data kelas saat ini
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);
        const res = await api.get("/pegawai/kelas/show/diri");

        if (res.data.status === "success") {
          const data = res.data.data;
          setFormData({
            nama_kelas: data.nama_kelas,
            jam_masuk: data.jam_masuk,
          });
        }
      } catch (error: any) {
        console.error("Gagal mengambil data kelas:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Gagal mengambil data kelas",
        });
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

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

    if (!formData.jam_masuk.trim()) {
      newErrors.jam_masuk = ["Jam masuk wajib diisi"];
    }

    // Kalau ada error, tampilkan pesan dan hentikan submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);

      Swal.fire({
        icon: "warning",
        title: "Validasi Gagal!",
        text: "Field inputan harus diisi.",
        confirmButtonColor: "#EAB308",
      });

      return;
    }

    try {
      const res = await api.put("/pegawai/kelas/update/diri", formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kelas berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/guru/kelas/detail-kelas");
      } else if (res.data.status === "error" && res.data.errors) {
        setErrors(res.data.errors);

        Swal.fire({
          icon: "error",
          title: "Validasi Gagal!",
          text: Object.values(res.data.errors).flat().join(", "),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat menyimpan data kelas.",
        });
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);

        Swal.fire({
          icon: "error",
          title: "Validasi Gagal!",
          text: Object.values(error.response.data.errors).flat().join(", "),
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: error.response?.data?.message || "Tidak dapat terhubung ke server.",
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
          <h1 className="text-3xl font-bold mb-6">Edit Kelas Saya</h1>

          {fetchLoading ? (
            <div className="bg-white rounded shadow p-5">
              <p className="text-center text-gray-500">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Nama Kelas */}
                <div className="mb-6">
                  <label htmlFor="nama_kelas" className="block font-semibold text-foreground">
                    Nama Kelas
                  </label>
                  <input type="text" name="nama_kelas" placeholder="cth: 10 IPA 1" value={formData.nama_kelas} onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.nama_kelas && <p className="text-red-500 text-sm mt-1">{errors.nama_kelas[0]}</p>}
                </div>

                {/* Jam Masuk */}
                <div className="mb-6">
                  <label htmlFor="jam_masuk" className="block font-semibold text-foreground">
                    Jam Masuk
                  </label>
                  <input type="time" name="jam_masuk" value={formData.jam_masuk} onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.jam_masuk && <p className="text-red-500 text-sm mt-1">{errors.jam_masuk[0]}</p>}
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/guru/kelas/detail-kelas">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleX size={18} />
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

export default EditKelasGuru;
