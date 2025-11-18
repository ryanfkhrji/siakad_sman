import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CircleXIcon, FilePlus } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Ekskul, Pegawai } from "@/types";

interface FormErrors {
  nama_ekstrakurikuler?: string[];
  pengajar_id?: string[];
  anggaran?: string[];
  status?: string[];
}

const CreateEkskul = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pengajarList, setPengajarList] = useState<Pegawai[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    nama_ekstrakurikuler: "",
    pengajar_id: "",
    anggaran: "",
    status: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [resPegawai, resEkskul] = await Promise.all([api.get("/spa/kepegawaian"), api.get("/spa/ekstrakurikuler")]);

        if (resPegawai.data.status === "success" && resEkskul.data.status === "success") {
          const semuaPegawai: Pegawai[] = resPegawai.data.data;
          const semuaEkskul: Ekskul[] = resEkskul.data.data;

          // Ambil nama pengajar ekskul yang sudah terdaftar (karena backend tidak kirim pengajar_id)
          const pengajarTerdaftar = semuaEkskul.map((e) => e.nama_pengajar).filter((nama): nama is string => !!nama); // pastikan tidak null

          // Filter pegawai yang belum jadi pembina (bandingkan nama, bukan id)
          const pengajarBelumPembina = semuaPegawai.filter((p) => {
            const role = p.role?.toLowerCase();
            const sudahPembina = pengajarTerdaftar.includes(p.nama);
            return (role === "guru" || role === "staff") && !sudahPembina;
          });

          setPengajarList(pengajarBelumPembina);
        }
      } catch (err) {
        console.error("Gagal memuat data pengajar:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const newErrors: FormErrors = {};
    if (!formData.nama_ekstrakurikuler.trim()) newErrors.nama_ekstrakurikuler = ["Nama ekstrakurikuler wajib diisi"];
    if (!formData.pengajar_id) newErrors.pengajar_id = ["Pengajar wajib dipilih"];
    if (!formData.anggaran.trim()) newErrors.anggaran = ["Anggaran wajib diisi"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      Swal.fire({
        icon: "warning",
        title: "Validasi Gagal!",
        text: "Field inputan harus diisi.",
        confirmButtonColor: "#EAB308",
      });
      return;
    }

    try {
      const res = await api.post("/spa/ekstrakurikuler", {
        nama_ekstrakurikuler: formData.nama_ekstrakurikuler.trim(),
        pengajar_id: Number(formData.pengajar_id),
        anggaran: Number(formData.anggaran),
        status: formData.status.trim() || "Aktif",
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.data.message || "Ekstrakurikuler berhasil dibuat.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-akademik/ekstrakurikuler");
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: res.data.message || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    } catch (err: any) {
      console.error("Error detail:", err.response?.data);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan!",
        text: err.response?.data?.message || "Terjadi kesalahan koneksi ke server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Ekstrakurikuler" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Ekstrakurikuler</h1>

          <div className="bg-white rounded shadow p-5">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg w-full">
              {/* Nama Ekskul */}
              <div>
                <label htmlFor="nama_ekstrakurikuler" className="block font-semibold text-foreground">
                  Nama Ekstrakurikuler
                </label>
                <input id="nama_ekstrakurikuler" name="nama_ekstrakurikuler" placeholder="Contoh: Pramuka, Paskibra" value={formData.nama_ekstrakurikuler} onChange={handleChange} className="border p-2 w-full mt-2 rounded" required />
                {errors.nama_ekstrakurikuler && <p className="text-red-500 text-sm mt-1">{errors.nama_ekstrakurikuler[0]}</p>}
              </div>

              {/* Pengajar */}
              <div>
                <label htmlFor="pengajar_id" className="block font-semibold text-foreground">
                  Pilih Pengajar
                </label>
                <Select value={formData.pengajar_id} onValueChange={(value) => setFormData({ ...formData, pengajar_id: value })} disabled={loading}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder={loading ? "Memuat..." : "Pilih Pengajar"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Guru & Staff</SelectLabel>
                      {pengajarList.length > 0 ? (
                        pengajarList.map((p) => (
                          <SelectItem key={p.id} value={String(p.id)}>
                            {p.nama} ({p.role})
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">Tidak ada pengajar yang tersedia</div>
                      )}
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
                <input id="anggaran" name="anggaran" type="number" placeholder="Contoh: 2000000" value={formData.anggaran} onChange={handleChange} required className="border p-2 w-full mt-2 rounded" />
                {errors.anggaran && <p className="text-red-500 text-sm mt-1">{errors.anggaran[0]}</p>}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block font-semibold text-foreground">
                  Status
                </label>
                <input id="status" name="status" type="text" placeholder="Contoh: Aktif" value={formData.status} onChange={handleChange} required className="border p-2 w-full mt-2 rounded" />
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {isLoading ? "Menyimpan..." : "Simpan"}
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
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateEkskul;
