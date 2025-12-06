import { useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarGuru } from "@/components/SidebarGuru";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2Icon, SearchIcon, FileSpreadsheet, CircleCheckBigIcon, CircleXIcon, FilePlus, CalendarCheck, UserCheck, XCircle } from "lucide-react";
import Footer from "@/pages/Footer";
import type { AbsensiDetailSelf } from "@/types/absensiPegawai";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiPegawaiService } from "@/services/absensiPegawaiService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const DataAbsensiPegawaiGuru = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataAbsensi, setDataAbsensi] = useState<AbsensiDetailSelf[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<AbsensiDetailSelf[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Summary data
  const [nama, setNama] = useState("");
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [totalHadir, setTotalHadir] = useState(0);
  const [totalTidakHadir, setTotalTidakHadir] = useState(0);

  // Dialog create state
  const [createDialog, setCreateDialog] = useState(false);
  const [createStatus, setCreateStatus] = useState<"hadir" | "tidak hadir">("hadir");
  const [currentDate, setCurrentDate] = useState("");
  const [hasAbsenToday, setHasAbsenToday] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
    checkTodayAbsen();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await absensiPegawaiService.getAllSelf();

      if (response.status === "success") {
        setNama(response.data.nama);
        setMataPelajaran(response.data.mata_pelajaran_id);
        setTotalHadir(response.data.total_hadir);
        setTotalTidakHadir(response.data.total_tidak_hadir);
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

  // Check if already absen today
  const checkTodayAbsen = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString("id-ID", options);
    setCurrentDate(formattedDate);

    // Check if there's absen for today
    const todayAbsen = dataAbsensi.find((item) => item.hari === formattedDate);
    setHasAbsenToday(!!todayAbsen);
  };

  useEffect(() => {
    checkTodayAbsen();
  }, [dataAbsensi]);

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(dataAbsensi);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(dataAbsensi.filter((item) => item.hari.toLowerCase().includes(lower) || item.status.toLowerCase().includes(lower)));
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

  // Open create dialog
  const handleOpenCreateDialog = () => {
    if (hasAbsenToday) {
      Swal.fire({
        icon: "warning",
        title: "Sudah Absen!",
        text: "Anda sudah melakukan absensi hari ini.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }
    setCreateDialog(true);
  };

  // Create absensi handler
  const handleCreateAbsensi = async () => {
    try {
      setIsLoading(true);
      const response = await absensiPegawaiService.create({ status: createStatus });

      if (response.status === "success") {
        setCreateDialog(false);

        Swal.fire({
          icon: "success",
          title: "Absensi Berhasil!",
          html: `
            <div class="text-left">
              <p><strong>Status:</strong> ${response.data.status}</p>
              <p><strong>Hari:</strong> ${response.data.hari}</p>
              <hr class="my-2">
              <p><strong>Rekapitulasi:</strong></p>
              <p>Hadir: ${response.data.rekapitulasi.hadir}</p>
              <p>Tidak Hadir: ${response.data.rekapitulasi.tidak_hadir}</p>
            </div>
          `,
          timer: 2000,
          showConfirmButton: false,
        });

        // Refresh data
        fetchData();
      }
    } catch (err: any) {
      // Handle error 422 - sudah absen hari ini
      if (err.response?.status === 422) {
        Swal.fire({
          icon: "warning",
          title: "Gagal Absen!",
          text: err.response?.data?.data?.pesan || "Anda sudah absen hari ini.",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Absen!",
          text: err.response?.data?.message || "Terjadi kesalahan saat melakukan absensi.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Export Excel
  const handleExportExcel = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : undefined;
      const blob = await absensiPegawaiService.exportSelf(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "absensi-saya.xlsx";
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
  const persentaseKehadiran = totalHadir + totalTidakHadir > 0 ? ((totalHadir / (totalHadir + totalTidakHadir)) * 100).toFixed(1) : 0;

  return (
    <SidebarProvider>
      <SidebarGuru isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <PageTitle title="Absensi Saya" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Absensi Saya</h1>

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

                <Card>
                  <CardContent>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Informasi</p>
                      <p className="text-sm font-semibold">{nama}</p>
                      <p className="text-xs text-gray-500">{mataPelajaran}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-primary" onClick={handleOpenCreateDialog} disabled={hasAbsenToday}>
                    <CircleCheckBigIcon size={18} />
                    {hasAbsenToday ? "Sudah Absen Hari Ini" : "Absen Sekarang"}
                  </Button>

                  {/* <Button variant="outline" onClick={() => handleExportExcel(false)}>
                    <FileSpreadsheet size={18} />
                    Export Semua Excel
                  </Button> */}

                  <Button variant="outline" onClick={() => handleExportExcel(true)} disabled={selectedIds.length === 0}>
                    <FileSpreadsheet size={18} />
                    Export Terpilih Excel
                  </Button>
                </div>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari hari/status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
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
                      <TableHead className="font-semibold text-white">Hari</TableHead>
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
                          <TableCell>{item.hari || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "hadir" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{item.status}</span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-4">
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

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Absensi Hari Ini</DialogTitle>
            <DialogDescription>Lakukan absensi kehadiran Anda</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Detail Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Nama:</span>
                <span className="text-sm font-semibold text-gray-900">{nama}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Mengajar:</span>
                <span className="text-sm font-semibold text-gray-900">{mataPelajaran}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Hari:</span>
                <span className="text-sm font-semibold text-gray-900">{currentDate}</span>
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Status Kehadiran</label>
              <Select value={createStatus} onValueChange={(value: "hadir" | "tidak hadir") => setCreateStatus(value)}>
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

          <DialogFooter>
            <Button className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90" onClick={() => setCreateDialog(false)}>
              <CircleXIcon />
              Batal
            </Button>
            <Button type="submit" className="bg-primary flex items-center gap-2" disabled={isLoading} onClick={handleCreateAbsensi}>
              <FilePlus size={18} />
              {isLoading ? "Menyimpan..." : "Submit Absensi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DataAbsensiPegawaiGuru;
