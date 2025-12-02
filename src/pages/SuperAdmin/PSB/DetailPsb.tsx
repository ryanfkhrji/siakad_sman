import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import PageTitle from "@/components/PageTitle";
import Footer from "@/pages/Footer";
import { Loader2, EyeIcon, CheckCircle2, XCircle, Download, Copy, ArrowLeft, FileText, User, Users, FolderOpen, Clock } from "lucide-react";
import Swal from "sweetalert2";
import { psbService } from "@/services/psbService";
import type { Psb } from "@/types/psb";
import type { ReactNode } from "react";

/* ---------- Komponen Pembantu ---------- */

interface InfoItemProps {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value, icon }) => (
  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200">
    {icon && <span className="text-primary">{icon}</span>}
    <div>
      <div className="font-medium text-gray-500 text-xs uppercase">{label}</div>
      <div className="font-semibold text-gray-800">{value ?? "-"}</div>
    </div>
  </div>
);

interface DetailFieldProps {
  label: string;
  value?: string | number | null;
  className?: string;
}

const DetailField: React.FC<DetailFieldProps> = ({ label, value, className = "" }) => (
  <div className={`p-4 bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{label}</div>
    <div className="text-base font-semibold text-gray-800 break-words">{value ?? "-"}</div>
  </div>
);

interface FileCardProps {
  label: string;
  url?: string | null;
  onPreview: (url: string | null | undefined) => void;
  onDownload: (url: string | null | undefined) => void;
}

const FileCard: React.FC<FileCardProps> = ({ label, url, onPreview, onDownload }) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
      <CardTitle className="text-base font-medium text-gray-700">
        <FolderOpen className="inline mr-2 text-primary" size={16} />
        {label}
      </CardTitle>
    </CardHeader>
    <CardContent className="p-4 pt-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
      <div className="text-sm font-semibold text-gray-800">{url ? "File tersedia" : "Belum diunggah"}</div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => onPreview(url)} disabled={!url} className="text-primary border-primary hover:bg-primary/5" title="Preview File">
          <EyeIcon size={16} />
          Preview
        </Button>
        <Button size="sm" onClick={() => onDownload(url)} disabled={!url} title="Download File">
          <Download size={16} />
          Unduh
        </Button>
      </div>
    </CardContent>
  </Card>
);

/* ---------- Komponen Utama DetailPsb ---------- */

export default function DetailPsb() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const psbId = Number(id);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [psb, setPsb] = useState<Psb | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[] | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: "image" | "pdf" } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  // const [editOpen, setEditOpen] = useState(false);
  // const [editForm, setEditForm] = useState<any>({});
  // const [verifLoading, setVerifLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pribadi");

  useEffect(() => {
    fetchData();
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [psbId]);

  const fetchData = async () => {
    if (!psbId) return;
    setLoading(true);
    try {
      const res = await psbService.getDetail(psbId);
      if (res?.status === "success") setPsb(res.data);
      else if (res?.data) setPsb(res.data);
    } catch (err) {
      console.error("fetch detail error", err);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data",
        text: "Periksa koneksi atau server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!psbId) return;
    try {
      const resp = await fetch(`/api/psb/${psbId}/history`);
      if (!resp.ok) {
        setHistory(null);
        return;
      }
      const json = await resp.json();
      setHistory(Array.isArray(json.data) ? json.data : json);
    } catch (err) {
      setHistory(null);
    }
  };

  /* ---------- Status helpers ---------- */
  const getStatusBadge = (status?: string) => {
    const s = (status || "baru").toLowerCase();
    switch (s) {
      case "verified":
      case "diverifikasi":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-sm font-medium border border-green-200">
            <CheckCircle2 size={14} />
            Diverifikasi
          </span>
        );
      case "rejected":
      case "ditolak":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-700 text-sm font-medium border border-red-200">
            <XCircle size={14} />
            Ditolak
          </span>
        );
      case "processing":
      case "diproses":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 text-sm font-medium border border-yellow-200">
            <Clock size={14} />
            Diproses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200">
            <FileText size={14} />
            Baru
          </span>
        );
    }
  };

  /* ---------- Actions ---------- */
  // async function handleVerify() {
  //   if (!psbId) return;
  //   const confirmed = await Swal.fire({
  //     title: "Verifikasi peserta?",
  //     text: "Pastikan data sudah benar. Lanjutkan verifikasi?",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonText: "Ya, verifikasi",
  //     confirmButtonColor: "#4F46E5",
  //     cancelButtonText: "Batal",
  //   });
  //   if (!confirmed.isConfirmed) return;

  //   try {
  //     setVerifLoading(true);
  //     await psbService.update(psbId, { status: "diverifikasi" } as any);
  //     Swal.fire({
  //       icon: "success",
  //       title: "Berhasil",
  //       text: "Peserta telah diverifikasi.",
  //       showConfirmButton: false,
  //       timer: 1500,
  //     });
  //     await fetchData();
  //     await fetchHistory();
  //   } catch (err: any) {
  //     console.error(err);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Gagal",
  //       text: err?.response?.data?.message || "Terjadi kesalahan.",
  //     });
  //   } finally {
  //     setVerifLoading(false);
  //   }
  // }

  // async function handleReject() {
  //   const { value: reason } = await Swal.fire({
  //     title: "Tolak pendaftaran",
  //     input: "textarea",
  //     inputLabel: "Masukkan alasan penolakan",
  //     inputPlaceholder: "Alasan...",
  //     showCancelButton: true,
  //     confirmButtonText: "Tolak",
  //     confirmButtonColor: "#EF4444",
  //     cancelButtonText: "Batal",
  //   });
  //   if (!reason) return;
  //   try {
  //     setLoading(true);
  //     await psbService.update(psbId, { status: "ditolak", alasan_penolakan: reason } as any);
  //     Swal.fire({
  //       icon: "success",
  //       title: "Berhasil",
  //       text: "Pendaftaran ditolak.",
  //       showConfirmButton: false,
  //       timer: 1500,
  //     });
  //     await fetchData();
  //     await fetchHistory();
  //   } catch (err: any) {
  //     console.error(err);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Gagal",
  //       text: err?.response?.data?.message || "Terjadi kesalahan.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function handleExportExcel() {
    try {
      setLoading(true);
      const blob = await psbService.exportExcel([psbId]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `psb_${psbId}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      Swal.fire({
        icon: "success",
        title: "Export berhasil",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Export gagal" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadFile(url?: string | null) {
    if (!url) return;
    window.open(url, "_blank");
  }

  function handlePreview(url?: string | null) {
    if (!url) return;
    const isPdf = url.toLowerCase().endsWith(".pdf");
    setPreviewFile({ url: url as string, type: isPdf ? "pdf" : "image" });
    setPreviewOpen(true);
  }

  function handleCopy(value?: string | null) {
    if (!value) return;
    navigator.clipboard?.writeText(value).then(
      () =>
        Swal.fire({
          icon: "success",
          title: "Disalin",
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 900,
        }),
      () => Swal.fire({ icon: "error", title: "Gagal menyalin" })
    );
  }

  /* ---------- Edit modal ---------- */
  // function openEdit() {
  //   setEditForm({
  //     nama_siswa: psb?.nama_siswa ?? "",
  //     no_hp_siswa: psb?.no_hp_siswa ?? "",
  //     alamat: psb?.alamat ?? "",
  //     sekolah_asal: psb?.sekolah_asal ?? "",
  //     alamat_sekolah_asal: psb?.alamat_sekolah_asal ?? "",
  //     // Anda bisa menambahkan field lain yang ingin di-edit di sini
  //   });
  //   setEditOpen(true);
  // }

  // async function submitEdit() {
  //   try {
  //     setLoading(true);
  //     // Hapus properti dengan nilai kosong atau null jika diperlukan
  //     const dataToUpdate = Object.fromEntries(Object.entries(editForm).filter(([, v]) => v !== null && v !== ""));

  //     await psbService.update(psbId, dataToUpdate as any);

  //     Swal.fire({
  //       icon: "success",
  //       title: "Disimpan",
  //       showConfirmButton: false,
  //       timer: 1500,
  //     });
  //     setEditOpen(false);
  //     await fetchData();
  //   } catch (err: any) {
  //     console.error(err);
  //     Swal.fire({
  //       icon: "error",
  //       title: "Gagal menyimpan",
  //       text: err?.response?.data?.message || "Terjadi kesalahan saat menyimpan data.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  /* ---------- Render ---------- */
  if (!psbId) {
    return (
      <div className="p-6">
        <p>ID tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail PSB" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Button onClick={() => navigate(-1)} variant="outline" size="sm" className="hover:bg-white">
                <ArrowLeft size={18} />
                Kembali
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-3xl font-bold text-gray-800">Detail Peserta PSB</h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">ID Peserta:</span>
              <span className="text-sm font-semibold text-gray-700">#{psbId}</span>
              {psb && getStatusBadge((psb as any)?.status)}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <Loader2 className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Card Header dengan Foto & Info Utama */}
              <Card className="mb-6 border-0 shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Foto Siswa */}
                    <div className="flex-shrink-0">
                      {psb?.foto_siswa ? (
                        <div className="relative group">
                          <img
                            src={psb.foto_siswa}
                            alt="foto siswa"
                            className="w-40 h-40 object-cover rounded-xl border-4 border-white shadow-md cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => handlePreview(psb.foto_siswa)}
                          />
                          {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-xl transition-all flex items-center justify-center">
                            <EyeIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={24} />
                          </div> */}
                        </div>
                      ) : (
                        <div className="w-40 h-40 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center text-gray-500 shadow-md">
                          <User size={48} />
                        </div>
                      )}
                    </div>

                    {/* Info Utama */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{psb?.nama_siswa ?? "-"}</h2>
                        <div className="flex items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">NISN:</span>
                            <span className="font-semibold text-gray-800">{psb?.nisn ?? "-"}</span>
                            <button className="p-1 hover:bg-gray-100 rounded transition-colors" onClick={() => handleCopy(psb?.nisn)} title="Copy NISN">
                              <Copy size={14} className="text-gray-500" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Info Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <InfoItem label="Jenis Kelamin" value={psb?.jk} icon={<User size={16} />} />
                        <InfoItem label="Tempat, Tanggal Lahir" value={`${psb?.tempat_lahir ?? "-"}, ${psb?.tanggal_lahir ?? "-"}`} />
                        <InfoItem label="Agama" value={psb?.agama} icon={<FileText size={16} />} />
                        <InfoItem label="No. HP" value={psb?.no_hp_siswa} />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {/* <Button size="sm" onClick={handleVerify} disabled={verifLoading || psb?.status === "diverifikasi"} className="bg-green-600 hover:bg-green-700">
                          {verifLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
                          Verifikasi
                        </Button>

                        <Button size="sm" variant="destructive" onClick={handleReject} disabled={psb?.status === "ditolak"}>
                          <XCircle className="mr-2" size={16} />
                          Tolak
                        </Button> */}

                        {/* <Button size="sm" onClick={openEdit}>
                          <PenBoxIcon size={16} />
                          Edit Data
                        </Button> */}

                        <Button size="sm" variant="outline" onClick={handleExportExcel}>
                          <Download size={16} />
                          Export Excel
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabs Content */}
              <Card className="border-0 shadow">
                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1 rounded-lg">
                      <TabsTrigger value="pribadi" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                        <User size={16} />
                        Data Pribadi
                      </TabsTrigger>
                      <TabsTrigger value="ortu" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                        <Users size={16} />
                        Orang Tua
                      </TabsTrigger>
                      <TabsTrigger value="berkas" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                        <FolderOpen size={16} />
                        Berkas
                      </TabsTrigger>
                      <TabsTrigger value="riwayat" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                        <Clock size={16} />
                        Riwayat
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pribadi" className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailField label="NISN" value={psb?.nisn} />
                        <DetailField label="Nama Siswa" value={psb?.nama_siswa} />
                        <DetailField label="Jenis Kelamin" value={psb?.jk} />
                        <DetailField label="Tempat Lahir" value={psb?.tempat_lahir} />
                        <DetailField label="Tanggal Lahir" value={psb?.tanggal_lahir} />
                        <DetailField label="Agama" value={psb?.agama} />
                        <DetailField label="Alamat" value={psb?.alamat} className="md:col-span-2" />
                        <DetailField label="No HP Siswa" value={psb?.no_hp_siswa} />
                        <DetailField label="Sekolah Asal" value={psb?.sekolah_asal} />
                        <DetailField label="Alamat Sekolah Asal" value={psb?.alamat_sekolah_asal} className="md:col-span-2" />
                        <DetailField label="Kelas Terakhir" value={psb?.kelas_terakhir} />
                        <DetailField label="Nilai Raport Terakhir" value={psb?.nilai_raport_terakhir} />
                        {/* {psb?.alasan_penolakan && <DetailField label="Alasan Penolakan" value={psb?.alasan_penolakan} className="md:col-span-2 bg-red-50 border-red-200" />} */}
                        <DetailField label="Alasan Pindah" value={psb?.alasan_pindah} className="md:col-span-2" />
                      </div>
                    </TabsContent>

                    <TabsContent value="ortu" className="space-y-8">
                      {/* Data Ayah */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                          <div className="w-1 h-6 bg-primary rounded"></div>
                          Data Ayah
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <DetailField label="Nama Ayah" value={psb?.data_ayah?.nama_ayah} />
                          <DetailField label="Pekerjaan" value={psb?.data_ayah?.pekerjaan_ayah} />
                          <DetailField label="No HP" value={psb?.data_ayah?.no_hp_ayah} />
                        </div>
                      </div>

                      {/* Data Ibu */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                          <div className="w-1 h-6 bg-primary rounded"></div>
                          Data Ibu
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <DetailField label="Nama Ibu" value={psb?.data_ibu?.nama_ibu} />
                          <DetailField label="Pekerjaan" value={psb?.data_ibu?.pekerjaan_ibu} />
                          <DetailField label="No HP" value={psb?.data_ibu?.no_hp_ibu} />
                        </div>
                      </div>

                      {/* Data Wali (jika ada) */}
                      {psb?.data_wali?.nama_wali && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <div className="w-1 h-6 bg-primary rounded"></div>
                            Data Wali
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <DetailField label="Nama Wali" value={psb?.data_wali?.nama_wali} />
                            <DetailField label="Pekerjaan" value={psb?.data_wali?.pekerjaan_wali} />
                            <DetailField label="No HP" value={psb?.data_wali?.no_hp_wali} />
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="berkas">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileCard label="Kartu Keluarga" url={psb?.berkas_kartu_keluarga} onPreview={handlePreview} onDownload={handleDownloadFile} />
                        <FileCard label="Akta Kelahiran" url={psb?.berkas_akta_lahir} onPreview={handlePreview} onDownload={handleDownloadFile} />
                        <FileCard label="Raport" url={psb?.berkas_raport} onPreview={handlePreview} onDownload={handleDownloadFile} />
                        <FileCard label="Surat Keterangan Pindah" url={psb?.suket_pindah} onPreview={handlePreview} onDownload={handleDownloadFile} />
                      </div>
                    </TabsContent>

                    <TabsContent value="riwayat">
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">Riwayat Perubahan Status</h3>
                        {history === null ? (
                          <div className="text-center py-12 text-gray-500">
                            <Clock className="mx-auto mb-3" size={48} />
                            <p>Riwayat tidak tersedia</p>
                          </div>
                        ) : history.length === 0 ? (
                          <div className="text-center py-12 text-gray-500">
                            <Clock className="mx-auto mb-3" size={48} />
                            <p>Belum ada riwayat perubahan</p>
                          </div>
                        ) : (
                          <ul className="space-y-3">
                            {history.map((h, i) => (
                              <li key={i} className="p-4 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="text-sm text-gray-500 mb-1">{new Date(h.created_at).toLocaleString("id-ID")}</div>
                                    <div className="font-medium text-gray-800">{h.message || `${h.action} oleh ${h.by}`}</div>
                                  </div>
                                  <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{h.by}</div>
                                </div>
                                {h.alasan_penolakan && <div className="mt-2 text-sm text-red-600 border-l-2 border-red-500 pl-3">**Alasan Ditolak:** {h.alasan_penolakan}</div>}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Footer />
      </main>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Preview File</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {previewFile?.type === "pdf" ? <iframe src={previewFile.url} className="w-full h-[75vh] border rounded-lg" /> : <img src={previewFile?.url || ""} className="w-full h-[75vh] object-contain rounded-lg" alt="Preview" />}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {/* <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Data Peserta</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="nama_siswa" className="text-sm font-medium">
                Nama Siswa
              </Label>
              <Input id="nama_siswa" value={editForm.nama_siswa ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, nama_siswa: e.target.value }))} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="no_hp_siswa" className="text-sm font-medium">
                No HP Siswa
              </Label>
              <Input id="no_hp_siswa" value={editForm.no_hp_siswa ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, no_hp_siswa: e.target.value }))} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="alamat" className="text-sm font-medium">
                Alamat
              </Label>
              <Textarea id="alamat" value={editForm.alamat ?? ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditForm((p: any) => ({ ...p, alamat: e.target.value }))} className="mt-1" rows={3} />
            </div>

            <div>
              <Label htmlFor="sekolah_asal" className="text-sm font-medium">
                Sekolah Asal
              </Label>
              <Input id="sekolah_asal" value={editForm.sekolah_asal ?? ""} onChange={(e) => setEditForm((p: any) => ({ ...p, sekolah_asal: e.target.value }))} className="mt-1" />
            </div>

            <div>
              <Label htmlFor="alamat_sekolah_asal" className="text-sm font-medium">
                Alamat Sekolah Asal
              </Label>
              <Textarea
                id="alamat_sekolah_asal"
                value={editForm.alamat_sekolah_asal ?? ""}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setEditForm((p: any) => ({
                    ...p,
                    alamat_sekolah_asal: e.target.value,
                  }))
                }
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setEditOpen(false)}>
                Batal
              </Button>
              <Button onClick={submitEdit} disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" size={16} /> : <PenBoxIcon className="mr-2" size={16} />}
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}
    </SidebarProvider>
  );
}
