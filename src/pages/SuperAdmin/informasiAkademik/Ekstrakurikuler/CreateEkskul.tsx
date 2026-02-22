import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CreateEkskulRequest } from "@/types/ekstrakurikuler";

interface FormErrors {
  nama_ekstrakurikuler?: string[];
  anggaran?: string[];
  status?: string[];
}

const CreateEkskul = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState({
    nama_ekstrakurikuler: "",
    anggaran: "",
    status: "" as "wajib" | "pilihan" | "jurusan" | "",
  });

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validasi client-side
    const newErrors: FormErrors = {};
    if (!formData.nama_ekstrakurikuler.trim()) newErrors.nama_ekstrakurikuler = ["Nama ekstrakurikuler wajib diisi"];
    if (!formData.anggaran.trim()) newErrors.anggaran = ["Anggaran wajib diisi"];
    if (!formData.status) newErrors.status = ["Status wajib dipilih"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({ icon: "warning", title: "Validasi Gagal!", text: "Mohon lengkapi semua field.", confirmButtonColor: "#EAB308" });
      return;
    }

    try {
      setIsSaving(true);
      const payload: CreateEkskulRequest = {
        nama_ekstrakurikuler: formData.nama_ekstrakurikuler.trim(),
        anggaran: Number(formData.anggaran),
        status: formData.status as "wajib" | "pilihan" | "jurusan",
      };

      const res = await api.post("/spa/ekstrakurikuler", payload);
      if (res.data.status === "success") {
        Swal.fire({ icon: "success", title: "Berhasil!", text: res.data.message || "Ekstrakurikuler berhasil dibuat.", showConfirmButton: false, timer: 1800 });
        navigate("/superadmin/informasi-akademik/ekstrakurikuler");
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: res.data.message || "Terjadi kesalahan saat menyimpan data." });
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      Swal.fire({ icon: "error", title: "Gagal menyimpan!", text: err.response?.data?.message || "Terjadi kesalahan koneksi ke server." });
    } finally {
      setIsSaving(false);
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
                <label className="block font-semibold text-foreground mb-2">Nama Ekstrakurikuler</label>
                <input type="text" placeholder="Contoh: Pramuka, Paskibra" value={formData.nama_ekstrakurikuler} onChange={(e) => setFormData({ ...formData, nama_ekstrakurikuler: e.target.value })} className="border p-2 w-full rounded" />
                {errors.nama_ekstrakurikuler && <p className="text-red-500 text-sm mt-1">{errors.nama_ekstrakurikuler[0]}</p>}
              </div>

              {/* Anggaran */}
              <div>
                <label className="block font-semibold text-foreground mb-2">Anggaran</label>
                <input type="number" placeholder="Contoh: 2000000" value={formData.anggaran} onChange={(e) => setFormData({ ...formData, anggaran: e.target.value })} className="border p-2 w-full rounded" />
                {errors.anggaran && <p className="text-red-500 text-sm mt-1">{errors.anggaran[0]}</p>}
              </div>

              {/* Status */}
              <div>
                <label className="block font-semibold text-foreground mb-2">Status Ekskul</label>
                <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val as "wajib" | "pilihan" | "jurusan" })} disabled={isSaving}>
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

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving} className="bg-primary flex items-center gap-2">
                  {isSaving ? (
                    <>
                      <Loader2Icon className="animate-spin" size={18} /> Menyimpan...
                    </>
                  ) : (
                    <>
                      <FilePlus size={18} /> Simpan
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
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateEkskul;
