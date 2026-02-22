import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, Save, Loader2Icon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { DataSelectJadwalPelajaran, Hari, JadwalPelajaranEditFormData, KurikulumMataPelajaranForSelect, RombelForSelectJadwal } from "@/types/jadwalPelajaranGuru";
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
  arsip: string[];
}

const EditJadwalPelajaran = () => {
  const { id } = useParams(); // jadwal_pelajaran_id
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [formData, setFormData] = useState<JadwalPelajaranEditFormData>({
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
    arsip: [],
  });

  const [loading, setLoading] = useState(false);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectJadwalPelajaran | null>(null);

  useEffect(() => {
    if (!id) {
      navigate("/superadmin/informasi-akademik/jadwal-pelajaran-guru");
      return;
    }

    const fetchData = async () => {
      try {
        setLoadingSelect(true);

        const [indexRes, selectRes] = await Promise.all([api.get("/spa/jadwal-pelajaran"), api.get("/spa/data-select/jadwal-pelajaran")]);

        let selectDataLoaded: DataSelectJadwalPelajaran | null = null;

        if (selectRes.data.status === "success") {
          selectDataLoaded = selectRes.data.data;
          setSelectData(selectDataLoaded);
        }

        if (indexRes.data.status === "success") {
          const flattened: any[] = [];

          indexRes.data.data.forEach((tahun: any) => {
            tahun.semesters.forEach((semester: any) => {
              semester.gurus.forEach((guru: any) => {
                guru.jadwals.forEach((jadwal: any) => {
                  flattened.push({
                    ...jadwal,
                    guru_id: guru.guru_id,
                  });
                });
              });
            });
          });

          const selected = flattened.find((item) => item.jadwal_pelajaran_id == id);

          if (!selected) throw new Error("Not found");

          // Match kurikulum_mata_pelajaran_id dari nama mata pelajaran
          const matchedKurmap = selectDataLoaded?.kurikulum_mata_pelajaran.find((k) => k.mata_pelajaran === selected.mata_pelajaran);

          // Match rombel_id dari nama rombel
          const matchedRombel = selectDataLoaded?.rombel.find((r) => r.nama_rombel === selected.rombel);

          // Match ruangan_id dari nama ruangan
          const matchedRuangan = selectDataLoaded?.ruangan.find((r) => r.nama_ruangan === selected.ruangan);

          setFormData({
            kurikulum_mata_pelajaran_id: matchedKurmap ? String(matchedKurmap.kurikulum_mata_pelajaran_id) : "",
            hari: selected.hari,
            guru_id: String(selected.guru_id),
            rombel_id: matchedRombel ? String(matchedRombel.rombel_id) : "",
            jam_mulai: selected.jam_mulai,
            jam_selesai: selected.jam_selesai,
            ruangan_id: matchedRuangan ? String(matchedRuangan.ruangan_id) : "",
            link_opsional: selected.link_opsional || "",
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: error.response?.data?.message || "Jadwal pelajaran tidak ditemukan",
        });
        navigate("/superadmin/informasi-akademik/jadwal-pelajaran-guru");
      } finally {
        setLoadingSelect(false);
      }
    };

    fetchData();
  }, [id]);

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
      arsip: [],
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

      const res = await api.put(`/spa/jadwal-pelajaran/${id}`, body);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Jadwal pelajaran berhasil diperbarui.",
          timer: 1800,
          showConfirmButton: false,
        });
        navigate("/superadmin/informasi-akademik/jadwal-pelajaran-guru");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      if (errorStatus === 422) {
        // Semester arsip (message "Not supported" atau includes "arsip")
        if (errorData?.errors?.data || errorData?.message?.includes("arsip") || errorData?.message === "Not supported") {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah!",
            text: errorData.errors?.data?.[0] || "Jadwal pelajaran sudah berstatus arsip",
          });
          setLoading(false);
          return;
        }

        // Bentrok jadwal guru
        if (errorData?.errors?.guru || errorData?.message === "Bentrok") {
          Swal.fire({
            icon: "warning",
            title: "Bentrok Jadwal Guru!",
            text: errorData.errors?.guru?.[0] || "Guru sudah memiliki jadwal pada jam tersebut",
          });
          setLoading(false);
          return;
        }

        // Bentrok jadwal rombel
        if (errorData?.errors?.rombel) {
          Swal.fire({
            icon: "warning",
            title: "Bentrok Jadwal Rombel!",
            text: errorData.errors.rombel[0] || "Rombel sudah memiliki jadwal pada jam tersebut",
          });
          setLoading(false);
          return;
        }

        // Duplikasi jadwal
        if (errorData?.errors?.jadwal || errorData?.message === "Duplikasi") {
          Swal.fire({
            icon: "warning",
            title: "Jadwal Sudah Ada!",
            text: errorData.errors?.jadwal?.[0] || "Jadwal dengan data yang sama sudah ada",
          });
          setLoading(false);
          return;
        }

        // Validation errors biasa
        if (errorData?.errors) {
          setErrors({ ...errors, ...errorData.errors });

          Swal.fire({
            icon: "error",
            title: "Validasi Gagal!",
            text: "Periksa kembali inputan Anda.",
          });
        }
        setLoading(false);
        return;
      }

      if (errorStatus === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: errorData?.message || "Jadwal pelajaran tidak ditemukan",
        });
        setLoading(false);
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: errorData?.message || "Tidak dapat terhubung ke server.",
      });
      setLoading(false);
    }
  };

  if (loadingSelect) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <PageTitle title="Edit Jadwal Pelajaran Guru" />
          <div className="mx-auto p-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center h-64">
              <Loader2Icon className="animate-spin mb-3" size={32} />
              <p className="text-gray-600">Memuat data...</p>
            </div>
          </div>
          <Footer />
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Jadwal Pelajaran Guru" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Jadwal Pelajaran Guru</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
              {/* Kurikulum Mata Pelajaran */}
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

              {/* Rombel */}
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

                <Select value={String(formData.ruangan_id || undefined)} onValueChange={(v) => setFormData({ ...formData, ruangan_id: v })}>
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
                  <li>Semua field dapat diubah kecuali tahun akademik dan semester</li>
                  <li>Sistem akan mengecek bentrok jadwal untuk guru dan rombel</li>
                  <li>Hanya dapat diubah jika semester masih aktif</li>
                </ul>
              </div>

              {/* Tombol */}
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
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditJadwalPelajaran;
