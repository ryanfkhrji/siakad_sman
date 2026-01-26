import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, UserIcon, BookOpenIcon, AwardIcon, TrophyIcon, CalendarIcon, ClockIcon } from "lucide-react";
import type { Siswa } from "@/types/siswa";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import type { SiswaDetailResponse } from "@/types/siswa";

interface DialogDetailSiswaProps {
  siswa: Siswa;
}

export function DialogDetailSiswa({ siswa }: DialogDetailSiswaProps) {
  const [detailData, setDetailData] = useState<SiswaDetailResponse["data"] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !detailData) {
      fetchDetailData();
    }
  }, [open]);

  const fetchDetailData = async () => {
    // Validasi siswa.id - cek semua kemungkinan
    const siswaId = siswa?.id || siswa?.siswa_id;

    if (!siswaId) {
      console.error("Siswa object:", siswa);
      setError("ID siswa tidak valid");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.get<SiswaDetailResponse>(`/spa/siswa/${siswaId}`);

      if (res.data.status === "success") {
        setDetailData(res.data.data);
      } else {
        setError(res.data.message || "Gagal mengambil data");
      }
    } catch (error: any) {
      console.error("Error:", error);
      console.error("Response:", error.response?.data);
      setError(error.response?.data?.message || "Gagal mengambil detail siswa");
    } finally {
      setLoading(false);
    }
  };

  // Reset state saat dialog ditutup
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setDetailData(null);
      setError(null);
    }
  };

  // Helper status ekstrakurikuler
 const getStatusEkskulBadgeClass = (status?: unknown): string => {
   if (!status || typeof status !== "string") {
     return "bg-gray-100 text-gray-700 border-gray-300";
   }

   const normalized = status.toLowerCase().replace(/\s+/g, " ").trim();

   switch (normalized) {
     case "aktif":
       return "bg-green-100 text-green-700 border-green-300";
     case "cukup aktif":
       return "bg-blue-100 text-blue-700 border-blue-300";
     case "kurang aktif":
       return "bg-yellow-100 text-yellow-700 border-yellow-300";
     case "tidak aktif":
       return "bg-red-100 text-red-700 border-red-300";
     default:
       return "bg-gray-100 text-gray-700 border-gray-300";
   }
 };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[950px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <UserIcon className="h-6 w-6" />
            Detail Siswa
          </DialogTitle>
          <DialogDescription>Informasi lengkap mengenai siswa dan riwayat akademik.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <p className="text-lg font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchDetailData}>
              Coba Lagi
            </Button>
          </div>
        ) : !detailData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-lg font-medium">Tidak ada data yang ditampilkan</p>
            <p className="text-sm mt-2">ID Siswa: {siswa?.id || siswa?.siswa_id || "tidak ditemukan"}</p>
          </div>
        ) : (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Info Dasar</TabsTrigger>
              <TabsTrigger value="rombel">Rombel</TabsTrigger>
              <TabsTrigger value="ekskul">Ekskul</TabsTrigger>
              <TabsTrigger value="prestasi">Prestasi</TabsTrigger>
            </TabsList>

            {/* Tab Info Dasar */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                  <CardDescription className="text-xs">{detailData ? "Data dari server" : "Data dari tabel (preview)"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">NISN</p>
                      <p className="text-sm font-semibold">{detailData?.nisn || siswa.nisn || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">NIS</p>
                      <p className="text-sm font-semibold">{detailData?.nis || siswa.nis || "-"}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
                    <p className="text-base font-semibold">{detailData?.nama_siswa || siswa.nama || "-"}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold">{detailData?.email || siswa.email || "-"}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Jurusan</p>
                      <p className="text-sm font-semibold">{detailData?.jurusan_siswa || siswa.nama_jurusan || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Status</p>
                      <Badge className={detailData?.status_siswa === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}>{detailData?.status_siswa || siswa.status || "-"}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Rombel */}
            <TabsContent value="rombel" className="space-y-4">
              {detailData?.histori_rombel && detailData.histori_rombel.length > 0 ? (
                detailData.histori_rombel.map((rombel) => (
                  <Card key={rombel.rombel_id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpenIcon className="h-4 w-4" />
                        {rombel.nama_rombel}
                      </CardTitle>
                      <CardDescription>
                        {rombel.kelas} - {rombel.jurusan_kelas || "Belum ada jurusan"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Wali Rombel</p>
                          <p className="font-semibold">{rombel.wali_rombel}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Tahun Akademik</p>
                          <p className="font-semibold">{rombel.tahun_akademik_rombel}</p>
                        </div>
                      </div>

                      {rombel.histori_jadwal_pelajaran && rombel.histori_jadwal_pelajaran.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-semibold mb-2">Jadwal Pelajaran</p>
                          <div className="space-y-2">
                            {rombel.histori_jadwal_pelajaran.map((semester, sIdx) => (
                              <div key={sIdx} className="border rounded-lg p-3 bg-muted/30">
                                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                  <CalendarIcon className="h-4 w-4" />
                                  {semester.semester} - {semester.tahun_akademik_semester}
                                </p>
                                <div className="space-y-2">
                                  {semester.jadwal_pelajaran.slice(0, 3).map((jadwal, jIdx) => (
                                    <div key={jIdx} className="flex items-center gap-2 text-xs bg-background p-2 rounded">
                                      <CalendarIcon className="h-3 w-3 text-primary" />
                                      <span className="font-medium min-w-[60px]">{jadwal.hari}</span>
                                      <ClockIcon className="h-3 w-3 text-primary ml-2" />
                                      <span className="min-w-[100px]">
                                        {jadwal.jam_mulai} - {jadwal.jam_selesai}
                                      </span>
                                      <span className="ml-auto font-medium">{jadwal.mata_pelajaran}</span>
                                    </div>
                                  ))}
                                  {semester.jadwal_pelajaran.length > 3 && <p className="text-xs text-muted-foreground text-center py-1">+{semester.jadwal_pelajaran.length - 3} jadwal lainnya</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">Belum ada data rombel</CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab Ekstrakurikuler */}
            <TabsContent value="ekskul" className="space-y-4">
              {detailData?.histori_ekstrakurikuler && detailData.histori_ekstrakurikuler.length > 0 ? (
                detailData.histori_ekstrakurikuler.map((tahun) => (
                  <Card key={tahun.tahun_akademik_ekskul_id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <AwardIcon className="h-4 w-4" />
                        Tahun Akademik {tahun.tahun_akademik_ekskul}
                      </CardTitle>
                      <CardDescription>
                        <Badge className={getStatusEkskulBadgeClass(tahun.status_tahun_akademik_ekskul)}>{tahun.status_tahun_akademik_ekskul}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {tahun.ekstrakurikuler.map((ekskul, eIdx) => (
                        <div key={eIdx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <p className="font-semibold">{ekskul.nama_ekskul}</p>
                            <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
                              {ekskul.sikap && (
                                <span>
                                  Sikap: <span className="font-medium text-foreground">{ekskul.sikap}</span>
                                </span>
                              )}
                              <span>
                                Status: <span className="font-medium text-foreground">{ekskul.status_ekskul}</span>
                              </span>
                            </div>
                          </div>
                          <Badge className={getStatusEkskulBadgeClass(ekskul.status_aktif)}>{ekskul.status_aktif}</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">Belum ada data ekstrakurikuler</CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Tab Prestasi */}
            <TabsContent value="prestasi" className="space-y-4">
              {detailData?.histori_prestasi && detailData.histori_prestasi.length > 0 ? (
                detailData.histori_prestasi.map((tahun) => (
                  <Card key={tahun.tahun_akademik_prestasi_id}>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrophyIcon className="h-4 w-4" />
                        Tahun Akademik {tahun.tahun_akademik_prestasi}
                      </CardTitle>
                      <CardDescription>
                        <Badge className={tahun.status_tahun_akademik_prestasi === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>{tahun.status_tahun_akademik_prestasi}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {tahun.prestasi.map((prestasi, pIdx) => (
                        <div key={pIdx} className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                          <TrophyIcon className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm flex-1">{prestasi.prestasi_diraih}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">Belum ada data prestasi</CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
