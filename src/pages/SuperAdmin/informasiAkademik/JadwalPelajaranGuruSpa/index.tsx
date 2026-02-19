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
import { DialogDetailJadwalPelajaranGuru } from "./DialogDetailSiswaJadwalPelajaranGuru";
import type { TahunAkademikInIndex, JadwalPelajaranIndexResponse } from "@/types/jadwalPelajaranGuru";

// Flatten nested data untuk tabel
interface FlatJadwal {
  jadwal_pelajaran_id: number;
  tahun_akademik: string;
  semester: string;
  guru: string;
  guru_id: number;
  mata_pelajaran: string;
  hari: string;
  jam_mulai: string;
  jam_selesai: string;
  rombel: string;
  jurusan: string | null;
  ruangan: string | null;
  link_opsional: string | null;
}

export const DataJadwalPelajaranGuruSpa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataJadwal, setDataJadwal] = useState<FlatJadwal[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Ambil data dari backend dan flatten
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get<JadwalPelajaranIndexResponse>("/spa/jadwal-pelajaran");

        if (res.data.status === "success") {
          // Flatten 3-level nested (Tahun Akademik → Semester → Guru → Jadwals)
          const flattened: FlatJadwal[] = [];

          res.data.data.forEach((tahun: TahunAkademikInIndex) => {
            tahun.semesters.forEach((semester) => {
              semester.gurus.forEach((guru) => {
                guru.jadwals.forEach((jadwal) => {
                  flattened.push({
                    jadwal_pelajaran_id: jadwal.jadwal_pelajaran_id,
                    tahun_akademik:      tahun.tahun_akademik,
                    semester:            semester.semester,
                    guru:                guru.guru,
                    guru_id:             guru.guru_id,
                    mata_pelajaran:      jadwal.mata_pelajaran,
                    hari:                jadwal.hari,
                    jam_mulai:           jadwal.jam_mulai,
                    jam_selesai:         jadwal.jam_selesai,
                    rombel:              jadwal.rombel,
                    jurusan:             jadwal.jurusan,
                    ruangan:             jadwal.ruangan,
                    link_opsional:       jadwal.link_opsional,
                  });
                });
              });
            });
          });

          setDataJadwal(flattened);
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Tidak dapat memuat jadwal pelajaran",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search filtering
  const filteredData = useMemo(() => {
    if (searchTerm.trim() === "") return dataJadwal;

    const lower = searchTerm.toLowerCase();
    return dataJadwal.filter(
      (item) =>
        item.mata_pelajaran.toLowerCase().includes(lower) ||
        item.hari.toLowerCase().includes(lower) ||
        item.guru.toLowerCase().includes(lower) ||
        item.rombel.toLowerCase().includes(lower) ||
        item.ruangan?.toLowerCase().includes(lower)
    );
  }, [searchTerm, dataJadwal]);

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data jadwal pelajaran yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.delete(`/spa/jadwal-pelajaran/${id}`);

      if (res.data.status === "success") {
        setDataJadwal((prev) => prev.filter((j) => j.jadwal_pelajaran_id !== id));

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data jadwal pelajaran berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.errors?.arsip ||
        err.response?.data?.errors?.jadwal?.[0] ||
        err.response?.data?.message ||
        "Terjadi kesalahan saat menghapus.";

      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: errorMsg,
      });
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Jadwal Pelajaran Guru" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Jadwal Pelajaran Guru</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-guru/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full">
                    <PlusIcon size={18} />
                    Tambah Jadwal Pelajaran
                  </Button>
                </Link>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Cari mata pelajaran, hari, guru..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Tabel */}
              <div className="w-full overflow-x-auto rounded">
                <Table className="min-w-full border border-gray-200 rounded shadow-sm bg-white">
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-center font-semibold text-white">No</TableHead>
                      <TableHead className="font-semibold text-white">Mata Pelajaran</TableHead>
                      <TableHead className="font-semibold text-white">Hari</TableHead>
                      <TableHead className="font-semibold text-white">Guru</TableHead>
                      <TableHead className="font-semibold text-white">Rombel</TableHead>
                      <TableHead className="font-semibold text-white">Jam Pelajaran</TableHead>
                      <TableHead className="font-semibold text-white">Ruangan</TableHead>
                      <TableHead className="font-semibold text-white">Link</TableHead>
                      <TableHead className="text-center font-semibold text-white">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {paginated.length > 0 ? (
                      paginated.map((jadwal, index) => (
                        <TableRow key={jadwal.jadwal_pelajaran_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                          <TableCell className="font-medium">{jadwal.mata_pelajaran}</TableCell>
                          <TableCell>{jadwal.hari}</TableCell>
                          <TableCell>{jadwal.guru}</TableCell>
                          <TableCell>
                            {jadwal.rombel}
                            {jadwal.jurusan && <span className="text-xs text-gray-500 block">({jadwal.jurusan})</span>}
                          </TableCell>
                          <TableCell>
                            {jadwal.jam_mulai.slice(0, 5)} - {jadwal.jam_selesai.slice(0, 5)}
                          </TableCell>
                          <TableCell>{jadwal.ruangan || "-"}</TableCell>
                          <TableCell className="max-w-[120px] truncate">
                            {jadwal.link_opsional ? (
                              <a href={jadwal.link_opsional} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs">
                                {jadwal.link_opsional}
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="flex gap-1 justify-center">
                            {/* Dialog Detail Histori */}
                            <DialogDetailJadwalPelajaranGuru guruId={jadwal.guru_id} />

                            <Link to={`/superadmin/informasi-akademik/jadwal-pelajaran-guru/edit/${jadwal.jadwal_pelajaran_id}`}>
                              <Button className="bg-primary" size="sm">
                                <PenBoxIcon size={16} />
                              </Button>
                            </Link>
                            <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(jadwal.jadwal_pelajaran_id)}>
                              <Trash2Icon size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-gray-500 py-4">
                          {searchTerm ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data jadwal pelajaran"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {filteredData.length > 0 && (
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
              )}
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};