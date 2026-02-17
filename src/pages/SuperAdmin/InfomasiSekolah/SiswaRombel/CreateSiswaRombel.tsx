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
import type { DataSelectSiswaRombel, SiswaRombelCreateFormData } from "@/types/siswaRombel";

interface FormErrors {
  siswa_id: string[];
  rombel_id: string[];
  data: string[];
}

const CreateSiswaRombel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SiswaRombelCreateFormData>({
    siswa_id: "",
    rombel_id: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    siswa_id: [],
    rombel_id: [],
    data: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectSiswaRombel | null>(null);

  // Fetch data select — endpoint: /spa/siswa/data-select/rombel
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/siswa/data-select/rombel");
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

  // Group rombel berdasarkan jurusan untuk SelectGroup
  const rombelGrouped =
    selectData?.rombels?.reduce<Record<string, (typeof selectData.rombels)[0][]>>((acc, rombel) => {
      const key = rombel.jurusan || "Tanpa Jurusan";
      if (!acc[key]) acc[key] = [];
      acc[key].push(rombel);
      return acc;
    }, {}) || {};

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ siswa_id: [], rombel_id: [], data: [] });
    setLoading(true);

    try {
      // Body: { siswa_id: 5, rombel_id: 14 }
      const res = await api.post("/spa/siswa-rombel", {
        siswa_id: Number(formData.siswa_id),
        rombel_id: Number(formData.rombel_id),
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Siswa berhasil didaftarkan ke rombel.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-sekolah/siswa-rombel");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      if (errorStatus === 400 || errorStatus === 422) {
        // Tahun akademik tidak aktif
        if (errorData?.message?.toLowerCase().includes("tahun akademik")) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mendaftarkan siswa!",
            text: errorData.message,
          });
          setLoading(false);
          return;
        }

        // Duplikasi — "Duplikasi" sebagai message
        if (errorData?.message === "Duplikasi") {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mendaftarkan siswa!",
            text: errorData.data || "Siswa sudah terdaftar di rombel ini",
          });
          setLoading(false);
          return;
        }

        // Validation errors biasa (field kosong)
        if (errorData?.errors) {
          setErrors({ ...errors, ...errorData.errors });
        } else if (errorData?.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mendaftarkan siswa!",
            text: typeof errorData.data === "string" ? errorData.data : JSON.stringify(errorData.data),
          });
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
        <PageTitle title="Tambah Siswa Rombel" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Siswa Rombel</h1>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
                {/* Dropdown Siswa */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Siswa <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.siswa_id)} onValueChange={(v) => setFormData({ ...formData, siswa_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih siswa --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Siswa Aktif</SelectLabel>
                        {selectData?.siswa.map((siswa) => (
                          <SelectItem key={siswa.siswa_id} value={String(siswa.siswa_id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{siswa.nama_siswa}</span>
                              <span className="text-xs">
                                NISN: {siswa.nisn || "-"} • NIS: {siswa.nis || "-"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.siswa_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.siswa_id[0]}</p>}
                </div>

                {/* Dropdown Rombel — grouped by jurusan */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Rombel <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.rombel_id)} onValueChange={(v) => setFormData({ ...formData, rombel_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih rombel --" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(rombelGrouped).map(([jurusan, rombels]) => (
                        <SelectGroup key={jurusan}>
                          <SelectLabel className="font-bold text-primary">{jurusan}</SelectLabel>
                          {rombels.map((rombel) => (
                            <SelectItem key={rombel.rombel_id} value={String(rombel.rombel_id)}>
                              {rombel.nama_rombel}
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
                      Siswa akan didaftarkan ke rombel untuk tahun akademik yang sedang <strong>Aktif</strong>
                    </li>
                    <li>Satu siswa hanya dapat terdaftar di satu rombel per tahun akademik</li>
                    <li>Tidak ada fitur edit data rombel — jika salah, hapus dan tambah ulang</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-sekolah/siswa-rombel">
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

export default CreateSiswaRombel;
