import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Siswa, SiswaDetailResponse } from "@/types/siswa";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";

interface ApiResponse<T = any> {
  status: string;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}

const EditSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [siswa, setSiswa] = useState<Siswa | null>(null);

  // Form fields
  const [nisn, setNisn] = useState("");
  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<SiswaDetailResponse["data"]>>(`/spa/siswa/${id}`);

        if (res.data.status === "success") {
          const data = res.data.data;

          // Set form values dari response backend
          setNisn(data.nisn);
          setNis(data.nis);
          setNama(data.nama);
          setEmail(data.email);
          setStatus(data.status);

          // Set siswa object untuk referensi
          setSiswa({
            id: data.siswa_id,
            nisn: data.nisn,
            nis: data.nis,
            nama: data.nama,
            email: data.email,
            role: "siswa",
            status: data.status,
            nama_jurusan: data.jurusan_siswa,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        const err = error as { response?: { data?: { message?: string } } };
        Swal.fire({
          title: "Error",
          text: err.response?.data?.message || "Gagal memuat data",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!siswa) return;

    try {
      setIsLoading(true);

      const payload = {
        nisn,
        nis,
        nama,
        email,
        status,
      };

      const res = await api.put<ApiResponse>(`/spa/siswa/${siswa.id}`, payload);

      if (res.data.status === "success") {
        await Swal.fire({
          title: "Berhasil",
          text: "Data siswa berhasil diperbarui",
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });
        navigate("/superadmin/informasi-akademik/siswa");
      } else {
        Swal.fire({
          title: "Gagal",
          text: res.data.message,
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      }
    } catch (error) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            errors?: {
              nisn?: string[];
              nis?: string[];
              email?: string[];
              [key: string]: any;
            };
          };
          status?: number;
        };
      };

      let errorMessage = err.response?.data?.message || "Terjadi kesalahan";
      const apiErrors = err.response?.data?.errors;
      const apiStatus = err.response?.status;

      if (apiStatus === 422 && apiErrors) {
        if (apiErrors.nisn && apiErrors.nisn.length > 0) {
          errorMessage = apiErrors.nisn[0];
        } else if (apiErrors.nis && apiErrors.nis.length > 0) {
          errorMessage = apiErrors.nis[0];
        } else if (apiErrors.email && apiErrors.email.length > 0) {
          errorMessage = apiErrors.email[0];
        } else if (errorMessage === "Validasi gagal" || !errorMessage) {
          errorMessage = "Validasi gagal. Mohon periksa kembali semua input formulir.";
        }
      }

      Swal.fire({
        title: "Error",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#DC2626",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Siswa</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NISN */}
                <div>
                  <label className="block font-semibold text-foreground">
                    NISN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nisn}
                    onChange={(e) => setNisn(e.target.value)}
                    className="border p-2 w-full mt-2 rounded"
                    required
                    maxLength={50}
                    inputMode="numeric"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                {/* NIS */}
                <div>
                  <label className="block font-semibold text-foreground">
                    NIS <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nis}
                    onChange={(e) => setNis(e.target.value)}
                    className="border p-2 w-full mt-2 rounded"
                    required
                    maxLength={50}
                    inputMode="numeric"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>

                {/* Nama */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="border p-2 w-full mt-2 rounded"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border p-2 w-full mt-2 rounded"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border p-2 w-full mt-2 rounded bg-white"
                    required
                  >
                    <option value="">Pilih Status</option>
                    <option value="aktif">Aktif</option>
                    <option value="tidak aktif">Tidak Aktif</option>
                  </select>
                </div>

                {/* Jurusan (readonly) */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Jurusan
                  </label>
                  <input
                    type="text"
                    value={siswa?.nama_jurusan || "-"}
                    readOnly
                    className="border p-2 w-full mt-2 rounded bg-gray-100 text-gray-700"
                    disabled
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
                  <Button
                    type="submit"
                    className="bg-primary flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <FilePlus size={18} />
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/siswa">
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
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditSiswa;