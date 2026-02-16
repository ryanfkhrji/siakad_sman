import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePenLine, Loader2Icon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { DataSelectRombel } from "@/types/rombel";

interface FormErrors {
  kelas_id: string[];
  nama_rombel: string[];
  jurusan_id: string[];
  status: string[];
  pesan: string[];
}

const EditRombel = () => {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    kelas_id: "",
    nama_rombel: "",
    jurusan_id: "",
    status: "aktif",
  });

  const [errors, setErrors] = useState<FormErrors>({
    kelas_id: [],
    nama_rombel: [],
    jurusan_id: [],
    status: [],
    pesan: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [initialStatus, setInitialStatus] = useState("");
  const [selectData, setSelectData] = useState<DataSelectRombel | null>(null);

  // AMBIL DATA LAMA dan DATA SELECT
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setLoadingSelect(true);

        const [resDetail, resSelect] = await Promise.all([api.get(`/spa/rombel/${id}`), api.get("/spa/data-select/rombel")]);

        // Set select data
        if (resSelect.data.status === "success") {
          setSelectData(resSelect.data.data);
        }

        // Set form data dari detail
        if (resDetail.data.status === "success") {
          const detail = resDetail.data.data;

          setFormData({
            kelas_id: String(detail.kelas.kelas_id),
            nama_rombel: detail.nama_rombel,
            jurusan_id: detail.jurusan.jurusan_id ? String(detail.jurusan.jurusan_id) : "",
            status: detail.status_rombel,
          });

          setInitialStatus(detail.status_rombel);
        }

        setLoadingData(false);
        setLoadingSelect(false);
      } catch (error: any) {
        if (error.response?.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Data tidak ditemukan!",
            text: "Data rombel tidak ditemukan.",
          });
          navigate("/superadmin/informasi-sekolah/rombel");
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Terjadi kesalahan saat mengambil data.",
          });
        }
        setLoadingData(false);
        setLoadingSelect(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  // SUBMIT EDIT
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      kelas_id: [],
      nama_rombel: [],
      jurusan_id: [],
      status: [],
      pesan: [],
    });

    setLoading(true);

    try {
      const res = await api.put(`/spa/rombel/${id}`, {
        kelas_id: Number(formData.kelas_id),
        nama_rombel: formData.nama_rombel,
        jurusan_id: formData.jurusan_id ? Number(formData.jurusan_id) : null,
        status: formData.status,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data rombel berhasil diperbarui.",
          timer: 1800,
          showConfirmButton: false,
        });

        navigate("/superadmin/informasi-sekolah/rombel");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // HANDLE VALIDATION ERROR 422
      if (errorStatus === 422 && errorData?.errors) {
        // Error pesan khusus (duplikasi nama rombel)
        if (errorData.errors.nama_rombel) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah data!",
            text: Array.isArray(errorData.errors.nama_rombel) ? errorData.errors.nama_rombel[0] : errorData.errors.nama_rombel,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // Error status khusus
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

        // Handle validation errors biasa
        setErrors(errorData.errors);
        setLoading(false);
        return;
      }

      // Error 404
      if (errorStatus === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: errorData?.message || "Data tidak ditemukan.",
        });
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

  if (loadingData || loadingSelect) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Edit Rombel" />

          <div className="mx-auto p-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>

          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Rombel" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Rombongan Belajar</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Kelas */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Kelas <span className="text-red-500">*</span>
                </label>

                <Select value={formData.kelas_id} onValueChange={(value) => setFormData({ ...formData, kelas_id: value })}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih kelas --" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Kelas</SelectLabel>
                      {selectData?.kelas.map((kelas) => (
                        <SelectItem key={kelas.kelas_id} value={String(kelas.kelas_id)}>
                          Kelas {kelas.nama_kelas} (Tingkat {kelas.tingkat_kelas})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.kelas_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kelas_id[0]}</p>}
              </div>

              {/* Nama Rombel */}
              <div className="mb-6">
                <label className="block font-semibold">
                  Nama Rombel <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="contoh: X-A-1" value={formData.nama_rombel} onChange={(e) => setFormData({ ...formData, nama_rombel: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.nama_rombel?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nama_rombel[0]}</p>}
              </div>

              {/* Jurusan */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">Jurusan</label>

                <Select
                  value={formData.jurusan_id}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      jurusan_id: value === "none" ? "" : value,
                    })
                  }
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih jurusan (opsional) --" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Jurusan</SelectLabel>
                      <SelectItem value="none">Tidak ada jurusan</SelectItem>
                      {selectData?.jurusan.map((jurusan) => (
                        <SelectItem key={jurusan.jurusan_id} value={String(jurusan.jurusan_id)}>
                          {jurusan.nama_jurusan}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.jurusan_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jurusan_id[0]}</p>}
              </div>

              {/* Status */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Status <span className="text-red-500">*</span>
                </label>

                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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

              {/* Info perubahan status */}
              {formData.status !== initialStatus && (
                <div className={`${formData.status === "arsip" ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-blue-50 border-blue-200 text-blue-800"} border rounded p-3 text-sm`}>
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  {formData.status === "arsip" ? (
                    <p>
                      Status akan diubah menjadi <strong>Arsip</strong>. Rombel yang diarsipkan dapat diubah kembali ke aktif.
                    </p>
                  ) : (
                    <p>
                      Status akan diubah menjadi <strong>Aktif</strong>.
                    </p>
                  )}
                </div>
              )}

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePenLine size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>

                <Link to="/superadmin/informasi-sekolah/rombel">
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

export default EditRombel;
