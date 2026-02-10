import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EyeIcon, Loader2Icon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { JurusanDetail, JurusanDetailResponse } from "@/types/jurusan";
import api from "@/api/axios";
import Swal from "sweetalert2";

interface DialogDetailJurusanProps {
  jurusanId: number;
}

export function DialogDetailJurusan({ jurusanId }: DialogDetailJurusanProps) {
  const [open, setOpen] = useState(false);
  const [jurusan, setJurusan] = useState<JurusanDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch data saat dialog dibuka
  useEffect(() => {
    if (open && jurusanId) {
      fetchJurusanDetail();
    }
  }, [open, jurusanId]);

  const fetchJurusanDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get<JurusanDetailResponse>(`/spa/jurusan/${jurusanId}`);

      if (res.data.status === "success") {
        setJurusan(res.data.data);
      }
    } catch (error: any) {
      console.error("Gagal mengambil detail jurusan:", error);

      if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Tidak Ditemukan",
          text: "Jurusan tidak ditemukan",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal mengambil detail jurusan",
        });
      }

      setOpen(false);
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
          <DialogTitle className="text-xl font-bold text-primary">Detail Jurusan</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai jurusan yang dipilih.</DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-600">
            <Loader2Icon className="animate-spin mb-2" size={32} />
            <p className="text-sm">Memuat data...</p>
          </div>
        ) : jurusan ? (
          <div className="grid gap-4 py-2">
            {/* Informasi Dasar */}
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Kode Jurusan</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">{jurusan.kode_jurusan}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Nama Jurusan</span>
                <span>{jurusan.nama_jurusan}</span>
              </div>
              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">Status</span>
                <Badge className={jurusan.status === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>
                  {jurusan.status}
                </Badge>
              </div>
            </div>

            {/* Daftar Kelas & Rombel */}
            {jurusan.details && jurusan.details.length > 0 ? (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 mb-3">Daftar Kelas & Rombongan Belajar</h3>
                <Accordion type="single" collapsible className="w-full">
                  {jurusan.details.map((kelas) => (
                    <AccordionItem key={kelas.kelas_id} value={`kelas-${kelas.kelas_id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{kelas.nama_kelas}</span>
                          <Badge variant="outline" className="text-xs">
                            Tingkat {kelas.tingkat}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={kelas.status === "aktif" ? "text-xs bg-green-50 text-green-700" : "text-xs bg-gray-50"}
                          >
                            {kelas.status}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-4 space-y-2">
                          {kelas.rombel && kelas.rombel.length > 0 ? (
                            <div className="grid gap-2">
                              <p className="text-sm font-semibold text-gray-600">Rombongan Belajar:</p>
                              {kelas.rombel.map((rombel) => (
                                <div
                                  key={rombel.rombel_id}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                                >
                                  <span className="text-sm">{rombel.nama_rombel}</span>
                                  <Badge
                                    variant="outline"
                                    className={rombel.status === "aktif" ? "text-xs bg-green-100 text-green-700" : "text-xs"}
                                  >
                                    {rombel.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Belum ada rombongan belajar</p>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded border border-gray-200 text-center">
                <p className="text-sm text-gray-500">Belum ada kelas yang terdaftar untuk jurusan ini</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-4">
            <p>Data tidak tersedia</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}