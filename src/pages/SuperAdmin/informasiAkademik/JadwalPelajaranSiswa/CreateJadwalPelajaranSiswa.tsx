import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import type { Siswa, JadwalPelajaran } from "@/types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CreateResponse {
  id: number;
  nama_siswa: string;
  mata_pelajaran: string;
  hari: string;
  guru: string;
  kelas: string;
  jam_pelajaran: string;
  ruangan: string;
  link_opsional: string | null;
}

const CreateJadwalPelajaranSiswa = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [siswaId, setSiswaId] = useState<string>("");
  const [jadwalPelajaranId, setJadwalPelajaranId] = useState<string>("");

  // Data untuk dropdown
  const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
  const [dataJadwal, setDataJadwal] = useState<JadwalPelajaran[]>([]);

  // Error state
  const [errors, setErrors] = useState<{
    siswa_id?: string[];
    jadwal_pelajaran_id?: string[];
  }>({});

  // Load data siswa dan jadwal untuk dropdown
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Fetch data siswa
        const resSiswa = await api.get("/spa/siswa");
        if (resSiswa.data.status === "success") {
          setDataSiswa(resSiswa.data.data);
        }

        // Fetch data jadwal pelajaran
        const resJadwal = await api.get("/spa/siswa/jadwal-pelajaran");
        if (resJadwal.data.status === "success") {
          setDataJadwal(resJadwal.data.data);
        }

        // Set siswa_id dari query parameter jika ada
        const siswaIdParam = searchParams.get("siswa_id");
        if (siswaIdParam) {
          setSiswaId(siswaIdParam);
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data",
          text: "Terjadi kesalahan saat mengambil data siswa dan jadwal pelajaran.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validasi client-side
    const newErrors: typeof errors = {};
    if (!siswaId) {
      newErrors.siswa_id = ["Siswa wajib dipilih"];
    }
    if (!jadwalPelajaranId) {
      newErrors.jadwal_pelajaran_id = ["Jadwal pelajaran wajib dipilih"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/spa/siswa/jadwal-pelajaran", {
        siswa_id: parseInt(siswaId),
        jadwal_pelajaran_id: parseInt(jadwalPelajaranId),
      });

      if (res.data.status === "success") {
        const data: CreateResponse = res.data.data;

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          html: `
            <div class="text-left">
              <p class="mb-2"><strong>Siswa:</strong> ${data.nama_siswa}</p>
              <p class="mb-2"><strong>Mata Pelajaran:</strong> ${data.mata_pelajaran}</p>
              <p class="mb-2"><strong>Hari:</strong> ${data.hari}</p>
              <p class="mb-2"><strong>Jam:</strong> ${data.jam_pelajaran}</p>
              <p class="mb-2"><strong>Ruangan:</strong> ${data.ruangan}</p>
            </div>
          `,
          confirmButtonColor: "#4F46E5",
          confirmButtonText: "OK",
        });

        navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        // Validation error dari backend
        const backendErrors = err.response.data.errors;
        setErrors(backendErrors);

        // Tampilkan error message khusus untuk "sudah terdaftar"
        if (backendErrors.siswa_id && backendErrors.siswa_id[0].includes("sudah terdaftar")) {
          Swal.fire({
            icon: "warning",
            title: "Siswa Sudah Terdaftar",
            text: "Siswa sudah terdaftar di jadwal pelajaran ini. Silakan pilih jadwal pelajaran lain.",
            confirmButtonColor: "#4F46E5",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Validasi Gagal",
            text: err.response.data.message || "Periksa kembali input Anda.",
            confirmButtonColor: "#4F46E5",
          });
        }
      } else if (err.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: err.response.data.message || "Siswa atau jadwal pelajaran tidak ditemukan.",
          confirmButtonColor: "#4F46E5",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi Gagal",
          text: "Terjadi kesalahan koneksi ke server. Silakan coba lagi.",
          confirmButtonColor: "#4F46E5",
        });
      }
      console.error("Error create jadwal pelajaran siswa:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk format nama guru
  const formatGuru = (guru: any): string => {
    if (typeof guru === "string") return guru;
    if (Array.isArray(guru) && guru.length > 0) {
      return guru.map((g) => g.nama).join(", ");
    }
    return "-";
  };

  // Helper untuk format nama kelas
  const formatKelas = (kelas: any): string => {
    if (typeof kelas === "string") return kelas;
    if (Array.isArray(kelas) && kelas.length > 0) {
      return kelas.map((k) => k.nama_kelas).join(", ");
    }
    return "-";
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Jadwal Pelajaran Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Jadwal Pelajaran Siswa</h1>

          {/* Loading State */}
          {loadingData ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-5">
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Pilih Siswa */}
                <div className="mb-6">
                  <label htmlFor="siswa_id" className="block font-semibold text-foreground">
                    Pilih Siswa
                  </label>
                  <Select
                    value={siswaId?.toString()}
                    onValueChange={(value) => {
                      setSiswaId(value);
                      setErrors((prev) => ({ ...prev, siswa_id: undefined }));
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className={`w-full px-4 py-2 mt-2 ${errors.siswa_id ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Pilih Siswa" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Siswa</SelectLabel>

                        {dataSiswa.length > 0 ? (
                          dataSiswa.map((siswa) => (
                            <SelectItem key={siswa.id} value={siswa.id.toString()}>
                              {siswa.nama} - {siswa.nis} - {typeof siswa.kelas === "string" ? siswa.kelas : siswa.kelas?.nama_kelas || "-"}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="text-muted-foreground p-2 text-sm">Tidak ada data siswa</div>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.siswa_id && <p className="text-red-500 text-sm mt-1">{errors.siswa_id[0]}</p>}
                </div>

                {/* Pilih Jadwal Pelajaran */}
                <div className="mb-6">
                  <label htmlFor="jadwal_pelajaran_id" className="block text-sm font-semibold text-gray-700 mb-2">
                    Pilih Jadwal Pelajaran
                  </label>
                  <Select
                    value={jadwalPelajaranId?.toString()}
                    onValueChange={(value) => {
                      setJadwalPelajaranId(value);
                      setErrors((prev) => ({ ...prev, jadwal_pelajaran_id: undefined }));
                    }}
                    disabled={loading}
                  >
                    <SelectTrigger className={`w-full px-4 py-2 mt-2 ${errors.jadwal_pelajaran_id ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="Pilih Jadwal Pelajaran" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Jadwal Pelajaran</SelectLabel>

                        {dataJadwal.length > 0 ? (
                          dataJadwal.map((jadwal) => (
                            <SelectItem key={jadwal.id} value={jadwal.id.toString()}>
                              {jadwal.mata_pelajaran} - {jadwal.hari} ({jadwal.jam_pelajaran}){" - "}
                              {formatKelas(jadwal.kelas)} - {formatGuru(jadwal.guru)}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="text-muted-foreground p-2 text-sm">Tidak ada jadwal pelajaran</div>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.jadwal_pelajaran_id && <p className="text-red-500 text-sm mt-1">{errors.jadwal_pelajaran_id[0]}</p>}
                </div>

                {/* Info Detail Jadwal yang Dipilih */}
                {jadwalPelajaranId && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-900 mb-2">Detail Jadwal yang Dipilih:</h3>
                    {(() => {
                      const selectedJadwal = dataJadwal.find((j) => j.id === parseInt(jadwalPelajaranId));
                      if (!selectedJadwal) return null;
                      return (
                        <div className="text-sm text-blue-800 space-y-1">
                          <p>
                            <strong>Mata Pelajaran:</strong> {selectedJadwal.mata_pelajaran}
                          </p>
                          <p>
                            <strong>Hari:</strong> {selectedJadwal.hari}
                          </p>
                          <p>
                            <strong>Jam:</strong> {selectedJadwal.jam_pelajaran}
                          </p>
                          <p>
                            <strong>Guru:</strong> {formatGuru(selectedJadwal.guru)}
                          </p>
                          <p>
                            <strong>Kelas:</strong> {formatKelas(selectedJadwal.kelas)}
                          </p>
                          <p>
                            <strong>Ruangan:</strong> {selectedJadwal.ruangan}
                          </p>
                          {selectedJadwal.link_opsional && (
                            <p>
                              <strong>Link:</strong> {selectedJadwal.link_opsional}
                            </p>
                          )}
                          <p>
                            <strong>Jumlah Peserta:</strong> {selectedJadwal.peserta?.length || 0} siswa
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Tombol Aksi */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-siswa">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
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

export default CreateJadwalPelajaranSiswa;
