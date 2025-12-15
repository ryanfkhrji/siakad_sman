import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormErrors {
  sikap?: string[];
}

interface SiswaEkskulData {
  ekskul_siswa_pivot_id: number;
  nama_siswa: string;
  nama_ekskul: string;
  sikap: string | null;
}

const EditEkskulSiswaSikap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 Ambil data siswa dari navigation state
  const siswaData = location.state?.siswaData as SiswaEkskulData | null;

  const [formData, setFormData] = useState({
    sikap: siswaData?.sikap || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // 🔥 Validasi jika data tidak ada (user akses langsung via URL)
  useEffect(() => {
    if (!siswaData || !id) {
      Swal.fire({
        icon: "error",
        title: "Data Tidak Ditemukan",
        text: "Silakan kembali ke halaman daftar siswa",
      }).then(() => {
        navigate("/superadmin/informasi-akademik/ekstrakurikuler");
      });
    }
  }, [siswaData, id, navigate]);

  // 🔥 Handle submit untuk update sikap
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      Swal.fire("Error", "ID tidak valid", "error");
      return;
    }

    if (!formData.sikap) {
      Swal.fire("Error", "Silakan pilih sikap terlebih dahulu", "error");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // 🔥 Endpoint PUT untuk update sikap
      const res = await api.put(`/spa/siswa/ekskul/${id}`, {
        sikap: formData.sikap,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Sikap siswa berhasil diperbarui",
          timer: 2000,
          showConfirmButton: false,
        });

        // Kembali ke halaman sebelumnya
        navigate(-1);
      } else {
        Swal.fire("Gagal!", res.data.message || "Gagal memperbarui data", "error");
      }
    } catch (err: any) {
      console.error("Error updating data:", err);

      // Handle validation errors dari backend
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        Swal.fire("Error", "Terjadi kesalahan saat memperbarui data", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Jika data tidak ada, tampilkan loading (akan redirect oleh useEffect)
  if (!siswaData) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <div className="flex flex-col items-center justify-center h-screen text-gray-600">
            <Loader2Icon className="animate-spin mb-2" size={32} />
            <p className="text-lg font-medium">Memuat data...</p>
          </div>
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Sikap Ekstrakurikuler Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Sikap Ekstrakurikuler Siswa</h1>

          <div className="bg-white rounded shadow p-5">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-lg w-full">
              {/* Nama Ekskul (Read-only) */}
              <div>
                <label htmlFor="nama_ekskul" className="block font-semibold text-foreground mb-2">
                  Ekstrakurikuler
                </label>
                <input id="nama_ekskul" type="text" value={siswaData.nama_ekskul || ""} readOnly className="bg-gray-100 p-2 w-full rounded border border-gray-300" disabled />
              </div>

              {/* Nama Siswa (Read-only) */}
              <div>
                <label htmlFor="nama_siswa" className="block font-semibold text-foreground mb-2">
                  Nama Siswa
                </label>
                <input id="nama_siswa" type="text" value={siswaData.nama_siswa || ""} readOnly className="bg-gray-100 p-2 w-full rounded border border-gray-300" disabled />
              </div>

              {/* Sikap */}
              <div>
                <label htmlFor="sikap" className="block font-semibold text-foreground mb-2">
                  Pilih Sikap <span className="text-red-500">*</span>
                </label>
                <Select value={formData.sikap} onValueChange={(value) => setFormData({ ...formData, sikap: value })} disabled={isSubmitting}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih Sikap" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Sikap</SelectLabel>
                      <SelectItem value="Sangat Baik">Sangat Baik</SelectItem>
                      <SelectItem value="Baik">Baik</SelectItem>
                      <SelectItem value="Cukup">Cukup</SelectItem>
                      <SelectItem value="Kurang">Kurang</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.sikap && <p className="text-red-500 text-sm mt-1">{errors.sikap[0]}</p>}
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting} className="bg-primary flex items-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="animate-spin" size={18} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FilePlus size={18} />
                      Simpan
                    </>
                  )}
                </Button>
                <Button type="button" onClick={() => navigate(-1)} className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90" disabled={isSubmitting}>
                  <CircleXIcon size={18} />
                  Batal
                </Button>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditEkskulSiswaSikap;
