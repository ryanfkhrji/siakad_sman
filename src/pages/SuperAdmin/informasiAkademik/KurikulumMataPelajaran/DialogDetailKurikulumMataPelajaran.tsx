import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, BookOpenIcon, GraduationCapIcon, AwardIcon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import type { KurikulumMataPelajaranDetail, KurmapDetailResponse } from "@/types/kurikulumMataPelajaran";

interface DialogDetailKurmapProps {
  kurmapId: number;
}

export function DialogDetailKurmap({ kurmapId }: DialogDetailKurmapProps) {
  const [detailData, setDetailData] = useState<KurikulumMataPelajaranDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !detailData) {
      fetchDetailData();
    }
  }, [open]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get<KurmapDetailResponse>(`/spa/kurikulum-mata-pelajaran/${kurmapId}`);

      if (res.data.status === "success") {
        setDetailData(res.data.data);
      } else {
        setError(res.data.message || "Gagal mengambil data");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "Gagal mengambil detail kurikulum mata pelajaran");
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

  // Helper untuk badge status mata pelajaran
  const getStatusMapelBadgeClass = (status: string): string => {
    switch (status) {
      case "wajib":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "pilihan":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "jurusan":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "mulok":
        return "bg-teal-100 text-teal-700 border-teal-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Helper untuk badge tipe kurikulum
  const getTipeKurikulumBadgeClass = (tipe: string): string => {
    switch (tipe) {
      case "MERDEKA":
        return "bg-green-100 text-green-700 border-green-300";
      case "K13":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "KTSP":
        return "bg-purple-100 text-purple-700 border-purple-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Helper untuk badge kelompok
  const getKelompokBadgeClass = (kelompok: string | null): string => {
    if (!kelompok) return "bg-gray-100 text-gray-700 border-gray-300";

    switch (kelompok.toLowerCase()) {
      case "umum":
        return "bg-indigo-100 text-indigo-700 border-indigo-300";
      case "sains":
        return "bg-cyan-100 text-cyan-700 border-cyan-300";
      case "sosial":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "bahasa":
        return "bg-pink-100 text-pink-700 border-pink-300";
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
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <BookOpenIcon className="h-6 w-6" />
            Detail Kurikulum Mata Pelajaran
          </DialogTitle>
          <DialogDescription>Informasi lengkap mengenai mata pelajaran dalam kurikulum.</DialogDescription>
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
          </div>
        ) : (
          <div className="space-y-4">
            {/* Card Kurikulum */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCapIcon className="h-5 w-5" />
                  Informasi Kurikulum
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Kurikulum</p>
                  <p className="text-base font-semibold">{detailData.kurikulum.nama_kurikulum}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipe Kurikulum</p>
                    <Badge className={getTipeKurikulumBadgeClass(detailData.kurikulum.tipe_kurikulum)}>
                      {detailData.kurikulum.tipe_kurikulum}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">ID Kurikulum</p>
                    <p className="text-sm font-semibold">#{detailData.kurikulum.kurikulum_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Mata Pelajaran */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5" />
                  Informasi Mata Pelajaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nama Mata Pelajaran</p>
                  <p className="text-base font-semibold">{detailData.mata_pelajaran.nama_pelajaran}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Kelompok</p>
                    <Badge className={getKelompokBadgeClass(detailData.mata_pelajaran.kelompok)}>
                      {detailData.mata_pelajaran.kelompok || "-"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status Mata Pelajaran</p>
                    <Badge
                      className={
                        detailData.mata_pelajaran.status_aktif_mapel === "aktif"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }
                    >
                      {detailData.mata_pelajaran.status_aktif_mapel}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card Detail Pengaturan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AwardIcon className="h-5 w-5" />
                  Pengaturan Kurikulum Mata Pelajaran
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tingkat</p>
                    <p className="text-lg font-bold text-primary">Kelas {detailData.tingkat}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nilai KKM</p>
                    <p className="text-lg font-bold text-primary">{detailData.nilai_kkm}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status Mata Pelajaran</p>
                    <Badge className={getStatusMapelBadgeClass(detailData.status_mata_pelajaran)}>
                      {detailData.status_mata_pelajaran}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status Kurmap</p>
                    <Badge
                      className={
                        detailData.status_aktif_kurmap === "aktif"
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-100 text-gray-700 border-gray-300"
                      }
                    >
                      {detailData.status_aktif_kurmap}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}