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
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { absensiPegawaiService } from "@/services/absensiPegawaiService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import type { AbsensiGuru, AbsensiPegawaiFlat } from "@/types/absensiPegawai";

// ─────────────────────────────────────────────────────────────
// Helper: flatten nested AbsensiGuru[] → AbsensiPegawaiFlat[]
// ─────────────────────────────────────────────────────────────
const flattenAbsensi = (data: AbsensiGuru[]): AbsensiPegawaiFlat[] => {
  const flat: AbsensiPegawaiFlat[] = [];

  data.forEach((guru) => {
    const totalHadirAll = guru.periode.reduce((sum, p) => sum + p.total_hadir, 0);
    const totalTidakHadirAll = guru.periode.reduce((sum, p) => sum + p.total_tidak_hadir, 0);

    guru.periode.forEach((periode) => {
      periode.semester.forEach((semester) => {
        // Tombol edit & delete hanya aktif jika TA dan semester keduanya "aktif"
        const isEditable = periode.status_tahun_akademik === "aktif" && semester.status_semester === "aktif";

        semester.absensi.forEach((abs) => {
          flat.push({
            absensi_id: abs.absensi_id,
            guru_id: guru.guru_id,
            nama_guru: guru.nama,
            nip: guru.nip,
            role: guru.role,
            tanggal: abs.tanggal,
            status: abs.status,
            mengajar: abs.mengajar,
            tahun_akademik: periode.tahun_akademik,
            status_tahun_akademik: periode.status_tahun_akademik,
            semester: semester.semester,
            status_semester: semester.status_semester,
            total_hadir_all: totalHadirAll,
            total_tidak_hadir_all: totalTidakHadirAll,
            is_editable: isEditable,
          });
        });
      });
    });
  });

  return flat;
};

