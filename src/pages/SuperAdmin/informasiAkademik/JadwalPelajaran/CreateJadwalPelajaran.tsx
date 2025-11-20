import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Pegawai, MataPelajaran, Kelas } from "@/types";

interface FormErrors {
  mata_pelajaran_id?: string[];
  hari?: string[];
  guru_id?: string[];
  kelas_id?: string[];
  jam_pelajaran?: string[];
  ruangan?: string[];
  link_opsional?: string[];
}

const CreateJadwalPelajaran = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [guruList, setGuruList] = useState<Pegawai[]>([]);
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  const [formData, setFormData] = useState<{
    mata_pelajaran_id: number | null;
    hari: string;
    guru_id: number | null;
    kelas_id: number | null;
    jam_pelajaran: string;
    ruangan: string;
    link_opsional: string;
  }>({
    mata_pelajaran_id: null,
    hari: "",
    guru_id: null,
    kelas_id: null,
    jam_pelajaran: "",
    ruangan: "",
    link_opsional: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Daftar hari
  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // Ambil data mata pelajaran, guru, dan kelas dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch mata pelajaran
        const resMatpel = await api.get("/spa/mata-pelajaran");
        if (resMatpel.data.status === "success") {
          setMataPelajaranList(resMatpel.data.data);
        }

        // Fetch guru
        const resGuru = await api.get("/spa/kepegawaian");
        if (resGuru.data.status === "success") {
          const guruOnly = resGuru.data.data.filter((p: Pegawai) => p.role === "guru");
          setGuruList(guruOnly);
        }

        // Fetch kelas
        const resKelas = await api.get("/spa/kelas");
        if (resKelas.data.status === "success") {
          setKelasList(resKelas.data.data);
        }
      } catch {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data",
          text: "Terjadi kesalahan koneksi ke server.",
        });
      }
    };

    fetchData();
  }, []);

  // Handle submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Validasi input di frontend
    const newErrors: FormErrors = {};

    if (!formData.mata_pelajaran_id) {
      newErrors.mata_pelajaran_id = ["Mata pelajaran wajib dipilih"];
    }

    if (!formData.hari.trim()) {
      newErrors.hari = ["Hari wajib dipilih"];
    }

    if (!formData.guru_id) {
      newErrors.guru_id = ["Guru wajib dipilih"];
    }

    if (!formData.kelas_id) {
      newErrors.kelas_id = ["Kelas wajib dipilih"];
    }

    if (!formData.jam_pelajaran.trim()) {
      newErrors.jam_pelajaran = ["Jam pelajaran wajib diisi"];
    }

    // Kalau ada error, tampilkan pesan dan hentikan submit
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);

      Swal.fire({
        icon: "warning",
        title: "Validasi Gagal!",
        text: "Field inputan harus diisi.",
        confirmButtonColor: "#EAB308",
      });

      return;
    }

    try {
      const res = await api.post("/spa/jadwal-pelajaran", formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Jadwal pelajaran berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-akademik/jadwal-pelajaran");
      } else if (res.data.status === "error" && res.data.errors) {
        setErrors(res.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat menyimpan jadwal pelajaran.",
        });
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: error.response?.data?.message || "Tidak dapat terhubung ke server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Tambah Jadwal Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Jadwal Pelajaran</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* Mata Pelajaran */}
              <div className="mb-6">
                <label htmlFor="mata_pelajaran_id" className="block font-semibold text-foreground">
                  Mata Pelajaran
                </label>
                <Select onValueChange={(value) => setFormData({ ...formData, mata_pelajaran_id: Number(value) })} value={formData.mata_pelajaran_id?.toString() || ""}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Pilih Mata Pelajaran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Mata Pelajaran</SelectLabel>
                      {mataPelajaranList.length > 0 ? (
                        mataPelajaranList.map((matpel) => (
                          <SelectItem key={matpel.id} value={matpel.id.toString()}>
                            {matpel.nama_pelajaran}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-muted-foreground p-2 text-sm">Tidak ada mata pelajaran</div>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.mata_pelajaran_id && <p className="text-red-500 text-sm mt-1">{errors.mata_pelajaran_id[0]}</p>}
              </div>

              {/* Hari */}
              <div className="mb-6">
                <label htmlFor="hari" className="block font-semibold text-foreground">
                  Hari
                </label>
                <Select onValueChange={(value) => setFormData({ ...formData, hari: value })} value={formData.hari}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Pilih Hari" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Hari</SelectLabel>
                      {hariList.map((hari) => (
                        <SelectItem key={hari} value={hari}>
                          {hari}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.hari && <p className="text-red-500 text-sm mt-1">{errors.hari[0]}</p>}
              </div>

              {/* Guru */}
              <div className="mb-6">
                <label htmlFor="guru_id" className="block font-semibold text-foreground">
                  Guru Pengajar
                </label>
                <Select onValueChange={(value) => setFormData({ ...formData, guru_id: Number(value) })} value={formData.guru_id?.toString() || ""}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Pilih Guru" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Guru</SelectLabel>
                      {guruList.length > 0 ? (
                        guruList.map((guru) => (
                          <SelectItem key={guru.id} value={guru.id.toString()}>
                            {guru.nama}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-muted-foreground p-2 text-sm">Tidak ada guru tersedia</div>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.guru_id && <p className="text-red-500 text-sm mt-1">{errors.guru_id[0]}</p>}
              </div>

              {/* Kelas */}
              <div className="mb-6">
                <label htmlFor="kelas_id" className="block font-semibold text-foreground">
                  Kelas
                </label>
                <Select onValueChange={(value) => setFormData({ ...formData, kelas_id: Number(value) })} value={formData.kelas_id?.toString() || ""}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Daftar Kelas</SelectLabel>
                      {kelasList.length > 0 ? (
                        kelasList.map((kelas) => (
                          <SelectItem key={kelas.id} value={kelas.id.toString()}>
                            {kelas.nama_kelas}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="text-muted-foreground p-2 text-sm">Tidak ada kelas tersedia</div>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.kelas_id && <p className="text-red-500 text-sm mt-1">{errors.kelas_id[0]}</p>}
              </div>

              {/* Jam Pelajaran */}
              <div className="mb-6">
                <label htmlFor="jam_pelajaran" className="block font-semibold text-foreground">
                  Jam Pelajaran
                </label>
                <input type="time" name="jam_pelajaran" value={formData.jam_pelajaran} onChange={(e) => setFormData({ ...formData, jam_pelajaran: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.jam_pelajaran && <p className="text-red-500 text-sm mt-1">{errors.jam_pelajaran[0]}</p>}
              </div>

              {/* Ruangan */}
              <div className="mb-6">
                <label htmlFor="ruangan" className="block font-semibold text-foreground">
                  Ruangan
                </label>
                <input type="text" name="ruangan" placeholder="cth: Lab Komputer" value={formData.ruangan} onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.ruangan && <p className="text-red-500 text-sm mt-1">{errors.ruangan[0]}</p>}
              </div>

              {/* Link Opsional */}
              <div className="mb-6">
                <label htmlFor="link_opsional" className="block font-semibold text-foreground">
                  Link Opsional
                </label>
                <input
                  type="text"
                  name="link_opsional"
                  placeholder="cth: www.youtube.com"
                  value={formData.link_opsional}
                  onChange={(e) => setFormData({ ...formData, link_opsional: e.target.value })}
                  className="border p-2 w-full mt-2 rounded"
                />
                {errors.link_opsional && <p className="text-red-500 text-sm mt-1">{errors.link_opsional[0]}</p>}
              </div>

              {/* Tombol Aksi */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
                <Link to="/superadmin/informasi-akademik/jadwal-pelajaran">
                  <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                    <CircleXIcon size={18} />
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </div>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateJadwalPelajaran;
