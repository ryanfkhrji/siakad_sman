import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2Icon, PlusIcon, PenBoxIcon, Trash2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/utils/formatRupiah";
import { Badge } from "@/components/ui/badge";
import type { EkskulItem } from "@/types/ekstrakurikuler";

const DataEkstrakurikuler = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataEkskul, setDataEkskul] = useState<EkskulItem[]>([]);
  const [filteredEkskul, setFilteredEkskul] = useState<EkskulItem[]>([]);

  // ── Fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/spa/ekstrakurikuler");
      if (res.data.status === "success") {
        setDataEkskul(res.data.data);
        setFilteredEkskul(res.data.data);
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal mengambil data ekskul" });
    } finally {
      setLoading(false);
    }
  };

  // ── Search ────────────────────────────────────────────────────
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEkskul(dataEkskul);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredEkskul(dataEkskul.filter((item) => item.nama_ekskul.toLowerCase().includes(lower) || item.status.toLowerCase().includes(lower)));
    }
  }, [searchTerm, dataEkskul]);

  // ── Hapus ─────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data ekstrakurikuler yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });
    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/ekstrakurikuler/${id}`);
      if (res.data.status === "success") {
        setDataEkskul((prev) => prev.filter((e) => e.id !== id));
        setFilteredEkskul((prev) => prev.filter((e) => e.id !== id));
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Data ekstrakurikuler berhasil dihapus.", showConfirmButton: false, timer: 1800 });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan saat menghapus data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Badge helpers ─────────────────────────────────────────────
  const statusColor = (status: string) => {
    if (status === "wajib") return "bg-red-100 text-red-800";
    if (status === "pilihan") return "bg-blue-100 text-blue-800";
    return "bg-purple-100 text-purple-800"; // jurusan
  };

  const statusAktifColor = (s: string) => (s === "aktif" ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600");

  const statusLabel = (status: string) => {
    if (status === "wajib") return "Wajib";
    if (status === "pilihan") return "Pilihan";
    return "Jurusan";
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Ekstrakurikuler" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Ekstrakurikuler</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-akademik/ekstrakurikuler/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full md:w-auto">
                    <PlusIcon size={18} /> Tambah Ekstrakurikuler
                  </Button>
                </Link>
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari ekstrakurikuler..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredEkskul.length > 0 ? (
                  filteredEkskul.map((ekskul) => (
                    <Card className="w-full" key={ekskul.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start gap-2">
                          <CardTitle className="text-xl font-bold text-primary">{ekskul.nama_ekskul}</CardTitle>
                          <div className="flex gap-2 shrink-0">
                            <Link to={`/superadmin/informasi-akademik/ekstrakurikuler/edit/${ekskul.id}`}>
                              <span className="text-primary cursor-pointer">
                                <PenBoxIcon size={16} />
                              </span>
                            </Link>
                            <span className="text-muted-foreground cursor-pointer" onClick={() => handleDelete(ekskul.id)}>
                              <Trash2Icon size={16} />
                            </span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid gap-3 py-2 text-sm">
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="font-semibold text-gray-700">Anggaran</span>
                            <span>{formatRupiah(Number(ekskul.anggaran))}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="font-semibold text-gray-700">Jenis</span>
                            <Badge className={`text-xs ${statusColor(ekskul.status)}`}>{statusLabel(ekskul.status)}</Badge>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-center flex-wrap gap-2">
                            <span className="font-semibold text-gray-700">Status</span>
                            <Badge className={`text-xs ${statusAktifColor(ekskul.status_aktif)}`}>{ekskul.status_aktif === "aktif" ? "Aktif" : "Arsip"}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4 col-span-3">Tidak ada data ekstrakurikuler.</p>
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

export default DataEkstrakurikuler;
