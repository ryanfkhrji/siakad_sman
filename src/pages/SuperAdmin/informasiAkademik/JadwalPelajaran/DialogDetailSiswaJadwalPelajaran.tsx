import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, Loader2 } from "lucide-react";
import type { JadwalPelajaran } from "@/types";
import api from "@/api/axios";

interface DialogDetailJadwalPelajaranProps {
  jadwalId: number;
}

export function DialogDetailSiswaJadwalPelajaran({ jadwalId }: DialogDetailJadwalPelajaranProps) {
  const [jadwalPelajaran, setJadwalPelajaran] = useState<JadwalPelajaran | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/spa/jadwal-pelajaran/${jadwalId}`);
      const result = res.data;
      setJadwalPelajaran(result.data);
    } catch (error) {
      console.error("Gagal memuat data jadwal pelajaran:", error);
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

      <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Siswa Dalam Jadwal Pelajaran</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai siswa yang terdaftar dalam jadwal pelajaran.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" /> Memuat data...
          </div>
        ) : jadwalPelajaran ? (
          <div className="grid gap-3 py-2 text-sm">
            {/* Nama */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Nama Mata Pelajaran</span>
              <span>{jadwalPelajaran.mata_pelajaran ?? "-"}</span>
            </div>
            <Separator />

            {/* Jumlah Siswa */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Jumlah Siswa</span>
              <span>{jadwalPelajaran.peserta.length ?? "-"}</span>
            </div>
            <Separator />

            {/* Daftar Siswa */}
            <div>
              <span className="font-semibold text-gray-700 block mb-1">Daftar Siswa</span>
              {jadwalPelajaran.peserta && jadwalPelajaran.peserta.length > 0 ? (
                <div className="border rounded-lg p-2 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-primary text-white">
                        <th className="text-left p-1">No</th>
                        <th className="text-left p-1">Nama</th>
                        <th className="text-left p-1">Jurusan</th>
                        <th className="text-left p-1">Kelas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jadwalPelajaran.peserta.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-1">{jadwalPelajaran.peserta.indexOf(s) + 1}</td>
                          <td className="p-1">{s.nama_siswa || "-"}</td>
                          <td className="p-1">{s.jurusan || "-"}</td>
                          <td className="p-1">{typeof s.kelas === "string" ? s.kelas : s.kelas?.nama_kelas || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">Belum ada siswa di jadwal pelajaran ini.</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground italic">Data tidak tersedia.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
