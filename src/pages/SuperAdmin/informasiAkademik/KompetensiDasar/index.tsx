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
import type { KompetensiGroupedByTipe } from "@/types/kompetensi";
import { Badge } from "@/components/ui/badge";
import { DialogDetailKompetensi } from "./DialogDetailKompetensi";

const DataKompetensi = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataKompetensi, setDataKompetensi] = useState<KompetensiGroupedByTipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedTipe, setExpandedTipe] = useState<string[]>([]);
  const [expandedLevel, setExpandedLevel] = useState<string[]>([]);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/kompetensi");

        if (res.data.status === "success") {
          setDataKompetensi(res.data.data);
          // Auto expand tipe pertama
          if (res.data.data.length > 0) {
            setExpandedTipe([res.data.data[0].tipe_kurikulum]);
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setDataKompetensi([]);
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Tidak dapat memuat data kompetensi",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleTipe = (tipe: string) => {
    setExpandedTipe((prev) => (prev.includes(tipe) ? prev.filter((t) => t !== tipe) : [...prev, tipe]));
  };

  const toggleLevel = (key: string) => {
    setExpandedLevel((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleDelete = async (id: number, judul: string) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `Kompetensi <strong>${judul}</strong> akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/kompetensi/${id}`);

      if (res.data.status === "success") {
        // Refresh data
        const refreshRes = await api.get("/spa/kompetensi");
        if (refreshRes.data.status === "success") {
          setDataKompetensi(refreshRes.data.data);
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
        text: err.response?.data?.message || "Terjadi kesalahan saat menghapus.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter berdasarkan search
  const filteredData = dataKompetensi
    .map((tipe) => ({
      ...tipe,
      data: tipe.data
        .map((level: any) => ({
          ...level,
          mata_pelajaran: level.mata_pelajaran
            .map((mapel: any) => ({
              ...mapel,
              kompetensi: mapel.kompetensi.filter((k: any) => (searchTerm.trim() === "" ? true : k.judul_kompetensi.toLowerCase().includes(searchTerm.toLowerCase()))),
            }))
            .filter((mapel: any) => mapel.kompetensi.length > 0),
        }))
        .filter((level: any) => level.mata_pelajaran.length > 0),
    }))
    .filter((tipe) => tipe.data.length > 0);

  // Helper untuk badge
  const getJenisBadgeClass = (jenis: string): string => {
    return jenis === "KD" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : "bg-green-100 text-green-700 hover:bg-green-100";
  };

  const getAspekBadgeClass = (aspek?: string): string => {
    if (!aspek) return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    switch (aspek) {
      case "sikap":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "pengetahuan":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "keterampilan":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Kompetensi" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Kompetensi</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-akademik/kompetensi/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full">
                    <PlusIcon size={18} />
                    Tambah Kompetensi
                  </Button>
                </Link>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari kompetensi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Nested Structure */}
              <div className="w-full space-y-4">
                {filteredData.length > 0 ? (
                  filteredData.map((tipe) => (
                    <div key={tipe.tipe_kurikulum} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                      {/* Header Tipe Kurikulum */}
                      <div className="bg-primary p-4 cursor-pointer hover:bg-primary/90 transition-colors flex items-center justify-between" onClick={() => toggleTipe(tipe.tipe_kurikulum)}>
                        <div className="flex items-center gap-3">
                          {expandedTipe.includes(tipe.tipe_kurikulum) ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                          <h2 className="text-lg font-bold text-white">{tipe.tipe_kurikulum === "K13" ? "Kurikulum 2013 (KD)" : "Kurikulum Merdeka (CP)"}</h2>
                        </div>
                      </div>

                      {/* Content */}
                      {expandedTipe.includes(tipe.tipe_kurikulum) && (
                        <div className="p-4 space-y-3">
                          {tipe.data.map((level: any) => {
                            const levelKey = `${tipe.tipe_kurikulum}-${level.tingkat || level.fase}`;
                            const levelLabel = level.tingkat ? `Kelas ${level.tingkat}` : `Fase ${level.fase}`;

                            return (
                              <div key={levelKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Header Level */}
                                <div className="bg-indigo-50 p-3 cursor-pointer hover:bg-indigo-100 transition-colors flex items-center justify-between" onClick={() => toggleLevel(levelKey)}>
                                  <div className="flex items-center gap-2">
                                    {expandedLevel.includes(levelKey) ? <ChevronDownIcon className="text-indigo-700" size={18} /> : <ChevronRightIcon className="text-indigo-700" size={18} />}
                                    <h3 className="font-semibold text-indigo-900">{levelLabel}</h3>
                                  </div>
                                  <span className="text-indigo-700 text-sm">{level.mata_pelajaran.reduce((acc: number, m: any) => acc + m.kompetensi.length, 0)} kompetensi</span>
                                </div>

                                {/* Table per Mata Pelajaran */}
                                {expandedLevel.includes(levelKey) &&
                                  level.mata_pelajaran.map((mapel: any) => (
                                    <div key={mapel.mata_pelajaran_id} className="border-t border-gray-200">
                                      <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">{mapel.mata_pelajaran}</div>

                                      <div className="overflow-x-auto">
                                        <Table>
                                          <TableHeader className="bg-gray-50">
                                            <TableRow>
                                              <TableHead className="text-center font-semibold">No</TableHead>
                                              <TableHead className="font-semibold">Judul Kompetensi</TableHead>
                                              <TableHead className="font-semibold">Jenis</TableHead>
                                              <TableHead className="font-semibold">Kode</TableHead>
                                              {tipe.tipe_kurikulum === "K13" && <TableHead className="font-semibold">Aspek</TableHead>}
                                              <TableHead className="font-semibold">Status</TableHead>
                                              <TableHead className="text-center font-semibold">Aksi</TableHead>
                                            </TableRow>
                                          </TableHeader>
                                          <TableBody>
                                            {mapel.kompetensi.map((komp: any, index: number) => (
                                              <TableRow key={komp.kompetensi_id} className="hover:bg-gray-50 border-b border-gray-100">
                                                <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                                <TableCell className="font-medium">{komp.judul_kompetensi}</TableCell>
                                                <TableCell>
                                                  <Badge className={getJenisBadgeClass(komp.jenis)}>{komp.jenis}</Badge>
                                                </TableCell>
                                                <TableCell className="text-sm">{komp.kode}</TableCell>
                                                {tipe.tipe_kurikulum === "K13" && (
                                                  <TableCell>
                                                    <Badge className={getAspekBadgeClass(komp.aspek)}>{komp.aspek || "-"}</Badge>
                                                  </TableCell>
                                                )}
                                                <TableCell>
                                                  <Badge className={komp.status === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"}>{komp.status}</Badge>
                                                </TableCell>
                                                <TableCell className="flex gap-1 justify-center">
                                                  <DialogDetailKompetensi kompetensiId={komp.kompetensi_id} />

                                                  <Link to={`/superadmin/informasi-akademik/kompetensi/edit/${komp.kompetensi_id}`}>
                                                    <Button className="bg-primary" size="sm">
                                                      <PenBoxIcon size={16} />
                                                    </Button>
                                                  </Link>

                                                  <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(komp.kompetensi_id, komp.judul_kompetensi)} disabled={komp.status === "arsip"}>
                                                    <Trash2Icon size={16} />
                                                  </Button>
                                                </TableCell>
                                              </TableRow>
                                            ))}
                                          </TableBody>
                                        </Table>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-8 text-center text-gray-500">
                    <p className="text-lg font-medium">Tidak ada data kompetensi yang ditemukan</p>
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

export default DataKompetensi;
