import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSiswa } from "@/components/SidebarSiswa";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2Icon, SearchIcon, FileSpreadsheet, FilePlus, UserCheck, XCircle, BookOpen } from "lucide-react";
import Footer from "@/pages/Footer";
import type { AbsensiDetailSelf } from "@/types/absensiSiswa";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiSiswaService } from "@/services/absensiSiswaService";
import { Card, CardContent } from "@/components/ui/card";

const DataAbsensiPelajaranSiswa = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataAbsensi, setDataAbsensi] = useState<AbsensiDetailSelf[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<AbsensiDetailSelf[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Summary data
  const [namaSiswa, setNamaSiswa] = useState("");
  const [kelas, setKelas] = useState("");
  const [totalHadir, setTotalHadir] = useState(0);
  const [totalIzin, setTotalIzin] = useState(0);
  const [totalSakit, setTotalSakit] = useState(0);
  const [totalAlfa, setTotalAlfa] = useState(0);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await absensiSiswaService.getAllSelf();

      if (response.status === "success") {
        setNamaSiswa(response.data.nama_siswa);
        setKelas(response.data.kelas);
        setTotalHadir(response.data.total_hadir);
        setTotalIzin(response.data.total_izin);
        setTotalSakit(response.data.total_sakit);
        setTotalAlfa(response.data.total_alfa);
        setDataAbsensi(response.data.absensi);
      }
    } catch (error: any) {
      // Jika belum ada data absensi (404), tidak perlu error
      if (error.response?.status === 404) {
        setDataAbsensi([]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data absensi.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(dataAbsensi);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(dataAbsensi.filter((item) => item.hari.toLowerCase().includes(lower) || item.status.toLowerCase().includes(lower) || item.mata_pelajaran.toLowerCase().includes(lower)));
    }
    setCurrentPage(1);
  }, [searchTerm, dataAbsensi]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Checkbox handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(paginated.map((item) => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const isAllSelected = paginated.length > 0 && paginated.every((item) => selectedIds.includes(item.id));
  const isSomeSelected = paginated.some((item) => selectedIds.includes(item.id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isSomeSelected;
    }
  }, [isSomeSelected]);

  // Export Excel
  const handleExportExcel = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : undefined;
      const blob = await absensiSiswaService.exportSelf(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "absensi-pelajaran-saya.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Export berhasil!",
        showConfirmButton: false,
        timer: 3000,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Export gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan saat mengekspor data.",
        timer: 3000,
        showConfirmButton: false,
      });
    }
  };

  // Calculate percentage
  const totalAbsensi = totalHadir + totalIzin + totalSakit + totalAlfa;
  const persentaseKehadiran = totalAbsensi > 0 ? ((totalHadir / totalAbsensi) * 100).toFixed(1) : 0;

  // Status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "hadir":
        return "bg-green-100 text-green-800";
      case "izin":
        return "bg-blue-100 text-blue-800";
      case "sakit":
        return "bg-yellow-100 text-yellow-800";
      case "alfa":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <PageTitle title="Absensi Pelajaran Saya" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Absensi Pelajaran Saya</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-full">
                        <UserCheck className="text-green-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Hadir</p>
                        <p className="text-2xl font-bold text-green-600">{totalHadir}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <BookOpen className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Izin</p>
                        <p className="text-2xl font-bold text-blue-600">{totalIzin}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <XCircle className="text-yellow-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Sakit</p>
                        <p className="text-2xl font-bold text-yellow-600">{totalSakit}</p>
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
                        <p className="text-sm text-gray-600">Total Alfa</p>
                        <p className="text-2xl font-bold text-red-600">{totalAlfa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Info Card */}
              <Card className="mb-6">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nama Siswa</p>
                      <p className="text-base font-semibold">{namaSiswa}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kelas</p>
                      <p className="text-base font-semibold">{kelas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Persentase Kehadiran</p>
                      <p className="text-base font-semibold text-green-600">{persentaseKehadiran}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-primary" onClick={() => navigate("/siswa/data-absensi/pelajaran/create")}>
                    <FilePlus size={18} />
                    Absensi Sekarang
                  </Button>

                  <Button variant="outline" onClick={() => handleExportExcel(true)} disabled={selectedIds.length === 0}>
                    <FileSpreadsheet size={18} />
                    Export Terpilih Excel ({selectedIds.length})
                  </Button>

                  <Button variant="outline" onClick={() => handleExportExcel(false)}>
                    <FileSpreadsheet size={18} />
                    Export Semua Excel
                  </Button>
                </div>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari hari/status/mata pelajaran..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-center font-semibold text-white w-12">
                        <input type="checkbox" ref={selectAllRef} checked={isAllSelected} onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4 cursor-pointer" />
                      </TableHead>
                      <TableHead className="text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">Mata Pelajaran</TableHead>
                      <TableHead className="font-semibold text-white">Hari</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      <TableHead className="font-semibold text-white">Bukti</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((item, index) => (
                        <TableRow key={item.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center">
                            <Checkbox checked={selectedIds.includes(item.id)} onCheckedChange={(checked) => handleSelectOne(item.id, !!checked)} />
                          </TableCell>
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{item.mata_pelajaran || "-"}</TableCell>
                          <TableCell>{item.hari || "Tidak ada"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(item.status)}`}>{item.status}</span>
                          </TableCell>
                          <TableCell>
                            {item.bukti ? (
                              <a href={item.bukti} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                                Lihat Bukti
                              </a>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                          Belum ada data absensi
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Tampilkan:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="10">10</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span>data per halaman</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
                    Prev
                  </Button>
                  <span className="text-sm">
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages || 1}</strong>
                  </span>
                  <Button size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => handlePageChange(currentPage + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataAbsensiPelajaranSiswa;
