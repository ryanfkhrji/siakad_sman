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
import type { DataSelectWaliRombel, RombelForSelect } from "@/types/waliRombel";

interface FormErrors {
  wali_rombel_id: string[];
  rombel_id: string[];
  tahun_akademik: string[];
  data: string[];
}

const CreateWaliRombel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    wali_rombel_id: "",
    rombel_id: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    wali_rombel_id: [],
    rombel_id: [],
    tahun_akademik: [],
    data: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectWaliRombel | null>(null);

  // Fetch data select — endpoint: /spa/data-select/wali-rombel
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/wali-rombel");
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

  // Group rombel by tingkat untuk SelectGroup
  const rombelGrouped = (selectData?.rombel ?? []).reduce<Record<number, RombelForSelect[]>>((acc, rombel) => {
    const t = rombel.tingkat;
    if (!acc[t]) acc[t] = [];
    acc[t].push(rombel);
    return acc;
  }, {});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ wali_rombel_id: [], rombel_id: [], tahun_akademik: [], data: [] });
    setLoading(true);

    try {
      // Body: { wali_rombel_id: 20, rombel_id: 5 }
      const res = await api.post("/spa/wali-rombel", {
        wali_rombel_id: Number(formData.wali_rombel_id),
        rombel_id: Number(formData.rombel_id),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data wali rombel berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-sekolah/wali-rombel");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      if (errorStatus === 400 || errorStatus === 422) {
        // Tahun akademik tidak aktif
        if (errorData?.errors?.tahun_akademik) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat wali rombel!",
            text: Array.isArray(errorData.errors.tahun_akademik) ? errorData.errors.tahun_akademik[0] : errorData.errors.tahun_akademik,
          });
          setLoading(false);
          return;
        }

        // Duplikasi / guru sudah jadi wali / rombel sudah punya wali
        if (errorData?.errors?.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat wali rombel!",
            text: Array.isArray(errorData.errors.data) ? errorData.errors.data[0] : errorData.errors.data,
          });
          setLoading(false);
          return;
        }

        // Role bukan guru
        if (errorData?.errors?.wali_rombel_id) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat wali rombel!",
            text: Array.isArray(errorData.errors.wali_rombel_id) ? errorData.errors.wali_rombel_id[0] : errorData.errors.wali_rombel_id,
          });
          setLoading(false);
          return;
        }

        // Validation error biasa (field kosong, dll)
        if (errorData?.errors) {
          setErrors({ ...errors, ...errorData.errors });
        }
        setLoading(false);
        return;
      }

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

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Wali Rombel" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Wali Rombel</h1>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
                {/* Dropdown Guru */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Guru (Wali Kelas) <span className="text-red-500">*</span>
                  </label>

                  <Select value={formData.wali_rombel_id} onValueChange={(v) => setFormData({ ...formData, wali_rombel_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih guru --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Guru Aktif</SelectLabel>
                        {selectData?.guru.map((guru) => (
                          <SelectItem key={guru.guru_id} value={String(guru.guru_id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{guru.nama_guru}</span>
                              <span className="text-xs">
                                NIP: {guru.nip || "-"} • NUPTK: {guru.nuptk || "-"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.wali_rombel_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.wali_rombel_id[0]}</p>}
                </div>

                {/* Dropdown Rombel — grouped by tingkat */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Rombel <span className="text-red-500">*</span>
                  </label>

                  <Select value={formData.rombel_id} onValueChange={(v) => setFormData({ ...formData, rombel_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih rombel --" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(rombelGrouped)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([tingkat, rombels]) => (
                          <SelectGroup key={tingkat}>
                            <SelectLabel className="font-bold text-primary">Tingkat {tingkat}</SelectLabel>
                            {rombels.map((rombel) => (
                              <SelectItem key={rombel.rombel_id} value={String(rombel.rombel_id)}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{rombel.nama_rombel}</span>
                                  <span className="text-xs text-muted-foreground">
                                    Kelas {rombel.kelas} • {rombel.jurusan || "Tanpa Jurusan"}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                    </SelectContent>
                  </Select>

                  {errors.rombel_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.rombel_id[0]}</p>}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Wali rombel akan ditambahkan untuk tahun akademik yang sedang <strong>Aktif</strong>
                    </li>
                    <li>Satu guru hanya dapat menjadi wali satu rombel per tahun akademik</li>
                    <li>Satu rombel hanya dapat memiliki satu wali per tahun akademik</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-sekolah/wali-rombel">
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

export default CreateWaliRombel;
