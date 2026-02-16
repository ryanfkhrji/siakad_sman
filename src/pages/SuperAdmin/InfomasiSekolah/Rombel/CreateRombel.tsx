import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataSelectRombel } from "@/types/rombel";

interface FormErrors {
  kelas_id: string[];
  nama_rombel: string[];
  jurusan_id: string[];
  pesan: string[];
}

const CreateRombel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    kelas_id: "",
    nama_rombel: "",
    jurusan_id: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    kelas_id: [],
    nama_rombel: [],
    jurusan_id: [],
    pesan: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectRombel | null>(null);

  // Fetch data select
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/rombel");

        if (res.data.status === "success") {
          setSelectData(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data untuk form.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };

    fetchSelectData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      kelas_id: [],
      nama_rombel: [],
      jurusan_id: [],
      pesan: [],
    });

    setLoading(true);

    try {
      const res = await api.post("/spa/rombel", {
        kelas_id: Number(formData.kelas_id),
        nama_rombel: formData.nama_rombel,
        jurusan_id: formData.jurusan_id ? Number(formData.jurusan_id) : null,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data rombel berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-sekolah/rombel");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // HANDLE ERROR 400 atau 422 (Bad Request / Validation Error)
      if (errorStatus === 400 || errorStatus === 422) {
        // Error pesan khusus (duplikasi)
        if (errorData?.errors?.pesan) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat rombel!",
            text: Array.isArray(errorData.errors.pesan) ? errorData.errors.pesan[0] : errorData.errors.pesan,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // Handle validation errors biasa
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

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Rombel" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Rombongan Belajar</h1>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
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

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Status otomatis akan menjadi <strong>Aktif</strong>
                    </li>
                    <li>Pastikan nama rombel belum digunakan untuk kelas dan jurusan yang sama</li>
                    <li>Jurusan bersifat opsional</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-sekolah/rombel">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon size={18} />
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateRombel;
