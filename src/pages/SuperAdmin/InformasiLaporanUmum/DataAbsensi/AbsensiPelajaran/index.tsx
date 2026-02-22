import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, SearchIcon, CalendarCheck, XCircle, UserCheck, EyeIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiPelajaranService } from "@/services/absensiPelajaranService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { TahunAkademikRekap, AbsensiPelajaranFlat } from "@/types/absensiPelajaran";

// ─────────────────────────────────────────────────────────────
// Helper: flatten TahunAkademikRekap[] → AbsensiPelajaranFlat[]
// ─────────────────────────────────────────────────────────────
const flattenRekap = (data: TahunAkademikRekap[]): AbsensiPelajaranFlat[] => {
  const flat: AbsensiPelajaranFlat[] = [];
  data.forEach((tahun) => {
    tahun.guru.forEach((guru) => {
      flat.push({
        guru_id: guru.guru_id,
        nama_guru: guru.nama_guru,
        tahun_akademik_id: tahun.tahun_akademik_id,
        tahun_akademik: tahun.tahun_akademik,
        status_tahun_akademik: tahun.status_tahun_akademik,
        hadir_pertahun: guru.hadir_pertahun,
        tidak_hadir_pertahun: guru.tidak_hadir_pertahun,
        is_editable: tahun.status_tahun_akademik === "aktif",
      });
    });
  });
  return flat;
};

