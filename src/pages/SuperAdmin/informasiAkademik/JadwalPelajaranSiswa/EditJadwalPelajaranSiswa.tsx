import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue } from "@/components/ui/select";

interface JadwalPelajaran {
  id: number;
  mata_pelajaran: string;
  hari: string;
  guru: string | string[];
  kelas: string | string[];
  jam_pelajaran: string;
  ruangan: string;
  link_opsional: string | null;
}

interface JadwalPelajaranSiswa {
  id: number;
  nisn: string;
  nama: string;
  email: string;
  nis: string;
  nama_jurusan: string | null;
  status: string;
  kelas: {
    id: number;
    nama_kelas: string;
    jam_masuk: string;
  };
}

const EditJadwalPelajaranSiswa = () => {
  // ✅ Terima 2 parameter: siswaId dan pivotId
  const { siswaId, pivotId } = useParams<{ siswaId: string; pivotId: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [jadwalPelajaranId, setJadwalPelajaranId] = useState("");
  const [currentJadwalId, setCurrentJadwalId] = useState<number | null>(null);
  const [currentPivotId, setCurrentPivotId] = useState<string>("");

  const [dataSiswa, setDataSiswa] = useState<JadwalPelajaranSiswa | null>(null);
  const [dataJadwal, setDataJadwal] = useState<JadwalPelajaran[]>([]);

  const [errors, setErrors] = useState<{ jadwal_pelajaran_id?: string[] }>({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ✅ Validasi parameter
        if (!siswaId || !pivotId) {
          throw new Error("Parameter siswaId dan pivotId diperlukan");
        }

        setLoadingData(true);

        // ✅ Fetch detail siswa berdasarkan siswaId
        const resDetail = await api.get(`/spa/siswa/jadwal-pelajaran/${siswaId}`);

        let siswaData: any = null;

        if (resDetail.data.status === "success") {
          siswaData = resDetail.data.data;

          setDataSiswa({
            id: siswaData.id,
            nisn: siswaData.nisn || "",
            nama: siswaData.nama || "",
            email: siswaData.email || "",
            nis: siswaData.nis || "",
            nama_jurusan: siswaData.nama_jurusan || null,
            status: siswaData.status || "",
            kelas: siswaData.kelas || {},
          });

          // ✅ Cari jadwal yang sesuai dengan pivotId
          if (Array.isArray(siswaData.jadwal_pelajaran)) {
            const targetJadwal = siswaData.jadwal_pelajaran.find((j: any) => String(j.pivot_id) === String(pivotId));

            if (targetJadwal) {
              setCurrentJadwalId(targetJadwal.id);
              setJadwalPelajaranId(String(targetJadwal.id));
              setCurrentPivotId(String(targetJadwal.pivot_id));
            } else {
              throw new Error("Jadwal dengan pivot_id tersebut tidak ditemukan");
            }
          } else {
            throw new Error("Data jadwal pelajaran tidak ditemukan");
          }
        }

        // Fetch semua jadwal pelajaran yang available
        const resJadwal = await api.get("/spa/jadwal-pelajaran");

        if (resJadwal.data.status === "success") {
          // ✅ Filter out jadwal yang sudah diambil oleh siswa (kecuali jadwal yang sedang diedit)
          const allJadwal = resJadwal.data.data;
          const siswaJadwalIds = siswaData.jadwal_pelajaran.filter((j: any) => String(j.pivot_id) !== String(pivotId)).map((j: any) => j.id);

          const availableJadwal = allJadwal.filter((jadwal: JadwalPelajaran) => !siswaJadwalIds.includes(jadwal.id));

          setDataJadwal(availableJadwal);
        }

        setLoadingData(false);
      } catch (err: any) {
        console.error("Error fetching data:", err);

        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: err.message || "Terjadi kesalahan saat memuat data.",
          confirmButtonColor: "#4F46E5",
        }).then(() => {
          navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
        });

        setLoadingData(false);
      }
    };

    fetchData();
  }, [siswaId, pivotId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!jadwalPelajaranId) {
      setErrors({ jadwal_pelajaran_id: ["Jadwal pelajaran wajib dipilih"] });
      return;
    }

    if (parseInt(jadwalPelajaranId) === currentJadwalId) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Perubahan",
        text: "Anda belum mengubah jadwal pelajaran.",
      });
      return;
    }

    try {
      setLoading(true);

      // ✅ Update menggunakan pivot_id yang benar
      const res = await api.put(`/spa/siswa/jadwal-pelajaran/${currentPivotId}`, {
        jadwal_pelajaran_id: parseInt(jadwalPelajaranId),
      });

      if (res.data.status === "success") {
        await Swal.fire({
          icon: "success",
          title: "Berhasil Mengupdate",
          text: res.data?.message || "Jadwal pelajaran siswa berhasil diperbarui!",
        });

        // Redirect ke detail siswa
        if (siswaId) {
          navigate(`/superadmin/informasi-akademik/jadwal-pelajaran-siswa/detail/${siswaId}`);
        } else {
          navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
        }
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        const backend = err.response.data;
        const backendData = backend.data || {};

        setErrors({
          jadwal_pelajaran_id: backendData.jadwal_pelajaran_id || [],
        });

        // ✅ Handle khusus untuk duplikat mata pelajaran (backup protection)
        const isDuplicate = backend.message?.toLowerCase().includes("sudah terdaftar") || backendData.jadwal_pelajaran_id?.[0]?.toLowerCase().includes("sudah terdaftar");

        if (isDuplicate) {
          Swal.fire({
            icon: "warning",
            title: "Jadwal Sudah Ada",
            html: `
              <p>Siswa <strong>${dataSiswa?.nama}</strong> sudah terdaftar di mata pelajaran ini.</p>
              <br>
              <p class="text-sm text-gray-600">Silakan pilih mata pelajaran lain atau hapus jadwal yang sudah ada terlebih dahulu.</p>
            `,
            confirmButtonColor: "#4F46E5",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Validasi Gagal",
            text: backend.message || "Periksa kembali form Anda.",
          });
        }
      } else if (err.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: err.response?.data?.message || "Data yang Anda cari tidak ditemukan.",
        }).then(() => {
          navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Mengupdate",
          text: err.response?.data?.message || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatGuru = (guru: any): string => {
    if (Array.isArray(guru)) {
      return guru.map((g) => (typeof g === "object" ? g.nama : g)).join(", ");
    }
    return guru || "-";
  };

  const formatKelas = (kelas: any): string => {
    if (Array.isArray(kelas)) {
      return kelas.map((k) => (typeof k === "object" ? k.nama_kelas : k)).join(", ");
    }
    return kelas || "-";
  };

  const selectedJadwal = dataJadwal.find((j) => j.id === parseInt(jadwalPelajaranId));
  const currentJadwal = dataJadwal.find((j) => j.id === currentJadwalId);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Jadwal Pelajaran Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Edit Jadwal Pelajaran Siswa</h1>

          <Button variant="outline" className="mb-6 mt-6" onClick={() => navigate(-1)}>
            <ArrowLeftIcon size={16} />
            Kembali
          </Button>

          {/* LOADING */}
          {loadingData ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : (
            dataSiswa && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className=" max-w-lg w-full">
                  {/* Info siswa */}
                  <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-3">Informasi Siswa</h3>

                    <div className="grid grid-cols-2 gap-4 text-sm text-blue-900">
                      <p>
                        <strong>Nama:</strong> {dataSiswa.nama}
                      </p>
                      <p>
                        <strong>NIS:</strong> {dataSiswa.nis}
                      </p>
                      <p>
                        <strong>NISN:</strong> {dataSiswa.nisn}
                      </p>
                      <p>
                        <strong>Kelas:</strong> {dataSiswa.kelas?.nama_kelas}
                      </p>
                    </div>
                  </div>

                  {/* Current Jadwal Info */}
                  {currentJadwal && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <h3 className="font-semibold text-yellow-900 mb-2">Jadwal Saat Ini</h3>
                      <p className="text-sm text-yellow-900">
                        <strong>{currentJadwal.mata_pelajaran}</strong> — {currentJadwal.hari} ({currentJadwal.jam_pelajaran})
                      </p>
                    </div>
                  )}

                  {/* FORM */}
                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                      <label className="font-semibold block mb-2">Ubah Jadwal Pelajaran</label>

                      <Select
                        value={jadwalPelajaranId}
                        onValueChange={(val) => {
                          setJadwalPelajaranId(val);
                          setErrors({});
                        }}
                        disabled={loading}
                      >
                        <SelectTrigger className={`${errors.jadwal_pelajaran_id ? "border-red-500" : ""} w-full`}>
                          <SelectValue placeholder="Pilih Jadwal Pelajaran" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Daftar Jadwal</SelectLabel>

                            {dataJadwal.length === 0 ? (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">Tidak ada jadwal tersedia</div>
                            ) : (
                              dataJadwal.map((item) => (
                                <SelectItem key={item.id} value={item.id.toString()}>
                                  {item.mata_pelajaran} — {item.hari} ({item.jam_pelajaran})
                                </SelectItem>
                              ))
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {errors.jadwal_pelajaran_id && <p className="text-red-500 text-sm mt-1">{errors.jadwal_pelajaran_id[0]}</p>}
                    </div>

                    {/* PREVIEW */}
                    {selectedJadwal && parseInt(jadwalPelajaranId) !== currentJadwalId && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-2">Preview Jadwal Baru</h3>

                        <p className="text-sm text-green-900">
                          <strong>Mapel:</strong> {selectedJadwal.mata_pelajaran}
                        </p>
                        <p className="text-sm text-green-900">
                          <strong>Hari:</strong> {selectedJadwal.hari}
                        </p>
                        <p className="text-sm text-green-900">
                          <strong>Jam:</strong> {selectedJadwal.jam_pelajaran}
                        </p>
                        <p className="text-sm text-green-900">
                          <strong>Kelas:</strong> {formatKelas(selectedJadwal.kelas)}
                        </p>
                        <p className="text-sm text-green-900">
                          <strong>Guru:</strong> {formatGuru(selectedJadwal.guru)}
                        </p>
                      </div>
                    )}

                    {/* Tombol Aksi */}
                    <div className="flex gap-2">
                      <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                        <FilePlus size={18} />
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                      </Button>
                        <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90" onClick={() => navigate(-1)}>
                          <CircleXIcon size={18} />
                          Batal
                        </Button>
                    </div>
                  </form>
                </div>
              </div>
            )
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditJadwalPelajaranSiswa;
