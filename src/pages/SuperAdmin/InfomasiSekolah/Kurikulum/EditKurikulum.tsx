import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FormErrors {
  nama_kurikulum: string[];
  tahun_berlaku: string[];
  status: string[];
  deskripsi: string[];
}

const EditKurikulum = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nama_kurikulum: "",
    tahun_berlaku: "",
    status: "",
    deskripsi: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    nama_kurikulum: [],
    tahun_berlaku: [],
    status: [],
    deskripsi: [],
  });

  // Fetch existing data
  useEffect(() => {
    const getData = async () => {
      try {
        const res = await api.get(`/spa/kurikulum/${id}`);

        if (res.data.status === "success") {
          setFormData({
            nama_kurikulum: res.data.data.nama_kurikulum ?? "",
            tahun_berlaku: res.data.data.tahun_berlaku ?? "",
            status: res.data.data.status ?? "",
            deskripsi: res.data.data.deskripsi ?? "",
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: "Coba ulangi kembali nanti.",
        });
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      nama_kurikulum: [],
      tahun_berlaku: [],
      status: [],
      deskripsi: [],
    });

    setSaving(true);

    try {
      const res = await api.put(`/spa/kurikulum/${id}`, formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kurikulum berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });

        navigate("/superadmin/informasi-sekolah/kurikulum");
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors);
        setSaving(false);
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan!",
        text: "Periksa koneksi kamu.",
      });
    }

    setSaving(false);
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Kurikulum" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Kurikulum</h1>

          <div className="bg-white rounded shadow p-5">
            {loading ? (
              <p className="text-center py-10">Memuat data...</p>
            ) : (
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Nama Kurikulum */}
                <div className="mb-6">
                  <label className="block font-semibold">Nama Kurikulum</label>
                  <input
                    type="text"
                    value={formData.nama_kurikulum}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nama_kurikulum: e.target.value,
                      })
                    }
                    className="border p-2 w-full mt-2 rounded"
                  />
                  {errors.nama_kurikulum[0] && <p className="text-red-500 text-sm mt-1">{errors.nama_kurikulum[0]}</p>}
                </div>

                {/* Tahun Berlaku */}
                <div className="mb-6">
                  <label className="block font-semibold">Tahun Berlaku</label>
                  <input
                    type="text"
                    value={formData.tahun_berlaku}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tahun_berlaku: e.target.value,
                      })
                    }
                    className="border p-2 w-full mt-2 rounded"
                  />
                  {errors.tahun_berlaku[0] && <p className="text-red-500 text-sm mt-1">{errors.tahun_berlaku[0]}</p>}
                </div>

                {/* Status */}
                <div className="mb-6">
                  <label className="block font-semibold">Status</label>

                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih status --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Status</SelectLabel>
                        <SelectItem value="aktif">Aktif</SelectItem>
                        <SelectItem value="tidak aktif">Tidak Aktif</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.status[0] && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
                </div>

                {/* Deskripsi */}
                <div className="mb-6">
                  <label className="block font-semibold">Deskripsi</label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        deskripsi: e.target.value,
                      })
                    }
                    className="border p-2 w-full mt-2 rounded h-32 resize-none"
                  />
                  {errors.deskripsi[0] && <p className="text-red-500 text-sm mt-1">{errors.deskripsi[0]}</p>}
                </div>

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>

                  <Link to="/superadmin/informasi-sekolah/kurikulum">
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

export default EditKurikulum;
