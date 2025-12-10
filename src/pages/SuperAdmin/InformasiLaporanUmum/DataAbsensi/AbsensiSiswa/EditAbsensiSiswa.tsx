import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2Icon, SaveIcon, ArrowLeftIcon, ImageIcon, CircleXIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { absensiSiswaService } from "@/services/absensiSiswaService";

const EditAbsensiSiswa = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [namaSiswa, setNamaSiswa] = useState("");
  const [kelas, setKelas] = useState("");
  const [mataPelajaran, setMataPelajaran] = useState("");
  const [hari, setHari] = useState("");
  const [status, setStatus] = useState<"hadir" | "izin" | "sakit" | "alfa">("hadir");
  const [buktiFoto, setBuktiFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [existingBukti, setExistingBukti] = useState<string | null>(null);

  // ========== FETCH DETAIL DATA ==========
  useEffect(() => {
    if (!id) return;
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);

      // Gunakan getSingleAbsensi untuk fetch by absensi ID
      const response = await absensiSiswaService.getSingleAbsensi(Number(id));

      if (response.status === "success") {
        const data = response.data;

        setNamaSiswa(data.nama_siswa);
        setKelas(data.kelas);
        setMataPelajaran(data.mata_pelajaran);
        setHari(data.hari);
        setStatus(data.status);
        setExistingBukti(data.bukti);

        if (data.bukti) {
          setPreviewUrl(data.bukti);
        }
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: error.response?.data?.message || error.message || "Tidak dapat memuat data absensi.",
      });
      navigate("/superadmin/informasi-laporan-umum/absensi-siswa");
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLE FILE UPLOAD ==========
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi tipe file
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Format file tidak valid",
          text: "Hanya file JPG, JPEG, dan PNG yang diperbolehkan",
        });
        return;
      }

      // Validasi ukuran file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File terlalu besar",
          text: "Ukuran file maksimal 2MB",
        });
        return;
      }

      setBuktiFoto(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ========== HANDLE SUBMIT ==========
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi status izin/sakit harus ada bukti
    if ((status === "izin" || status === "sakit") && !buktiFoto && !existingBukti) {
      Swal.fire({
        icon: "warning",
        title: "Bukti Diperlukan",
        text: "Untuk status izin atau sakit, bukti foto wajib diunggah",
      });
      return;
    }

    try {
      setSaving(true);

      await absensiSiswaService.update(Number(id), {
        status,
        bukti: buktiFoto,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data absensi berhasil diperbarui",
        showConfirmButton: false,
        timer: 1800,
      });

      navigate("/superadmin/informasi-laporan-umum/absensi-siswa");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memperbarui!",
        text: error.response?.data?.message || "Terjadi kesalahan saat memperbarui data.",
      });
    } finally {
      setSaving(false);
    }
  };

  // ========== RENDER ==========
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Absensi Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-siswa")}>
              <ArrowLeftIcon size={16} />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Edit Absensi Siswa</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Form Edit Absensi</CardTitle>
                <CardDescription>Perbarui status kehadiran dan bukti izin siswa</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Info Siswa (Read-only) */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Nama Siswa</Label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{namaSiswa}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Kelas</Label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{kelas}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Mata Pelajaran</Label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{mataPelajaran}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">Hari</Label>
                        <p className="text-base font-semibold text-gray-900 mt-1">{hari}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-base font-medium">
                      Status Kehadiran <span className="text-red-500">*</span>
                    </Label>
                    <Select value={status} onValueChange={(value: "hadir" | "izin" | "sakit" | "alfa") => setStatus(value)}>
                      <SelectTrigger id="status" className="w-full">
                        <SelectValue placeholder="Pilih status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hadir">Hadir</SelectItem>
                        <SelectItem value="izin">Izin</SelectItem>
                        <SelectItem value="sakit">Sakit</SelectItem>
                        <SelectItem value="alfa">Alfa</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-500">Untuk status Izin atau Sakit, bukti foto wajib diunggah</p>
                  </div>

                  {/* Upload Bukti */}
                  <div className="space-y-2">
                    <Label htmlFor="bukti" className="text-base font-medium">
                      Bukti Foto {(status === "izin" || status === "sakit") && <span className="text-red-500">*</span>}
                    </Label>
                    <Input id="bukti" type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="cursor-pointer" disabled={status === "hadir" || status === "alfa"} />
                    <p className="text-sm text-gray-500">Format: JPG, JPEG, PNG. Maksimal 2MB</p>
                  </div>

                  {/* Preview Foto */}
                  {previewUrl && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Preview Bukti</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex justify-center items-center bg-gray-50">
                        <div className="text-center">
                          <img src={previewUrl} alt="Preview bukti" className="max-w-full max-h-96 mx-auto rounded-lg shadow-md" />
                          <p className="text-sm text-gray-500 mt-2">
                            <ImageIcon size={16} className="inline mr-1" />
                            {buktiFoto ? buktiFoto.name : "Bukti saat ini"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button type="button" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-siswa")} disabled={saving} className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90 flex-1">
                      <CircleXIcon size={18} />
                      Batal
                    </Button>
                    <Button type="submit" disabled={saving} className="flex-1 bg-primary">
                      {saving ? (
                        <>
                          <Loader2Icon className="animate-spin" size={18} />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <SaveIcon size={18} />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditAbsensiSiswa;
