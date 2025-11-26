import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { EyeIcon, TargetIcon, Save, CircleXIcon, ImageIcon, XIcon, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  npsn?: string[];
  nama_sekolah?: string[];
  status_sekolah?: string[];
  jenjang?: string[];
  akreditasi?: string[];
  alamat?: string[];
  desa_kelurahan?: string[];
  kecamatan?: string[];
  kabupaten_kota?: string[];
  provinsi?: string[];
  kode_pos?: string[];
  email?: string[];
  no_telepon?: string[];
  kepala_sekolah?: string[];
  nip_kepala_sekolah?: string[];
  visi?: string[];
  misi?: string[];
  logo?: string[];
}

export default function EditIdentitasSekolah() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [formData, setFormData] = useState({
    npsn: "",
    nama_sekolah: "",
    status_sekolah: "",
    jenjang: "",
    akreditasi: "",
    alamat: "",
    desa_kelurahan: "",
    kecamatan: "",
    kabupaten_kota: "",
    provinsi: "",
    kode_pos: "",
    email: "",
    no_telepon: "",
    kepala_sekolah: "",
    nip_kepala_sekolah: "",
    visi: "",
    misi: "",
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | null>(null);
  const [existingLogo, setExistingLogo] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch data identitas sekolah
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/spa/identitas-sekolah/${id}`);

        if (res.data.status === "success") {
          const data = res.data.data;

          setFormData({
            npsn: data.npsn || "",
            nama_sekolah: data.nama_sekolah || "",
            status_sekolah: data.status_sekolah || "",
            jenjang: data.jenjang || "",
            akreditasi: data.akreditasi || "",
            alamat: data.alamat || "",
            desa_kelurahan: data.desa_kelurahan || "",
            kecamatan: data.kecamatan || "",
            kabupaten_kota: data.kabupaten_kota || "",
            provinsi: data.provinsi || "",
            kode_pos: data.kode_pos || "",
            email: data.email || "",
            no_telepon: data.no_telepon || "",
            kepala_sekolah: data.kepala_sekolah || "",
            nip_kepala_sekolah: data.nip_kepala_sekolah || "",
            visi: data.visi || "",
            misi: data.misi || "",
          });

          if (data.logo) {
            setExistingLogo(data.logo);
            setPreviewLogo(data.logo);
          }
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data identitas sekolah.",
        });
        navigate("/superadmin/informasi-sekolah/identitas-sekolah");
      } finally {
        setFetchLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    setLogo(file);

    // Revoke URL lama jika bukan dari server
    if (previewLogo && !existingLogo) {
      URL.revokeObjectURL(previewLogo);
    }

    setPreviewLogo(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setLogo(null);

    // Revoke URL jika bukan dari server
    if (previewLogo && !existingLogo) {
      URL.revokeObjectURL(previewLogo);
    }

    setPreviewLogo(null);
    setExistingLogo(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    try {
      const submitData = new FormData();

      // Append semua field form
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // Hanya append logo jika ada file baru yang dipilih
      if (logo) {
        submitData.append("logo", logo);
      }

      // Gunakan method POST dengan _method=PUT untuk Laravel
      submitData.append("_method", "PUT");

      const res = await api.post(`/spa/identitas-sekolah/${id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Identitas sekolah berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-sekolah/identitas-sekolah");
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

  if (fetchLoading) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main
          className={`w-full min-h-screen bg-background transition-all duration-300 flex items-center justify-center
          ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
        >
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
        <PageTitle title="Edit Identitas Sekolah" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Identitas Sekolah</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-4xl w-full" onSubmit={handleSubmit}>
              {/* Upload Logo */}
              <div className="mb-6">
                <label className="font-semibold mb-2 flex items-center gap-2">
                  <ImageIcon size={18} /> Logo Sekolah
                </label>

                {previewLogo ? (
                  <div className="relative inline-block">
                    <img src={previewLogo} alt="Preview" className="w-48 h-48 object-cover rounded border-2 border-gray-300" />
                    <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                      <XIcon size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input type="file" id="logo" accept="image/jpeg,image/jpg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="logo" className="cursor-pointer">
                      <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Klik untuk upload logo sekolah</p>
                      <p className="text-xs text-gray-500 mt-1">JPG, JPEG, PNG, WEBP (Max. 2MB)</p>
                    </label>
                  </div>
                )}

                {errors.logo && errors.logo.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.logo[0]}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* NPSN */}
                <div>
                  <label className="block font-semibold">NPSN</label>
                  <input type="text" name="npsn" placeholder="cth: 20123456" value={formData.npsn} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.npsn && errors.npsn.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.npsn[0]}</p>}
                </div>

                {/* Nama Sekolah */}
                <div>
                  <label className="block font-semibold">Nama Sekolah</label>
                  <input type="text" name="nama_sekolah" placeholder="cth: SMA Negeri 1 Jakarta" value={formData.nama_sekolah} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.nama_sekolah && errors.nama_sekolah.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nama_sekolah[0]}</p>}
                </div>

                {/* Status Sekolah */}
                <div>
                  <label className="block font-semibold">Status Sekolah</label>
                  <input type="text" name="status_sekolah" placeholder="cth: Negeri" value={formData.status_sekolah} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.status_sekolah && errors.status_sekolah.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status_sekolah[0]}</p>}
                </div>

                {/* Jenjang */}
                <div>
                  <label className="block font-semibold">Jenjang</label>
                  <input type="text" name="jenjang" placeholder="cth: SMA" value={formData.jenjang} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.jenjang && errors.jenjang.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jenjang[0]}</p>}
                </div>

                {/* Akreditasi */}
                <div>
                  <label className="block font-semibold">Akreditasi</label>
                  <input type="text" name="akreditasi" placeholder="cth: A" value={formData.akreditasi} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.akreditasi && errors.akreditasi.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.akreditasi[0]}</p>}
                </div>

                {/* Alamat */}
                <div className="col-span-2">
                  <label className="block font-semibold">Alamat</label>
                  <textarea name="alamat" placeholder="cth: Jl. Pendidikan No. 123" value={formData.alamat} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.alamat && errors.alamat.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.alamat[0]}</p>}
                </div>

                {/* Desa/Kelurahan */}
                <div>
                  <label className="block font-semibold">Desa / Kelurahan</label>
                  <input type="text" name="desa_kelurahan" placeholder="cth: Kelurahan Menteng" value={formData.desa_kelurahan} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.desa_kelurahan && errors.desa_kelurahan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.desa_kelurahan[0]}</p>}
                </div>

                {/* Kecamatan */}
                <div>
                  <label className="block font-semibold">Kecamatan</label>
                  <input type="text" name="kecamatan" placeholder="cth: Kecamatan Menteng" value={formData.kecamatan} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.kecamatan && errors.kecamatan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kecamatan[0]}</p>}
                </div>

                {/* Kabupaten/Kota */}
                <div>
                  <label className="block font-semibold">Kabupaten / Kota</label>
                  <input type="text" name="kabupaten_kota" placeholder="cth: Jakarta Pusat" value={formData.kabupaten_kota} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.kabupaten_kota && errors.kabupaten_kota.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kabupaten_kota[0]}</p>}
                </div>

                {/* Provinsi */}
                <div>
                  <label className="block font-semibold">Provinsi</label>
                  <input type="text" name="provinsi" placeholder="cth: DKI Jakarta" value={formData.provinsi} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.provinsi && errors.provinsi.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.provinsi[0]}</p>}
                </div>

                {/* Kode Pos */}
                <div>
                  <label className="block font-semibold">Kode Pos</label>
                  <input type="text" name="kode_pos" placeholder="cth: 10310" value={formData.kode_pos} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.kode_pos && errors.kode_pos.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kode_pos[0]}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block font-semibold">Email</label>
                  <input type="email" name="email" placeholder="cth: info@sekolah.sch.id" value={formData.email} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.email && errors.email.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.email[0]}</p>}
                </div>

                {/* No Telepon */}
                <div>
                  <label className="block font-semibold">No Telepon</label>
                  <input type="text" name="no_telepon" placeholder="cth: 021-12345678" value={formData.no_telepon} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.no_telepon && errors.no_telepon.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.no_telepon[0]}</p>}
                </div>

                {/* Kepala Sekolah */}
                <div>
                  <label className="block font-semibold">Kepala Sekolah</label>
                  <input type="text" name="kepala_sekolah" placeholder="cth: Dr. Ahmad Sudrajat, M.Pd" value={formData.kepala_sekolah} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.kepala_sekolah && errors.kepala_sekolah.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kepala_sekolah[0]}</p>}
                </div>

                {/* NIP Kepala Sekolah */}
                <div>
                  <label className="block font-semibold">NIP Kepala Sekolah</label>
                  <input type="text" name="nip_kepala_sekolah" placeholder="cth: 196801011990031005" value={formData.nip_kepala_sekolah} onChange={handleChange} className="border p-2 w-full mt-2 rounded" />
                  {errors.nip_kepala_sekolah && errors.nip_kepala_sekolah.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nip_kepala_sekolah[0]}</p>}
                </div>
              </div>

              {/* Visi */}
              <div className="mb-6">
                <label className="font-semibold flex items-center gap-2">
                  <EyeIcon size={18} /> Visi
                </label>
                <textarea name="visi" placeholder="Tuliskan visi sekolah..." value={formData.visi} onChange={handleChange} className="border p-2 w-full mt-2 rounded h-24 resize-none" />
                {errors.visi && errors.visi.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.visi[0]}</p>}
              </div>

              {/* Misi */}
              <div className="mb-6">
                <label className="font-semibold flex items-center gap-2">
                  <TargetIcon size={18} /> Misi
                </label>
                <textarea name="misi" placeholder="Tuliskan misi sekolah..." value={formData.misi} onChange={handleChange} className="border p-2 w-full mt-2 rounded h-32 resize-none" />
                {errors.misi && errors.misi.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.misi[0]}</p>}
              </div>

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  {loading ? (
                    <>
                      <Loader2Icon className="animate-spin" size={18} />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
                <Link to="/superadmin/informasi-sekolah/identitas-sekolah">
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
}
