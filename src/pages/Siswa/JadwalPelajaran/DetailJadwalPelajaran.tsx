import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BookOpenIcon, UserIcon, ClockIcon, DoorOpenIcon, LinkIcon, CalendarIcon, InfoIcon,  } from "lucide-react";

interface JadwalDetail {
  id: number;
  mata_pelajaran: string;
  guru: string;
  kelas: string;
  hari: string;
  jam_pelajaran: string;
  ruangan: string;
  link_opsional?: string;
}

interface Props {
  jadwal: JadwalDetail;
}

export function DialogDetailJadwalSiswa({ jadwal }: Props) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="w-full">
          <InfoIcon /> Lihat Detail
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-primary">
            <BookOpenIcon size={22} />
            {jadwal.mata_pelajaran}
          </DialogTitle>
          <DialogDescription>Detail lengkap jadwal pelajaran siswa.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 pt-4 text-sm">
          {/* Hari */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="text-primary" size={18} />
              <span className="font-semibold">Hari</span>
            </div>
            <span>{jadwal.hari ?? "-"}</span>
          </div>
          <Separator />

          {/* Guru */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <UserIcon className="text-primary" size={18} />
              <span className="font-semibold">Guru Pengajar</span>
            </div>
            <span className="text-right max-w-[55%]">{jadwal.guru ?? "-"}</span>
          </div>
          <Separator />

          {/* Jam */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <ClockIcon className="text-primary" size={18} />
              <span className="font-semibold">Jam Pelajaran</span>
            </div>
            <span>{jadwal.jam_pelajaran ?? "-"}</span>
          </div>
          <Separator />

          {/* Ruangan */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <DoorOpenIcon className="text-primary" size={18} />
              <span className="font-semibold">Ruangan</span>
            </div>
            <span>{jadwal.ruangan ?? "-"}</span>
          </div>
          <Separator />

          {/* Kelas */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <BookOpenIcon className="text-primary" size={18} />
              <span className="font-semibold">Kelas</span>
            </div>
            <span>{jadwal.kelas ?? "-"}</span>
          </div>

          {/* Link Opsional */}
          {jadwal.link_opsional && jadwal.link_opsional !== "-" && (
            <>
              <Separator />
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <LinkIcon className="text-primary" size={18} />
                  <span className="font-semibold">Link Pembelajaran</span>
                </div>
                <a href={jadwal.link_opsional.startsWith("http") ? jadwal.link_opsional : `https://${jadwal.link_opsional}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline max-w-[55%] text-right break-all">
                  {jadwal.link_opsional}
                </a>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
