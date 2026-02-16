import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Loader2Icon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import type { RombelDetail, RombelDetailResponse } from "@/types/rombel";

interface DialogDetailRombelProps {
  rombelId: number;
}

export function DialogDetailRombel({ rombelId }: DialogDetailRombelProps) {
  const [detailData, setDetailData] = useState<RombelDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [expandedPeriode, setExpandedPeriode] = useState<number[]>([]);

  useEffect(() => {
    if (open && !detailData) {
      fetchDetailData();
    }
  }, [open]);

  const fetchDetailData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get<RombelDetailResponse>(`/spa/rombel/${rombelId}`);

      if (res.data.status === "success") {
        setDetailData(res.data.data);
        // Auto expand periode pertama
        if (res.data.data.periode.length > 0) {
          setExpandedPeriode([res.data.data.periode[0].tahun_akademik_id]);
        }
      } else {
        setError(res.data.message || "Gagal mengambil data");
      }
    } catch (error: any) {
      console.error("Error:", error);
      setError(error.response?.data?.message || "Gagal mengambil detail rombel");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setDetailData(null);
      setError(null);
      setExpandedPeriode([]);
    }
  };

  const togglePeriode = (tahunAkademikId: number) => {
    setExpandedPeriode((prev) => (prev.includes(tahunAkademikId) ? prev.filter((id) => id !== tahunAkademikId) : [...prev, tahunAkademikId]));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">Detail Rombel</DialogTitle>
          <DialogDescription>Informasi lengkap mengenai rombongan belajar yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-600">
            <Loader2Icon className="animate-spin mb-2" size={24} />
            <p className="text-sm">Memuat detail...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-red-500">
            <p className="text-lg font-medium">{error}</p>
            <Button variant="outline" className="mt-4" onClick={fetchDetailData}>
              Coba Lagi
            </Button>
          </div>
        ) : !detailData ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <p className="text-lg font-medium">Tidak ada data yang ditampilkan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Card Informasi Rombel */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">📚 Informasi Rombel</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Nama Rombel</span>
                  <span className="text-sm font-semibold">{detailData.nama_rombel}</span>
                </div>
                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Kelas</span>
                  <span className="text-sm font-semibold">
                    {detailData.kelas.kelas} (Tingkat {detailData.kelas.tingkat})
                  </span>
                </div>
                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Jurusan</span>
                  <span className="text-sm font-semibold">{detailData.jurusan.nama_jurusan}</span>
                </div>
                <Separator />

                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Status Rombel</span>
                  <Badge className={detailData.status_rombel === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-gray-100 text-gray-700 border-gray-300"}>{detailData.status_rombel}</Badge>
                </div>
              </div>
            </div>

            {/* Periode per Tahun Akademik */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">📅 Riwayat Per Tahun Akademik</h3>

              {detailData.periode.map((periode) => (
                <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Header Periode */}
                  <div
                    className={`p-3 cursor-pointer transition-colors flex items-center justify-between ${periode.status_tahun_akademik === "aktif" ? "bg-green-50 hover:bg-green-100" : "bg-gray-50 hover:bg-gray-100"}`}
                    onClick={() => togglePeriode(periode.tahun_akademik_id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedPeriode.includes(periode.tahun_akademik_id) ? <ChevronDownIcon className="text-gray-700" size={18} /> : <ChevronRightIcon className="text-gray-700" size={18} />}
                      <span className="font-semibold text-sm">{periode.tahun_akademik}</span>
                      <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-gray-200 text-gray-800 text-xs"}>{periode.status_tahun_akademik}</Badge>
                    </div>
                    <span className="text-xs text-gray-600">{periode.siswa.length} siswa</span>
                  </div>

                  {/* Content Periode */}
                  {expandedPeriode.includes(periode.tahun_akademik_id) && (
                    <div className="p-3 space-y-3 bg-white">
                      {/* Wali Kelas */}
                      <div className="bg-purple-50 rounded p-2 border border-purple-200">
                        <p className="text-xs font-semibold text-purple-900 mb-1">👨‍🏫 Wali Kelas</p>
                        <p className="text-sm text-gray-700">{periode.wali ? periode.wali.nama_wali : "Belum ditentukan"}</p>
                      </div>

                      {/* Daftar Siswa */}
                      <div className="bg-blue-50 rounded p-2 border border-blue-200">
                        <p className="text-xs font-semibold text-blue-900 mb-2">👥 Daftar Siswa ({periode.siswa.length})</p>
                        {periode.siswa.length > 0 ? (
                          <div className="space-y-1 max-h-40 overflow-y-auto">
                            {periode.siswa.map((siswa, idx) => (
                              <div key={siswa.siswa_id} className="text-xs bg-white p-1.5 rounded flex justify-between items-center">
                                <span>
                                  {idx + 1}. {siswa.nama_siswa} ({siswa.nisn})
                                </span>
                                {siswa.status_akhir && (
                                  <Badge variant="outline" className="text-xs">
                                    {siswa.status_akhir.replace("_", " ")}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">Belum ada siswa</p>
                        )}
                      </div>

                      {/* Jadwal per Semester */}
                      {periode.semester.map((semester) => (
                        <div key={semester.semester_id} className="bg-orange-50 rounded p-2 border border-orange-200">
                          <p className="text-xs font-semibold text-orange-900 mb-2">
                            📖 Semester {semester.semester} ({semester.jadwal_pelajaran.length} jadwal)
                          </p>
                          {semester.jadwal_pelajaran.length > 0 ? (
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {semester.jadwal_pelajaran.map((jadwal) => (
                                <div key={jadwal.jadwal_id} className="text-xs bg-white p-1.5 rounded">
                                  <span className="font-medium">{jadwal.mata_pelajaran}</span> - {jadwal.hari} ({jadwal.jam_mulai.slice(0, 5)} - {jadwal.jam_selesai.slice(0, 5)})
                                  <br />
                                  <span className="text-gray-500">
                                    {jadwal.guru_pengajar} • {jadwal.ruangan}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500">Belum ada jadwal</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
