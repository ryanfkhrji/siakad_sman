import { useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Loader2Icon, UserIcon, ClockIcon, UsersIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import type { DetailKelasSiswa } from "@/types";
import Swal from "sweetalert2";
import { Separator } from "@/components/ui/separator";
import { SidebarSiswa } from "@/components/SidebarSiswa";

const DetailKelas = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataKelas, setDataKelas] = useState<DetailKelasSiswa | null>(null);

  // Fetch data kelas siswa
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const res = await api.get("/siswa/kelas/diri");

        if (res.data.status === "success") {
          setDataKelas(res.data.data);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data kelas:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data",
          text: error.response?.data?.message || "Tidak dapat memuat data kelas",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`
        w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}
      `}
      >
        <PageTitle title="Detail Kelas" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Detail Kelas Saya</h1>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : dataKelas ? (
            <>
              {/* Card Informasi Kelas */}
              <Card className="w-full mx-auto shadow">
                <CardHeader className="bg-primary text-white pt-2 px-10">
                  <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <UsersIcon size={28} />
                    Kelas: {dataKelas.nama_kelas}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid gap-3 text-sm">
                    {/* Jam Masuk */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <ClockIcon className="text-primary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-700">Jam Masuk</span>
                      </div>
                      <span className="text-gray-900 font-medium">{dataKelas.jam_masuk || "-"}</span>
                    </div>

                    <Separator />

                    {/* Jumlah Siswa */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <UsersIcon className="text-primary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-700">Jumlah Siswa</span>
                      </div>
                      <span className="text-gray-900 font-medium">{dataKelas.jumlah_siswa} Siswa</span>
                    </div>

                    <Separator />

                    {/* Wali Kelas */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-3 rounded-full">
                          <UserIcon className="text-primary" size={20} />
                        </div>
                        <span className="font-semibold text-gray-700">Wali Kelas</span>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-900 font-medium">{dataKelas.wali.nama || "-"}</p>
                        {dataKelas.wali.role && <p className="text-xs text-gray-500 capitalize">{dataKelas.wali.role}</p>}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <div className="mt-6 w-full mx-auto">
                <Card className="border-l-4 border-l-primary bg-blue-50">
                  <CardContent>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-primary">💡 Info:</span> Ini adalah informasi kelas Anda saat ini. Jika ada pertanyaan atau kendala, silakan hubungi wali kelas Anda.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card className="w-full max-w-2xl mx-auto">
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-lg">Anda belum terdaftar di kelas manapun.</p>
                <p className="text-gray-400 text-sm mt-2">Silakan hubungi administrator untuk informasi lebih lanjut.</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailKelas;
