import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, Loader2 } from "lucide-react";
import type { Ruangan } from "@/types";
import api from "@/api/axios";

interface DialogDetailRuanganProps {
  ruanganId: number;
}

export function DialogDetailRuangan({ ruanganId }: DialogDetailRuanganProps) {
  const [ruangan, setRuangan] = useState<Ruangan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/spa/ruangan/${ruanganId}`);
      const result = res.data;
      setRuangan(result.data);
    } catch (error) {
      console.error("Gagal memuat data ruangan:", error);
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
          <DialogTitle className="text-xl font-bold text-primary">Detail Ruangan</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai ruangan yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" /> Memuat data...
          </div>
        ) : ruangan ? (
          <div className="grid gap-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Nama Gedung</span>
              <span>{ruangan.nama_ruangan ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kode Ruangan</span>
              <span>{ruangan.kode_ruangan ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Nama Ruangan</span>
              <span>{ruangan.nama_ruangan ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Jenis Ruangan</span>
              <span>{ruangan.jenis_ruangan ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Lantai</span>
              <span>{ruangan.lantai ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kapasitas</span>
              <span>{ruangan.kapasitas ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Luas Ruangan</span>
              <span>{ruangan.luas_ruangan ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kondisi</span>
              <span className={`font-medium ${ruangan.kondisi === "Baik" ? "text-green-600" : ruangan.kondisi === "Rusak Ringan" ? "text-yellow-600" : ruangan.kondisi === "Rusak Berat" ? "text-red-600" : "text-blue-600"}`}>
                {ruangan.kondisi ?? "-"}
              </span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Fasilitas</span>
              <span>{ruangan.fasilitas ?? "-"}</span>
            </div>
            <Separator />

            {ruangan.keterangan && (
              <>
                <div className="grid grid-cols-1 gap-2">
                  <span className="font-semibold text-gray-700">Keterangan</span>
                  <p className="text-gray-600 text-sm leading-relaxed bg-gray-50 p-3 rounded border whitespace-pre-wrap break-words">{ruangan.keterangan}</p>
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
