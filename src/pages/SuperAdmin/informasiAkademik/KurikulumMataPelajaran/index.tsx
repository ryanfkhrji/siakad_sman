import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Loader2Icon, PenBoxIcon, PlusIcon, SearchIcon, Trash2Icon, ChevronDownIcon, ChevronRightIcon, EyeIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Input } from "@/components/ui/input";
import type { KurikulumWithMapel } from "@/types/kurikulumMataPelajaran";
import { Badge } from "@/components/ui/badge";
import { DialogDetailKurmap } from "./DialogDetailKurikulumMataPelajaran";

const DataKurikulumMataPelajaran = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataKurmap, setDataKurmap] = useState<KurikulumWithMapel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<KurikulumWithMapel[]>([]);
  const [expandedKurikulum, setExpandedKurikulum] = useState<number[]>([]);
  const [expandedTingkat, setExpandedTingkat] = useState<string[]>([]);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/kurikulum-mata-pelajaran");
        if (res.data.status === "success") {
          setDataKurmap(res.data.data);
          // Auto expand kurikulum pertama
          if (res.data.data.length > 0) {
            setExpandedKurikulum([res.data.data[0].kurikulum_id]);
          }
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          // Jika tidak ada data, set empty array
          setDataKurmap([]);
        } else {
          Swal.fire({
            icon: "error",
            title: "Gagal memuat data!",
            text: error.response?.data?.message || "Tidak dapat memuat data kurikulum mata pelajaran",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Search filtering
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredData(dataKurmap);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredData(
        dataKurmap
          .map((kurikulum) => ({
            ...kurikulum,
            tingkat: kurikulum.tingkat
              .map((t) => ({
                ...t,
                mata_pelajaran: t.mata_pelajaran.filter((mapel) => mapel.nama_pelajaran.toLowerCase().includes(lower)),
              }))
              .filter((t) => t.mata_pelajaran.length > 0),
          }))
          .filter((kurikulum) => kurikulum.tingkat.length > 0 || kurikulum.kurikulum.toLowerCase().includes(lower))
      );
    }
  }, [searchTerm, dataKurmap]);

  const toggleKurikulum = (kurikulumId: number) => {
    setExpandedKurikulum((prev) => (prev.includes(kurikulumId) ? prev.filter((id) => id !== kurikulumId) : [...prev, kurikulumId]));
  };

  const toggleTingkat = (key: string) => {
    setExpandedTingkat((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  // Helper untuk generate composite key
  const getCompositeKey = (kurikulumId: number, tingkat: number, mapelId: number) => {
    return `${kurikulumId}-${tingkat}-${mapelId}`;
  };

  // Helper untuk save mapping ke localStorage
  const saveKurmapMapping = (compositeKey: string, data: any) => {
    try {
      const existing = localStorage.getItem('kurmap_mapping') || '{}';
      const mapping = JSON.parse(existing);
      mapping[compositeKey] = {
        kurikulum_id: data.kurikulum_id,
        tingkat: data.tingkat,
        mata_pelajaran_id: data.mata_pelajaran_id,
        nama_kurikulum: data.nama_kurikulum,
        nama_pelajaran: data.nama_pelajaran,
        nilai_kkm: data.nilai_kkm,
        status_mapel: data.status_mapel,
        status_aktif: data.status_aktif,
      };
      localStorage.setItem('kurmap_mapping', JSON.stringify(mapping));
    } catch (error) {
      console.error('Error saving kurmap mapping:', error);
    }
  };

  const handleDelete = async (kurikulumId: number, tingkat: number, mapelId: number, namaMapel: string) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      html: `Mata pelajaran <strong>${namaMapel}</strong> akan dihapus dari kurikulum ini.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);

      // Fetch detail untuk mendapatkan kurikulum_mata_pelajaran_id yang sebenarnya
      let kurmapId: number | null = null;

      // Cari di data yang sudah ada
      for (const kurikulum of dataKurmap) {
        if (kurikulum.kurikulum_id === kurikulumId) {
          for (const tingkatObj of kurikulum.tingkat) {
            if (tingkatObj.tingkat === tingkat) {
              const mapel = tingkatObj.mata_pelajaran.find(m => m.mata_pelajaran_id === mapelId);
              if (mapel && mapel.kurikulum_mata_pelajaran_id) {
                kurmapId = mapel.kurikulum_mata_pelajaran_id;
                break;
              }
            }
          }
        }
        if (kurmapId) break;
      }

      // Jika tidak ada kurikulum_mata_pelajaran_id (backend belum update)
      if (!kurmapId) {
        Swal.fire({
          icon: "info",
          title: "Tidak dapat menghapus langsung",
          html: `
            <p>Backend belum menyediakan <code>kurikulum_mata_pelajaran_id</code> di response index.</p>
            <br/>
            <p><strong>Solusi alternatif:</strong></p>
            <ul style="text-align: left; padding-left: 20px;">
              <li>Gunakan fitur <strong>Edit</strong> untuk mengubah status menjadi <strong>Arsip</strong></li>
              <li>Atau minta backend developer tambahkan field <code>kurikulum_mata_pelajaran_id</code></li>
            </ul>
          `,
          confirmButtonText: "OK",
        });
        setLoading(false);
        return;
      }

      // Jika ada kurikulum_mata_pelajaran_id, lakukan delete
      const res = await api.delete(`/spa/kurikulum-mata-pelajaran/${kurmapId}`);

      if (res.data.status === "success") {
        // Refresh data setelah delete
        const refreshRes = await api.get("/spa/kurikulum-mata-pelajaran");
        if (refreshRes.data.status === "success") {
          setDataKurmap(refreshRes.data.data);
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      }
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus!",
        text: err.response?.data?.message || "Terjadi kesalahan saat menghapus.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk badge
  const getStatusMapelBadgeClass = (status: string): string => {
    switch (status) {
      case "wajib":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "pilihan":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      case "jurusan":
        return "bg-orange-100 text-orange-700 hover:bg-orange-100";
      case "mulok":
        return "bg-teal-100 text-teal-700 hover:bg-teal-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  const getTipeKurikulumBadgeClass = (tipe: string): string => {
    switch (tipe) {
      case "MERDEKA":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "K13":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "KTSP":
        return "bg-purple-100 text-purple-700 hover:bg-purple-100";
      default:
        return "bg-gray-100 text-gray-700 hover:bg-gray-100";
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Kurikulum Mata Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Kurikulum Mata Pelajaran</h1>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Tombol Tambah */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                <Link to="/superadmin/informasi-akademik/kurikulum-mata-pelajaran/create" className="w-full md:w-auto">
                  <Button className="bg-primary w-full mx-auto">
                    <PlusIcon size={18} />
                    Tambah Kurikulum Mata Pelajaran
                  </Button>
                </Link>

                <div className="relative w-full md:w-1/3">
                  <SearchIcon className="absolute left-2.5 top-2.5 text-gray-400" size={18} />
                  <Input type="text" placeholder="Cari mata pelajaran..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8" />
                </div>
              </div>

              {/* Nested Table */}
              <div className="w-full space-y-4">
                {filteredData.length > 0 ? (
                  filteredData.map((kurikulum) => (
                    <div key={kurikulum.kurikulum_id} className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
                      {/* Header Kurikulum */}
                      <div
                        className="bg-primary p-4 cursor-pointer hover:bg-primary/90 transition-colors flex items-center justify-between"
                        onClick={() => toggleKurikulum(kurikulum.kurikulum_id)}
                      >
                        <div className="flex items-center gap-3">
                          {expandedKurikulum.includes(kurikulum.kurikulum_id) ? <ChevronDownIcon className="text-white" size={20} /> : <ChevronRightIcon className="text-white" size={20} />}
                          <h2 className="text-lg font-bold text-white">{kurikulum.kurikulum}</h2>
                          <Badge className={getTipeKurikulumBadgeClass(kurikulum.tipe)}>{kurikulum.tipe}</Badge>
                          <Badge className={kurikulum.status_kurikulum === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"}>
                            {kurikulum.status_kurikulum}
                          </Badge>
                        </div>
                        <span className="text-white text-sm">{kurikulum.tingkat.reduce((acc, t) => acc + t.mata_pelajaran.length, 0)} mata pelajaran</span>
                      </div>

                      {/* Content Tingkat */}
                      {expandedKurikulum.includes(kurikulum.kurikulum_id) && (
                        <div className="p-4 space-y-3">
                          {kurikulum.tingkat.map((tingkat) => {
                            const tingkatKey = `${kurikulum.kurikulum_id}-${tingkat.tingkat}`;
                            return (
                              <div key={tingkatKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Header Tingkat */}
                                <div
                                  className="bg-indigo-50 p-3 cursor-pointer hover:bg-indigo-100 transition-colors flex items-center justify-between"
                                  onClick={() => toggleTingkat(tingkatKey)}
                                >
                                  <div className="flex items-center gap-2">
                                    {expandedTingkat.includes(tingkatKey) ? <ChevronDownIcon className="text-indigo-700" size={18} /> : <ChevronRightIcon className="text-indigo-700" size={18} />}
                                    <h3 className="font-semibold text-indigo-900">Kelas {tingkat.tingkat}</h3>
                                  </div>
                                  <span className="text-indigo-700 text-sm">{tingkat.mata_pelajaran.length} mata pelajaran</span>
                                </div>

                                {/* Table Mata Pelajaran */}
                                {expandedTingkat.includes(tingkatKey) && (
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader className="bg-gray-50">
                                        <TableRow>
                                          <TableHead className="text-center font-semibold">No</TableHead>
                                          <TableHead className="font-semibold">Nama Mata Pelajaran</TableHead>
                                          <TableHead className="font-semibold">Kode Diknas</TableHead>
                                          <TableHead className="font-semibold">KKM</TableHead>
                                          <TableHead className="font-semibold">Kelompok</TableHead>
                                          <TableHead className="font-semibold">Status Mapel</TableHead>
                                          <TableHead className="font-semibold">Status Aktif</TableHead>
                                          <TableHead className="text-center font-semibold">Aksi</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {tingkat.mata_pelajaran.map((mapel, index) => (
                                          <TableRow key={mapel.mata_pelajaran_id} className="hover:bg-gray-50 border-b border-gray-100">
                                            <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{mapel.nama_pelajaran}</TableCell>
                                            <TableCell className="text-sm">{mapel.kode_mapel_diknas}</TableCell>
                                            <TableCell className="font-semibold text-primary">{mapel.nilai_kkm}</TableCell>
                                            <TableCell>
                                              <Badge variant="outline">{mapel.kelompok || "-"}</Badge>
                                            </TableCell>
                                            <TableCell>
                                              <Badge className={getStatusMapelBadgeClass(mapel.status_mapel)}>{mapel.status_mapel}</Badge>
                                            </TableCell>
                                            <TableCell>
                                              <Badge className={mapel.status_aktif === "aktif" ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-gray-100 text-gray-700 hover:bg-gray-100"}>
                                                {mapel.status_aktif}
                                              </Badge>
                                            </TableCell>
                                            <TableCell className="flex gap-1 justify-center">
                                              {/* Detail - disabled jika tidak ada kurikulum_mata_pelajaran_id */}
                                              {mapel.kurikulum_mata_pelajaran_id ? (
                                                <DialogDetailKurmap kurmapId={mapel.kurikulum_mata_pelajaran_id} />
                                              ) : (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  disabled
                                                  title="Detail tidak tersedia (kurikulum_mata_pelajaran_id tidak ada dari backend)"
                                                >
                                                  <EyeIcon size={16} />
                                                </Button>
                                              )}

                                              {/* Edit - menggunakan composite key */}
                                              <Link
                                                to={`/superadmin/informasi-akademik/kurikulum-mata-pelajaran/edit/${getCompositeKey(kurikulum.kurikulum_id, tingkat.tingkat, mapel.mata_pelajaran_id)}`}
                                                onClick={() => saveKurmapMapping(
                                                  getCompositeKey(kurikulum.kurikulum_id, tingkat.tingkat, mapel.mata_pelajaran_id),
                                                  {
                                                    kurikulum_id: kurikulum.kurikulum_id,
                                                    tingkat: tingkat.tingkat,
                                                    mata_pelajaran_id: mapel.mata_pelajaran_id,
                                                    nama_kurikulum: kurikulum.kurikulum,
                                                    nama_pelajaran: mapel.nama_pelajaran,
                                                    nilai_kkm: mapel.nilai_kkm,
                                                    status_mapel: mapel.status_mapel,
                                                    status_aktif: mapel.status_aktif,
                                                  }
                                                )}
                                              >
                                                <Button className="bg-primary" size="sm">
                                                  <PenBoxIcon size={16} />
                                                </Button>
                                              </Link>

                                              <Button
                                                className="bg-muted-foreground hover:bg-muted-foreground/90"
                                                size="sm"
                                                onClick={() => handleDelete(kurikulum.kurikulum_id, tingkat.tingkat, mapel.mata_pelajaran_id, mapel.nama_pelajaran)}
                                                disabled={mapel.status_aktif === "arsip"}
                                                title={mapel.status_aktif === "arsip" ? "Data arsip tidak dapat dihapus" : ""}
                                              >
                                                <Trash2Icon size={16} />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-8 text-center text-gray-500">
                    <p className="text-lg font-medium">Tidak ada data kurikulum mata pelajaran yang ditemukan</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DataKurikulumMataPelajaran;