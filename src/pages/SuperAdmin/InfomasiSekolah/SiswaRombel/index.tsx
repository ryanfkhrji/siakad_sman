import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2Icon, PlusIcon, Trash2Icon, PenBoxIcon, ChevronDownIcon, ChevronRightIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link, useNavigate } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SiswaForSelect, SiswaRombelHistori, SiswaRombelHistoriResponse, PeriodeSiswaRombel, HistoriRombelItem } from "@/types/siswaRombel";
import { STATUS_AKHIR_LABEL, STATUS_AKHIR_COLOR } from "@/types/siswaRombel";
import type { StatusAkhir } from "@/types/siswaRombel";

const DataSiswaRombel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Daftar siswa untuk dropdown
  const [siswaList, setSiswaList] = useState<SiswaForSelect[]>([]);
  const [loadingSiswa, setLoadingSiswa] = useState(true);

  // Siswa yang dipilih
  const [selectedSiswaId, setSelectedSiswaId] = useState<string>("");
  const [selectedSiwaNama, setSelectedSiswaNama] = useState<string>("");

  // Histori rombel siswa yang dipilih
  const [histori, setHistori] = useState<SiswaRombelHistori | null>(null);
  const [loadingHistori, setLoadingHistori] = useState(false);
  const [belumAdaData, setBelumAdaData] = useState(false);

  // Expand/collapse periode
  const [expandedPeriode, setExpandedPeriode] = useState<number[]>([]);

  // 1. Load daftar siswa saat mount — endpoint: /spa/siswa/data-select/rombel
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        setLoadingSiswa(true);
        const res = await api.get("/spa/siswa/data-select/rombel");
        if (res.data.status === "success") {
          setSiswaList(res.data.data.siswa);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat daftar siswa",
        });
      } finally {
        setLoadingSiswa(false);
      }
    };

    fetchSiswa();
  }, []);

  // 2. Fetch histori saat siswa dipilih — endpoint: /spa/siswa-rombel/{siswa_id}
  const handleSelectSiswa = async (siswaId: string) => {
    const siswa = siswaList.find((s) => String(s.siswa_id) === siswaId);
    setSelectedSiswaId(siswaId);
    setSelectedSiswaNama(siswa?.nama_siswa ?? "");
    setHistori(null);
    setBelumAdaData(false);
    setExpandedPeriode([]);

    if (!siswaId) return;

    try {
      setLoadingHistori(true);
      const res = await api.get<SiswaRombelHistoriResponse>(`/spa/siswa-rombel/${siswaId}`);

      if (res.data.status === "success") {
        // data adalah array, ambil index [0]
        const data = res.data.data[0];
        setHistori(data);
        // Auto expand periode pertama
        if (data.periode.length > 0) {
          setExpandedPeriode([data.periode[0].tahun_akademik_id]);
        }
      }
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        setBelumAdaData(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat histori!",
          text: error.response?.data?.message || "Tidak dapat memuat histori rombel siswa",
        });
      }
    } finally {
      setLoadingHistori(false);
    }
  };

  // Toggle expand/collapse periode
  const togglePeriode = (tahunAkademikId: number) => {
    setExpandedPeriode((prev) => (prev.includes(tahunAkademikId) ? prev.filter((id) => id !== tahunAkademikId) : [...prev, tahunAkademikId]));
  };

  // Refresh histori setelah delete
  const refreshHistori = async () => {
    if (selectedSiswaId) {
      await handleSelectSiswa(selectedSiswaId);
    }
  };

  // Navigate ke edit dengan router state
  const handleEdit = (item: HistoriRombelItem, periode: PeriodeSiswaRombel) => {
    navigate(`/superadmin/informasi-sekolah/siswa-rombel/edit/${item.siswa_rombel_id}`, {
      state: {
        siswa_rombel_id: item.siswa_rombel_id,
        nama_siswa: histori!.nama_siswa,
        nama_rombel: item.rombel.nama_rombel,
        kelas: item.rombel.kelas.nama_kelas,
        jurusan: item.rombel.jurusan,
        tahun_akademik: periode.tahun_akademik,
        status_tahun_akademik: periode.status_tahun_akademik,
        status_akhir: item.status_akhir,
        catatan: item.catatan,
      },
    });
  };

  // Delete — endpoint: DELETE /spa/siswa-rombel/{siswa_rombel_id}
  const handleDelete = async (siswaRombelId: number, namaRombel: string, statusTahunAkademik: string) => {
    if (statusTahunAkademik === "arsip") {
      Swal.fire({
        icon: "warning",
        title: "Tidak dapat menghapus!",
        text: "Hanya bisa dihapus pada saat tahun akademik aktif",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `Data siswa di rombel <strong>${namaRombel}</strong> akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.delete(`/spa/siswa-rombel/${siswaRombelId}`);
      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
        await refreshHistori();
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.errors?.status?.[0] || err.response?.data?.message || "Terjadi kesalahan saat menghapus.",
      });
    }
  };

  // Badge status akhir
  const renderStatusAkhir = (status: StatusAkhir | null) => {
    if (!status) return <span className="text-gray-400 text-sm">-</span>;
    return <Badge className={`text-xs ${STATUS_AKHIR_COLOR[status]}`}>{STATUS_AKHIR_LABEL[status]}</Badge>;
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Siswa Rombel" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Siswa Rombel</h1>

          {/* ── Select Siswa + Tombol Tambah ─────────────────── */}
          <div className="bg-white rounded shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block font-semibold text-foreground mb-2">
                  Pilih Siswa <span className="text-red-500">*</span>
                </label>

                {loadingSiswa ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm h-10">
                    <Loader2Icon className="animate-spin" size={16} />
                    Memuat daftar siswa...
                  </div>
                ) : (
                  <Select value={selectedSiswaId} onValueChange={handleSelectSiswa}>
                    <SelectTrigger className="w-full md:w-96">
                      <SelectValue placeholder="-- pilih siswa untuk melihat histori --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Siswa Aktif</SelectLabel>
                        {siswaList.map((siswa) => (
                          <SelectItem key={siswa.siswa_id} value={String(siswa.siswa_id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{siswa.nama_siswa}</span>
                              <span className="text-xs">
                                NISN: {siswa.nisn || "-"} • NIS: {siswa.nis || "-"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Link to="/superadmin/informasi-sekolah/siswa-rombel/create">
                <Button className="bg-primary w-full md:w-auto">
                  <PlusIcon size={18} />
                  Tambah Siswa Rombel
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Histori ──────────────────────────────────────── */}
          {selectedSiswaId && (
            <>
              {loadingHistori ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                  <Loader2Icon className="animate-spin mb-2" size={28} />
                  <p className="text-lg font-medium">Memuat histori...</p>
                </div>
              ) : belumAdaData ? (
                <div className="bg-white rounded shadow p-8 text-center">
                  <p className="text-gray-500 text-lg">
                    <strong>{selectedSiwaNama}</strong> belum memiliki histori rombel.
                  </p>
                </div>
              ) : histori ? (
                <div className="space-y-4">
                  {/* Card info siswa */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-indigo-900 mb-1">🎓 Siswa Terpilih</p>
                    <p className="text-lg font-bold text-indigo-800">{histori.nama_siswa}</p>
                    <p className="text-sm text-indigo-700">
                      NISN: {histori.nisn || "-"} • NIS: {histori.nis || "-"}
                    </p>
                    <div className="mt-1">
                      <Badge className={histori.status_siswa === "aktif" ? "bg-green-100 text-green-800 text-xs" : "bg-gray-100 text-gray-800 text-xs"}>{histori.status_siswa}</Badge>
                    </div>
                  </div>

                  {/* Periode per tahun akademik */}
                  {histori.periode.map((periode: PeriodeSiswaRombel) => (
                    <div key={periode.tahun_akademik_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                      {/* Header collapsible */}
                      <div
                        className={`p-4 cursor-pointer flex items-center justify-between transition-colors ${periode.status_tahun_akademik === "aktif" ? "bg-primary hover:bg-primary/90" : "bg-gray-400 hover:bg-gray-500"}`}
                        onClick={() => togglePeriode(periode.tahun_akademik_id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedPeriode.includes(periode.tahun_akademik_id) ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                          <span className="text-white font-bold">{periode.tahun_akademik}</span>
                          <Badge className={periode.status_tahun_akademik === "aktif" ? "bg-green-200 text-green-800" : "bg-gray-200 text-gray-800"}>{periode.status_tahun_akademik}</Badge>
                        </div>
                        <span className="text-white text-sm font-medium">{periode.histori_rombel.length} rombel</span>
                      </div>

                      {/* Tabel histori rombel */}
                      {expandedPeriode.includes(periode.tahun_akademik_id) && (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="text-center font-semibold w-16">No</TableHead>
                                <TableHead className="font-semibold">Rombel</TableHead>
                                <TableHead className="font-semibold">Kelas</TableHead>
                                <TableHead className="font-semibold">Jurusan</TableHead>
                                <TableHead className="font-semibold">Wali Rombel</TableHead>
                                <TableHead className="font-semibold">Status Akhir</TableHead>
                                <TableHead className="font-semibold">Catatan</TableHead>
                                <TableHead className="text-center font-semibold w-28">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {periode.histori_rombel.map((item: HistoriRombelItem, idx) => (
                                <TableRow key={item.siswa_rombel_id} className="hover:bg-gray-50 border-b border-gray-100">
                                  <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                  <TableCell className="font-semibold">{item.rombel.nama_rombel}</TableCell>
                                  <TableCell>Kelas {item.rombel.kelas.nama_kelas}</TableCell>
                                  <TableCell>{item.rombel.jurusan || "-"}</TableCell>
                                  <TableCell>{item.rombel.wali_rombel?.nama || "-"}</TableCell>
                                  <TableCell>{renderStatusAkhir(item.status_akhir)}</TableCell>
                                  <TableCell className="max-w-[160px] text-sm text-gray-600 truncate">{item.catatan || "-"}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-1 justify-center">
                                      <Button className="bg-primary" size="sm" disabled={periode.status_tahun_akademik === "arsip"} onClick={() => handleEdit(item, periode)}>
                                        <PenBoxIcon size={16} />
                                      </Button>

                                      <Button
                                        className="bg-muted-foreground hover:bg-muted-foreground/90"
                                        size="sm"
                                        disabled={periode.status_tahun_akademik === "arsip"}
                                        onClick={() => handleDelete(item.siswa_rombel_id, item.rombel.nama_rombel, periode.status_tahun_akademik)}
                                      >
                                        <Trash2Icon size={16} />
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {/* Placeholder sebelum siswa dipilih */}
          {!selectedSiswaId && !loadingSiswa && (
            <div className="bg-white rounded shadow p-8 text-center text-gray-400">
              <p className="text-lg">Pilih siswa di atas untuk melihat histori rombel</p>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataSiswaRombel;
