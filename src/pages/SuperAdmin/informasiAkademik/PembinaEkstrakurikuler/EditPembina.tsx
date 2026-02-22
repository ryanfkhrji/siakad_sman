import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import {
  Select, SelectContent, SelectGroup, SelectItem,
  SelectLabel, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type {
  PembinaSelectItem, DataSelectPembinaEkskul, UpdatePembinaEkskulRequest,
} from "@/types/pembinaEkskul";

// ── State yang dikirim dari DataPembinaEkskul (via router state) ──
interface PembinaNavigationState {
  ekskul_id: number;
  nama_ekskul: string;
  pembina_id: number;
  nama_pembina: string;
  tahun_akademik: string;
  tahun_akademik_id: number;
  status_tahun_akademik: "aktif" | "arsip";
}

interface FormErrors {
  pembina_id?: string[];
}

// ─────────────────────────────────────────────────────────────────
// Catatan alur:
// Edit pembina ekskul = ganti pembina pada pivot_id tertentu.
// Pivot_id didapat dari GET detail ekskul (periode → anggota.pembina.pembina_pivot_id).
// Karena response histori per pembina tidak mengembalikan pivot_id secara langsung,
// kita fetch detail ekskul untuk mendapatkan pembina_pivot_id sesuai tahun_akademik_id.
// ─────────────────────────────────────────────────────────────────

const EditPembinaEkskul = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  const state = location.state?.pembinaData as PembinaNavigationState | null;

  const [isCollapsed,   setIsCollapsed]   = useState(false);
  const [isLoading,     setIsLoading]     = useState(true);
  const [isSaving,      setIsSaving]      = useState(false);
  const [errors,        setErrors]        = useState<FormErrors>({});

  const [pembinaList,   setPembinaList]   = useState<PembinaSelectItem[]>([]);
  const [pivotId,       setPivotId]       = useState<number | null>(null);
  const [selectedPembina, setSelectedPembina] = useState<string>("");

  const pembinaDetail = pembinaList.find((p) => String(p.pembina_id) === selectedPembina) ?? null;

  // ── Guard ─────────────────────────────────────────────────────
  if (!state) {
    Swal.fire({
      icon: "error",
      title: "Data Tidak Ditemukan",
      text: "Silakan kembali ke halaman sebelumnya",
    }).then(() => navigate("/superadmin/informasi-akademik/pembina-ekskul"));

    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <div className="flex items-center justify-center h-screen">
            <Loader2Icon className="animate-spin" size={32} />
          </div>
        </main>
      </SidebarProvider>
    );
  }

  // ── Fetch: data select + pivot_id dari detail ekskul ─────────
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);

        // Paralel: data-select + detail ekskul (untuk dapatkan pembina_pivot_id)
        const [resSelect, resEkskul] = await Promise.all([
          api.get("/spa/data-select/pembina/ekstrakurikuler"),
          api.get(`/spa/ekstrakurikuler/${state.ekskul_id}`),
        ]);

        // Data select → list pembina
        if (resSelect.data.status === "success") {
          const data: DataSelectPembinaEkskul = resSelect.data.data;
          setPembinaList(data.pembina);
        }

        // Detail ekskul → cari pivot_id pembina sesuai tahun_akademik_id
        if (resEkskul.data.data?.[0]) {
          const ekskulDetail = resEkskul.data.data[0];
          const periode = ekskulDetail.periode?.find(
            (p: any) => p.tahun_akademik_id === state.tahun_akademik_id
          );
          const pembinaPivotId = periode?.anggota?.pembina?.pembina_pivot_id ?? null;
          setPivotId(pembinaPivotId);
        }

        // Pre-select pembina saat ini
        setSelectedPembina(String(state.pembina_id));
      } catch {
        Swal.fire({ icon: "error", title: "Gagal!", text: "Tidak dapat memuat data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!selectedPembina) {
      setErrors({ pembina_id: ["Pembina wajib dipilih"] });
      return;
    }

    if (!pivotId) {
      Swal.fire({ icon: "error", title: "Error", text: "Pivot ID tidak ditemukan. Hubungi administrator." });
      return;
    }

    try {
      setIsSaving(true);
      const payload: UpdatePembinaEkskulRequest = { pembina_id: Number(selectedPembina) };
      const res = await api.put(`/spa/pembina/ekstrakurikuler/${pivotId}`, payload);

      if (res.data.status === "success") {
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Pembina berhasil diperbarui.", showConfirmButton: false, timer: 1800 });
        navigate("/superadmin/informasi-akademik/pembina-ekskul/histori/" + selectedPembina, { state: { pembinaId: selectedPembina } });
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
  const roleBadge = (role: string) =>
    role === "guru" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800";

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Pembina Ekstrakurikuler" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Pembina Ekstrakurikuler</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-white rounded shadow p-5">
                <h2 className="font-semibold text-lg mb-4 text-gray-700">Ganti Pembina</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Info ekskul & tahun (read-only) */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-gray-500 font-medium">Ekstrakurikuler</span>
                      <span className="font-semibold text-gray-800">{state.nama_ekskul}</span>
                      <span className="text-gray-500 font-medium">Tahun Akademik</span>
                      <span className="font-semibold text-gray-800">
                        {state.tahun_akademik}{" "}
                        <Badge className={`text-xs ml-1 ${state.status_tahun_akademik === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"}`}>
                          {state.status_tahun_akademik}
                        </Badge>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 italic">
                      * Ekstrakurikuler dan tahun akademik tidak dapat diubah
                    </p>
                  </div>

                  {/* Pilih Pembina Baru */}
                  <div>
                    <label className="block font-semibold text-foreground mb-2">
                      Pembina Baru <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedPembina} onValueChange={setSelectedPembina} disabled={isSaving}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Pembina" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Daftar Pembina</SelectLabel>
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

                  {/* Warning jika pivot tidak ditemukan */}
                  {!pivotId && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                      ⚠️ Pivot ID tidak ditemukan. Pastikan data pembina terdaftar untuk periode ini.
                    </div>
                  )}

                  {/* Tombol */}
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={isSaving || !pivotId} className="bg-primary flex items-center gap-2">
                      {isSaving
                        ? <><Loader2Icon className="animate-spin" size={18} /> Menyimpan...</>
                        : <><FilePlus size={18} /> Simpan Perubahan</>}
                    </Button>
                    <Button
                      type="button"
                      onClick={() => navigate(-1)}
                      disabled={isSaving}
                      className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90"
                    >
                      <CircleXIcon size={18} /> Batal
                    </Button>
                  </div>
                </form>
              </div>

              {/* Preview pembina terpilih */}
              <div>
                {pembinaDetail ? (
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
                      <Badge className={`text-xs w-fit capitalize ${roleBadge(pembinaDetail.role)}`}>
                        {pembinaDetail.role}
                      </Badge>
                    </div>

                    {/* Indikator perubahan */}
                    {String(state.pembina_id) !== selectedPembina && (
                      <div className="mt-4 pt-3 border-t border-blue-200 text-sm text-blue-700">
                        <p className="font-medium">Perubahan pembina:</p>
                        <p className="text-gray-500 mt-1">
                          <span className="line-through">{state.nama_pembina}</span>
                          {" → "}
                          <span className="font-semibold text-blue-800">{pembinaDetail.nama_pembina}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-400">
                    <p className="text-sm">Pilih pembina untuk melihat detail</p>
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

export default EditPembinaEkskul;