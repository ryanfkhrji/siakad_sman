import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/pages/Footer";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Loader2Icon, PlusIcon, SearchIcon, HistoryIcon } from "lucide-react";
import type { PembinaSelectItem, DataSelectPembinaEkskul } from "@/types/pembinaEkskul";

const DataPembinaEkskul = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pembinaList, setPembinaList] = useState<PembinaSelectItem[]>([]);

  // ── Fetch daftar pembina dari data-select ──────────────────────
  useEffect(() => {
    fetchPembina();
  }, []);

  const fetchPembina = async () => {
    try {
      setLoading(true);
      const res = await api.get("/spa/data-select/pembina/ekstrakurikuler");
      if (res.data.status === "success") {
        const data: DataSelectPembinaEkskul = res.data.data;
        setPembinaList(data.pembina);
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal memuat data pembina" });
    } finally {
      setLoading(false);
    }
  };

  // ── Search ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return pembinaList;
    const lower = searchTerm.toLowerCase();
    return pembinaList.filter((p) => p.nama_pembina.toLowerCase().includes(lower) || p.nip.toLowerCase().includes(lower) || p.role.toLowerCase().includes(lower));
  }, [searchTerm, pembinaList]);

  // ── Badge helpers ──────────────────────────────────────────────
  const roleBadge = (role: string) => {
    if (role === "guru") return "bg-blue-100 text-blue-800";
    if (role === "staff") return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Pembina Ekstrakurikuler" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Pembina Ekstrakurikuler</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Toolbar */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <Link to="/superadmin/informasi-akademik/pembina-ekskul/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full md:w-auto">
                    <PlusIcon size={18} /> Tetapkan Pembina
                  </Button>
                </Link>
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari nama, NIP, role..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Tabel */}
              <div className="w-full overflow-x-auto rounded border border-gray-200 shadow-sm bg-white">
                <Table>
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-white text-center w-12">No</TableHead>
                      <TableHead className="text-white">Nama Pembina</TableHead>
                      <TableHead className="text-white">NIP</TableHead>
                      <TableHead className="text-white">NUPTK</TableHead>
                      <TableHead className="text-white text-center">Role</TableHead>
                      <TableHead className="text-white text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length > 0 ? (
                      filtered.map((pembina, idx) => (
                        <TableRow key={pembina.pembina_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{pembina.nama_pembina}</TableCell>
                          <TableCell className="text-sm text-gray-500">{pembina.nip}</TableCell>
                          <TableCell className="text-sm text-gray-500">{pembina.nuptk}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`text-xs capitalize ${roleBadge(pembina.role)}`}>{pembina.role}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/superadmin/informasi-akademik/pembina-ekskul/histori/${pembina.pembina_id}`, { state: { nama_pembina: pembina.nama_pembina, nip: pembina.nip, nuptk: pembina.nuptk } })}
                            >
                              <HistoryIcon size={15} className="mr-1" /> Histori
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                          Tidak ada data pembina
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataPembinaEkskul;
