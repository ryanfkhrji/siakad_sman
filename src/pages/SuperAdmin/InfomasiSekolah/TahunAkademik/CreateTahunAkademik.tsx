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
  tahun_akademik: string[];
  keterangan: string[];
}

const CreateTahunAkademik = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    tahun_akademik: "",
    keterangan: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    tahun_akademik: [],
    keterangan: [],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      tahun_akademik: [],
      keterangan: [],
    });

    setLoading(true);

    try {
      const res = await api.post("/spa/tahun-akademik", formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data tahun akademik berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-sekolah/tahun-akademik");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // HANDLE ERROR 400 atau 422 (Bad Request / Validation Error)
      if (errorStatus === 400 || errorStatus === 422) {
        // Jika ada error pesan khusus (double aktif, dll)
        if (errorData?.errors?.pesan) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat tahun akademik!",
            text: errorData.errors.pesan,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // Handle validation errors biasa (tahun_akademik, keterangan)
        if (errorData?.errors) {
          setErrors(errorData.errors);
        }

        setLoading(false);
        return;
      }

      // Handle error lainnya (500, network error, dll)
      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: errorData?.message || "Tidak dapat terhubung ke server.",
      });
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
        <PageTitle title="Tambah Tahun Akademik" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Tahun Akademik</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block font-semibold">
                  Tahun Akademik <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="cth: 2025/2026" value={formData.tahun_akademik} onChange={(e) => setFormData({ ...formData, tahun_akademik: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.tahun_akademik?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tahun_akademik[0]}</p>}
              </div>

              <div className="mb-6">
                <label className="block font-semibold">Keterangan</label>
                <textarea placeholder="Keterangan..." value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} className="border p-2 w-full mt-2 rounded h-32 resize-none"></textarea>
                {errors.keterangan?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.keterangan[0]}</p>}
              </div>

              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Status otomatis akan menjadi <strong>Aktif</strong>
                  </li>
                  <li>Pastikan tidak ada tahun akademik lain yang masih aktif</li>
                </ul>
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Link to="/superadmin/informasi-sekolah/tahun-akademik">
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

export default CreateTahunAkademik;
