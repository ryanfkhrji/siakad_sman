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
  tahun_akademik: string[];
  semester: string[];
  tanggal_mulai: string[];
  tanggal_selesai: string[];
  status: string[];
  keterangan: string[];
}

const CreateTahunAkademik = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    tahun_akademik: "",
    semester: "Ganjil",
    tanggal_mulai: "",
    tanggal_selesai: "",
    status: "aktif",
    keterangan: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    tahun_akademik: [],
    semester: [],
    tanggal_mulai: [],
    tanggal_selesai: [],
    status: [],
    keterangan: [],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      tahun_akademik: [],
      semester: [],
      tanggal_mulai: [],
      tanggal_selesai: [],
      status: [],
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
      // HANDLE VALIDATION ERROR 422
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
        <PageTitle title="Tambah Tahun Akademik" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Tahun Akademik</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block font-semibold">Tahun Akademik</label>
                <input type="text" placeholder="cth: 2025/2026" value={formData.tahun_akademik} onChange={(e) => setFormData({ ...formData, tahun_akademik: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.tahun_akademik?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tahun_akademik[0]}</p>}
              </div>

              <div className="space-y-2">
                <label className="block font-semibold text-foreground">Semester</label>
                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Semester" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ganjil">Ganjil</SelectItem>
                    <SelectItem value="Genap">Genap</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mb-6">
                <label className="block font-semibold">Tanggal Mulai</label>
                <input type="date" value={formData.tanggal_mulai} onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.tanggal_mulai?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tanggal_mulai[0]}</p>}
              </div>

              <div className="mb-6">
                <label className="block font-semibold">Tanggal Selesai</label>
                <input type="date" value={formData.tanggal_selesai} onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.tanggal_selesai?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tanggal_selesai[0]}</p>}
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-foreground">Status</label>

                <Select onValueChange={(value) => setFormData({ ...formData, status: value })} value={formData.status}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih status --" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Status</SelectLabel>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="nonaktif">Non Aktif</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.status?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
              </div>

              <div className="mb-6">
                <label className="block font-semibold">Keterangan</label>
                <textarea placeholder="Keterangan..." value={formData.keterangan} onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} className="border p-2 w-full mt-2 rounded h-32 resize-none"></textarea>
                {errors.keterangan?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.keterangan[0]}</p>}
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

export default CreateTahunAkademik;
