import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2Icon, SearchIcon, FileSpreadsheet, ArrowLeft, UserCheck, XCircle, CalendarCheck } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiPegawaiService } from "@/services/absensiPegawaiService";
import { Card, CardContent } from "@/components/ui/card";

interface AbsensiDetail {
  id: number;
  hari: string;
  status: "hadir" | "tidak hadir";
}

interface DetailAbsensiData {
  guru_id: number;
  nama_guru: string;
  mengajar: string;
  total_hadir: number;
  total_tidak_hadir: number;
  absensi: AbsensiDetail[];
}

const DetailAbsensiPegawai = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [detailData, setDetailData] = useState<DetailAbsensiData | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<AbsensiDetail[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Fetch detail data
  useEffect(() => {
    fetchDetailData();
  }, [id]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);
      const response = await absensiPegawaiService.getDetail(Number(id));

      if (response.status === "success" && response.data.length > 0) {
        setDetailData(response.data[0]);
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

  // Search filtering
  useEffect(() => {
    if (!detailData) return;

    if (searchTerm.trim() === "") {
      setFilteredData(detailData.absensi);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(detailData.absensi.filter((item) => item.hari.toLowerCase().includes(lower) || item.status.toLowerCase().includes(lower)));
    }
    setCurrentPage(1);
  }, [searchTerm, detailData]);

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
      const ids = selected ? selectedIds : detailData?.absensi.map((item) => item.id);
      const blob = await absensiPegawaiService.exportExcel(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `absensi-${detailData?.nama_guru.replace(/\s+/g, "-")}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Export berhasil!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Export gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan saat mengekspor data.",
      });
    }
  };

  // Calculate percentage
  const persentaseKehadiran = detailData ? (detailData.total_hadir + detailData.total_tidak_hadir > 0 ? ((detailData.total_hadir / (detailData.total_hadir + detailData.total_tidak_hadir)) * 100).toFixed(1) : 0) : 0;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title={`Detail Absensi - ${detailData?.nama_guru || "Loading..."}`} />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-pegawai")}>
              <ArrowLeft size={18} />
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
              <Card className="mb-6 bg-white border-indigo-200">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nama Guru</p>
                      <p className="text-lg font-bold text-gray-900">{detailData.nama_guru}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mata Pelajaran</p>
                      <p className="text-lg font-bold text-gray-900">{detailData.mengajar}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Absensi</p>
                      <p className="text-lg font-bold text-gray-900">{detailData.total_hadir + detailData.total_tidak_hadir} Hari</p>
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
                        <p className="text-2xl font-bold text-blue-600">{detailData.total_hadir}</p>
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
                        <p className="text-2xl font-bold text-red-600">{detailData.total_tidak_hadir}</p>
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

              {/* Action Buttons */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" onClick={() => handleExportExcel(false)}>
                    <FileSpreadsheet size={18} />
                    Export Semua Excel
                  </Button>

                  <Button variant="outline" onClick={() => handleExportExcel(true)} disabled={selectedIds.length === 0}>
                    <FileSpreadsheet size={18} />
                    Export Terpilih Excel ({selectedIds.length})
                  </Button>
                </div>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari hari atau status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
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
                      <TableHead className="font-semibold text-white">Hari/Tanggal</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
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
                          <TableCell className="font-medium">{item.hari}</TableCell>
                          <TableCell>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "hadir" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          Tidak ada data absensi yang ditemukan
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
                    <option value="25">25</option>
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
          ) : (
            <div className="text-center text-gray-500 py-8">Data tidak ditemukan</div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailAbsensiPegawai;
