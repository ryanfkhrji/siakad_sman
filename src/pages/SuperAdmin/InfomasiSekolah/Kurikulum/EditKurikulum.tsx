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
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormErrors {
  nama_kurikulum: string[];
  kode_kurikulum: string[];
  tipe: string[];
  tahun_mulai: string[];
  tahun_selesai: string[];
  deskripsi: string[];
  status: string[];
}

const EditKurikulum = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isArsip, setIsArsip] = useState(false);

  const [formData, setFormData] = useState({
    nama_kurikulum: "",
    kode_kurikulum: "",
    tipe: "",
    tahun_mulai: "",
    tahun_selesai: "",
    deskripsi: "",
    status: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    nama_kurikulum: [],
    kode_kurikulum: [],
    tipe: [],
    tahun_mulai: [],
    tahun_selesai: [],
    deskripsi: [],
    status: [],
  });

  // Fetch existing data
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get(`/spa/kurikulum/${id}`);
        if (res.data.status === "success") {
          const d = res.data.data;
          setFormData({
            nama_kurikulum: d.nama_kurikulum ?? "",
            kode_kurikulum: d.kode_kurikulum ?? "",
            tipe: d.tipe ?? "",
            tahun_mulai: d.tahun_mulai ? String(d.tahun_mulai) : "",
            tahun_selesai: d.tahun_selesai ? String(d.tahun_selesai) : "",
            deskripsi: d.deskripsi ?? "",
            status: d.status ?? "",
          });
          // Tandai jika sudah arsip — status tidak bisa dikembalikan ke aktif
          setIsArsip(d.status === "arsip");
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: "Coba ulangi kembali nanti.",
        });
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      nama_kurikulum: [],
      kode_kurikulum: [],
      tipe: [],
      tahun_mulai: [],
      tahun_selesai: [],
      deskripsi: [],
      status: [],
    });

    setSaving(true);

    try {
      const payload = {
        nama_kurikulum: formData.nama_kurikulum,
        kode_kurikulum: formData.kode_kurikulum,
        tipe: formData.tipe,
        tahun_mulai: formData.tahun_mulai ? Number(formData.tahun_mulai) : null,
        tahun_selesai: formData.tahun_selesai ? Number(formData.tahun_selesai) : null,
        deskripsi: formData.deskripsi || null,
        status: formData.status,
      };

      const res = await api.put(`/spa/kurikulum/${id}`, payload);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kurikulum berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-sekolah/kurikulum");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setSaving(false);
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan!",
        text: error.response?.data?.message || "Periksa koneksi kamu.",
      });
    }

    setSaving(false);
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Edit Kurikulum" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Kurikulum</h1>

          <div className="bg-white rounded shadow p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat data...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Nama Kurikulum */}
                <div className="mb-6">
                  <label className="block font-semibold">
                    Nama Kurikulum <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.nama_kurikulum} onChange={(e) => setFormData({ ...formData, nama_kurikulum: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.nama_kurikulum[0] && <p className="text-red-500 text-sm mt-1">{errors.nama_kurikulum[0]}</p>}
                </div>

                {/* Kode Kurikulum */}
                <div className="mb-6">
                  <label className="block font-semibold">
                    Kode Kurikulum <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={formData.kode_kurikulum} onChange={(e) => setFormData({ ...formData, kode_kurikulum: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.kode_kurikulum[0] && <p className="text-red-500 text-sm mt-1">{errors.kode_kurikulum[0]}</p>}
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
                  {errors.tipe[0] && <p className="text-red-500 text-sm mt-1">{errors.tipe[0]}</p>}
                </div>

                {/* Tahun Mulai & Selesai */}
                <div className="mb-6 flex gap-4">
                  <div className="flex-1">
                    <label className="block font-semibold">Tahun Mulai</label>
                    <input type="number" placeholder="cth: 2022" value={formData.tahun_mulai} onChange={(e) => setFormData({ ...formData, tahun_mulai: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                    {errors.tahun_mulai[0] && <p className="text-red-500 text-sm mt-1">{errors.tahun_mulai[0]}</p>}
                  </div>
                  <div className="flex-1">
                    <label className="block font-semibold">Tahun Selesai</label>
                    <input type="number" placeholder="cth: 2029" value={formData.tahun_selesai} onChange={(e) => setFormData({ ...formData, tahun_selesai: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                    {errors.tahun_selesai[0] && <p className="text-red-500 text-sm mt-1">{errors.tahun_selesai[0]}</p>}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <label className="block font-semibold">Status</label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih status --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Status</SelectLabel>
                        {/* Jika sudah arsip, opsi aktif di-disable sesuai business rule backend */}
                        <SelectItem value="aktif" disabled={isArsip}>
                          Aktif {isArsip && "(tidak bisa dari arsip)"}
                        </SelectItem>
                        <SelectItem value="arsip">Arsip</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {isArsip && <p className="text-amber-500 text-xs mt-1">Status arsip tidak bisa dikembalikan ke aktif.</p>}
                  {errors.status[0] && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
                </div>

                {/* Deskripsi */}
                <div className="mb-6">
                  <label className="block font-semibold">Deskripsi</label>
                  <textarea value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="border p-2 w-full mt-2 rounded h-32 resize-none" />
                  {errors.deskripsi[0] && <p className="text-red-500 text-sm mt-1">{errors.deskripsi[0]}</p>}
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-sekolah/kurikulum">
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

export default EditKurikulum;
