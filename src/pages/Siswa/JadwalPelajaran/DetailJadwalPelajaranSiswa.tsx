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

interface JadwalDetail {
  id: number;
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
  const [jadwalDetail, setJadwalDetail] = useState<JadwalDetail | null>(null);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch data jadwal detail
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get(`/siswa/jadwal-pelajaran/show/diri/${id}`);

        if (res.data.status === "success") {
          // ✅ Backend return object langsung, bukan array
          setJadwalDetail(res.data.data);
        }
      } catch (error: any) {
        console.error("Gagal mengambil detail jadwal:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data",
          text: error.response?.data?.message || "Jadwal tidak ditemukan",
        });
        navigate("/siswa/jadwal-pelajaran");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
        w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
      `}
      >
        <PageTitle title="Detail Jadwal Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-6">
            <Link to="/siswa/jadwal-pelajaran">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon size={18} />
                Kembali
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Detail Jadwal Pelajaran</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : jadwalDetail ? (
            <>
              {/* Card Detail Jadwal */}
              <Card className="w-full max-w-3xl mx-auto shadow-lg">
                <CardHeader className="bg-primary text-white">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <BookOpenIcon size={28} />
                    {jadwalDetail.mata_pelajaran}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4 text-sm">
                    {/* Hari */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <CalendarIcon className="text-primary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-700">Hari</span>
                      </div>
                      <span className="text-gray-900 font-medium">{jadwalDetail.hari || "-"}</span>
                    </div>

                    <Separator />

                    {/* Guru Pengajar */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <UserIcon className="text-primary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-700">Guru Pengajar</span>
                      </div>
                      <span className="text-gray-900 font-medium text-right max-w-[50%]">{jadwalDetail.guru || "-"}</span>
                    </div>

                    <Separator />

                    {/* Jam Pelajaran */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <ClockIcon className="text-primary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-700">Jam Pelajaran</span>
                      </div>
                      <span className="text-gray-900 font-medium">{jadwalDetail.jam_pelajaran || "-"}</span>
                    </div>

                    <Separator />

                    {/* Ruangan */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <DoorOpenIcon className="text-primary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-700">Ruangan</span>
                      </div>
                      <span className="text-gray-900 font-medium">{jadwalDetail.ruangan || "-"}</span>
                    </div>

                    <Separator />

                    {/* Kelas */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <BookOpenIcon className="text-primary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-700">Kelas</span>
                      </div>
                      <span className="text-gray-900 font-medium">{jadwalDetail.kelas || "-"}</span>
                    </div>

                    {/* Link Opsional */}
                    {jadwalDetail.link_opsional && jadwalDetail.link_opsional !== "-" && (
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
                            href={jadwalDetail.link_opsional.startsWith("http") ? jadwalDetail.link_opsional : `https://${jadwalDetail.link_opsional}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline font-medium break-all max-w-[50%] text-right"
                          >
                            {jadwalDetail.link_opsional}
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <div className="mt-6 max-w-3xl mx-auto">
                <Card className="border-l-4 border-l-primary bg-blue-50">
                  <CardContent className="pt-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">💡 Info:</span> Pastikan Anda datang tepat waktu sesuai jadwal. Jika ada perubahan jadwal, akan diinformasikan oleh guru pengajar atau wali kelas.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="w-full max-w-3xl mx-auto">
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-lg">Data jadwal tidak ditemukan.</p>
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
