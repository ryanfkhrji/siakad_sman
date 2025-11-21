import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Loader2Icon, SaveIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import api from "@/api/axios";
import Swal from "sweetalert2";
import type { JadwalPelajaran, JadwalPelajaranSiswa } from "@/types";
import { Select, SelectTrigger, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectValue } from "@/components/ui/select";

const EditJadwalPelajaranSiswa = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [jadwalPelajaranId, setJadwalPelajaranId] = useState("");
  const [currentJadwalId, setCurrentJadwalId] = useState<number | null>(null);

  const [dataSiswa, setDataSiswa] = useState<JadwalPelajaranSiswa | null>(null);
  const [dataJadwal, setDataJadwal] = useState<JadwalPelajaran[]>([]);

  const [errors, setErrors] = useState<{ jadwal_pelajaran_id?: string[] }>({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return;
        setLoadingData(true);

        const resDetail = await api.get(`/spa/siswa/jadwal-pelajaran/${id}`);
        if (resDetail.data.status === "success") {
          const siswaData: JadwalPelajaranSiswa = resDetail.data.data;
          setDataSiswa(siswaData);

          // if (siswaData.jadwal_pelajaran?.length > 0) {
          //   const currentData = siswaData.jadwal_pelajaran[0];
          //   setCurrentJadwalId(currentData.id);
          //   setJadwalPelajaranId(currentData.id.toString());
          // }
        }

        const resJadwal = await api.get("/spa/siswa/jadwal-pelajaran");
        if (resJadwal.data.status === "success") {
          setDataJadwal(resJadwal.data.data);
        }
      } catch (err: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: "Terjadi kesalahan saat mengambil data.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!jadwalPelajaranId) {
      setErrors({ jadwal_pelajaran_id: ["Jadwal pelajaran wajib dipilih"] });
      return;
    }

    if (parseInt(jadwalPelajaranId) === currentJadwalId) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Perubahan",
        text: "Anda belum mengubah jadwal pelajaran.",
      });
      return;
    }

    try {
      setLoading(true);

      const res = await api.put(`/spa/siswa/jadwal-pelajaran/${id}`, {
        jadwal_pelajaran_id: parseInt(jadwalPelajaranId),
      });

      if (res.data.status === "success") {
        await Swal.fire({
          icon: "success",
          title: "Berhasil Mengupdate",
          text: "Jadwal pelajaran siswa berhasil diperbarui!",
        });

        navigate(-1);
      }
    } catch (err: any) {
      const backendErrors = err.response?.data?.errors;
      setErrors(backendErrors || {});

      Swal.fire({
        icon: "error",
        title: "Gagal Mengupdate",
        text: err.response?.data?.message ?? "Terjadi kesalahan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatGuru = (guru: any): string => (Array.isArray(guru) ? guru.map((g) => g.nama).join(", ") : guru ?? "-");

  const formatKelas = (kelas: any): string => (Array.isArray(kelas) ? kelas.map((k) => k.nama_kelas).join(", ") : kelas ?? "-");

  const selectedJadwal = dataJadwal.find((j) => j.id === parseInt(jadwalPelajaranId));

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Jadwal Pelajaran Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8 max-w-3xl">
          <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeftIcon size={16} />
            Kembali
          </Button>

          <h1 className="text-3xl font-bold mb-6">Edit Jadwal Pelajaran Siswa</h1>

          {/* LOADING */}
          {loadingData ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          ) : (
            dataSiswa && (
              <div className="bg-white rounded-lg shadow p-6">
                {/* Info siswa */}
                <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Informasi Siswa</h3>

                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-900">
                    <p>
                      <strong>Nama:</strong> {dataSiswa.nama}
                    </p>
                    <p>
                      <strong>NIS:</strong> {dataSiswa.nis}
                    </p>
                    <p>
                      <strong>NISN:</strong> {dataSiswa.nisn}
                    </p>
                    <p>
                      <strong>Kelas:</strong> {dataSiswa.kelas?.nama_kelas}
                    </p>
                  </div>
                </div>

                {/* FORM */}
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <label className="font-semibold">Ubah Jadwal Pelajaran</label>

                    <Select
                      value={jadwalPelajaranId}
                      onValueChange={(val) => {
                        setJadwalPelajaranId(val);
                        setErrors({});
                      }}
                      disabled={loading}
                    >
                      <SelectTrigger className={`mt-2 ${errors.jadwal_pelajaran_id ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Pilih Jadwal Pelajaran" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Daftar Jadwal</SelectLabel>

                          {dataJadwal.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.mata_pelajaran} — {item.hari} ({item.jam_pelajaran})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    {errors.jadwal_pelajaran_id && <p className="text-red-500 text-sm mt-1">{errors.jadwal_pelajaran_id[0]}</p>}
                  </div>

                  {/* PREVIEW */}
                  {selectedJadwal && parseInt(jadwalPelajaranId) !== currentJadwalId && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Preview Jadwal Baru</h3>

                      <p>
                        <strong>Mapel:</strong> {selectedJadwal.mata_pelajaran}
                      </p>
                      <p>
                        <strong>Hari:</strong> {selectedJadwal.hari}
                      </p>
                      <p>
                        <strong>Jam:</strong> {selectedJadwal.jam_pelajaran}
                      </p>
                      <p>
                        <strong>Kelas:</strong> {formatKelas(selectedJadwal.kelas)}
                      </p>
                      <p>
                        <strong>Guru:</strong> {formatGuru(selectedJadwal.guru)}
                      </p>
                    </div>
                  )}

                  {/* BUTTONS */}
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" type="button" onClick={() => navigate(-1)} disabled={loading}>
                      Batal
                    </Button>

                    <Button type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2Icon className="animate-spin mr-2" size={16} />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <SaveIcon size={16} className="mr-2" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            )
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditJadwalPelajaranSiswa;
