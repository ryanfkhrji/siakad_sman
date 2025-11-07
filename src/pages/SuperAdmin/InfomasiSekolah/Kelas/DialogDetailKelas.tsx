import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon } from "lucide-react";
import type { Kelas } from "@/types";

interface DialogDetailKelasProps {
  kelas: Kelas;
}

export function DialogDetailKelas({ kelas }: DialogDetailKelasProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Kelas</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai kelas yang dipilih.</DialogDescription>
        </DialogHeader>

        {/* Konten Detail */}
        <div className="grid gap-3 py-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Nama Kelas</span>
            <span>{kelas.nama_kelas ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Jam Masuk</span>
            <span>{kelas.jam_masuk?.replace(".", ":") ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Wali Kelas</span>
            <span>{kelas.wali_kelas?.nama ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Role Wali</span>
            <span>{kelas.wali_kelas?.role ?? "-"}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
