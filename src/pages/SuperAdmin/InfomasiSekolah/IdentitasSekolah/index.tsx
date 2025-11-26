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
// import { DialogDetailGedung } from "./DialogDetailGedung";

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
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Data Identitas Sekolah</h1>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* Tombol Tambah */}
              {dataIdentitasSekolah.length === 0 && (
                <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
                  <Link to="/superadmin/informasi-sekolah/identitas-sekolah/create" className="w-full md:w-auto">
                    <Button className="bg-primary w-full mx-auto">
                      <PlusIcon size={18} />
                      Tambah Identitas Sekolah
                    </Button>
                  </Link>
                </div>
              )}

              {/* List Data dalam Card */}
              <div className="grid grid-cols-1 gap-6 w-full">
                {dataIdentitasSekolah.length > 0 ? (
                  dataIdentitasSekolah.map((item) => (
                    <Card key={item.id} className="shadow transition-all duration-300 border border-gray-200">
                      <CardHeader className="flex flex-row items-center gap-4">
                        <img
                          src={item.logo}
                          alt={item.nama_sekolah}
                          className="w-40 h-40 rounded object-cover border"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23e5e7eb" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                          }}
                        />

                        <div>
                          <CardTitle className="text-3xl font-bold text-primary">{item.nama_sekolah}</CardTitle>
                          <p className="text-sm text-muted-foreground">NPSN: {item.npsn}</p>
                        </div>
                      </CardHeader>

                      <CardContent className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <User2Icon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Kepala Sekolah</p>
                            <p className="text-muted-foreground">{item.kepala_sekolah || "-"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <IdCardLanyardIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">NIP Kepala Sekolah</p>
                            <p className="text-muted-foreground">{item.nip_kepala_sekolah || "-"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <SchoolIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Status Sekolah</p>
                            <p className="text-muted-foreground">{item.status_sekolah}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Layers3Icon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Jenjang</p>
                            <p className="text-muted-foreground">{item.jenjang}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <BadgeCheckIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Akreditasi</p>
                            <p className="text-muted-foreground">{item.akreditasi || "-"}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MailIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Email</p>
                            <p className="text-muted-foreground">{item.email}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <PhoneIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Telepon</p>
                            <p className="text-muted-foreground">{item.no_telepon}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPinIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Kode Pos</p>
                            <p className="text-muted-foreground">{item.kode_pos}</p>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-start gap-2">
                          <MapPinIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Alamat</p>
                            <p className="break-words text-muted-foreground">{item.alamat}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPinIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Desa/Kelurahan</p>
                            <p className="text-muted-foreground">{item.desa_kelurahan}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPinIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Kecamatan</p>
                            <p className="text-muted-foreground">{item.kecamatan}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPinIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Kabupaten/Kota</p>
                            <p className="text-muted-foreground">{item.kabupaten_kota}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPinIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Provinsi</p>
                            <p className="text-muted-foreground">{item.provinsi}</p>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-start gap-2">
                          <GoalIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Visi</p>
                            <p className="text-muted-foreground">{item.visi}</p>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-start gap-2">
                          <ListCheckIcon size={18} className="text-primary" />
                          <div>
                            <p className="font-semibold text-muted-foreground">Misi</p>
                            <p className="text-muted-foreground">{item.misi}</p>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="flex justify-end gap-2 pt-2">
                        <Link to={`/superadmin/informasi-sekolah/identitas-sekolah/edit/${item.id}`}>
                          <Button size="sm" className="bg-primary">
                            <PenBoxIcon size={16} />
                          </Button>
                        </Link>

                        <Button size="sm" className="bg-muted-foreground hover:bg-muted-foreground/90" onClick={() => handleDelete(item.id)}>
                          <Trash2Icon size={16} />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <p className="text-gray-500 text-center col-span-full py-10">Tidak ada data identitas sekolah.</p>
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
