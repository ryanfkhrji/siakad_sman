import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRupiah } from "@/utils/formatRupiah";
import type { PembinaSelectItem, EkskulSelectItem, DataSelectPembinaEkskul, CreatePembinaEkskulRequest } from "@/types/pembinaEkskul";

interface FormErrors {
  pembina_id?: string[];
  ekstrakurikuler_id?: string[];
}

const CreatePembinaEkskul = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [pembinaList, setPembinaList] = useState<PembinaSelectItem[]>([]);
  const [ekskulList, setEkskulList] = useState<EkskulSelectItem[]>([]);

  const [selectedPembina, setSelectedPembina] = useState<string>("");
  const [selectedEkskul, setSelectedEkskul] = useState<string>("");

  // Preview pilihan
  const pembinaDetail = pembinaList.find((p) => String(p.pembina_id) === selectedPembina) ?? null;
  const ekskulDetail = ekskulList.find((e) => String(e.ekskul_id) === selectedEkskul) ?? null;

  // ── Fetch data select ─────────────────────────────────────────
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/spa/data-select/pembina/ekstrakurikuler");
        if (res.data.status === "success") {
          const data: DataSelectPembinaEkskul = res.data.data;
          setPembinaList(data.pembina);
          setEkskulList(data.ekskul);
        }
      } catch {
        Swal.fire({ icon: "error", title: "Error", text: "Gagal memuat data pilihan." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchSelect();
  }, []);

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: FormErrors = {};
    if (!selectedPembina) newErrors.pembina_id = ["Pembina wajib dipilih"];
    if (!selectedEkskul) newErrors.ekstrakurikuler_id = ["Ekstrakurikuler wajib dipilih"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      Swal.fire({ icon: "warning", title: "Validasi Gagal!", text: "Mohon lengkapi semua pilihan.", confirmButtonColor: "#EAB308" });
      return;
    }

    try {
      setIsSaving(true);
      const payload: CreatePembinaEkskulRequest = {
        pembina_id: Number(selectedPembina),
        ekstrakurikuler_id: Number(selectedEkskul),
      };
      const res = await api.post("/spa/pembina/ekstrakurikuler", payload);

      if (res.data.status === "success") {
        const data = res.data.data;
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          html: `<b>${data.pembina}</b> berhasil ditetapkan sebagai pembina <b>${data.ekstrakurikuler}</b> TA ${data.tahun_akademik}`,
          showConfirmButton: false,
          timer: 2500,
        });
        navigate("/superadmin/informasi-akademik/pembina-ekskul");
      }
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.errors?.data || err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Badge helpers ─────────────────────────────────────────────
  const roleBadge = (role: string) => (role === "guru" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800");

  const statusEkskulBadge = (s: string) => {
    if (s === "wajib") return "bg-red-100 text-red-800";
    if (s === "pilihan") return "bg-blue-100 text-blue-800";
    return "bg-purple-100 text-purple-800";
  };

  const statusLabel = (s: string) => (s === "wajib" ? "Wajib" : s === "pilihan" ? "Pilihan" : "Jurusan");

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tetapkan Pembina Ekstrakurikuler" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tetapkan Pembina Ekstrakurikuler</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-white rounded shadow p-5">
                <h2 className="font-semibold text-lg mb-4 text-gray-700">Form Penetapan</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Pilih Pembina */}
                  <div>
                    <label className="block font-semibold text-foreground mb-2">
                      Pembina <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedPembina} onValueChange={setSelectedPembina} disabled={isSaving}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Pembina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Daftar Pembina (Guru & Staff Aktif)</SelectLabel>
                          {pembinaList.map((p) => (
                            <SelectItem key={p.pembina_id} value={String(p.pembina_id)}>
                              {p.nama_pembina} ({p.role})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.pembina_id && <p className="text-red-500 text-sm mt-1">{errors.pembina_id[0]}</p>}
                  </div>

                  {/* Pilih Ekskul */}
                  <div>
                    <label className="block font-semibold text-foreground mb-2">
                      Ekstrakurikuler <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedEkskul} onValueChange={setSelectedEkskul} disabled={isSaving}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Ekstrakurikuler" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Ekskul Aktif</SelectLabel>
                          {ekskulList.map((e) => (
                            <SelectItem key={e.ekskul_id} value={String(e.ekskul_id)}>
                              {e.nama_ekskul} — {statusLabel(e.status)}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.ekstrakurikuler_id && <p className="text-red-500 text-sm mt-1">{errors.ekstrakurikuler_id[0]}</p>}
                  </div>

                  {/* Info: tahun akademik otomatis */}
                  <p className="text-sm text-gray-500 bg-blue-50 border border-blue-200 rounded px-3 py-2">
                    ℹ️ Penetapan pembina akan otomatis menggunakan <strong>tahun akademik aktif</strong>.
                  </p>

                  {/* Tombol */}
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={isSaving} className="bg-primary flex items-center gap-2">
                      {isSaving ? (
                        <>
                          <Loader2Icon className="animate-spin" size={18} /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <FilePlus size={18} /> Simpan
                        </>
                      )}
                    </Button>
                    <Link to="/superadmin/informasi-akademik/pembina-ekskul">
                      <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                        <CircleXIcon size={18} /> Batal
                      </Button>
                    </Link>
                  </div>
                </form>
              </div>

              {/* Preview Pilihan */}
              <div className="space-y-4">
                {/* Preview Pembina */}
                {pembinaDetail && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-blue-800 mb-3">👤 Pembina Terpilih</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-gray-600 font-medium">Nama</span>
                      <span className="font-semibold">{pembinaDetail.nama_pembina}</span>
                      <span className="text-gray-600 font-medium">NIP</span>
                      <span>{pembinaDetail.nip}</span>
                      <span className="text-gray-600 font-medium">NUPTK</span>
                      <span>{pembinaDetail.nuptk}</span>
                      <span className="text-gray-600 font-medium">Role</span>
                      <Badge className={`text-xs w-fit capitalize ${roleBadge(pembinaDetail.role)}`}>{pembinaDetail.role}</Badge>
                    </div>
                  </div>
                )}

                {/* Preview Ekskul */}
                {ekskulDetail && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 className="font-semibold text-purple-800 mb-3">🏆 Ekstrakurikuler Terpilih</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <span className="text-gray-600 font-medium">Nama</span>
                      <span className="font-semibold">{ekskulDetail.nama_ekskul}</span>
                      <span className="text-gray-600 font-medium">Anggaran</span>
                      <span>{formatRupiah(Number(ekskulDetail.anggaran))}</span>
                      <span className="text-gray-600 font-medium">Status Ekskul</span>
                      <Badge className={`text-xs w-fit ${statusEkskulBadge(ekskulDetail.status)}`}>{statusLabel(ekskulDetail.status)}</Badge>
                    </div>
                  </div>
                )}

                {/* Placeholder jika belum pilih */}
                {!pembinaDetail && !ekskulDetail && (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
                    <p className="text-sm">Pilih pembina dan ekstrakurikuler untuk melihat preview</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreatePembinaEkskul;
