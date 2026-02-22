import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UpdateEkskulRequest } from "@/types/ekstrakurikuler";

interface FormErrors {
  nama_ekstrakurikuler?: string[];
  anggaran?: string[];
  status?: string[];
  status_aktif?: string[];
}

const EditEkskul = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    nama_ekstrakurikuler: "",
    anggaran: "",
    status: "" as "wajib" | "pilihan" | "jurusan" | "",
    status_aktif: "" as "aktif" | "arsip" | "",
  });

  // ── Fetch data ekskul ─────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // getDetail: response { data: [ EkskulDetail ] }
        const res = await api.get(`/spa/ekstrakurikuler/${id}`);
        const detail = res.data.data?.[0];
        if (detail) {
          setFormData({
            nama_ekstrakurikuler: detail.nama_ekskul ?? "",
            anggaran: detail.anggaran?.toString() ?? "",
            status: detail.status ?? "",
            status_aktif: detail.status_aktif ?? "",
          });
        }
      } catch {
        Swal.fire({ icon: "error", title: "Gagal!", text: "Tidak dapat memuat data ekstrakurikuler." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};
    if (!formData.nama_ekstrakurikuler.trim()) newErrors.nama_ekstrakurikuler = ["Nama ekstrakurikuler wajib diisi"];
    if (!formData.anggaran.trim()) newErrors.anggaran = ["Anggaran wajib diisi"];
    if (!formData.status) newErrors.status = ["Status wajib dipilih"];
    if (!formData.status_aktif) newErrors.status_aktif = ["Status aktif wajib dipilih"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({ icon: "warning", title: "Validasi Gagal!", text: "Mohon lengkapi semua field.", confirmButtonColor: "#EAB308" });
      return;
    }

    try {
      setIsSaving(true);
      const payload: UpdateEkskulRequest = {
        nama_ekstrakurikuler: formData.nama_ekstrakurikuler.trim(),
        anggaran: Number(formData.anggaran),
        status: formData.status as "wajib" | "pilihan" | "jurusan",
        status_aktif: formData.status_aktif as "aktif" | "arsip",
      };

      const res = await api.put(`/spa/ekstrakurikuler/${id}`, payload);
      if (res.data.status === "success") {
        Swal.fire({ icon: "success", title: "Berhasil!", text: res.data.message || "Ekstrakurikuler berhasil diperbarui.", showConfirmButton: false, timer: 1800 }).then(() => navigate("/superadmin/informasi-akademik/ekstrakurikuler"));
      } else if (res.data.errors) {
        setErrors(res.data.errors);
      }
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Koneksi gagal!", text: err.response?.data?.message || "Tidak dapat terhubung ke server." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
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
                  <label className="block font-semibold text-foreground mb-2">Nama Ekstrakurikuler</label>
                  <input type="text" value={formData.nama_ekstrakurikuler} onChange={(e) => setFormData({ ...formData, nama_ekstrakurikuler: e.target.value })} className="border p-2 w-full rounded" placeholder="Contoh: Pramuka" />
                  {errors.nama_ekstrakurikuler && <p className="text-red-500 text-sm mt-1">{errors.nama_ekstrakurikuler[0]}</p>}
                </div>

                {/* Anggaran */}
                <div>
                  <label className="block font-semibold text-foreground mb-2">Anggaran</label>
                  <input type="number" value={formData.anggaran} onChange={(e) => setFormData({ ...formData, anggaran: e.target.value })} className="border p-2 w-full rounded" placeholder="Contoh: 2000000" />
                  {errors.anggaran && <p className="text-red-500 text-sm mt-1">{errors.anggaran[0]}</p>}
                </div>

                {/* Status Ekskul */}
                <div>
                  <label className="block font-semibold text-foreground mb-2">Status Ekskul</label>
                  <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as "wajib" | "pilihan" | "jurusan" })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status Ekskul</SelectLabel>
                        <SelectItem value="wajib">Wajib</SelectItem>
                        <SelectItem value="pilihan">Pilihan</SelectItem>
                        <SelectItem value="jurusan">Jurusan</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
                </div>

                {/* Status Aktif */}
                <div>
                  <label className="block font-semibold text-foreground mb-2">Status Aktif</label>
                  <Select value={formData.status_aktif} onValueChange={(val) => setFormData({ ...formData, status_aktif: val as "aktif" | "arsip" })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Pilih Status Aktif" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Status Aktif</SelectLabel>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="arsip">Arsip</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.status_aktif && <p className="text-red-500 text-sm mt-1">{errors.status_aktif[0]}</p>}
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving} className="bg-primary flex items-center gap-2">
                    {isSaving ? (
                      <>
                        <Loader2Icon className="animate-spin" size={18} /> Menyimpan...
                      </>
                    ) : (
                      <>
                        <FilePlus size={18} /> Simpan Perubahan
                      </>
                    )}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/ekstrakurikuler">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon size={18} /> Batal
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
