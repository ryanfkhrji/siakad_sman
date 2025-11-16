import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Pegawai } from "@/types";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const EditStaff = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [staff, setStaff] = useState<Pegawai | null>(null);
  // const [kelasList, setKelasList] = useState<Kelas[]>([]);
  // const [selectedKelasId, setSelectedKelasId] = useState<string>("");
  // const [selectedJamMasuk, setSelectedJamMasuk] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");
  const [nama, setNama] = useState<string>("");
  const [nip, setNip] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  // 🔹 Ambil data guru & kelas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resStaff = await api.get<ApiResponse<Pegawai>>(`/spa/kepegawaian/${id}`);

        if (resStaff.data.status === "success") {
          const dataStaff = resStaff.data.data;
          setStaff(dataStaff);
          setNip(dataStaff.nip ?? "");
          setNama(dataStaff.nama);
          setEmail(dataStaff.email ?? "");
          setStatus(dataStaff.status ?? "");
          setKeterangan(dataStaff.keterangan ?? "");
          setRole(dataStaff.role);
          setPassword(dataStaff.id ? "Registered" : "Belum Registered");
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

  // 🔹 Submit update
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!staff) return;

    try {
      setIsLoading(true);
      const res = await api.put<ApiResponse<null>>(`/spa/kepegawaian/${staff.id}`, {
        nama,
        nip,
        email,
        status,
        keterangan,
        role,
        // password,
      });

      if (res.data.status === "success") {
        Swal.fire("Berhasil", res.data.message, "success").then(() => {
          navigate("/superadmin/informasi-sekolah/kepegawaian/staff");
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
      {/* === SIDEBAR === */}
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* === MAIN CONTENT === */}
      <main
        className={`
          w-full min-h-screen bg-background transition-all duration-300
          ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
        `}
      >
        <PageTitle title="Edit Staff" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Staff</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NIP */}
                <div>
                  <label className="block font-semibold text-foreground">NIP</label>
                  <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan NIP" required />
                </div>

                {/* Nama Staff */}
                <div>
                  <label className="block font-semibold text-foreground">Nama Staff</label>
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan nama lengkap" required />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-semibold text-foreground">Email</label>
                  <input type="text" value={email} onChange={(e) => setNama(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan nama lengkap" required />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-foreground">Status</label>
                  <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan status (contoh: aktif / nonaktif)" />
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block font-semibold text-foreground">Keterangan</label>
                  <input type="text" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan keterangan tambahan" />
                </div>

                {/* Role */}
                <div>
                  <label className="block font-semibold text-foreground">Role</label>
                  <input type="text" value={role} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100" disabled />
                </div>

                {/* Password */}
                <div>
                  <label className="block font-semibold text-foreground">Password</label>
                  <input type="text" value={password} readOnly className={`border p-2 w-full mt-2 rounded bg-gray-100 ${password ? "text-primary" : "text-red-500"}`} disabled />
                </div>

                {/* Tombol Aksi */}
                <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
                  <Button type="submit" className="bg-primary flex items-center gap-2" disabled={isLoading}>
                    <FilePlus size={18} />
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-sekolah/kepegawaian/guru">
                    <Button className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon />
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

export default EditStaff;
