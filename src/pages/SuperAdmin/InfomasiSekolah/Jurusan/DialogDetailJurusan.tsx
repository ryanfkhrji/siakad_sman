import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, Loader2 } from "lucide-react";
import type { Jurusan } from "@/types";
import api from "@/api/axios";

interface DialogDetailJurusanProps {
  jurusanId: number;
}

export function DialogDetailJurusan({ jurusanId }: DialogDetailJurusanProps) {
  const [jurusan, setJurusan] = useState<Jurusan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jurusan/${jurusanId}`);
      const result = res.data;
      setJurusan(result.data);
    } catch (error) {
      console.error("Gagal memuat data jurusan:", error);
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

      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Jurusan</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai jurusan yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" /> Memuat data...
          </div>
        ) : jurusan ? (
          <div className="grid gap-3 py-2 text-sm">
            {/* Nama Jurusan */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Nama Jurusan</span>
              <span>{jurusan.nama_jurusan ?? "-"}</span>
            </div>
            <Separator />

            {/* Jumlah Siswa */}
            <div className="flex justify-between">
              <span className="font-semibold text-gray-700">Jumlah Siswa</span>
              <span>{jurusan.jumlah_siswa ?? "-"}</span>
            </div>
            <Separator />

            {/* Daftar Siswa */}
            <div>
              <span className="font-semibold text-gray-700 block mb-1">Daftar Siswa</span>
              {jurusan.siswa && jurusan.siswa.length > 0 ? (
                <div className="border rounded-lg p-2 max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-primary text-white">
                        <th className="text-left p-1">NISN</th>
                        <th className="text-left p-1">Nama</th>
                        <th className="text-left p-1">Kelas</th>
                        <th className="text-left p-1">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jurusan.siswa.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-1">{s.nisn}</td>
                          <td className="p-1">{s.nama}</td>
                          <td className="p-1">{s.kelas?.nama_kelas}</td>
                          <td className="p-1 capitalize">{s.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">Belum ada siswa di jurusan ini.</p>
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
