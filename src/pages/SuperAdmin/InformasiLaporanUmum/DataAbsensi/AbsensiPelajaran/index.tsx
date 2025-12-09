import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2Icon, SearchIcon, Trash2Icon, FileSpreadsheet, PenBoxIcon, CircleXIcon, FilePlus, CalendarCheck, XCircle, UserCheck, EyeIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import type { AbsensiPelajaranFlat } from "@/types/absensiPelajaran";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiPelajaranService } from "@/services/absensiPelajaranService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const DataAbsensiPelajaran = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataAbsensi, setDataAbsensi] = useState<AbsensiPelajaranFlat[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<AbsensiPelajaranFlat[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [totalHadir, setTotalHadir] = useState(0);
  const [totalTidakHadir, setTotalTidakHadir] = useState(0);

  // Dialog edit state
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<"hadir" | "tidak hadir">("hadir");
  const [editingData, setEditingData] = useState<AbsensiPelajaranFlat | null>(null);

  // Store guru_pengajar_id untuk setiap row
  const [guruIdMap, setGuruIdMap] = useState<Map<number, number>>(new Map());

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await absensiPelajaranService.getAll();

    if (response.status === "success") {
      // Flatten nested data structure
      const flatData: AbsensiPelajaranFlat[] = [];

      response.data.forEach((pelajaran: any) => {
        pelajaran.absensi.forEach((abs: any) => {
          flatData.push({
            id: abs.id,
            guru_id: pelajaran.guru_id,
            guru_pengajar_id: pelajaran.guru_id, // ✅ Gunakan guru_id dari pelajaran
            mata_pelajaran: pelajaran.mata_pelajaran,
            nama_guru: pelajaran.nama_guru,
            kelas: abs.kelas,
            hari: abs.hari,
            jam: abs.jam,
            status: abs.status,
            total_hadir: pelajaran.total_hadir,
            total_tidak_hadir: pelajaran.total_tidak_hadir,
          });
        });
      });

      setGuruIdMap(new Map(flatData.map((item) => [item.id, item.guru_id])));
      setDataAbsensi(flatData);
      setTotalHadir(flatData.reduce((total, item) => total + (item.status === "hadir" ? 1 : 0), 0));
      setTotalTidakHadir(flatData.reduce((total, item) => total + (item.status === "tidak hadir" ? 1 : 0), 0));
    }
  } catch (error: any) {
    Swal.fire({
      icon: "error",
      title: "Gagal memuat data!",
      text: error.response?.data?.message || "Tidak dapat memuat data absensi pelajaran.",
    });
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
      setFilteredData(dataAbsensi.filter((item) => item.nama_guru.toLowerCase().includes(lower) || item.mata_pelajaran.toLowerCase().includes(lower) || item.kelas.toLowerCase().includes(lower) || item.hari.toLowerCase().includes(lower)));
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

  // Navigate to detail
  const handleViewDetail = (item: AbsensiPelajaranFlat) => {
    const guruId = guruIdMap.get(Number(item.id));

    if (guruId) {
      navigate(`/superadmin/informasi-laporan-umum/absensi-pelajaran/detail/${guruId}`);
    } else {
      console.warn("guruId NOT FOUND untuk absensi id:", item.id);
    }
  };

  // Edit handler
  const handleEdit = (item: AbsensiPelajaranFlat) => {
    setEditingId(item.id);
    setEditStatus(item.status);
    setEditingData(item);
    setEditDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingId) return;

    try {
      setLoading(true);
      setIsLoading(true);
      await absensiPelajaranService.update(editingId, { status: editStatus });

      // Update local state
      setDataAbsensi((prev) => prev.map((item) => (item.id === editingId ? { ...item, status: editStatus } : item)));

      setEditDialog(false);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Status absensi berhasil diperbarui.",
        showConfirmButton: false,
        timer: 1800,
      });

      // Refresh data to get updated totals
      fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memperbarui!",
        text: err.response?.data?.message || "Terjadi kesalahan saat memperbarui status.",
      });
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  // Delete handler
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
      await absensiPelajaranService.deleteMultiple(selectedIds);

      setDataAbsensi((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
      setSelectedIds([]);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil dihapus.",
        showConfirmButton: false,
        timer: 1800,
      });
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

  // Export Excel
  const handleExportExcel = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : undefined;
      const blob = await absensiPelajaranService.exportExcel(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "absensi-pelajaran-guru.xlsx";
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
  const persentaseKehadiran = totalHadir + totalTidakHadir > 0 ? ((totalHadir / (totalHadir + totalTidakHadir)) * 100).toFixed(1) : 0;

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
                        <p className="text-2xl font-bold text-green-600">{persentaseKehadiran}%</p>
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
                    Export Terpilih Excel
                  </Button>
                </div>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari guru/mata pelajaran/kelas/hari..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
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
                      <TableHead className="font-semibold text-white">Guru Pengajar</TableHead>
                      <TableHead className="font-semibold text-white">Mata Pelajaran</TableHead>
                      <TableHead className="font-semibold text-white">Kelas</TableHead>
                      <TableHead className="font-semibold text-white">Hari/Tanggal</TableHead>
                      <TableHead className="font-semibold text-white">Jam</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      <TableHead className="text-center font-semibold text-white">Total Hadir</TableHead>
                      <TableHead className="text-center font-semibold text-white">Total Tidak Hadir</TableHead>
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
                          <TableCell>{item.nama_guru || "-"}</TableCell>
                          <TableCell>{item.mata_pelajaran || "-"}</TableCell>
                          <TableCell>{item.kelas || "-"}</TableCell>
                          <TableCell>{item.hari || "-"}</TableCell>
                          <TableCell>{item.jam || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "hadir" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{item.status}</span>
                          </TableCell>
                          <TableCell className="text-center">{item.total_hadir}</TableCell>
                          <TableCell className="text-center">{item.total_tidak_hadir}</TableCell>
                          <TableCell className="flex gap-1 justify-center">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetail(item)} title="Lihat Detail">
                              <EyeIcon size={16} />
                            </Button>
                            <Button size="sm" onClick={() => handleEdit(item)} title="Edit Status">
                              <PenBoxIcon size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-gray-500 py-4">
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

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Status Absensi Pelajaran</DialogTitle>
            <DialogDescription>Ubah status kehadiran guru dalam mengajar</DialogDescription>
          </DialogHeader>

          {editingData && (
            <div className="space-y-4 py-4">
              {/* Detail Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Guru Pengajar:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingData.nama_guru}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Mata Pelajaran:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingData.mata_pelajaran}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Kelas:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingData.kelas}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Hari/Tanggal:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingData.hari}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Jam:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingData.jam}</span>
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Status Kehadiran</label>
                <Select value={editStatus} onValueChange={(value: "hadir" | "tidak hadir") => setEditStatus(value)}>
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
              <CircleXIcon />
              Batal
            </Button>
            <Button type="submit" className="bg-primary flex items-center gap-2" disabled={isLoading} onClick={handleUpdateStatus}>
              <FilePlus size={18} />
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DataAbsensiPelajaran;
