import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Pegawai } from "@/types";

interface FormErrors {
  nama_kelas?: string[];
  jam_masuk?: string[];
  wali_kelas?: string[];
}

const CreateKelas = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [guruList, setGuruList] = useState<Pegawai[]>([]);
  const [formData, setFormData] = useState<{
    nama_kelas: string;
    jam_masuk: string;
    wali_kelas: number | null;
  }>({
    nama_kelas: "",
    jam_masuk: "",
    wali_kelas: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Ambil daftar guru dari backend dan filter otomatis hanya yang belum jadi wali kelas
  useEffect(() => {
    const fetchGuru = async () => {
      try {
        const res = await api.get("/kepegawaian");
        if (res.data.status === "success") {
          const guruOnly = res.data.data.filter((p: Pegawai) => p.role === "guru" && (!p.kelas || !p.kelas?.jam_masuk));
          setGuruList(guruOnly);
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data guru",
          text: "Terjadi kesalahan koneksi ke server.",
        });
      }
    };

    fetchGuru();
  }, []);

  // 2️ Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // 🔹 Validasi input di frontend
    const newErrors: FormErrors = {};

    if (!formData.nama_kelas.trim()) {
      newErrors.nama_kelas = ["Nama kelas wajib diisi"];
    }

    if (!formData.jam_masuk.trim()) {
      newErrors.jam_masuk = ["Jam masuk wajib diisi"];
    }

    if (!formData.wali_kelas) {
      newErrors.wali_kelas = ["Wali kelas wajib dipilih"];
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

      return; // stop kirim ke backend
    }

    try {
      const res = await api.post("/kelas", formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kelas berhasil ditambahkan.",
          showConfirmButton: true,
        });
        navigate("/superadmin/informasi-sekolah/kelas");
      } else if (res.data.status === "error" && res.data.errors) {
        setErrors(res.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat menyimpan data kelas.",
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
        <PageTitle title="Tambah Kelas" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Kelas</h1>

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

              {/* Wali Kelas */}
              <div className="mb-6">
                <label htmlFor="wali_kelas" className="block font-semibold text-foreground">
                  Wali Kelas
                </label>
                <Select onValueChange={(value) => setFormData({ ...formData, wali_kelas: Number(value) })} value={formData.wali_kelas?.toString() || ""}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Pilih Wali Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Guru</SelectLabel>
                      {guruList.length > 0 ? (
                        guruList.map((guru) => (
                          <SelectItem key={guru.id} value={guru.id.toString()}>
                            {guru.nama}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-muted-foreground p-2 text-sm">Semua guru sudah menjadi wali kelas</div>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.wali_kelas && <p className="text-red-500 text-sm mt-1">{errors.wali_kelas[0]}</p>}
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Link to="/superadmin/informasi-sekolah/kelas">
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

export default CreateKelas;
