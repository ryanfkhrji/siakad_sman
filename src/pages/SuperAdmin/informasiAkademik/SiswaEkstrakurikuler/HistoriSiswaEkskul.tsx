import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/pages/Footer";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import {
  Loader2Icon, ArrowLeftIcon, PenBoxIcon,
  Trash2Icon, ChevronDownIcon, ChevronRightIcon,
} from "lucide-react";
import type { DetailSiswaEkskul } from "@/types/siswaEkskul";

interface SiswaNavState {
  nama_siswa: string;
  nisn: string;
  nis: string;
}

const HistoriSiswaEkskul = () => {
  const { id: siswaId } = useParams<{ id: string }>();
  const navigate  = useNavigate();
  const location  = useLocation();
  const navState  = location.state as SiswaNavState | null;

  const [isCollapsed,     setIsCollapsed]     = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [deleting,        setDeleting]        = useState(false);
  const [histori,         setHistori]         = useState<DetailSiswaEkskul | null>(null);
  const [expandedPeriode, setExpandedPeriode] = useState<Set<number>>(new Set());

  useEffect(() => { if (siswaId) fetchHistori(); }, [siswaId]);

  const fetchHistori = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/spa/siswa/ekskul/${siswaId}`);
      if (res.data.status === "success") {
        const data: DetailSiswaEkskul = res.data.data;
        setHistori(data);
        const aktifIds = data.periode
          .filter((p) => p.status_tahun_akademik === "aktif")
          .map((p) => p.tahun_akademik_id);
        setExpandedPeriode(new Set(aktifIds));
      }
    } catch (err: any) {
      const msg = err.response?.data?.errors?.data || "Siswa belum pernah mengikuti ekskul.";
      Swal.fire({ icon: "info", title: "Belum Ada Histori", text: msg }).then(() =>
        navigate("/superadmin/informasi-akademik/siswa-ekskul")
      );
    } finally {
      setLoading(false);
    }
  };

  const togglePeriode = (id: number) =>
    setExpandedPeriode((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Hapus — ambil pivot_id dari detail ekskul sesuai siswa & tahun ──
  const handleDelete = async (ekskulId: number, tahunAkademikId: number) => {
    const confirm = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data siswa dari ekskul pada periode ini akan dihapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!confirm.isConfirmed) return;

    try {
      setDeleting(true);

      // Ambil pivot_id dari detail ekskul
      const resEkskul = await api.get(`/spa/ekstrakurikuler/${ekskulId}`);
      const detail = resEkskul.data.data?.[0];
      const matchPeriode = detail?.periode?.find(
        (p: any) => p.tahun_akademik_id === tahunAkademikId
      );
      // Cari siswa yang sesuai di anggota
      const siswaItem = matchPeriode?.anggota?.siswa?.find(
        (s: any) => s.siswa_id === histori?.siswa_id
      );
      const pivotId: number | null = siswaItem?.siswa_pivot_id ?? null;

      if (!pivotId) {
        Swal.fire({ icon: "error", title: "Gagal", text: "Pivot ID siswa tidak ditemukan." });
        return;
      }

      const res = await api.delete(`/spa/siswa/ekskul/${pivotId}`);
      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data siswa berhasil dihapus dari ekskul.",
          showConfirmButton: false,
          timer: 1800,
        });
        await fetchHistori();
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text:
          err.response?.data?.errors?.tahun_akademik_id?.[0] ||
          err.response?.data?.message ||
          "Terjadi kesalahan.",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── Badge helpers ──────────────────────────────────────────────
  const statusTaBadge = (s: string) =>
    s === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600";

  const statusEkskulBadge = (s: string) => {
    if (s === "wajib")   return "bg-red-100 text-red-800";
    if (s === "pilihan") return "bg-blue-100 text-blue-800";
    return "bg-purple-100 text-purple-800";
  };

  const statusEkskulLabel = (s: string) =>
    s === "wajib" ? "Wajib" : s === "pilihan" ? "Pilihan" : "Jurusan";

  const sikapBadge = (s: string | null) => {
    if (!s) return "bg-gray-100 text-gray-400";
    if (s === "Sangat Baik") return "bg-green-100 text-green-800";
    if (s === "Baik")        return "bg-blue-100 text-blue-800";
    if (s === "Cukup")       return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800"; // Kurang
  };

  const statusKehadiranBadge = (s: string | null) => {
    if (!s) return "bg-gray-100 text-gray-400";
    if (s === "Aktif")        return "bg-green-100 text-green-800";
    if (s === "Cukup Aktif")  return "bg-blue-100 text-blue-800";
    if (s === "Kurang Aktif") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800"; // Tidak Aktif
  };

  const namaSiswa = histori?.nama_siswa ?? navState?.nama_siswa ?? "...";
  const nisn      = histori?.nisn ?? navState?.nisn ?? "-";
  const nis       = histori?.nis  ?? navState?.nis  ?? "-";

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title={`Histori Ekskul — ${namaSiswa}`} />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/superadmin/informasi-akademik/siswa-ekskul")}
            >
              <ArrowLeftIcon size={16} /> Kembali
            </Button>
            <h1 className="text-3xl font-bold">Histori Ekskul Siswa</h1>
          </div>

          {!loading && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-800 flex flex-wrap gap-6">
              <span><span className="font-medium">Nama:</span> {namaSiswa}</span>
              <span><span className="font-medium">NISN:</span> {nisn}</span>
              <span><span className="font-medium">NIS:</span> {nis}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat histori...</p>
            </div>
          ) : histori && histori.periode.length > 0 ? (
            <div className="space-y-3">
              {histori.periode.map((periode) => {
                const isOpen  = expandedPeriode.has(periode.tahun_akademik_id);
                const isArsip = periode.status_tahun_akademik === "arsip";

                return (
                  <div
                    key={periode.tahun_akademik_id}
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                  >
                    {/* Header periode */}
                    <div
                      className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${
                        isArsip ? "bg-gray-400 hover:bg-gray-500" : "bg-primary hover:bg-primary/90"
                      }`}
                      onClick={() => togglePeriode(periode.tahun_akademik_id)}
                    >
                      <div className="flex items-center gap-3">
                        {isOpen
                          ? <ChevronDownIcon size={17} className="text-white shrink-0" />
                          : <ChevronRightIcon size={17} className="text-white shrink-0" />}
                        <span className="font-bold text-white text-base">
                          📅 {periode.tahun_akademik}
                        </span>
                        <Badge className={`text-xs ${statusTaBadge(periode.status_tahun_akademik)}`}>
                          {periode.status_tahun_akademik}
                        </Badge>
                      </div>
                      <span className="text-white text-sm opacity-80">
                        {periode.ekstrakurikulers.length} ekskul
                      </span>
                    </div>

                    {/* Tabel ekskul */}
                    {isOpen && (
                      <div className="overflow-x-auto bg-white">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead>Nama Ekskul</TableHead>
                              <TableHead className="text-center">Status Ekskul</TableHead>
                              <TableHead className="text-center">Sikap</TableHead>
                              <TableHead className="text-center">Status Kehadiran</TableHead>
                              {!isArsip && (
                                <TableHead className="text-center w-28">Aksi</TableHead>
                              )}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {periode.ekstrakurikulers.map((ekskul) => (
                              <TableRow
                                key={ekskul.ekskul_id}
                                className="border-t border-gray-100 hover:bg-indigo-50"
                              >
                                <TableCell className="font-medium">{ekskul.nama_ekskul}</TableCell>
                                <TableCell className="text-center">
                                  <Badge className={`text-xs ${statusEkskulBadge(ekskul.status_ekskul)}`}>
                                    {statusEkskulLabel(ekskul.status_ekskul)}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className={`text-xs ${sikapBadge(ekskul.sikap)}`}>
                                    {ekskul.sikap ?? "-"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge className={`text-xs ${statusKehadiranBadge(ekskul.status_kehadiran)}`}>
                                    {ekskul.status_kehadiran ?? "-"}
                                  </Badge>
                                </TableCell>

                                {/* Aksi hanya untuk periode aktif */}
                                {!isArsip && (
                                  <TableCell className="text-center">
                                    <div className="flex justify-center gap-1">
                                      <Link
                                        to={`/superadmin/informasi-akademik/siswa-ekskul/edit/${ekskul.ekskul_id}`}
                                        state={{
                                          siswaData: {
                                            ekskul_id: ekskul.ekskul_id,
                                            nama_ekskul: ekskul.nama_ekskul,
                                            siswa_id: histori.siswa_id,
                                            nama_siswa: histori.nama_siswa,
                                            nisn: histori.nisn,
                                            nis: histori.nis,
                                            tahun_akademik: periode.tahun_akademik,
                                            tahun_akademik_id: periode.tahun_akademik_id,
                                            status_tahun_akademik: periode.status_tahun_akademik,
                                            sikap: ekskul.sikap,
                                            status_kehadiran: ekskul.status_kehadiran,
                                          },
                                        }}
                                      >
                                        <Button size="sm" title="Edit sikap & status">
                                          <PenBoxIcon size={14} />
                                        </Button>
                                      </Link>

                                      <Button
                                        size="sm"
                                        className="bg-muted-foreground hover:bg-muted-foreground/90"
                                        disabled={deleting}
                                        title="Hapus dari ekskul"
                                        onClick={() =>
                                          handleDelete(ekskul.ekskul_id, periode.tahun_akademik_id)
                                        }
                                      >
                                        {deleting ? (
                                          <Loader2Icon size={14} className="animate-spin" />
                                        ) : (
                                          <Trash2Icon size={14} />
                                        )}
                                      </Button>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            !loading && (
              <div className="text-center text-gray-500 py-16">
                Belum ada histori ekskul untuk siswa ini.
              </div>
            )
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriSiswaEkskul;