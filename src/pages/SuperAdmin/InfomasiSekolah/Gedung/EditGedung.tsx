import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, Loader2Icon, Save, ImageIcon, XIcon } from "lucide-react";
import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormErrors {
  foto_gedung?: string[];
  kode_gedung?: string[];
  nama_gedung?: string[];
  jumlah_lantai?: string[];
  luas_bangunan?: string[];
  tahun_dibangun?: string[];
  kondisi?: string[];
  lokasi?: string[];
  keterangan?: string[];
  status?: string[];
}

const EditGedung = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { id } = useParams<{ id: string }>();

  const [formData, setFormData] = useState({
    kode_gedung: "",
    nama_gedung: "",
    jumlah_lantai: "",
    luas_bangunan: "",
    tahun_dibangun: "",
    kondisi: "",
    lokasi: "",
    keterangan: "",
    status: "",
  });

  const [fotoGedung, setFotoGedung] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingFotoUrl, setExistingFotoUrl] = useState<string | null>(null);

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  // Fetch data gedung existing
  useEffect(() => {
    const fetchGedung = async () => {
      try {
        setFetching(true);
        const res = await api.get(`/spa/gedung/${id}`);

        if (res.data.status === "success") {
          const data = res.data.data;

          setFormData({
            kode_gedung: data.kode_gedung || "",
            nama_gedung: data.nama_gedung || "",
            jumlah_lantai: data.jumlah_lantai || "",
            luas_bangunan: data.luas_bangunan || "",
            tahun_dibangun: data.tahun_dibangun || "",
            kondisi: data.kondisi || "",
            lokasi: data.lokasi || "",
            keterangan: data.keterangan || "",
            status: data.status_gedung || "",
          });

          // Set existing foto URL
          if (data.foto_gedung) {
            setExistingFotoUrl(data.foto_gedung);
          }
        }
      } catch (error: any) {
        console.error("Gagal mengambil data gedung:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data gedung.",
        });
        navigate("/superadmin/informasi-sekolah/gedung");
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchGedung();
    }
  }, [id, navigate]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Format tidak valid!",
          text: "Hanya file JPG, JPEG, PNG, dan WEBP yang diperbolehkan.",
        });
        return;
      }

      // Validasi ukuran file (max 2MB)
      if (file.size > 2048 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File terlalu besar!",
          text: "Maksimal ukuran file adalah 2MB.",
        });
        return;
      }

      setFotoGedung(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFotoGedung(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    try {
      // Gunakan FormData untuk upload file
      const submitData = new FormData();

      // Hanya append foto jika user memilih foto baru
      if (fotoGedung) {
        submitData.append("foto_gedung", fotoGedung);
      }

      submitData.append("kode_gedung", formData.kode_gedung);
      submitData.append("nama_gedung", formData.nama_gedung);
      submitData.append("jumlah_lantai", formData.jumlah_lantai);
      submitData.append("luas_bangunan", formData.luas_bangunan);
      submitData.append("tahun_dibangun", formData.tahun_dibangun);
      submitData.append("kondisi", formData.kondisi);
      submitData.append("lokasi", formData.lokasi);
      submitData.append("keterangan", formData.keterangan);
      submitData.append("status", formData.status);

      // Laravel method spoofing untuk PUT request dengan FormData
      submitData.append("_method", "PUT");

      const res = await api.post(`/spa/gedung/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data gedung berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-sekolah/gedung");
      }
    } catch (error: any) {
      // HANDLE VALIDATION ERROR 422
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        setLoading(false);
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

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Edit Gedung" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Gedung</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
              {/* Upload Foto Gedung */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Foto Gedung</label>

                {previewUrl || existingFotoUrl ? (
                  <div className="relative inline-block">
                    <img src={previewUrl || existingFotoUrl || ""} alt="Preview" className="w-48 h-48 object-cover rounded border-2 border-gray-300" />
                    {previewUrl && (
                      <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <XIcon size={16} />
                      </button>
                    )}
                    {!previewUrl && existingFotoUrl && (
                      <div className="mt-2">
                        <label htmlFor="foto_gedung_edit" className="cursor-pointer">
                          <Button type="button" variant="outline" size="sm" asChild>
                            <span>Ganti Foto</span>
                          </Button>
                        </label>
                        <input type="file" id="foto_gedung_edit" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input type="file" id="foto_gedung" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="foto_gedung" className="cursor-pointer">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Klik untuk upload foto gedung</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, JPEG, PNG, WEBP (Max. 2MB)</p>
                    </label>
                  </div>
                )}

                {errors.foto_gedung && errors.foto_gedung.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.foto_gedung[0]}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kode Gedung */}
                <div>
                  <label className="block font-semibold">Kode Gedung</label>
                  <input type="text" placeholder="cth: GD_01" value={formData.kode_gedung} onChange={(e) => setFormData({ ...formData, kode_gedung: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.kode_gedung && errors.kode_gedung.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kode_gedung[0]}</p>}
                </div>

                {/* Nama Gedung */}
                <div>
                  <label className="block font-semibold">Nama Gedung</label>
                  <input type="text" placeholder="cth: Gedung Pratama" value={formData.nama_gedung} onChange={(e) => setFormData({ ...formData, nama_gedung: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.nama_gedung && errors.nama_gedung.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nama_gedung[0]}</p>}
                </div>

                {/* Jumlah Lantai */}
                <div>
                  <label className="block font-semibold">Jumlah Lantai</label>
                  <input type="number" placeholder="cth: 3" value={formData.jumlah_lantai} onChange={(e) => setFormData({ ...formData, jumlah_lantai: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.jumlah_lantai && errors.jumlah_lantai.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jumlah_lantai[0]}</p>}
                </div>

                {/* Luas Bangunan */}
                <div>
                  <label className="block font-semibold">Luas Bangunan</label>
                  <input type="text" placeholder="cth: 24 Meter Persegi" value={formData.luas_bangunan} onChange={(e) => setFormData({ ...formData, luas_bangunan: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.luas_bangunan && errors.luas_bangunan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.luas_bangunan[0]}</p>}
                </div>

                {/* Tahun Dibangun */}
                <div>
                  <label className="block font-semibold">Tahun Dibangun</label>
                  <input type="text" placeholder="cth: 2019" value={formData.tahun_dibangun} onChange={(e) => setFormData({ ...formData, tahun_dibangun: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.tahun_dibangun && errors.tahun_dibangun.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tahun_dibangun[0]}</p>}
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

                {/* Status */}
                <div>
                  <label className="block font-semibold">Status</label>
                  <Select onValueChange={(value) => setFormData({ ...formData, status: value })} value={formData.status}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih status --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Status</SelectLabel>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="arsip">Arsip</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.status && errors.status.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
                </div>
              </div>

              {/* Lokasi */}
              <div className="mb-6">
                <label className="block font-semibold">Lokasi</label>
                <textarea
                  placeholder="cth: Jl. Kebon Jeruk No. 123, Jakarta Selatan"
                  value={formData.lokasi}
                  onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  className="border p-2 w-full mt-2 rounded h-24 resize-none"
                ></textarea>
                {errors.lokasi && errors.lokasi.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.lokasi[0]}</p>}
              </div>

              {/* Keterangan */}
              <div className="mb-6">
                <label className="block font-semibold">Keterangan</label>
                <textarea
                  placeholder="Keterangan tambahan tentang gedung..."
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
                <Link to="/superadmin/informasi-sekolah/gedung">
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

export default EditGedung;