const DataAbsensiPelajaran = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataFlat, setDataFlat] = useState<AbsensiPelajaranFlat[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Accordion untuk grouping per tahun akademik
  const [expandedTahun, setExpandedTahun] = useState<Set<number>>(new Set());
  const toggleTahun = (id: number) =>
    setExpandedTahun((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  // ── FETCH ─────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await absensiPelajaranService.getAll();
      if (res.status === "success") {
        const flat = flattenRekap(res.data);
        setDataFlat(flat);

        // Auto-expand tahun aktif
        const aktifIds = res.data.filter((t) => t.status_tahun_akademik === "aktif").map((t) => t.tahun_akademik_id);
        setExpandedTahun(new Set(aktifIds));
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data absensi pelajaran.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── SUMMARY CARDS ─────────────────────────────────────────
  const totalHadir = dataFlat.reduce((s, x) => s + x.hadir_pertahun, 0);
  const totalTidakHadir = dataFlat.reduce((s, x) => s + x.tidak_hadir_pertahun, 0);
  const persentase = totalHadir + totalTidakHadir > 0 ? ((totalHadir / (totalHadir + totalTidakHadir)) * 100).toFixed(1) : "0";

  // ── SEARCH ────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataFlat;
    const lower = searchTerm.toLowerCase();
    return dataFlat.filter((item) => item.nama_guru.toLowerCase().includes(lower) || item.tahun_akademik.toLowerCase().includes(lower));
  }, [searchTerm, dataFlat]);

  // ── GROUP untuk accordion view ────────────────────────────
  const grouped = useMemo(() => {
    const map = new Map<number, { tahun: Omit<TahunAkademikRekap, "guru">; rows: AbsensiPelajaranFlat[] }>();
    filteredData.forEach((item) => {
      if (!map.has(item.tahun_akademik_id)) {
        map.set(item.tahun_akademik_id, {
          tahun: {
            tahun_akademik_id: item.tahun_akademik_id,
            tahun_akademik: item.tahun_akademik,
            status_tahun_akademik: item.status_tahun_akademik,
          },
          rows: [],
        });
      }
      map.get(item.tahun_akademik_id)!.rows.push(item);
    });
    return Array.from(map.values());
  }, [filteredData]);

  // ── PAGINATION ────────────────────────────────────────────
  // Pagination diterapkan pada level group (tahun akademik), bukan flat row
  const totalPages = Math.ceil(grouped.length / rowsPerPage);
  const paginatedGrouped = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return grouped.slice(start, start + rowsPerPage);
  }, [grouped, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Reset ke halaman 1 jika search berubah
  // (sudah ada di onChange handler search, tapi tambahkan juga jika rowsPerPage berubah)
  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Absensi Pelajaran Guru" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Absensi Pelajaran Guru</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
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
                        <p className="text-2xl font-bold text-green-600">{persentase}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search + Rows Per Page */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Cari nama guru atau tahun akademik..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Tampilkan</span>
                  <select value={rowsPerPage} onChange={handleRowsPerPageChange} className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    {[5, 10, 25, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <span>tahun akademik per halaman</span>
                </div>
              </div>

              {/* Accordion per Tahun Akademik (paginated) */}
              <div className="space-y-3">
                {paginatedGrouped.length > 0 ? (
                  paginatedGrouped.map(({ tahun, rows }) => {
                    const isExpanded = expandedTahun.has(tahun.tahun_akademik_id);
                    const totalHadirTahun = rows.reduce((s, r) => s + r.hadir_pertahun, 0);
                    const totalTidakHadirTahun = rows.reduce((s, r) => s + r.tidak_hadir_pertahun, 0);

                    return (
                      <div key={tahun.tahun_akademik_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                        {/* Header Tahun Akademik */}
                        <div
                          className={`px-5 py-4 flex items-center justify-between cursor-pointer transition-colors ${tahun.status_tahun_akademik === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-400 hover:bg-gray-500"}`}
                          onClick={() => toggleTahun(tahun.tahun_akademik_id)}
                        >
                          <div className="flex items-center gap-3">
                            {isExpanded ? <ChevronDownIcon size={18} className="text-white shrink-0" /> : <ChevronRightIcon size={18} className="text-white shrink-0" />}
                            <span className="font-bold text-white">📅 {tahun.tahun_akademik}</span>
                            <Badge className={tahun.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-gray-200 text-gray-700 text-xs"}>{tahun.status_tahun_akademik}</Badge>
                            <span className="text-white text-sm opacity-80">{rows.length} guru</span>
                          </div>
                          <div className="flex items-center gap-4 text-white text-sm">
                            <span>
                              ✅ Hadir: <strong>{totalHadirTahun}</strong>
                            </span>
                            <span>
                              ❌ TH: <strong>{totalTidakHadirTahun}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Tabel Guru */}
                        {isExpanded && (
                          <div className="overflow-x-auto">
                            <Table className="w-full">
                              <TableHeader>
                                <TableRow className="bg-gray-50">
                                  <TableHead className="font-semibold text-center w-12">No</TableHead>
                                  <TableHead className="font-semibold">Nama Guru</TableHead>
                                  <TableHead className="font-semibold text-center">Total Hadir</TableHead>
                                  <TableHead className="font-semibold text-center">Total Tidak Hadir</TableHead>
                                  <TableHead className="font-semibold text-center">Persentase</TableHead>
                                  <TableHead className="font-semibold text-center">Aksi</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {rows.map((item, idx) => {
                                  const total = item.hadir_pertahun + item.tidak_hadir_pertahun;
                                  const persen = total > 0 ? ((item.hadir_pertahun / total) * 100).toFixed(1) : "0";
                                  return (
                                    <TableRow key={`${item.guru_id}-${item.tahun_akademik_id}`} className="hover:bg-indigo-50 border-t border-gray-100">
                                      <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                      <TableCell className="font-medium">{item.nama_guru}</TableCell>
                                      <TableCell className="text-center">
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">{item.hadir_pertahun}</span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">{item.tidak_hadir_pertahun}</span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${Number(persen) >= 75 ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{persen}%</span>
                                      </TableCell>
                                      <TableCell className="text-center">
                                        <Button size="sm" variant="outline" title="Lihat Detail Absensi Guru" onClick={() => navigate(`/superadmin/informasi-laporan-umum/absensi-pelajaran/detail/${item.guru_id}`)}>
                                          <EyeIcon size={15} />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 py-12">{searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data absensi pelajaran"}</div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-3 text-sm text-gray-600">
                  <p>
                    Menampilkan {Math.min((currentPage - 1) * rowsPerPage + 1, grouped.length)}–{Math.min(currentPage * rowsPerPage, grouped.length)} dari {grouped.length} tahun akademik
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
                          <span key={`ellipsis-${i}`} className="px-2">
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

export default DataAbsensiPelajaran;
