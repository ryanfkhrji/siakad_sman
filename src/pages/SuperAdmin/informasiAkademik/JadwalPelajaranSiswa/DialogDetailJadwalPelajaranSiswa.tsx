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

/* ========== CUSTOM INTERFACE ========== */
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
  jadwal_pelajaran: Array<{
    pivot_id: number; // <— pivot id asli
    id: number; // id jadwal_pelajaran
    mata_pelajaran: string;
    hari: string;
    guru: string;
    kelas: string;
    jam_pelajaran: string;
    ruangan: string;
    link_opsional: string | null;
  }>;
}

const DialogDetailJadwalPelajaranSiswa = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<JadwalPelajaranDetail | null>(null);

  /* ========== FETCH DETAIL ========== */
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/spa/siswa/jadwal-pelajaran/${id}`);

        if (res.data.status === "success") {
          setData(res.data.data);
        }
      } catch (error: any) {
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

    if (id) fetchDetail();
  }, [id, navigate]);

  /* ========== DELETE JADWAL ========== */
  const handleDeleteJadwal = async (pivotId: number, namaMapel: string) => {
    console.log("🗑️ Menghapus pivot_id:", pivotId); // Debug

    const result = await Swal.fire({
      title: "Konfirmasi Hapus",
      html: `Apakah Anda yakin ingin menghapus jadwal <strong>${namaMapel}</strong>?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4F46E5",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      // ✅ GUNAKAN pivot_id
      const res = await api.delete(`/spa/siswa/jadwal-pelajaran/${pivotId}`);

      if (res.data.status === "success") {
        // ✅ FILTER berdasarkan pivot_id
        setData((prev) =>
          prev
            ? {
                ...prev,
                jadwal_pelajaran: prev.jadwal_pelajaran.filter((j) => j.pivot_id !== pivotId),
              }
            : null
        );

        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Jadwal berhasil dihapus!",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    } catch (error: any) {
      console.error("Error delete:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Menghapus",
        text: error.response?.data?.message || "Terjadi kesalahan saat menghapus jadwal.",
        confirmButtonColor: "#4F46E5",
      });
    }
  };

  /* ========== RENDER UI ========== */
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Jadwal Pelajaran Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Detail Jadwal Pelajaran Siswa</h1>

          {loading ? (
            <LoadingState />
          ) : data ? (
            <>
              {/* Back Button */}
              <div className="mb-6">
                <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-siswa">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <ArrowLeft size={18} /> Kembali
                  </Button>
                </Link>
              </div>

              {/* Informasi Siswa */}
              <SiswaCard data={data} />

              {/* Jadwal Pelajaran */}
              <JadwalList data={data} onDelete={handleDeleteJadwal} />

              {/* Info Edit */}
              {data.jadwal_pelajaran.length > 0}
            </>
          ) : (
            <NotFound />
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DialogDetailJadwalPelajaranSiswa;

/* ===========================================================
                      COMPONENT PARTIALS
=========================================================== */

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-64 text-gray-600">
    <Loader2Icon className="animate-spin mb-2" size={28} />
    <p className="text-lg font-medium">Memuat data...</p>
  </div>
);

const NotFound = () => (
  <div className="bg-white rounded-lg shadow p-6 text-center">
    <p className="text-gray-600">Data tidak ditemukan</p>
    <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-siswa" className="mt-4 inline-block">
      <Button variant="outline">Kembali ke Daftar Siswa</Button>
    </Link>
  </div>
);

const SiswaCard = ({ data }: { data: JadwalPelajaranDetail }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h2 className="text-xl font-bold text-primary mb-4 border-b pb-2">Informasi Siswa</h2>

    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <InfoField label="NISN" value={data.nisn} />
        <InfoField label="NIS" value={data.nis} />
        <InfoField label="Nama Lengkap" value={data.nama} />
        <InfoField label="Email" value={data.email} />
      </div>

      <div className="space-y-3">
        <InfoField label="Jurusan" value={data.nama_jurusan} />
        <InfoField label="Kelas" value={data.kelas?.nama_kelas} />
        <InfoField label="Wali Kelas" value={data.kelas?.wali_kelas?.nama} />
        <StatusField label="Status" value={data.status} />
      </div>
    </div>

    {data.nama_ekstrakurikuler && (
      <div className="mt-4 pt-4 border-t">
        <InfoField label="Ekstrakurikuler" value={data.nama_ekstrakurikuler} />
      </div>
    )}
  </div>
);

const JadwalList = ({ data, onDelete }: { data: JadwalPelajaranDetail; onDelete: (pivotId: number, mapel: string) => void }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex justify-between items-center border-b pb-2 mb-4">
      <h2 className="text-xl font-bold text-primary">Daftar Jadwal Mata Pelajaran</h2>
      <span className="text-sm text-gray-600">
        Total: <strong>{data.jadwal_pelajaran.length}</strong> jadwal
      </span>
    </div>

    {data.jadwal_pelajaran.length > 0 ? (
      <div className="space-y-4">
        {data.jadwal_pelajaran.map((jadwal) => (
          <div
            key={jadwal.id} // ✅ Key menggunakan pivot_id
            className="rounded-lg p-4 border border-gray-200 hover:border-primary transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-primary">{jadwal.mata_pelajaran}</h3>

              <div className="flex gap-2">
                <Link to={`/superadmin/informasi-akademik/jadwal-pelajaran-siswa/edit/${data.id}/${jadwal.pivot_id}`}>
                  <span className="text-primary">
                    <PenBoxIcon size={16} />
                  </span>
                </Link>

                <span className="text-muted-foreground cursor-pointer" key={jadwal.pivot_id} onClick={() => onDelete(jadwal.pivot_id, jadwal.mata_pelajaran)}>
                  <Trash2Icon size={16} />
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <InfoField label="Guru Pengampu" value={jadwal.guru} />
                <InfoField label="Hari" value={jadwal.hari} />
                <InfoField label="Jam Pelajaran" value={jadwal.jam_pelajaran} />
              </div>

              <div className="space-y-2">
                {/* <InfoField label="Kelas" value={jadwal.kelas} /> */}
                <InfoField label="Ruangan" value={jadwal.ruangan} />
                <InfoField label="Link Pelajaran" value={jadwal.link_opsional} />
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Belum ada jadwal pelajaran untuk siswa ini</p>
        <p className="text-sm mt-2">
          Silakan tambahkan jadwal melalui{" "}
          <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-siswa" className="text-primary font-semibold hover:underline">
            halaman utama
          </Link>
        </p>
      </div>
    )}
  </div>
);

// const EditInfo = () => (
//   <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
//     <p className="text-sm text-blue-800">
//       <strong>💡 Info:</strong> Untuk mengedit jadwal pelajaran siswa ini, silakan kembali ke{" "}
//       <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-siswa" className="font-semibold underline hover:text-blue-900">
//         halaman utama
//       </Link>{" "}
//       dan klik tombol Edit.
//     </p>
//   </div>
// );

/* ========== Helper Components ========== */

const InfoField = ({ label, value }: { label: string; value: any }) => (
  <div>
    <p className="text-sm text-gray-600 font-semibold">{label}</p>
    <p className="text-sm font-bold text-primary">{value || "-"}</p>
  </div>
);

const StatusField = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-sm text-gray-600 font-semibold">{label}</p>
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${value === "aktif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{value || "-"}</span>
  </div>
);
