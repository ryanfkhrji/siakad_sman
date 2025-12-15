import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarGuru } from "@/components/SidebarGuru";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";
import Swal from "sweetalert2";
import type { KompetensiDasarPegawai } from "@/types/kompetensiDasarPegawai";

const KompetensiDasar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataKompetensi, setDataKompetensi] = useState<KompetensiDasarPegawai[]>([]);
  const [filteredKompetensi, setFilteredKompetensi] = useState<KompetensiDasarPegawai[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/pegawai/kompetensi-dasar");
        if (res.data.status === "success") {
          setDataKompetensi(res.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data kompetensi dasar:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal mengambil data kompetensi dasar",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter berdasarkan jenjang dan pencarian
  useEffect(() => {
    let filtered = dataKompetensi;

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (kompetensi) => kompetensi.judul_kompetensi_dasar.toLowerCase().includes(lowerSearch)
      );
    }

    setFilteredKompetensi(filtered);
    setCurrentPage(1);
  }, [searchTerm, dataKompetensi]);

  // Pagination logic
  const totalPages = Math.ceil(filteredKompetensi.length / rowsPerPage);
  const paginatedKompetensi = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredKompetensi.slice(start, start + rowsPerPage);
  }, [filteredKompetensi, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <SidebarProvider>
      <SidebarGuru isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
    w-full min-h-screen bg-background transition-all duration-300
    ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
  `}
      >
        <PageTitle title="Kompetensi Dasar" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Kompetensi Dasar</h1>

          {/* ✅ Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Toolbar: Tambah + Filter + Search */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                {/* Search */}
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari Judul Kompetensi Dasar" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="w-[60px] text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">Mata Pelajaran</TableHead>
                      <TableHead className="font-semibold text-white">Judul Kompetensi Dasar</TableHead>
                      <TableHead className="font-semibold text-white">Deskripsi</TableHead>
                      <TableHead className="font-semibold text-white">Kurikulum</TableHead>
                      {/* <TableHead className="font-semibold text-center text-white">Action</TableHead> */}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedKompetensi.length > 0 ? (
                      paginatedKompetensi.map((kompetensi, index) => (
                        <TableRow key={kompetensi.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{kompetensi.mata_pelajaran_id ?? "-"}</TableCell>
                          <TableCell>{kompetensi.judul_kompetensi_dasar ?? "-"}</TableCell>
                          <TableCell>{kompetensi.deskripsi ?? "-"}</TableCell>
                          <TableCell>{kompetensi.kurikulum_id ?? "-"}</TableCell>
                          {/* <TableCell className="flex gap-1 justify-center">
                            <Link to={`/guru/siswa/data-siswa/detail-siswa/${kompetensi.id}`}>
                              <Button variant={"outline"} size="sm">
                                <EyeIcon size={16} />
                              </Button>
                            </Link>
                          </TableCell> */}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center text-gray-500 py-4">
                          Tidak ada data siswa yang ditemukan
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

export default KompetensiDasar;
