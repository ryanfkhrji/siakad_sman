import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SiswaSelect, TahunAkademikSelect, PrestasiFormErrors } from "@/types/prestasiSiswa";

const CreatePrestasiSiswa = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [dataSiswa, setDataSiswa] = useState<SiswaSelect[]>([]);
  const [dataTahunAkademik, setDataTahunAkademik] = useState<TahunAkademikSelect[]>([]);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    siswa_id: searchParams.get("siswa_id") ?? "",
    tahun_akademik_id: "",
    prestasi_diraih: "",
  });

  const [errors, setErrors] = useState<PrestasiFormErrors>({
    siswa_id: [],
    tahun_akademik_id: [],
    prestasi_diraih: [],
  });

  // ── FETCH DATA SELECT ──────────────────────────────────────
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/siswa/prestasi");
        if (res.data.status === "success") {
          setDataSiswa(res.data.data.siswa);
          setDataTahunAkademik(res.data.data.tahun_akademik);

          // Default ke tahun akademik aktif
          const aktif = res.data.data.tahun_akademik.find((ta: TahunAkademikSelect) => ta.status_tahun_akademik === "aktif");
          if (aktif) {
            setFormData((prev) => ({ ...prev, tahun_akademik_id: aktif.tahun_akademik_id.toString() }));
          }
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data select.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };
    fetchSelect();
  }, []);

  // ── SUBMIT ────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ siswa_id: [], tahun_akademik_id: [], prestasi_diraih: [] });
    setLoading(true);

    try {
      const res = await api.post("/spa/prestasi", {
        siswa_id: Number(formData.siswa_id),
        tahun_akademik_id: Number(formData.tahun_akademik_id),
        prestasi_diraih: formData.prestasi_diraih,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Prestasi siswa berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });

        // Kembali ke histori siswa jika ada siswa_id
        if (formData.siswa_id) {
          navigate(`/superadmin/informasi-akademik/prestasi-siswa/histori/${formData.siswa_id}`);
        } else {
          navigate("/superadmin/informasi-akademik/prestasi-siswa");
        }
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response?.data?.message || "Tidak dapat terhubung ke server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const siswaSelected = dataSiswa.find((s) => s.siswa_id.toString() === formData.siswa_id);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Prestasi Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Prestasi Siswa</h1>

          {loadingSelect ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* PILIH SISWA */}
                <div className="space-y-2">
                  <label className="block font-semibold">
                    Pilih Siswa <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.siswa_id} onValueChange={(v) => setFormData({ ...formData, siswa_id: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Siswa --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Siswa</SelectLabel>
                        {dataSiswa.map((s) => (
                          <SelectItem key={s.siswa_id} value={s.siswa_id.toString()}>
                            {s.nama_siswa} — {s.nisn}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.siswa_id?.length > 0 && <p className="text-red-500 text-sm">{errors.siswa_id[0]}</p>}
                </div>

                {/* INFO SISWA (read only) */}
                {siswaSelected && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">NISN:</span>
                      <span className="font-medium">{siswaSelected.nisn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">NIS:</span>
                      <span className="font-medium">{siswaSelected.nis}</span>
                    </div>
                  </div>
                )}

                {/* TAHUN AKADEMIK */}
                <div className="space-y-2">
                  <label className="block font-semibold">
                    Tahun Akademik <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.tahun_akademik_id} onValueChange={(v) => setFormData({ ...formData, tahun_akademik_id: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Tahun Akademik --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tahun Akademik</SelectLabel>
                        {dataTahunAkademik.map((ta) => (
                          <SelectItem key={ta.tahun_akademik_id} value={ta.tahun_akademik_id.toString()}>
                            {ta.tahun_akademik}
                            {ta.status_tahun_akademik === "aktif" && " (Aktif)"}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.tahun_akademik_id?.length > 0 && <p className="text-red-500 text-sm">{errors.tahun_akademik_id[0]}</p>}
                </div>

                {/* PRESTASI DIRAIH */}
                <div className="space-y-2">
                  <label className="block font-semibold">
                    Prestasi Diraih <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.prestasi_diraih}
                    onChange={(e) => setFormData({ ...formData, prestasi_diraih: e.target.value })}
                    className="border p-2 w-full rounded h-32 resize-none"
                    placeholder="Contoh: Juara 1 Lomba Matematika Nasional"
                  />
                  {errors.prestasi_diraih?.length > 0 && <p className="text-red-500 text-sm">{errors.prestasi_diraih[0]}</p>}
                </div>

                {/* TOMBOL */}
                <div className="flex gap-2">
                  <Button disabled={loading} type="submit" className="flex gap-2">
                    {loading ? <Loader2Icon size={18} className="animate-spin" /> : <FilePlus size={18} />}
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/prestasi-siswa">
                    <Button type="button" className="bg-muted-foreground flex gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon size={18} /> Batal
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

export default CreatePrestasiSiswa;
