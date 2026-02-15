import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePenLine } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";

interface FormErrors {
  semester: string[];
  status: string[];
  data: string[];
}

const EditSemester = () => {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [formData, setFormData] = useState({
    semester: "",
    status: "aktif",
  });

  const [errors, setErrors] = useState<FormErrors>({
    semester: [],
    status: [],
    data: [],
  });

  const [loading, setLoading] = useState(false);
  const [initialStatus, setInitialStatus] = useState("");
  const [tahunAkademikStatus, setTahunAkademikStatus] = useState("");
  const navigate = useNavigate();

  // AMBIL DATA LAMA
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil semua data semester
        const res = await api.get("/spa/semester");
        const allData = res.data.data;

        // Cari semester berdasarkan ID
        let semesterData = null;
        for (const tahunAkademik of allData) {
          const found = tahunAkademik.semesters.find((s: any) => s.semester_id === Number(id));
          if (found) {
            semesterData = {
              ...found,
              status_tahun_akademik: tahunAkademik.status_tahun_akademik,
            };
            break;
          }
        }

        if (!semesterData) {
          Swal.fire({
            icon: "error",
            title: "Data tidak ditemukan!",
            text: "Semester yang Anda cari tidak ditemukan.",
          });
          navigate("/superadmin/informasi-sekolah/semester");
          return;
        }

        setFormData({
          semester: semesterData.semester || "",
          status: semesterData.status_semester || "aktif",
        });

        setInitialStatus(semesterData.status_semester || "aktif");
        setTahunAkademikStatus(semesterData.status_tahun_akademik || "aktif");
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: "Terjadi kesalahan saat mengambil data.",
        });
      }
    };

    fetchData();
  }, [id, navigate]);

  // SUBMIT EDIT
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      semester: [],
      status: [],
      data: [],
    });

    setLoading(true);

    try {
      const res = await api.put(`/spa/semester/${id}`, formData);

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data semester berhasil diperbarui.",
          timer: 1800,
          showConfirmButton: false,
        });

        navigate("/superadmin/informasi-sekolah/semester");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // HANDLE VALIDATION ERROR 422
      if (errorStatus === 422 && errorData?.errors) {
        // 1️⃣ Cek error khusus status (arsip tidak bisa diaktifkan)
        if (errorData.errors.status) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah status!",
            text: Array.isArray(errorData.errors.status) ? errorData.errors.status[0] : errorData.errors.status,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // 2️⃣ Cek error tahun akademik sudah arsip
        if (errorData.errors.data) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah data!",
            text: Array.isArray(errorData.errors.data) ? errorData.errors.data[0] : errorData.errors.data,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // 3️⃣ Handle validation errors biasa (semester)
        setErrors(errorData.errors);
        setLoading(false);
        return;
      }

      // HANDLE ERROR 404
      if (errorStatus === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: errorData?.message || "Semester tidak ditemukan.",
        });
        setLoading(false);
        return;
      }

      // Handle error lainnya (500, network error, dll)
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

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Edit Semester" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Semester</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Semester <span className="text-red-500">*</span>
                </label>

                <Select value={formData.semester} onValueChange={(value) => setFormData({ ...formData, semester: value })} disabled={tahunAkademikStatus === "arsip"}>
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="-- pilih semester --" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Pilih Semester</SelectLabel>
                      <SelectItem value="Ganjil">Ganjil</SelectItem>
                      <SelectItem value="Genap">Genap</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                {errors.semester?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.semester[0]}</p>}
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Status <span className="text-red-500">*</span>
                </label>

                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })} disabled={initialStatus === "arsip" || tahunAkademikStatus === "arsip"}>
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

                {errors.status?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status[0]}</p>}
              </div>

              {/* Info */}
              {tahunAkademikStatus === "arsip" && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <p>Tahun akademik untuk semester ini sudah diarsipkan. Data tidak dapat diubah.</p>
                </div>
              )}

              {initialStatus === "arsip" && tahunAkademikStatus !== "arsip" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <p>Semester yang sudah diarsipkan tidak dapat diubah statusnya kembali ke aktif.</p>
                </div>
              )}

              {formData.status === "arsip" && initialStatus === "aktif" && tahunAkademikStatus !== "arsip" && (
                <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-800">
                  <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Setelah diarsipkan, status tidak dapat dikembalikan ke aktif</li>
                    <li>Pastikan semua data terkait sudah sesuai sebelum mengarsipkan</li>
                  </ul>
                </div>
              )}

              {/* Tombol */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading || tahunAkademikStatus === "arsip"} className="bg-primary flex items-center gap-2">
                  <FilePenLine size={18} />
                  {loading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>

                <Link to="/superadmin/informasi-sekolah/semester">
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

export default EditSemester;
