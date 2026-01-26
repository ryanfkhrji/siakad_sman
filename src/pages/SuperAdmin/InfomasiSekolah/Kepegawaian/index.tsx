import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PenBox, Trash2, Search, Loader2, Plus } from "lucide-react";
import Footer from "@/pages/Footer";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import type { Kepegawaian } from "@/types/kepegawaian";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import { DialogDetailKepegawaian } from "./DialogDetailKepegawaian";

const DataKepegawaian = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataKepegawaian, setDataKepegawaian] = useState<Kepegawaian[]>([]);
  const [filteredKepegawaian, setFilteredKepegawaian] = useState<Kepegawaian[]>([]);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/kepegawaian");
        if (res.data.status === "success") {
          setDataKepegawaian(res.data.data);
          setFilteredKepegawaian(res.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data kepegawaian:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter berdasarkan role, status, dan pencarian
  useEffect(() => {
    let filtered = dataKepegawaian;

    if (selectedRole) {
      filtered = filtered.filter((item) => item.role === selectedRole);
    }

    if (selectedStatus) {
      filtered = filtered.filter((item) => item.status === selectedStatus);
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.nama.toLowerCase().includes(lowerSearch) ||
          item.nip?.toLowerCase().includes(lowerSearch) ||
          item.nuptk?.toLowerCase().includes(lowerSearch) ||
          item.email?.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredKepegawaian(filtered);
    setCurrentPage(1);
  }, [selectedRole, selectedStatus, searchTerm, dataKepegawaian]);

  // Pagination logic
  const totalPages = Math.ceil(filteredKepegawaian.length / rowsPerPage);
  const paginatedKepegawaian = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredKepegawaian.slice(start, start + rowsPerPage);
  }, [filteredKepegawaian, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data kepegawaian yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/kepegawaian/${id}`);

      if (res.data.status === "success") {
        setDataKepegawaian((prev) => prev.filter((item) => item.id !== id));
        setFilteredKepegawaian((prev) => prev.filter((item) => item.id !== id));

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kepegawaian berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: res.data.message || "Terjadi kesalahan saat menghapus data.",
        });
      }
    } catch (err: any) {
      if (err.response?.data?.status === "error") {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: err.response.data.message || "Data tidak ditemukan.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Terjadi kesalahan koneksi ke server.",
        });
      }
      console.error("Gagal menghapus kepegawaian:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
          w-full min-h-screen bg-background transition-all duration-300
          ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}
        `}
      >
        <PageTitle title="Data Kepegawaian" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Kepegawaian</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2 className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-sekolah/kepegawaian/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full md:w-auto">
                    <Plus size={18} />
                    Tambah Kepegawaian
                  </Button>
                </Link>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                  {/* Filter Role */}
                  <Select value={selectedRole ?? ""} onValueChange={(value) => setSelectedRole(value)}>
                    <SelectTrigger className="w-full md:w-48 cursor-pointer">
                      <SelectValue placeholder="Filter Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Role</SelectLabel>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="kepsek">Kepala Sekolah</SelectItem>
                        <SelectItem value="guru">Guru</SelectItem>
                        <SelectItem value="tu">Tata Usaha</SelectItem>
                        <SelectItem value="staff">Staff</SelectItem>
                      </SelectGroup>
                      <div className="px-2 py-1 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRole(null);
                          }}
                        >
                          Tampilkan Semua
                        </Button>
                      </div>
                    </SelectContent>
                  </Select>

                  {/* Filter Status */}
                  <Select value={selectedStatus ?? ""} onValueChange={(value) => setSelectedStatus(value)}>
                    <SelectTrigger className="w-full md:w-48 cursor-pointer">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Status</SelectLabel>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="tidak aktif">Tidak Aktif</SelectItem>
                      </SelectGroup>
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

                  {/* Search */}
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                    <Input
                      type="text"
                      placeholder="Cari nama, NIP, NUPTK, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="w-[60px] text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">NIP</TableHead>
                      <TableHead className="font-semibold text-white">NUPTK</TableHead>
                      <TableHead className="font-semibold text-white">Nama Lengkap</TableHead>
                      <TableHead className="font-semibold text-white">Email</TableHead>
                      <TableHead className="font-semibold text-white">Role</TableHead>
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      <TableHead className="font-semibold text-white">Keterangan</TableHead>
                      <TableHead className="font-semibold text-center text-white">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedKepegawaian.length > 0 ? (
                      paginatedKepegawaian.map((item, index) => (
                        <TableRow key={item.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{item.nip ?? "-"}</TableCell>
                          <TableCell>{item.nuptk ?? "-"}</TableCell>
                          <TableCell>{item.nama}</TableCell>
                          <TableCell>{item.email ?? "-"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {item.role.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.status === "aktif"
                                  ? "bg-green-100 text-green-700 border-green-300"
                                  : "bg-red-100 text-red-700 border-red-300"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.keterangan ?? "-"}</TableCell>
                          <TableCell className="flex gap-1 justify-center">
                            <DialogDetailKepegawaian kepegawaianId={item.id} />

                            <Link to={`/superadmin/informasi-sekolah/kepegawaian/edit/${item.id}`}>
                              <Button className="bg-primary" size="sm">
                                <PenBox size={16} />
                              </Button>
                            </Link>

                            <Button
                              className="bg-muted-foreground hover:bg-muted-foreground/90"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-gray-500 py-4">
                          Tidak ada data kepegawaian yang ditemukan
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
                  <Button
                    size="sm"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
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

export default DataKepegawaian;