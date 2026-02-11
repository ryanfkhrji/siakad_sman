import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, Loader2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import Swal from "sweetalert2";
import type { Kurikulum, KurikulumDetail } from "@/types/kurikulum";

interface DialogDetailKurikulumProps {
  kurikulum: Kurikulum;
}

export function DialogDetailKurikulum({ kurikulum }: DialogDetailKurikulumProps) {
  const [detail, setDetail] = useState<KurikulumDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && !detail) {
      try {
        setLoading(true);
        const res = await api.get(`/spa/kurikulum/${kurikulum.id}`);
        if (res.data.status === "success") {
          setDetail(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat detail!",
          text: error.response?.data?.message || "Tidak dapat memuat detail kurikulum.",
        });
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }
  };

  const tipeLabel: Record<string, string> = {
    KTSP: "KTSP",
    K13: "Kurikulum 2013",
    MERDEKA: "Kurikulum Merdeka",
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Kurikulum</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai kurikulum yang dipilih.</DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <Loader2Icon className="animate-spin mb-2" size={24} />
            <p className="text-sm font-medium">Memuat detail...</p>
          </div>
        ) : detail ? (
          <div className="grid gap-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Nama Kurikulum</span>
              <span className="text-right max-w-[280px]">{detail.nama_kurikulum ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Kode Kurikulum</span>
              <span>{detail.kode_kurikulum ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Tipe</span>
              <span>{tipeLabel[detail.tipe] ?? detail.tipe ?? "-"}</span>
            </div>
            <Separator />

            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Tahun Berlaku</span>
              <span>
                {detail.tahun_mulai ?? "-"} — {detail.tahun_selesai ?? "Sekarang"}
              </span>
            </div>
            <Separator />

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-700">Status</span>
              <Badge className={detail.status === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}>{detail.status === "aktif" ? "Aktif" : "Arsip"}</Badge>
            </div>
            <Separator />

            <div className="flex flex-col gap-1">
              <span className="font-semibold text-gray-700">Deskripsi</span>
              <p className="text-gray-600 whitespace-pre-line leading-relaxed">{detail.deskripsi?.trim() || "-"}</p>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
