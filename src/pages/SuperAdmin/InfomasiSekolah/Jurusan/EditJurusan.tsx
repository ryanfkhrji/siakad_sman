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
  nama_jurusan?: string[];
}

const EditJurusan = () => {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    nama_jurusan: "",
    jumlah_siswa: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  // Ambil data jurusan berdasarkan ID
  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        setIsLoading(true);

        const res = await api.get(`/spa/jurusan/${id}`);
        if (res.data.status !== "success") {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: res.data.message || "Data jurusan tidak ditemukan.",
          });
          return;
        }

        const jurusan = res.data.data;

        // Set form data
        setFormData({
          nama_jurusan: jurusan.nama_jurusan ?? "",
          jumlah_siswa: jurusan.jumlah_siswa ?? 0,
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Tidak dapat terhubung ke server.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchJurusan();
  }, [id]);

  // Handle submit update jurusan
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const payload = {
        nama_jurusan: formData.nama_jurusan,
      };

      const res = await api.put(`/spa/jurusan/${id}`, payload);

      if (res.data.status === "success") {
        Swal.fire("Berhasil", res.data.message, "success").then(() => {
          navigate("/superadmin/informasi-sekolah/jurusan");
        });
      } else if (res.data.errors) {
        setErrors(res.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat memperbarui jurusan.",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}
      >
        <PageTitle title="Edit Jurusan" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Jurusan</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Nama Jurusan */}
                <div className="mb-6">
                  <label htmlFor="nama_jurusan" className="block font-semibold text-foreground">
                    Nama Jurusan
                  </label>
                  <input type="text" name="nama_jurusan" placeholder="cth: IPA" value={formData.nama_jurusan} onChange={(e) => setFormData({ ...formData, nama_jurusan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.nama_jurusan && <p className="text-red-500 text-sm mt-1">{errors.nama_jurusan[0]}</p>}
                </div>

                {/* Jumlah Siswa (Read Only) */}
                <div className="mb-6">
                  <label htmlFor="jumlah_siswa" className="block font-semibold text-foreground">
                    Jumlah Siswa
                  </label>
                  <input type="number" name="jumlah_siswa" value={formData.jumlah_siswa} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100 text-gray-600 cursor-not-allowed" disabled />
                  <p className="text-xs text-gray-500 mt-1">Nilai ini akan diperbarui otomatis dari data siswa.</p>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-sekolah/jurusan">
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

export default EditJurusan;
