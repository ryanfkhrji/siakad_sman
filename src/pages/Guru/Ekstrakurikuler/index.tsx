import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Loader2Icon, UsersIcon, DollarSignIcon, SearchIcon, TrophyIcon, TagIcon, Trash2Icon, UserPlusIcon, CircleXIcon, FilePlus, PenBoxIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { SidebarGuru } from "@/components/SidebarGuru";
import { Link } from "react-router-dom";

interface Peserta {
  pivot_id: number | null;
  siswa_id: number;
  nama_siswa: string;
  jurusan: string | null;
  kelas: string | null;
  sikap: string | null;
}

interface DataEkskul {
  id: number;
  nama_ekstrakurikuler: string;
  jumlah_peserta: number;
  anggaran: string;
  status: string;
  peserta: Peserta[];
}

interface Siswa {
  id: number;
  nama: string;
  kelas?: {
    nama_kelas: string;
  };
}

const DetailEkskulGuru = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataEkskul, setDataEkskul] = useState<DataEkskul | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredData, setFilteredData] = useState<Peserta[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loadingSiswa, setLoadingSiswa] = useState(false);

  // Fetch data ekstrakurikuler
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/pegawai/ekskul/show/diri");

        if (res.data.status === "success") {
          setDataEkskul(res.data.data);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data ekstrakurikuler:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Gagal mengambil data ekstrakurikuler",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter berdasarkan pencarian
  useEffect(() => {
    if (dataEkskul) {
      const lower = searchTerm.toLowerCase();

      const filtered = dataEkskul.peserta.filter((p) => {
        const nama = p.nama_siswa?.toLowerCase() || "";
        const jurusan = p.jurusan?.toLowerCase() || "";
        const kelas = p.kelas?.toLowerCase() || "";

        return nama.includes(lower) || jurusan.includes(lower) || kelas.includes(lower);
      });

      setFilteredData(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, dataEkskul]);

  // Pagination logic
  const totalPages = Math.ceil((filteredData.length || 1) / rowsPerPage);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Fetch daftar siswa
  const fetchSiswaList = async () => {
    try {
      setLoadingSiswa(true);
      const res = await api.get("/pegawai/siswa");

      if (res.data.status === "success") {
        setSiswaList(res.data.data);
      }
    } catch (error: any) {
      console.error("Gagal mengambil daftar siswa:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil daftar siswa",
      });
    } finally {
      setLoadingSiswa(false);
    }
  };

  // Handle delete peserta
  const handleDelete = async (pivot_id: number, namaSiswa: string) => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      text: `Apakah Anda yakin ingin menghapus ${namaSiswa} dari ekstrakurikuler ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.delete(`/pegawai/siswa/ekskul/${pivot_id}`);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Siswa berhasil dihapus dari ekstrakurikuler",
          timer: 2000,
          showConfirmButton: false,
        });

        // Update data lokal
        setDataEkskul((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            peserta: prev.peserta.filter((p) => p.pivot_id !== pivot_id),
            jumlah_peserta: prev.jumlah_peserta - 1,
          };
        });
      }
    } catch (error: any) {
      console.error("Gagal menghapus siswa:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Gagal menghapus siswa dari ekstrakurikuler",
      });
    }
  };

  // Handle tambah peserta
  const handleTambahPeserta = async () => {
    if (!selectedSiswa) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Pilih siswa terlebih dahulu",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (!dataEkskul) return;

    try {
      setSubmitting(true);

      const res = await api.post("/pegawai/siswa/ekskul", {
        siswa_id: Number(selectedSiswa),
        ekstrakurikuler_id: dataEkskul.id,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Siswa berhasil ditambahkan ke ekstrakurikuler",
          timer: 3000,
          showConfirmButton: false,
        });

        // Refresh data
        const refreshRes = await api.get("/pegawai/ekskul/show/diri");
        if (refreshRes.data.status === "success") {
          setDataEkskul(refreshRes.data.data);
        }

        setShowModal(false);
        setSelectedSiswa("");
      }
    } catch (error: any) {
      console.error("Gagal menambah siswa:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Gagal menambahkan siswa ke ekstrakurikuler",
        timer: 3000,
        showConfirmButton: false,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatRupiah = (angka: string) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(Number(angka));
  };

  const handleOpenModal = () => {
    setShowModal(true);
    fetchSiswaList();
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
        <PageTitle title="Ekstrakurikuler Saya" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Ekstrakurikuler Saya</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : dataEkskul ? (
            <>
              {/* Info Ekstrakurikuler */}
              <Card className="mb-6 bg-white border-l-4 border-l-primary">
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <TrophyIcon size={16} />
                        Nama Ekstrakurikuler
                      </p>
                      <p className="text-lg font-bold text-primary">{dataEkskul.nama_ekstrakurikuler}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <UsersIcon size={16} />
                        Jumlah Peserta
                      </p>
                      <p className="text-lg font-bold text-primary">{dataEkskul.jumlah_peserta} Siswa</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <DollarSignIcon size={16} />
                        Anggaran
                      </p>
                      <p className="text-lg font-bold text-primary">{formatRupiah(dataEkskul.anggaran)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <TagIcon size={16} />
                        Status
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${dataEkskul.status === "wajib" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {dataEkskul.status.charAt(0).toUpperCase() + dataEkskul.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabel Peserta */}
              <div className="bg-white rounded shadow">
                <div className="p-4 border-b mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                  <h2 className="text-xl font-bold">Daftar Peserta</h2>

                  <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    <div className="relative w-full md:w-64">
                      <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                      <Input type="text" placeholder="Cari peserta..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                    </div>

                    <Dialog open={showModal} onOpenChange={setShowModal}>
                      <DialogTrigger asChild>
                        <Button onClick={handleOpenModal} className="bg-primary gap-2">
                          <UserPlusIcon size={18} />
                          Tambah Peserta
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px]">
                        <DialogHeader>
                          <DialogTitle>Tambah Peserta</DialogTitle>
                          <DialogDescription>Tambahkan siswa baru ke ekstrakurikuler {dataEkskul?.nama_ekstrakurikuler}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="ekskul">Ekstrakurikuler</Label>
                            <Input id="ekskul" value={dataEkskul?.nama_ekstrakurikuler || ""} disabled className="bg-gray-100" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="siswa">
                              Pilih Siswa <span className="text-red-500">*</span>
                            </Label>
                            {loadingSiswa ? (
                              <div className="flex items-center justify-center py-2">
                                <Loader2Icon className="animate-spin" size={20} />
                                <span className="ml-2 text-sm text-gray-600">Memuat daftar siswa...</span>
                              </div>
                            ) : (
                              <Select value={selectedSiswa} onValueChange={setSelectedSiswa}>
                                <SelectTrigger id="siswa" className="w-full">
                                  <SelectValue placeholder="-- Pilih Siswa --" />
                                </SelectTrigger>
                                <SelectContent>
                                  {siswaList.map((siswa) => (
                                    <SelectItem key={siswa.id} value={siswa.id.toString()}>
                                      {siswa.nama} {siswa.kelas ? `- ${siswa.kelas.nama_kelas}` : ""}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            onClick={() => {
                              setShowModal(false);
                              setSelectedSiswa("");
                            }}
                            disabled={submitting}
                            className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90"
                          >
                            <CircleXIcon size={18} />
                            Batal
                          </Button>
                          <Button type="button" onClick={handleTambahPeserta} disabled={submitting} className="bg-primary gap-2">
                            <FilePlus size={18} />
                            {submitting ? "Menyimpan..." : "Simpan"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
                        <TableHead className="font-semibold text-white">Sikap</TableHead>
                        <TableHead className="text-center font-semibold text-white">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginated.length > 0 ? (
                        paginated.map((peserta, index) => (
                          <TableRow key={peserta.pivot_id || index} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                            <TableCell className="text-center font-medium">{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                            <TableCell>{peserta.nama_siswa ?? "-"}</TableCell>
                            <TableCell>{peserta.jurusan ?? "-"}</TableCell>
                            <TableCell>{peserta.kelas ?? "-"}</TableCell>
                            <TableCell>{peserta.sikap ?? "-"}</TableCell>
                            <TableCell className="flex justify-center gap-1">
                              <Link
                                to={`/guru/ekstrakurikuler/edit-siswa/${peserta.pivot_id}`}
                                state={{
                                  siswaData: {
                                    ekskul_siswa_pivot_id: peserta.pivot_id ?? null,
                                    siswa_id: peserta.siswa_id,
                                    nama_siswa: peserta.nama_siswa,
                                    sikap: peserta.sikap ?? null,
                                  },
                                }}
                              >
                                <Button size={"sm"}>
                                  <PenBoxIcon size={16} />
                                </Button>
                              </Link>

                              <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(peserta.pivot_id || 0, peserta.nama_siswa)}>
                                <Trash2Icon size={16} />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-gray-500 py-4">
                            Belum ada peserta di ekstrakurikuler ini
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
                <p className="text-gray-500 text-lg">Data ekstrakurikuler tidak tersedia.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailEkskulGuru;
