import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePenLine } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  tahun_akademik: string[];
  keterangan: string[];
  status: string[];
}

const EditTahunAkademik = () => {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    tahun_akademik: "",
    keterangan: "",
    status: "aktif",
  });

  const [errors, setErrors] = useState<FormErrors>({
    tahun_akademik: [],
    keterangan: [],
    status: [],
  });

  const [loading, setLoading] = useState(false);
  const [initialStatus, setInitialStatus] = useState("");
  const navigate = useNavigate();

  // AMBIL DATA LAMA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/spa/tahun-akademik/${id}`);
        const data = res.data.data;

        setFormData({
          tahun_akademik: data.tahun_akademik || "",
          keterangan: data.keterangan || "",
          status: data.status_tahun_akademik || "aktif",
        });

        setInitialStatus(data.status_tahun_akademik || "aktif");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: "Terjadi kesalahan saat mengambil data.",
        });
      }
    };

    fetchData();
  }, [id]);

  // SUBMIT EDIT
const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  setErrors({
    tahun_akademik: [],
    keterangan: [],
    status: [],
  });

  setLoading(true);

  try {
    const res = await api.put(`/spa/tahun-akademik/${id}`, formData);

    if (res.data.status === "success") {
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data tahun akademik berhasil diperbarui.",
        timer: 1800,
        showConfirmButton: false,
      });

      navigate("/superadmin/informasi-sekolah/tahun-akademik");
    }
  } catch (error: any) {
    const errorStatus = error.response?.status;
    const errorData = error.response?.data;

    // HANDLE VALIDATION ERROR 422
    if (errorStatus === 422 && errorData?.errors) {
      // 1️⃣ Cek error khusus status (semester masih aktif / arsip tidak bisa diaktifkan)
      if (errorData.errors.status) {
        Swal.fire({
          icon: "warning",
          title: "Tidak dapat mengubah status!",
          text: Array.isArray(errorData.errors.status) ? errorData.errors.status[0] : errorData.errors.status,
          confirmButtonText: "OK",
        });
        setLoading(false);
        return;
      }

      // 2️⃣ Handle validation errors biasa (tahun_akademik, keterangan)
      setErrors(errorData.errors);
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
        <PageTitle title="Edit Tahun Akademik" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Tahun Akademik</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block font-semibold">
                  Tahun Akademik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="cth: 2025/2026"
                  value={formData.tahun_akademik}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tahun_akademik: e.target.value,
                    })
                  }
                  className="border p-2 w-full mt-2 rounded"
                />
                {errors.tahun_akademik?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tahun_akademik[0]}</p>}
              </div>

              <div className="mb-6">
                <label className="block font-semibold">Keterangan</label>
                <textarea
                  placeholder="Keterangan..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="border p-2 w-full mt-2 rounded h-32 resize-none"
                ></textarea>
                {errors.keterangan?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.keterangan[0]}</p>}
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Status <span className="text-red-500">*</span>
                </label>

                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={initialStatus === "arsip"}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih status --" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Status</SelectLabel>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="arsip">Arsip</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.status?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
              </div>

              {/* Info */}
              {initialStatus === "arsip" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <p>Tahun akademik yang sudah diarsipkan tidak dapat diubah statusnya kembali ke aktif.</p>
                </div>
              )}

              {formData.status === "arsip" && initialStatus === "aktif" && (
                <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Pastikan tidak ada semester yang masih aktif pada tahun akademik ini</li>
                    <li>Setelah diarsipkan, status tidak dapat dikembalikan ke aktif</li>
                  </ul>
                </div>
              )}

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePenLine size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
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

export default EditTahunAkademik;