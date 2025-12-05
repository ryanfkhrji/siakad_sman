import { useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Footer from "@/pages/Footer";
import { Link } from "react-router-dom";
import type { IdentitasSekolah } from "@/types";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon, PenBoxIcon, PlusIcon, Trash2Icon, User2Icon, BadgeCheckIcon, SchoolIcon, Layers3Icon, MailIcon, PhoneIcon, MapPinIcon, IdCardLanyardIcon, GoalIcon, ListCheckIcon } from "lucide-react";

const DataIdentitasSekolah = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataIdentitasSekolah, setDataIdentitasSekolah] = useState<IdentitasSekolah[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/identitas-sekolah");
        if (res.data.status === "success") {
          setDataIdentitasSekolah(res.data.data);
        }
      } catch (error: any) {
        console.error("Gagal mengambil data identitas sekolah:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data identitas sekolah yang dihapus tidak dapat dikembalikan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const res = await api.delete(`/spa/identitas-sekolah/${id}`);

      if (res.data.status === "success") {
        setDataIdentitasSekolah((prev) => prev.filter((j) => j.id !== id));

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data identitas sekolah berhasil dihapus.",
          showConfirmButton: false,
          timer: 1800,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: res.data.message || "Terjadi kesalahan saat menghapus identitas sekolah.",
        });
      }
    } catch (err: any) {
      if (err.response?.data?.status === "error") {
        Swal.fire({
          icon: "error",
          title: "Gagal menghapus!",
          text: err.response.data.message || "Identitas sekolah tidak ditemukan.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Terjadi kesalahan koneksi ke server.",
        });
      }
      console.error("Gagal menghapus identitas sekolah:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Data Identitas Sekolah" />
        <div className="mx-auto p-6 sm:px-8 lg:px-10">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">Data Identitas Sekolah</h1>
            <p className="text-gray-600">Kelola informasi dan identitas sekolah Anda</p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl shadow-sm border border-gray-100">
              <Loader2Icon className="animate-spin mb-3 text-primary" size={36} />
              <p className="text-lg font-medium text-gray-700">Memuat data...</p>
              <p className="text-sm text-gray-500 mt-1">Mohon tunggu sebentar</p>
            </div>
          ) : (
            <>
              {/* Tombol Tambah */}
              {dataIdentitasSekolah.length === 0 && (
                <div className="mb-8">
                  <Link to="/superadmin/informasi-sekolah/identitas-sekolah/create" className="inline-block">
                    <Button className="bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 px-6 py-6 text-base font-semibold rounded-xl">
                      <PlusIcon size={20} />
                      Tambah Identitas Sekolah
                    </Button>
                  </Link>
                </div>
              )}

              {/* List Data dalam Card */}
              <div className="grid grid-cols-1 gap-8 w-full">
                {dataIdentitasSekolah.length > 0 ? (
                  dataIdentitasSekolah.map((item) => (
                    <Card key={item.id} className="shadow border-0 bg-white rounded-2xl overflow-hidden group">
                      {/* Header dengan Gradient Background */}
                      <CardHeader className="bg-gradient-to-r from-primary/5 to-indigo-50 border-b border-gray-100 py-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-600/20 rounded-2xl blur-xl"></div>
                            <img
                              src={item.logo}
                              alt={item.nama_sekolah}
                              className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-lg"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.onerror = null;
                                target.src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160"%3E%3Crect fill="%23f3f4f6" width="160" height="160" rx="16"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14" font-weight="600"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          </div>

                          <div className="flex-1">
                            <CardTitle className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent mb-2">{item.nama_sekolah}</CardTitle>
                            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                              <SchoolIcon size={16} className="text-primary" />
                              <span className="text-sm font-medium text-gray-700">NPSN: {item.npsn}</span>
                            </div>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="p-4">
                        {/* Grid Info dengan spacing lebih baik */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Kepala Sekolah */}
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <User2Icon size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kepala Sekolah</p>
                              <p className="text-base font-semibold text-gray-900 truncate">{item.kepala_sekolah || "-"}</p>
                            </div>
                          </div>

                          {/* NIP */}
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <IdCardLanyardIcon size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">NIP Kepala Sekolah</p>
                              <p className="text-base font-semibold text-gray-900">{item.nip_kepala_sekolah || "-"}</p>
                            </div>
                          </div>

                          {/* Status Sekolah */}
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <SchoolIcon size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status Sekolah</p>
                              <p className="text-base font-semibold text-gray-900">{item.status_sekolah}</p>
                            </div>
                          </div>

                          {/* Jenjang */}
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <Layers3Icon size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Jenjang</p>
                              <p className="text-base font-semibold text-gray-900">{item.jenjang}</p>
                            </div>
                          </div>

                          {/* Akreditasi */}
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <BadgeCheckIcon size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Akreditasi</p>
                              <p className="text-base font-semibold text-gray-900">{item.akreditasi || "-"}</p>
                            </div>
                          </div>

                          {/* Email */}
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <MailIcon size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                              <p className="text-base font-semibold text-gray-900 truncate">{item.email}</p>
                            </div>
                          </div>

                          {/* Telepon */}
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <PhoneIcon size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Telepon</p>
                              <p className="text-base font-semibold text-gray-900">{item.no_telepon}</p>
                            </div>
                          </div>

                          {/* Kode Pos */}
                          <div className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <MapPinIcon size={20} className="text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kode Pos</p>
                              <p className="text-base font-semibold text-gray-900">{item.kode_pos}</p>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="my-8 border-t border-gray-200"></div>

                        {/* Alamat Lengkap Section */}
                        <div className="space-y-6">
                          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <MapPinIcon size={20} className="text-primary" />
                            Alamat Lengkap
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Desa/Kelurahan</p>
                              <p className="text-sm font-medium text-gray-900">{item.desa_kelurahan}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kecamatan</p>
                              <p className="text-sm font-medium text-gray-900">{item.kecamatan}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kabupaten/Kota</p>
                              <p className="text-sm font-medium text-gray-900">{item.kabupaten_kota}</p>
                            </div>

                            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Provinsi</p>
                              <p className="text-sm font-medium text-gray-900">{item.provinsi}</p>
                            </div>
                          </div>

                          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Alamat Lengkap</p>
                            <p className="text-sm font-medium text-gray-900 leading-relaxed">{item.alamat}</p>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="my-8 border-t border-gray-200"></div>

                        {/* Visi Misi Section */}
                        <div className="space-y-6">
                          <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <GoalIcon size={20} className="text-primary" />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">Visi</h3>
                            </div>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed pl-11">{item.visi}</p>
                          </div>

                          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                <ListCheckIcon size={20} className="text-primary" />
                              </div>
                              <h3 className="text-lg font-bold text-gray-900">Misi</h3>
                            </div>
                            <p className="text-sm font-medium text-gray-700 leading-relaxed pl-11">{item.misi}</p>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-end gap-3 pt-0 pb-6 px-8 bg-gray-50 border-t border-gray-100">
                        <Link to={`/superadmin/informasi-sekolah/identitas-sekolah/edit/${item.id}`}>
                          <Button size="lg">
                            <PenBoxIcon size={18} />
                            Edit
                          </Button>
                        </Link>

                        <Button size="lg" className="bg-muted-foreground hover:bg-muted-foreground/90" onClick={() => handleDelete(item.id)}>
                          <Trash2Icon size={18} />
                          Hapus
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-6">
                      <SchoolIcon size={40} className="text-gray-400" />
                    </div>
                    <p className="text-xl font-semibold text-gray-700 mb-2">Belum Ada Data</p>
                    <p className="text-gray-500 mb-8">Silakan tambahkan identitas sekolah terlebih dahulu</p>
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

export default DataIdentitasSekolah;
