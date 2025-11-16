import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Pegawai } from "@/types";
import { EyeIcon } from "lucide-react";

interface DialogDetailGuruProps {
  guru: Pegawai;
}

export function DialogDetailGuru({ guru }: DialogDetailGuruProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Guru</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai guru yang dipilih.</DialogDescription>
        </DialogHeader>

        {/* Konten Detail */}
        <div className="grid gap-3 py-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">NIP</span>
            <span>{guru.nip ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Nama Lengkap</span>
            <span>{guru.nama}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Email</span>
            <span>{guru.email}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Nama Kelas</span>
            <span>{guru.kelas?.nama_kelas ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Jam Masuk</span>
            <span>{guru.kelas?.jam_masuk ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Status</span>
            <span>{guru.status ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Keterangan</span>
            <span>{guru.keterangan ?? "-"}</span>
          </div>
          <Separator />
          
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Role</span>
            <span>{guru.role ?? "-"}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
