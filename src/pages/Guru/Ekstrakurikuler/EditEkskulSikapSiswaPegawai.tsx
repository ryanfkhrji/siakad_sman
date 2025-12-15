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
  ekskul_siswa_pivot_id?: number | null;
  siswa_id: number;
  ekstrakurikuler_id: string;
  nama_siswa: string;
  nama_ekskul: string;
  sikap: string | null;
}

const EditEkskulSikapSiswaPegawai = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id: siswa_id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pivotId, setPivotId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data siswa dari navigation state
  const siswaData = location.state?.siswaData as SiswaEkskulData | null;

  const [formData, setFormData] = useState({
    sikap: siswaData?.sikap || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch pivot ID berdasarkan siswa_id dan ekstrakurikuler_id
  useEffect(() => {
    const fetchPivotId = async () => {
      if (!siswaData || !siswa_id) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: "Silakan kembali ke halaman daftar siswa",
        }).then(() => {
          navigate("/guru/ekstrakurikuler/data-eksstrakurikuler");
        });
        return;
      }

      // Jika pivot_id sudah ada dari state, gunakan langsung
      if (siswaData.ekskul_siswa_pivot_id) {
        setPivotId(siswaData.ekskul_siswa_pivot_id);
        setIsLoading(false);
        return;
      }

      // Jika pivot_id tidak ada, fetch dari API
      try {
        setIsLoading(true);

        const res = await api.get(`/pegawai/ekskul/show/diri`);

        if (res.data.status === "success") {
          const peserta = res.data.data.peserta.find((p: any) => p.siswa_id === Number(siswa_id));

          if (peserta?.id_pivot) {
            setPivotId(peserta.id_pivot);
          } else {
            Swal.fire({
              icon: "warning",
              title: "Data Tidak Lengkap",
              text: "Siswa tidak ditemukan. Silakan hubungi administrator.",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching pivot ID:", error);
        Swal.fire("Error", "Gagal mengambil data. Silakan coba lagi.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPivotId();
  }, [siswaData, siswa_id, navigate]);

  // Handle submit untuk update sikap
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!siswa_id || !siswaData) {
      Swal.fire("Error", "Data tidak valid", "error");
      return;
    }

    if (!formData.sikap) {
      Swal.fire("Error", "Silakan pilih sikap terlebih dahulu", "error");
      return;
    }

    if (!pivotId) {
      Swal.fire("Error", "Siswa tidak ditemukan. Hubungi administrator.", "error");
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const res = await api.put(`/pegawai/siswa/ekskul/${pivotId}`, {
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
        navigate(-1);
      } else {
        Swal.fire("Gagal!", res.data.message || "Gagal memperbarui data", "error");
      }
    } catch (err: any) {
      console.error("Error updating data:", err);
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        Swal.fire("Error", "Terjadi kesalahan saat memperbarui data", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Loading state
  if (isLoading || !siswaData) {
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

              {/* Info Pivot ID (Optional - for debugging) */}
              {!pivotId && <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">⚠️ Pivot ID tidak ditemukan. Pastikan backend mengirim id_pivot.</div>}

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting || !pivotId} className="bg-primary flex items-center gap-2">
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

export default EditEkskulSikapSiswaPegawai;
