import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, ArrowLeftIcon, BookOpenIcon, UserIcon, ClockIcon, DoorOpenIcon, LinkIcon, CalendarIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Separator } from "@/components/ui/separator";
import { SidebarSiswa } from "@/components/SidebarSiswa";

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

const DetailJadwalPelajaranSiswa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jadwal, setJadwal] = useState<JadwalPelajaran | null>(null);

  const { id_pivot } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        // 🔥 PANGGIL API SESUAI RESPONS ASLI
        const res = await api.get(`/siswa/jadwal-pelajaran/show/diri/${id_pivot}`);

        if (res.data.status === "success") {
          setJadwal(res.data.data); // langsung jadwal 1 item
        } else {
          throw new Error("Data tidak ditemukan");
        }
      } catch (error: any) {
        console.error("Gagal:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data",
          text: error.response?.data?.message || "Terjadi kesalahan",
        });
        navigate("/siswa/jadwal-pelajaran");
      } finally {
        setLoading(false);
      }
    };

    if (id_pivot) fetchDetail();
  }, [id_pivot, navigate]);

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}
      >
        <PageTitle title="Detail Jadwal Pelajaran" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/siswa/jadwal-pelajaran">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon size={18} />
                Kembali
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Detail Jadwal</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : jadwal ? (
            <>
              <Card className="w-full max-w-3xl mx-auto shadow-lg">
                <CardHeader className="bg-primary text-white">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <BookOpenIcon size={28} />
                    {jadwal.mata_pelajaran}
                  </CardTitle>
                </CardHeader>

                <CardContent className="pt-6">
                  <div className="grid gap-4 text-sm">
                    <DetailItem icon={<CalendarIcon className="text-primary" size={20} />} label="Hari" value={jadwal.hari} />

                    <Separator />

                    <DetailItem icon={<UserIcon className="text-primary" size={20} />} label="Guru Pengajar" value={jadwal.guru} />

                    <Separator />

                    <DetailItem icon={<ClockIcon className="text-primary" size={20} />} label="Jam Pelajaran" value={jadwal.jam_pelajaran} />

                    <Separator />

                    <DetailItem icon={<DoorOpenIcon className="text-primary" size={20} />} label="Ruangan" value={jadwal.ruangan} />

                    <Separator />

                    <DetailItem icon={<BookOpenIcon className="text-primary" size={20} />} label="Kelas" value={jadwal.kelas} />

                    {jadwal.link_opsional && jadwal.link_opsional !== "-" && (
                      <>
                        <Separator />

                        <div className="flex items-start justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-3 rounded-full">
                              <LinkIcon className="text-blue-600" size={20} />
                            </div>
                            <span className="font-semibold text-gray-700">Link Pembelajaran</span>
                          </div>

                          <a
                            href={jadwal.link_opsional.startsWith("http") ? jadwal.link_opsional : `https://${jadwal.link_opsional}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium break-all max-w-[50%] text-right"
                          >
                            {jadwal.link_opsional}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="mt-6 max-w-3xl mx-auto">
                <Card className="border-l-4 border-l-primary bg-blue-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">💡 Info:</span>
                      Pastikan hadir tepat waktu sesuai jadwal.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="w-full max-w-3xl mx-auto">
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-lg">Data tidak ditemukan.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailJadwalPelajaranSiswa;

// COMPONENT DETAIL ITEM
const DetailItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
    <div className="flex items-center gap-3">
      <div className="bg-primary/10 p-3 rounded-full">{icon}</div>
      <span className="font-semibold text-gray-700">{label}</span>
    </div>
    <span className="text-gray-900 font-medium">{value || "-"}</span>
  </div>
);
