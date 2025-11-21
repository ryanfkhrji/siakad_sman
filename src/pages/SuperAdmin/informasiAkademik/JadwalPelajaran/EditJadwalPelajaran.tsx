import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, Loader2Icon, Save } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { Pegawai, MataPelajaran, Kelas } from "@/types";

interface FormErrors {
  mata_pelajaran_id?: string[];
  hari?: string[];
  kelas_id?: string[];
  jam_pelajaran?: string[];
  ruangan?: string[];
  link_opsional?: string[];
}

const EditJadwalPelajaran = () => {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [guruList, setGuruList] = useState<Pegawai[]>([]);
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);

  // formData: jangan simpan guru_id di sini (readonly di state terpisah)
  const [formData, setFormData] = useState({
    mata_pelajaran_id: "",
    hari: "",
    kelas_id: "",
    jam_pelajaran: "",
    ruangan: "",
    link_opsional: "",
  });

  // simpan guru id terpisah untuk tampilan readonly
  const [guruIdReadOnly, setGuruIdReadOnly] = useState<string>("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  // =====================================================
  // LOAD DATA
  // =====================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // 1. Load semua list dulu
        const [resMatpel, resGuru, resKelas] = await Promise.all([api.get("/spa/mata-pelajaran"), api.get("/spa/kepegawaian"), api.get("/spa/kelas")]);

        let matpelData: MataPelajaran[] = [];
        let guruData: Pegawai[] = [];
        let kelasData: Kelas[] = [];

        // === SET LIST ===
        if (resMatpel.data.status === "success") {
          matpelData = resMatpel.data.data;
          setMataPelajaranList(matpelData);
        }

        if (resKelas.data.status === "success") {
          kelasData = resKelas.data.data;
          setKelasList(kelasData);
        }

        if (resGuru.data.status === "success") {
          guruData = resGuru.data.data.filter((p: Pegawai) => p.role === "guru");
          setGuruList(guruData);
        }

        // 2. Load detail dan mapping ID
        const resDetail = await api.get(`/spa/jadwal-pelajaran/${id}`);

        // === SET DETAIL FORM ===
        if (resDetail.data.status === "success") {
          const d = resDetail.data.data;

          // map id — API bisa mengembalikan id langsung atau nama, handle keduanya
          const matpelId = d.mata_pelajaran_id ? String(d.mata_pelajaran_id) : matpelData.find((m) => m.nama_pelajaran === d.mata_pelajaran)?.id?.toString() ?? "";

          const guruId = d.guru_id ? String(d.guru_id) : guruData.find((g) => g.nama === d.guru)?.id?.toString() ?? "";

          const kelasId = d.kelas_id ? String(d.kelas_id) : kelasData.find((k) => k.nama_kelas === d.kelas)?.id?.toString() ?? "";

          setFormData((prev) => ({
            ...prev,
            mata_pelajaran_id: matpelId,
            hari: d.hari ?? "",
            kelas_id: kelasId,
            jam_pelajaran: d.jam_pelajaran ?? "",
            ruangan: d.ruangan ?? "",
            link_opsional: d.link_opsional ?? "",
          }));

          // simpan guru id di state terpisah (readonly display only)
          setGuruIdReadOnly(guruId);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Gagal memuat data dari server.", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // =====================================================
  // SUBMIT
  // =====================================================
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors: FormErrors = {};

    if (!formData.mata_pelajaran_id) newErrors.mata_pelajaran_id = ["Mata pelajaran wajib dipilih"];
    if (!formData.hari) newErrors.hari = ["Hari wajib dipilih"];
    if (!formData.kelas_id) newErrors.kelas_id = ["Kelas wajib dipilih"];
    if (!formData.jam_pelajaran) newErrors.jam_pelajaran = ["Jam pelajaran wajib diisi"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      Swal.fire("Validasi gagal!", "Field inputan harus diisi.", "warning");
      return;
    }

    // Sesuaikan nama field payload dengan backend Laravel (id_mata_pelajaran, id_kelas)
    const payload = {
      mata_pelajaran_id: Number(formData.mata_pelajaran_id),
      kelas_id: Number(formData.kelas_id),
      hari: formData.hari,
      jam_pelajaran: formData.jam_pelajaran,
      ruangan: formData.ruangan,
      link_opsional: formData.link_opsional,
    } as const;

    try {
      const res = await api.put(`/spa/jadwal-pelajaran/${id}`, payload);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: res.data.message,
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-akademik/jadwal-pelajaran-guru");
      } else {
        setErrors(res.data.errors || {});
      }
    } catch (err: any) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Gagal menyimpan.", "error");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================
  const selectedGuru = guruList.find((g) => g.id.toString() === guruIdReadOnly);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Jadwal Pelajaran Guru" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Jadwal Pelajaran Guru</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* MATA PELAJARAN */}
                <div>
                  <label className="block font-semibold">Mata Pelajaran</label>
                  <Select key={mataPelajaranList.length} value={formData.mata_pelajaran_id} onValueChange={(v) => setFormData({ ...formData, mata_pelajaran_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Pilih Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Mata Pelajaran</SelectLabel>
                        {mataPelajaranList.map((matpel) => (
                          <SelectItem key={matpel.id} value={matpel.id.toString()}>
                            {matpel.nama_pelajaran}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.mata_pelajaran_id && <p className="text-red-500 text-sm mt-1">{errors.mata_pelajaran_id[0]}</p>}
                </div>

                {/* HARI */}
                <div>
                  <label className="block font-semibold">Hari</label>
                  <Select value={formData.hari} onValueChange={(v) => setFormData({ ...formData, hari: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Pilih Hari" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Hari</SelectLabel>
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

                {/* GURU (READONLY) */}
                <div>
                  <label className="block font-semibold">Guru</label>
                  <input type="text" value={selectedGuru?.nama ?? "-"} readOnly disabled className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
                  <p className="text-sm text-muted-foreground mt-1">Guru tidak dapat diubah</p>
                </div>

                {/* KELAS */}
                <div>
                  <label className="block font-semibold">Kelas</label>
                  <Select key={kelasList.length} value={formData.kelas_id} onValueChange={(v) => setFormData({ ...formData, kelas_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Kelas</SelectLabel>
                        {kelasList.map((kelas) => (
                          <SelectItem key={kelas.id} value={kelas.id.toString()}>
                            {kelas.nama_kelas}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.kelas_id && <p className="text-red-500 text-sm mt-1">{errors.kelas_id[0]}</p>}
                </div>

                {/* JAM PELAJARAN */}
                <div>
                  <label className="block font-semibold">Jam Pelajaran</label>
                  <input type="time" value={formData.jam_pelajaran} onChange={(e) => setFormData({ ...formData, jam_pelajaran: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.jam_pelajaran && <p className="text-red-500 text-sm mt-1">{errors.jam_pelajaran[0]}</p>}
                </div>

                {/* RUANGAN */}
                <div>
                  <label className="block font-semibold">Ruangan</label>
                  <input type="text" value={formData.ruangan} onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.ruangan && <p className="text-red-500 text-sm mt-1">{errors.ruangan[0]}</p>}
                </div>

                {/* LINK OPSIONAL */}
                <div>
                  <label className="block font-semibold">Link Opsional</label>
                  <input type="text" value={formData.link_opsional} onChange={(e) => setFormData({ ...formData, link_opsional: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.link_opsional && <p className="text-red-500 text-sm mt-1">{errors.link_opsional[0]}</p>}
                </div>

                {/* BUTTON */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <Save size={18} />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>

                  <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-guru">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon size={18} />
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditJadwalPelajaran;
