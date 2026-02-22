import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { DataSelectJadwalPelajaran, Hari, JadwalPelajaranCreateFormData, KurikulumMataPelajaranForSelect, RombelForSelectJadwal } from "@/types/jadwalPelajaranGuru";
import { HARI_OPTIONS } from "@/types/jadwalPelajaranGuru";

interface FormErrors {
  kurikulum_mata_pelajaran_id: string[];
  hari: string[];
  guru_id: string[];
  rombel_id: string[];
  jam_mulai: string[];
  jam_selesai: string[];
  ruangan_id: string[];
  link_opsional: string[];
  guru: string[];
  rombel: string[];
  data: string[];
}

const CreateJadwalPelajaran = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState<JadwalPelajaranCreateFormData>({
    kurikulum_mata_pelajaran_id: "",
    hari: "",
    guru_id: "",
    rombel_id: "",
    jam_mulai: "",
    jam_selesai: "",
    ruangan_id: "",
    link_opsional: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    kurikulum_mata_pelajaran_id: [],
    hari: [],
    guru_id: [],
    rombel_id: [],
    jam_mulai: [],
    jam_selesai: [],
    ruangan_id: [],
    link_opsional: [],
    guru: [],
    rombel: [],
    data: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectJadwalPelajaran | null>(null);

  // Fetch data select — endpoint: /spa/data-select/jadwal-pelajaran
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/jadwal-pelajaran");
        if (res.data.status === "success") {
          setSelectData(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data untuk form.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };

    fetchSelectData();
  }, []);

  // Group kurikulum_mata_pelajaran by tingkat
  const kurmapGrouped = (selectData?.kurikulum_mata_pelajaran ?? []).reduce<Record<number, KurikulumMataPelajaranForSelect[]>>((acc, kurmap) => {
    const t = kurmap.tingkat;
    if (!acc[t]) acc[t] = [];
    acc[t].push(kurmap);
    return acc;
  }, {});

  // Group rombel by tingkat
  const rombelGrouped = (selectData?.rombel ?? []).reduce<Record<number, RombelForSelectJadwal[]>>((acc, rombel) => {
    const t = rombel.tingkat;
    if (!acc[t]) acc[t] = [];
    acc[t].push(rombel);
    return acc;
  }, {});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({
      kurikulum_mata_pelajaran_id: [],
      hari: [],
      guru_id: [],
      rombel_id: [],
      jam_mulai: [],
      jam_selesai: [],
      ruangan_id: [],
      link_opsional: [],
      guru: [],
      rombel: [],
      data: [],
    });
    setLoading(true);

    try {
      // Body sesuai backend
      const body = {
        kurikulum_mata_pelajaran_id: Number(formData.kurikulum_mata_pelajaran_id),
        hari: formData.hari,
        guru_id: Number(formData.guru_id),
        rombel_id: Number(formData.rombel_id),
        jam_mulai: formData.jam_mulai,
        jam_selesai: formData.jam_selesai,
        ruangan_id: formData.ruangan_id ? Number(formData.ruangan_id) : null,
        link_opsional: formData.link_opsional || null,
      };

      const res = await api.post("/spa/jadwal-pelajaran", body);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Jadwal pelajaran berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate("/superadmin/informasi-akademik/jadwal-pelajaran-guru");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // Handle 400 - Not found (tahun akademik/semester tidak aktif)
      if (errorStatus === 400) {
        const errorMessage = errorData?.errors?.data?.[0] || errorData?.message || "Belum ada tahun akademik atau semester aktif";

        Swal.fire({
          icon: "warning",
          title: "Tidak dapat membuat jadwal!",
          text: errorMessage,
        });
        setLoading(false);
        return;
      }

      // Handle 422 - Validation atau bentrok
      if (errorStatus === 422) {
        // Bentrok jadwal guru
        if (errorData?.errors?.guru || errorData?.message === "Bentrok") {
          Swal.fire({
            icon: "warning",
            title: "Bentrok Jadwal Guru!",
            text: errorData.errors?.guru?.[0] || "Guru sudah memiliki jadwal di jam tersebut",
          });
          setLoading(false);
          return;
        }

        // Bentrok jadwal rombel
        if (errorData?.errors?.rombel) {
          Swal.fire({
            icon: "warning",
            title: "Bentrok Jadwal Rombel!",
            text: errorData.errors.rombel[0] || "Rombel sudah memiliki jadwal di jam tersebut",
          });
          setLoading(false);
          return;
        }

        // Validation errors biasa (field kosong/salah format)
        if (errorData?.errors) {
          setErrors({ ...errors, ...errorData.errors });

          Swal.fire({
            icon: "error",
            title: "Validasi Gagal!",
            text: "Periksa kembali inputan Anda.",
          });
          setLoading(false);
          return;
        }
      }

      // Handle 409 - Duplikasi
      if (errorStatus === 409) {
        Swal.fire({
          icon: "warning",
          title: "Jadwal Sudah Ada!",
          text: errorData?.errors?.database || "Jadwal dengan data yang sama sudah ada dalam sistem",
        });
        setLoading(false);
        return;
      }

      // Error lainnya (500, network error, dll)
      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: errorData?.message || "Tidak dapat terhubung ke server.",
      });
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Jadwal Pelajaran Guru" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Jadwal Pelajaran Guru</h1>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
                {/* Kurikulum Mata Pelajaran — grouped by tingkat */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.kurikulum_mata_pelajaran_id)} onValueChange={(v) => setFormData({ ...formData, kurikulum_mata_pelajaran_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih mata pelajaran --" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {Object.entries(kurmapGrouped)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([tingkat, kurmaps]) => (
                          <SelectGroup key={tingkat}>
                            <SelectLabel className="font-bold text-primary">Tingkat {tingkat}</SelectLabel>
                            {kurmaps.map((kurmap) => (
                              <SelectItem key={kurmap.kurikulum_mata_pelajaran_id} value={String(kurmap.kurikulum_mata_pelajaran_id)}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{kurmap.mata_pelajaran}</span>
                                  <span className="text-xs">
                                    {kurmap.kurikulum} • {kurmap.status_mata_pelajaran}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                    </SelectContent>
                  </Select>

                  {errors.kurikulum_mata_pelajaran_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kurikulum_mata_pelajaran_id[0]}</p>}
                </div>

                {/* Hari */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Hari <span className="text-red-500">*</span>
                  </label>

                  <Select value={formData.hari} onValueChange={(v) => setFormData({ ...formData, hari: v as Hari })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih hari --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Hari</SelectLabel>
                        {HARI_OPTIONS.map((hari) => (
                          <SelectItem key={hari} value={hari}>
                            {hari}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.hari?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.hari[0]}</p>}
                </div>

                {/* Guru */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Guru Pengajar <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.guru_id)} onValueChange={(v) => setFormData({ ...formData, guru_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih guru --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Guru Aktif</SelectLabel>
                        {selectData?.guru.map((guru) => (
                          <SelectItem key={guru.guru_id} value={String(guru.guru_id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{guru.nama_guru}</span>
                              <span className="text-xs">
                                NIP: {guru.nip || "-"} • NUPTK: {guru.nuptk || "-"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.guru_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.guru_id[0]}</p>}
                </div>

                {/* Rombel — grouped by tingkat */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Rombel <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.rombel_id)} onValueChange={(v) => setFormData({ ...formData, rombel_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih rombel --" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(rombelGrouped)
                        .sort(([a], [b]) => Number(a) - Number(b))
                        .map(([tingkat, rombels]) => (
                          <SelectGroup key={tingkat}>
                            <SelectLabel className="font-bold text-primary">Tingkat {tingkat}</SelectLabel>
                            {rombels.map((rombel) => (
                              <SelectItem key={rombel.rombel_id} value={String(rombel.rombel_id)}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{rombel.nama_rombel}</span>
                                  <span className="text-xs">
                                    Kelas {rombel.kelas} • {rombel.jurusan || "Tanpa Jurusan"}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                    </SelectContent>
                  </Select>

                  {errors.rombel_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.rombel_id[0]}</p>}
                </div>

                {/* Jam Mulai */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Jam Mulai <span className="text-red-500">*</span>
                  </label>
                  <Input type="time" className="w-full mt-2" value={formData.jam_mulai} onChange={(e) => setFormData({ ...formData, jam_mulai: e.target.value })} />
                  {errors.jam_mulai?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jam_mulai[0]}</p>}
                </div>

                {/* Jam Selesai */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Jam Selesai <span className="text-red-500">*</span>
                  </label>
                  <Input type="time" className="w-full mt-2" value={formData.jam_selesai} onChange={(e) => setFormData({ ...formData, jam_selesai: e.target.value })} />
                  {errors.jam_selesai?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jam_selesai[0]}</p>}
                </div>

                {/* Ruangan */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Ruangan <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                  </label>

                  <Select value={String(formData.ruangan_id)} onValueChange={(v) => setFormData({ ...formData, ruangan_id: v })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih ruangan --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Daftar Ruangan Aktif</SelectLabel>
                        {selectData?.ruangan.map((ruangan) => (
                          <SelectItem key={ruangan.ruangan_id} value={String(ruangan.ruangan_id)}>
                            <div className="flex flex-col">
                              <span className="font-medium">{ruangan.nama_ruangan}</span>
                              <span className="text-xs">
                                Kode: {ruangan.kode_ruangan} • {ruangan.jenis_ruangan || "-"}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.ruangan_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.ruangan_id[0]}</p>}
                </div>

                {/* Link Opsional */}
                <div>
                  <label className="block font-semibold text-foreground">
                    Link Pembelajaran <span className="text-gray-400 text-sm font-normal">(opsional)</span>
                  </label>
                  <Input type="text" placeholder="cth: www.youtube.com" className="w-full mt-2" value={formData.link_opsional} onChange={(e) => setFormData({ ...formData, link_opsional: e.target.value })} />
                  {errors.link_opsional?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.link_opsional[0]}</p>}
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Jadwal akan ditambahkan untuk tahun akademik dan semester yang sedang <strong>Aktif</strong>
                    </li>
                    <li>Sistem akan mengecek bentrok jadwal untuk guru dan rombel</li>
                    <li>Pastikan jam selesai lebih besar dari jam mulai</li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-guru">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon size={18} />
                      Batal
                    </Button>
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateJadwalPelajaran;
