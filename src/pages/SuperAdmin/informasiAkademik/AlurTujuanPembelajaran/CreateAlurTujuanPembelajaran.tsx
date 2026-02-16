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
import type { DataSelectAtpMaster } from "@/types/alurTujuanPembelajaranMaster";

interface FormErrors {
  kompetensi_id: string[];
  urutan: string[];
  tujuan_pembelajaran: string[];
  data: string[];
}

const CreateAtpMaster = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    kompetensi_id: "",
    urutan: "",
    tujuan_pembelajaran: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    kompetensi_id: [],
    urutan: [],
    tujuan_pembelajaran: [],
    data: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectAtpMaster[]>([]);

  // Fetch data select
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/atp-master");

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
      kompetensi_id: [],
      urutan: [],
      tujuan_pembelajaran: [],
      data: [],
    });

    setLoading(true);

    try {
      const res = await api.post("/spa/atp-master", {
        kompetensi_id: Number(formData.kompetensi_id),
        urutan: Number(formData.urutan),
        tujuan_pembelajaran: formData.tujuan_pembelajaran,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data ATP Master berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-akademik/atp-alur-tujuan-pembelajaran");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // HANDLE ERROR 400 atau 422 (Bad Request / Validation Error)
      if (errorStatus === 400 || errorStatus === 422) {
        // Error data khusus (duplikasi urutan)
        if (errorData?.errors?.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat ATP Master!",
            text: Array.isArray(errorData.errors.data) ? errorData.errors.data[0] : errorData.errors.data,
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

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah ATP Master" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Alur Tujuan Pembelajaran Master</h1>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
                {/* Kompetensi */}
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Kompetensi <span className="text-red-500">*</span>
                  </label>

                  <Select value={formData.kompetensi_id} onValueChange={(value) => setFormData({ ...formData, kompetensi_id: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih kompetensi --" />
                    </SelectTrigger>

                    <SelectContent>
                      {selectData.map((jenisGroup) => (
                        <SelectGroup key={jenisGroup.jenis}>
                          <SelectLabel className="font-bold text-primary">{jenisGroup.jenis === "KD" ? "Kompetensi Dasar (KD)" : "Capaian Pembelajaran (CP)"}</SelectLabel>
                          {jenisGroup.daftar_kompetensi.map((komp) => (
                            <SelectItem key={komp.kompetensi_id} value={String(komp.kompetensi_id)}>
                              <div className="flex flex-col">
                                <span className="font-medium">{komp.judul_kompetensi}</span>
                                <span className="text-xs">
                                  {komp.mata_pelajaran} • {komp.kurikulum}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.kompetensi_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kompetensi_id[0]}</p>}
                </div>

                {/* Urutan */}
                <div className="mb-6">
                  <label className="block font-semibold">
                    Urutan <span className="text-red-500">*</span>
                  </label>
                  <input type="number" min="1" placeholder="contoh: 1" value={formData.urutan} onChange={(e) => setFormData({ ...formData, urutan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.urutan?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.urutan[0]}</p>}
                </div>

                {/* Tujuan Pembelajaran */}
                <div className="mb-6">
                  <label className="block font-semibold">
                    Tujuan Pembelajaran <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Contoh: Memahami sifat-sifat bilangan real dan operasinya."
                    value={formData.tujuan_pembelajaran}
                    onChange={(e) => setFormData({ ...formData, tujuan_pembelajaran: e.target.value })}
                    className="border p-2 w-full mt-2 rounded h-32 resize-none"
                  ></textarea>
                  {errors.tujuan_pembelajaran?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tujuan_pembelajaran[0]}</p>}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Status otomatis akan menjadi <strong>Aktif</strong>
                    </li>
                    <li>Pastikan urutan yang dipilih belum digunakan untuk kompetensi yang sama</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/alur-tujuan-pembelajaran">
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

export default CreateAtpMaster;
