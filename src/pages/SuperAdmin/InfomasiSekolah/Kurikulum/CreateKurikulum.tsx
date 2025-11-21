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
  tahun_berlaku: string[];
  status: string[];
  deskripsi: string[];
}

const CreateKurikulum = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    nama_kurikulum: "",
    tahun_berlaku: "",
    status: "",
    deskripsi: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    nama_kurikulum: [],
    tahun_berlaku: [],
    status: [],
    deskripsi: [],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      nama_kurikulum: [],
      tahun_berlaku: [],
      status: [],
      deskripsi: [],
    });

    setLoading(true);

    try {
      const res = await api.post("/spa/kurikulum", formData);

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
        <PageTitle title="Tambah Kurikulum" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Kurikulum</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Nama Kurikulum */}
              <div className="mb-6">
                <label className="block font-semibold">Nama Kurikulum</label>
                <input type="text" placeholder="cth: Kurikulum Merdeka" value={formData.nama_kurikulum} onChange={(e) => setFormData({ ...formData, nama_kurikulum: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.nama_kurikulum?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nama_kurikulum[0]}</p>}
              </div>

              {/* Tahun Berlaku */}
              <div className="mb-6">
                <label className="block font-semibold">Tahun Berlaku</label>
                <input type="text" placeholder="cth: 2023" value={formData.tahun_berlaku} onChange={(e) => setFormData({ ...formData, tahun_berlaku: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.tahun_berlaku?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tahun_berlaku[0]}</p>}
              </div>

              {/* Status */}
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
                      <SelectItem value="tidak aktif">Tidak Aktif</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.status?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
              </div>

              {/* Deskripsi */}
              <div className="mb-6">
                <label className="block font-semibold">Deskripsi</label>
                <textarea placeholder="Deskripsi kurikulum..." value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="border p-2 w-full mt-2 rounded h-32 resize-none"></textarea>
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
