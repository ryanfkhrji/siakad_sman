import { useEffect, useMemo, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PenBoxIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import type { TahunAkademikWithSemesters } from "@/types/semester";
import { Badge } from "@/components/ui/badge";

const DataSemester = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataSemester, setDataSemester] = useState<TahunAkademikWithSemesters[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<TahunAkademikWithSemesters[]>([]);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/semester");
        if (res.data.status === "success") {
          setDataSemester(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data semester",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(dataSemester);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(dataSemester.filter((item) => item.tahun_akademik.toLowerCase().includes(lower) || item.semesters.some((s) => s.semester.toLowerCase().includes(lower))));
    }
    setCurrentPage(1);
  }, [searchTerm, dataSemester]);

  // Flatten data untuk pagination (menghitung total rows dari semua semester)
  const flattenedData = useMemo(() => {
    return filteredData.flatMap((tahunAkademik) =>
      tahunAkademik.semesters.map((semester) => ({
        tahun_akademik_id: tahunAkademik.tahun_akademik_id,
        tahun_akademik: tahunAkademik.tahun_akademik,
        status_tahun_akademik: tahunAkademik.status_tahun_akademik,
        ...semester,
      })),
    );
  }, [filteredData]);

  // Pagination logic
  const totalPages = Math.ceil(flattenedData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return flattenedData.slice(start, start + rowsPerPage);
  }, [flattenedData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data semester yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/semester/${id}`);

      if (res.data.status === "success") {
        // Refresh data setelah delete
        const refreshRes = await api.get("/spa/semester");
        if (refreshRes.data.status === "success") {
          setDataSemester(refreshRes.data.data);
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data semester berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: res.data.message || "Terjadi kesalahan saat menghapus semester.",
        });
      }
    } catch (err: any) {
      if (err.response?.data?.status === "error") {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: err.response.data.message || "Semester tidak ditemukan.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Terjadi kesalahan koneksi ke server.",
        });
      }
      console.error("Gagal menghapus semester:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Semester" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Semester</h1>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Tombol Tambah */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-sekolah/semester/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full mx-auto">
                    <PlusIcon size={18} />
                    Tambah Semester
                  </Button>
                </Link>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari semester atau tahun akademik..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Tabel Data */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">Tahun Akademik</TableHead>
                      <TableHead className="font-semibold text-white">Semester</TableHead>
                      <TableHead className="font-semibold text-white">Status Tahun Akademik</TableHead>
                      <TableHead className="font-semibold text-white">Status Semester</TableHead>
                      <TableHead className="text-center font-semibold text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((item, index) => (
                        <TableRow key={item.semester_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{item.tahun_akademik}</TableCell>
                          <TableCell>
                            <Badge className={item.semester === "Ganjil" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : "bg-purple-100 text-purple-700 hover:bg-purple-100"}>{item.semester}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={item.status_tahun_akademik === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}>
                              {item.status_tahun_akademik === "aktif" ? "Aktif" : "Arsip"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={item.status_semester === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}>
                              {item.status_semester === "aktif" ? "Aktif" : "Arsip"}
                            </Badge>
                          </TableCell>
                          <TableCell className="flex gap-1 justify-center">
                            <Link to={`/superadmin/informasi-sekolah/semester/edit/${item.semester_id}`}>
                              <Button className="bg-primary" size="sm">
                                <PenBoxIcon size={16} />
                              </Button>
                            </Link>

                            <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(item.semester_id)} disabled={item.status_semester === "arsip"}>
                              <Trash2Icon size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                          Tidak ada data semester yang ditemukan
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

export default DataSemester;
