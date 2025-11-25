import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Loader2, BookOpen, Calendar, Clock, DoorOpen, User2, Link as LinkIcon, Users, ArrowLeftIcon, SearchIcon, DoorClosedIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { SidebarGuru } from "@/components/SidebarGuru";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Peserta {
  id: number;
  nama_siswa: string;
  jurusan: string;
  kelas: string;
}

interface DataJadwal {
  id: number;
  mata_pelajaran: string;
  hari: string;
  guru: string;
  kelas: string;
  jam_pelajaran: string;
  ruangan: string;
  link_opsional?: string;
  peserta: Peserta[];
}

const DetailJadwalPelajaranGuru = () => {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataJadwal, setDataJadwal] = useState<DataJadwal | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<Peserta[]>([]);

  // Fetch data jadwal
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/pegawai/jadwal-pelajaran/show/diri/${id}`);

        if (res.data.status === "success") {
          setDataJadwal(res.data.data);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data jadwal:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Gagal mengambil data jadwal pelajaran",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter berdasarkan jenjang dan pencarian
  useEffect(() => {
    if (dataJadwal) {
      const lower = searchTerm.toLowerCase();

      const filtered = dataJadwal.peserta.filter((p) => {
        const nama = p.nama_siswa?.toLowerCase() || "";

        return nama.includes(lower);
      });

      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, dataJadwal]);

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
        <PageTitle title="Detail Jadwal Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Detail Jadwal Pelajaran</h1>
          </div>

          <div className="mb-6">
            <Link to="/guru/jadwal-pelajaran/data-jadwal">
              <Button variant="outline" size={"sm"}>
                <ArrowLeftIcon size={16} />
                Kembali Ke Daftar Jadwal Pelajaran
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2 className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : dataJadwal ? (
            <>
              {/* Info Jadwal */}
              <Card className="mb-6 bg-white border-l-4 border-l-primary">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <BookOpen size={16} />
                        Mata Pelajaran
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.mata_pelajaran}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <Calendar size={16} />
                        Hari
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.hari}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <Clock size={16} />
                        Jam Pelajaran
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.jam_pelajaran}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <DoorOpen size={16} />
                        Ruangan
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.ruangan}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm mt-4">
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <User2 size={16} />
                        Guru Pengajar
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.guru}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <DoorClosedIcon size={16} />
                        Kelas
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.kelas}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <Users size={16} />
                        Jumlah Peserta
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.peserta.length} Siswa</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <LinkIcon size={16} />
                        Link Pembelajaran
                      </p>
                      {dataJadwal.link_opsional ? (
                        <a
                          href={dataJadwal.link_opsional.startsWith("http") ? dataJadwal.link_opsional : `https://${dataJadwal.link_opsional}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-lg font-bold text-blue-600 underline hover:text-blue-800 break-all"
                        >
                          {dataJadwal.link_opsional}
                        </a>
                      ) : (
                        <p className="text-lg font-bold text-gray-400">-</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabel Peserta */}
              <div className="bg-white rounded shadow">
                <div className="p-4 border-b mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                  <h2 className="text-xl font-bold">Daftar Peserta</h2>

                  <div className="relative w-full md:w-1/3">
                    <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                    <Input type="text" placeholder="Cari nama siswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                  </div>
                </div>
                <div className="w-full overflow-x-auto">
                  <Table className="min-w-full">
                    <TableHeader className="bg-primary">
                      <TableRow>
                        <TableHead className="w-[60px] text-center font-semibold text-white">No</TableHead>
                        <TableHead className="font-semibold text-white">Nama Siswa</TableHead>
                        <TableHead className="font-semibold text-white">Jurusan</TableHead>
                        <TableHead className="font-semibold text-white">Kelas</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginated.length > 0 ? (
                        paginated.map((peserta, index) => (
                          <TableRow key={peserta.id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                            <TableCell className="text-center font-medium">{index + 1}</TableCell>
                            <TableCell>{peserta.nama_siswa ?? "-"}</TableCell>
                            <TableCell>{peserta.jurusan ?? "-"}</TableCell>
                            <TableCell>{peserta.kelas ?? "-"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                            Belum ada peserta di jadwal ini
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 p-4">
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
              </div>
            </>
          ) : (
            <Card className="w-full">
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-lg">Data jadwal tidak tersedia.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailJadwalPelajaranGuru;
