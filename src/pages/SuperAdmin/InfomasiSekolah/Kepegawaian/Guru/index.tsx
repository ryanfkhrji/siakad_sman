import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { PenBoxIcon, Trash2Icon, SearchIcon, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import type { Pegawai } from "@/types";
import { DialogDetailGuru } from "./DialogDetailGuru";
import Swal from "sweetalert2";

const DataGuru = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataGuru, setDataGuru] = useState<Pegawai[]>([]);
  const [filteredGuru, setFilteredGuru] = useState<Pegawai[]>([]);
  const [selectedJenjang, setSelectedJenjang] = useState<string | null>(null);
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
          const guruOnly = res.data.data.filter((p: Pegawai) => p.role === "guru");
          setDataGuru(guruOnly);
          setFilteredGuru(guruOnly);
        }
      } catch (error) {
        console.error("Gagal mengambil data pegawai:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter berdasarkan jenjang dan pencarian
  useEffect(() => {
    let filtered = dataGuru;

    if (selectedJenjang) {
      filtered = filtered.filter((guru) => guru.kelas?.nama_kelas?.includes(selectedJenjang));
    }

    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((guru) => guru.nama.toLowerCase().includes(lowerSearch) || guru.nip?.toLowerCase().includes(lowerSearch));
    }

    setFilteredGuru(filtered);
    setCurrentPage(1);
  }, [selectedJenjang, searchTerm, dataGuru]);

  // Pagination logic
  const totalPages = Math.ceil(filteredGuru.length / rowsPerPage);
  const paginatedGuru = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredGuru.slice(start, start + rowsPerPage);
  }, [filteredGuru, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (id: number) => {
    // Konfirmasi hapus
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data guru yang dihapus tidak dapat dikembalikan.",
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
        // Hapus dari state agar tabel langsung update tanpa reload
        setDataGuru((prev) => prev.filter((guru) => guru.id !== id));
        setFilteredGuru((prev) => prev.filter((guru) => guru.id !== id));

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data guru berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: res.data.message || "Terjadi kesalahan saat menghapus guru.",
        });
      }
    } catch (err: any) {
      // Tangani respons error dari backend
      if (err.response?.data?.status === "error") {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: err.response.data.message || "Guru tidak ditemukan.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Terjadi kesalahan koneksi ke server.",
        });
      }
      console.error("Gagal menghapus guru:", err);
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
        <PageTitle title="Data Guru" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Guru</h1>

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
                {/* <Link to="/superadmin/informasi-sekolah/kepegawaian/guru/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full md:w-auto">
                    <PlusIcon size={18} />
                    Tambah Guru
                  </Button>
                </Link> */}

                {/* Filter Jenjang */}
                <Select value={selectedJenjang ?? ""} onValueChange={(value) => setSelectedJenjang(value)}>
                  <SelectTrigger className="w-full md:w-1/3 cursor-pointer">
                    <SelectValue placeholder="Filter Berdasarkan Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Jenjang</SelectLabel>
                      <SelectItem value="10">Kelas 10</SelectItem>
                      <SelectItem value="11">Kelas 11</SelectItem>
                      <SelectItem value="12">Kelas 12</SelectItem>
                    </SelectGroup>
                    <div className="px-2 py-1 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedJenjang(null);
                        }}
                      >
                        Tampilkan Semua
                      </Button>
                    </div>
                  </SelectContent>
                </Select>

                {/* Search */}
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari berdasarkan nama atau NIP..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="w-[60px] text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">NIP</TableHead>
                      <TableHead className="font-semibold text-white">Nama Lengkap</TableHead>
                      <TableHead className="font-semibold text-white">Email</TableHead>
                      <TableHead className="font-semibold text-white">Nama Kelas</TableHead>
                      {/* <TableHead className="font-semibold text-white">Jam Masuk</TableHead> */}
                      <TableHead className="font-semibold text-white">Status</TableHead>
                      {/* <TableHead className="font-semibold text-white">Keterangan</TableHead> */}
                      {/* <TableHead className="font-semibold text-white">Role</TableHead> */}
                      <TableHead className="font-semibold text-center text-white">Action</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginatedGuru.length > 0 ? (
                      paginatedGuru.map((guru, index) => (
                        <TableRow key={guru.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{guru.nip}</TableCell>
                          <TableCell>{guru.nama}</TableCell>
                          <TableCell>{guru.email}</TableCell>
                          <TableCell>{guru.kelas?.nama_kelas ?? "-"}</TableCell>
                          {/* <TableCell>{guru.kelas?.jam_masuk ?? "-"}</TableCell> */}
                          <TableCell>{guru.status}</TableCell>
                          {/* <TableCell>{guru.keterangan}</TableCell> */}
                          {/* <TableCell>{guru.role}</TableCell> */}
                          <TableCell className="flex gap-1 justify-center">
                            {/* Tombol Detail */}
                            <DialogDetailGuru guru={guru} />

                            <Link to={`/superadmin/informasi-sekolah/kepegawaian/guru/edit/${guru.id}`}>
                              <Button className="bg-primary" size="sm">
                                <PenBoxIcon size={16} />
                              </Button>
                            </Link>

                            <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(guru.id)}>
                              <Trash2Icon size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                          Tidak ada data guru yang ditemukan
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

export default DataGuru;
