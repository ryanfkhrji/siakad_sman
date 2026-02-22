import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon, SearchIcon, FileSpreadsheet, ArrowLeft, UserCheck, XCircle, CalendarCheck, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiPegawaiService } from "@/services/absensiPegawaiService";
import { Card, CardContent } from "@/components/ui/card";
import type { AbsensiGuruDetail, AbsensiDetailItem } from "@/types/absensiPegawai";

const DetailAbsensiPegawai = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [detailData, setDetailData] = useState<AbsensiGuruDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Accordion state: key = "tahun-X" | "tahun-X-sem-Y"
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

  const toggleKey = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── FETCH ─────────────────────────────────────────────────
  useEffect(() => {
    fetchDetailData();
  }, [id]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);
      const res = await absensiPegawaiService.getDetail(Number(id));
      if (res.status === "success" && res.data.length > 0) {
        const guru: AbsensiGuruDetail = res.data[0];
        setDetailData(guru);

        // Auto-expand periode & semester aktif
        const expanded = new Set<string>();
        guru.periode.forEach((p, pi) => {
          const periodeKey = `tahun-${pi}`;
          if (p.status_tahun_akademik === "aktif") expanded.add(periodeKey);
          p.semester.forEach((s, si) => {
            if (s.status_semester === "aktif") {
              expanded.add(periodeKey);
              expanded.add(`${periodeKey}-sem-${si}`);
            }
          });
        });
        setExpandedKeys(expanded);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: error.response?.data?.message || "Tidak dapat memuat detail absensi pegawai.",
      });
      navigate("/superadmin/informasi-laporan-umum/absensi-pegawai");
    } finally {
      setLoading(false);
    }
  };

  // ── FLATTEN semua absensi untuk keperluan search & checkbox ─
  const allAbsensi = useMemo((): AbsensiDetailItem[] => {
    if (!detailData) return [];
    return detailData.periode.flatMap((p) => p.semester.flatMap((s) => s.absensi));
  }, [detailData]);

  // ── TOTAL keseluruhan ─────────────────────────────────────
  const totalHadir = detailData?.periode.reduce((s, p) => s + p.total_hadir, 0) ?? 0;
  const totalTidakHadir = detailData?.periode.reduce((s, p) => s + p.total_tidak_hadir, 0) ?? 0;
  const persentaseKehadiran = totalHadir + totalTidakHadir > 0 ? ((totalHadir / (totalHadir + totalTidakHadir)) * 100).toFixed(1) : "0";

  // ── SEARCH: filter absensi yang tampil di tabel dalam accordion
  const filteredAbsensi = (items: AbsensiDetailItem[]) => {
    if (!searchTerm.trim()) return items;
    const lower = searchTerm.toLowerCase();
    return items.filter((item) => item.hari.toLowerCase().includes(lower) || item.status.toLowerCase().includes(lower) || item.nama_mata_pelajaran?.toLowerCase().includes(lower));
  };

  // ── CHECKBOX ──────────────────────────────────────────────
  // selectedIds mengacu ke absensi_id di semua semester yang terlihat

  const visibleIds = useMemo(() => {
    if (!detailData) return [];
    return detailData.periode.flatMap((p, pi) => {
      if (!expandedKeys.has(`tahun-${pi}`)) return [];
      return p.semester.flatMap((s, si) => {
        if (!expandedKeys.has(`tahun-${pi}-sem-${si}`)) return [];
        return filteredAbsensi(s.absensi).map((a) => a.absensi_id);
      });
    });
  }, [expandedKeys, detailData, searchTerm]);

  const isAllSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const isSomeSelected = visibleIds.some((id) => selectedIds.includes(id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  // const handleSelectAll = (checked: boolean) => setSelectedIds(checked ? visibleIds : selectedIds.filter((x) => !visibleIds.includes(x)));

  const handleSelectOne = (id: number, checked: boolean) => setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  // ── EXPORT ────────────────────────────────────────────────
  const handleExportExcel = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : allAbsensi.map((a) => a.absensi_id);
      const blob = await absensiPegawaiService.exportExcel(ids);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `absensi-${detailData?.nama.replace(/\s+/g, "-")}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Export berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Export gagal!", text: error.response?.data?.message || "Terjadi kesalahan." });
    }
  };

  // ── RENDER TABEL ABSENSI PER SEMESTER ─────────────────────
  const renderTabelAbsensi = (items: AbsensiDetailItem[]) => {
    const filtered = filteredAbsensi(items);
    const semIds = filtered.map((a) => a.absensi_id);
    const semAllSelected = semIds.length > 0 && semIds.every((id) => selectedIds.includes(id));
    const semSomeSelected = semIds.some((id) => selectedIds.includes(id)) && !semAllSelected;

    return (
      <div className="overflow-x-auto">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-gray-100 text-gray-600">
              <TableHead className="text-center w-10">
                <input
                  type="checkbox"
                  checked={semAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = semSomeSelected;
                  }}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds((prev) => [...new Set([...prev, ...semIds])]);
                    else setSelectedIds((prev) => prev.filter((x) => !semIds.includes(x)));
                  }}
                  className="w-4 h-4 cursor-pointer"
                />
              </TableHead>
              <TableHead className="text-center font-semibold w-10">No</TableHead>
              <TableHead className="font-semibold">Hari / Tanggal</TableHead>
              <TableHead className="font-semibold">Mata Pelajaran</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((item, idx) => (
                <TableRow key={item.absensi_id} className="hover:bg-indigo-50 border-t border-gray-100">
                  <TableCell className="text-center">
                    <Checkbox checked={selectedIds.includes(item.absensi_id)} onCheckedChange={(checked) => handleSelectOne(item.absensi_id, !!checked)} />
                  </TableCell>
                  <TableCell className="text-center text-gray-500">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{item.hari}</TableCell>
                  <TableCell>{item.nama_mata_pelajaran ?? "-"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "hadir" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{item.status}</span>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400 py-4">
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
        <PageTitle title={`Detail Absensi - ${detailData?.nama ?? "Loading..."}`} />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-pegawai")}>
              <ArrowLeft size={18} className="mr-1" />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Detail Absensi Pegawai</h1>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Nama Guru</p>
                      <p className="text-lg font-bold">{detailData.nama}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Periode</p>
                      <p className="text-lg font-bold">{detailData.periode.length} Tahun Akademik</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Absensi</p>
                      <p className="text-lg font-bold">{totalHadir + totalTidakHadir} Hari</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <UserCheck className="text-blue-600" size={24} />
                      </div>
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
                      <div className="p-3 bg-red-100 rounded-full">
                        <XCircle className="text-red-600" size={24} />
                      </div>
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
                      <div className="p-3 bg-green-100 rounded-full">
                        <CalendarCheck className="text-green-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Persentase Kehadiran</p>
                        <p className="text-2xl font-bold text-green-600">{persentaseKehadiran}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons + Search */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
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
                  <Input type="text" placeholder="Cari hari, mata pelajaran, atau status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Accordion Periode → Semester → Tabel */}
              <div className="space-y-3">
                {detailData.periode.map((periode, pi) => {
                  const periodeKey = `tahun-${pi}`;
                  const isExpanded = expandedKeys.has(periodeKey);

                  return (
                    <div key={pi} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                      {/* Header Periode */}
                      <div
                        className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${periode.status_tahun_akademik === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-400 hover:bg-gray-500"}`}
                        onClick={() => toggleKey(periodeKey)}
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDownIcon size={18} className="text-white shrink-0" /> : <ChevronRightIcon size={18} className="text-white shrink-0" />}
                          <span className="font-bold text-white">📅 {periode.tahun_akademik}</span>
                          <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-gray-200 text-gray-700 text-xs"}>{periode.status_tahun_akademik}</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-white text-sm">
                          <span>
                            ✅ Hadir: <strong>{periode.total_hadir}</strong>
                          </span>
                          <span>
                            ❌ TH: <strong>{periode.total_tidak_hadir}</strong>
                          </span>
                        </div>
                      </div>

                      {/* Semester */}
                      {isExpanded && (
                        <div className="divide-y divide-gray-100">
                          {periode.semester.map((semester, si) => {
                            const semKey = `${periodeKey}-sem-${si}`;
                            const isSemExp = expandedKeys.has(semKey);

                            return (
                              <div key={si}>
                                {/* Sub-header Semester */}
                                <div className="px-5 py-3 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors" onClick={() => toggleKey(semKey)}>
                                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    {isSemExp ? <ChevronDownIcon size={14} className="text-gray-400" /> : <ChevronRightIcon size={14} className="text-gray-400" />}
                                    Semester {semester.semester}
                                    <Badge className={semester.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{semester.status_semester}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-500">
                                    <span>
                                      Hadir: <strong>{semester.total_hadir}</strong>
                                    </span>
                                    <span>
                                      TH: <strong>{semester.total_tidak_hadir}</strong>
                                    </span>
                                    <span>{semester.absensi.length} record</span>
                                  </div>
                                </div>

                                {/* Tabel absensi */}
                                {isSemExp && renderTabelAbsensi(semester.absensi)}
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
    </SidebarProvider>
  );
};

export default DetailAbsensiPegawai;
