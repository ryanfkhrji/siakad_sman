import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { SearchIcon, Loader2Icon, InfoIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import type { Ekskul } from "@/types";
import Swal from "sweetalert2";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarSiswa } from "@/components/SidebarSiswa";

const DataEkstrakurikulerSiswa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataEkskul, setDataEkskul] = useState<Ekskul[]>([]);
  const [dataEkskulDiikuti, setDataEkskulDiikuti] = useState<Ekskul[]>([]);
  const [filteredEkskul, setFilteredEkskul] = useState<Ekskul[]>([]);
  const [filterType, setFilterType] = useState<"all" | "registered">("all");

  // Fetch data ekskul
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch semua ekskul
        const resAll = await api.get("/siswa/ekstrakurikuler/all");

        // Fetch ekskul yang diikuti siswa
        const resDiikuti = await api.get("/siswa/ekstrakurikuler/diri/diikuti");

        if (resAll.data.status === "success") {
          setDataEkskul(resAll.data.data);
          setFilteredEkskul(resAll.data.data); // Default: tampilkan semua
        }

        if (resDiikuti.data.status === "success") {
          const normalized = resDiikuti.data.data.map((item: any) => {
            // COCOKKAN dengan data ALL ekskul supaya dapat ID ekskul asli
            const ekskulAsli = resAll.data.data.find((e: any) => e.nama_ekstrakurikuler === item.nama_ekskul);

            return {
              id_pivot: item.pivot_id,
              id: ekskulAsli?.id ?? null, // <-- INI FIX-NYA
              nama_ekstrakurikuler: item.nama_ekskul,
              nama_pengajar: item.nama_pengajar,
              jumlah_peserta: item.jumlah_peserta,
              peserta: item.peserta,
            };
          });

          setDataEkskulDiikuti(normalized);
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

  // Filter logic
  useEffect(() => {
    let filtered: Ekskul[] = [];

    // Pilih data source
    if (filterType === "all") {
      filtered = dataEkskul;
    } else if (filterType === "registered") {
      filtered = dataEkskulDiikuti;
    }

    // Filter berdasarkan search
    if (searchTerm.trim() !== "") {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter((item) => item.nama_ekstrakurikuler.toLowerCase().includes(lowerSearch));
    }

    setFilteredEkskul(filtered);
  }, [searchTerm, dataEkskul, dataEkskulDiikuti, filterType]);

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
        w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
      `}
      >
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
              {/* Toolbar: Filter + Search */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                {/* Filter */}
                <Select value={filterType} onValueChange={(value: "all" | "registered") => setFilterType(value)}>
                  <SelectTrigger className="w-full md:w-1/3 cursor-pointer">
                    <SelectValue placeholder="Filter Ekstrakurikuler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Ekstrakurikuler</SelectItem>
                    <SelectItem value="registered">Ekskul yang Sudah Didaftar</SelectItem>
                  </SelectContent>
                </Select>

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
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid gap-3 py-2 text-sm">
                            <div className="flex justify-between flex-wrap">
                              <span className="font-semibold text-gray-700">Pembina</span>
                              <span>{ekskul.nama_pengajar}</span>
                            </div>
                            <Separator />
                          </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                          <Link to={`/siswa/ekstrakurikuler/detail-ekstrakurikuler/${ekskul.id}`} className="w-full">
                            <Button type="submit" className="w-full">
                              <InfoIcon size={18} />
                              Lihat Detail
                            </Button>
                          </Link>
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 col-span-full">{filterType === "registered" ? "Anda belum terdaftar di ekstrakurikuler manapun." : "Tidak ada data ekstrakurikuler."}</p>
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

export default DataEkstrakurikulerSiswa;
