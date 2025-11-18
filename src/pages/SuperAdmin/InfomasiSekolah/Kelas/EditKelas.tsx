import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
// import type { Kelas } from "@/types";

interface FormErrors {
  nama_kelas?: string[];
  jam_masuk?: string[];
}

const EditKelas = () => {
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    nama_kelas: "",
    jam_masuk: "",
    wali_kelas: null as number | null,
    wali_nama: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const navigate = useNavigate();

  // Ambil data kelas berdasarkan ID
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        setIsLoading(true);

        const res = await api.get(`/spa/kelas/${id}`);
        if (res.data.status !== "success") {
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: res.data.message || "Data kelas tidak ditemukan.",
          });
          return;
        }

        const kelas = res.data.data;

        // Ambil data wali dari respons
        const waliData = kelas.wali ?? null;
        const waliNama = waliData?.nama ?? "-";
        const waliId = waliData?.id ?? null;

        // Set form data
        setFormData({
          nama_kelas: kelas.nama_kelas ?? "",
          jam_masuk: kelas.jam_masuk ? kelas.jam_masuk.replace(".", ":") : "",
          wali_kelas: waliId,
          wali_nama: waliNama,
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: "error",
          title: "Koneksi gagal!",
          text: "Tidak dapat terhubung ke server.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchKelas();
  }, [id]);

  // const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   setErrors({});
  //   setLoading(true);

  //   try {
  //     const payload = {
  //       nama_kelas: formData.nama_kelas,
  //       jam_masuk: formData.jam_masuk,
  //     };

  //     const res = await api.put(`/kelas/${id}`, payload);

  //     if (res.data.status === "success") {
  //       Swal.fire("Berhasil", res.data.message, "success").then(() => {
  //         navigate("/superadmin/informasi-sekolah/kelas");
  //       });
  //     } else if (res.data.errors) {
  //       setErrors(res.data.errors);
  //     } else {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Gagal menyimpan!",
  //         text: res.data.message || "Terjadi kesalahan saat memperbarui kelas.",
  //       });
  //     }
  //   } catch {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Koneksi gagal!",
  //       text: "Tidak dapat terhubung ke server.",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({}); // reset error
    setLoading(true);

    // 🔹 Validasi sederhana di sisi frontend
    const newErrors: FormErrors = {};

    if (!formData.nama_kelas.trim()) {
      newErrors.nama_kelas = ["Nama kelas wajib diisi"];
    }

    if (!formData.jam_masuk.trim()) {
      newErrors.jam_masuk = ["Jam masuk wajib diisi"];
    }

    // Jika ada error → hentikan submit dan tampilkan pesan
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);

      Swal.fire({
        icon: "warning",
        title: "Validasi Gagal!",
        text: "Field inputan harus diisi.",
        confirmButtonColor: "#EAB308",
      });

      return; // stop kirim ke backend
    }

    try {
      const payload = {
        nama_kelas: formData.nama_kelas,
        jam_masuk: formData.jam_masuk,
      };

      const res = await api.put(`/spa/kelas/${id}`, payload);

      if (res.data.status === "success") {
        Swal.fire("Berhasil", res.data.message, "success").then(() => {
          navigate("/superadmin/informasi-sekolah/kelas");
        });
      } else if (res.data.errors) {
        setErrors(res.data.errors);
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal menyimpan!",
          text: res.data.message || "Terjadi kesalahan saat memperbarui kelas.",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Koneksi gagal!",
        text: "Tidak dapat terhubung ke server.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Edit Kelas" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Kelas</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-3" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* Nama Kelas */}
                <div className="mb-6">
                  <label htmlFor="nama_kelas" className="block font-semibold text-foreground">
                    Nama Kelas
                  </label>
                  <input type="text" name="nama_kelas" placeholder="cth: 10 IPA 1" value={formData.nama_kelas} onChange={(e) => setFormData({ ...formData, nama_kelas: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.nama_kelas && <p className="text-red-500 text-sm mt-1">{errors.nama_kelas[0]}</p>}
                </div>

                {/* Jam Masuk */}
                <div className="mb-6">
                  <label htmlFor="jam_masuk" className="block font-semibold text-foreground">
                    Jam Masuk
                  </label>
                  <input type="time" name="jam_masuk" value={formData.jam_masuk} onChange={(e) => setFormData({ ...formData, jam_masuk: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.jam_masuk && <p className="text-red-500 text-sm mt-1">{errors.jam_masuk[0]}</p>}
                </div>

                {/* Wali Kelas - Read Only */}
                <div className="mb-6">
                  <label htmlFor="wali_kelas" className="block font-semibold text-foreground">
                    Wali Kelas
                  </label>
                  <input type="text" name="wali_kelas" value={formData.wali_nama || "-"} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100 text-gray-600 cursor-not-allowed" disabled />
                  <p className="text-sm mt-1 text-red-500 italic">Data wali kelas tidak dapat diubah di halaman ini.</p>
                </div>

                {/* Tombol Aksi */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePlus size={18} />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-sekolah/kelas">
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

export default EditKelas;
