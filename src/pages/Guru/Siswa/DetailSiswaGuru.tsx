import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SearchIcon, Loader2Icon, ClockIcon, BookOpenIcon, ArrowLeftIcon, User2, DoorClosedIcon, Clock, CalendarIcon, DoorOpenIcon, LinkIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { Input } from "@/components/ui/input";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Separator } from "@/components/ui/separator";
import { SidebarGuru } from "@/components/SidebarGuru";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface JadwalPelajaran {
  id: number;
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
  };
  wali_kelas: {
    id: number;
    nama: string;
    email: string;
    status: string;
    nip: string;
    keterangan: string;
    role: string;
  };
  jadwal_pelajaran: JadwalPelajaran[];
}

const DetailSiswaGuru = () => {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dataJadwal, setDataJadwal] = useState<DataJadwalSiswa | null>(null);
  const [filteredJadwal, setFilteredJadwal] = useState<JadwalPelajaran[]>([]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/pegawai/siswa/${id}`);

        if (res.data.status === "success") {
          setDataJadwal(res.data.data);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data siswa:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Gagal mengambil data siswa",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

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
      <SidebarGuru isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
        w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
      `}
      >
        <PageTitle title="Detail Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Detail Siswa</h1>

          <div className="mb-6">
            <Link to="/guru/siswa/data-siswa">
              <Button variant="outline" size={"sm"}>
                <ArrowLeftIcon size={16} />
                Kembali
              </Button>
            </Link>
          </div>

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
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <DoorClosedIcon size={16} />
                        Kelas
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.kelas.nama_kelas}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <User2 size={16} />
                        Wali Kelas
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.wali_kelas.nama}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center gap-1">
                        <Clock size={16} />
                        Jam Pelajaran
                      </p>
                      <p className="text-lg font-bold text-primary">{dataJadwal.kelas.jam_masuk}</p>
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
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="text-primary" size={14} />
                                <span className="font-semibold text-gray-700">Hari</span>
                              </div>
                              <span className="text-right font-medium text-primary">{jadwal.hari || "-"}</span>
                            </div>
                            <Separator />

                            {/* Kelas */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <BookOpenIcon className="text-primary" size={14} />
                                <span className="font-semibold text-gray-700">Kelas</span>
                              </div>
                              <span className="text-right font-medium max-w-[60%] text-primary">{jadwal.kelas || "-"}</span>
                            </div>
                            <Separator />

                            {/* Jam Pelajaran */}
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-700 flex items-center gap-1">
                                <ClockIcon className="text-primary" size={14} />
                                Jam Pelajaran
                              </span>
                              <span className="font-medium text-primary text-right">{jadwal.jam_pelajaran || "-"}</span>
                            </div>
                            <Separator />

                            {/* Ruangan */}
                            <div className="flex justify-between">
                              <div className="flex items-center gap-2">
                                <DoorOpenIcon className="text-primary" size={14} />
                                <span className="font-semibold text-gray-700">Ruangan</span>
                              </div>
                              <span className="font-medium text-primary text-right">{jadwal.ruangan || "-"}</span>
                            </div>
                            <Separator />

                            {/* Link Peljaran */}
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2">
                                <LinkIcon className="text-primary" size={14} />
                                <span className="font-semibold text-gray-700">Link Pembelajaran</span>
                              </div>
                              <a
                                href={jadwal.link_opsional ? (jadwal.link_opsional.startsWith("http") ? jadwal.link_opsional : `https://${jadwal.link_opsional}`) : ""}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline max-w-[55%] text-right break-all"
                              >
                                {jadwal.link_opsional}
                              </a>
                            </div>
                            <Separator />
                          </div>
                        </CardContent>
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

export default DetailSiswaGuru;
