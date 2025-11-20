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
  nama_pelajaran: string;
  status: string;
}

const CreateMataPelajaran = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    nama_pelajaran: "",
    status: "",
  });

  const [errors, setErrors] = useState<FormErrors>({ nama_pelajaran: "", status: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ nama_pelajaran: "", status: "" });
    setLoading(true);

    try {
      const res = await api.post("/spa/mata-pelajaran", formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data mata pelajaran berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-akademik/mata-pelajaran");
      } else if (res.data.status === "error" && res.data.errors) {
        setErrors(res.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat menyimpan data mata pelajaran.",
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
        <PageTitle title="Tambah Mata Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Mata Pelajaran</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Nama Mata Pelajaran */}
              <div className="mb-6">
                <label htmlFor="nama_pelajaran" className="block font-semibold text-foreground">
                  Nama Mata Pelajaran
                </label>
                <input
                  type="text"
                  name="nama_pelajaran"
                  placeholder="cth: IPA / IPS / Bahasa Indonesia"
                  value={formData.nama_pelajaran}
                  onChange={(e) => setFormData({ ...formData, nama_pelajaran: e.target.value })}
                  className="border p-2 w-full mt-2 rounded"
                />
                {errors.nama_pelajaran && <p className="text-red-500 text-sm mt-1">{errors.nama_pelajaran[0]}</p>}
              </div>

              {/* Status */}
              <div className="mb-6">
                <label htmlFor="status" className="block font-semibold text-foreground">
                  Status
                </label>

                <select name="status" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="border p-2 w-full mt-2 rounded bg-white">
                  <option value="">-- Pilih Status --</option>
                  <option value="wajib">Wajib</option>
                  <option value="pilihan">Pilihan</option>
                  <option value="jurusan">Jurusan</option>
                </select>

                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
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

export default CreateMataPelajaran;
