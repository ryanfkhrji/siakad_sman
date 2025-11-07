import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Pegawai, Kelas } from "@/types";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const EditGuru = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [guru, setGuru] = useState<Pegawai | null>(null);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [selectedKelasId, setSelectedKelasId] = useState<string>("");
  const [selectedJamMasuk, setSelectedJamMasuk] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [keterangan, setKeterangan] = useState<string>("");
  const [nama, setNama] = useState<string>("");
  const [nip, setNip] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 🔹 Ambil data guru & kelas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resGuru, resKelas] = await Promise.all([api.get<ApiResponse<Pegawai>>(`/kepegawaian/${id}`), api.get<ApiResponse<Kelas[]>>(`/kelas`)]);

        if (resGuru.data.status === "success") {
          const dataGuru = resGuru.data.data;
          setGuru(dataGuru);
          setNama(dataGuru.nama);
          setNip(dataGuru.nip ?? "");
          setSelectedKelasId(dataGuru.kelas?.id?.toString() ?? "");
          const jamFormatted = dataGuru.kelas?.jam_masuk?.replace(".", ":") ?? "";
          setSelectedJamMasuk(jamFormatted);
          setStatus(dataGuru.status ?? "");
          setKeterangan(dataGuru.keterangan ?? "");
          setRole(dataGuru.role);
          setPassword(dataGuru.id ? "Registered" : "Belum Registered");
        }

        if (resKelas.data.status === "success") {
          setKelasList(resKelas.data.data);
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

  // 🔹 Update jam masuk sesuai kelas
  useEffect(() => {
    const selectedKelas = kelasList.find((k) => k.id?.toString() === selectedKelasId);
    if (selectedKelas) {
      const jamFormatted = selectedKelas.jam_masuk?.replace(".", ":") || "";
      setSelectedJamMasuk(jamFormatted);
    }
  }, [selectedKelasId, kelasList]);

  // 🔹 Submit update
  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!guru) return;

    try {
      setIsLoading(true);
      const res = await api.put<ApiResponse<null>>(`/kepegawaian/${guru.id}`, {
        nama,
        nip,
        kelas_id: Number(selectedKelasId),
        status,
        keterangan,
        role,
        // password,
      });

      if (res.data.status === "success") {
        Swal.fire("Berhasil", res.data.message, "success").then(() => {
          navigate("/superadmin/informasi-sekolah/kepegawaian/guru");
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
  // const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (!guru) return;

  //   try {
  //     setIsLoading(true);

  //     // 🔹 Buat payload tanpa password
  //     const payload: Record<string, any> = {
  //       nama,
  //       nip,
  //       kelas_id: Number(selectedKelasId),
  //       status,
  //       keterangan,
  //       role,
  //     };

  //     // 🔹 Kirim update ke API tanpa mengubah password
  //     const res = await api.put<ApiResponse<null>>(`/kepegawaian/${guru.id}`, payload);

  //     if (res.data.status === "success") {
  //       Swal.fire("Berhasil", res.data.message, "success").then(() => {
  //         navigate("/superadmin/informasi-sekolah/kepegawaian/guru");
  //       });
  //     } else {
  //       Swal.fire("Gagal", res.data.message, "error");
  //     }
  //   } catch (error) {
  //     const err = error as { response?: { data?: { message?: string } } };
  //     Swal.fire("Error", err.response?.data?.message || "Terjadi kesalahan", "error");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

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
        <PageTitle title="Edit Guru" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Guru</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nama Guru */}
                <div>
                  <label className="block font-semibold text-foreground">Nama Guru</label>
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan nama lengkap" required />
                </div>

                {/* NIP */}
                <div>
                  <label className="block font-semibold text-foreground">NIP</label>
                  <input type="text" value={nip} onChange={(e) => setNip(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Masukkan NIP" required />
                </div>

                {/* Kelas */}
                <div>
                  <label className="block font-semibold text-foreground">Nama Kelas</label>
                  <input type="text" value={kelasList.find((k) => k.id?.toString() === selectedKelasId)?.nama_kelas || ""} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100 text-gray-700" disabled />
                </div>

                {/* Jam Masuk */}
                <div>
                  <label className="block font-semibold text-foreground">Jam Masuk</label>
                  <input type="time" value={selectedJamMasuk} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100" disabled />
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

export default EditGuru;
