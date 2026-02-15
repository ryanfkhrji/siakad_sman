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
import type { DataSelectKompetensi, KompetensiCreateFormData } from "@/types/kompetensi";

interface FormErrors {
  kurikulum_id: string[];
  mata_pelajaran_id: string[];
  judul_kompetensi: string[];
  jenis: string[];
  kode: string[];
  tingkat: string[];
  aspek: string[];
  fase: string[];
  deskripsi: string[];
  data: string[];
}

const CreateKompetensi = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectKompetensi | null>(null);
  const [, setSelectedTipe] = useState<string>("");

  const [formData, setFormData] = useState<KompetensiCreateFormData>({
    kurikulum_id: "",
    mata_pelajaran_id: "",
    judul_kompetensi: "",
    jenis: "",
    kode: "",
    tingkat: "",
    aspek: "",
    fase: "",
    deskripsi: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    kurikulum_id: [],
    mata_pelajaran_id: [],
    judul_kompetensi: [],
    jenis: [],
    kode: [],
    tingkat: [],
    aspek: [],
    fase: [],
    deskripsi: [],
    data: [],
  });

  const [loading, setLoading] = useState(false);

  // Fetch data select
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/kompetensi");
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

  // Update tipe kurikulum saat kurikulum dipilih
  const handleKurikulumChange = (value: string) => {
    const kurikulum = selectData?.kurikulum.find((k) => k.kurikulum_id === Number(value));
    setSelectedTipe(kurikulum?.tipe || "");
    setFormData({ ...formData, kurikulum_id: value });
  };

  // Handle jenis change - clear conditional fields
  const handleJenisChange = (value: string) => {
    if (value === "KD") {
      // Reset fase, keep tingkat & aspek
      setFormData({ ...formData, jenis: value as "KD" | "CP", fase: "" });
    } else if (value === "CP") {
      // Reset tingkat & aspek, keep fase
      setFormData({ ...formData, jenis: value as "KD" | "CP", tingkat: "", aspek: "" });
    } else {
      setFormData({ ...formData, jenis: value as "KD" | "CP" });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      kurikulum_id: [],
      mata_pelajaran_id: [],
      judul_kompetensi: [],
      jenis: [],
      kode: [],
      tingkat: [],
      aspek: [],
      fase: [],
      deskripsi: [],
      data: [],
    });

    setLoading(true);

    try {
      // Prepare data sesuai jenis
      const payload: any = {
        kurikulum_id: Number(formData.kurikulum_id),
        mata_pelajaran_id: Number(formData.mata_pelajaran_id),
        judul_kompetensi: formData.judul_kompetensi,
        jenis: formData.jenis,
        kode: formData.kode || null,
        deskripsi: formData.deskripsi,
      };

      if (formData.jenis === "KD") {
        payload.tingkat = formData.tingkat || null;
        payload.aspek = formData.aspek || null;
        payload.fase = null;
      } else if (formData.jenis === "CP") {
        payload.fase = formData.fase || null;
        payload.tingkat = null;
        payload.aspek = null;
      }

      const res = await api.post("/spa/kompetensi", payload);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kompetensi berhasil ditambahkan.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-akademik/kompetensi");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      if (errorStatus === 400 || errorStatus === 422) {
        // Error data khusus
        if (errorData?.errors?.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat membuat data!",
            text: Array.isArray(errorData.errors.data) ? errorData.errors.data[0] : errorData.errors.data,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // Error unique
        if (errorData?.errors?.unique) {
          Swal.fire({
            icon: "warning",
            title: "Data Sudah Ada!",
            text: Array.isArray(errorData.errors.unique) ? errorData.errors.unique[0] : errorData.errors.unique,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // Validation errors
        if (errorData?.errors) {
          setErrors(errorData.errors);
        }

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

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Kompetensi" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Kompetensi</h1>

          <div className="bg-white rounded shadow p-5">
            {loadingSelect ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat form...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
                {/* Kurikulum */}
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Kurikulum <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.kurikulum_id)} onValueChange={handleKurikulumChange}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih kurikulum --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Kurikulum</SelectLabel>
                        {selectData?.kurikulum.map((k) => (
                          <SelectItem key={k.kurikulum_id} value={String(k.kurikulum_id)}>
                            {k.nama_kurikulum} ({k.tipe}) - {k.status}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.kurikulum_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kurikulum_id[0]}</p>}
                </div>

                {/* Mata Pelajaran */}
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.mata_pelajaran_id)} onValueChange={(value) => setFormData({ ...formData, mata_pelajaran_id: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih mata pelajaran --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Mata Pelajaran</SelectLabel>
                        {selectData?.mata_pelajaran.map((m) => (
                          <SelectItem key={m.mata_pelajaran_id} value={String(m.mata_pelajaran_id)}>
                            {m.nama_pelajaran} ({m.kelompok})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.mata_pelajaran_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.mata_pelajaran_id[0]}</p>}
                </div>

                {/* Judul Kompetensi */}
                <div className="mb-6">
                  <label className="block font-semibold">
                    Judul Kompetensi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="contoh: Pemahaman Konsep Aljabar"
                    value={formData.judul_kompetensi}
                    onChange={(e) => setFormData({ ...formData, judul_kompetensi: e.target.value })}
                    className="border p-2 w-full mt-2 rounded"
                  />
                  {errors.judul_kompetensi?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.judul_kompetensi[0]}</p>}
                </div>

                {/* Jenis */}
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Jenis <span className="text-red-500">*</span>
                  </label>

                  <Select value={formData.jenis} onValueChange={handleJenisChange}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih jenis --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Jenis</SelectLabel>
                        <SelectItem value="KD">KD (Kompetensi Dasar - K13)</SelectItem>
                        <SelectItem value="CP">CP (Capaian Pembelajaran - Merdeka)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.jenis?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jenis[0]}</p>}
                </div>

                {/* Kode */}
                <div className="mb-6">
                  <label className="block font-semibold">Kode</label>
                  <input
                    type="text"
                    placeholder={formData.jenis === "KD" ? "contoh: KD-1.1" : formData.jenis === "CP" ? "contoh: CP-MAT-10-E1" : "contoh: KD-1.1 atau CP-MAT-10-E1"}
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    className="border p-2 w-full mt-2 rounded"
                  />
                  {errors.kode?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kode[0]}</p>}
                </div>

                {/* Conditional Fields - KD */}
                {formData.jenis === "KD" && (
                  <>
                    <div className="mb-6">
                      <label className="block font-semibold text-foreground">
                        Tingkat <span className="text-red-500">*</span>
                      </label>

                      <Select value={formData.tingkat} onValueChange={(value) => setFormData({ ...formData, tingkat: value })}>
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="-- pilih tingkat --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Pilih Tingkat</SelectLabel>
                            <SelectItem value="10">Kelas 10</SelectItem>
                            <SelectItem value="11">Kelas 11</SelectItem>
                            <SelectItem value="12">Kelas 12</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {errors.tingkat?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tingkat[0]}</p>}
                    </div>

                    <div className="mb-6">
                      <label className="block font-semibold text-foreground">
                        Aspek <span className="text-red-500">*</span>
                      </label>

                      <Select value={formData.aspek} onValueChange={(value) => setFormData({ ...formData, aspek: value as "" | "sikap" | "pengetahuan" | "keterampilan" })}>
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="-- pilih aspek --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Pilih Aspek</SelectLabel>
                            <SelectItem value="sikap">Sikap</SelectItem>
                            <SelectItem value="pengetahuan">Pengetahuan</SelectItem>
                            <SelectItem value="keterampilan">Keterampilan</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {errors.aspek?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.aspek[0]}</p>}
                    </div>
                  </>
                )}

                {/* Conditional Fields - CP */}
                {formData.jenis === "CP" && (
                  <>
                    <div className="mb-6">
                      <label className="block font-semibold text-foreground">
                        Fase <span className="text-red-500">*</span>
                      </label>

                      <Select value={formData.fase} onValueChange={(value) => setFormData({ ...formData, fase: value as "" | "A" | "B" | "C" | "D" | "E" | "F" })}>
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="-- pilih fase --" />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Pilih Fase</SelectLabel>
                            <SelectItem value="A">Fase A</SelectItem>
                            <SelectItem value="B">Fase B</SelectItem>
                            <SelectItem value="C">Fase C</SelectItem>
                            <SelectItem value="D">Fase D</SelectItem>
                            <SelectItem value="E">Fase E</SelectItem>
                            <SelectItem value="F">Fase F</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>

                      {errors.fase?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.fase[0]}</p>}
                    </div>
                  </>
                )}

                {/* Deskripsi */}
                <div className="mb-6">
                  <label className="block font-semibold">
                    Deskripsi <span className="text-red-500">*</span>
                  </label>
                  <textarea placeholder="Deskripsi kompetensi..." value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="border p-2 w-full mt-2 rounded h-32 resize-none"></textarea>
                  {errors.deskripsi?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.deskripsi[0]}</p>}
                </div>

                {/* Info */}
                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-800">
                  <p className="font-semibold mb-1">ℹ️ Informasi:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Status otomatis akan menjadi <strong>Aktif</strong>
                    </li>
                    <li>
                      Jenis <strong>KD</strong>: Untuk Kurikulum 2013, wajib isi Tingkat dan Aspek
                    </li>
                    <li>
                      Jenis <strong>CP</strong>: Untuk Kurikulum Merdeka, wajib isi Fase
                    </li>
                  </ul>
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/kompetensi">
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

export default CreateKompetensi;
