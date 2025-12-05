import { useEffect, useMemo, useRef, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2Icon, PlusIcon, SearchIcon, Trash2Icon, Upload, FileSpreadsheet, FolderArchive, EyeIcon, PenBoxIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import type { Psb } from "@/types/psb";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import { psbService } from "@/services/psbService";
import { PsbStatusToggle } from "@/components/PsbStatusToggle";

const DataPsb = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataPsb, setDataPsb] = useState<Psb[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<Psb[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await psbService.getAll();
      if (response.status === "success") {
        setDataPsb(response.data);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: error.response?.data?.message || "Tidak dapat memuat data PSB.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(dataPsb);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(dataPsb.filter((item) => item.nama_siswa.toLowerCase().includes(lower) || item.nisn.toLowerCase().includes(lower) || item.sekolah_asal.toLowerCase().includes(lower)));
    }
    setCurrentPage(1);
  }, [searchTerm, dataPsb]);

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
      await psbService.deleteMultiple(selectedIds);

      setDataPsb((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
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
      const blob = await psbService.exportExcel(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "data_psb.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Export berhasil!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export gagal!",
        text: "Terjadi kesalahan saat mengekspor data.",
      });
    }
  };

  // Export Berkas ZIP
  const handleExportBerkasZip = async (selected: boolean = false) => {
    try {
      const ids = selected ? selectedIds : undefined;
      const blob = await psbService.exportBerkasZip(ids);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "berkas_psb.zip";
      link.click();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        icon: "success",
        title: "Export berhasil!",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Export gagal!",
        text: "Terjadi kesalahan saat mengekspor berkas.",
      });
    }
  };

  // Import Excel
  const handleImportExcel = async () => {
    const { value: file } = await Swal.fire({
      title: "Pilih file Excel",
      input: "file",
      inputAttributes: {
        accept: ".xlsx,.xls",
      },
      showCancelButton: true,
      confirmButtonText: "Import",
      cancelButtonText: "Batal",
    });

    if (file) {
      try {
        setLoading(true);
        await psbService.importExcel(file);
        await fetchData();

        Swal.fire({
          icon: "success",
          title: "Import berhasil!",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Import gagal!",
          text: error.response?.data?.message || "Terjadi kesalahan saat mengimpor data.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  // Import Berkas ZIP
  const handleImportBerkasZip = async () => {
    const { value: file } = await Swal.fire({
      title: "Pilih file ZIP berkas",
      input: "file",
      inputAttributes: {
        accept: ".zip",
      },
      showCancelButton: true,
      confirmButtonText: "Import",
      cancelButtonText: "Batal",
    });

    if (file) {
      try {
        setLoading(true);
        await psbService.importBerkasZip(file);

        Swal.fire({
          icon: "success",
          title: "Import berkas berhasil!",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Import gagal!",
          text: error.response?.data?.message || "Terjadi kesalahan saat mengimpor berkas.",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Penerimaan Siswa Baru" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Penerimaan Siswa Baru</h1>

          {/* Toggle Status PSB */}
          <div className="mb-6">
            <PsbStatusToggle />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Action Buttons */}
              <div className="mb-6 flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  <Link to="/superadmin/psb/create" className="w-full md:w-auto">
                    <Button className="bg-primary w-full">
                      <PlusIcon size={18} />
                      Tambah Peserta
                    </Button>
                  </Link>

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

                  <Button variant="outline" onClick={() => handleExportBerkasZip(false)}>
                    <FolderArchive size={18} />
                    Export Semua Berkas
                  </Button>

                  <Button variant="outline" onClick={() => handleExportBerkasZip(true)} disabled={selectedIds.length === 0}>
                    <FolderArchive size={18} />
                    Export Terpilih Berkas
                  </Button>

                  <Button variant="outline" onClick={handleImportExcel}>
                    <Upload size={18} />
                    Import Excel
                  </Button>

                  <Button variant="outline" onClick={handleImportBerkasZip}>
                    <Upload size={18} />
                    Import Berkas ZIP
                  </Button>
                </div>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari nama/NISN/sekolah asal..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
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
                      <TableHead className="font-semibold text-white">Foto</TableHead>
                      <TableHead className="font-semibold text-white">NISN</TableHead>
                      <TableHead className="font-semibold text-white">Nama Siswa</TableHead>
                      <TableHead className="font-semibold text-white">Jenis Kelamin</TableHead>
                      <TableHead className="font-semibold text-white">Tempat, Tanggal Lahir</TableHead>
                      <TableHead className="font-semibold text-white">Sekolah Asal</TableHead>
                      <TableHead className="font-semibold text-white">No HP</TableHead>
                      <TableHead className="text-center font-semibold text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((psb, index) => (
                        <TableRow key={psb.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center">
                            <Checkbox checked={selectedIds.includes(psb.id)} onCheckedChange={(checked) => handleSelectOne(psb.id, !!checked)} />
                          </TableCell>
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>
                            {psb.foto_siswa ? (
                              <img
                                src={psb.foto_siswa}
                                alt={psb.nama_siswa}
                                className="w-16 h-16 object-cover rounded border border-gray-200"
                                onError={(e) => {
                                  const target = e.currentTarget;
                                  target.onerror = null;
                                  target.src =
                                    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect fill="%23e5e7eb" width="64" height="64"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">No Photo</div>
                            )}
                          </TableCell>
                          <TableCell>{psb.nisn || "-"}</TableCell>
                          <TableCell>{psb.nama_siswa || "-"}</TableCell>
                          <TableCell>{psb.jk || "-"}</TableCell>
                          <TableCell>
                            {psb.tempat_lahir}, {psb.tanggal_lahir || "-"}
                          </TableCell>
                          <TableCell>{psb.sekolah_asal || "-"}</TableCell>
                          <TableCell>{psb.no_hp_siswa || "-"}</TableCell>
                          <TableCell className="flex gap-1 justify-center">
                            <Link to={`/superadmin/psb/edit/${psb.id}`}>
                              <Button size="sm">
                                <PenBoxIcon size={16} />
                              </Button>
                            </Link>

                            <Link to={`/superadmin/psb/detail/${psb.id}`}>
                              <Button variant="outline" size="sm">
                                <EyeIcon size={16} />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500 py-4">
                          Tidak ada data peserta yang ditemukan
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

export default DataPsb;
