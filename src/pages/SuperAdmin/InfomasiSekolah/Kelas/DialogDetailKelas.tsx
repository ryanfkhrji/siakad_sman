import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Loader2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/api/axios";
import type { KelasDetail } from "@/types/kelas";

interface DialogDetailKelasProps {
  kelasId: number;
}

export function DialogDetailKelas({ kelasId }: DialogDetailKelasProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kelasDetail, setKelasDetail] = useState<KelasDetail | null>(null);

  // Fetch detail saat dialog dibuka
  useEffect(() => {
    if (open) {
      fetchKelasDetail();
    }
  }, [open]);

  const fetchKelasDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/spa/kelas/${kelasId}`);
      if (res.data.status === "success") {
        setKelasDetail(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil detail kelas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Kelas</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai kelas yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2Icon className="animate-spin mb-2" size={24} />
            <p className="text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : kelasDetail ? (
          <>
            {/* Informasi Dasar Kelas */}
            <div className="grid gap-3 py-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Nama Kelas</span>
                <span>{kelasDetail.nama_kelas}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Kode Kelas</span>
                <span>{kelasDetail.kode_kelas}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Tingkat</span>
                <span>{kelasDetail.tingkat}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Status</span>
                <Badge variant={kelasDetail.status === "aktif" ? "default" : "secondary"}>{kelasDetail.status}</Badge>
              </div>
            </div>

            {/* Daftar Rombel */}
            {kelasDetail.daftar_rombel && kelasDetail.daftar_rombel.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Daftar Rombel</h3>
                  <div className="space-y-4">
                    {kelasDetail.daftar_rombel.map((jurusan) => (
                      <div key={jurusan.jurusan_id} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium text-primary mb-2">{jurusan.jurusan}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {jurusan.rombel.map((rombel) => (
                            <div key={rombel.rombel_id} className="text-sm bg-white rounded px-2 py-1 border">
                              {rombel.nama_rombel}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-gray-500">Tidak ada data</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
