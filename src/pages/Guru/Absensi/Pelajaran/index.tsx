import { useEffect, useMemo, useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarGuru } from "@/components/SidebarGuru";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Search, FileSpreadsheet, CheckCircle2, XCircle, FilePlus, CalendarCheck, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { absensiPelajaranService } from "@/services/absensiPelajaranService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Swal from "sweetalert2";
import type { AbsensiPelajaranDetail } from "@/types/absensiPelajaran";

const DataAbsensiPelajaranGuru = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataAbsensi, setDataAbsensi] = useState<AbsensiPelajaranDetail[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<AbsensiPelajaranDetail[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Summary data
  const [namaGuru, setNamaGuru] = useState("");
  const [mengajar, setMengajar] = useState("");
  const [waliKelas, setWaliKelas] = useState("");
  const [totalHadir, setTotalHadir] = useState(0);
  const [totalTidakHadir, setTotalTidakHadir] = useState(0);

  // Dialog create state
  const [createDialog, setCreateDialog] = useState(false);
  const [createStatus, setCreateStatus] = useState<"hadir" | "tidak hadir">("hadir");
  const [selectedKelas, setSelectedKelas] = useState<string>("");
  const [availableKelas, setAvailableKelas] = useState<Array<{ id: number; nama: string }>>([]);
  const [currentDate, setCurrentDate] = useState("");

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await absensiPelajaranService.getAllSelf();

      if (response.status === "success" && response.data.length > 0) {
        const firstData = response.data[0];
        setNamaGuru(firstData.nama_guru);
        setMengajar(firstData.mengajar);
        setWaliKelas(firstData.wali_kelas || "-");
        setTotalHadir(firstData.total_hadir);
        setTotalTidakHadir(firstData.total_tidak_hadir);
        setDataAbsensi(firstData.absensi);

        const kelas = await absensiPelajaranService.getKelas();
        setAvailableKelas(kelas);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setDataAbsensi([]);
        // Jika belum ada absensi, set wali kelas sebagai satu-satunya pilihan
        if (waliKelas && waliKelas !== "-") {
          setAvailableKelas([{ id: 1, nama: waliKelas }]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Set current date
  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString("id-ID", options);
    setCurrentDate(formattedDate);
  }, []);

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(dataAbsensi);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(dataAbsensi.filter((item) => item.hari.toLowerCase().includes(lower) || item.status.toLowerCase().includes(lower) || item.kelas.toLowerCase().includes(lower)));
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
  const handleOpenCreateDialog = async () => {
    // Cek apakah ada kelas yang tersedia
    if (availableKelas.length === 0 && (!waliKelas || waliKelas === "-")) {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ada Kelas!",
        html: `
          <p>Anda tidak memiliki jadwal mengajar.</p>
          <p class="text-sm text-gray-600 mt-2">Kemungkinan penyebab:</p>
          <ul class="text-sm text-left text-gray-600 mt-1 ml-4">
            <li>• Anda belum ditugaskan sebagai wali kelas</li>
            <li>• Anda belum pernah melakukan absensi sebelumnya</li>
            <li>• Jadwal mengajar belum tersedia</li>
          </ul>
          <p class="text-sm text-gray-700 mt-3 font-semibold">Silakan hubungi admin.</p>
        `,
        confirmButtonText: "OK, Mengerti",
      });
      return;
    }

    // Jika ada kelas dari absensi sebelumnya, gunakan itu
    if (availableKelas.length > 0) {
      setSelectedKelas(availableKelas[0].nama);
      setCreateDialog(true);
    }
    // Jika belum ada absensi tapi ada wali kelas
    else if (waliKelas && waliKelas !== "-") {
      setAvailableKelas([{ id: 1, nama: waliKelas }]);
      setSelectedKelas(waliKelas);
      setCreateDialog(true);
    }
  };

  // Create absensi handler
  const handleCreateAbsensi = async () => {
    if (!selectedKelas) {
      Swal.fire({
        icon: "warning",
        title: "Pilih Kelas!",
        text: "Silakan pilih kelas terlebih dahulu.",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setIsLoading(true);

      const kelasObj = availableKelas.find((k) => k.nama === selectedKelas);

      const payload = {
        kelas_id: kelasObj?.id ?? 0,
        status: createStatus,
      };

      const response = await absensiPelajaranService.create(payload);

      if (response.status === "success") {
        setCreateDialog(false);
        setSelectedKelas("");

        Swal.fire({
          icon: "success",
          title: "Absensi Berhasil!",
          html: `
            <div class="text-left">
              <p><strong>Kelas:</strong> ${response.data.kelas}</p>
              <p><strong>Status:</strong> ${response.data.status}</p>
              <p><strong>Hari:</strong> ${response.data.hari}</p>
              <p><strong>Jam:</strong> ${response.data.jam}</p>
              <hr class="my-2">
              <p><strong>Rekapitulasi:</strong></p>
              <p>Hadir: ${response.data.rekapitulasi.hadir}</p>
              <p>Tidak Hadir: ${response.data.rekapitulasi.tidak_hadir}</p>
            </div>
          `,
          timer: 5000,
          showConfirmButton: false,
        });

        fetchData();
      }
    } catch (err: any) {
      if (err.response?.status === 422) {
        Swal.fire({
          icon: "warning",
          title: "Gagal Absen!",
          text: err.response?.data?.data?.pesan || "Anda sudah absen di kelas ini hari ini.",
          timer: 3000,
          showConfirmButton: false,
        });
      } else if (err.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Tidak Ada Jadwal!",
          text: err.response?.data?.data?.pesan || "Anda tidak mengajar di kelas ini.",
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
      const blob = await absensiPelajaranService.exportSelf(ids);

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
  const persentaseKehadiran = totalHadir + totalTidakHadir > 0 ? ((totalHadir / (totalHadir + totalTidakHadir)) * 100).toFixed(1) : 0;

  return (
    <SidebarProvider>
      <SidebarGuru isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Absensi Pelajaran Saya</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2 className="animate-spin mb-2" size={28} />
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

                {/* <Card>
                  <CardContent>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 rounded-full">
                        <BookOpen className="text-purple-600" size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Informasi</p>
                        <p className="text-sm font-semibold">{namaGuru}</p>
                        <p className="text-xs text-gray-500">Mengajar: {mengajar}</p>
                        <p className="text-xs text-gray-500">Wali Kelas: {waliKelas}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
              </div>

              {/* Action Buttons */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button className="bg-primary" onClick={handleOpenCreateDialog}>
                    <CheckCircle2 size={18} />
                    Absen Sekarang
                  </Button>

                  {/* <Button variant="outline" onClick={() => handleExportExcel(false)}>
                    <FileSpreadsheet size={18} />
                    Export Semua Excel
                  </Button> */}

                  <Button variant="outline" onClick={() => handleExportExcel(true)} disabled={selectedIds.length === 0}>
                    <FileSpreadsheet size={18} />
                    Export Terpilih Excel ({selectedIds.length})
                  </Button>
                </div>

                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari hari/kelas/status..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
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
                      <TableHead className="font-semibold text-white">Kelas</TableHead>
                      <TableHead className="font-semibold text-white">Hari</TableHead>
                      <TableHead className="font-semibold text-white">Jam</TableHead>
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
                          <TableCell className="font-medium">{item.kelas || "-"}</TableCell>
                          <TableCell>{item.hari || "-"}</TableCell>
                          <TableCell>{item.jam || "-"}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "hadir" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{item.status}</span>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                          Belum ada data absensi pelajaran
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
      </main>

      {/* Create Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Absensi Pelajaran Hari Ini</DialogTitle>
            <DialogDescription>Lakukan absensi kehadiran mengajar Anda</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Detail Info */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Nama Guru:</span>
                <span className="text-sm font-semibold text-gray-900">{namaGuru}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Mata Pelajaran:</span>
                <span className="text-sm font-semibold text-gray-900">{mengajar}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Wali Kelas:</span>
                <span className="text-sm font-semibold text-gray-900">{waliKelas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Hari:</span>
                <span className="text-sm font-semibold text-gray-900">{currentDate}</span>
              </div>
            </div>

            {/* Kelas Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Pilih Kelas <span className="text-red-500">*</span>
              </label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kelas yang diajar" />
                </SelectTrigger>
                <SelectContent>
                  {availableKelas.length > 0 ? (
                    availableKelas.map((kelas) => (
                      <SelectItem key={kelas.id} value={kelas.nama}>
                        {kelas.nama}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-data" disabled>
                      Tidak ada kelas tersedia
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">Pilih kelas yang sedang Anda ajar saat ini</p>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Status Kehadiran <span className="text-red-500">*</span>
              </label>
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
            <Button
              className="bg-gray-500 flex items-center gap-2 hover:bg-gray-600"
              onClick={() => {
                setCreateDialog(false);
                setSelectedKelas("");
              }}
            >
              <XCircle size={18} />
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

export default DataAbsensiPelajaranGuru;
