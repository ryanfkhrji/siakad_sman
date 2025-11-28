import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SearchIcon, Loader2Icon, ClockIcon, BookOpenIcon, CalendarIcon, DoorOpenIcon, InfoIcon } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Separator } from "@/components/ui/separator";
import { SidebarSiswa } from "@/components/SidebarSiswa";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// import { DialogDetailJadwalSiswa } from "./DetailJadwalPelajaran";

interface JadwalPelajaran {
  id: number;
  id_pivot: number;
  mata_pelajaran: string;
  guru: string;
  kelas: string;
  hari: string;
  jam_pelajaran: string;
  ruangan: string;
  link_opsional?: string;
}

interface DataJadwalSiswa {
  id: number;
  nisn: string;
  nama: string;
  email: string;
  nis: string;
  nama_jurusan: string;
  nama_ekstrakurikuler: string;
  status: string;
  role: string;
  kelas: {
    id: number;
    nama_kelas: string;
    jam_masuk: string;
    wali_kelas: {
      id: number;
      nama: string;
      email: string;
      status: string;
      nip: string;
      keterangan: string;
      role: string;
    };
  };
  jadwal_pelajaran: JadwalPelajaran[];
}

const JadwalPelajaranSiswa = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataJadwal, setDataJadwal] = useState<DataJadwalSiswa | null>(null);
  const [filteredJadwal, setFilteredJadwal] = useState<JadwalPelajaran[]>([]);

  // Fetch data jadwal
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get("/siswa/jadwal-pelajaran/all/diri");
        console.log(res.data.data);

        if (res.data.status === "success") {
          setDataJadwal(res.data.data);
          setFilteredJadwal(res.data.data.jadwal_pelajaran);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data jadwal:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Gagal mengambil data jadwal pelajaran",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search filter
  useEffect(() => {
    if (!dataJadwal) return;

    if (searchTerm.trim() === "") {
      setFilteredJadwal(dataJadwal.jadwal_pelajaran);
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      const filtered = dataJadwal.jadwal_pelajaran.filter(
        (item) => item.mata_pelajaran.toLowerCase().includes(lowerSearch) || item.guru.toLowerCase().includes(lowerSearch) || item.ruangan.toLowerCase().includes(lowerSearch) || item.hari.toLowerCase().includes(lowerSearch)
      );
      setFilteredJadwal(filtered);
    }
  }, [searchTerm, dataJadwal]);

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
        w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
      `}
      >
        <PageTitle title="Jadwal Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Jadwal Pelajaran Saya</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : dataJadwal ? (
            <>
              {/* Info Kelas */}
              <Card className="mb-6 bg-white border-l-4 border-l-primary">
                <CardContent>
                  <div className="flex justify-between items-center flex-wrap gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Kelas</p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.kelas.nama_kelas}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Wali Kelas</p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.kelas.wali_kelas.nama}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Search */}
              <div className="mb-6 flex justify-end">
                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari mata pelajaran, guru, atau ruangan..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Data Jadwal Pelajaran */}
              <div className="w-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredJadwal.length > 0 ? (
                    filteredJadwal.map((jadwal) => (
                      <Card className="w-full hover:shadow-lg transition-shadow" key={jadwal.id}>
                        <CardHeader className="bg-primary/5">
                          <div className="flex items-center gap-2">
                            <BookOpenIcon className="text-primary" size={20} />
                            <CardTitle className="text-xl font-bold text-primary">{jadwal.mata_pelajaran}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="grid gap-3 text-sm">
                            {/* Hari */}
                            <div className="flex justify-between items-start">
                              <span className="font-semibold text-gray-700 flex items-center gap-1">
                                <CalendarIcon className="text-primary" size={14} />
                                Hari
                              </span>
                              <span className="text-right font-medium text-primary">{jadwal.hari || "-"}</span>
                            </div>
                            <Separator />

                            {/* Jam Pelajaran */}
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700 flex items-center gap-1">
                                <ClockIcon className="text-primary" size={14} />
                                Jam Pelajaran
                              </span>
                              <span className="font-medium text-primary">{jadwal.jam_pelajaran || "-"}</span>
                            </div>
                            <Separator />

                            {/* Ruangan */}
                            <div className="flex justify-between">
                              <span className="font-semibold text-gray-700 flex items-center gap-1">
                                <DoorOpenIcon className="text-primary" size={14} />
                                Ruangan
                              </span>
                              <span className="font-medium text-primary">{jadwal.ruangan || "-"}</span>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                          <Button className="w-full" onClick={() => navigate(`/siswa/jadwal-pelajaran/detail/${jadwal.id_pivot}`)}>
                            <InfoIcon size={18} />
                            Lihat Detail
                          </Button>
                          {/* <DialogDetailJadwalSiswa jadwal={jadwal} /> */}
                        </CardFooter>
                      </Card>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 col-span-full">{searchTerm ? "Tidak ada jadwal yang sesuai dengan pencarian." : "Belum ada jadwal pelajaran."}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Card className="w-full">
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-lg">Data jadwal tidak tersedia.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default JadwalPelajaranSiswa;
