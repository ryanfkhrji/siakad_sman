import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePenLine, Loader2Icon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { DataSelectAtpMaster } from "@/types/alurTujuanPembelajaranMaster";

interface FormErrors {
  kompetensi_id: string[];
  urutan: string[];
  tujuan_pembelajaran: string[];
  status: string[];
  data: string[];
}

const EditAtpMaster = () => {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    kompetensi_id: "",
    urutan: "",
    tujuan_pembelajaran: "",
    status: "aktif",
  });

  const [errors, setErrors] = useState<FormErrors>({
    kompetensi_id: [],
    urutan: [],
    tujuan_pembelajaran: [],
    status: [],
    data: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [initialStatus, setInitialStatus] = useState("");
  const [selectData, setSelectData] = useState<DataSelectAtpMaster[]>([]);

  // AMBIL DATA LAMA dan DATA SELECT
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);
        setLoadingSelect(true);

        const [resDetail, resSelect] = await Promise.all([api.get(`/spa/atp-master/${id}`), api.get("/spa/data-select/atp-master")]);

        // Set select data
        if (resSelect.data.status === "success") {
          setSelectData(resSelect.data.data);
        }

        // Set form data dari detail
        if (resDetail.data.status === "success") {
          const detail = resDetail.data.data;

          setFormData({
            kompetensi_id: String(detail.kompetensi.kompetensi_id),
            urutan: String(detail.kompetensi.atp_master.urutan),
            tujuan_pembelajaran: detail.kompetensi.atp_master.tujuan_pembelajaran,
            status: detail.kompetensi.atp_master.status_atp,
          });

          setInitialStatus(detail.kompetensi.atp_master.status_atp);
        }

        setLoadingData(false);
        setLoadingSelect(false);
      } catch (error: any) {
        if (error.response?.status === 404) {
          Swal.fire({
            icon: "error",
            title: "Data tidak ditemukan!",
            text: "Data ATP Master tidak ditemukan.",
          });
          navigate("/superadmin/informasi-akademik/alur-tujuan-pembelajaran");
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Terjadi kesalahan saat mengambil data.",
          });
        }
        setLoadingData(false);
        setLoadingSelect(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  // SUBMIT EDIT
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      kompetensi_id: [],
      urutan: [],
      tujuan_pembelajaran: [],
      status: [],
      data: [],
    });

    setLoading(true);

    try {
      const res = await api.put(`/spa/atp-master/${id}`, {
        kompetensi_id: Number(formData.kompetensi_id),
        urutan: Number(formData.urutan),
        tujuan_pembelajaran: formData.tujuan_pembelajaran,
        status: formData.status,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data ATP Master berhasil diperbarui.",
          timer: 1800,
          showConfirmButton: false,
        });

        navigate("/superadmin/informasi-akademik/alur-tujuan-pembelajaran");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // HANDLE VALIDATION ERROR 422
      if (errorStatus === 422 && errorData?.errors) {
        // Error data khusus (duplikasi urutan)
        if (errorData.errors.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah data!",
            text: Array.isArray(errorData.errors.data) ? errorData.errors.data[0] : errorData.errors.data,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // Handle validation errors biasa
        setErrors(errorData.errors);
        setLoading(false);
        return;
      }

      // Error 404
      if (errorStatus === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: errorData?.message || "Data tidak ditemukan.",
        });
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

  if (loadingData || loadingSelect) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Edit ATP Master" />

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
        <PageTitle title="Edit ATP Master" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Alur Tujuan Pembelajaran Master</h1>

          <div className="bg-white rounded shadow p-5">
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

              {/* Status */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Status <span className="text-red-500">*</span>
                </label>

                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih status --" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Status</SelectLabel>
                      <SelectItem value="aktif">Aktif</SelectItem>
                      <SelectItem value="arsip">Arsip</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.status?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
              </div>

              {/* Info perubahan status */}
              {formData.status !== initialStatus && (
                <div className={`${formData.status === "arsip" ? "bg-orange-50 border-orange-200 text-orange-800" : "bg-blue-50 border-blue-200 text-blue-800"} border rounded p-3 text-sm`}>
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  {formData.status === "arsip" ? (
                    <p>
                      Status akan diubah menjadi <strong>Arsip</strong>. ATP yang diarsipkan dapat diubah kembali ke aktif.
                    </p>
                  ) : (
                    <p>
                      Status akan diubah menjadi <strong>Aktif</strong>.
                    </p>
                  )}
                </div>
              )}

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePenLine size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>

                <Link to="/superadmin/informasi-akademik/alur-tujuan-pembelajaran">
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
};

export default EditAtpMaster;
