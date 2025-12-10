import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2Icon, SearchIcon, FileSpreadsheet, ArrowLeft, UserCheck, FileCheck, FileX, XCircle, FileArchive, EyeIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiSiswaService } from "@/services/absensiSiswaService";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AbsensiDetail {
  id: number;
  mata_pelajaran: string;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
}

interface DetailAbsensiData {
  siswa_id: number;
  nama_siswa: string;
  kelas: string;
  total_hadir: number;
  total_izin: number;
  total_sakit: number;
  total_alfa: number;
  absensi: AbsensiDetail[];
}

const DetailAbsensiSiswa = () => {
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

  // Preview bukti dialog
  const [previewDialog, setPreviewDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ========== FETCH DETAIL DATA ==========
  useEffect(() => {
    fetchDetailData();
  }, [id]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);
      const response = await absensiSiswaService.getDetail(Number(id));

      if (response.status === "success" && response.data.length > 0) {
        setDetailData(response.data[0]);
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

  // ========== SEARCH FILTERING ==========
  useEffect(() => {
    if (!detailData) return;

    if (searchTerm.trim() === "") {
      setFilteredData(detailData.absensi);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(detailData.absensi.filter((item) => item.mata_pelajaran.toLowerCase().includes(lower) || item.hari.toLowerCase().includes(lower) || item.status.toLowerCase().includes(lower)));
    }
    setCurrentPage(1);
  }, [searchTerm, detailData]);

  // ========== PAGINATION ==========
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ========== CHECKBOX HANDLERS ==========
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

  // ========== PREVIEW BUKTI ==========
  const handlePreviewBukti = (buktiUrl: string | null) => {
    if (buktiUrl) {
      setPreviewImage(buktiUrl);
      setPreviewDialog(true);
    } else {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Bukti",
        text: "Tidak ada bukti yang tersedia untuk absensi ini.",
      });
    }
  };

  // ========== EXPORT EXCEL ==========
  const handleExportExcel = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : detailData?.absensi.map((item) => item.id);
      const blob = await absensiSiswaService.exportExcel(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `absensi-${detailData?.nama_siswa.replace(/\s+/g, "-")}.xlsx`;
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

  // ========== EXPORT ZIP ==========
  const handleExportZip = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : detailData?.absensi.map((item) => item.id);
      const blob = await absensiSiswaService.exportZip(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bukti-izin-${detailData?.nama_siswa.replace(/\s+/g, "-")}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Export ZIP berhasil!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Export ZIP gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan saat mengekspor bukti.",
      });
    }
  };

  // ========== CALCULATE TOTALS ==========
  const totalAbsensi = detailData ? detailData.total_hadir + detailData.total_izin + detailData.total_sakit + detailData.total_alfa : 0;

  const persentaseKehadiran = detailData && totalAbsensi > 0 ? ((detailData.total_hadir / totalAbsensi) * 100).toFixed(1) : 0;

  // ========== RENDER ==========
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title={`Detail Absensi - ${detailData?.nama_siswa || "Loading..."}`} />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header with back button */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-siswa")}>
              <ArrowLeft size={18} />
              Kembali
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
              <Card className="mb-6 bg-white border-indigo-200">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Nama Siswa</p>
                      <p className="text-lg font-bold text-gray-900">{detailData.nama_siswa}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Kelas</p>
                      <p className="text-lg font-bold text-gray-900">{detailData.kelas}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Absensi</p>
                      <p className="text-lg font-bold text-gray-900">{totalAbsensi} Hari</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-green-100 rounded-full">
                        <UserCheck className="text-green-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Hadir</p>
                        <p className="text-2xl font-bold text-green-600">{detailData.total_hadir}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <FileCheck className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Izin</p>
                        <p className="text-2xl font-bold text-blue-600">{detailData.total_izin}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <FileX className="text-yellow-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sakit</p>
                        <p className="text-2xl font-bold text-yellow-600">{detailData.total_sakit}</p>
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
                        <p className="text-sm text-gray-600">Alfa</p>
                        <p className="text-2xl font-bold text-red-600">{detailData.total_alfa}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-100 rounded-full">
                        <UserCheck className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Persentase</p>
                        <p className="text-2xl font-bold text-indigo-600">{persentaseKehadiran}%</p>
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

                  <Button variant="outline" onClick={() => handleExportZip(false)}>
                    <FileArchive size={18} />
                    Export Semua Bukti (ZIP)
                  </Button>

                  <Button variant="outline" onClick={() => handleExportZip(true)} disabled={selectedIds.length === 0}>
                    <FileArchive size={18} />
                    Export Bukti Terpilih (ZIP) ({selectedIds.length})
                  </Button>
                </div>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari mata pelajaran/hari/status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
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
                      <TableHead className="font-semibold text-white">Hari/Tanggal</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      <TableHead className="text-center font-semibold text-white">Bukti</TableHead>
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
                          <TableCell className="font-medium">{item.mata_pelajaran}</TableCell>
                          <TableCell>{item.hari}</TableCell>
                          <TableCell>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                item.status === "hadir" ? "bg-green-100 text-green-800" : item.status === "izin" ? "bg-blue-100 text-blue-800" : item.status === "sakit" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            {item.bukti ? (
                              <Button size="sm"  onClick={() => handlePreviewBukti(item.bukti)} title="Lihat Bukti">
                                <EyeIcon size={16} /> Lihat
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-400">Tidak ada</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
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

      {/* Preview Bukti Dialog */}
      <Dialog open={previewDialog} onOpenChange={setPreviewDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Preview Bukti Izin/Sakit</DialogTitle>
            <DialogDescription>Bukti yang diunggah oleh siswa</DialogDescription>
          </DialogHeader>

          <div className="flex justify-center items-center p-4 bg-gray-50 rounded-lg">
            {previewImage ? <img src={previewImage} alt="Bukti" className="max-w-full max-h-[70vh] rounded-lg shadow-lg" /> : <p className="text-gray-500">Tidak ada gambar untuk ditampilkan</p>}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DetailAbsensiSiswa;
