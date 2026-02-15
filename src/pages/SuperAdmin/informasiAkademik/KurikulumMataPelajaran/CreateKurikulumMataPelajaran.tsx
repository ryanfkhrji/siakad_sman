import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { DataSelectKurmap, KurmapCreateFormData } from "@/types/kurikulumMataPelajaran";

interface FormErrors {
  kurikulum_id: string[];
  mata_pelajaran_id: string[];
  tingkat: string[];
  nilai_kkm: string[];
  status_mata_pelajaran: string[];
  pesan: string[];
}

const CreateKurikulumMataPelajaran = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectKurmap | null>(null);

  const [formData, setFormData] = useState<KurmapCreateFormData>({
    kurikulum_id: "",
    mata_pelajaran_id: "",
    tingkat: "",
    nilai_kkm: "",
    status_mata_pelajaran: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    kurikulum_id: [],
    mata_pelajaran_id: [],
    tingkat: [],
    nilai_kkm: [],
    status_mata_pelajaran: [],
    pesan: [],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch data untuk select
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/kurmap");
        if (res.data.status === "success") {
          setSelectData(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data untuk form.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };

    fetchSelectData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      kurikulum_id: [],
      mata_pelajaran_id: [],
      tingkat: [],
      nilai_kkm: [],
      status_mata_pelajaran: [],
      pesan: [],
    });

    setLoading(true);

    try {
      const res = await api.post("/spa/kurikulum-mata-pelajaran", {
        kurikulum_id: Number(formData.kurikulum_id),
        mata_pelajaran_id: Number(formData.mata_pelajaran_id),
        tingkat: Number(formData.tingkat),
        nilai_kkm: Number(formData.nilai_kkm),
        status_mata_pelajaran: formData.status_mata_pelajaran,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kurikulum mata pelajaran berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-akademik/kurikulum-mata-pelajaran");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // HANDLE ERROR 400 atau 422 (Bad Request / Validation Error)
      if (errorStatus === 400 || errorStatus === 422) {
        // Jika ada error pesan khusus (duplikasi)
        if (errorData?.errors?.pesan) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat data!",
            text: Array.isArray(errorData.errors.pesan) ? errorData.errors.pesan[0] : errorData.errors.pesan,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // Handle validation errors biasa
        if (errorData?.errors) {
          setErrors(errorData.errors);
        }

        setLoading(false);
        return;
      }

      // Handle error lainnya (500, network error, dll)
      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: errorData?.message || "Tidak dapat terhubung ke server.",
      });
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Tambah Kurikulum Mata Pelajaran" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Kurikulum Mata Pelajaran</h1>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Kurikulum <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.kurikulum_id)} onValueChange={(value) => setFormData({ ...formData, kurikulum_id: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih kurikulum --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Kurikulum</SelectLabel>
                        {selectData?.kurikulum.map((k) => (
                          <SelectItem key={k.kurikulum_id} value={String(k.kurikulum_id)}>
                            {k.nama_kurikulum} ({k.tipe_kurikulum}) - {k.status_kurikulum}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.kurikulum_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kurikulum_id[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.mata_pelajaran_id)} onValueChange={(value) => setFormData({ ...formData, mata_pelajaran_id: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih mata pelajaran --" />
                    </SelectTrigger>

                    <SelectContent>
                      {selectData?.mata_pelajaran.map((kelompok) => (
                        <SelectGroup key={kelompok.kelompok}>
                          <SelectLabel className="font-bold text-primary capitalize">{kelompok.kelompok}</SelectLabel>
                          {kelompok.mata_pelajaran.map((mapel) => (
                            <SelectItem key={mapel.mata_pelajaran_id} value={String(mapel.mata_pelajaran_id)}>
                              {mapel.nama_pelajaran} ({mapel.status})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.mata_pelajaran_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.mata_pelajaran_id[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Tingkat (Kelas) <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.tingkat)} onValueChange={(value) => setFormData({ ...formData, tingkat: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih tingkat --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Tingkat</SelectLabel>
                        <SelectItem value="10">Kelas 10</SelectItem>
                        <SelectItem value="11">Kelas 11</SelectItem>
                        <SelectItem value="12">Kelas 12</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.tingkat?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tingkat[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold">
                    Nilai KKM <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    placeholder="contoh: 75"
                    value={formData.nilai_kkm}
                    onChange={(e) => setFormData({ ...formData, nilai_kkm: e.target.value })}
                    className="border p-2 w-full mt-2 rounded"
                  />
                  {errors.nilai_kkm?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nilai_kkm[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Status Mata Pelajaran <span className="text-red-500">*</span>
                  </label>

                  <Select value={formData.status_mata_pelajaran} onValueChange={(value) => setFormData({ ...formData, status_mata_pelajaran: value as any })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih status mata pelajaran --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Status</SelectLabel>
                        <SelectItem value="wajib">Wajib</SelectItem>
                        <SelectItem value="pilihan">Pilihan</SelectItem>
                        <SelectItem value="jurusan">Jurusan</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.status_mata_pelajaran?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status_mata_pelajaran[0]}</p>}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Status kurikulum mata pelajaran otomatis akan menjadi <strong>Aktif</strong>
                    </li>
                    <li>Pastikan kombinasi kurikulum, mata pelajaran, dan tingkat belum ada</li>
                    <li>Nilai KKM harus berupa angka antara 0-100</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/kurikulum-mata-pelajaran">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon size={18} />
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateKurikulumMataPelajaran;