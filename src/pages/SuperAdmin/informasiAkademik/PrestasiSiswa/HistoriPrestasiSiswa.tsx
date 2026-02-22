import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2Icon, ArrowLeft, PlusIcon, PenBoxIcon, Trash2Icon, ChevronDownIcon, ChevronRightIcon, TrophyIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import type { PrestasiSiswaDetail } from "@/types/prestasiSiswa";

const HistoriPrestasiSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [detailData, setDetailData]   = useState<PrestasiSiswaDetail | null>(null);
  const [loading, setLoading]         = useState(true);
  const [loadingDelete, setLoadingDelete] = useState<number | null>(null);

  // Accordion per tahun akademik
  const [expandedPeriode, setExpandedPeriode] = useState<Set<number>>(new Set());
  const togglePeriode = (id: number) =>
    setExpandedPeriode((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── FETCH ─────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/spa/prestasi/${id}`);
      if (res.data.status === "success") {
        setDetailData(res.data.data);
        // Auto-expand semua periode
        const allIds = new Set(res.data.data.periode.map((p: any) => p.tahun_akademik_id) as number[]);
        setExpandedPeriode(allIds);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        Swal.fire({
          icon: "info",
          title: "Belum ada prestasi",
          text: "Siswa ini belum memiliki data prestasi.",
        });
        setDetailData(null);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat histori prestasi.",
        });
        navigate("/superadmin/informasi-akademik/prestasi-siswa");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // ── DELETE ────────────────────────────────────────────────
  const handleDelete = async (prestasiId: number, namaPrestasi: string) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `Prestasi <b>"${namaPrestasi}"</b> akan dihapus dan tidak dapat dikembalikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoadingDelete(prestasiId);
      await api.delete(`/spa/prestasi/${prestasiId}`);
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Data prestasi berhasil dihapus.", showConfirmButton: false, timer: 1800 });
      fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan.",
      });
    } finally {
      setLoadingDelete(null);
    }
  };

  const totalPrestasi = detailData?.periode.reduce((s, p) => s + p.prestasi.length, 0) ?? 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title={`Histori Prestasi - ${detailData?.nama_siswa ?? "Loading..."}`} />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-akademik/prestasi-siswa")}>
              <ArrowLeft size={18} className="mr-1" />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Histori Prestasi Siswa</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Info Card Siswa */}
              <Card className="mb-6 border-indigo-200">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nama Siswa</p>
                      <p className="text-lg font-bold">{detailData?.nama_siswa ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">NISN</p>
                      <p className="text-lg font-bold">{detailData?.nisn ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">NIS</p>
                      <p className="text-lg font-bold">{detailData?.nis ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Prestasi</p>
                      <p className="text-lg font-bold text-indigo-600">{totalPrestasi} Prestasi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tombol Tambah */}
              <div className="mb-4">
                <Link to={`/superadmin/informasi-akademik/prestasi-siswa/create?siswa_id=${id}`}>
                  <Button className="bg-primary">
                    <PlusIcon size={18} className="mr-1" />
                    Tambah Prestasi
                  </Button>
                </Link>
              </div>

              {/* Accordion Periode */}
              {detailData && detailData.periode.length > 0 ? (
                <div className="space-y-3">
                  {detailData.periode.map((periode) => {
                    const isExpanded = expandedPeriode.has(periode.tahun_akademik_id);
                    return (
                      <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">

                        {/* Header Periode */}
                        <div
                          className="px-5 py-4 flex items-center justify-between cursor-pointer bg-primary hover:bg-primary/90 transition-colors"
                          onClick={() => togglePeriode(periode.tahun_akademik_id)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded
                              ? <ChevronDownIcon size={18} className="text-white shrink-0" />
                              : <ChevronRightIcon size={18} className="text-white shrink-0" />}
                            <span className="font-bold text-white">📅 {periode.tahun_akademik}</span>
                          </div>
                          <Badge className="bg-white/20 text-white text-xs">
                            {periode.prestasi.length} prestasi
                          </Badge>
                        </div>

                        {/* List Prestasi */}
                        {isExpanded && (
                          <div className="divide-y divide-gray-100">
                            {periode.prestasi.length > 0 ? (
                              periode.prestasi.map((p, idx) => (
                                <div key={p.id} className="px-5 py-3 flex items-start justify-between hover:bg-indigo-50 transition-colors">
                                  <div className="flex items-start gap-3">
                                    <span className="mt-0.5 text-indigo-400 shrink-0">
                                      <TrophyIcon size={16} />
                                    </span>
                                    <div>
                                      <span className="text-xs text-gray-400 mr-2">{idx + 1}.</span>
                                      <span className="text-sm text-gray-800">{p.prestasi_diraih}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1 ml-4 shrink-0">
                                    <Link to={`/superadmin/informasi-akademik/prestasi-siswa/edit/${p.id}`}>
                                      <Button size="sm" className="bg-primary" title="Edit Prestasi">
                                        <PenBoxIcon size={14} />
                                      </Button>
                                    </Link>
                                    <Button
                                      size="sm"
                                      className="bg-muted-foreground hover:bg-muted-foreground/90"
                                      title="Hapus Prestasi"
                                      disabled={loadingDelete === p.id}
                                      onClick={() => handleDelete(p.id, p.prestasi_diraih)}
                                    >
                                      {loadingDelete === p.id
                                        ? <Loader2Icon size={14} className="animate-spin" />
                                        : <Trash2Icon size={14} />}
                                    </Button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="px-5 py-6 text-center text-gray-400">
                                Belum ada prestasi di tahun akademik ini
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 py-16 border border-dashed border-gray-200 rounded-lg">
                  <TrophyIcon size={40} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-lg font-medium">Belum ada data prestasi</p>
                  <p className="text-sm text-gray-400 mt-1">Klik tombol "Tambah Prestasi" untuk menambahkan</p>
                </div>
              )}
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default HistoriPrestasiSiswa;