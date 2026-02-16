import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PenBoxIcon, PlusIcon, SearchIcon, Trash2Icon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import type { KelasInRombel } from "@/types/rombel";
import { Badge } from "@/components/ui/badge";
import { DialogDetailRombel } from "./DialogDetailRombel";

const DataRombel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataRombel, setDataRombel] = useState<KelasInRombel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedKelas, setExpandedKelas] = useState<number[]>([]);
  const [expandedJurusan, setExpandedJurusan] = useState<string[]>([]);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/rombel");

        if (res.data.status === "success") {
          setDataRombel(res.data.data);
          // Auto expand kelas pertama
          if (res.data.data.length > 0) {
            setExpandedKelas([res.data.data[0].kelas_id]);
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setDataRombel([]);
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Tidak dapat memuat data rombel",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleKelas = (kelasId: number) => {
    setExpandedKelas((prev) => (prev.includes(kelasId) ? prev.filter((k) => k !== kelasId) : [...prev, kelasId]));
  };

  const toggleJurusan = (key: string) => {
    setExpandedJurusan((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleDelete = async (id: number, namaRombel: string) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `Rombel <strong>${namaRombel}</strong> akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/rombel/${id}`);

      if (res.data.status === "success") {
        // Refresh data
        const refreshRes = await api.get("/spa/rombel");
        if (refreshRes.data.status === "success") {
          setDataRombel(refreshRes.data.data);
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || err.response?.data?.errors?.id?.[0] || "Terjadi kesalahan saat menghapus.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter berdasarkan search
  const filteredData = dataRombel
    .map((kelas) => ({
      ...kelas,
      jurusans: kelas.jurusans
        .map((jurusan) => ({
          ...jurusan,
          rombels: jurusan.rombels.filter((rombel) => (searchTerm.trim() === "" ? true : rombel.nama_rombel.toLowerCase().includes(searchTerm.toLowerCase()))),
        }))
        .filter((jurusan) => jurusan.rombels.length > 0),
    }))
    .filter((kelas) => kelas.jurusans.length > 0);

  // Helper untuk badge tingkat
  const getTingkatBadgeClass = (tingkat: number): string => {
    switch (tingkat) {
      case 10:
        return "bg-blue-100 text-blue-700 border-blue-300";
      case 11:
        return "bg-purple-100 text-purple-700 border-purple-300";
      case 12:
        return "bg-orange-100 text-orange-700 border-orange-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Rombel" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Rombongan Belajar (Rombel)</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-sekolah/rombel/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full">
                    <PlusIcon size={18} />
                    Tambah Rombel
                  </Button>
                </Link>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari nama rombel..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Nested Structure */}
              <div className="w-full space-y-4">
                {filteredData.length > 0 ? (
                  filteredData.map((kelas) => (
                    <div key={kelas.kelas_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                      {/* Header Kelas */}
                      <div
                        className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${kelas.status_kelas === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-400 hover:bg-gray-500"}`}
                        onClick={() => toggleKelas(kelas.kelas_id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedKelas.includes(kelas.kelas_id) ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                          <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-white">Kelas {kelas.nama_kelas}</h2>
                            <Badge className={getTingkatBadgeClass(kelas.tingkat)}>Tingkat {kelas.tingkat}</Badge>
                            <Badge className={kelas.status_kelas === "aktif" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}>{kelas.status_kelas}</Badge>
                          </div>
                        </div>
                        <span className="text-white font-medium">{kelas.jurusans.reduce((acc, j) => acc + j.rombels.length, 0)} Rombel</span>
                      </div>

                      {/* Content Kelas */}
                      {expandedKelas.includes(kelas.kelas_id) && (
                        <div className="p-4 space-y-3">
                          {kelas.jurusans.map((jurusan) => {
                            const jurusanKey = `${kelas.kelas_id}-${jurusan.jurusan_id}`;

                            return (
                              <div key={jurusanKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Header Jurusan */}
                                <div className="bg-indigo-50 p-3 cursor-pointer hover:bg-indigo-100 transition-colors flex items-center justify-between" onClick={() => toggleJurusan(jurusanKey)}>
                                  <div className="flex items-center gap-2">
                                    {expandedJurusan.includes(jurusanKey) ? <ChevronDownIcon className="text-indigo-700" size={18} /> : <ChevronRightIcon className="text-indigo-700" size={18} />}
                                    <div className="flex items-center gap-2">
                                      <h3 className="font-semibold text-indigo-900">Jurusan {jurusan.nama_jurusan}</h3>
                                      <Badge className={jurusan.status_jurusan === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>{jurusan.status_jurusan}</Badge>
                                    </div>
                                  </div>
                                  <span className="text-indigo-700 text-sm font-medium">{jurusan.rombels.length} Rombel</span>
                                </div>

                                {/* Table Rombel */}
                                {expandedJurusan.includes(jurusanKey) && (
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader className="bg-gray-50">
                                        <TableRow>
                                          <TableHead className="text-center font-semibold w-20">No</TableHead>
                                          <TableHead className="font-semibold">Nama Rombel</TableHead>
                                          <TableHead className="font-semibold">Status</TableHead>
                                          <TableHead className="text-center font-semibold w-40">Aksi</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {jurusan.rombels.map((rombel, index) => (
                                          <TableRow key={rombel.rombel_id} className="hover:bg-gray-50 border-b border-gray-100">
                                            <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{rombel.nama_rombel}</TableCell>
                                            <TableCell>
                                              <Badge className={rombel.status_rombel === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"}>{rombel.status_rombel}</Badge>
                                            </TableCell>
                                            <TableCell className="flex gap-1 justify-center">
                                              <DialogDetailRombel rombelId={rombel.rombel_id} />

                                              <Link to={`/superadmin/informasi-sekolah/rombel/edit/${rombel.rombel_id}`}>
                                                <Button className="bg-primary" size="sm">
                                                  <PenBoxIcon size={16} />
                                                </Button>
                                              </Link>

                                              <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(rombel.rombel_id, rombel.nama_rombel)} disabled={rombel.status_rombel === "arsip"}>
                                                <Trash2Icon size={16} />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-8 text-center text-gray-500">
                    <p className="text-lg font-medium">Tidak ada data rombel yang ditemukan</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataRombel;
