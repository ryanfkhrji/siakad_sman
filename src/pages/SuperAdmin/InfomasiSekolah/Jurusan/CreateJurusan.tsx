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
  nama_jurusan?: string[];
}

const CreateJurusan = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    nama_jurusan: "",
    jumlah_siswa: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await api.post("/spa/jurusan", formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data jurusan berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-sekolah/jurusan");
      } else if (res.data.status === "error" && res.data.errors) {
        setErrors(res.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat menyimpan data jurusan.",
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
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Tambah Jurusan" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Jurusan</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Nama Jurusan */}
              <div className="mb-6">
                <label htmlFor="nama_jurusan" className="block font-semibold text-foreground">
                  Nama Jurusan
                </label>
                <input
                  type="text"
                  name="nama_jurusan"
                  placeholder="cth: IPA / IPS / Bahasa"
                  value={formData.nama_jurusan}
                  onChange={(e) => setFormData({ ...formData, nama_jurusan: e.target.value })}
                  className="border p-2 w-full mt-2 rounded"
                />
                {errors.nama_jurusan && <p className="text-red-500 text-sm mt-1">{errors.nama_jurusan[0]}</p>}
              </div>

              {/* Jumlah Siswa (readonly) */}
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
                  {loading ? "Menyimpan..." : "Simpan"}
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
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateJurusan;
