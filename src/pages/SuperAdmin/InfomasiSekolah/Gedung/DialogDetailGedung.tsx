import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, Loader2 } from "lucide-react";
import type { Gedung } from "@/types";
import api from "@/api/axios";

interface DialogDetailGedungProps {
  gedungId: number;
}

export function DialogDetailGedung({ gedungId }: DialogDetailGedungProps) {
  const [gedung, setGedung] = useState<Gedung | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/spa/gedung/${gedungId}`);
      const result = res.data;
      setGedung(result.data);
    } catch (error) {
      console.error("Gagal memuat data gedung:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog onOpenChange={(open) => open && handleOpen()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] lg:max-w-[800px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Gedung</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai gedung yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" /> Memuat data...
          </div>
        ) : gedung ? (
          <div className="grid gap-3 py-2 text-sm">
            {/* Foto Gedung */}
            {gedung.foto_gedung && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-gray-700">Foto Gedung</span>
                  <div className="flex justify-center">
                    <img
                      src={gedung.foto_gedung}
                      alt={gedung.nama_gedung}
                      className="w-64 h-64 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                      onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src =
                          'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="256"%3E%3Crect fill="%23e5e7eb" width="256" height="256"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="16"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Kode Gedung */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kode Gedung</span>
              <span>{gedung.kode_gedung ?? "-"}</span>
            </div>
            <Separator />

            {/* Nama Gedung */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Nama Gedung</span>
              <span>{gedung.nama_gedung ?? "-"}</span>
            </div>
            <Separator />

            {/* Jumlah Lantai */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Jumlah Lantai</span>
              <span>{gedung.jumlah_lantai ?? "-"}</span>
            </div>
            <Separator />

            {/* Luas Bangunan */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Luas Bangunan</span>
              <span>{gedung.luas_bangunan ?? "-"}</span>
            </div>
            <Separator />

            {/* Tahun Dibangun */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Tahun Dibangun</span>
              <span>{gedung.tahun_dibangun ?? "-"}</span>
            </div>
            <Separator />

            {/* Kondisi */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kondisi</span>
              <span className={`font-medium ${gedung.kondisi === "Baik" ? "text-green-600" : gedung.kondisi === "Rusak Ringan" ? "text-yellow-600" : gedung.kondisi === "Rusak Berat" ? "text-red-600" : "text-blue-600"}`}>
                {gedung.kondisi ?? "-"}
              </span>
            </div>
            <Separator />

            {/* Keterangan */}
            {gedung.keterangan && (
              <>
                <div className="flex flex-col gap-2">
                  <span className="font-semibold text-gray-700">Keterangan</span>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded border">{gedung.keterangan}</p>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground italic">Data tidak tersedia.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
