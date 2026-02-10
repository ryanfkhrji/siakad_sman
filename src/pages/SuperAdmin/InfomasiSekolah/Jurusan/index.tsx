import { useEffect, useMemo, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PenBoxIcon, PlusIcon, Trash2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Jurusan, JurusanListResponse, JurusanErrorResponse } from "@/types/jurusan";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { DialogDetailJurusan } from "./DialogDetailJurusan";
import { Badge } from "@/components/ui/badge";

const DataJurusan = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataJurusan, setDataJurusan] = useState<Jurusan[]>([]);
  const [filteredJurusan, setFilteredJurusan] = useState<Jurusan[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get<JurusanListResponse>("/spa/jurusan");

        if (res.data.status === "success") {
          setDataJurusan(res.data.data);
          setFilteredJurusan(res.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data jurusan:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal mengambil data jurusan",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter berdasarkan status
  useEffect(() => {
    let filtered = dataJurusan;

    if (selectedStatus) {
      filtered = filtered.filter((jurusan) => jurusan.status === selectedStatus);
    }

    setFilteredJurusan(filtered);
    setCurrentPage(1);
  }, [selectedStatus, dataJurusan]);

  // Pagination logic
  const totalPages = Math.ceil(filteredJurusan.length / rowsPerPage);
  const paginatedJurusan = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredJurusan.slice(start, start + rowsPerPage);
  }, [filteredJurusan, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data jurusan yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/jurusan/${id}`);

      if (res.data.status === "success") {
        setDataJurusan((prev) => prev.filter((j) => j.id !== id));
        setFilteredJurusan((prev) => prev.filter((j) => j.id !== id));

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data jurusan berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: res.data.message || "Terjadi kesalahan saat menghapus jurusan.",
        });
      }
    } catch (err: any) {
      const errorData = err.response?.data as JurusanErrorResponse;

      if (err.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Tidak Ditemukan",
          text: "Jurusan tidak ditemukan.",
        });
      } else if (err.response?.status === 422 && errorData?.errors) {
        // Handle constraint errors (kelas atau siswa masih ada)
        const errorMessages = Object.values(errorData.errors).flat().join("\n");

        Swal.fire({
          icon: "error",
          title: "Tidak Bisa Dihapus",
          text: errorMessages || errorData.message,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: err.response?.data?.message || "Terjadi kesalahan koneksi ke server.",
        });
      }
      console.error("Gagal menghapus jurusan:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Jurusan" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Jurusan</h1>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-sekolah/jurusan/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full md:w-auto">
                    <PlusIcon size={18} />
                    Tambah Jurusan
                  </Button>
                </Link>

                {/* Filter Status */}
                <Select value={selectedStatus ?? ""} onValueChange={(value) => setSelectedStatus(value || null)}>
                  <SelectTrigger className="w-full md:w-[200px] cursor-pointer">
                    <SelectValue placeholder="Filter Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="arsip">Arsip</SelectItem>
                    <div className="px-2 py-1 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStatus(null);
                        }}
                      >
                        Tampilkan Semua
                      </Button>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Tabel Data */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="w-[60px] text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">Kode Jurusan</TableHead>
                      <TableHead className="font-semibold text-white">Nama Jurusan</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      <TableHead className="text-center font-semibold text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedJurusan.length > 0 ? (
                      paginatedJurusan.map((jurusan, index) => (
                        <TableRow key={jurusan.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{jurusan.kode_jurusan ?? "-"}</TableCell>
                          <TableCell>{jurusan.nama_jurusan ?? "-"}</TableCell>
                          <TableCell>
                            <Badge className={jurusan.status === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>{jurusan.status}</Badge>
                          </TableCell>
                          <TableCell className="flex gap-1 justify-center">
                            {/* Tombol Detail */}
                            <DialogDetailJurusan jurusanId={jurusan.id} />

                            <Link to={`/superadmin/informasi-sekolah/jurusan/edit/${jurusan.id}`}>
                              <Button className="bg-primary" size="sm">
                                <PenBoxIcon size={16} />
                              </Button>
                            </Link>

                            <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(jurusan.id)}>
                              <Trash2Icon size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                          Tidak ada data jurusan yang ditemukan
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Tampilkan:</span>
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(val) => {
                      setRowsPerPage(Number(val));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-auto cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-gray-600">data per halaman</span>
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

export default DataJurusan;
