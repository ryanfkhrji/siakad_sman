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
import type { UpdateSiswaEkskulRequest } from "@/types/siswaEkskul";

interface SiswaNavigationState {
  ekskul_id: number;
  nama_ekskul: string;
  siswa_id: number;
  nama_siswa: string;
  nisn: string;
  nis: string;
  tahun_akademik: string;
  tahun_akademik_id: number;
  status_tahun_akademik: "aktif" | "arsip";
  sikap: "Sangat Baik" | "Baik" | "Cukup" | "Kurang" | null;
  status_kehadiran: "Aktif" | "Cukup Aktif" | "Kurang Aktif" | "Tidak Aktif" | null;
}

interface FormErrors {
  sikap?: string[];
  status?: string[];
}

const SIKAP_OPTIONS   = ["Sangat Baik", "Baik", "Cukup", "Kurang"] as const;
const STATUS_OPTIONS  = ["Aktif", "Cukup Aktif", "Kurang Aktif", "Tidak Aktif"] as const;

const EditSiswaEkskul = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state?.siswaData as SiswaNavigationState | null;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isSaving,    setIsSaving]    = useState(false);
  const [errors,      setErrors]      = useState<FormErrors>({});

  const [pivotId,     setPivotId]     = useState<number | null>(null);
  const [sikap,       setSikap]       = useState<string>("");
  const [statusKehadiran, setStatusKehadiran] = useState<string>("");

  // ── Guard ──────────────────────────────────────────────────────
  if (!state) {
    Swal.fire({
      icon: "error",
      title: "Data Tidak Ditemukan",
      text: "Silakan kembali ke halaman sebelumnya",
    }).then(() => navigate("/superadmin/informasi-akademik/siswa-ekskul"));

    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <div className="flex items-center justify-center h-screen">
            <Loader2Icon className="animate-spin" size={32} />
          </div>
        </main>
      </SidebarProvider>
    );
  }

  // ── Fetch pivot_id dari detail ekskul ──────────────────────────
  useEffect(() => {
    const fetchPivot = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/spa/ekstrakurikuler/${state.ekskul_id}`);
        const detail = res.data.data?.[0];
        const matchPeriode = detail?.periode?.find(
          (p: any) => p.tahun_akademik_id === state.tahun_akademik_id
        );
        const siswaItem = matchPeriode?.anggota?.siswa?.find(
          (s: any) => s.siswa_id === state.siswa_id
        );
        setPivotId(siswaItem?.siswa_pivot_id ?? null);
      } catch {
        Swal.fire({ icon: "error", title: "Gagal!", text: "Tidak dapat memuat data." });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPivot();

    // Pre-fill nilai saat ini
    setSikap(state.sikap ?? "");
    setStatusKehadiran(state.status_kehadiran ?? "");
  }, []);

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!pivotId) {
      Swal.fire({ icon: "error", title: "Error", text: "Pivot ID tidak ditemukan." });
      return;
    }

    try {
      setIsSaving(true);
      const payload: UpdateSiswaEkskulRequest = {
        sikap:  (sikap  || undefined) as UpdateSiswaEkskulRequest["sikap"],
        status: (statusKehadiran || undefined) as UpdateSiswaEkskulRequest["status"],
      };
      const res = await api.put(`/spa/siswa/ekskul/${pivotId}`, payload);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data siswa berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(`/superadmin/informasi-akademik/siswa-ekskul/histori/${state.siswa_id}`, {
          state: { nama_siswa: state.nama_siswa, nisn: state.nisn, nis: state.nis },
        });
      }
    } catch (err: any) {
      if (err.response?.data?.errors) setErrors(err.response.data.errors);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // ── Badge helpers ──────────────────────────────────────────────
  const sikapBadge = (s: string) => {
    if (s === "Sangat Baik") return "bg-green-100 text-green-800";
    if (s === "Baik")        return "bg-blue-100 text-blue-800";
    if (s === "Cukup")       return "bg-yellow-100 text-yellow-800";
    if (s === "Kurang")      return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-400";
  };

  const statusBadge = (s: string) => {
    if (s === "Aktif")        return "bg-green-100 text-green-800";
    if (s === "Cukup Aktif")  return "bg-blue-100 text-blue-800";
    if (s === "Kurang Aktif") return "bg-yellow-100 text-yellow-800";
    if (s === "Tidak Aktif")  return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-400";
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Sikap & Status Siswa Ekskul" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Sikap & Status Siswa</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <div className="bg-white rounded shadow p-5">
                <h2 className="font-semibold text-lg mb-4 text-gray-700">Edit Penilaian</h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Info siswa & ekskul (read-only) */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-gray-500 font-medium">Siswa</span>
                      <span className="font-semibold text-gray-800">{state.nama_siswa}</span>
                      <span className="text-gray-500 font-medium">NISN / NIS</span>
                      <span className="text-gray-700">{state.nisn} / {state.nis}</span>
                      <span className="text-gray-500 font-medium">Ekstrakurikuler</span>
                      <span className="font-semibold text-gray-800">{state.nama_ekskul}</span>
                      <span className="text-gray-500 font-medium">Tahun Akademik</span>
                      <span className="font-semibold text-gray-800">
                        {state.tahun_akademik}{" "}
                        <Badge className="text-xs ml-1 bg-green-100 text-green-800">
                          {state.status_tahun_akademik}
                        </Badge>
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 italic">
                      * Siswa, ekskul, dan tahun akademik tidak dapat diubah
                    </p>
                  </div>

                  {/* Sikap */}
                  <div>
                    <label className="block font-semibold text-foreground mb-2">Sikap</label>
                    <Select value={sikap} onValueChange={setSikap} disabled={isSaving}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Sikap" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Nilai Sikap</SelectLabel>
                          {SIKAP_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.sikap && <p className="text-red-500 text-sm mt-1">{errors.sikap[0]}</p>}
                  </div>

                  {/* Status Kehadiran */}
                  <div>
                    <label className="block font-semibold text-foreground mb-2">Status Kehadiran</label>
                    <Select value={statusKehadiran} onValueChange={setStatusKehadiran} disabled={isSaving}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih Status Kehadiran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Status Kehadiran</SelectLabel>
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
                  </div>

                  {!pivotId && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                      ⚠️ Pivot ID tidak ditemukan. Pastikan data siswa terdaftar untuk periode ini.
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="submit"
                      disabled={isSaving || !pivotId}
                      className="bg-primary flex items-center gap-2"
                    >
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

              {/* Preview perubahan */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-3">Preview Penilaian</h3>
                  <div className="space-y-3 text-sm">
                    {/* Sikap */}
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Sikap</p>
                      <div className="flex items-center gap-3">
                        {state.sikap ? (
                          <>
                            <Badge className={`text-xs ${sikapBadge(state.sikap)}`}>
                              {state.sikap}
                            </Badge>
                            {sikap && sikap !== state.sikap && (
                              <>
                                <span className="text-gray-400">→</span>
                                <Badge className={`text-xs ${sikapBadge(sikap)}`}>{sikap}</Badge>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Belum diisi</span>
                        )}
                        {!state.sikap && sikap && (
                          <Badge className={`text-xs ${sikapBadge(sikap)}`}>{sikap}</Badge>
                        )}
                      </div>
                    </div>

                    {/* Status Kehadiran */}
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Status Kehadiran</p>
                      <div className="flex items-center gap-3">
                        {state.status_kehadiran ? (
                          <>
                            <Badge className={`text-xs ${statusBadge(state.status_kehadiran)}`}>
                              {state.status_kehadiran}
                            </Badge>
                            {statusKehadiran && statusKehadiran !== state.status_kehadiran && (
                              <>
                                <span className="text-gray-400">→</span>
                                <Badge className={`text-xs ${statusBadge(statusKehadiran)}`}>
                                  {statusKehadiran}
                                </Badge>
                              </>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400 italic">Belum diisi</span>
                        )}
                        {!state.status_kehadiran && statusKehadiran && (
                          <Badge className={`text-xs ${statusBadge(statusKehadiran)}`}>
                            {statusKehadiran}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-xs text-gray-500">
                  <p className="font-medium mb-1 text-gray-600">Keterangan warna Sikap:</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {SIKAP_OPTIONS.map((s) => (
                      <Badge key={s} className={`text-xs ${sikapBadge(s)}`}>{s}</Badge>
                    ))}
                  </div>
                  <p className="font-medium mb-1 text-gray-600">Keterangan warna Status Kehadiran:</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map((s) => (
                      <Badge key={s} className={`text-xs ${statusBadge(s)}`}>{s}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditSiswaEkskul;