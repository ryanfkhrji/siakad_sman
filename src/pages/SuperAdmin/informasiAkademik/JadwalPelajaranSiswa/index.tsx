import { useState, useCallback } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SearchIcon, Loader2Icon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import type { SiswaDetailJadwal, SemesterJadwal } from "@/types/siswaJadwalPelajaran";
import { URUTAN_HARI } from "@/types/siswaJadwalPelajaran";

const DataJadwalPelajaranSiswa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [siswaIdInput, setSiswaIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SiswaDetailJadwal | null>(null);
  const [expandedSemesterIds, setExpandedSemesterIds] = useState<Set<number>>(new Set());

  const handleSearch = useCallback(async () => {
    const id = siswaIdInput.trim();
    if (!id) {
      Swal.fire({ icon: "warning", title: "ID siswa wajib diisi", showConfirmButton: false, timer: 1500 });
      return;
    }

    try {
      setLoading(true);
      setData(null);
      setExpandedSemesterIds(new Set());

      const res = await api.get(`/spa/siswa/jadwal-pelajaran/${id}`);
      if (res.data.status === "success") {
        const siswa: SiswaDetailJadwal = res.data.data;
        setData(siswa);

        // Auto expand semester aktif
        const aktifIds: number[] = [];
        siswa.periode.forEach((p) => {
          p.jadwal.forEach((s) => {
            if (s.status_semester === "aktif") aktifIds.push(s.semester_id);
          });
        });
        setExpandedSemesterIds(new Set(aktifIds.length > 0 ? aktifIds : ([siswa.periode[0]?.jadwal[0]?.semester_id].filter(Boolean) as number[])));
      }
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404) {
        Swal.fire({ icon: "info", title: "Data tidak ditemukan", text: `Siswa dengan ID ${id} tidak memiliki data jadwal.`, confirmButtonText: "OK" });
      } else {
        Swal.fire({ icon: "error", title: "Gagal memuat data!", text: error.response?.data?.message || "Tidak dapat terhubung ke server." });
      }
    } finally {
      setLoading(false);
    }
  }, [siswaIdInput]);

  const toggleSemester = (semesterId: number) => {
    setExpandedSemesterIds((prev) => {
      const next = new Set(prev);
      next.has(semesterId) ? next.delete(semesterId) : next.add(semesterId);
      return next;
    });
  };

  const renderTabelJadwal = (semester: SemesterJadwal) => {
    const sorted = [...semester.jadwal_pelajarans].sort((a, b) => (URUTAN_HARI[a.hari] ?? 9) - (URUTAN_HARI[b.hari] ?? 9) || a.jam_mulai.localeCompare(b.jam_mulai));

    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-600">
            <th className="text-center py-2 px-3 font-semibold w-10">No</th>
            <th className="py-2 px-3 font-semibold text-left">Hari</th>
            <th className="py-2 px-3 font-semibold text-left">Mata Pelajaran</th>
            <th className="py-2 px-3 font-semibold text-left">Guru</th>
            <th className="py-2 px-3 font-semibold text-left">Jam</th>
            <th className="py-2 px-3 font-semibold text-left">Ruangan</th>
            <th className="py-2 px-3 font-semibold text-left">Link</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((jadwal, idx) => (
            <tr key={jadwal.jadwal_pelajaran_id} className="border-t border-gray-100 hover:bg-indigo-50">
              <td className="text-center py-2 px-3 text-gray-500">{idx + 1}</td>
              <td className="py-2 px-3">{jadwal.hari}</td>
              <td className="py-2 px-3 font-medium">{jadwal.mata_pelajaran}</td>
              <td className="py-2 px-3 text-gray-600">{jadwal.guru}</td>
              <td className="py-2 px-3 whitespace-nowrap">
                {jadwal.jam_mulai.slice(0, 5)} - {jadwal.jam_selesai.slice(0, 5)}
              </td>
              <td className="py-2 px-3">{jadwal.ruangan ?? "-"}</td>
              <td className="py-2 px-3 max-w-[120px] truncate">
                {jadwal.link_opsional ? (
                  <a href={jadwal.link_opsional} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {jadwal.link_opsional}
                  </a>
                ) : (
                  "-"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Jadwal Pelajaran Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Jadwal Pelajaran Siswa</h1>

          {/* Search by ID Siswa */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 mb-6 w-full">
            <p className="text-sm font-semibold text-gray-700 mb-3">Cari Jadwal Berdasarkan ID Siswa</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                <Input type="number" placeholder="Masukkan ID siswa..." value={siswaIdInput} onChange={(e) => setSiswaIdInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} className="pl-8" min={1} />
              </div>
              <Button onClick={handleSearch} disabled={loading} className="flex items-center gap-2">
                {loading ? <Loader2Icon size={16} className="animate-spin" /> : <SearchIcon size={16} />}
                Cari
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Tekan Enter atau klik Cari untuk menampilkan jadwal siswa</p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center gap-2 text-gray-500 py-8">
              <Loader2Icon className="animate-spin" size={20} />
              <span>Memuat jadwal siswa...</span>
            </div>
          )}

          {/* Hasil */}
          {!loading && data && (
            <div className="space-y-4">
              {/* Info Siswa */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-1">Siswa ditemukan</p>
                <p className="text-xl font-bold text-indigo-900">{data.nama_siswa}</p>
                <p className="text-sm text-indigo-600 mt-1">
                  ID: {data.siswa_id} • {data.periode.length} periode akademik
                </p>
              </div>

              {/* Periode */}
              {data.periode.map((periode) => (
                <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                  {/* Header Periode */}
                  <div className={`px-4 py-3 flex items-center justify-between text-sm font-semibold ${periode.status_tahun_akademik === "aktif" ? "bg-primary text-white" : "bg-gray-400 text-white"}`}>
                    <div className="flex items-center gap-2">
                      <span>📅 {periode.tahun_akademik}</span>
                      <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800 text-xs" : "bg-gray-200 text-gray-700 text-xs"}>{periode.status_tahun_akademik}</Badge>
                    </div>
                    <span className="text-xs font-normal opacity-90">
                      {periode.rombel.nama_rombel} • Kelas {periode.rombel.kelas} • Wali: {periode.rombel.wali_rombel ?? "-"}
                    </span>
                  </div>

                  {/* Semester */}
                  <div className="divide-y divide-gray-100">
                    {periode.jadwal.map((semester) => {
                      const isOpen = expandedSemesterIds.has(semester.semester_id);
                      return (
                        <div key={semester.semester_id}>
                          <div className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleSemester(semester.semester_id)}>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                              {isOpen ? <ChevronDownIcon size={15} className="text-gray-400" /> : <ChevronRightIcon size={15} className="text-gray-400" />}
                              Semester {semester.semester}
                              <Badge className={semester.status_semester === "aktif" ? "bg-green-100 text-green-700 text-xs" : "bg-gray-100 text-gray-500 text-xs"}>{semester.status_semester}</Badge>
                            </div>
                            <span className="text-xs text-gray-400">{semester.jadwal_pelajarans.length} jadwal</span>
                          </div>
                          {isOpen && renderTabelJadwal(semester)}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state sebelum search */}
          {!loading && !data && (
            <div className="text-center py-16 text-gray-400">
              <SearchIcon className="mx-auto mb-3 opacity-30" size={40} />
              <p className="text-sm">Masukkan ID siswa untuk menampilkan jadwal pelajaran</p>
            </div>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataJadwalPelajaranSiswa;
