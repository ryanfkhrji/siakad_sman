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
import type { Pegawai } from "@/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormErrors {
  nama_ekstrakurikuler?: string[];
  pengajar_id?: string[];
  anggaran?: string[];
  status?: string[];
}

const EditEkskul = () => {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [pengajarList, setPengajarList] = useState<Pegawai[]>([]);
  const [formData, setFormData] = useState({
    nama_ekstrakurikuler: "",
    pengajar_id: null as number | null,
    nama_pengajar: "",
    anggaran: "",
    status: "Aktif",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  // 🔹 Ambil data ekskul dan daftar pengajar
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Ambil data pegawai, ekskul, dan detail ekskul
        const [resPegawai, resEkskul, resDetail] = await Promise.all([api.get("/kepegawaian"), api.get("/ekstrakurikuler"), api.get(`/ekstrakurikuler/${id}`)]);

        if (resPegawai.data.status === "success" && resEkskul.data.status === "success" && resDetail.data.status === "success") {
          const semuaPegawai = resPegawai.data.data;
          const semuaEkskul = resEkskul.data.data;
          const detail = resDetail.data.data;

          // 🔹 Ambil semua pengajar yang sudah terdaftar (pakai nama karena backend tidak kirim id)
          const pengajarTerdaftar = semuaEkskul.map((e: any) => e.nama_pengajar).filter((nama: string) => !!nama);

          // 🔹 Filter pegawai yang belum menjadi pembina ekskul
          let pengajarBelumPembina = semuaPegawai.filter((p: any) => {
            const role = p.role?.toLowerCase();
            const sudahPembina = pengajarTerdaftar.includes(p.nama);
            return (role === "guru" || role === "staff") && !sudahPembina;
          });

          // 🔹 Cek apakah pengajar lama ada di daftar pegawai
          const pengajarLama = semuaPegawai.find((p: any) => p.nama === detail.nama_pengajar);

          // 🔹 Jika pengajar lama belum ada di daftar dropdown, tambahkan ke paling atas
          if (pengajarLama && !pengajarBelumPembina.some((p: any) => p.id === pengajarLama.id)) {
            pengajarBelumPembina = [pengajarLama, ...pengajarBelumPembina];
          }

          // 🔹 Simpan list pengajar ke state
          setPengajarList(pengajarBelumPembina);

          // 🔹 Isi form data (gunakan nama_pengajar untuk mencocokkan dropdown)
          setFormData({
            nama_ekstrakurikuler: detail.nama_ekstrakurikuler ?? "",
            pengajar_id: pengajarLama?.id ?? "", // ambil dari nama
            nama_pengajar: detail.nama_pengajar ?? "",
            anggaran: detail.anggaran?.toString() ?? "",
            status: detail.status ?? "Aktif",
          });
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Tidak dapat memuat data ekstrakurikuler.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // 🔹 Handle submit update ekskul
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors: FormErrors = {};

    if (!formData.nama_ekstrakurikuler.trim()) newErrors.nama_ekstrakurikuler = ["Nama ekstrakurikuler wajib diisi"];
    if (!formData.pengajar_id) newErrors.pengajar_id = ["Pengajar wajib dipilih"];
    if (!formData.anggaran.trim()) newErrors.anggaran = ["Anggaran wajib diisi"];

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
      const payload = {
        nama_ekstrakurikuler: formData.nama_ekstrakurikuler,
        pengajar_id: formData.pengajar_id,
        anggaran: Number(formData.anggaran),
        status: formData.status,
      };

      const res = await api.put(`/ekstrakurikuler/${id}`, payload);

      if (res.data.status === "success") {
        Swal.fire("Berhasil", res.data.message, "success").then(() => {
          navigate("/superadmin/informasi-akademik/ekstrakurikuler");
        });
      } else if (res.data.errors) {
        setErrors(res.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat memperbarui data.",
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

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <PageTitle title="Edit Ekstrakurikuler" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Ekstrakurikuler</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Nama Ekstrakurikuler */}
                <div>
                  <label htmlFor="nama_ekstrakurikuler" className="block font-semibold text-foreground">
                    Nama Ekstrakurikuler
                  </label>
                  <input
                    type="text"
                    name="nama_ekstrakurikuler"
                    value={formData.nama_ekstrakurikuler}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_ekstrakurikuler: e.target.value,
                      })
                    }
                    className="border p-2 w-full mt-2 rounded"
                  />
                  {errors.nama_ekstrakurikuler && <p className="text-red-500 text-sm mt-1">{errors.nama_ekstrakurikuler[0]}</p>}
                </div>

                {/* Pengajar */}
                <div>
                  <label htmlFor="pengajar_id" className="block font-semibold text-foreground">
                    Pengajar
                  </label>

                  <Select
                    value={formData.pengajar_id ? String(formData.pengajar_id) : ""}
                    onValueChange={(value) => {
                      setFormData({
                        ...formData,
                        pengajar_id: value ? Number(value) : null,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Pilih Pengajar" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Pengajar</SelectLabel>
                        {pengajarList.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.nama} ({p.role})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.pengajar_id && <p className="text-red-500 text-sm mt-1">{errors.pengajar_id[0]}</p>}
                </div>

                {/* Anggaran */}
                <div>
                  <label htmlFor="anggaran" className="block font-semibold text-foreground">
                    Anggaran
                  </label>
                  <input
                    type="number"
                    name="anggaran"
                    value={formData.anggaran}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        anggaran: e.target.value,
                      })
                    }
                    className="border p-2 w-full mt-2 rounded"
                  />
                  {errors.anggaran && <p className="text-red-500 text-sm mt-1">{errors.anggaran[0]}</p>}
                </div>

                {/* Status */}
                <div>
                  <label htmlFor="status" className="block font-semibold text-foreground">
                    Status
                  </label>
                  <input
                    type="text"
                    name="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value,
                      })
                    }
                    className="border p-2 w-full mt-2 rounded"
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/ekstrakurikuler">
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

export default EditEkskul;
