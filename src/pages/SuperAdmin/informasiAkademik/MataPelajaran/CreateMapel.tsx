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
  nama_pelajaran: string[];
  kode_mapel_diknas: string[];
  kelompok: string[];
}

const CreateMataPelajaran = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nama_pelajaran: "",
    kode_mapel_diknas: "",
    kelompok: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    nama_pelajaran: [],
    kode_mapel_diknas: [],
    kelompok: [],
  });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ nama_pelajaran: [], kode_mapel_diknas: [], kelompok: [] });
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
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setLoading(false);
        return;
      }

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
                <label className="block font-semibold text-foreground">
                  Nama Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="cth: Bahasa Indonesia" value={formData.nama_pelajaran} onChange={(e) => setFormData({ ...formData, nama_pelajaran: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.nama_pelajaran?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nama_pelajaran[0]}</p>}
              </div>

              {/* Kode Mapel Diknas */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Kode Mapel Diknas <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="cth: 156" value={formData.kode_mapel_diknas} onChange={(e) => setFormData({ ...formData, kode_mapel_diknas: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.kode_mapel_diknas?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kode_mapel_diknas[0]}</p>}
              </div>

              {/* Kelompok */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Kelompok <span className="text-red-500">*</span>
                </label>
                <Select value={formData.kelompok} onValueChange={(value) => setFormData({ ...formData, kelompok: value })}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih kelompok --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Kelompok</SelectLabel>
                      <SelectItem value="umum">Umum</SelectItem>
                      <SelectItem value="sains">Sains</SelectItem>
                      <SelectItem value="ipa">IPA</SelectItem>
                      <SelectItem value="sosial">Sosial</SelectItem>
                      <SelectItem value="ips">IPS</SelectItem>
                      <SelectItem value="bahasa">Bahasa</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.kelompok?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kelompok[0]}</p>}
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Link to="/superadmin/informasi-akademik/mata-pelajaran">
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
