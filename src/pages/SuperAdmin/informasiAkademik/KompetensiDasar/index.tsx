import { useEffect, useMemo, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PenBoxIcon, PlusIcon, SearchIcon, Trash2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import type { KompetensiDasar } from "@/types";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";

const DataKompetensiDasar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataKompetensiDasar, setDataKompetensiDasar] = useState<KompetensiDasar[]>([]);
  const [filteredData, setFilteredData] = useState<KompetensiDasar[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/kompetensi-dasar");

        if (res.data.status === "success") {
          setDataKompetensiDasar(res.data.data);
          setFilteredData(res.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data kompetensi dasar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(dataKompetensiDasar);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(
        dataKompetensiDasar.filter((item) => item.judul_kompetensi_dasar.toLowerCase().includes(lower) || item.mata_pelajaran_id.toString().toLowerCase().includes(lower) || item.kurikulum_id.toString().toLowerCase().includes(lower))
      );
    }
    setCurrentPage(1);
  }, [searchTerm, dataKompetensiDasar]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Delete
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/kompetensi-dasar/${id}`);

      if (res.data.status === "success") {
        setDataKompetensiDasar((prev) => prev.filter((item) => item.id !== id));
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil dihapus.",
          timer: 1800,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: res.data.message || "Terjadi kesalahan.",
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Kesalahan server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Kompetensi Dasar" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Kompetensi Dasar</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-akademik/kompetensi-dasar/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full">
                    <PlusIcon size={18} />
                    Tambah Kompetensi Dasar
                  </Button>
                </Link>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari kompetensi dasar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-center font-semibold text-white">No</TableHead>
                      <TableHead className="text-white">Mata Pelajaran</TableHead>
                      <TableHead className="text-white">Judul Kompetensi Dasar</TableHead>
                      <TableHead className="text-white">Deskripsi</TableHead>
                      <TableHead className="text-white">Kurikulum</TableHead>
                      <TableHead className="text-center text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((kd, index) => (
                        <TableRow key={kd.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>

                          <TableCell>{kd.mata_pelajaran_id}</TableCell>

                          <TableCell>{kd.judul_kompetensi_dasar}</TableCell>

                          <TableCell className="max-w-[350px] whitespace-normal break-words">{kd.deskripsi || "-"}</TableCell>

                          <TableCell>{kd.kurikulum_id}</TableCell>

                          <TableCell className="flex gap-1 justify-center">
                            <Link to={`/superadmin/informasi-akademik/kompetensi-dasar/edit/${kd.id}`}>
                              <Button className="bg-primary" size="sm">
                                <PenBoxIcon size={16} />
                              </Button>
                            </Link>

                            <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(kd.id)}>
                              <Trash2Icon size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-4">
                          Tidak ada data ditemukan
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
                  <span>data</span>
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

export default DataKompetensiDasar;
