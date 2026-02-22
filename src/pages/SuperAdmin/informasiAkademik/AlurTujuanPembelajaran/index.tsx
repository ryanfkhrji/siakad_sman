import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { CheckCircleIcon, XCircleIcon, SearchIcon, Loader2Icon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import type { AtpKompetensi, HistoriAtp } from "@/types/alurTujuanPembelajaran";

type TabType = "diajukan" | "disetujui";

const STATUS_BADGE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  diajukan: "bg-yellow-100 text-yellow-700",
  disetujui: "bg-green-100 text-green-700",
  ditolak: "bg-red-100 text-red-700",
};

const AlurTujuanPembelajaran = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("diajukan");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AtpKompetensi[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Expand state — key: `${kompetensi_id}-${tahun_id}-${semester_id}-${guru_id}`
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  // Modal tolak
  const [modalTolak, setModalTolak] = useState<{ open: boolean; atpId: number | null }>({ open: false, atpId: null });
  const [catatanPenolakan, setCatatanPenolakan] = useState("");
  const [loadingAksi, setLoadingAksi] = useState(false);

  const fetchData = async (tab: TabType) => {
    try {
      setLoading(true);
      setData([]);
      setExpandedKeys(new Set());

      const endpoint = tab === "diajukan" ? "/spa/atp" : "/spa/atp-disetujui";
      const res = await api.get(endpoint);

      if (res.data.status === "success") {
        setData(res.data.data);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data ATP",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  // Toggle expand per level
  const toggleKey = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Filter berdasarkan search
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter(
      (k) => k.mata_pelajaran.toLowerCase().includes(lower) || k.judul_kompetensi.toLowerCase().includes(lower) || k.periode.some((p) => p.semesters.some((s) => s.guru.some((g) => g.nama_guru.toLowerCase().includes(lower)))),
    );
  }, [data, searchTerm]);

  // ── AKSI SETUJUI ──────────────────────────────────────────
  const handleSetujui = async (atpId: number) => {
    const confirm = await Swal.fire({
      icon: "question",
      title: "Setujui ATP?",
      text: "ATP akan dikunci setelah disetujui dan tidak bisa diubah.",
      showCancelButton: true,
      confirmButtonText: "Ya, Setujui",
      cancelButtonText: "Batal",
      confirmButtonColor: "#4f46e5",
    });

    if (!confirm.isConfirmed) return;

    try {
      setLoadingAksi(true);
      const res = await api.put(`/spa/atp-disetujui/${atpId}`);
      if (res.data.status === "success") {
        Swal.fire({ icon: "success", title: "ATP disetujui!", timer: 1500, showConfirmButton: false });
        fetchData(activeTab);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menyetujui!",
        text: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoadingAksi(false);
    }
  };

  // ── AKSI TOLAK ────────────────────────────────────────────
  const openModalTolak = (atpId: number) => {
    setCatatanPenolakan("");
    setModalTolak({ open: true, atpId });
  };

  const handleTolak = async () => {
    if (!modalTolak.atpId) return;

    try {
      setLoadingAksi(true);
      const res = await api.put(`/spa/atp-ditolak/${modalTolak.atpId}`, {
        catatan_penolakan: catatanPenolakan,
      });
      if (res.data.status === "success") {
        setModalTolak({ open: false, atpId: null });
        Swal.fire({ icon: "success", title: "ATP ditolak!", text: "Guru akan melakukan revisi.", timer: 1800, showConfirmButton: false });
        fetchData(activeTab);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menolak!",
        text: error.response?.data?.message || "Terjadi kesalahan",
      });
    } finally {
      setLoadingAksi(false);
    }
  };

  // ── RENDER HISTORI ATP (tabel per guru) ───────────────────
  const renderHistoriAtp = (histori: HistoriAtp[], showAksi: boolean) => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600">
            <th className="text-center py-2 px-3 font-semibold w-10">No</th>
            <th className="py-2 px-3 font-semibold text-left">Tujuan Pembelajaran</th>
            <th className="text-center py-2 px-3 font-semibold w-16">Urutan</th>
            <th className="text-center py-2 px-3 font-semibold">Status</th>
            {showAksi && <th className="text-center py-2 px-3 font-semibold w-36">Aksi</th>}
            {!showAksi && <th className="py-2 px-3 font-semibold">Disetujui Pada</th>}
          </tr>
        </thead>
        <tbody>
          {histori.map((atp, idx) => (
            <tr key={atp.atp_id} className="border-t border-gray-100 hover:bg-indigo-50">
              <td className="text-center py-2 px-3 text-gray-500">{idx + 1}</td>
              <td className="py-2 px-3">{atp.tujuan_pembelajaran}</td>
              <td className="text-center py-2 px-3 font-medium">{atp.urutan}</td>
              <td className="text-center py-2 px-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE[atp.approval_status] ?? "bg-gray-100 text-gray-600"}`}>{atp.approval_status}</span>
              </td>
              {showAksi && (
                <td className="text-center py-2 px-3">
                  <div className="flex items-center justify-center gap-1">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 text-xs px-2 py-1 h-7" onClick={() => handleSetujui(atp.atp_id)} disabled={loadingAksi}>
                      <CheckCircleIcon size={13} />
                      Setujui
                    </Button>
                    <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-1 text-xs px-2 py-1 h-7" onClick={() => openModalTolak(atp.atp_id)} disabled={loadingAksi}>
                      <XCircleIcon size={13} />
                      Tolak
                    </Button>
                  </div>
                </td>
              )}
              {!showAksi && (
                <td className="py-2 px-3 text-gray-500 text-xs">{atp.approved_at ? new Date(atp.approved_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── RENDER CARD PER KOMPETENSI ────────────────────────────
  const renderKompetensiCard = (komp: AtpKompetensi) => {
    const kompKey = `komp-${komp.kompetensi_id}`;
    const isKompExpanded = expandedKeys.has(kompKey);
    const showAksi = activeTab === "diajukan";

    return (
      <div key={komp.kompetensi_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
        {/* Header Kompetensi */}
        <div className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleKey(kompKey)}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isKompExpanded ? <ChevronDownIcon size={18} className="text-gray-400 shrink-0" /> : <ChevronRightIcon size={18} className="text-gray-400 shrink-0" />}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-800 truncate">{komp.judul_kompetensi}</span>
                <Badge className="bg-indigo-100 text-indigo-700 text-xs shrink-0">{komp.jenis_kompetensi}</Badge>
                {komp.fase && <Badge className="bg-purple-100 text-purple-700 text-xs shrink-0">Fase {komp.fase}</Badge>}
                <Badge className={komp.status_kompetensi === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{komp.status_kompetensi}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">📚 {komp.mata_pelajaran}</p>
            </div>
          </div>
          <span className="text-xs text-gray-400 shrink-0 ml-4">{komp.periode.length} periode</span>
        </div>

        {/* Periode */}
        {isKompExpanded && (
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {komp.periode.map((periode) => {
              const periodeKey = `periode-${komp.kompetensi_id}-${periode.tahun_akademik_id}`;
              const isPeriodeExpanded = expandedKeys.has(periodeKey);

              return (
                <div key={periode.tahun_akademik_id}>
                  {/* Sub-header Periode */}
                  <div
                    className={`px-5 py-3 flex items-center justify-between cursor-pointer transition-colors ${periode.status_tahun_akademik === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-400 hover:bg-gray-500"}`}
                    onClick={() => toggleKey(periodeKey)}
                  >
                    <div className="flex items-center gap-2">
                      {isPeriodeExpanded ? <ChevronDownIcon size={15} className="text-white" /> : <ChevronRightIcon size={15} className="text-white" />}
                      <span className="text-white font-semibold text-sm">📅 {periode.tahun_akademik}</span>
                      <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-gray-200 text-gray-700 text-xs"}>{periode.status_tahun_akademik}</Badge>
                    </div>
                    <span className="text-white text-xs opacity-80">{periode.semesters.length} semester</span>
                  </div>

                  {/* Semester */}
                  {isPeriodeExpanded &&
                    periode.semesters.map((semester) => {
                      const semKey = `sem-${komp.kompetensi_id}-${periode.tahun_akademik_id}-${semester.semester_id}`;
                      const isSemExpanded = expandedKeys.has(semKey);

                      return (
                        <div key={semester.semester_id} className="border-t border-gray-100">
                          {/* Sub-header Semester */}
                          <div className="px-5 py-2.5 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors" onClick={() => toggleKey(semKey)}>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              {isSemExpanded ? <ChevronDownIcon size={14} className="text-gray-400" /> : <ChevronRightIcon size={14} className="text-gray-400" />}
                              Semester {semester.semester}
                              <Badge className={semester.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{semester.status_semester}</Badge>
                            </div>
                            <span className="text-xs text-gray-400">{semester.guru.length} guru</span>
                          </div>

                          {/* Guru */}
                          {isSemExpanded &&
                            semester.guru.map((guru) => {
                              const guruKey = `guru-${komp.kompetensi_id}-${periode.tahun_akademik_id}-${semester.semester_id}-${guru.guru_id}`;
                              const isGuruExpanded = expandedKeys.has(guruKey);

                              return (
                                <div key={guru.guru_id} className="border-t border-gray-100">
                                  {/* Sub-header Guru */}
                                  <div className="px-5 py-2.5 flex items-center justify-between cursor-pointer bg-white hover:bg-indigo-50 transition-colors" onClick={() => toggleKey(guruKey)}>
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                      {isGuruExpanded ? <ChevronDownIcon size={14} className="text-gray-400" /> : <ChevronRightIcon size={14} className="text-gray-400" />}
                                      <span className="font-medium">👤 {guru.nama_guru}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">{guru.histori_atp.length} ATP</span>
                                  </div>

                                  {/* Tabel Histori ATP */}
                                  {isGuruExpanded && renderHistoriAtp(guru.histori_atp, showAksi)}
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Alur Tujuan Pembelajaran" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Alur Tujuan Pembelajaran</h1>

          {/* Tab + Search */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            {/* Tab */}
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {(["diajukan", "disetujui"] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setSearchTerm("");
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${activeTab === tab ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                >
                  {tab === "diajukan" ? "📋 Diajukan" : "✅ Disetujui"}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full md:w-72">
              <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
              <Input type="text" placeholder="Cari mata pelajaran, kompetensi, guru..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
            </div>
          </div>

          {/* Info badge jumlah */}
          {!loading && (
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                Menampilkan <strong>{filteredData.length}</strong> kompetensi
                {activeTab === "diajukan" ? " yang menunggu persetujuan" : " yang telah disetujui"}
              </span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data ATP...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && filteredData.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-400 text-sm">{searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : activeTab === "diajukan" ? "Tidak ada ATP yang menunggu persetujuan" : "Belum ada ATP yang disetujui"}</p>
            </div>
          )}

          {/* Data */}
          {!loading && filteredData.length > 0 && <div className="space-y-3">{filteredData.map((komp) => renderKompetensiCard(komp))}</div>}
        </div>

        <Footer />
      </main>

      {/* Modal Tolak */}
      <Dialog open={modalTolak.open} onOpenChange={(open) => setModalTolak({ open, atpId: open ? modalTolak.atpId : null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircleIcon size={20} />
              Tolak ATP
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <p className="text-sm text-gray-600">ATP yang ditolak akan dikembalikan ke guru untuk direvisi. Silakan berikan catatan penolakan (opsional).</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Penolakan <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <Textarea placeholder="Contoh: Tujuan pembelajaran terlalu umum, perlu lebih spesifik..." value={catatanPenolakan} onChange={(e) => setCatatanPenolakan(e.target.value)} rows={4} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setModalTolak({ open: false, atpId: null })} disabled={loadingAksi}>
              Batal
            </Button>
            <Button className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2" onClick={handleTolak} disabled={loadingAksi}>
              {loadingAksi ? <Loader2Icon size={15} className="animate-spin" /> : <XCircleIcon size={15} />}
              Tolak ATP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default AlurTujuanPembelajaran;
