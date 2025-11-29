import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Siswa } from "@/types";

interface Jurusan {
  id: number;
  nama_jurusan: string;
}

interface FormErrors {
  siswa_id: string[];
  kelas_id: string[];
  jurusan_id: string[];
  prestasi_diraih: string[];
}

const CreatePrestasiSiswa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [dataSiswa, setDataSiswa] = useState<Siswa[]>([]);
  const [dataJurusan, setDataJurusan] = useState<Jurusan[]>([]);
  const [loadingSiswa, setLoadingSiswa] = useState(true);

  const [formData, setFormData] = useState({
    siswa_id: "",
    kelas_id: "",
    jurusan_id: "",
    prestasi_diraih: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    siswa_id: [],
    kelas_id: [],
    jurusan_id: [],
    prestasi_diraih: [],
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // FETCH SISWA
  useEffect(() => {
    const fetchSiswa = async () => {
      try {
        setLoadingSiswa(true);
        const res = await api.get("/spa/siswa");

        if (res.data.status === "success") {
          setDataSiswa(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat siswa!",
          text: error.response?.data?.message || "Tidak dapat memuat data siswa",
        });
      } finally {
        setLoadingSiswa(false);
      }
    };

    fetchSiswa();
  }, []);

  // FETCH MASTER JURUSAN
  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        const res = await api.get("/spa/jurusan");

        if (res.data.status === "success") {
          setDataJurusan(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat jurusan!",
          text: error.response?.data?.message || "Tidak dapat memuat data jurusan",
        });
      }
    };

    fetchJurusan();
  }, []);

  // HANDLE: ketika siswa dipilih
  const handleSiswaChange = (siswaId: string) => {
    const siswa = dataSiswa.find((s) => s.id.toString() === siswaId);
    if (!siswa) return;

    // Ambil kelas_id dari object / string / null
    const kelas_id = typeof siswa.kelas === "object" && siswa.kelas !== null ? siswa.kelas.id.toString() : typeof siswa.kelas === "string" ? siswa.kelas : "";

    // Ambil jurusan_id dari master jurusan berdasarkan nama_jurusan
    const jurusan = siswa.nama_jurusan && dataJurusan.find((j) => j.nama_jurusan === siswa.nama_jurusan);

    const jurusan_id = jurusan ? jurusan.id.toString() : "";

    setFormData({
      ...formData,
      siswa_id: siswaId,
      kelas_id: kelas_id,
      jurusan_id: jurusan_id,
    });
  };

  // HANDLE SUBMIT
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      siswa_id: [],
      kelas_id: [],
      jurusan_id: [],
      prestasi_diraih: [],
    });

    setLoading(true);

    try {
      const res = await api.post("/spa/prestasi", formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Prestasi siswa berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-akademik/prestasi-siswa");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response?.data?.message || "Tidak dapat terhubung ke server.",
      });
    }

    setLoading(false);
  };

  // DISPLAY kelas & jurusan
  const siswaSelected = dataSiswa.find((s) => s.id.toString() === formData.siswa_id);

  const namaKelas = typeof siswaSelected?.kelas === "object" ? siswaSelected.kelas?.nama_kelas : typeof siswaSelected?.kelas === "string" ? siswaSelected.kelas : "-";

  const namaJurusan = siswaSelected?.nama_jurusan ?? "-";

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Prestasi Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Prestasi Siswa</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              {/* PILIH SISWA */}
              <div className="space-y-2">
                <label className="block font-semibold">Pilih Siswa *</label>

                {loadingSiswa ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2Icon className="animate-spin" size={18} />
                    Memuat siswa...
                  </div>
                ) : (
                  <Select value={formData.siswa_id} onValueChange={handleSiswaChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Siswa --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Siswa</SelectLabel>
                        {dataSiswa.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.nama}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}

                {errors.siswa_id?.length > 0 && <p className="text-red-500 text-sm">{errors.siswa_id[0]}</p>}
              </div>

              {/* KELAS */}
              <div className="space-y-2">
                <label className="block font-semibold">Kelas</label>
                <input type="text" value={namaKelas as string | undefined} readOnly className="border p-2 w-full rounded bg-gray-50 text-gray-600" />
                {errors.kelas_id?.length > 0 && <p className="text-red-500 text-sm">{errors.kelas_id[0]}</p>}
              </div>

              {/* JURUSAN */}
              <div className="space-y-2">
                <label className="block font-semibold">Jurusan</label>
                <input type="text" value={namaJurusan} readOnly className="border p-2 w-full rounded bg-gray-50 text-gray-600" />
                {errors.jurusan_id?.length > 0 && <p className="text-red-500 text-sm">{errors.jurusan_id[0]}</p>}
              </div>

              {/* PRESTASI */}
              <div className="space-y-2">
                <label className="block font-semibold">Prestasi Diraih *</label>
                <textarea
                  value={formData.prestasi_diraih}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      prestasi_diraih: e.target.value,
                    })
                  }
                  className="border p-2 w-full rounded h-32"
                  placeholder="Contoh: Juara 1 Lomba Matematika Nasional"
                ></textarea>

                {errors.prestasi_diraih?.length > 0 && <p className="text-red-500 text-sm">{errors.prestasi_diraih[0]}</p>}
              </div>

              {/* BUTTON */}
              <div className="flex gap-2">
                <Button disabled={loading} type="submit" className="flex gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>

                <Link to="/superadmin/informasi-akademik/prestasi-siswa">
                  <Button className="bg-muted-foreground flex gap-2">
                    <CircleXIcon size={18} /> Batal
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

export default CreatePrestasiSiswa;
