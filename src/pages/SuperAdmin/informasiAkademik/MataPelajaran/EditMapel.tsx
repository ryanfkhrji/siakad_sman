import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormErrors {
  nama_pelajaran: string[];
  kode_mapel_diknas: string[];
  kelompok: string[];
  status: string[];
}

const EditMataPelajaran = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama_pelajaran: "",
    kode_mapel_diknas: "",
    kelompok: "",
    status: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    nama_pelajaran: [],
    kode_mapel_diknas: [],
    kelompok: [],
    status: [],
  });

  // Fetch data existing
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/spa/mata-pelajaran/${id}`);
        if (res.data.status === "success") {
          const d = res.data.data;
          setFormData({
            nama_pelajaran: d.nama_pelajaran ?? "",
            kode_mapel_diknas: d.kode_mapel_diknas ?? "",
            kelompok: d.kelompok ?? "",
            status: d.status ?? "",
          });
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: "Terjadi kesalahan saat mengambil data dari server.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ nama_pelajaran: [], kode_mapel_diknas: [], kelompok: [], status: [] });
    setSaving(true);

    try {
      const res = await api.put(`/spa/mata-pelajaran/${id}`, formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data mata pelajaran berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-akademik/mata-pelajaran");
        return;
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        setSaving(false);
        return;
      }

      if (err.response?.status === 401) {
        Swal.fire({
          icon: "warning",
          title: "Sesi berakhir!",
          text: "Silakan login kembali.",
        });
        navigate("/login");
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Edit Mata Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Mata Pelajaran</h1>

          <div className="bg-white rounded shadow p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat data...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Nama Mata Pelajaran */}
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Nama Mata Pelajaran <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="cth: Bahasa Indonesia" value={formData.nama_pelajaran} onChange={(e) => setFormData({ ...formData, nama_pelajaran: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.nama_pelajaran[0] && <p className="text-red-500 text-sm mt-1">{errors.nama_pelajaran[0]}</p>}
                </div>

                {/* Kode Mapel Diknas */}
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Kode Mapel Diknas <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="cth: 156" value={formData.kode_mapel_diknas} onChange={(e) => setFormData({ ...formData, kode_mapel_diknas: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.kode_mapel_diknas[0] && <p className="text-red-500 text-sm mt-1">{errors.kode_mapel_diknas[0]}</p>}
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
                  {errors.kelompok[0] && <p className="text-red-500 text-sm mt-1">{errors.kelompok[0]}</p>}
                </div>

                {/* Status */}
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">Status</label>
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
                  {errors.status[0] && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/mata-pelajaran">
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

export default EditMataPelajaran;
