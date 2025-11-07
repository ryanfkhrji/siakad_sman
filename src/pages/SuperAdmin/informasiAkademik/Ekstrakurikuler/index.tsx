import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2Icon, PlusIcon, PenBoxIcon, Trash2Icon, ListIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import type { Ekskul } from "@/types";
import Swal from "sweetalert2";
import { Separator } from "@/components/ui/separator";
import { formatRupiah } from "@/utils/formatRupiah";

const DataEkstrakurikuler = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataEkskul, setDataEkskul] = useState<Ekskul[]>([]);
  const [filteredEkskul, setFilteredEkskul] = useState<Ekskul[]>([]);

  // get data ekskul
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/ekstrakurikuler");
        if (res.data.status === "success") {
          setDataEkskul(res.data.data);
          setFilteredEkskul(res.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data ekskul:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal mengambil data ekskul",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEkskul(dataEkskul);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      setFilteredEkskul(dataEkskul.filter((item) => item.nama_ekstrakurikuler.toLowerCase().includes(lowerSearch)));
    }
  }, [searchTerm, dataEkskul]);

  // hapus
  const handleDelete = async (id: number) => {
    // Konfirmasi hapus
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
      const res = await api.delete(`/ekstrakurikuler/${id}`);

      if (res.data.status === "success") {
        // Hapus dari state agar tabel langsung update tanpa reload
        setDataEkskul((prev) => prev.filter((ekskul) => ekskul.id !== id));
        setFilteredEkskul((prev) => prev.filter((ekskul) => ekskul.id !== id));

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data ekstrakurikuler berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.message || "Gagal menghapus data ekstrakurikuler.",
        });
      }
    } catch (err: any) {
      // Tangani respons error dari backend
      if (err.response?.data?.status === "error") {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: err.response.data.message || "Data ekstrakurikuler tidak ditemukan.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Terjadi kesalahan koneksi ke server.",
        });
      }
      console.error("Gagal menghapus siswa:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
        w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
      `}
      >
        <PageTitle title="Data Ekstrakurikuler" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Ekstrakurikuler</h1>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Toolbar: Tambah + Filter + Search */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-akademik/ekstrakurikuler/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full md:w-auto">
                    <PlusIcon size={18} />
                    Tambah Ekstrakurikuler
                  </Button>
                </Link>

                {/* Search */}
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari ekstrakurikuler..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>
              {/* Data Ekstrakurikuler */}
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEkskul.length > 0 ? (
                    filteredEkskul.map((ekskul, index) => (
                      <Card className="w-full" key={index}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-xl font-bold text-primary">{ekskul.nama_ekstrakurikuler}</CardTitle>

                            <div className="flex gap-2">
                              <Link to={`/superadmin/informasi-akademik/ekstrakurikuler/edit/${ekskul.id}`}>
                                <span className="text-primary">
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
                            <div className="flex justify-between flex-wrap">
                              <span className="font-semibold text-gray-700">Pembina</span>
                              <span>{ekskul.nama_pengajar ?? "-"}</span>
                            </div>
                            <Separator />

                            <div className="flex justify-between flex-wrap">
                              <span className="font-semibold text-gray-700">Anggaran</span>
                              <span>{formatRupiah(ekskul.anggaran)}</span>
                            </div>
                            <Separator />

                            <div className="flex justify-between flex-wrap">
                              <span className="font-semibold text-gray-700">Status</span>
                              <span>{ekskul.status}</span>
                            </div>
                            <Separator />

                            <div className="flex justify-between flex-wrap">
                              <span className="font-semibold text-gray-700">Jumlah Peserta</span>
                              <span>{ekskul.jumlah_peserta ?? 0}</span>
                            </div>
                            <Separator />
                          </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                          <Link to={`/superadmin/informasi-akademik/ekstrakurikuler/create-siswa/${ekskul.id}`} className="w-full">
                            <Button type="submit" className="w-full">
                              <PlusIcon size={18} />
                              Tambah Siswa
                            </Button>
                          </Link>

                          <Link to={`/superadmin/informasi-akademik/ekstrakurikuler/daftar-siswa/${ekskul.id}`} className="w-full">
                            <Button type="submit" className="w-full" variant={"outline"}>
                              <ListIcon size={18} />
                              Daftar Siswa
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">Tidak ada data ekstrakurikuler.</p>
                  )}
                </div>
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
