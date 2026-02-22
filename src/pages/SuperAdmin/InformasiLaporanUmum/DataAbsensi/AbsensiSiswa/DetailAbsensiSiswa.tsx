import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2Icon, SearchIcon, FileSpreadsheet, ArrowLeft,
  UserCheck, FileCheck, FileX, XCircle, FileArchive,
  EyeIcon, PenBoxIcon, ChevronDownIcon, ChevronRightIcon,
} from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { absensiSiswaService } from "@/services/absensiSiswaService";
import type { DetailAbsensiSiswaData, TotalStatus } from "@/types/absensiSiswa";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const statusColor = (status: string) => {
  if (status === "hadir") return "bg-green-100 text-green-800";
  if (status === "izin")  return "bg-blue-100 text-blue-800";
  if (status === "sakit") return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
};

const statusBadgeClass = (status: string) =>
  status === "aktif"
    ? "bg-green-200 text-green-800 text-xs"
    : "bg-gray-200 text-gray-700 text-xs";

/**
 * Convert raw bukti path dari database → full URL yang bisa di-load browser.
 *
 * Backend menyimpan path sebagai: "public/bukti/filename.png"
 * Laravel serve via symlink:       /storage/bukti/filename.png
 * Frontend base URL:                http://localhost:8000
 *
 * Jika sudah berupa URL lengkap (http/https), langsung dikembalikan.
 * Jika berisi teks "Bukti dihapus" (audit trail), kembalikan null.
 */
