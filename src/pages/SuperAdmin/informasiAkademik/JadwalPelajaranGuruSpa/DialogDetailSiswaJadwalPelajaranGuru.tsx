import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EyeIcon, Loader2, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import api from "@/api/axios";
import type {
  HistoriJadwalPelajaran,
  HistoriJadwalPelajaranResponse,
  PeriodeJadwalPelajaran,
  SemesterInHistori,
} from "@/types/jadwalPelajaranGuru";

interface DialogDetailJadwalPelajaranProps {
  guruId: number;
}

export function DialogDetailJadwalPelajaranGuru({ guruId }: DialogDetailJadwalPelajaranProps) {
  const [histori, setHistori] = useState<HistoriJadwalPelajaran | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedTA, setExpandedTA] = useState<number[]>([]);
  const [expandedSemester, setExpandedSemester] = useState<number[]>([]);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await api.get<HistoriJadwalPelajaranResponse>(`/spa/jadwal-pelajaran/${guruId}`);
      if (res.data.status === "success") {
        // data adalah array, ambil [0]
        const data = res.data.data[0];
        setHistori(data);

        // Auto expand tahun akademik pertama
        if (data.periode.length > 0) {
          setExpandedTA([data.periode[0].tahun_akademik_id]);

          // Auto expand semester pertama di tahun akademik pertama
          if (data.periode[0].semesters.length > 0) {
            setExpandedSemester([data.periode[0].semesters[0].semester_id]);
          }
        }
      }
    } catch (error: any) {
      console.error("Gagal memuat histori jadwal:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTA = (taId: number) => {
    setExpandedTA((prev) =>
      prev.includes(taId) ? prev.filter((id) => id !== taId) : [...prev, taId]
    );
  };

  const toggleSemester = (semId: number) => {
    setExpandedSemester((prev) =>
      prev.includes(semId) ? prev.filter((id) => id !== semId) : [...prev, semId]
    );
  };

  return (
    <Dialog onOpenChange={(open) => open && handleOpen()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <EyeIcon size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-primary">
            Histori Jadwal Pelajaran Guru
          </DialogTitle>
          <DialogDescription>
            Riwayat lengkap jadwal mengajar per tahun akademik dan semester.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8 text-muted-foreground">
            <Loader2 className="animate-spin mr-2" /> Memuat data...
          </div>
        ) : histori ? (
          <div className="space-y-4">
            {/* Card Info Guru */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-indigo-900 mb-1">👨‍🏫 Guru</p>
              <p className="text-lg font-bold text-indigo-800">{histori.nama}</p>
              <p className="text-sm text-indigo-700">
                NIP: {histori.nip || "-"} • NUPTK: {histori.nuptk || "-"}
              </p>
            </div>

            {/* Periode (Tahun Akademik) */}
            {histori.periode.length > 0 ? (
              histori.periode.map((periode: PeriodeJadwalPelajaran) => (
                <div
                  key={periode.tahun_akademik_id}
                  className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden"
                >
                  {/* Header Tahun Akademik */}
                  <div
                    className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                      periode.status_tahun === "aktif"
                        ? "bg-primary hover:bg-primary/90"
                        : "bg-gray-400 hover:bg-gray-500"
                    }`}
                    onClick={() => toggleTA(periode.tahun_akademik_id)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedTA.includes(periode.tahun_akademik_id) ? (
                        <ChevronDownIcon className="text-white" size={18} />
                      ) : (
                        <ChevronRightIcon className="text-white" size={18} />
                      )}
                      <span className="text-white font-bold">{periode.tahun_akademik}</span>
                      <Badge
                        className={
                          periode.status_tahun === "aktif"
                            ? "bg-green-200 text-green-800 text-xs"
                            : "bg-gray-200 text-gray-800 text-xs"
                        }
                      >
                        {periode.status_tahun}
                      </Badge>
                    </div>
                    <span className="text-white text-sm">
                      {periode.semesters.length} semester
                    </span>
                  </div>

                  {/* Semester (nested di dalam TA) */}
                  {expandedTA.includes(periode.tahun_akademik_id) && (
                    <div className="p-2 space-y-2">
                      {periode.semesters.map((semester: SemesterInHistori) => (
                        <div
                          key={semester.semester_id}
                          className="border border-gray-200 rounded overflow-hidden"
                        >
                          {/* Header Semester */}
                          <div
                            className={`p-2 cursor-pointer flex items-center justify-between transition-colors ${
                              semester.status_semester === "aktif"
                                ? "bg-blue-100 hover:bg-blue-200"
                                : "bg-gray-100 hover:bg-gray-200"
                            }`}
                            onClick={() => toggleSemester(semester.semester_id)}
                          >
                            <div className="flex items-center gap-2">
                              {expandedSemester.includes(semester.semester_id) ? (
                                <ChevronDownIcon size={16} />
                              ) : (
                                <ChevronRightIcon size={16} />
                              )}
                              <span className="font-semibold text-sm">
                                Semester {semester.semester}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  semester.status_semester === "aktif"
                                    ? "bg-green-50 text-green-700 border-green-300 text-xs"
                                    : "text-xs"
                                }
                              >
                                {semester.status_semester}
                              </Badge>
                            </div>
                            <span className="text-xs text-gray-600">
                              {semester.jadwal_pelajarans.length} jadwal
                            </span>
                          </div>

                          {/* Tabel Jadwal */}
                          {expandedSemester.includes(semester.semester_id) && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b bg-gray-50">
                                    <th className="text-left p-2 font-semibold">No</th>
                                    <th className="text-left p-2 font-semibold">Mata Pelajaran</th>
                                    <th className="text-left p-2 font-semibold">Hari</th>
                                    <th className="text-left p-2 font-semibold">Jam</th>
                                    <th className="text-left p-2 font-semibold">Rombel</th>
                                    <th className="text-left p-2 font-semibold">Jurusan</th>
                                    <th className="text-left p-2 font-semibold">Tingkat</th>
                                    <th className="text-left p-2 font-semibold">Ruangan</th>
                                    <th className="text-left p-2 font-semibold">Link</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {semester.jadwal_pelajarans.map((jadwal, idx) => (
                                    <tr
                                      key={jadwal.jadwal_pelajaran_id}
                                      className="border-b hover:bg-gray-50"
                                    >
                                      <td className="p-2">{idx + 1}</td>
                                      <td className="p-2 font-medium">{jadwal.mata_pelajaran}</td>
                                      <td className="p-2">{jadwal.hari}</td>
                                      <td className="p-2 text-xs">
                                        {jadwal.jam_mulai.slice(0, 5)} - {jadwal.jam_selesai.slice(0, 5)}
                                      </td>
                                      <td className="p-2">{jadwal.rombel}</td>
                                      <td className="p-2">{jadwal.jurusan || "-"}</td>
                                      <td className="p-2">
                                        <Badge variant="outline" className="text-xs">
                                          {jadwal.tingkat}
                                        </Badge>
                                      </td>
                                      <td className="p-2">{jadwal.ruangan || "-"}</td>
                                      <td className="p-2 max-w-[100px] truncate text-xs">
                                        {jadwal.link_opsional ? (
                                          <a
                                            href={jadwal.link_opsional}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline"
                                          >
                                            Link
                                          </a>
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">
                Belum ada histori jadwal untuk guru ini.
              </p>
            )}
          </div>
        ) : (
          <p className="text-muted-foreground italic text-center py-8">
            Data tidak tersedia.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}