import { useEffect, useState, type FormEvent } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import PageTitle from "@/components/PageTitle";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import api from "@/api/axios";
// Menggunakan type Siswa yang baru
import type { Siswa, Kelas, Jurusan } from "@/types";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

const EditSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [siswa, setSiswa] = useState<Siswa | null>(null);

  // form fields
  const [nisn, setNisn] = useState("");
  const [nis, setNis] = useState("");
  const [nama, setNama] = useState("");
  // Jika API mengembalikan 'status' yang berbeda dari yang di type, periksa kembali
  const [status, setStatus] = useState("");
  const [role, setRole] = useState("");
  const [kelasId, setKelasId] = useState<string>("");
  // **Perubahan:** Mengganti jurusanId menjadi string default
  const [jurusanId, setJurusanId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [namaEkskul, setNamaEkskul] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Fetch data siswa, kelas, dan jurusan
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Memastikan endpoint API yang dipanggil sudah benar
        const [resSiswa, resKelas, resJurusan] = await Promise.all([api.get<ApiResponse<Siswa>>(`/siswa/${id}`), api.get<ApiResponse<Kelas[]>>(`/kelas`), api.get<ApiResponse<Jurusan[]>>(`/jurusan`)]);

        if (resSiswa.data.status === "success") {
          const dataSiswa = resSiswa.data.data;
          setSiswa(dataSiswa);
          setNisn(dataSiswa.nisn);
          setNis(dataSiswa.nis);
          setNama(dataSiswa.nama);
          setStatus(dataSiswa.status ?? "");
          setRole(dataSiswa.role ?? "");
          setNamaEkskul(dataSiswa.nama_ekstrakurikuler ?? "-");
          setKelasId(dataSiswa.kelas?.id?.toString() ?? "");
          if (resJurusan.data.status === "success") {
            const dataJurusan = resJurusan.data.data;
            setJurusanList(dataJurusan);

            // Mencari Jurusan ID yang cocok dengan nama_jurusan siswa
            const selectedJurusan = dataJurusan.find((j) => j.nama_jurusan === dataSiswa.nama_jurusan);
            setJurusanId(selectedJurusan?.id?.toString() ?? "");
          }
          setPassword(dataSiswa.id ? "Registered" : "Belum Registered");
        }

        if (resKelas.data.status === "success") setKelasList(resKelas.data.data);
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

  // 🔹 Submit update siswa
  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault();
    if (!siswa) return;

    try {
      setIsLoading(true);

      const payload = {
        nisn,
        nis,
        nama,
        status,
        role: role || "siswa",
        kelas_id: Number(kelasId),
        jurusan_id: jurusanId ? Number(jurusanId) : null,
      };

      const res = await api.put<ApiResponse<null>>(`/siswa/${siswa.id}`, payload);

      if (res.data.status === "success") {
        Swal.fire("Berhasil", "Data siswa berhasil diperbarui", "success").then(() => {
          navigate("/superadmin/informasi-akademik/siswa");
        });
      } else {
        Swal.fire("Gagal", res.data.message, "error");
      }
    } catch (error) {
      // Definisikan struktur error yang diharapkan dari Laravel 422
      const err = error as {
        response?: {
          data?: {
            message?: string;
            errors?: {
              nisn?: string[];
              nis?: string[];
              [key: string]: any; // Untuk field error lainnya
            };
          };
          status?: number;
        };
      };

      // Ambil pesan default dan detail errors
      let errorMessage = err.response?.data?.message || "Terjadi kesalahan";
      const apiErrors = err.response?.data?.errors;
      const apiStatus = err.response?.status;

      // --- LOGIKA PENANGANAN ERROR VALIDASI (STATUS 422) ---
      if (apiStatus === 422 && apiErrors) {
        // Prioritas 1: Cek error NISN
        if (apiErrors.nisn && apiErrors.nisn.length > 0) {
          // Mengambil pesan spesifik dari backend (contoh: "NISN sudah terdaftar.")
          errorMessage = apiErrors.nisn[0];
        }
        // Prioritas 2: Cek error NIS
        else if (apiErrors.nis && apiErrors.nis.length > 0) {
          // Mengambil pesan spesifik dari backend (contoh: "NIS sudah terdaftar.")
          errorMessage = apiErrors.nis[0];
        }
        // Jika error 422 terjadi, tetapi tidak NISN/NIS, dan pesan API generik
        else if (errorMessage === "Validasi gagal" || !errorMessage) {
          errorMessage = "Validasi gagal. Mohon periksa kembali semua input formulir.";
        }
      }
      // --------------------------------------------------------

      // Tampilkan pesan error
      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
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
                  <label className="block font-semibold text-foreground">NISN</label>
                  <input type="text" value={nisn} onChange={(e) => setNisn(e.target.value)} className="border p-2 w-full mt-2 rounded" required />
                </div>

                {/* NIS */}
                <div>
                  <label className="block font-semibold text-foreground">NIS</label>
                  <input type="text" value={nis} onChange={(e) => setNis(e.target.value)} className="border p-2 w-full mt-2 rounded" required />
                </div>

                {/* Nama */}
                <div>
                  <label className="block font-semibold text-foreground">Nama Lengkap</label>
                  <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="border p-2 w-full mt-2 rounded" required />
                </div>

                {/* Jurusan (select) */}
                <div>
                  <label className="block font-semibold text-foreground">Jurusan</label>
                  <select value={jurusanId} onChange={(e) => setJurusanId(e.target.value)} className="border p-2 w-full mt-2 rounded bg-white" required>
                    <option value="">Pilih Jurusan</option>
                    {jurusanList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.nama_jurusan}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Kelas (select) */}
                <div>
                  <label className="block font-semibold text-foreground">Kelas</label>
                  <select value={kelasId} onChange={(e) => setKelasId(e.target.value)} className="border p-2 w-full mt-2 rounded bg-white" required>
                    <option value="">Pilih Kelas</option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kelas}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ekskul (readonly) */}
                <div>
                  <label className="block font-semibold text-foreground">Ekstrakurikuler</label>
                  <input type="text" value={namaEkskul} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100 text-gray-700" disabled />
                </div>

                {/* Status */}
                <div>
                  <label className="block font-semibold text-foreground">Status</label>
                  {/* Lebih baik menggunakan <select> dengan opsi "Aktif" dan "Nonaktif" */}
                  <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 w-full mt-2 rounded" placeholder="Aktif / Nonaktif" />
                </div>

                {/* Role */}
                <div>
                  <label className="block font-semibold text-foreground">Role</label>
                  <input type="text" value={role} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100 text-gray-700" disabled />
                </div>

                {/* Password Info */}
                <div>
                  <label className="block font-semibold text-foreground">Password</label>
                  <input type="text" value={password} readOnly className={`border p-2 w-full mt-2 rounded bg-gray-100 ${password === "Registered" ? "text-primary" : "text-red-500"}`} disabled />
                </div>

                {/* Tombol Aksi */}
                <div className="col-span-1 md:col-span-2 flex gap-2 mt-4">
                  <Button type="submit" className="bg-primary flex items-center gap-2" disabled={isLoading}>
                    <FilePlus size={18} />
                    {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/siswa">
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

export default EditSiswa;
