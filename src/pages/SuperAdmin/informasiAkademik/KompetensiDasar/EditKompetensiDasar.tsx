import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, Loader2Icon, Save } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MataPelajaran {
  id: number;
  nama_pelajaran: string;
  status?: string;
}

interface Kurikulum {
  id: number;
  nama_kurikulum: string;
  tahun_berlaku?: string;
  status?: string;
  deskripsi?: string;
}

interface FormErrors {
  mata_pelajaran_id: string[];
  kurikulum_id: string[];
  judul_kompetensi_dasar: string[];
  deskripsi: string[];
}

const EditKompetensiDasar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    mata_pelajaran_id: 0,
    kurikulum_id: 0,
    judul_kompetensi_dasar: "",
    deskripsi: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    mata_pelajaran_id: [],
    kurikulum_id: [],
    judul_kompetensi_dasar: [],
    deskripsi: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Data dropdown
  const [listMapel, setListMapel] = useState<MataPelajaran[]>([]);
  const [listKurikulum, setListKurikulum] = useState<Kurikulum[]>([]);

  // Fetch dropdown data dan data yang akan diedit
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Fetch dropdown options dan detail data
        const [resMapel, resKurikulum, resDetail] = await Promise.all([api.get("/spa/mata-pelajaran"), api.get("/spa/kurikulum"), api.get(`/spa/kompetensi-dasar/${id}`)]);

        if (!mounted) return;

        let mapelData: MataPelajaran[] = [];
        let kurikulumData: Kurikulum[] = [];

        // Set dropdown data
        if (resMapel.data?.status === "success" && Array.isArray(resMapel.data.data)) {
          mapelData = resMapel.data.data;
          setListMapel(mapelData);
        }

        if (resKurikulum.data?.status === "success" && Array.isArray(resKurikulum.data.data)) {
          kurikulumData = resKurikulum.data.data;
          setListKurikulum(kurikulumData);
        }

        // Set form data dari detail
        if (resDetail.data?.status === "success" && resDetail.data.data) {
          const detail = resDetail.data.data;

          // Cari ID asli dari nama yang dikembalikan backend
          const mapelId = mapelData.find((m) => m.nama_pelajaran === detail.mata_pelajaran_id)?.id || 0;
          const kurikulumId = kurikulumData.find((k) => k.nama_kurikulum === detail.kurikulum_id)?.id || 0;

          setFormData({
            mata_pelajaran_id: mapelId,
            kurikulum_id: kurikulumId,
            judul_kompetensi_dasar: detail.judul_kompetensi_dasar || "",
            deskripsi: detail.deskripsi || "",
          });
        }

        setLoadingData(false);
      } catch (err: any) {
        console.error("fetchData error:", err);

        if (err.response?.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Data Tidak Ditemukan",
            text: "Data kompetensi dasar yang Anda cari tidak ditemukan.",
          }).then(() => {
            navigate("/superadmin/informasi-akademik/kompetensi-dasar");
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: "Tidak dapat memuat data. Cek koneksi atau server.",
          });
        }

        setLoadingData(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const resetErrors = () =>
    setErrors({
      mata_pelajaran_id: [],
      kurikulum_id: [],
      judul_kompetensi_dasar: [],
      deskripsi: [],
    });

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    resetErrors();
    setLoading(true);

    try {
      const res = await api.put(`/spa/kompetensi-dasar/${id}`, formData);

      if (res.data?.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.data?.message || "Data kompetensi dasar berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1500,
        });

        navigate("/superadmin/informasi-akademik/kompetensi-dasar");
        return;
      }

      // Jika backend mengembalikan status lain
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: res.data?.message || "Terjadi kesalahan saat menyimpan data.",
      });
      setLoading(false);
    } catch (error: any) {
      // Jika error validasi atau duplikasi (422)
      if (error.response?.status === 422) {
        const backend = error.response.data;
        const backendData = backend.data ?? {};
        const backendMessage = backend.message ?? "";

        // --- 1. Cek error duplikasi unique (dari backend: data.unique) ---
        if (Array.isArray(backendData.unique) && backendData.unique.length > 0) {
          Swal.fire({
            icon: "warning",
            title: "Data Sudah Ada",
            text: backendData.unique[0],
          });
          setLoading(false);
          return;
        }

        // --- 2. Cek message duplikasi di backend.message ---
        if (backendMessage && backendMessage.toLowerCase().includes("duplikasi")) {
          Swal.fire({
            icon: "warning",
            title: backendMessage,
            text: backendData.unique?.[0] || "Data dengan kombinasi ini sudah terdaftar.",
          });
          setLoading(false);
          return;
        }

        // --- 3. Error validasi field (tampilkan di bawah input) ---
        const hasFieldErrors = backendData.mata_pelajaran_id?.length > 0 || backendData.kurikulum_id?.length > 0 || backendData.judul_kompetensi_dasar?.length > 0 || backendData.deskripsi?.length > 0;

        if (hasFieldErrors) {
          setErrors({
            mata_pelajaran_id: backendData.mata_pelajaran_id ?? [],
            kurikulum_id: backendData.kurikulum_id ?? [],
            judul_kompetensi_dasar: backendData.judul_kompetensi_dasar ?? [],
            deskripsi: backendData.deskripsi ?? [],
          });

          Swal.fire({
            icon: "error",
            title: "Validasi Gagal",
            text: backendMessage || "Periksa kembali form Anda.",
          });
          setLoading(false);
          return;
        }

        // Fallback untuk error 422 lainnya
        Swal.fire({
          icon: "error",
          title: "Gagal Menyimpan",
          text: backendMessage || "Terjadi kesalahan validasi.",
        });
        setLoading(false);
        return;
      }

      // Error 404 - Data tidak ditemukan
      if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Data Tidak Ditemukan",
          text: error.response.data?.message || "Data yang Anda cari tidak ditemukan.",
        }).then(() => {
          navigate("/superadmin/informasi-akademik/kompetensi-dasar");
        });
        setLoading(false);
        return;
      }

      // Error selain 422 dan 404 (500, network error, dll)
      console.error("Submit error:", error);
      Swal.fire({
        icon: "error",
        title: "Koneksi Gagal",
        text: error.response?.data?.message || "Tidak dapat terhubung ke server. Cek koneksi internet Anda.",
      });
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Edit Kompetensi Dasar" />

          <div className="mx-auto p-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>

          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Kompetensi Dasar" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Kompetensi Dasar</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6  max-w-lg" onSubmit={handleSubmit}>
              {/* Mata Pelajaran */}
              <div>
                <label className="block font-semibold">Mata Pelajaran</label>

                <Select value={String(formData.mata_pelajaran_id)} onValueChange={(value) => setFormData({ ...formData, mata_pelajaran_id: Number(value) })}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih mata pelajaran --" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Mata Pelajaran</SelectLabel>

                      {listMapel.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Tidak ada mata pelajaran</div>
                      ) : (
                        listMapel.map((m) => (
                          <SelectItem key={m.id} value={String(m.id)}>
                            {m.nama_pelajaran}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.mata_pelajaran_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.mata_pelajaran_id[0]}</p>}
              </div>

              {/* Kurikulum */}
              <div>
                <label className="block font-semibold">Kurikulum</label>

                <Select value={String(formData.kurikulum_id)} onValueChange={(value) => setFormData({ ...formData, kurikulum_id: Number(value) })}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih kurikulum --" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Kurikulum</SelectLabel>

                      {listKurikulum.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-muted-foreground">Tidak ada kurikulum</div>
                      ) : (
                        listKurikulum.map((k) => (
                          <SelectItem key={k.id} value={String(k.id)}>
                            {k.nama_kurikulum}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.kurikulum_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kurikulum_id[0]}</p>}
              </div>

              {/* Judul Kompetensi Dasar */}
              <div>
                <label className="block font-semibold">Judul Kompetensi Dasar</label>
                <input
                  type="text"
                  placeholder="cth: Pemahaman Dasar Konsep Bilangan"
                  value={formData.judul_kompetensi_dasar}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      judul_kompetensi_dasar: e.target.value,
                    })
                  }
                  className="border p-2 w-full mt-2 rounded"
                />
                {errors.judul_kompetensi_dasar?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.judul_kompetensi_dasar[0]}</p>}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block font-semibold">Deskripsi</label>
                <textarea placeholder="Deskripsi kompetensi dasar..." value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="border p-2 w-full mt-2 rounded h-32 resize-none" />
                {errors.deskripsi?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.deskripsi[0]}</p>}
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <Save size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>

                <Link to="/superadmin/informasi-akademik/kompetensi-dasar">
                  <Button type="button" className="bg-muted-foreground hover:bg-muted-foreground/90 flex items-center gap-2">
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
};

export default EditKompetensiDasar;
