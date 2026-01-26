import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Kepegawaian } from "@/types/kepegawaian";
import { CircleX, FilePlus, Loader2 } from "lucide-react";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const EditKepegawaian = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [kepegawaian, setKepegawaian] = useState<Kepegawaian | null>(null);
  const [nama, setNama] = useState<string>("");
  const [nip, setNip] = useState<string>("");
  const [nuptk, setNuptk] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Ambil data kepegawaian
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get<ApiResponse<Kepegawaian>>(`/spa/kepegawaian/${id}`);

        if (res.data.status === "success") {
          const data = res.data.data;
          setKepegawaian(data);
          setNama(data.nama);
          setNip(data.nip ?? "");
          setNuptk(data.nuptk ?? "");
          setEmail(data.email ?? "");
          setStatus(data.status ?? "");
          setKeterangan(data.keterangan ?? "");
          setRole(data.role);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        const err = error as { response?: { data?: { message?: string } } };
        Swal.fire("Error", err.response?.data?.message || "Gagal memuat data", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Submit update
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!kepegawaian) return;

    try {
      setIsLoading(true);
      const res = await api.put<ApiResponse<null>>(`/spa/kepegawaian/${kepegawaian.id}`, {
        nama,
        nip,
        nuptk,
        email,
        status,
        keterangan,
        role,
      });

      if (res.data.status === "success") {
        Swal.fire("Berhasil", res.data.message, "success").then(() => {
          navigate("/superadmin/informasi-sekolah/kepegawaian");
        });
      } else {
        Swal.fire("Gagal", res.data.message, "error");
      }
    } catch (error) {
      const err = error as { response?: { data?: { message?: string } } };
      Swal.fire("Error", err.response?.data?.message || "Terjadi kesalahan", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
          w-full min-h-screen bg-background transition-all duration-300
          ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}
        `}
      >
        <PageTitle title="Edit Kepegawaian" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Kepegawaian</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2 className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIP */}
                <div>
                  <label className="block font-semibold text-foreground">
                    NIP
                    <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan NIP" />
                  </label>
                </div>

                {/* NUPTK */}
                <div>
                  <label className="block font-semibold text-foreground">
                    NUPTK
                    <input type="text" value={nuptk} onChange={(e) => setNuptk(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan NUPTK" />
                  </label>
                </div>

                {/* Nama */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Nama Lengkap
                    <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan nama lengkap" required />
                  </label>
                </div>

                {/* Email */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Email
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan email" required />
                  </label>
                </div>

                {/* Role */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Role
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="border p-2 w-full mt-2 rounded" required>
                      <option value="">Pilih Role</option>
                      <option value="super_admin">Super Admin</option>
                      <option value="kepsek">Kepala Sekolah</option>
                      <option value="guru">Guru</option>
                      <option value="tu">Tata Usaha</option>
                      <option value="staff">Staff</option>
                    </select>
                  </label>
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Status
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 w-full mt-2 rounded" required>
                      <option value="">Pilih Status</option>
                      <option value="aktif">Aktif</option>
                      <option value="tidak aktif">Tidak Aktif</option>
                    </select>
                  </label>
                </div>

                {/* Keterangan */}
                <div className="md:col-span-2">
                  <label className="block font-semibold text-foreground">
                    Keterangan
                    <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan keterangan tambahan" />
                  </label>
                </div>

                {/* Tombol Aksi */}
                <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
                  <Button type="submit" className="bg-primary flex items-center gap-2" disabled={isLoading}>
                    <FilePlus size={18} />
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-sekolah/kepegawaian">
                    <Button className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleX size={18} />
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

export default EditKepegawaian;
