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
import type { GuruForSelect, WaliRombelHistori, WaliRombelHistoriResponse, PeriodeWaliRombel } from "@/types/waliRombel";

const DataWaliRombel = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Daftar guru untuk dropdown
  const [guruList, setGuruList] = useState<GuruForSelect[]>([]);
  const [loadingGuru, setLoadingGuru] = useState(true);

  // Guru yang dipilih
  const [selectedGuruId, setSelectedGuruId] = useState<string>("");
  const [selectedGuruNama, setSelectedGuruNama] = useState<string>("");

  // Histori wali rombel guru yang dipilih
  const [histori, setHistori] = useState<WaliRombelHistori | null>(null);
  const [loadingHistori, setLoadingHistori] = useState(false);
  const [belumAdaData, setBelumAdaData] = useState(false);

  // Expand/collapse periode
  const [expandedPeriode, setExpandedPeriode] = useState<number[]>([]);

  // 1. Load daftar guru saat mount — endpoint: /spa/data-select/wali-rombel
  useEffect(() => {
    const fetchGuru = async () => {
      try {
        setLoadingGuru(true);
        const res = await api.get("/spa/data-select/wali-rombel");
        if (res.data.status === "success") {
          setGuruList(res.data.data.guru);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat daftar guru",
        });
      } finally {
        setLoadingGuru(false);
      }
    };

    fetchGuru();
  }, []);

  // 2. Fetch histori saat guru dipilih — endpoint: /spa/wali-rombel/{guru_id}
  const handleSelectGuru = async (guruId: string) => {
    const guru = guruList.find((g) => String(g.guru_id) === guruId);
    setSelectedGuruId(guruId);
    setSelectedGuruNama(guru?.nama_guru ?? "");
    setHistori(null);
    setBelumAdaData(false);
    setExpandedPeriode([]);

    if (!guruId) return;

    try {
      setLoadingHistori(true);
      const res = await api.get<WaliRombelHistoriResponse>(`/spa/wali-rombel/${guruId}`);

      if (res.data.status === "success") {
        setHistori(res.data.data);
        // Auto expand periode pertama
        if (res.data.data.periode.length > 0) {
          setExpandedPeriode([res.data.data.periode[0].tahun_akademik_id]);
        }
      }
    } catch (error: any) {
      // 400 = guru belum pernah jadi wali (response error backend)
      if (error.response?.status === 400 || error.response?.status === 404) {
        setBelumAdaData(true);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat histori!",
          text: error.response?.data?.message || "Tidak dapat memuat histori wali rombel",
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
    if (selectedGuruId) {
      await handleSelectGuru(selectedGuruId);
    }
  };

  // Navigate ke edit dengan router state (karena tidak ada GET /wali-rombel/{id})
  const handleEdit = (waliRombelId: number, rombel: string, periode: PeriodeWaliRombel) => {
    navigate(`/superadmin/informasi-sekolah/wali-rombel/edit/${waliRombelId}`, {
      state: {
        nama_guru: histori!.nama_guru,
        guru_id: histori!.guru_id,
        nama_rombel: rombel,
        tahun_akademik: periode.tahun_akademik,
        status_tahun_akademik: periode.status_tahun_akademik,
      },
    });
  };

  // Delete — endpoint: DELETE /spa/wali-rombel/{wali_rombel_id}
  const handleDelete = async (waliRombelId: number, namaRombel: string, statusTahunAkademik: string) => {
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
      html: `Wali rombel <strong>${namaRombel}</strong> akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.delete(`/spa/wali-rombel/${waliRombelId}`);
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
        text: err.response?.data?.errors?.arsip || err.response?.data?.message || "Terjadi kesalahan saat menghapus.",
      });
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Wali Rombel" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Wali Rombel</h1>

          {/* ── Select Guru + Tombol Tambah ──────────────────── */}
          <div className="bg-white rounded shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1">
                <label className="block font-semibold text-foreground mb-2">
                  Pilih Guru <span className="text-red-500">*</span>
                </label>

                {loadingGuru ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm h-10">
                    <Loader2Icon className="animate-spin" size={16} />
                    Memuat daftar guru...
                  </div>
                ) : (
                  <Select value={selectedGuruId} onValueChange={handleSelectGuru}>
                    <SelectTrigger className="w-full md:w-96">
                      <SelectValue placeholder="-- pilih guru untuk melihat histori --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Guru Aktif</SelectLabel>
                        {guruList.map((guru) => (
                          <SelectItem key={guru.guru_id} value={String(guru.guru_id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{guru.nama_guru}</span>
                              <span className="text-xs">
                                NIP: {guru.nip || "-"} • NUPTK: {guru.nuptk || "-"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <Link to="/superadmin/informasi-sekolah/wali-rombel/create">
                <Button className="bg-primary w-full md:w-auto">
                  <PlusIcon size={18} />
                  Tambah Wali Rombel
                </Button>
              </Link>
            </div>
          </div>

          {/* ── Histori ──────────────────────────────────────── */}
          {selectedGuruId && (
            <>
              {loadingHistori ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                  <Loader2Icon className="animate-spin mb-2" size={28} />
                  <p className="text-lg font-medium">Memuat histori...</p>
                </div>
              ) : belumAdaData ? (
                <div className="bg-white rounded shadow p-8 text-center">
                  <p className="text-gray-500 text-lg">
                    <strong>{selectedGuruNama}</strong> belum pernah menjadi wali rombel.
                  </p>
                </div>
              ) : histori ? (
                <div className="space-y-4">
                  {/* Card info guru */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-indigo-900 mb-1">👨‍🏫 Guru Terpilih</p>
                    <p className="text-lg font-bold text-indigo-800">{histori.nama_guru}</p>
                    <p className="text-sm text-indigo-700">
                      NIP: {histori.nip || "-"} • NUPTK: {histori.nuptk || "-"}
                    </p>
                  </div>

                  {/* Periode per tahun akademik */}
                  {histori.periode.map((periode: PeriodeWaliRombel) => (
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
                        <span className="text-white text-sm font-medium">{periode.rombels.length} rombel</span>
                      </div>

                      {/* Tabel rombel */}
                      {expandedPeriode.includes(periode.tahun_akademik_id) && (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader className="bg-gray-50">
                              <TableRow>
                                <TableHead className="text-center font-semibold w-16">No</TableHead>
                                <TableHead className="font-semibold">Rombel</TableHead>
                                <TableHead className="font-semibold">Kelas</TableHead>
                                <TableHead className="font-semibold">Jurusan</TableHead>
                                <TableHead className="font-semibold">Tingkat</TableHead>
                                <TableHead className="text-center font-semibold w-28">Aksi</TableHead>
                              </TableRow>
                            </TableHeader>

                            <TableBody>
                              {periode.rombels.map((rombel, idx) => (
                                <TableRow key={rombel.wali_rombel_id} className="hover:bg-gray-50 border-b border-gray-100">
                                  <TableCell className="text-center font-medium">{idx + 1}</TableCell>
                                  <TableCell className="font-semibold">{rombel.rombel}</TableCell>
                                  <TableCell>Kelas {rombel.kelas}</TableCell>
                                  <TableCell>{rombel.jurusan || "-"}</TableCell>
                                  <TableCell>
                                    <Badge variant="outline">Tingkat {rombel.tingkat}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex gap-1 justify-center">
                                      {/* Edit — kirim router state karena tidak ada GET by wali_rombel_id */}
                                      <Button className="bg-primary" size="sm" disabled={periode.status_tahun_akademik === "arsip"} onClick={() => handleEdit(rombel.wali_rombel_id, rombel.rombel, periode)}>
                                        <PenBoxIcon size={16} />
                                      </Button>

                                      <Button
                                        className="bg-muted-foreground hover:bg-muted-foreground/90"
                                        size="sm"
                                        disabled={periode.status_tahun_akademik === "arsip"}
                                        onClick={() => handleDelete(rombel.wali_rombel_id, rombel.rombel, periode.status_tahun_akademik)}
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

          {/* Placeholder sebelum guru dipilih */}
          {!selectedGuruId && !loadingGuru && (
            <div className="bg-white rounded shadow p-8 text-center text-gray-400">
              <p className="text-lg">Pilih guru di atas untuk melihat histori wali rombel</p>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataWaliRombel;
