import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Pegawai } from "@/types";
import { EyeIcon } from "lucide-react";

interface DialogDetailTuProps {
  tu: Pegawai;
}

export function DialogDetailTu({ tu }: DialogDetailTuProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Tata Usaha</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai tata usaha yang dipilih.</DialogDescription>
        </DialogHeader>

        {/* Konten Detail */}
        <div className="grid gap-3 py-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">NIP</span>
            <span>{tu.nip ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Nama Lengkap</span>
            <span>{tu.nama}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Email</span>
            <span>{tu.email}</span>
          </div>
          <Separator />
          {/* <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Nama Kelas</span>
            <span>{tu.kelas?.nama_kelas ?? "-"}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Jam Masuk</span>
            <span>{tu.kelas?.jam_masuk ?? "-"}</span>
          </div>
          <Separator /> */}
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Status</span>
            <span>{tu.status ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Keterangan</span>
            <span>{tu.keterangan ?? "-"}</span>
          </div>
          <Separator />
          
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Role</span>
            <span>{tu.role ?? "-"}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
