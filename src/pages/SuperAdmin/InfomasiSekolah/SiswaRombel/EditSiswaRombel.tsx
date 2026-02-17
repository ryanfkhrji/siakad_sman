import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePenLine } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Textarea } from "@/components/ui/textarea";
import type { SiswaRombelEditFormData, StatusAkhir } from "@/types/siswaRombel";
import { STATUS_AKHIR_LABEL } from "@/types/siswaRombel";

interface FormErrors {
  status_akhir: string[];
  catatan: string[];
}

// State yang dikirim dari DataSiswaRombel
interface EditRouterState {
  siswa_rombel_id: number;
  nama_siswa: string;
  nama_rombel: string;
  kelas: string;
  jurusan: string | null;
  tahun_akademik: string;
  status_tahun_akademik: "aktif" | "arsip";
  status_akhir: StatusAkhir | null;
  catatan: string | null;
}

const STATUS_AKHIR_OPTIONS: StatusAkhir[] = [
  "naik_kelas",
  "tinggal_kelas",
  "pindah",
  "pindahan",
  "berhenti",
  "diberhentikan",
  "lulus",
];

const EditSiswaRombel = () => {
  const { id } = useParams();           // siswa_rombel_id (untuk PUT)
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const routerState = location.state as EditRouterState | null;

  const [formData, setFormData] = useState<SiswaRombelEditFormData>({
    status_akhir: "",
    catatan: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    status_akhir: [],
    catatan: [],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!routerState) {
      Swal.fire({
        icon: "warning",
        title: "Akses tidak valid!",
        text: "Silakan klik tombol Edit dari halaman Data Siswa Rombel.",
      });
      navigate("/superadmin/informasi-sekolah/siswa-rombel");
      return;
    }

    if (routerState.status_tahun_akademik === "arsip") {
      Swal.fire({
        icon: "warning",
        title: "Tidak dapat mengedit!",
        text: "Hanya bisa diubah pada saat tahun akademik aktif.",
      });
      navigate("/superadmin/informasi-sekolah/siswa-rombel");
      return;
    }

    // Pre-fill form dengan data yang ada
    setFormData({
      status_akhir: routerState.status_akhir ?? "",
      catatan: routerState.catatan ?? "",
    });
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ status_akhir: [], catatan: [] });
    setLoading(true);

    try {
      // Body: { status_akhir: "tinggal_kelas", catatan: "..." }
      // status_akhir boleh null jika tidak dipilih
      const body: Record<string, any> = {
        catatan: formData.catatan || null,
      };
      if (formData.status_akhir) {
        body.status_akhir = formData.status_akhir;
      } else {
        body.status_akhir = null;
      }

      const res = await api.put(`/spa/siswa-rombel/${id}`, body);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data siswa rombel berhasil diperbarui.",
          timer: 1800,
          showConfirmButton: false,
        });
        navigate("/superadmin/informasi-sekolah/siswa-rombel");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      if (errorStatus === 422 && errorData?.errors) {
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

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300 ${
          isCollapsed ? "md:ml-16" : "md:ml-[300px]"
        }`}
      >
        <PageTitle title="Edit Siswa Rombel" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Siswa Rombel</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>

              {/* Card Data Saat Ini */}
              {routerState && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                  <h3 className="text-sm font-semibold text-indigo-900 mb-3">📋 Data Saat Ini</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-indigo-700 font-medium block">Siswa</span>
                      <span className="text-indigo-900 font-semibold">{routerState.nama_siswa}</span>
                    </div>
                    <div>
                      <span className="text-indigo-700 font-medium block">Rombel</span>
                      <span className="text-indigo-900 font-semibold">{routerState.nama_rombel}</span>
                    </div>
                    <div>
                      <span className="text-indigo-700 font-medium block">Kelas</span>
                      <span className="text-indigo-900">Kelas {routerState.kelas}</span>
                    </div>
                    <div>
                      <span className="text-indigo-700 font-medium block">Jurusan</span>
                      <span className="text-indigo-900">{routerState.jurusan || "-"}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-indigo-700 font-medium block">Tahun Akademik</span>
                      <span className="text-indigo-900">{routerState.tahun_akademik}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dropdown Status Akhir */}
              <div>
                <label className="block font-semibold text-foreground">
                  Status Akhir <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                </label>

                <Select
                  value={formData.status_akhir}
                  onValueChange={(v) => setFormData({ ...formData, status_akhir: v as StatusAkhir })}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih status akhir --" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status Akhir Siswa di Rombel Ini</SelectLabel>
                      {STATUS_AKHIR_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>
                          {STATUS_AKHIR_LABEL[status]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.status_akhir?.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">{errors.status_akhir[0]}</p>
                )}

                {/* Tombol clear status akhir */}
                {formData.status_akhir && (
                  <button
                    type="button"
                    className="text-xs text-gray-500 underline mt-1"
                    onClick={() => setFormData({ ...formData, status_akhir: "" })}
                  >
                    Hapus pilihan status akhir
                  </button>
                )}
              </div>

              {/* Textarea Catatan */}
              <div>
                <label className="block font-semibold text-foreground">
                  Catatan <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                </label>
                <Textarea
                  className="w-full mt-2"
                  placeholder="Tulis catatan untuk siswa di rombel ini..."
                  rows={3}
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                />
                {errors.catatan?.length > 0 && (
                  <p className="text-red-500 text-sm mt-1">{errors.catatan[0]}</p>
                )}
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hanya <strong>status akhir</strong> dan <strong>catatan</strong> yang dapat diubah</li>
                  <li>Siswa dan rombel tidak dapat diubah — jika salah, hapus dan tambah ulang</li>
                  <li>Status akhir dan catatan bersifat opsional</li>
                </ul>
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary flex items-center gap-2"
                >
                  <FilePenLine size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>

                <Link to="/superadmin/informasi-sekolah/siswa-rombel">
                  <Button
                    type="button"
                    className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90"
                  >
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

export default EditSiswaRombel;