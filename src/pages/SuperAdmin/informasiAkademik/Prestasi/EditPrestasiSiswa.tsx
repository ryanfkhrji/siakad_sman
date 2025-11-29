import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Siswa } from "@/types";

interface Jurusan {
  id: number;
  nama_jurusan: string;
}

interface FormErrors {
  siswa_id: string[];
  kelas_id: string[];
  jurusan_id: string[];
  prestasi_diraih: string[];
}

interface PrestasiResponse {
  siswa_id: string;
  kelas_id: string;
  jurusan_id: string;
  prestasi_diraih: string;
}

const EditPrestasiSiswa = () => {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
  const [dataJurusan, setDataJurusan] = useState<Jurusan[]>([]);
  const [loadingSiswa, setLoadingSiswa] = useState(true);
  const [loadingData, setLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    siswa_id: "",
    kelas_id: "",
    jurusan_id: "",
    prestasi_diraih: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    siswa_id: [],
    kelas_id: [],
    jurusan_id: [],
    prestasi_diraih: [],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch data siswa
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        setLoadingSiswa(true);
        const res = await api.get("/spa/siswa");
        if (res.data.status === "success") {
          setDataSiswa(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data siswa!",
          text: error.response?.data?.message || "Tidak dapat memuat data siswa",
        });
      } finally {
        setLoadingSiswa(false);
      }
    };

    fetchSiswa();
  }, []);

  // Fetch master jurusan
  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const res = await api.get("/spa/jurusan");
        if (res.data.status === "success") {
          setDataJurusan(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat jurusan!",
          text: error.response?.data?.message || "Tidak dapat memuat data jurusan",
        });
      }
    };

    fetchJurusan();
  }, []);

  // Fetch existing prestasi data
  useEffect(() => {
    if (!id || dataSiswa.length === 0 || dataJurusan.length === 0) return;

    const fetchPrestasiData = async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`/spa/prestasi/${id}`);

        if (res.data.status === "success") {
          const prestasiData: PrestasiResponse = res.data.data;

          // Cari siswa berdasarkan nama yang dikembalikan backend
          const siswaMatch = dataSiswa.find((s) => {
            return s.nama === prestasiData.siswa_id || prestasiData.siswa_id.includes(s.nama) || prestasiData.siswa_id.startsWith(s.nama);
          });

          if (siswaMatch) {
            // Extract kelas_id
            let kelasId = "";
            if (typeof siswaMatch.kelas === "object" && siswaMatch.kelas !== null) {
              kelasId = siswaMatch.kelas.id.toString();
            } else if (typeof siswaMatch.kelas === "string") {
              kelasId = siswaMatch.kelas;
            }

            // Extract jurusan_id dari master jurusan berdasarkan nama_jurusan siswa
            const jurusan = siswaMatch.nama_jurusan && dataJurusan.find((j) => j.nama_jurusan === siswaMatch.nama_jurusan);
            const jurusanId = jurusan ? jurusan.id.toString() : "";

            setFormData({
              siswa_id: siswaMatch.id.toString(),
              kelas_id: kelasId,
              jurusan_id: jurusanId,
              prestasi_diraih: prestasiData.prestasi_diraih,
            });
          } else {
            setFormData({
              siswa_id: "",
              kelas_id: "",
              jurusan_id: "",
              prestasi_diraih: prestasiData.prestasi_diraih,
            });

            Swal.fire({
              icon: "warning",
              title: "Perhatian!",
              text: "Siswa tidak ditemukan dalam database. Silakan pilih siswa kembali.",
            });
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Data tidak ditemukan!",
            text: "Prestasi siswa yang Anda cari tidak ditemukan.",
          }).then(() => {
            navigate("/superadmin/kesiswaan/prestasi-siswa");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Tidak dapat memuat data prestasi siswa",
          });
        }
      } finally {
        setLoadingData(false);
      }
    };

    fetchPrestasiData();
  }, [id, dataSiswa, dataJurusan, navigate]);

  // Handle siswa selection - SAMA SEPERTI CREATE
  const handleSiswaChange = (siswaId: string) => {
    const siswa = dataSiswa.find((s) => s.id.toString() === siswaId);
    if (!siswa) return;

    // Ambil kelas_id dari object / string / null
    const kelas_id = typeof siswa.kelas === "object" && siswa.kelas !== null ? siswa.kelas.id.toString() : typeof siswa.kelas === "string" ? siswa.kelas : "";

    // Ambil jurusan_id dari master jurusan berdasarkan nama_jurusan
    const jurusan = siswa.nama_jurusan && dataJurusan.find((j) => j.nama_jurusan === siswa.nama_jurusan);
    const jurusan_id = jurusan ? jurusan.id.toString() : "";

    setFormData({
      ...formData,
      siswa_id: siswaId,
      kelas_id: kelas_id,
      jurusan_id: jurusan_id,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      siswa_id: [],
      kelas_id: [],
      jurusan_id: [],
      prestasi_diraih: [],
    });

    setLoading(true);

    try {
      const res = await api.put(`/spa/prestasi/${id}`, formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data prestasi siswa berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-akademik/prestasi-siswa");
      }
    } catch (error: any) {
      // HANDLE VALIDATION ERROR 422
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setLoading(false);
        return;
      }

      // HANDLE NOT FOUND 404
      if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: error.response.data.message || "Prestasi siswa tidak ditemukan.",
        });
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: error.response?.data?.message || "Tidak dapat terhubung ke server.",
      });
    }

    setLoading(false);
  };

  // Get display values - SAMA SEPERTI CREATE
  const siswaSelected = dataSiswa.find((s) => s.id.toString() === formData.siswa_id);

  const namaKelas = typeof siswaSelected?.kelas === "object" ? siswaSelected.kelas?.nama_kelas : typeof siswaSelected?.kelas === "string" ? siswaSelected.kelas : "-";

  const namaJurusan = siswaSelected?.nama_jurusan ?? "-";

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Edit Prestasi Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Prestasi Siswa</h1>

          {loadingData ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={32} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded shadow p-5">
                <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                  {/* Pilih Siswa */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-foreground">
                      Pilih Siswa <span className="text-red-500">*</span>
                    </label>

                    {loadingSiswa ? (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Loader2Icon className="animate-spin" size={18} />
                        Memuat siswa...
                      </div>
                    ) : (
                      <Select value={formData.siswa_id} onValueChange={handleSiswaChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="-- Pilih Siswa --" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Pilih Siswa</SelectLabel>
                            {dataSiswa.map((siswa) => (
                              <SelectItem key={siswa.id} value={siswa.id.toString()}>
                                {siswa.nama} - {siswa.nisn}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}

                    {errors.siswa_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.siswa_id[0]}</p>}
                  </div>

                  {/* Kelas (Auto-filled, Read-only) */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-foreground">Kelas</label>
                    <input type="text" value={namaKelas as string | undefined} readOnly className="border p-2 w-full rounded bg-gray-50 text-gray-600 cursor-not-allowed" placeholder="Otomatis terisi setelah memilih siswa" />
                    {errors.kelas_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kelas_id[0]}</p>}
                  </div>

                  {/* Jurusan (Auto-filled, Read-only) */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-foreground">Jurusan</label>
                    <input type="text" value={namaJurusan} readOnly className="border p-2 w-full rounded bg-gray-50 text-gray-600 cursor-not-allowed" placeholder="Otomatis terisi setelah memilih siswa" />
                    {errors.jurusan_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jurusan_id[0]}</p>}
                  </div>

                  {/* Prestasi Diraih */}
                  <div className="space-y-2">
                    <label className="block font-semibold text-foreground">
                      Prestasi Diraih <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Contoh: Juara 1 Lomba Matematika Tingkat Nasional"
                      value={formData.prestasi_diraih}
                      onChange={(e) => setFormData({ ...formData, prestasi_diraih: e.target.value })}
                      className="border p-2 w-full rounded h-32 resize-none"
                    ></textarea>
                    {errors.prestasi_diraih?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.prestasi_diraih[0]}</p>}
                  </div>

                  {/* Tombol */}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                      <SaveIcon size={18} />
                      {loading ? "Menyimpan..." : "Simpan Perubahan"}
                    </Button>
                    <Link to="/superadmin/informasi-akademik/prestasi-siswa">
                      <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                        <CircleXIcon size={18} />
                        Batal
                      </Button>
                    </Link>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditPrestasiSiswa;