const DataAbsensiPegawai = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataFlat, setDataFlat] = useState<AbsensiPegawaiFlat[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [isLoadingAksi, setIsLoadingAksi] = useState(false);
  const [totalHadir, setTotalHadir] = useState(0);
  const [totalTidakHadir, setTotalTidakHadir] = useState(0);

  // Dialog edit
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<"hadir" | "tidak hadir">("hadir");
  const [editingRow, setEditingRow] = useState<AbsensiPegawaiFlat | null>(null);

  // ── FETCH ─────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await absensiPegawaiService.getAll();

      if (res.status === "success") {
        const flat = flattenAbsensi(res.data);
        setDataFlat(flat);
        setTotalHadir(flat.filter((x) => x.status === "hadir").length);
        setTotalTidakHadir(flat.filter((x) => x.status === "tidak hadir").length);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data absensi pegawai.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ── FILTER & SEARCH ───────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return dataFlat;
    const lower = searchTerm.toLowerCase();
    return dataFlat.filter((item) => item.nama_guru.toLowerCase().includes(lower) || item.mengajar?.toLowerCase().includes(lower) || item.tanggal.toLowerCase().includes(lower) || item.nip?.toLowerCase().includes(lower));
  }, [searchTerm, dataFlat]);

  // ── PAGINATION ────────────────────────────────────────────
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ── CHECKBOX ──────────────────────────────────────────────
  const isAllSelected = paginated.length > 0 && paginated.every((item) => selectedIds.includes(item.absensi_id));
  const isSomeSelected = paginated.some((item) => selectedIds.includes(item.absensi_id)) && !isAllSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = isSomeSelected;
  }, [isSomeSelected]);

  const handleSelectAll = (checked: boolean) => setSelectedIds(checked ? paginated.map((item) => item.absensi_id) : []);

  const handleSelectOne = (id: number, checked: boolean) => setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));

  // ── EDIT ──────────────────────────────────────────────────
  const handleEdit = (item: AbsensiPegawaiFlat) => {
    setEditingId(item.absensi_id);
    setEditStatus(item.status);
    setEditingRow(item);
    setEditDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingId) return;
    try {
      setIsLoadingAksi(true);
      await absensiPegawaiService.update(editingId, { status: editStatus });
      setEditDialog(false);
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Status absensi berhasil diperbarui.", showConfirmButton: false, timer: 1800 });
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal memperbarui!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setIsLoadingAksi(false);
    }
  };

  // ── DELETE ────────────────────────────────────────────────
  const handleDeleteMultiple = async () => {
    if (selectedIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Tidak ada data dipilih", text: "Pilih minimal 1 data untuk dihapus" });
      return;
    }

    // Pisahkan mana yang bisa dihapus (aktif) dan mana yang tidak (arsip)
    const selectedRows = dataFlat.filter((item) => selectedIds.includes(item.absensi_id));
    const deletableIds = selectedRows.filter((item) => item.is_editable).map((item) => item.absensi_id);
    const arsipCount = selectedRows.length - deletableIds.length;

    if (deletableIds.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Tidak ada data yang bisa dihapus",
        text: "Semua data yang dipilih berasal dari tahun akademik atau semester yang sudah arsip. Hanya data dengan status aktif yang bisa dihapus.",
        confirmButtonColor: "#4F46E5",
      });
      return;
    }

    const warningArsip = arsipCount > 0 ? `\n\n⚠️ ${arsipCount} data dari semester/TA arsip akan dilewati (tidak dihapus).` : "";

    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `<b>${deletableIds.length} data aktif</b> akan dihapus dan tidak dapat dikembalikan.${warningArsip ? `<br/><br/><span style="color:#f59e0b">${warningArsip.trim()}</span>` : ""}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      await absensiPegawaiService.deleteMultiple(deletableIds);
      setSelectedIds([]);
      Swal.fire({ icon: "success", title: "Berhasil!", text: "Data berhasil dihapus.", showConfirmButton: false, timer: 1800 });
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal menghapus!", text: err.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  // ── EXPORT ────────────────────────────────────────────────
  const handleExportExcel = async (selected: boolean = false) => {
    try {
      // Backend wajib terima ids[] — "export semua" = kirim semua id dari dataFlat
      const ids = selected ? selectedIds : dataFlat.map((item) => item.absensi_id);

      if (ids.length === 0) {
        Swal.fire({ icon: "warning", title: "Tidak ada data", text: "Tidak ada data untuk diekspor." });
        return;
      }

      const blob = await absensiPegawaiService.exportExcel(ids);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "absensi-pegawai.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
      Swal.fire({ icon: "success", title: "Export berhasil!", showConfirmButton: false, timer: 1500 });
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Export gagal!", text: error.response?.data?.message || "Terjadi kesalahan." });
    }
  };

  const persentaseKehadiran = totalHadir + totalTidakHadir > 0 ? ((totalHadir / (totalHadir + totalTidakHadir)) * 100).toFixed(1) : "0";

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Absensi Pegawai" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Absensi Pegawai</h1>

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

              {/* Action Buttons + Search */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Button variant="destructive" onClick={handleDeleteMultiple} disabled={selectedIds.length === 0}>
                    <Trash2Icon size={18} className="mr-1" />
                    Hapus Terpilih ({selectedIds.length})
                  </Button>
                  <Button variant="outline" onClick={() => handleExportExcel(false)}>
                    <FileSpreadsheet size={18} className="mr-1" />
                    Export Semua Excel
                  </Button>
                  <Button variant="outline" onClick={() => handleExportExcel(true)} disabled={selectedIds.length === 0}>
                    <FileSpreadsheet size={18} className="mr-1" />
                    Export Terpilih Excel
                  </Button>
                </div>
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Cari nama guru, mata pelajaran, tanggal..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
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
                      <TableHead className="text-center font-semibold text-white w-12">No</TableHead>
                      <TableHead className="font-semibold text-white">Nama Guru</TableHead>
                      <TableHead className="font-semibold text-white">NIP</TableHead>
                      <TableHead className="font-semibold text-white">Tahun Akademik</TableHead>
                      <TableHead className="font-semibold text-white">Mengajar</TableHead>
                      <TableHead className="font-semibold text-white">Tanggal</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      <TableHead className="text-center font-semibold text-white">Total Hadir</TableHead>
                      <TableHead className="text-center font-semibold text-white">Total TH</TableHead>
                      <TableHead className="text-center font-semibold text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((item, index) => (
                        <TableRow key={item.absensi_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center">
                            <Checkbox checked={selectedIds.includes(item.absensi_id)} onCheckedChange={(checked) => handleSelectOne(item.absensi_id, !!checked)} />
                          </TableCell>
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium">{item.nama_guru}</TableCell>
                          <TableCell className="text-gray-500 text-sm">{item.nip ?? "-"}</TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-medium">{item.tahun_akademik}</span>
                              <div className="flex gap-1">
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${item.status_tahun_akademik === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>TA: {item.status_tahun_akademik}</span>
                                <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${item.status_semester === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>Sem: {item.status_semester}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{item.mengajar ?? "-"}</TableCell>
                          <TableCell>{item.tanggal}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === "hadir" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{item.status}</span>
                          </TableCell>
                          <TableCell className="text-center">{item.total_hadir_all}</TableCell>
                          <TableCell className="text-center">{item.total_tidak_hadir_all}</TableCell>
                          <TableCell className="text-center">
                            <div className="flex gap-1 justify-center">
                              <Button size="sm" variant="outline" title="Lihat Detail Guru" onClick={() => navigate(`/superadmin/informasi-laporan-umum/absensi-pegawai/detail/${item.guru_id}`)}>
                                <EyeIcon size={15} />
                              </Button>
                              {item.is_editable && (
                                <Button size="sm" title="Edit Status" onClick={() => handleEdit(item)}>
                                  <PenBoxIcon size={15} />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={11} className="text-center text-gray-500 py-8">
                          {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data absensi"}
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
            <DialogTitle>Edit Status Absensi</DialogTitle>
            <DialogDescription>Ubah status kehadiran pegawai</DialogDescription>
          </DialogHeader>

          {editingRow && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Nama Guru:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingRow.nama_guru}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Mengajar:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingRow.mengajar ?? "-"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Tanggal:</span>
                  <span className="text-sm font-semibold text-gray-900">{editingRow.tanggal}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status Kehadiran</label>
                <Select value={editStatus} onValueChange={(v: "hadir" | "tidak hadir") => setEditStatus(v)}>
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
              <CircleXIcon size={16} />
              Batal
            </Button>
            <Button className="bg-primary flex items-center gap-2" disabled={isLoadingAksi} onClick={handleUpdateStatus}>
              {isLoadingAksi ? <Loader2Icon size={16} className="animate-spin" /> : <FilePlus size={16} />}
              {isLoadingAksi ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
};

export default DataAbsensiPegawai;
