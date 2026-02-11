import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Loader2Icon } from "lucide-react";
import api from "@/api/axios";
import Swal from "sweetalert2";
import type { MataPelajaran, MataPelajaranDetail } from "@/types/mataPelajaran";

interface DialogDetailMataPelajaranProps {
  mapel: MataPelajaran;
}

const kelompokLabel: Record<string, string> = {
  umum: "Umum",
  sains: "Sains",
  ipa: "IPA",
  sosial: "Sosial",
  ips: "IPS",
  bahasa: "Bahasa",
};

export function DialogDetailMataPelajaran({ mapel }: DialogDetailMataPelajaranProps) {
  const [detail, setDetail] = useState<MataPelajaranDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !detail) {
      try {
        setLoading(true);
        const res = await api.get(`/spa/mata-pelajaran/${mapel.id}`);
        if (res.data.status === "success") {
          setDetail(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat detail!",
          text: error.response?.data?.message || "Tidak dapat memuat detail mata pelajaran.",
        });
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Mata Pelajaran</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai mata pelajaran yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Loader2Icon className="animate-spin mb-2" size={24} />
            <p className="text-sm font-medium">Memuat detail...</p>
          </div>
        ) : detail ? (
          <div className="grid gap-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Nama Mata Pelajaran</span>
              <span className="text-right max-w-[260px]">{detail.nama_pelajaran ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kode Mapel Diknas</span>
              <span>{detail.kode_mapel_diknas ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kelompok</span>
              <span>{kelompokLabel[detail.kelompok] ?? detail.kelompok ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Status</span>
              <Badge className={detail.status === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}>{detail.status === "aktif" ? "Aktif" : "Arsip"}</Badge>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
