import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Loader2Icon } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/api/axios";
import type { TahunAkademik, TahunAkademikDetail } from "@/types/tahunAkademik";

interface DialogDetailTahunAkademikProps {
  tahunAkademik: TahunAkademik;
}

export function DialogDetailTahunAkademik({ tahunAkademik }: DialogDetailTahunAkademikProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tahunAkademikDetail, setTahunAkademikDetail] = useState<TahunAkademikDetail | null>(null);

  // Fetch detail saat dialog dibuka
  useEffect(() => {
    if (open) {
      fetchTahunAkademikDetail();
    }
  }, [open]);

  const fetchTahunAkademikDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/spa/tahun-akademik/${tahunAkademik.id}`);
      if (res.data.status === "success") {
        setTahunAkademikDetail(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil detail tahun akademik:", error);
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
          <DialogTitle className="text-xl font-bold text-primary">Detail Tahun Akademik</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai tahun akademik yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2Icon className="animate-spin mb-2" size={24} />
            <p className="text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : tahunAkademikDetail ? (
          <>
            {/* Informasi Dasar Tahun Akademik */}
            <div className="grid gap-3 py-2 text-sm">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Tahun Akademik</span>
                <span>{tahunAkademikDetail.tahun_akademik}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Keterangan</span>
                <span>{tahunAkademikDetail.keterangan}</span>
              </div>
              <Separator />

              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Status Tahun Akademik</span>
                <Badge variant={tahunAkademikDetail.status_tahun_akademik === "aktif" ? "default" : "secondary"}>{tahunAkademikDetail.status_tahun_akademik}</Badge>
              </div>
            </div>

            {/* Daftar Semester */}
            {tahunAkademikDetail.semester && tahunAkademikDetail.semester.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Daftar Semester</h3>
                  <div className="space-y-4">
                    {tahunAkademikDetail.semester.map((semester) => (
                      <div key={semester.semester_id} className="border rounded-lg p-3 bg-gray-50">
                        <h4 className="font-medium text-primary mb-2">{semester.semester}</h4>
                        <div className="flex justify-between">
                          <span className="font-semibold text-gray-700">Status Semester</span>
                          <Badge variant={semester.status_semester === "aktif" ? "default" : "secondary"}>{semester.status_semester}</Badge>
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
