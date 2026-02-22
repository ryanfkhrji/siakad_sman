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
import type { AtpMasterGroupedByStatus } from "@/types/alurTujuanPembelajaranMaster";
import { Badge } from "@/components/ui/badge";
import { DialogDetailAtpMaster } from "./DialogDetailAlurTujuanPembelajaran";

const DataAtpMaster = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataAtpMaster, setDataAtpMaster] = useState<AtpMasterGroupedByStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStatus, setExpandedStatus] = useState<string[]>(["aktif"]);
  const [expandedKompetensi, setExpandedKompetensi] = useState<string[]>([]);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/atp-master");

        if (res.data.status === "success") {
          setDataAtpMaster(res.data.data);
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          setDataAtpMaster([]);
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Tidak dapat memuat data ATP Master",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleStatus = (status: string) => {
    setExpandedStatus((prev) => (prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]));
  };

  const toggleKompetensi = (key: string) => {
    setExpandedKompetensi((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const handleDelete = async (id: number, tujuanPembelajaran: string) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `ATP <strong>${tujuanPembelajaran}</strong> akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/atp-master/${id}`);

      if (res.data.status === "success") {
        // Refresh data
        const refreshRes = await api.get("/spa/atp-master");
        if (refreshRes.data.status === "success") {
          setDataAtpMaster(refreshRes.data.data);
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
        text: err.response?.data?.message || err.response?.data?.errors?.atp?.[0] || "Terjadi kesalahan saat menghapus.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter berdasarkan search
  const filteredData = dataAtpMaster
    .map((statusGroup) => ({
      ...statusGroup,
      kompetensi: statusGroup.kompetensi
        .map((komp) => ({
          ...komp,
          atp: komp.atp.filter((atp) => (searchTerm.trim() === "" ? true : atp.tujuan_pembelajaran.toLowerCase().includes(searchTerm.toLowerCase()))),
        }))
        .filter((komp) => komp.atp.length > 0),
    }))
    .filter((statusGroup) => statusGroup.kompetensi.length > 0);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data ATP Master" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Alur Tujuan Pembelajaran (ATP) Master</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-akademik/alur-tujuan-pembelajaran-master/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full">
                    <PlusIcon size={18} />
                    Tambah ATP Master
                  </Button>
                </Link>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari tujuan pembelajaran..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Nested Structure */}
              <div className="w-full space-y-4">
                {filteredData.length > 0 ? (
                  filteredData.map((statusGroup) => (
                    <div key={statusGroup.status} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                      {/* Header Status */}
                      <div
                        className={`p-4 cursor-pointer transition-colors flex items-center justify-between ${statusGroup.status === "aktif" ? "bg-green-100 hover:bg-green-200" : "bg-gray-100 hover:bg-gray-200"}`}
                        onClick={() => toggleStatus(statusGroup.status)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedStatus.includes(statusGroup.status) ? (
                            <ChevronDownIcon className={statusGroup.status === "aktif" ? "text-green-700" : "text-gray-700"} size={20} />
                          ) : (
                            <ChevronRightIcon className={statusGroup.status === "aktif" ? "text-green-700" : "text-gray-700"} size={20} />
                          )}
                          <h2 className={`text-lg font-bold ${statusGroup.status === "aktif" ? "text-green-700" : "text-gray-700"}`}>Status: {statusGroup.status === "aktif" ? "Aktif" : "Arsip"}</h2>
                        </div>
                        <Badge className={statusGroup.status === "aktif" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}>{statusGroup.kompetensi.reduce((acc, k) => acc + k.atp.length, 0)} ATP</Badge>
                      </div>

                      {/* Content */}
                      {expandedStatus.includes(statusGroup.status) && (
                        <div className="p-4 space-y-3">
                          {statusGroup.kompetensi.map((komp) => {
                            const kompKey = `${statusGroup.status}-${komp.kompetensi_id}`;

                            return (
                              <div key={kompKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Header Kompetensi */}
                                <div className="bg-indigo-50 p-3 cursor-pointer hover:bg-indigo-100 transition-colors flex items-center justify-between" onClick={() => toggleKompetensi(kompKey)}>
                                  <div className="flex items-center gap-2">
                                    {expandedKompetensi.includes(kompKey) ? <ChevronDownIcon className="text-indigo-700" size={18} /> : <ChevronRightIcon className="text-indigo-700" size={18} />}
                                    <div>
                                      <h3 className="font-semibold text-indigo-900">{komp.judul_kompetensi}</h3>
                                      <p className="text-sm text-indigo-700">{komp.fase ? `Fase ${komp.fase}` : komp.tingkat ? `Kelas ${komp.tingkat}` : ""}</p>
                                    </div>
                                  </div>
                                  <span className="text-indigo-700 text-sm font-medium">{komp.atp.length} ATP</span>
                                </div>

                                {/* Table ATP */}
                                {expandedKompetensi.includes(kompKey) && (
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader className="bg-gray-50">
                                        <TableRow>
                                          <TableHead className="text-center font-semibold w-20">Urutan</TableHead>
                                          <TableHead className="font-semibold">Tujuan Pembelajaran</TableHead>
                                          <TableHead className="text-center font-semibold w-32">Aksi</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {komp.atp.map((atp) => (
                                          <TableRow key={atp.atp_id} className="hover:bg-gray-50 border-b border-gray-100">
                                            <TableCell className="text-center font-medium">{atp.urutan}</TableCell>
                                            <TableCell className="whitespace-normal">{atp.tujuan_pembelajaran}</TableCell>
                                            <TableCell className="flex gap-1 justify-center">
                                              <DialogDetailAtpMaster atpId={atp.atp_id} />

                                              <Link to={`/superadmin/informasi-akademik/alur-tujuan-pembelajaran-master/edit/${atp.atp_id}`}>
                                                <Button className="bg-primary" size="sm">
                                                  <PenBoxIcon size={16} />
                                                </Button>
                                              </Link>

                                              <Button className="bg-muted-foreground hover:bg-muted-foreground/90" size="sm" onClick={() => handleDelete(atp.atp_id, atp.tujuan_pembelajaran)}>
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
                    <p className="text-lg font-medium">Tidak ada data ATP Master yang ditemukan</p>
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

export default DataAtpMaster;
