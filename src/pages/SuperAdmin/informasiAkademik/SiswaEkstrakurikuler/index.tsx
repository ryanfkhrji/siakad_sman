import { useState, useEffect, useMemo } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Footer from "@/pages/Footer";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Loader2Icon, PlusIcon, SearchIcon, HistoryIcon } from "lucide-react";
import type { SiswaSelectItem, DataSelectSiswaEkskul } from "@/types/siswaEkskul";

const DataSiswaEkskul = () => {
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [siswaList, setSiswaList] = useState<SiswaSelectItem[]>([]);

  useEffect(() => {
    fetchSiswa();
  }, []);

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      const res = await api.get("/spa/data-select/siswa/ekskul");
      if (res.data.status === "success") {
        const data: DataSelectSiswaEkskul = res.data.data;
        setSiswaList(data.siswa);
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal memuat data siswa" });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return siswaList;
    const lower = searchTerm.toLowerCase();
    return siswaList.filter((s) => s.nama_siswa.toLowerCase().includes(lower) || s.nisn.toLowerCase().includes(lower) || s.nis.toLowerCase().includes(lower));
  }, [searchTerm, siswaList]);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Siswa Ekstrakurikuler" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Siswa Ekstrakurikuler</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <Link to="/superadmin/informasi-akademik/siswa-ekskul/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full md:w-auto">
                    <PlusIcon size={18} /> Daftarkan Siswa
                  </Button>
                </Link>
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari nama, NISN, NIS..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              <div className="w-full overflow-x-auto rounded border border-gray-200 shadow-sm bg-white">
                <Table>
                  <TableHeader className="bg-primary">
                    <TableRow>
                      <TableHead className="text-white text-center w-12">No</TableHead>
                      <TableHead className="text-white">Nama Siswa</TableHead>
                      <TableHead className="text-white">NISN</TableHead>
                      <TableHead className="text-white">NIS</TableHead>
                      <TableHead className="text-white text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length > 0 ? (
                      filtered.map((siswa, idx) => (
                        <TableRow key={siswa.siswa_id} className="hover:bg-indigo-50 even:bg-gray-50 border-b border-gray-100">
                          <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{siswa.nama_siswa}</TableCell>
                          <TableCell className="text-sm text-gray-500">{siswa.nisn}</TableCell>
                          <TableCell className="text-sm text-gray-500">{siswa.nis}</TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(`/superadmin/informasi-akademik/siswa-ekskul/histori/${siswa.siswa_id}`, {
                                  state: {
                                    nama_siswa: siswa.nama_siswa,
                                    nisn: siswa.nisn,
                                    nis: siswa.nis,
                                  },
                                })
                              }
                            >
                              <HistoryIcon size={15} className="mr-1" /> Histori
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                          Tidak ada data siswa
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

export default DataSiswaEkskul;
