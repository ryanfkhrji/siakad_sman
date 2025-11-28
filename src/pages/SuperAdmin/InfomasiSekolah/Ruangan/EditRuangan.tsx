import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import Footer from "@/pages/Footer";
import { CircleXIcon, Save, Loader2Icon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  gedung_id?: string[];
  kode_ruangan?: string[];
  nama_ruangan?: string[];
  jenis_ruangan?: string[];
  lantai?: string[];
  kapasitas?: string[];
  luas_ruangan?: string[];
  kondisi?: string[];
  fasilitas?: string[];
  keterangan?: string[];
}

interface Gedung {
  id: number;
  nama_gedung: string;
  jumlah_lantai: number;
}

const EditRuangan = () => {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [gedungList, setGedungList] = useState<Gedung[]>([]);
  const [selectedGedung, setSelectedGedung] = useState<Gedung | null>(null);

  const [formData, setFormData] = useState({
    gedung_id: "",
    kode_ruangan: "",
    nama_ruangan: "",
    jenis_ruangan: "",
    lantai: "",
    kapasitas: "",
    luas_ruangan: "",
    kondisi: "",
    fasilitas: "",
    keterangan: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const gedungs = await fetchGedungList();
      await fetchRuanganDetailWithGedung(gedungs);
    };
    loadData();
  }, [id]);

  const fetchGedungList = async () => {
    try {
      const res = await api.get("/spa/gedung");
      if (res.data.status === "success") {
        setGedungList(res.data.data);
        return res.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching gedung list:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal memuat daftar gedung",
      });
      return [];
    }
  };

  const fetchRuanganDetailWithGedung = async (gedungs: Gedung[]) => {
    try {
      setFetching(true);
      const res = await api.get(`/spa/ruangan/${id}`);

      if (res.data.status === "success") {
        const data = res.data.data;

        // Cari gedung_id dari nama_gedung
        let foundGedungId = "";
        if (data.nama_gedung && gedungs.length > 0) {
          const foundGedung = gedungs.find((g) => g.nama_gedung === data.nama_gedung);
          if (foundGedung) {
            foundGedungId = foundGedung.id.toString();
          }
        }

        setFormData({
          gedung_id: foundGedungId,
          kode_ruangan: data.kode_ruangan || "",
          nama_ruangan: data.nama_ruangan || "",
          jenis_ruangan: data.jenis_ruangan || "",
          lantai: data.lantai?.toString() || "",
          kapasitas: data.kapasitas?.toString() || "",
          luas_ruangan: data.luas_ruangan?.toString() || "",
          kondisi: data.kondisi || "",
          fasilitas: data.fasilitas || "",
          keterangan: data.keterangan || "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching ruangan detail:", error);

      if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: "Ruangan yang Anda cari tidak ditemukan.",
        }).then(() => {
          navigate("/superadmin/informasi-sekolah/ruangan");
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data ruangan.",
        });
        navigate("/superadmin/informasi-sekolah/ruangan");
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (gedungList.length > 0 && formData.gedung_id) {
      const gedung = gedungList.find((g) => g.id.toString() === formData.gedung_id);
      if (gedung) {
        setSelectedGedung(gedung);
      }
    }
  }, [gedungList, formData.gedung_id]);

  const handleGedungChange = (gedungId: string) => {
    const gedung = gedungList.find((g) => g.id.toString() === gedungId);
    setSelectedGedung(gedung || null);
    setFormData({ ...formData, gedung_id: gedungId });

    if (errors.lantai) {
      const newErrors = { ...errors };
      delete newErrors.lantai;
      setErrors(newErrors);
    }
  };

  const handleLantaiChange = (value: string) => {
    setFormData({ ...formData, lantai: value });

    if (selectedGedung && value) {
      const lantaiValue = parseInt(value);
      if (lantaiValue > selectedGedung.jumlah_lantai) {
        setErrors({
          ...errors,
          lantai: [`Lantai tidak boleh lebih dari ${selectedGedung.jumlah_lantai} (jumlah lantai gedung)`],
        });
      } else {
        const newErrors = { ...errors };
        delete newErrors.lantai;
        setErrors(newErrors);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (selectedGedung && formData.lantai) {
      const lantaiValue = parseInt(formData.lantai);
      if (lantaiValue > selectedGedung.jumlah_lantai) {
        setErrors({
          ...errors,
          lantai: [`Lantai tidak boleh lebih dari ${selectedGedung.jumlah_lantai} (jumlah lantai gedung)`],
        });
        return;
      }
    }

    setErrors({});
    setLoading(true);

    try {
      const submitData: any = {};

      if (formData.gedung_id) submitData.gedung_id = parseInt(formData.gedung_id);
      if (formData.kode_ruangan) submitData.kode_ruangan = formData.kode_ruangan;
      if (formData.nama_ruangan) submitData.nama_ruangan = formData.nama_ruangan;
      submitData.jenis_ruangan = formData.jenis_ruangan || null;
      submitData.lantai = formData.lantai ? parseInt(formData.lantai) : null;
      submitData.kapasitas = formData.kapasitas ? parseInt(formData.kapasitas) : null;
      submitData.luas_ruangan = formData.luas_ruangan ? parseFloat(formData.luas_ruangan) : null;
      submitData.kondisi = formData.kondisi || null;
      submitData.fasilitas = formData.fasilitas || null;
      submitData.keterangan = formData.keterangan || null;

      const res = await api.put(`/spa/ruangan/${id}`, submitData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data ruangan berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-sekolah/ruangan");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        setLoading(false);
        return;
      }

      if (error.response?.data?.message === "Tidak valid") {
        setErrors(error.response.data.errors || {});
        setLoading(false);
        return;
      }

      if (error.response?.status === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: "Ruangan yang Anda cari tidak ditemukan.",
        }).then(() => {
          navigate("/superadmin/informasi-sekolah/ruangan");
        });
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: error.response?.data?.message || "Tidak dapat terhubung ke server.",
      });
    }

    setLoading(false);
  };

  if (fetching) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <div className="flex flex-col items-center justify-center h-96 text-gray-600">
            <Loader2Icon className="animate-spin mb-2" size={32} />
            <p className="text-lg font-medium">Memuat data...</p>
          </div>
        </main>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Ruangan" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Ruangan</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gedung */}
                <div>
                  <label className="block font-semibold">
                    Gedung <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={handleGedungChange} value={formData.gedung_id}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- Pilih Gedung --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Gedung</SelectLabel>
                        {gedungList.map((gedung) => (
                          <SelectItem key={gedung.id} value={gedung.id.toString()}>
                            {gedung.nama_gedung} (Lantai: {gedung.jumlah_lantai})
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.gedung_id && errors.gedung_id.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.gedung_id[0]}</p>}
                </div>

                {/* Kode Ruangan */}
                <div>
                  <label className="block font-semibold">
                    Kode Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="cth: 2.2.1" value={formData.kode_ruangan} onChange={(e) => setFormData({ ...formData, kode_ruangan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.kode_ruangan && errors.kode_ruangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kode_ruangan[0]}</p>}
                </div>

                {/* Nama Ruangan */}
                <div>
                  <label className="block font-semibold">
                    Nama Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="cth: Ruang Seni" value={formData.nama_ruangan} onChange={(e) => setFormData({ ...formData, nama_ruangan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.nama_ruangan && errors.nama_ruangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nama_ruangan[0]}</p>}
                </div>

                {/* Jenis Ruangan */}
                <div>
                  <label className="block font-semibold">Jenis Ruangan</label>
                  <input type="text" placeholder="cth: Kelas" value={formData.jenis_ruangan} onChange={(e) => setFormData({ ...formData, jenis_ruangan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.jenis_ruangan && errors.jenis_ruangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jenis_ruangan[0]}</p>}
                </div>

                {/* Lantai */}
                <div>
                  <label className="block font-semibold">Lantai</label>
                  <input type="number" placeholder="cth: 2" value={formData.lantai} onChange={(e) => handleLantaiChange(e.target.value)} min="1" max={selectedGedung?.jumlah_lantai || undefined} className="border p-2 w-full mt-2 rounded" />
                  {selectedGedung && <p className="text-xs text-gray-500 mt-1">Maksimal lantai: {selectedGedung.jumlah_lantai}</p>}
                  {errors.lantai && errors.lantai.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.lantai[0]}</p>}
                </div>

                {/* Kapasitas */}
                <div>
                  <label className="block font-semibold">Kapasitas</label>
                  <input type="number" placeholder="cth: 30" value={formData.kapasitas} onChange={(e) => setFormData({ ...formData, kapasitas: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.kapasitas && errors.kapasitas.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kapasitas[0]}</p>}
                </div>

                {/* Luas Ruangan */}
                <div>
                  <label className="block font-semibold">Luas Ruangan (m²)</label>
                  <input type="number" step="0.01" placeholder="cth: 20" value={formData.luas_ruangan} onChange={(e) => setFormData({ ...formData, luas_ruangan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.luas_ruangan && errors.luas_ruangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.luas_ruangan[0]}</p>}
                </div>

                {/* Kondisi */}
                <div>
                  <label className="block font-semibold">Kondisi</label>
                  <Select onValueChange={(value) => setFormData({ ...formData, kondisi: value })} value={formData.kondisi}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih kondisi --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Kondisi</SelectLabel>
                        <SelectItem value="Baik">Baik</SelectItem>
                        <SelectItem value="Rusak Ringan">Rusak Ringan</SelectItem>
                        <SelectItem value="Rusak Berat">Rusak Berat</SelectItem>
                        <SelectItem value="Dalam Perbaikan">Dalam Perbaikan</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.kondisi && errors.kondisi.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kondisi[0]}</p>}
                </div>
              </div>

              {/* Fasilitas */}
              <div>
                <label className="block font-semibold">Fasilitas</label>
                <input type="text" placeholder="cth: Alat Lukis, Patung" value={formData.fasilitas} onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                {errors.fasilitas && errors.fasilitas.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.fasilitas[0]}</p>}
              </div>

              {/* Keterangan */}
              <div className="mb-6">
                <label className="block font-semibold">Keterangan</label>
                <textarea
                  placeholder="Keterangan tambahan tentang ruangan..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="border p-2 w-full mt-2 rounded h-32 resize-none"
                ></textarea>
                {errors.keterangan && errors.keterangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.keterangan[0]}</p>}
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <Save size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Link to="/superadmin/informasi-sekolah/ruangan">
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

export default EditRuangan;
