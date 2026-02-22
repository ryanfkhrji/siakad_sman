import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CircleXIcon, Save, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SiswaDetailJadwal, JadwalPelajaranDetail } from "@/types/siswaJadwalPelajaran";

// Tipe flat untuk dropdown jadwal dari /spa/jadwal-pelajaran
interface JadwalOption {
  jadwal_pelajaran_id: number;
  mata_pelajaran: string;
  hari: string;
  guru: string;
  rombel: string;
  jam_mulai: string;
  jam_selesai: string;
  ruangan: string | null;
}

const EditJadwalPelajaranSiswa = () => {
  // siswaId = id siswa
  // jadwalId = jadwal_pelajaran_id yang sedang diedit (dari params)
  const { siswaId, jadwalId } = useParams<{ siswaId: string; jadwalId: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  const [dataSiswa, setDataSiswa] = useState<SiswaDetailJadwal | null>(null);
  const [currentJadwal, setCurrentJadwal] = useState<JadwalPelajaranDetail | null>(null);
  const [jadwalOptions, setJadwalOptions] = useState<JadwalOption[]>([]);

  // Inisialisasi langsung dari jadwalId agar tidak ada bug uncontrolled→controlled
  const [selectedJadwalId, setSelectedJadwalId] = useState<string>(jadwalId ?? "");

  const [errors, setErrors] = useState<{ jadwal_pelajaran_id: string[] }>({
    jadwal_pelajaran_id: [],
  });

  useEffect(() => {
    if (!siswaId || !jadwalId) {
      navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingData(true);

        const [detailRes, jadwalRes] = await Promise.all([api.get(`/spa/siswa/jadwal-pelajaran/${siswaId}`), api.get("/spa/jadwal-pelajaran")]);

        // ── 1. Detail siswa + cari jadwal saat ini ───────────
        if (detailRes.data.status === "success") {
          const siswa: SiswaDetailJadwal = detailRes.data.data;
          setDataSiswa(siswa);

          // Cari jadwal_pelajaran_id yang cocok di semua periode & semester
          let found: JadwalPelajaranDetail | null = null;
          for (const periode of siswa.periode) {
            for (const semester of periode.jadwal) {
              const match = semester.jadwal_pelajarans.find((j) => String(j.jadwal_pelajaran_id) === String(jadwalId));
              if (match) {
                found = match;
                break;
              }
            }
            if (found) break;
          }

          if (!found) {
            throw new Error("Jadwal tidak ditemukan untuk siswa ini");
          }

          setCurrentJadwal(found);
          setSelectedJadwalId(String(found.jadwal_pelajaran_id));
        }

        // ── 2. Flatten semua jadwal tersedia untuk dropdown ──
        if (jadwalRes.data.status === "success") {
          const flattened: JadwalOption[] = [];

          jadwalRes.data.data.forEach((tahun: any) => {
            tahun.semesters.forEach((semester: any) => {
              semester.gurus.forEach((guru: any) => {
                guru.jadwals.forEach((j: any) => {
                  flattened.push({
                    jadwal_pelajaran_id: j.jadwal_pelajaran_id,
                    mata_pelajaran: j.mata_pelajaran,
                    hari: j.hari,
                    guru: guru.guru,
                    rombel: j.rombel,
                    jam_mulai: j.jam_mulai,
                    jam_selesai: j.jam_selesai,
                    ruangan: j.ruangan,
                  });
                });
              });
            });
          });

          setJadwalOptions(flattened);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || error.message || "Tidak dapat memuat data",
        });
        navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [siswaId, jadwalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ jadwal_pelajaran_id: [] });

    if (!selectedJadwalId) {
      setErrors({ jadwal_pelajaran_id: ["Jadwal pelajaran wajib dipilih"] });
      return;
    }

    if (selectedJadwalId === String(jadwalId)) {
      Swal.fire({
        icon: "info",
        title: "Tidak ada perubahan",
        text: "Anda belum mengubah jadwal pelajaran.",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.put(`/spa/siswa/jadwal-pelajaran/${jadwalId}`, {
        jadwal_pelajaran_id: Number(selectedJadwalId),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Jadwal pelajaran siswa berhasil diperbarui.",
          timer: 1800,
          showConfirmButton: false,
        });
        navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      if (errorStatus === 422 && errorData?.errors) {
        setErrors({ ...errors, ...errorData.errors });
        Swal.fire({
          icon: "error",
          title: "Validasi gagal!",
          text: "Periksa kembali inputan Anda.",
        });
      } else if (errorStatus === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: errorData?.message || "Data jadwal tidak ditemukan.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: errorData?.message || "Tidak dapat terhubung ke server.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const previewJadwal = jadwalOptions.find((j) => String(j.jadwal_pelajaran_id) === selectedJadwalId);
  const isChanged = selectedJadwalId !== String(jadwalId);

  // Info siswa dari periode pertama yang ada
  const infoPeriode = dataSiswa?.periode[0];

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Jadwal Pelajaran Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-2">Edit Jadwal Pelajaran Siswa</h1>

          <Button variant="outline" className="mb-6 mt-2 flex items-center gap-2" onClick={() => navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa")}>
            <ArrowLeftIcon size={16} />
            Kembali
          </Button>

          {loadingData ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : dataSiswa && currentJadwal ? (
            <div className="bg-white rounded shadow p-6 max-w-2xl w-full">
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Card Info Siswa */}
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-indigo-900 mb-3">🎓 Informasi Siswa</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-indigo-600 font-medium block">Nama</span>
                      <span className="text-indigo-900 font-semibold">{dataSiswa.nama_siswa}</span>
                    </div>
                    <div>
                      <span className="text-indigo-600 font-medium block">Rombel</span>
                      <span className="text-indigo-900">{infoPeriode?.rombel.nama_rombel ?? "-"}</span>
                    </div>
                    <div>
                      <span className="text-indigo-600 font-medium block">Kelas</span>
                      <span className="text-indigo-900">{infoPeriode?.rombel.kelas ?? "-"}</span>
                    </div>
                    <div>
                      <span className="text-indigo-600 font-medium block">Wali Rombel</span>
                      <span className="text-indigo-900">{infoPeriode?.rombel.wali_rombel ?? "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Jadwal Saat Ini */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-yellow-900 mb-2">📋 Jadwal Saat Ini</p>
                  <p className="text-sm text-yellow-900 font-semibold">{currentJadwal.mata_pelajaran}</p>
                  <p className="text-sm text-yellow-800 mt-1">
                    {currentJadwal.hari} • {currentJadwal.jam_mulai.slice(0, 5)} - {currentJadwal.jam_selesai.slice(0, 5)} • Guru: {currentJadwal.guru} • Ruangan: {currentJadwal.ruangan ?? "-"}
                  </p>
                </div>

                {/* Select Jadwal Baru */}
                <div>
                  <label className="block font-semibold text-foreground mb-2">
                    Ubah Jadwal Pelajaran <span className="text-red-500">*</span>
                  </label>

                  <Select
                    value={selectedJadwalId}
                    onValueChange={(v) => {
                      setSelectedJadwalId(v);
                      setErrors({ jadwal_pelajaran_id: [] });
                    }}
                  >
                    <SelectTrigger className={`w-full ${errors.jadwal_pelajaran_id.length > 0 ? "border-red-500" : ""}`}>
                      <SelectValue placeholder="-- pilih jadwal pelajaran --" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      <SelectGroup>
                        <SelectLabel>Daftar Jadwal Tersedia</SelectLabel>
                        {jadwalOptions.length === 0 ? (
                          <div className="px-2 py-2 text-sm text-gray-400">Tidak ada jadwal tersedia</div>
                        ) : (
                          jadwalOptions.map((j) => (
                            <SelectItem key={j.jadwal_pelajaran_id} value={String(j.jadwal_pelajaran_id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{j.mata_pelajaran}</span>
                                <span className="text-xs text-gray-500">
                                  {j.hari} • {j.jam_mulai.slice(0, 5)} - {j.jam_selesai.slice(0, 5)} • {j.rombel} • {j.guru}
                                </span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.jadwal_pelajaran_id.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jadwal_pelajaran_id[0]}</p>}
                </div>

                {/* Preview Jadwal Baru */}
                {previewJadwal && isChanged && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900 mb-2">✅ Preview Jadwal Baru</p>
                    <p className="text-sm text-green-900 font-semibold">{previewJadwal.mata_pelajaran}</p>
                    <p className="text-sm text-green-800 mt-1">
                      {previewJadwal.hari} • {previewJadwal.jam_mulai.slice(0, 5)} - {previewJadwal.jam_selesai.slice(0, 5)}
                    </p>
                    <p className="text-sm text-green-800">
                      Guru: {previewJadwal.guru} • Rombel: {previewJadwal.rombel} • Ruangan: {previewJadwal.ruangan ?? "-"}
                    </p>
                  </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Siswa tidak dapat diubah — hanya jadwal pelajaran yang bisa diganti</li>
                    <li>Pilih jadwal baru dari daftar yang tersedia</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading || !isChanged} className="bg-primary flex items-center gap-2">
                    <Save size={18} />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
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
          ) : null}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditJadwalPelajaranSiswa;
