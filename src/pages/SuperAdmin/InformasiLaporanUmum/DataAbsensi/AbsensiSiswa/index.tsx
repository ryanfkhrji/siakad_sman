import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, SearchIcon, FileSpreadsheet, FileArchive, UserCheck, XCircle, FileCheck, FileX, ChevronDownIcon, ChevronRightIcon, EyeIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { absensiSiswaService } from "@/services/absensiSiswaService";
import type { TahunAkademikAbsensiSiswa } from "@/types/absensiSiswa";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const statusBadgeClass = (status: string) => (status === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-gray-200 text-gray-700 text-xs");

const headerBgClass = (status: string) => (status === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-400 hover:bg-gray-500");

// ─────────────────────────────────────────────────────────────────────────────
const DataAbsensiSiswa = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [rawData, setRawData] = useState<TahunAkademikAbsensiSiswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Accordion state — expand per tahun_akademik_id
  const [expandedTahun, setExpandedTahun] = useState<Set<number>>(new Set());
  // Accordion nested — expand per rombel_id
  const [expandedRombel, setExpandedRombel] = useState<Set<number>>(new Set());

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleTahun = (id: number) =>
    setExpandedTahun((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleRombel = (id: number) =>
    setExpandedRombel((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await absensiSiswaService.getAll();
      if (res.status === "success") {
        setRawData(res.data);
        // Auto-expand tahun aktif
        const aktifIds = res.data.filter((t) => t.status_tahun === "aktif").map((t) => t.tahun_akademik_id);
        setExpandedTahun(new Set(aktifIds));
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data absensi siswa.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── Summary Cards ─────────────────────────────────────────────────────────
  const summaryTotal = useMemo(() => {
    let hadir = 0,
      izin = 0,
      sakit = 0,
      alfa = 0;
    rawData.forEach((t) =>
      t.rombel.forEach((r) =>
        r.siswa.forEach((s) => {
          hadir += s.hadir_pertahun;
          izin += s.izin_pertahun;
          sakit += s.sakit_pertahun;
          alfa += s.alfa_pertahun;
        }),
      ),
    );
    return { hadir, izin, sakit, alfa };
  }, [rawData]);

  // ── Filter + Group ────────────────────────────────────────────────────────
  const filteredData = useMemo<TahunAkademikAbsensiSiswa[]>(() => {
    if (!searchTerm.trim()) return rawData;
    const lower = searchTerm.toLowerCase();
    return rawData
      .map((tahun) => ({
        ...tahun,
        rombel: tahun.rombel
          .map((r) => ({
            ...r,
            siswa: r.siswa.filter((s) => s.nama.toLowerCase().includes(lower) || s.nisn.toLowerCase().includes(lower) || r.nama_rombel.toLowerCase().includes(lower) || tahun.tahun_akademik.toLowerCase().includes(lower)),
          }))
          .filter((r) => r.siswa.length > 0),
      }))
      .filter((t) => t.rombel.length > 0);
  }, [searchTerm, rawData]);

  // ── Pagination (per tahun akademik) ───────────────────────────────────────
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    try {
      const blob = await absensiSiswaService.exportExcel();
      downloadBlob(blob, "absensi-siswa-pelajaran.xlsx");
      Swal.fire({ icon: "success", title: "Export Excel berhasil!", showConfirmButton: false, timer: 1500 });
    } catch {
      Swal.fire({ icon: "error", title: "Export gagal!" });
    }
  };

  const handleExportZip = async () => {
    try {
      const blob = await absensiSiswaService.exportZip();
      downloadBlob(blob, "bukti-absensi-siswa.zip");
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
        <PageTitle title="Data Absensi Siswa - Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Absensi Siswa - Pelajaran</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-full">
                        <UserCheck className="text-green-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Hadir</p>
                        <p className="text-2xl font-bold text-green-600">{summaryTotal.hadir}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FileCheck className="text-blue-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Izin</p>
                        <p className="text-2xl font-bold text-blue-600">{summaryTotal.izin}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <FileX className="text-yellow-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Sakit</p>
                        <p className="text-2xl font-bold text-yellow-600">{summaryTotal.sakit}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-red-100 rounded-full">
                        <XCircle className="text-red-600" size={22} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Alfa</p>
                        <p className="text-2xl font-bold text-red-600">{summaryTotal.alfa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Cari nama siswa, NISN, rombel, atau tahun..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Tampilkan</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {[5, 10, 25, 50].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                    <span>per halaman</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportExcel}>
                    <FileSpreadsheet size={16} /> Export Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportZip}>
                    <FileArchive size={16} /> Export ZIP
                  </Button>
                </div>
              </div>

              {/* Accordion Tahun Akademik */}
              <div className="space-y-3">
                {paginatedData.length > 0 ? (
                  paginatedData.map((tahun) => {
                    const isTahunExpanded = expandedTahun.has(tahun.tahun_akademik_id);
                    const totalSiswaTahun = tahun.rombel.reduce((s, r) => s + r.siswa.length, 0);
                    const totalHadirTahun = tahun.rombel.reduce((s, r) => s + r.siswa.reduce((ss, sw) => ss + sw.hadir_pertahun, 0), 0);
                    const totalAlphaTahun = tahun.rombel.reduce((s, r) => s + r.siswa.reduce((ss, sw) => ss + sw.alfa_pertahun, 0), 0);

                    return (
                      <div key={tahun.tahun_akademik_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                        {/* Header Tahun Akademik */}
                        <div className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${headerBgClass(tahun.status_tahun)}`} onClick={() => toggleTahun(tahun.tahun_akademik_id)}>
                          <div className="flex items-center gap-3 flex-wrap">
                            {isTahunExpanded ? <ChevronDownIcon size={18} className="text-white shrink-0" /> : <ChevronRightIcon size={18} className="text-white shrink-0" />}
                            <span className="font-bold text-white">📅 {tahun.tahun_akademik}</span>
                            <Badge className={statusBadgeClass(tahun.status_tahun)}>{tahun.status_tahun}</Badge>
                            <span className="text-white text-sm opacity-80">
                              {tahun.rombel.length} rombel · {totalSiswaTahun} siswa
                            </span>
                          </div>
                          <div className="hidden md:flex items-center gap-4 text-white text-sm">
                            <span>
                              ✅ Hadir: <strong>{totalHadirTahun}</strong>
                            </span>
                            <span>
                              ❌ Alfa: <strong>{totalAlphaTahun}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Nested Rombel Accordion */}
                        {isTahunExpanded && (
                          <div className="divide-y divide-gray-100">
                            {tahun.rombel.map((rombel) => {
                              const isRombelExpanded = expandedRombel.has(rombel.rombel_id);
                              const totalHadirRombel = rombel.siswa.reduce((s, sw) => s + sw.hadir_pertahun, 0);
                              const totalAlfaRombel = rombel.siswa.reduce((s, sw) => s + sw.alfa_pertahun, 0);

                              return (
                                <div key={rombel.rombel_id}>
                                  {/* Header Rombel */}
                                  <div className="px-6 py-3 flex items-center justify-between cursor-pointer bg-gray-50 hover:bg-indigo-50 transition-colors" onClick={() => toggleRombel(rombel.rombel_id)}>
                                    <div className="flex items-center gap-2">
                                      {isRombelExpanded ? <ChevronDownIcon size={16} className="text-gray-500 shrink-0" /> : <ChevronRightIcon size={16} className="text-gray-500 shrink-0" />}
                                      <span className="font-semibold text-gray-700">🏫 {rombel.nama_rombel}</span>
                                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">Tingkat {rombel.tingkat}</Badge>
                                      <span className="text-gray-500 text-sm">{rombel.siswa.length} siswa</span>
                                    </div>
                                    <div className="hidden md:flex items-center gap-4 text-gray-600 text-sm">
                                      <span>
                                        ✅ <strong>{totalHadirRombel}</strong>
                                      </span>
                                      <span>
                                        ❌ <strong>{totalAlfaRombel}</strong>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Tabel Siswa */}
                                  {isRombelExpanded && (
                                    <div className="overflow-x-auto">
                                      <Table className="w-full">
                                        <TableHeader>
                                          <TableRow className="bg-gray-50">
                                            <TableHead className="font-semibold text-center w-12">No</TableHead>
                                            <TableHead className="font-semibold">Nama Siswa</TableHead>
                                            <TableHead className="font-semibold">NISN</TableHead>
                                            <TableHead className="font-semibold text-center">Hadir</TableHead>
                                            <TableHead className="font-semibold text-center">Izin</TableHead>
                                            <TableHead className="font-semibold text-center">Sakit</TableHead>
                                            <TableHead className="font-semibold text-center">Alfa</TableHead>
                                            <TableHead className="font-semibold text-center">Aksi</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {rombel.siswa.map((siswa, idx) => (
                                            <TableRow key={`${siswa.siswa_id}-${rombel.rombel_id}`} className="hover:bg-indigo-50 border-t border-gray-100">
                                              <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                              <TableCell className="font-medium">{siswa.nama}</TableCell>
                                              <TableCell className="text-gray-500 text-sm">{siswa.nisn}</TableCell>
                                              <TableCell className="text-center">
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">{siswa.hadir_pertahun}</span>
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{siswa.izin_pertahun}</span>
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">{siswa.sakit_pertahun}</span>
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">{siswa.alfa_pertahun}</span>
                                              </TableCell>
                                              <TableCell className="text-center">
                                                <Button size="sm" variant="outline" title="Lihat Detail Absensi Siswa" onClick={() => navigate(`/superadmin/informasi-laporan-umum/absensi-siswa/detail/${siswa.siswa_id}`)}>
                                                  <EyeIcon size={15} />
                                                </Button>
                                              </TableCell>
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
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-12">{searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data absensi siswa"}</div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-3 text-sm text-gray-600">
                  <p>
                    Menampilkan {Math.min((currentPage - 1) * rowsPerPage + 1, filteredData.length)}–{Math.min(currentPage * rowsPerPage, filteredData.length)} dari {filteredData.length} tahun akademik
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                      «
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                      ‹
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                      .reduce<(number | "...")[]>((acc, p, i, arr) => {
                        if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push("...");
                        acc.push(p);
                        return acc;
                      }, [])
                      .map((p, i) =>
                        p === "..." ? (
                          <span key={`e-${i}`} className="px-2">
                            …
                          </span>
                        ) : (
                          <Button key={p} variant={currentPage === p ? "default" : "outline"} size="sm" onClick={() => handlePageChange(p as number)}>
                            {p}
                          </Button>
                        ),
                      )}
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                      ›
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                      »
                    </Button>
                  </div>
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

export default DataAbsensiSiswa;
