import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon, SearchIcon, FileSpreadsheet, ArrowLeft, UserCheck, XCircle, CalendarCheck, ChevronDownIcon, ChevronRightIcon, Trash2Icon, PenBoxIcon, CircleXIcon, FilePlus } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiPelajaranService } from "@/services/absensiPelajaranService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { GuruDetail, AbsensiItemDetail } from "@/types/absensiPelajaran";

const DetailAbsensiPelajaran = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed]   = useState(false);
  const [guruData, setGuruData]         = useState<GuruDetail | null>(null);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [selectedIds, setSelectedIds]   = useState<number[]>([]);
  const [isLoadingAksi, setIsLoadingAksi] = useState(false);

  // Accordion state: "periode-{pi}" | "periode-{pi}-sem-{si}" | "periode-{pi}-sem-{si}-jadwal-{ji}"
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const toggleKey = (key: string) =>
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  // Dialog edit
  const [editDialog, setEditDialog]   = useState(false);
  const [editingId, setEditingId]     = useState<number | null>(null);
  const [editStatus, setEditStatus]   = useState<"hadir" | "tidak hadir">("hadir");
  const [editingItem, setEditingItem] = useState<AbsensiItemDetail & { jadwal_info?: string } | null>(null);

  // ── FETCH ─────────────────────────────────────────────────
  useEffect(() => { fetchDetailData(); }, [id]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);
      const res = await absensiPelajaranService.getDetail(Number(id));
      if (res.status === "success" && res.data.length > 0) {
        const guru: GuruDetail = res.data[0];
        setGuruData(guru);

        // Auto-expand periode & semester aktif
        const expanded = new Set<string>();
        guru.periode.forEach((p, pi) => {
          const pk = `periode-${pi}`;
          if (p.status_tahun_akademik === "aktif") expanded.add(pk);
          p.semesters.forEach((s, si) => {
            if (s.status_semester === "aktif") {
              expanded.add(pk);
              expanded.add(`${pk}-sem-${si}`);
            }
          });
        });
        setExpandedKeys(expanded);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: error.response?.data?.message || "Tidak dapat memuat detail absensi pelajaran.",
      });
      navigate("/superadmin/informasi-laporan-umum/absensi-pelajaran");
    } finally {
      setLoading(false);
    }
  };

  // ── FLATTEN semua absensi (untuk export semua & total) ────
  const allAbsensi = useMemo((): AbsensiItemDetail[] => {
    if (!guruData) return [];
    return guruData.periode.flatMap((p) =>
      p.semesters.flatMap((s) =>
        s.jadwal_pelajarans.flatMap((j) => j.absensi)
      )
    );
  }, [guruData]);

  // ── TOTAL keseluruhan ─────────────────────────────────────
  const totalHadir = guruData?.periode.reduce((s, p) => s + p.total_hadir_pertahun, 0) ?? 0;
  const totalTidakHadir = guruData?.periode.reduce((s, p) => s + p.total_tidak_hadir_pertahun, 0) ?? 0;
  const persentase = totalHadir + totalTidakHadir > 0
    ? ((totalHadir / (totalHadir + totalTidakHadir)) * 100).toFixed(1)
    : "0";

  // ── is_editable: cek status dari konteks semester ─────────
  // Kita butuh map absensi_id → is_editable (berdasarkan status semester)
  const editableIds = useMemo(() => {
    if (!guruData) return new Set<number>();
    const ids = new Set<number>();
    guruData.periode.forEach((p) => {
      p.semesters.forEach((s) => {
        if (p.status_tahun_akademik === "aktif" && s.status_semester === "aktif") {
          s.jadwal_pelajarans.forEach((j) => j.absensi.forEach((a) => ids.add(a.absensi_id)));
        }
      });
    });
    return ids;
  }, [guruData]);

  // ── SEARCH ────────────────────────────────────────────────
  const filterAbsensi = (items: AbsensiItemDetail[]) => {
    if (!searchTerm.trim()) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter(
      (item) =>
        item.hari.toLowerCase().includes(lower) ||
        item.status.toLowerCase().includes(lower)
    );
  };

  // ── EDIT ──────────────────────────────────────────────────
  const handleEdit = (item: AbsensiItemDetail, jadwalInfo: string) => {
    setEditingId(item.absensi_id);
    setEditStatus(item.status);
    setEditingItem({ ...item, jadwal_info: jadwalInfo });
    setEditDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingId) return;
    try {
      setIsLoadingAksi(true);
      await absensiPelajaranService.update(editingId, { status: editStatus });
      setEditDialog(false);
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Status absensi berhasil diperbarui.", showConfirmButton: false, timer: 1800 });
      fetchDetailData();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal memperbarui!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setIsLoadingAksi(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Tidak ada data dipilih", text: "Pilih minimal 1 data untuk dihapus" });
      return;
    }

    const deletableIds = selectedIds.filter((id) => editableIds.has(id));
    const arsipCount   = selectedIds.length - deletableIds.length;

    if (deletableIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Tidak ada data yang bisa dihapus", text: "Semua data yang dipilih berasal dari semester atau TA yang sudah arsip.", confirmButtonColor: "#4F46E5" });
      return;
    }

    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `<b>${deletableIds.length} data aktif</b> akan dihapus.${arsipCount > 0 ? `<br/><br/><span style="color:#f59e0b">⚠️ ${arsipCount} data arsip akan dilewati.</span>` : ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await absensiPelajaranService.deleteMultiple(deletableIds);
      setSelectedIds([]);
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Data berhasil dihapus.", showConfirmButton: false, timer: 1800 });
      fetchDetailData();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal menghapus!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  // ── EXPORT ────────────────────────────────────────────────
  const handleExportExcel = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : allAbsensi.map((a) => a.absensi_id);
      if (ids.length === 0) {
        Swal.fire({ icon: "warning", title: "Tidak ada data", text: "Tidak ada data untuk diekspor." });
        return;
      }
      const blob = await absensiPelajaranService.exportExcel(ids);
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `absensi-pelajaran-${guruData?.nama_guru.replace(/\s+/g, "-")}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Export berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Export gagal!", text: error.response?.data?.message || "Terjadi kesalahan." });
    }
  };

  // ── RENDER TABEL ABSENSI PER JADWAL ───────────────────────
  const renderTabelAbsensi = (
    items: AbsensiItemDetail[],
    isEditable: boolean,
    jadwalInfo: string
  ) => {
    const filtered = filterAbsensi(items);
    const semIds   = filtered.map((a) => a.absensi_id);
    const semAllSelected  = semIds.length > 0 && semIds.every((id) => selectedIds.includes(id));
    const semSomeSelected = semIds.some((id) => selectedIds.includes(id)) && !semAllSelected;

    return (
      <div className="overflow-x-auto border-t border-gray-100">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-center w-10">
                <input
                  type="checkbox"
                  checked={semAllSelected}
                  ref={(el) => { if (el) el.indeterminate = semSomeSelected; }}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds((prev) => [...new Set([...prev, ...semIds])]);
                    else setSelectedIds((prev) => prev.filter((x) => !semIds.includes(x)));
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
              </TableHead>
              <TableHead className="text-center font-semibold w-10">No</TableHead>
              <TableHead className="font-semibold">Hari / Tanggal</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              {isEditable && <TableHead className="text-center font-semibold">Aksi</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <TableRow key={item.absensi_id} className="hover:bg-indigo-50 border-t border-gray-100">
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.includes(item.absensi_id)}
                      onCheckedChange={(checked) =>
                        setSelectedIds((prev) =>
                          checked ? [...prev, item.absensi_id] : prev.filter((x) => x !== item.absensi_id)
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center text-gray-500">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{item.hari}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "hadir" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {item.status}
                    </span>
                  </TableCell>
                  {isEditable && (
                    <TableCell className="text-center">
                      <Button size="sm" onClick={() => handleEdit(item, jadwalInfo)}>
                        <PenBoxIcon size={14} />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isEditable ? 5 : 4} className="text-center text-gray-400 py-4">
                  Tidak ada data yang sesuai
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title={`Detail Absensi Pelajaran - ${guruData?.nama_guru ?? "Loading..."}`} />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-pelajaran")}>
              <ArrowLeft size={18} className="mr-1" />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Detail Absensi Pelajaran Guru</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : guruData ? (
            <>
              {/* Info Card */}
              <Card className="mb-6 border-indigo-200">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nama Guru</p>
                      <p className="text-lg font-bold">{guruData.nama_guru}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">NIP</p>
                      <p className="text-lg font-bold">{guruData.nip ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">NUPTK</p>
                      <p className="text-lg font-bold">{guruData.nuptk ?? "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Absensi</p>
                      <p className="text-lg font-bold">{allAbsensi.length} Kali Mengajar</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full"><UserCheck className="text-blue-600" size={24} /></div>
                      <div>
                        <p className="text-sm text-gray-600">Total Hadir</p>
                        <p className="text-2xl font-bold text-blue-600">{totalHadir}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-100 rounded-full"><XCircle className="text-red-600" size={24} /></div>
                      <div>
                        <p className="text-sm text-gray-600">Total Tidak Hadir</p>
                        <p className="text-2xl font-bold text-red-600">{totalTidakHadir}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-full"><CalendarCheck className="text-green-600" size={24} /></div>
                      <div>
                        <p className="text-sm text-gray-600">Persentase Kehadiran</p>
                        <p className="text-2xl font-bold text-green-600">{persentase}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons + Search */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="destructive" onClick={handleDeleteMultiple} disabled={selectedIds.length === 0}>
                    <Trash2Icon size={18} className="mr-1" />
                    Hapus Terpilih ({selectedIds.length})
                  </Button>
                  <Button variant="outline" onClick={() => handleExportExcel(false)}>
                    <FileSpreadsheet size={18} className="mr-1" />
                    Export Semua Excel
                  </Button>
                  <Button variant="outline" onClick={() => handleExportExcel(true)} disabled={selectedIds.length === 0}>
                    <FileSpreadsheet size={18} className="mr-1" />
                    Export Terpilih ({selectedIds.length})
                  </Button>
                </div>
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Cari hari atau status..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Accordion: Periode → Semester → Jadwal → Absensi */}
              <div className="space-y-3">
                {guruData.periode.map((periode, pi) => {
                  const pk         = `periode-${pi}`;
                  const isPeriodeExpanded = expandedKeys.has(pk);

                  return (
                    <div key={pi} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">

                      {/* Header Periode */}
                      <div
                        className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${periode.status_tahun_akademik === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-400 hover:bg-gray-500"}`}
                        onClick={() => toggleKey(pk)}
                      >
                        <div className="flex items-center gap-3">
                          {isPeriodeExpanded ? <ChevronDownIcon size={18} className="text-white shrink-0" /> : <ChevronRightIcon size={18} className="text-white shrink-0" />}
                          <span className="font-bold text-white">📅 {periode.tahun_akademik}</span>
                          <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-gray-200 text-gray-700 text-xs"}>
                            {periode.status_tahun_akademik}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-white text-sm">
                          <span>✅ Hadir: <strong>{periode.total_hadir_pertahun}</strong></span>
                          <span>❌ TH: <strong>{periode.total_tidak_hadir_pertahun}</strong></span>
                        </div>
                      </div>

                      {/* Semester */}
                      {isPeriodeExpanded && (
                        <div className="divide-y divide-gray-100">
                          {periode.semesters.map((semester, si) => {
                            const sk        = `${pk}-sem-${si}`;
                            const isSemExp  = expandedKeys.has(sk);
                            const isEditable = periode.status_tahun_akademik === "aktif" && semester.status_semester === "aktif";

                            return (
                              <div key={si}>
                                {/* Sub-header Semester */}
                                <div
                                  className="px-5 py-3 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                  onClick={() => toggleKey(sk)}
                                >
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    {isSemExp ? <ChevronDownIcon size={14} className="text-gray-400" /> : <ChevronRightIcon size={14} className="text-gray-400" />}
                                    Semester {semester.semester}
                                    <Badge className={semester.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>
                                      {semester.status_semester}
                                    </Badge>
                                    {!isEditable && (
                                      <span className="text-xs text-gray-400 italic">(arsip — hanya baca)</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>Hadir: <strong>{semester.total_hadir_persemester}</strong></span>
                                    <span>TH: <strong>{semester.total_tidak_hadir_persemester}</strong></span>
                                  </div>
                                </div>

                                {/* Jadwal Pelajaran */}
                                {isSemExp && (
                                  <div className="divide-y divide-gray-50">
                                    {semester.jadwal_pelajarans.map((jadwal, ji) => {
                                      const jk       = `${sk}-jadwal-${ji}`;
                                      const isJadwalExp = expandedKeys.has(jk);
                                      const jadwalInfo  = `${jadwal.mata_pelajaran} — ${jadwal.rombel} (${jadwal.hari} ${jadwal.jam_mulai}–${jadwal.jam_selesai})`;

                                      return (
                                        <div key={ji} className="bg-white">
                                          {/* Sub-header Jadwal */}
                                          <div
                                            className="px-6 py-2.5 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors border-l-4 border-indigo-200"
                                            onClick={() => toggleKey(jk)}
                                          >
                                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                              {isJadwalExp ? <ChevronDownIcon size={13} className="text-indigo-400" /> : <ChevronRightIcon size={13} className="text-indigo-400" />}
                                              <span className="font-semibold text-indigo-700">{jadwal.mata_pelajaran}</span>
                                              <span className="text-gray-400">•</span>
                                              <span>{jadwal.rombel}</span>
                                              <span className="text-gray-400">•</span>
                                              <span>{jadwal.hari}, {jadwal.jam_mulai}–{jadwal.jam_selesai}</span>
                                              <span className="text-gray-400">•</span>
                                              <span className="text-gray-500">{jadwal.ruangan}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{jadwal.absensi.length} absensi</span>
                                          </div>

                                          {/* Tabel absensi */}
                                          {isJadwalExp && renderTabelAbsensi(jadwal.absensi, isEditable, jadwalInfo)}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-16">Data tidak ditemukan</div>
          )}
        </div>
        <Footer />
      </main>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status Absensi Pelajaran</DialogTitle>
            <DialogDescription>Ubah status kehadiran guru dalam mengajar</DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Jadwal:</span>
                  <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%]">{editingItem.jadwal_info}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hari/Tanggal:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingItem.hari}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status Saat Ini:</span>
                  <span className={`text-sm font-semibold ${editingItem.status === "hadir" ? "text-green-700" : "text-red-700"}`}>
                    {editingItem.status}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status Baru</label>
                <Select value={editStatus} onValueChange={(v: "hadir" | "tidak hadir") => setEditStatus(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hadir">Hadir</SelectItem>
                    <SelectItem value="tidak hadir">Tidak Hadir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90" onClick={() => setEditDialog(false)}>
              <CircleXIcon size={16} />
              Batal
            </Button>
            <Button className="bg-primary flex items-center gap-2" disabled={isLoadingAksi} onClick={handleUpdateStatus}>
              {isLoadingAksi ? <Loader2Icon size={16} className="animate-spin" /> : <FilePlus size={16} />}
              {isLoadingAksi ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DetailAbsensiPelajaran;