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
import type { FormEditRuanganPayload, GedungSelectOption } from "@/types/ruangan";

const EditRuangan = () => {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [gedungList, setGedungList] = useState<GedungSelectOption[]>([]);

  const [formData, setFormData] = useState<FormEditRuanganPayload>({
    gedung_id: 0,
    kode_ruangan: "",
    nama_ruangan: "",
    jenis_ruangan: "",
    lantai: 0,
    kapasitas: 0,
    luas_ruangan: "",
    kondisi: "",
    fasilitas: "",
    keterangan: "",
    status: "",
  });

  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const gedungs = await fetchGedungList();
      if (gedungs && gedungs.length > 0) {
        await fetchRuanganDetail(gedungs);
      }
    };
    loadData();
  }, [id]);

  const fetchGedungList = async () => {
    try {
      const res = await api.get("/spa/data-select/ruangan");
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

  const fetchRuanganDetail = async (gedungs: GedungSelectOption[]) => {
    try {
      setFetching(true);
      const res = await api.get(`/spa/ruangan/${id}`);

      if (res.data.status === "success") {
        const data = res.data.data;

        // Jika API mengembalikan nama_gedung bukan gedung_id, cari gedung_id dari list
        let gedungId = 0;
        if (data.gedung_id) {
          gedungId = data.gedung_id;
        } else if (data.nama_gedung && gedungs.length > 0) {
          const foundGedung = gedungs.find((g) => g.nama_gedung === data.nama_gedung);
          if (foundGedung) {
            gedungId = foundGedung.gedung_id;
          }
        }

        setFormData({
          gedung_id: gedungId,
          kode_ruangan: data.kode_ruangan || "",
          nama_ruangan: data.nama_ruangan || "",
          jenis_ruangan: data.jenis_ruangan || "",
          lantai: data.lantai || 0,
          kapasitas: data.kapasitas || 0,
          luas_ruangan: data.luas_ruangan || "",
          kondisi: data.kondisi || "",
          fasilitas: data.fasilitas || "",
          keterangan: data.keterangan || "",
          status: data.status || "",
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

  const handleGedungChange = (gedungId: string) => {
    const gedungIdNum = parseInt(gedungId);
    setFormData({ ...formData, gedung_id: gedungIdNum });

    // Clear gedung_id error when gedung changes
    if (errors.gedung_id) {
      const newErrors = { ...errors };
      delete newErrors.gedung_id;
      setErrors(newErrors);
    }
  };

  const handleLantaiChange = (value: string) => {
    const lantaiValue = value ? parseInt(value) : 0;
    setFormData({ ...formData, lantai: lantaiValue });

    // Clear lantai error when value changes
    if (errors.lantai) {
      const newErrors = { ...errors };
      delete newErrors.lantai;
      setErrors(newErrors);
    }
  };

  const handleKapasitasChange = (value: string) => {
    const kapasitasValue = value ? parseInt(value) : 0;
    setFormData({ ...formData, kapasitas: kapasitasValue });

    // Clear kapasitas error when value changes
    if (errors.kapasitas) {
      const newErrors = { ...errors };
      delete newErrors.kapasitas;
      setErrors(newErrors);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});
    setLoading(true);

    try {
      const submitData: FormEditRuanganPayload = {
        gedung_id: formData.gedung_id,
        kode_ruangan: formData.kode_ruangan,
        nama_ruangan: formData.nama_ruangan,
        jenis_ruangan: formData.jenis_ruangan,
        lantai: formData.lantai,
        kapasitas: formData.kapasitas,
        luas_ruangan: formData.luas_ruangan,
        kondisi: formData.kondisi,
        fasilitas: formData.fasilitas,
        keterangan: formData.keterangan,
        status: formData.status,
      };

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
      // Handle validation error 422
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
        setLoading(false);
        return;
      }

      // Handle custom error response from backend
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
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gedung */}
                <div>
                  <label className="block font-semibold mb-2">
                    Gedung <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={handleGedungChange} value={formData.gedung_id > 0 ? formData.gedung_id.toString() : ""}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Gedung --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Gedung</SelectLabel>
                        {gedungList.map((gedung) => (
                          <SelectItem key={gedung.gedung_id} value={gedung.gedung_id.toString()}>
                            {gedung.kode_gedung} - {gedung.nama_gedung}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.gedung_id && errors.gedung_id.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.gedung_id[0]}</p>}
                </div>

                {/* Kode Ruangan */}
                <div>
                  <label className="block font-semibold mb-2">
                    Kode Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="cth: 2.2.1 (gedung.lantai.ruangan)" value={formData.kode_ruangan} onChange={(e) => setFormData({ ...formData, kode_ruangan: e.target.value })} className="border p-2 w-full rounded" />
                  {errors.kode_ruangan && errors.kode_ruangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kode_ruangan[0]}</p>}
                </div>

                {/* Nama Ruangan */}
                <div>
                  <label className="block font-semibold mb-2">
                    Nama Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="cth: Ruang Seni" value={formData.nama_ruangan} onChange={(e) => setFormData({ ...formData, nama_ruangan: e.target.value })} className="border p-2 w-full rounded" />
                  {errors.nama_ruangan && errors.nama_ruangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nama_ruangan[0]}</p>}
                </div>

                {/* Jenis Ruangan */}
                <div>
                  <label className="block font-semibold mb-2">
                    Jenis Ruangan <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="cth: Kelas, Kantor, Laboratorium" value={formData.jenis_ruangan} onChange={(e) => setFormData({ ...formData, jenis_ruangan: e.target.value })} className="border p-2 w-full rounded" />
                  {errors.jenis_ruangan && errors.jenis_ruangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.jenis_ruangan[0]}</p>}
                </div>

                {/* Lantai */}
                <div>
                  <label className="block font-semibold mb-2">
                    Lantai <span className="text-red-500">*</span>
                  </label>
                  <input type="number" placeholder="cth: 2" value={formData.lantai || ""} onChange={(e) => handleLantaiChange(e.target.value)} min="1" className="border p-2 w-full rounded" />
                  {errors.lantai && errors.lantai.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.lantai[0]}</p>}
                </div>

                {/* Kapasitas */}
                <div>
                  <label className="block font-semibold mb-2">
                    Kapasitas <span className="text-red-500">*</span>
                  </label>
                  <input type="number" placeholder="cth: 30" value={formData.kapasitas || ""} onChange={(e) => handleKapasitasChange(e.target.value)} min="1" className="border p-2 w-full rounded" />
                  {errors.kapasitas && errors.kapasitas.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kapasitas[0]}</p>}
                </div>

                {/* Luas Ruangan */}
                <div>
                  <label className="block font-semibold mb-2">
                    Luas Ruangan (m²) <span className="text-red-500">*</span>
                  </label>
                  <input type="text" placeholder="cth: 20 m² atau 20x30 m²" value={formData.luas_ruangan} onChange={(e) => setFormData({ ...formData, luas_ruangan: e.target.value })} className="border p-2 w-full rounded" />
                  {errors.luas_ruangan && errors.luas_ruangan.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.luas_ruangan[0]}</p>}
                </div>

                {/* Kondisi */}
                <div>
                  <label className="block font-semibold mb-2">
                    Kondisi <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={(value) => setFormData({ ...formData, kondisi: value })} value={formData.kondisi}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Kondisi --" />
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
                  <label className="block font-semibold mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={(value) => setFormData({ ...formData, status: value })} value={formData.status}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Status --" />
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

              {/* Fasilitas */}
              <div>
                <label className="block font-semibold mb-2">
                  Fasilitas <span className="text-red-500">*</span>
                </label>
                <input type="text" placeholder="cth: Alat Lukis, Patung" value={formData.fasilitas} onChange={(e) => setFormData({ ...formData, fasilitas: e.target.value })} className="border p-2 w-full rounded" />
                {errors.fasilitas && errors.fasilitas.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.fasilitas[0]}</p>}
              </div>

              {/* Keterangan */}
              <div>
                <label className="block font-semibold mb-2">
                  Keterangan <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="Keterangan tambahan tentang ruangan..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="border p-2 w-full rounded h-32 resize-none"
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
