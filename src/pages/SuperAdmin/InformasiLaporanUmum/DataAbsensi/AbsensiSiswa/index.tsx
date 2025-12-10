import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2Icon, SearchIcon, Trash2Icon, FileSpreadsheet, PenBoxIcon, EyeIcon, FileArchive, UserCheck, XCircle, FileCheck, FileX } from "lucide-react";
import Footer from "@/pages/Footer";
import type { AbsensiSiswaFlat } from "@/types/absensiSiswa";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiSiswaService } from "@/services/absensiSiswaService";
import { Card, CardContent } from "@/components/ui/card";

const DataAbsensiSiswa = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataAbsensi, setDataAbsensi] = useState<AbsensiSiswaFlat[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<AbsensiSiswaFlat[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Summary statistics
  const [totalHadir, setTotalHadir] = useState(0);
  const [totalIzin, setTotalIzin] = useState(0);
  const [totalSakit, setTotalSakit] = useState(0);
  const [totalAlfa, setTotalAlfa] = useState(0);

  // Store siswa_id untuk setiap row
  const [siswaIdMap, setSiswaIdMap] = useState<Map<number, number>>(new Map());

  // ========== FETCH DATA ==========
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await absensiSiswaService.getAll();

      if (response.status === "success") {
        // Flatten nested data structure
        const flatData: AbsensiSiswaFlat[] = [];
        const tempSiswaIdMap = new Map<number, number>();

        response.data.forEach((siswa: any) => {
          siswa.absensi.forEach((abs: any) => {
            flatData.push({
              id: abs.id,
              nama_siswa: siswa.nama_siswa,
              kelas: siswa.kelas,
              mata_pelajaran: abs.mata_pelajaran,
              hari: abs.hari,
              status: abs.status,
              bukti: abs.bukti,
              total_hadir: siswa.total_hadir,
              total_izin: siswa.total_izin,
              total_sakit: siswa.total_sakit,
              total_alfa: siswa.total_alfa,
            });
            // Simpan mapping absensi id -> siswa_id
            tempSiswaIdMap.set(abs.id, siswa.siswa_id);
          });
        });

        setSiswaIdMap(tempSiswaIdMap);
        setDataAbsensi(flatData);

        // Hitung total
        setTotalHadir(flatData.reduce((total, item) => total + (item.status === "hadir" ? 1 : 0), 0));
        setTotalIzin(flatData.reduce((total, item) => total + (item.status === "izin" ? 1 : 0), 0));
        setTotalSakit(flatData.reduce((total, item) => total + (item.status === "sakit" ? 1 : 0), 0));
        setTotalAlfa(flatData.reduce((total, item) => total + (item.status === "alfa" ? 1 : 0), 0));
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: error.response?.data?.message || "Tidak dapat memuat data absensi siswa.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== SEARCH FILTERING ==========
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(dataAbsensi);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(
        dataAbsensi.filter(
          (item) =>
            item.nama_siswa.toLowerCase().includes(lower) ||
            item.kelas.toLowerCase().includes(lower) ||
            item.mata_pelajaran.toLowerCase().includes(lower) ||
            item.hari.toLowerCase().includes(lower)
        )
      );
    }
    setCurrentPage(1);
  }, [searchTerm, dataAbsensi]);

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

  // ========== NAVIGATE TO DETAIL ==========
  const handleViewDetail = (item: AbsensiSiswaFlat) => {
    const siswaId = siswaIdMap.get(item.id);
    if (siswaId) {
      navigate(`/superadmin/informasi-laporan-umum/absensi-siswa/detail/${siswaId}`);
    }
  };

  // ========== NAVIGATE TO EDIT ==========
  const handleEdit = (item: AbsensiSiswaFlat) => {
    navigate(`/superadmin/informasi-laporan-umum/absensi-siswa/edit/${item.id}`);
  };

  // ========== DELETE HANDLER ==========
  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak ada data dipilih",
        text: "Pilih minimal 1 data untuk dihapus",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `${selectedIds.length} data akan dihapus dan tidak dapat dikembalikan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await absensiSiswaService.deleteMultiple(selectedIds);

      setDataAbsensi((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil dihapus.",
        showConfirmButton: false,
        timer: 1800,
      });

      fetchData(); // Refresh untuk update summary
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan saat menghapus data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========== EXPORT EXCEL ==========
  const handleExportExcel = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : undefined;
      const blob = await absensiSiswaService.exportExcel(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "absensi-siswa.xlsx";
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
      const ids = selected ? selectedIds : undefined;
      const blob = await absensiSiswaService.exportZip(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "bukti-izin-siswa.zip";
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

  // ========== RENDER ==========
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Absensi Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Absensi Siswa</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
                        <FileCheck className="text-blue-600" size={24} />
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
                        <FileX className="text-yellow-600" size={24} />
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

              {/* Action Buttons */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="destructive" onClick={handleDeleteMultiple} disabled={selectedIds.length === 0}>
                    <Trash2Icon size={18} />
                    Hapus Terpilih ({selectedIds.length})
                  </Button>

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
                  <Input
                    type="text"
                    placeholder="Cari nama siswa/kelas/mata pelajaran/hari..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
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
                      <TableHead className="font-semibold text-white">Nama Siswa</TableHead>
                      <TableHead className="font-semibold text-white">Kelas</TableHead>
                      <TableHead className="font-semibold text-white">Mata Pelajaran</TableHead>
                      <TableHead className="font-semibold text-white">Hari</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      <TableHead className="text-center font-semibold text-white">Total Hadir</TableHead>
                      <TableHead className="text-center font-semibold text-white">Total Izin</TableHead>
                      <TableHead className="text-center font-semibold text-white">Total Sakit</TableHead>
                      <TableHead className="text-center font-semibold text-white">Total Alfa</TableHead>
                      <TableHead className="text-center font-semibold text-white">Aksi</TableHead>
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
                          <TableCell>{item.nama_siswa || "-"}</TableCell>
                          <TableCell>{item.kelas || "-"}</TableCell>
                          <TableCell>{item.mata_pelajaran || "-"}</TableCell>
                          <TableCell>{item.hari || "-"}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                item.status === "hadir"
                                  ? "bg-green-100 text-green-800"
                                  : item.status === "izin"
                                  ? "bg-blue-100 text-blue-800"
                                  : item.status === "sakit"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {item.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">{item.total_hadir}</TableCell>
                          <TableCell className="text-center">{item.total_izin}</TableCell>
                          <TableCell className="text-center">{item.total_sakit}</TableCell>
                          <TableCell className="text-center">{item.total_alfa}</TableCell>
                          <TableCell className="flex gap-1 justify-center">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetail(item)} title="Lihat Detail">
                              <EyeIcon size={16} />
                            </Button>
                            <Button size="sm" onClick={() => handleEdit(item)} title="Edit Absensi">
                              <PenBoxIcon size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={12} className="text-center text-gray-500 py-4">
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

export default DataAbsensiSiswa;