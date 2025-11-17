import { useState, useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2Icon, ArrowLeft, ClipboardListIcon, ArrowLeftCircle } from "lucide-react";
import Footer from "@/pages/Footer";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";
import Swal from "sweetalert2";

interface Peserta {
  id_pivot: number | null;
  id: number;
  nama_siswa: string;
  jurusan: string | null;
  kelas: string | null;
}

interface SiswaEkskul {
  id: number;
  nama_ekskul: string;
  jumlah_peserta: number;
  nama_pengajar: string | null;
  peserta: Peserta[];
}

const DetailEkstrakurikulerSiswa = () => {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ekskul, setEkskul] = useState<SiswaEkskul | null>(null);
  const [filtered, setFiltered] = useState<Peserta[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentSiswaId, setCurrentSiswaId] = useState<number | null>(null);

  // Ambil ID siswa dari localStorage saat component mount
  useEffect(() => {
    const userData = localStorage.getItem("user"); // sesuaikan key-nya
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentSiswaId(user.id); // atau user.id_siswa, sesuaikan dengan struktur data
    }
  }, []);

  // Cek apakah siswa yang login sudah terdaftar di ekskul ini
  const isRegistered = useMemo(() => {
    if (!ekskul || !currentSiswaId) return false;
    return ekskul.peserta.some((p) => p.id === currentSiswaId);
  }, [ekskul, currentSiswaId]);

  // 🔹 Ambil data ekskul + pivot (SUDAH DIPERBAIKI)
  const fetchData = async () => {
    try {
      setLoading(true);

      // Ambil detail ekskul berdasarkan ID dari URL
      const resEkskul = await api.get(`/siswa/ekstrakurikuler/all/${id}`);
      if (resEkskul.data.status !== "success") {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: resEkskul.data.message || "Gagal memuat data ekstrakurikuler.",
        });
        return;
      }

      const selectedEkskul = resEkskul.data.data;

      // 🔸 Langsung mapping dari response backend (id_pivot sudah ada dari backend)
      const pesertaData =
        selectedEkskul?.peserta?.map((p: any) => ({
          id_pivot: p.id_pivot ?? null,
          id: p.id,
          nama_siswa: p.nama_siswa ?? "-",
          jurusan: p.jurusan ?? "-",
          kelas: p.kelas ?? "-",
        })) || [];

      const formattedData: SiswaEkskul = {
        id: selectedEkskul.id,
        nama_ekskul: selectedEkskul.nama_ekstrakurikuler || selectedEkskul.nama_ekskul,
        jumlah_peserta: pesertaData.length,
        nama_pengajar: selectedEkskul.nama_pengajar || null,
        peserta: pesertaData,
      };

      setEkskul(formattedData);
      setFiltered(pesertaData);
    } catch (error) {
      console.error("Gagal mengambil data siswa:", error);
      Swal.fire("Error", "Terjadi kesalahan koneksi ke server.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDaftar = async () => {
    try {
      const result = await Swal.fire({
        title: "Konfirmasi Pendaftaran",
        text: `Apakah Anda yakin ingin mendaftar ke ekstrakurikuler ${ekskul?.nama_ekskul}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#4F46E5",
        confirmButtonText: "Ya, daftar!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const res = await api.post(`/siswa/ekstrakurikuler/daftar/${id}`);

        if (res.data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: res.data.message || "Anda berhasil terdaftar di ekstrakurikuler ini",
          });

          // Refresh data setelah daftar
          fetchData();
        }
      }
    } catch (error: any) {
      console.error("Gagal mendaftar:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Mendaftar",
        text: error.response?.data?.message || "Terjadi kesalahan saat mendaftar",
      });
    }
  };

  const handleKeluar = async () => {
    try {
      const result = await Swal.fire({
        title: "Konfirmasi Keluar",
        text: `Apakah Anda yakin ingin keluar dari ekstrakurikuler ${ekskul?.nama_ekskul}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4F46E5",
        confirmButtonText: "Ya, keluar!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        const res = await api.delete(`/siswa/ekstrakurikuler/keluar/${id}`);

        if (res.data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: res.data.message || "Anda berhasil keluar dari ekstrakurikuler ini",
          });

          // Refresh data setelah keluar
          fetchData();
        }
      }
    } catch (error: any) {
      console.error("Gagal keluar:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Keluar",
        text: error.response?.data?.message || "Terjadi kesalahan saat keluar",
      });
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  // 🔹 Daftar kelas unik
  const kelasList = useMemo(() => {
    const allKelas = ekskul?.peserta.map((p) => p.kelas).filter(Boolean) || [];
    return Array.from(new Set(allKelas));
  }, [ekskul]);

  // 🔹 Filter & Search
  useEffect(() => {
    if (!ekskul) return;
    let data = ekskul.peserta;

    if (selectedKelas) data = data.filter((p) => p.kelas === selectedKelas);
    if (searchTerm.trim() !== "") {
      const lower = searchTerm.toLowerCase();
      data = data.filter((p) => p.nama_siswa.toLowerCase().includes(lower));
    }

    setFiltered(data);
    setCurrentPage(1);
  }, [selectedKelas, searchTerm, ekskul]);

  // 🔹 Pagination
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
        w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
      `}
      >
        <PageTitle title="Detail Data Ekstrakurikuler" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Detail Data Ekstrakurikuler</h1>

          <h1 className="text-xl font-bold mb-2 text-primary">Ekstrakurikuler {ekskul?.nama_ekskul ?? "Memuat..."}</h1>
          <p className="text-gray-600 mb-2">Jumlah Peserta: {ekskul?.jumlah_peserta ?? 0}</p>
          <p className="text-gray-600 mb-6">Pembina: {ekskul?.nama_pengajar ?? "-"}</p>

          <div className="mb-6 flex gap-3">
            {/* Tombol Daftar - muncul jika BELUM terdaftar */}
            {!isRegistered && (
              <Button onClick={handleDaftar}>
                <ClipboardListIcon size={16} />
                Daftar Ekstrakurikuler
              </Button>
            )}

            {/* Tombol Keluar - muncul jika SUDAH terdaftar */}
            {isRegistered && (
              <Button onClick={handleKeluar} className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                <ArrowLeftCircle size={16} />
                Keluar dari Ekstrakurikuler
              </Button>
            )}

            {/* Tombol Kembali - selalu muncul */}
            <Link to="/siswa/ekstrakurikuler">
              <Button variant="outline">
                <ArrowLeft size={16} />
                Kembali
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Filter & Search */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Select value={selectedKelas ?? ""} onValueChange={(value) => setSelectedKelas(value)}>
                  <SelectTrigger className="w-full md:w-1/3 cursor-pointer">
                    <SelectValue placeholder="Filter Berdasarkan Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Kelas</SelectLabel>
                      {kelasList.map((kelas, i) => (
                        <SelectItem key={i} value={String(kelas)}>
                          {String(kelas)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    <div className="px-2 py-1 border-t border-gray-200">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedKelas(null);
                        }}
                      >
                        Tampilkan Semua
                      </Button>
                    </div>
                  </SelectContent>
                </Select>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari nama siswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Table */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-center font-semibold text-white w-[50px]">No</TableHead>
                      <TableHead className="font-semibold text-white">Nama Siswa</TableHead>
                      <TableHead className="font-semibold text-white">Jurusan</TableHead>
                      <TableHead className="font-semibold text-white">Kelas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((siswa, index) => (
                        <TableRow key={siswa.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{siswa.nama_siswa}</TableCell>
                          <TableCell>{siswa.jurusan}</TableCell>
                          <TableCell>{siswa.kelas}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                          Tidak ada siswa yang terdaftar di ekskul ini
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
                  <Button size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
                    Prev
                  </Button>
                  <span className="text-sm">
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages || 1}</strong>
                  </span>
                  <Button size="sm" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(currentPage + 1)}>
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

export default DetailEkstrakurikulerSiswa;
