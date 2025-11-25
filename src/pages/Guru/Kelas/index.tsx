import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Loader2Icon, PenBoxIcon, UsersIcon, ClockIcon, DoorOpenIcon, User2Icon, SearchIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SidebarGuru } from "@/components/SidebarGuru";
import { Input } from "@/components/ui/input";

interface Siswa {
  id: number;
  nisn: string;
  nama: string;
  email: string;
  nis: string;
  nama_jurusan: string;
  nama_ekstrakurikuler: string;
  status: string;
}

interface Wali {
  id: number;
  nama: string;
  role: string;
}

interface DataKelas {
  id: number;
  nama_kelas: string;
  jam_masuk: string;
  jumlah_siswa: number;
  wali: Wali;
  anggota: Siswa[];
}

const DetailKelasGuru = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataKelas, setDataKelas] = useState<DataKelas | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<Siswa[]>([]);

  // Fetch data kelas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/pegawai/kelas/show/diri");

        if (res.data.status === "success") {
          setDataKelas(res.data.data);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data kelas:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Gagal mengambil data kelas",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter berdasarkan jenjang dan pencarian
  useEffect(() => {
    if (dataKelas) {
      const lower = searchTerm.toLowerCase();

      const filtered = dataKelas.anggota.filter((p) => {
        const nama = p.nama?.toLowerCase() || "";
        const nisn = p.nisn?.toLowerCase() || "";
        const nis = p.nis?.toLowerCase() || "";

        return nama.includes(lower) || nisn.includes(lower) || nis.includes(lower);
      });

      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, dataKelas]);

  // Pagination logic
  const totalPages = Math.ceil((filteredData.length || 1) / rowsPerPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

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
        <PageTitle title="Kelas Saya" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Kelas Saya</h1>
          </div>

          <div className="mb-6">
            {dataKelas && (
              <Link to="/guru/kelas/edit">
                <Button className="bg-primary">
                  <PenBoxIcon size={18} />
                  Edit Kelas
                </Button>
              </Link>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : dataKelas ? (
            <>
              {/* Info Kelas */}
              <Card className="mb-6 bg-white border-l-4 border-l-primary">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <DoorOpenIcon size={16} />
                        Nama Kelas
                      </p>
                      <p className="text-lg font-bold text-primary">{dataKelas.nama_kelas}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <ClockIcon size={16} />
                        Jam Masuk
                      </p>
                      <p className="text-lg font-bold text-primary">{dataKelas.jam_masuk}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <User2Icon size={16} />
                        Wali Kelas
                      </p>
                      <p className="text-lg font-bold text-primary">{dataKelas.wali.nama}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <UsersIcon size={16} />
                        Jumlah Siswa
                      </p>
                      <p className="text-lg font-bold text-primary">{dataKelas.jumlah_siswa} Siswa</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabel Siswa */}
              <div className="bg-white rounded shadow">
                <div className="p-4 border-b mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                  <h2 className="text-xl font-bold">Daftar Siswa</h2>

                  <div className="relative w-full md:w-1/3">
                    <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                    <Input type="text" placeholder="Cari siswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader className="bg-primary">
                      <TableRow>
                        <TableHead className="w-[60px] text-center font-semibold text-white">No</TableHead>
                        <TableHead className="font-semibold text-white">NISN</TableHead>
                        <TableHead className="font-semibold text-white">NIS</TableHead>
                        <TableHead className="font-semibold text-white">Nama Lengkap</TableHead>
                        <TableHead className="font-semibold text-white">Email</TableHead>
                        <TableHead className="font-semibold text-white">Jurusan</TableHead>
                        <TableHead className="font-semibold text-white">Ekstrakurikuler</TableHead>
                        <TableHead className="font-semibold text-white">Status</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginated.length > 0 ? (
                        paginated.map((siswa, index) => (
                          <TableRow key={siswa.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                            <TableCell className="text-center font-medium">{index + 1}</TableCell>
                            <TableCell>{siswa.nisn ?? "-"}</TableCell>
                            <TableCell>{siswa.nis ?? "-"}</TableCell>
                            <TableCell>{siswa.nama ?? "-"}</TableCell>
                            <TableCell>{siswa.email ?? "-"}</TableCell>
                            <TableCell>{siswa.nama_jurusan ?? "-"}</TableCell>
                            <TableCell>{siswa.nama_ekstrakurikuler || "-"}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${siswa.status === "aktif" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{siswa.status}</span>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-gray-500 py-4">
                            Belum ada siswa di kelas ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
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
                    Halaman <strong>{currentPage}</strong> dari <strong>{totalPages}</strong>
                  </span>

                  <Button size="sm" disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <Card className="w-full">
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-lg">Data kelas tidak tersedia.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailKelasGuru;
