import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon } from "lucide-react";
import type { Siswa } from "@/types";

interface DialogDetailSiswaProps {
  siswa: Siswa;
}

export function DialogDetailSiswa({ siswa }: DialogDetailSiswaProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Siswa</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai siswa.</DialogDescription>
        </DialogHeader>

        {/* Konten Detail */}
        <div className="grid gap-3 py-2 text-sm">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">NISN</span>
            <span>{siswa.nisn ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">NIS</span>
            <span>{siswa.nis ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Nama Lengkap</span>
            <span>{siswa.nama ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Email</span>
            <span>{siswa.email ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Jurusan</span>
            <span>{siswa.nama_jurusan ?? "-"}</span>
          </div>
          <Separator />

          {/* <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Ekstrakurikuler</span>
            <span>{siswa.kelas?.nama_kelas ?? "-"}</span>
          </div>
          <Separator /> */}

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Kelas</span>
            <span>{typeof siswa.kelas === "string" ? siswa.kelas : siswa.kelas?.nama_kelas ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Walikelas</span>
            <span>{typeof siswa.kelas === "string" ? siswa.kelas : siswa.kelas?.wali_kelas?.nama ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Ekstrakurikuler</span>
            <span>{siswa.nama_ekstrakurikuler ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Status</span>
            <span>{siswa.status ?? "-"}</span>
          </div>
          <Separator />

          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Role</span>
            <span>{siswa.role ?? "-"}</span>
          </div>
          <Separator />
        </div>
      </DialogContent>
    </Dialog>
  );
}