const resolveBuktiUrl = (bukti: string | null): string | null => {
  if (!bukti) return null;
  if (bukti.startsWith("Bukti dihapus")) return null;
  if (bukti.startsWith("http://") || bukti.startsWith("https://")) return bukti;
  // "public/bukti/filename.png" → "/storage/bukti/filename.png"
  const relativePath = bukti.replace(/^public\//, "storage/");
  return `${import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"}/${relativePath}`;
};

// ─────────────────────────────────────────────────────────────────────────────
// Flat row type — dipakai untuk tabel + checkbox + export
// ─────────────────────────────────────────────────────────────────────────────
interface FlatRow {
  absensi_id: number;
  mata_pelajaran: string;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
  // konteks
  rombel: string;
  tahun_akademik: string;
  semester: string;
  status_tahun: string;
  status_semester: string;
}

const flattenDetail = (data: DetailAbsensiSiswaData): FlatRow[] => {
  const rows: FlatRow[] = [];
  data.histori_rombel.forEach((rombel) => {
    rombel.periode.forEach((periode) => {
      periode.semester.forEach((sem) => {
        sem.mata_pelajarans.forEach((mapel) => {
          mapel.absensi.forEach((abs) => {
            rows.push({
              absensi_id:    abs.absensi_id,
              mata_pelajaran: mapel.mata_pelajaran,
              hari:           abs.hari,
              status:         abs.status,
              bukti:          abs.bukti,
              rombel:         rombel.nama_rombel,
              tahun_akademik: periode.tahun_akademik,
              semester:       sem.semester,
              status_tahun:   periode.status_tahun,
              status_semester: sem.status_semester,
            });
          });
        });
      });
    });
  });
  return rows;
};

const sumTotal = (rows: FlatRow[]): TotalStatus => ({
  hadir: rows.filter((r) => r.status === "hadir").length,
  izin:  rows.filter((r) => r.status === "izin").length,
  sakit: rows.filter((r) => r.status === "sakit").length,
  alfa:  rows.filter((r) => r.status === "alfa").length,
});

// ─────────────────────────────────────────────────────────────────────────────
const DetailAbsensiSiswa = () => {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [detailData, setDetailData]   = useState<DetailAbsensiSiswaData | null>(null);
  const [flatRows, setFlatRows]       = useState<FlatRow[]>([]);
  const [loading, setLoading]         = useState(true);

  // Accordion
  const [expandedRombel,  setExpandedRombel]  = useState<Set<number>>(new Set());
  const [expandedPeriode, setExpandedPeriode] = useState<Set<number>>(new Set());
  const [expandedSemester,setExpandedSemester]= useState<Set<number>>(new Set());

  // Search + pagination
  const [searchTerm,    setSearchTerm]    = useState("");
  const [rowsPerPage,   setRowsPerPage]   = useState(10);
  const [currentPage,   setCurrentPage]   = useState(1);

  // Checkbox (pada tabel flat)
  const [selectedIds,   setSelectedIds]   = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Preview bukti
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewImage,  setPreviewImage]  = useState<string | null>(null);

  const toggle = (set: Set<number>, id: number): Set<number> => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => { fetchDetail(); }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await absensiSiswaService.getDetail(Number(id));
      if (res.status === "success") {
        setDetailData(res.data);
        const flat = flattenDetail(res.data);
        setFlatRows(flat);

        // Auto-expand rombel & periode aktif
        const aktifRombelIds: number[]  = [];
        const aktifPeriodeIds: number[] = [];
        const aktifSemIds: number[]     = [];

        res.data.histori_rombel.forEach((r) => {
          r.periode.forEach((p) => {
            if (p.status_tahun === "aktif") {
              aktifRombelIds.push(r.rombel_id);
              aktifPeriodeIds.push(p.tahun_akademik_id);
              p.semester.forEach((s) => {
                if (s.status_semester === "aktif") aktifSemIds.push(s.semester_id);
              });
            }
          });
        });

        setExpandedRombel(new Set(aktifRombelIds));
        setExpandedPeriode(new Set(aktifPeriodeIds));
        setExpandedSemester(new Set(aktifSemIds));
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: error.response?.data?.message || "Tidak dapat memuat detail absensi siswa.",
      });
      navigate("/superadmin/informasi-laporan-umum/absensi-siswa");
    } finally {
      setLoading(false);
    }
  };

  // ── Summary ───────────────────────────────────────────────────────────────
  const grandTotal = useMemo(() => sumTotal(flatRows), [flatRows]);
  const totalAbsensi = grandTotal.hadir + grandTotal.izin + grandTotal.sakit + grandTotal.alfa;
  const persentase = totalAbsensi > 0 ? ((grandTotal.hadir / totalAbsensi) * 100).toFixed(1) : "0";

  // ── Search (pada flat rows) ───────────────────────────────────────────────
  const filteredFlat = useMemo(() => {
    if (!searchTerm.trim()) return flatRows;
    const lower = searchTerm.toLowerCase();
    return flatRows.filter(
      (r) =>
        r.mata_pelajaran.toLowerCase().includes(lower) ||
        r.hari.toLowerCase().includes(lower) ||
        r.status.toLowerCase().includes(lower) ||
        r.rombel.toLowerCase().includes(lower) ||
        r.semester.toLowerCase().includes(lower)
    );
  }, [searchTerm, flatRows]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(filteredFlat.length / rowsPerPage);
  const paginated  = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredFlat.slice(start, start + rowsPerPage);
  }, [filteredFlat, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ── Checkbox ──────────────────────────────────────────────────────────────
  const isAllSelected  = paginated.length > 0 && paginated.every((r) => selectedIds.includes(r.absensi_id));
  const isSomeSelected = paginated.some((r) => selectedIds.includes(r.absensi_id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = (checked: boolean) =>
    setSelectedIds(checked ? paginated.map((r) => r.absensi_id) : []);

  const handleSelectOne = (id: number, checked: boolean) =>
    setSelectedIds((prev) => checked ? [...prev, id] : prev.filter((x) => x !== id));

  // ── Preview ───────────────────────────────────────────────────────────────
  const handlePreview = (url: string | null) => {
    if (!url) {
      Swal.fire({ icon: "info", title: "Tidak Ada Bukti", text: "Tidak ada bukti yang tersedia." });
      return;
    }
    setPreviewImage(url);
    setPreviewDialog(true);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const downloadBlob = (blob: Blob, filename: string) => {
    const url  = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href  = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = async (selected = false) => {
    try {
      const ids  = selected ? selectedIds : flatRows.map((r) => r.absensi_id);
      const blob = await absensiSiswaService.exportExcel(ids.length ? ids : undefined);
      const name = detailData?.nama_siswa.replace(/\s+/g, "-") ?? "siswa";
      downloadBlob(blob, `absensi-${name}.xlsx`);
      Swal.fire({ icon: "success", title: "Export Excel berhasil!", showConfirmButton: false, timer: 1500 });
    } catch {
      Swal.fire({ icon: "error", title: "Export gagal!" });
    }
  };

  const handleExportZip = async (selected = false) => {
    try {
      const ids  = selected ? selectedIds : flatRows.map((r) => r.absensi_id);
      const blob = await absensiSiswaService.exportZip(ids.length ? ids : undefined);
      const name = detailData?.nama_siswa.replace(/\s+/g, "-") ?? "siswa";
      downloadBlob(blob, `bukti-${name}.zip`);
      Swal.fire({ icon: "success", title: "Export ZIP berhasil!", showConfirmButton: false, timer: 1500 });
    } catch {
      Swal.fire({ icon: "error", title: "Export ZIP gagal!" });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title={`Detail Absensi - ${detailData?.nama_siswa ?? "Loading..."}`} />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-siswa")}>
              <ArrowLeft size={18} /> Kembali
            </Button>
            <h1 className="text-3xl font-bold">Detail Absensi Siswa</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : detailData ? (
            <>
              {/* Info Card */}
              <Card className="mb-6 border-indigo-200">
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nama Siswa</p>
                      <p className="text-lg font-bold">{detailData.nama_siswa}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">NISN</p>
                      <p className="text-lg font-bold">{detailData.nisn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">NIS</p>
                      <p className="text-lg font-bold">{detailData.nis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Absensi</p>
                      <p className="text-lg font-bold">{totalAbsensi} Hari</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {[
                  { label: "Hadir",  value: grandTotal.hadir,  color: "green",  Icon: UserCheck },
                  { label: "Izin",   value: grandTotal.izin,   color: "blue",   Icon: FileCheck },
                  { label: "Sakit",  value: grandTotal.sakit,  color: "yellow", Icon: FileX },
                  { label: "Alfa",   value: grandTotal.alfa,   color: "red",    Icon: XCircle },
                ].map(({ label, value, color, Icon }) => (
                  <Card key={label}>
                    <CardContent>
                      <div className="flex items-center gap-3">
                        <div className={`p-3 bg-${color}-100 rounded-full`}>
                          <Icon className={`text-${color}-600`} size={22} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{label}</p>
                          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 rounded-full"><UserCheck className="text-indigo-600" size={22} /></div>
                      <div>
                        <p className="text-sm text-gray-600">Persentase</p>
                        <p className="text-2xl font-bold text-indigo-600">{persentase}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── ACCORDION HISTORI ──────────────────────────────────── */}
              <h2 className="text-xl font-semibold mb-3">Histori Absensi per Rombel</h2>
              <div className="space-y-3 mb-8">
                {detailData.histori_rombel.map((rombel) => {
                  const isRombelOpen = expandedRombel.has(rombel.rombel_id);
                  return (
                    <div key={rombel.rombel_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                      {/* Header Rombel */}
                      <div
                        className="px-5 py-3 flex items-center gap-3 cursor-pointer bg-indigo-600 hover:bg-indigo-700 transition-colors"
                        onClick={() => setExpandedRombel(toggle(expandedRombel, rombel.rombel_id))}
                      >
                        {isRombelOpen ? <ChevronDownIcon size={18} className="text-white" /> : <ChevronRightIcon size={18} className="text-white" />}
                        <span className="font-bold text-white">🏫 {rombel.nama_rombel}</span>
                        <span className="text-indigo-200 text-sm">{rombel.periode.length} periode</span>
                      </div>

                      {isRombelOpen && (
                        <div className="divide-y divide-gray-100 p-2 space-y-2">
                          {rombel.periode.map((periode) => {
                            const isPeriodeOpen = expandedPeriode.has(periode.tahun_akademik_id);
                            return (
                              <div key={periode.tahun_akademik_id} className="border border-gray-100 rounded-md overflow-hidden">
                                {/* Header Periode / Tahun Akademik */}
                                <div
                                  className={`px-4 py-3 flex items-center justify-between cursor-pointer transition-colors ${
                                    periode.status_tahun === "aktif"
                                      ? "bg-primary hover:bg-primary/90"
                                      : "bg-gray-400 hover:bg-gray-500"
                                  }`}
                                  onClick={() => setExpandedPeriode(toggle(expandedPeriode, periode.tahun_akademik_id))}
                                >
                                  <div className="flex items-center gap-3">
                                    {isPeriodeOpen ? <ChevronDownIcon size={16} className="text-white" /> : <ChevronRightIcon size={16} className="text-white" />}
                                    <span className="font-semibold text-white">📅 {periode.tahun_akademik}</span>
                                    <Badge className={statusBadgeClass(periode.status_tahun)}>{periode.status_tahun}</Badge>
                                  </div>
                                  <div className="hidden md:flex items-center gap-3 text-white text-sm">
                                    <span>✅ <strong>{periode.total_status_tahun.hadir}</strong></span>
                                    <span>📋 <strong>{periode.total_status_tahun.izin}</strong></span>
                                    <span>🤒 <strong>{periode.total_status_tahun.sakit}</strong></span>
                                    <span>❌ <strong>{periode.total_status_tahun.alfa}</strong></span>
                                  </div>
                                </div>

                                {isPeriodeOpen && (
                                  <div className="divide-y divide-gray-100 p-2 space-y-2">
                                    {periode.semester.map((sem) => {
                                      const isSemOpen = expandedSemester.has(sem.semester_id);
                                      return (
                                        <div key={sem.semester_id} className="border border-gray-100 rounded-md overflow-hidden">
                                          {/* Header Semester */}
                                          <div
                                            className="px-4 py-2 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-indigo-50 transition-colors"
                                            onClick={() => setExpandedSemester(toggle(expandedSemester, sem.semester_id))}
                                          >
                                            <div className="flex items-center gap-2">
                                              {isSemOpen ? <ChevronDownIcon size={15} className="text-gray-500" /> : <ChevronRightIcon size={15} className="text-gray-500" />}
                                              <span className="font-semibold text-gray-700">📖 Semester {sem.semester}</span>
                                              <Badge className={statusBadgeClass(sem.status_semester)}>{sem.status_semester}</Badge>
                                            </div>
                                            <div className="hidden md:flex items-center gap-3 text-gray-500 text-sm">
                                              <span>H:<strong>{sem.total_status.hadir}</strong></span>
                                              <span>I:<strong>{sem.total_status.izin}</strong></span>
                                              <span>S:<strong>{sem.total_status.sakit}</strong></span>
                                              <span>A:<strong>{sem.total_status.alfa}</strong></span>
                                            </div>
                                          </div>

                                          {/* Tabel per Mata Pelajaran */}
                                          {isSemOpen && (
                                            <div className="divide-y divide-gray-50">
                                              {sem.mata_pelajarans.map((mapel) => (
                                                <div key={mapel.jadwal_pelajaran_id} className="px-4 py-3">
                                                  <p className="font-medium text-gray-700 mb-2">📚 {mapel.mata_pelajaran}</p>
                                                  <div className="overflow-x-auto">
                                                    <Table className="w-full text-sm">
                                                      <TableHeader>
                                                        <TableRow className="bg-gray-50">
                                                          <TableHead className="text-center w-10">No</TableHead>
                                                          <TableHead>Tanggal</TableHead>
                                                          <TableHead className="text-center">Status</TableHead>
                                                          <TableHead className="text-center">Bukti</TableHead>
                                                          <TableHead className="text-center">Aksi</TableHead>
                                                        </TableRow>
                                                      </TableHeader>
                                                      <TableBody>
                                                        {mapel.absensi.map((abs, i) => (
                                                          <TableRow key={abs.absensi_id} className="hover:bg-indigo-50 border-t border-gray-100">
                                                            <TableCell className="text-center">{i + 1}</TableCell>
                                                            <TableCell>{abs.hari}</TableCell>
                                                            <TableCell className="text-center">
                                                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(abs.status)}`}>
                                                                {abs.status.charAt(0).toUpperCase() + abs.status.slice(1)}
                                                              </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                              {resolveBuktiUrl(abs.bukti) ? (
                                                                <Button size="sm" variant="outline" onClick={() => handlePreview(resolveBuktiUrl(abs.bukti))} title="Lihat Bukti">
                                                                  <EyeIcon size={14} /> Lihat
                                                                </Button>
                                                              ) : (
                                                                <span className="text-xs text-gray-400">—</span>
                                                              )}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                              {/* Hanya edit jika status tahun/semester aktif */}
                                                              {periode.status_tahun === "aktif" && sem.status_semester === "aktif" ? (
                                                                <Button
                                                                  size="sm"
                                                                  title="Edit Absensi"
                                                                  onClick={() => navigate(`/superadmin/informasi-laporan-umum/absensi-siswa/edit/${abs.absensi_id}`)}
                                                                >
                                                                  <PenBoxIcon size={14} />
                                                                </Button>
                                                              ) : (
                                                                <span className="text-xs text-gray-400">Arsip</span>
                                                              )}
                                                            </TableCell>
                                                          </TableRow>
                                                        ))}
                                                      </TableBody>
                                                    </Table>
                                                  </div>
                                                </div>
                                              ))}
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
                      )}
                    </div>
                  );
                })}
              </div>

              {/* ── TABEL FLAT + EXPORT ────────────────────────────────── */}
              <h2 className="text-xl font-semibold mb-3">Semua Record Absensi (Flat)</h2>

              {/* Action + Search */}
              <div className="mb-4 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => handleExportExcel(false)}>
                    <FileSpreadsheet size={16} /> Export Semua Excel
                  </Button>
                  <Button variant="outline" onClick={() => handleExportExcel(true)} disabled={selectedIds.length === 0}>
                    <FileSpreadsheet size={16} /> Export Terpilih ({selectedIds.length})
                  </Button>
                  <Button variant="outline" onClick={() => handleExportZip(false)}>
                    <FileArchive size={16} /> Export Semua ZIP
                  </Button>
                  <Button variant="outline" onClick={() => handleExportZip(true)} disabled={selectedIds.length === 0}>
                    <FileArchive size={16} /> Export ZIP Terpilih ({selectedIds.length})
                  </Button>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="relative w-full md:w-1/3">
                    <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Cari mata pelajaran, tanggal, status..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="pl-8"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Tampilkan</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    >
                      {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <span>per halaman</span>
                  </div>
                </div>
              </div>

              {/* Flat Table */}
              <div className="w-full overflow-x-auto rounded mb-6">
                <Table className="min-w-full border border-gray-200 shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-center text-white w-12">
                        <input type="checkbox" ref={selectAllRef} checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                      </TableHead>
                      <TableHead className="text-center text-white">No</TableHead>
                      <TableHead className="text-white">Rombel</TableHead>
                      <TableHead className="text-white">Tahun Akademik</TableHead>
                      <TableHead className="text-white">Semester</TableHead>
                      <TableHead className="text-white">Mata Pelajaran</TableHead>
                      <TableHead className="text-white">Tanggal</TableHead>
                      <TableHead className="text-center text-white">Status</TableHead>
                      <TableHead className="text-center text-white">Bukti</TableHead>
                      <TableHead className="text-center text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((row, index) => (
                        <TableRow key={row.absensi_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center">
                            <Checkbox
                              checked={selectedIds.includes(row.absensi_id)}
                              onCheckedChange={(checked) => handleSelectOne(row.absensi_id, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{row.rombel}</TableCell>
                          <TableCell>
                            {row.tahun_akademik}
                            <Badge className={`ml-2 ${statusBadgeClass(row.status_tahun)}`}>{row.status_tahun}</Badge>
                          </TableCell>
                          <TableCell>
                            {row.semester}
                            <Badge className={`ml-2 ${statusBadgeClass(row.status_semester)}`}>{row.status_semester}</Badge>
                          </TableCell>
                          <TableCell>{row.mata_pelajaran}</TableCell>
                          <TableCell>{row.hari}</TableCell>
                          <TableCell className="text-center">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(row.status)}`}>
                              {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {resolveBuktiUrl(row.bukti) ? (
                              <Button size="sm" variant="outline" onClick={() => handlePreview(resolveBuktiUrl(row.bukti))}>
                                <EyeIcon size={14} /> Lihat
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.status_tahun === "aktif" && row.status_semester === "aktif" ? (
                              <Button size="sm" onClick={() => navigate(`/superadmin/informasi-laporan-umum/absensi-siswa/edit/${row.absensi_id}`)}>
                                <PenBoxIcon size={14} />
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">Arsip</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                          {searchTerm ? "Tidak ada data sesuai pencarian" : "Tidak ada data absensi"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                <p>
                  Menampilkan {Math.min((currentPage - 1) * rowsPerPage + 1, filteredFlat.length)}–{Math.min(currentPage * rowsPerPage, filteredFlat.length)} dari {filteredFlat.length} data
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>‹</Button>
                  <span className="px-3">Hal <strong>{currentPage}</strong> / <strong>{totalPages || 1}</strong></span>
                  <Button variant="outline" size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1)}>›</Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">Data tidak ditemukan</div>
          )}
        </div>

        <Footer />
      </main>

      {/* Preview Bukti */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview Bukti Izin / Sakit</DialogTitle>
            <DialogDescription>Bukti yang diunggah oleh siswa</DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg">
            {previewImage
              ? <img src={previewImage} alt="Bukti" className="max-w-full max-h-[70vh] rounded-lg shadow-lg" />
              : <p className="text-gray-500">Tidak ada gambar</p>
            }
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DetailAbsensiSiswa;