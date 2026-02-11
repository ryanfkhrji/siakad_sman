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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormErrors {
  nama_kurikulum: string[];
  kode_kurikulum: string[];
  tipe: string[];
  tahun_mulai: string[];
  tahun_selesai: string[];
  deskripsi: string[];
}

const CreateKurikulum = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama_kurikulum: "",
    kode_kurikulum: "",
    tipe: "",
    tahun_mulai: "",
    tahun_selesai: "",
    deskripsi: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    nama_kurikulum: [],
    kode_kurikulum: [],
    tipe: [],
    tahun_mulai: [],
    tahun_selesai: [],
    deskripsi: [],
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      nama_kurikulum: [],
      kode_kurikulum: [],
      tipe: [],
      tahun_mulai: [],
      tahun_selesai: [],
      deskripsi: [],
    });

    setLoading(true);

    try {
      const payload = {
        nama_kurikulum: formData.nama_kurikulum,
        kode_kurikulum: formData.kode_kurikulum,
        tipe: formData.tipe,
        tahun_mulai: formData.tahun_mulai ? Number(formData.tahun_mulai) : null,
        tahun_selesai: formData.tahun_selesai ? Number(formData.tahun_selesai) : null,
        deskripsi: formData.deskripsi || null,
      };

      const res = await api.post("/spa/kurikulum", payload);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kurikulum berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-sekolah/kurikulum");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setLoading(false);
        return;
      }

      // Cek error bisnis (kurikulum aktif sudah ada)
      if (error.response?.data?.status === "error") {
        Swal.fire({
          icon: "error",
          title: "Tidak bisa menyimpan!",
          text: error.response.data.errors?.data || error.response.data.message,
        });
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: "Tidak dapat terhubung ke server.",
      });
    }

    setLoading(false);
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Tambah Kurikulum" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Kurikulum</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Nama Kurikulum */}
              <div className="mb-6">
                <label className="block font-semibold">
                  Nama Kurikulum <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="cth: Kurikulum Merdeka" value={formData.nama_kurikulum} onChange={(e) => setFormData({ ...formData, nama_kurikulum: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.nama_kurikulum?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nama_kurikulum[0]}</p>}
              </div>

              {/* Kode Kurikulum */}
              <div className="mb-6">
                <label className="block font-semibold">
                  Kode Kurikulum <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="cth: 2027" value={formData.kode_kurikulum} onChange={(e) => setFormData({ ...formData, kode_kurikulum: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.kode_kurikulum?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kode_kurikulum[0]}</p>}
              </div>

              {/* Tipe */}
              <div className="mb-6">
                <label className="block font-semibold">
                  Tipe <span className="text-red-500">*</span>
                </label>
                <Select value={formData.tipe} onValueChange={(value) => setFormData({ ...formData, tipe: value })}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih tipe --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Tipe</SelectLabel>
                      <SelectItem value="KTSP">KTSP</SelectItem>
                      <SelectItem value="K13">Kurikulum 2013 (K13)</SelectItem>
                      <SelectItem value="MERDEKA">Kurikulum Merdeka</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.tipe?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tipe[0]}</p>}
              </div>

              {/* Tahun Mulai & Selesai */}
              <div className="mb-6 flex gap-4">
                <div className="flex-1">
                  <label className="block font-semibold">Tahun Mulai</label>
                  <input type="number" placeholder="cth: 2022" value={formData.tahun_mulai} onChange={(e) => setFormData({ ...formData, tahun_mulai: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.tahun_mulai?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tahun_mulai[0]}</p>}
                </div>
                <div className="flex-1">
                  <label className="block font-semibold">Tahun Selesai</label>
                  <input type="number" placeholder="cth: 2029" value={formData.tahun_selesai} onChange={(e) => setFormData({ ...formData, tahun_selesai: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.tahun_selesai?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tahun_selesai[0]}</p>}
                </div>
              </div>

              {/* Deskripsi */}
              <div className="mb-6">
                <label className="block font-semibold">Deskripsi</label>
                <textarea placeholder="Deskripsi kurikulum..." value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="border p-2 w-full mt-2 rounded h-32 resize-none" />
                {errors.deskripsi?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.deskripsi[0]}</p>}
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Link to="/superadmin/informasi-sekolah/kurikulum">
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

export default CreateKurikulum;
