import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { FilePlus, CircleXIcon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Ekskul, Siswa } from "@/types";

interface FormErrors {
  siswa_id?: string[];
}

export default function DaftarSiswaEkskul() {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [ekskul, setEkskul] = useState<Ekskul | null>(null);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [selectedSiswa, setSelectedSiswa] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  // 🔹 Ambil data ekskul
  useEffect(() => {
    const fetchEkskul = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/ekstrakurikuler/${id}`);
        if (res.data.status === "success") {
          setEkskul(res.data.data);
        }
      } catch (err) {
        console.error("Gagal memuat data ekskul:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEkskul();
  }, [id]);

  // 🔹 Ambil daftar siswa (pastikan hanya siswa yang punya role 'siswa')
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        const res = await api.get("/siswa");
        if (res.data.status === "success") {
          const siswaOnly = res.data.data.filter((item: Siswa) => item.role === "siswa");
          setSiswaList(siswaOnly);
        }
      } catch (err) {
        console.error("Gagal memuat daftar siswa:", err);
      }
    };
    fetchSiswa();
  }, []);

  // 🔹 Tambah siswa ke ekskul (POST /siswa-ekskul)
  const handleAddSiswa = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    if (!selectedSiswa) {
      Swal.fire("Peringatan", "Pilih siswa terlebih dahulu!", "warning");
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.post("/siswa-ekskul", {
        siswa_id: Number(selectedSiswa),
        ekstrakurikuler_id: Number(id),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.data.message || "Siswa berhasil didaftarkan ke ekskul.",
          showConfirmButton: false,
          timer: 1800,
        });
        // Reset pilihan setelah berhasil
        setSelectedSiswa("");
        navigate("/superadmin/informasi-akademik/ekstrakurikuler");
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: res.data.message || "Terjadi kesalahan!",
        });
      }
    } catch (err: any) {
      const backendErrors = err.response?.data?.errors || {};
      setErrors(backendErrors);

      Swal.fire({
        icon: "error",
        title: "Gagal menambahkan siswa!",
        text: err.response?.data?.message || "Terjadi kesalahan pada server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <PageTitle title="Daftar Siswa ke Ekstrakurikuler" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Siswa ke Ekstrakurikuler {ekskul?.nama_ekstrakurikuler ? `(${ekskul.nama_ekstrakurikuler})` : ""}</h1>

          <div className="bg-white rounded shadow p-5">
            <form onSubmit={handleAddSiswa} className="space-y-6 max-w-lg w-full">
              {/* Pilih Siswa */}
              <div>
                <label htmlFor="siswa_id" className="block font-semibold text-foreground">
                  Pilih Siswa
                </label>
                <Select value={selectedSiswa} onValueChange={(val) => setSelectedSiswa(val)} disabled={isLoading || loading}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder={loading ? "Memuat..." : "Pilih Siswa"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Siswa</SelectLabel>
                      {siswaList.length > 0 ? (
                        siswaList.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.nama} — {s.kelas?.nama_kelas ?? "-"}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-gray-500 text-sm">Tidak ada siswa tersedia</div>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.siswa_id && <p className="text-red-500 text-sm mt-1">{errors.siswa_id[0]}</p>}
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {isLoading ? "Menyimpan..." : "Simpan"}
                </Button>

                <Link to="/superadmin/informasi-akademik/daftar-siswa-ekstrakurikuler">
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
}
