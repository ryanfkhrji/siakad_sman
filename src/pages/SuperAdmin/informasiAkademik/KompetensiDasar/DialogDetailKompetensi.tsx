import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import type { KompetensiDetail, KompetensiDetailResponse } from "@/types/kompetensi";

interface DialogDetailKompetensiProps {
  kompetensiId: number;
}

export function DialogDetailKompetensi({ kompetensiId }: DialogDetailKompetensiProps) {
  const [detailData, setDetailData] = useState<KompetensiDetail | null>(null);
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

      const res = await api.get<KompetensiDetailResponse>(`/spa/kompetensi/${kompetensiId}`);

      if (res.data.status === "success") {
        setDetailData(res.data.data);
      } else {
        setError(res.data.message || "Gagal mengambil data");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "Gagal mengambil detail kompetensi");
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

  // Helper untuk badge
  const getJenisBadgeClass = (jenis: string): string => {
    return jenis === "KD" ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-green-100 text-green-700 border-green-300";
  };

  const getAspekBadgeClass = (aspek?: string): string => {
    if (!aspek) return "bg-gray-100 text-gray-700 border-gray-300";
    switch (aspek) {
      case "sikap":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "pengetahuan":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "keterampilan":
        return "bg-orange-100 text-orange-700 border-orange-300";
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

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Kompetensi</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai kompetensi yang dipilih.</DialogDescription>
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
          <div className="grid gap-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kurikulum</span>
              <span className="text-right">{detailData.kurikulum}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Mata Pelajaran</span>
              <span className="text-right">{detailData.mata_pelajaran}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Judul Kompetensi</span>
              <span className="text-right">{detailData.judul_kompetensi}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Jenis</span>
              <Badge className={getJenisBadgeClass(detailData.jenis)}>{detailData.jenis}</Badge>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kode</span>
              <span>{detailData.kode}</span>
            </div>
            <Separator />

            {/* Untuk KD (K13) */}
            {detailData.jenis === "KD" && (
              <>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Tingkat</span>
                  <span>Kelas {detailData.tingkat}</span>
                </div>
                <Separator />

                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Aspek</span>
                  <Badge className={getAspekBadgeClass(detailData.aspek)}>{detailData.aspek}</Badge>
                </div>
                <Separator />
              </>
            )}

            {/* Untuk CP (Merdeka) */}
            {detailData.jenis === "CP" && (
              <>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Fase</span>
                  <span>Fase {detailData.fase}</span>
                </div>
                <Separator />

                {detailData.deskripsi && (
                  <>
                    <div className="flex flex-col gap-2">
                      <span className="font-semibold text-gray-700">Deskripsi</span>
                      <p className="text-gray-600 text-sm whitespace-pre-line">{detailData.deskripsi}</p>
                    </div>
                    <Separator />
                  </>
                )}
              </>
            )}

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Status</span>
              <Badge className={detailData.status_kompetensi === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>{detailData.status_kompetensi}</Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
