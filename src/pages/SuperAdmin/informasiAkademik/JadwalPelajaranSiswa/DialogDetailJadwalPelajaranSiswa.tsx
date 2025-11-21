import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2Icon, PenBoxIcon, Trash2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";

interface JadwalPelajaranDetail {
  id: number;
  nisn: string;
  nama: string;
  email: string;
  nis: string;
  nama_jurusan: string | null;
  nama_ekstrakurikuler: string;
  status: string;
  role: string;
  kelas: {
    id: number;
    nama_kelas: string;
    jam_masuk: string;
    wali_kelas: {
      id: number;
      nama: string;
      email: string;
      status: string;
      nip: string;
      keterangan: string | null;
      role: string;
    };
  };
  jadwal_pelajaran: {
    id: number;
    mata_pelajaran: string;
    hari: string;
    guru: string;
    kelas: string;
    jam_pelajaran: string;
    ruangan: string;
    link_opsional: string | null;
  };
}

const DetailJadwalPelajaranSiswa = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JadwalPelajaranDetail | null>(null);

  // Fetch data detail
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/spa/siswa/jadwal-pelajaran/${id}`);

        if (res.data.status === "success") {
          setData(res.data.data);
        }
      } catch (error: any) {
        console.error("Gagal mengambil detail:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: error.response?.data?.message || "Terjadi kesalahan saat mengambil data.",
          confirmButtonColor: "#4F46E5",
        }).then(() => {
          navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id, navigate]);

  // Handle Delete
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      html: `Apakah Anda yakin ingin menghapus jadwal pelajaran untuk siswa <strong>${data?.nama}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/spa/siswa/jadwal-pelajaran/${id}`);

        Swal.fire({
          icon: "success",
          title: "Berhasil Dihapus",
          text: "Jadwal pelajaran siswa berhasil dihapus.",
          confirmButtonColor: "#4F46E5",
        }).then(() => {
          navigate("/superadmin/informasi-akademik/jadwal-pelajaran-siswa");
        });
      } catch (error: any) {
        console.error("Gagal menghapus:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal Menghapus",
          text: error.response?.data?.message || "Terjadi kesalahan saat menghapus data.",
          confirmButtonColor: "#4F46E5",
        });
      }
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Jadwal Pelajaran Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold">Detail Jadwal Pelajaran Siswa</h1>

          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : data ? (
            <>
              <div className="mb-6 mt-6">
                <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-siswa">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ArrowLeft size={18} />
                    Kembali
                  </Button>
                </Link>
              </div>
              <div className="space-y-6">
                {/* Data Siswa */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-primary mb-4 border-b pb-2">Informasi Siswa</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">NISN</p>
                        <p className="text-sm font-bold text-primary">{data.nisn || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">NIS</p>
                        <p className="text-sm font-bold text-primary">{data.nis || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Nama Lengkap</p>
                        <p className="text-sm font-bold text-primary">{data.nama || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Email</p>
                        <p className="text-sm font-bold text-primary">{data.email || "-"}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Jurusan</p>
                        <p className="text-sm font-bold text-primary">{data.nama_jurusan || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Kelas</p>
                        <p className="text-sm font-bold text-primary">{data.kelas?.nama_kelas || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Wali Kelas</p>
                        <p className="text-sm font-bold text-primary">{data.kelas?.wali_kelas?.nama || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Status</p>
                        <p className="text-sm font-bold pt-1">
                          <span className={`px-2 py-1 rounded text-sm ${data.status === "aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{data.status || "-"}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {data.nama_ekstrakurikuler && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-gray-600 font-semibold">Ekstrakurikuler</p>
                      <p className="text-sm font-bold text-primary">{data.nama_ekstrakurikuler}</p>
                    </div>
                  )}
                </div>

                {/* CARD JADWAL PELAJARAN */}
                <div className="p-6 bg-white rounded-xl shadow border border-gray-200">
                  <div className="mb-4 border-b pb-2">
                    <h2 className="text-xl font-bold text-primary">Informasi Jadwal Mata Pelajaran</h2>
                  </div>
                  {/* CARD JADWAL PELAJARAN */}
                  <div className="rounded-xl p-4 border border-primary">
                    {/* Header Card (Judul + Tombol Aksi) */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-primary">Jadwal Mata Pelajaran</h3>

                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <Link to={`/superadmin/informasi-akademik/ekstrakurikuler/edit/`}>
                          <span>
                            <PenBoxIcon size={16} className="text-primary" />
                          </span>
                        </Link>

                        {/* Hapus */}
                        <span onClick={handleDelete} className="text-muted-foreground cursor-pointer">
                          <Trash2Icon size={16} />
                        </span>
                      </div>
                    </div>

                    {/* Isi Card */}
                    <div className="space-y-4">
                      {/* Mata pelajaran */}
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Mata Pelajaran</p>
                        <p className="text-base font-bold text-primary">{data.jadwal_pelajaran.mata_pelajaran}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Kolom kiri */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Guru Pengampu</p>
                            <p className="text-sm font-bold text-primary">{data.jadwal_pelajaran.guru}</p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Hari</p>
                            <p className="text-sm font-bold text-primary">{data.jadwal_pelajaran.hari}</p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Jam Pelajaran</p>
                            <p className="text-sm font-bold text-primary">{data.jadwal_pelajaran.jam_pelajaran}</p>
                          </div>
                        </div>

                        {/* Kolom kanan */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Kelas</p>
                            <p className="text-sm font-bold text-primary">{data.jadwal_pelajaran.kelas}</p>
                          </div>

                          <div>
                            <p className="text-sm text-gray-600 font-semibold">Ruangan</p>
                            <p className="text-sm font-bold text-primary">{data.jadwal_pelajaran.ruangan}</p>
                          </div>

                          {data.jadwal_pelajaran.link_opsional && (
                            <div>
                              <p className="text-sm text-gray-600 font-semibold">Link Online</p>
                              <a href={data.jadwal_pelajaran.link_opsional} target="_blank" className="text-primary font-semibold hover:underline break-all">
                                {data.jadwal_pelajaran.link_opsional}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-gray-600">Data tidak ditemukan</p>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailJadwalPelajaranSiswa;
