import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import type { AtpMasterDetail, AtpMasterDetailResponse } from "@/types/alurTujuanPembelajaranMaster";

interface DialogDetailAtpMasterProps {
  atpId: number;
}

export function DialogDetailAtpMaster({ atpId }: DialogDetailAtpMasterProps) {
  const [detailData, setDetailData] = useState<AtpMasterDetail | null>(null);
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

      const res = await api.get<AtpMasterDetailResponse>(`/spa/atp-master/${atpId}`);

      if (res.data.status === "success") {
        setDetailData(res.data.data);
      } else {
        setError(res.data.message || "Gagal mengambil data");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "Gagal mengambil detail ATP Master");
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

  // Helper untuk badge kurikulum
  const getKurikulumBadgeClass = (kurikulum: string): string => {
    switch (kurikulum) {
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail ATP Master</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai Alur Tujuan Pembelajaran yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-600">
            <Loader2Icon className="animate-spin mb-2" size={24} />
            <p className="text-sm">Memuat detail...</p>
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
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📚 Informasi Kurikulum</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Kurikulum</span>
                  <Badge className={getKurikulumBadgeClass(detailData.kurikulum)}>{detailData.kurikulum}</Badge>
                </div>
              </div>
            </div>

            {/* Card Kompetensi */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">🎯 Informasi Kompetensi</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Mata Pelajaran</span>
                  <span className="text-sm text-right font-semibold">{detailData.kompetensi.mata_pelajaran}</span>
                </div>
                <Separator />

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-600">Judul Kompetensi</span>
                  <p className="text-sm text-gray-800">{detailData.kompetensi.judul_kompetensi}</p>
                </div>
                <Separator />

                {detailData.kompetensi.fase && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Fase</span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">Fase {detailData.kompetensi.fase}</Badge>
                    </div>
                    <Separator />
                  </>
                )}

                {detailData.kompetensi.tingkat && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tingkat</span>
                      <span className="text-sm font-semibold">Kelas {detailData.kompetensi.tingkat}</span>
                    </div>
                    <Separator />
                  </>
                )}

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Status Kompetensi</span>
                  <Badge className={detailData.kompetensi.status_kompetensi === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>{detailData.kompetensi.status_kompetensi}</Badge>
                </div>
                <Separator />

                {detailData.kompetensi.deskripsi && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-gray-600">Deskripsi Kompetensi</span>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{detailData.kompetensi.deskripsi}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Card ATP Master */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📝 Alur Tujuan Pembelajaran</h3>
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Urutan</span>
                  <Badge variant="outline" className="font-semibold">
                    #{detailData.kompetensi.atp_master.urutan}
                  </Badge>
                </div>
                <Separator />

                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-gray-600">Tujuan Pembelajaran</span>
                  <p className="text-sm text-gray-800 whitespace-pre-line">{detailData.kompetensi.atp_master.tujuan_pembelajaran}</p>
                </div>
                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Status ATP</span>
                  <Badge className={detailData.kompetensi.atp_master.status_atp === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>
                    {detailData.kompetensi.atp_master.status_atp}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
