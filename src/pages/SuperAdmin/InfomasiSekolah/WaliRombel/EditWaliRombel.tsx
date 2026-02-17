import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePenLine, Loader2Icon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { DataSelectWaliRombel } from "@/types/waliRombel";

interface FormErrors {
  wali_rombel_id: string[];
  data: string[];
  arsip: string[];
}

// State yang dikirim dari DataWaliRombel saat navigate ke edit
interface EditRouterState {
  nama_guru: string;
  guru_id: number;
  nama_rombel: string;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
}

const EditWaliRombel = () => {
  const { id } = useParams(); // wali_rombel_id (untuk PUT)
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Ambil state yang dikirim dari DataWaliRombel
  const routerState = location.state as EditRouterState | null;

  const [formData, setFormData] = useState({ wali_rombel_id: "" });

  const [errors, setErrors] = useState<FormErrors>({
    wali_rombel_id: [],
    data: [],
    arsip: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectWaliRombel | null>(null);

  useEffect(() => {
    // Jika tidak ada state (user akses URL langsung), redirect balik
    if (!routerState) {
      Swal.fire({
        icon: "warning",
        title: "Akses tidak valid!",
        text: "Silakan klik tombol Edit dari halaman Data Wali Rombel.",
      });
      navigate("/superadmin/informasi-sekolah/wali-rombel");
      return;
    }

    // Jika tahun akademik arsip, tidak bisa edit
    if (routerState.status_tahun_akademik === "arsip") {
      Swal.fire({
        icon: "warning",
        title: "Tidak dapat mengedit!",
        text: "Hanya bisa diubah pada saat tahun akademik aktif.",
      });
      navigate("/superadmin/informasi-sekolah/wali-rombel");
      return;
    }

    // Pre-fill form dengan guru saat ini
    setFormData({ wali_rombel_id: String(routerState.guru_id) });

    // Fetch data select guru
    const fetchSelect = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/wali-rombel");
        if (res.data.status === "success") {
          setSelectData(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat daftar guru.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };

    fetchSelect();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ wali_rombel_id: [], data: [], arsip: [] });
    setLoading(true);

    try {
      // Body: { wali_rombel_id: 10 }
      const res = await api.put(`/spa/wali-rombel/${id}`, {
        wali_rombel_id: Number(formData.wali_rombel_id),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data wali rombel berhasil diperbarui.",
          timer: 1800,
          showConfirmButton: false,
        });
        navigate("/superadmin/informasi-sekolah/wali-rombel");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      if (errorStatus === 422 && errorData?.errors) {
        // Tahun akademik arsip
        if (errorData.errors.arsip) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah!",
            text: Array.isArray(errorData.errors.arsip) ? errorData.errors.arsip[0] : errorData.errors.arsip,
          });
          setLoading(false);
          return;
        }

        // Guru sudah jadi wali lain / role bukan guru
        if (errorData.errors.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah!",
            text: Array.isArray(errorData.errors.data) ? errorData.errors.data[0] : errorData.errors.data,
          });
          setLoading(false);
          return;
        }

        // Validation error biasa
        setErrors({ ...errors, ...errorData.errors });
        setLoading(false);
        return;
      }

      if (errorStatus === 404) {
        Swal.fire({ icon: "error", title: "Data tidak ditemukan!" });
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: errorData?.message || "Tidak dapat terhubung ke server.",
      });
      setLoading(false);
    }
  };

  if (loadingSelect) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Edit Wali Rombel" />
          <div className="mx-auto p-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Wali Rombel" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Wali Rombel</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
              {/* Card Data Saat Ini */}
              {routerState && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                  <h3 className="text-sm font-semibold text-purple-900 mb-3">📋 Data Saat Ini</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-purple-700 font-medium block">Wali Kelas</span>
                      <span className="text-purple-900 font-semibold">{routerState.nama_guru}</span>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium block">Rombel</span>
                      <span className="text-purple-900 font-semibold">{routerState.nama_rombel}</span>
                    </div>
                    <div>
                      <span className="text-purple-700 font-medium block">Tahun Akademik</span>
                      <span className="text-purple-900">{routerState.tahun_akademik}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dropdown Guru Pengganti */}
              <div>
                <label className="block font-semibold text-foreground">
                  Ganti Guru (Wali Kelas) <span className="text-red-500">*</span>
                </label>

                <Select value={formData.wali_rombel_id} onValueChange={(v) => setFormData({ wali_rombel_id: v })}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih guru --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Guru Aktif</SelectLabel>
                      {selectData?.guru.map((guru) => (
                        <SelectItem key={guru.guru_id} value={String(guru.guru_id)}>
                          <div className="flex flex-col">
                            <span className="font-medium">{guru.nama_guru}</span>
                            <span className="text-xs">
                              NIP: {guru.nip || "-"} • NUPTK: {guru.nuptk || "-"}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.wali_rombel_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.wali_rombel_id[0]}</p>}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hanya guru (wali kelas) yang dapat diganti</li>
                  <li>Rombel dan tahun akademik tidak dapat diubah</li>
                  <li>Guru baru tidak boleh sudah menjadi wali rombel lain di tahun akademik yang sama</li>
                </ul>
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePenLine size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>

                <Link to="/superadmin/informasi-sekolah/wali-rombel">
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

export default EditWaliRombel;
