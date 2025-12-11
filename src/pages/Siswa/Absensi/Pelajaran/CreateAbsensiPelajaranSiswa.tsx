import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSiswa } from "@/components/SidebarSiswa";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ArrowLeftIcon, SaveIcon, ImageIcon, XCircleIcon, Loader2Icon, CircleXIcon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { absensiSiswaService } from "@/services/absensiSiswaService";
import type { MataPelajaran } from "@/types/absensiSiswa";

const CreateAbsensiPelajaranSiswa = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [mataPelajaranId, setMataPelajaranId] = useState<string>("");
  const [status, setStatus] = useState<"hadir" | "izin" | "sakit" | "alfa">("hadir");
  const [bukti, setBukti] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Dropdown mata pelajaran
  const [mataPelajaranList, setMataPelajaranList] = useState<MataPelajaran[]>([]);
  const [isLoadingMapel, setIsLoadingMapel] = useState(false);

  // Get current date
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = today.toLocaleDateString("id-ID", options);
    setCurrentDate(formattedDate);

    fetchMataPelajaran();
  }, []);

  const fetchMataPelajaran = async () => {
    try {
      setIsLoadingMapel(true);
      const response = await absensiSiswaService.getMataPelajaran();

      const list = Array.isArray(response.data) ? response.data : [];

      // ✅ WORKAROUND: Gunakan pivot_id sebagai pengganti mata_pelajaran_id
      const clean = list
        .filter((mp: any) => mp && typeof mp.pivot_id === "number" && typeof mp.nama_pelajaran === "string")
        .map((mp: any) => ({
          pivot_id: mp.pivot_id,
          // ✅ Karena backend tidak kirim mata_pelajaran_id, gunakan pivot_id
          mata_pelajaran_id: mp.mata_pelajaran_id,
          nama_pelajaran: mp.nama_pelajaran,
        }));

      setMataPelajaranList(clean as MataPelajaran[]);
    } catch (error: any) {

      Swal.fire({
        icon: "error",
        title: "Gagal memuat mata pelajaran!",
        text: error?.response?.data?.message || "Tidak dapat memuat daftar mata pelajaran.",
        timer: 3000,
        showConfirmButton: false,
      });

      setMataPelajaranList([]);
    } finally {
      setIsLoadingMapel(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File terlalu besar!",
          text: "Ukuran file maksimal 2 MB",
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Format file tidak valid!",
          text: "Format file harus JPEG, PNG, atau JPG",
          timer: 3000,
          showConfirmButton: false,
        });
        return;
      }

      setBukti(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setBukti(null);
    setPreviewUrl("");
    const fileInput = document.getElementById("bukti-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mataPelajaranId) {
      Swal.fire({
        icon: "warning",
        title: "Mata pelajaran belum dipilih!",
        text: "Silakan pilih mata pelajaran terlebih dahulu",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    // ✅ Validasi bukti untuk status selain hadir
    if ((status === "izin" || status === "sakit") && !bukti) {
      Swal.fire({
        icon: "warning",
        title: "Bukti wajib diupload!",
        text: `Untuk status ${status}, Anda wajib mengupload bukti`,
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      setIsLoading(true);

      const response = await absensiSiswaService.create({
        mata_pelajaran_id: parseInt(mataPelajaranId),
        status,
        bukti: bukti || undefined,
      });

      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Absensi Berhasil Ditambahkan!",
          html: `
            <div class="text-left">
              <p><strong>Mata Pelajaran:</strong> ${response.data.mata_pelajaran}</p>
              <p><strong>Status:</strong> ${response.data.status}</p>
              <p><strong>Hari:</strong> ${response.data.hari}</p>
              <hr class="my-2">
              <p><strong>Rekapitulasi:</strong></p>
              <p>Hadir: ${response.data.rekapitulasi.hadir}</p>
              <p>Izin: ${response.data.rekapitulasi.izin}</p>
              <p>Sakit: ${response.data.rekapitulasi.sakit}</p>
              <p>Alfa: ${response.data.rekapitulasi.alfa}</p>
            </div>
          `,
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/siswa/data-absensi/pelajaran");
        });
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        Swal.fire({
          icon: "warning",
          title: "Gagal Menambahkan Absensi!",
          text: error.response?.data?.data?.pesan || "Anda sudah absen pelajaran ini hari ini.",
          timer: 3000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Menambahkan Absensi!",
          text: error.response?.data?.message || "Terjadi kesalahan saat menambahkan absensi.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[280px]"}`}>
        <PageTitle title="Tambah Absensi Pelajaran" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate("/siswa/data-absensi/pelajaran")}>
              <ArrowLeftIcon size={18} />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Tambah Absensi Pelajaran</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Form Absensi</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Info Hari */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">
                    <span className="font-semibold">Tanggal:</span> {currentDate}
                  </p>
                </div>

                {/* Mata Pelajaran */}
                <div className="space-y-2">
                  <Label htmlFor="mata-pelajaran">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </Label>

                  {isLoadingMapel ? (
                    <div className="flex items-center gap-2 p-3 border rounded">
                      <Loader2Icon className="animate-spin" size={16} />
                      <span className="text-sm text-gray-600">Memuat mata pelajaran...</span>
                    </div>
                  ) : mataPelajaranList.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">⚠️ Tidak ada mata pelajaran tersedia. Silakan hubungi admin untuk mengatur jadwal pelajaran Anda.</div>
                  ) : (
                    <Select value={mataPelajaranId} onValueChange={setMataPelajaranId}>
                      <SelectTrigger id="mata-pelajaran" className="max-w-xl w-full">
                        <SelectValue placeholder="Pilih Mata Pelajaran" />
                      </SelectTrigger>
                      <SelectContent>
                        {mataPelajaranList.map((mp) => (
                          <SelectItem key={mp.pivot_id} value={mp.mata_pelajaran_id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{mp.nama_pelajaran}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status Kehadiran <span className="text-red-500">*</span>
                  </Label>
                  <Select value={status} onValueChange={(value) => setStatus(value as "hadir" | "izin" | "sakit" | "alfa")}>
                    <SelectTrigger id="status" className="max-w-xl w-full">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hadir">Hadir</SelectItem>
                      <SelectItem value="izin">Izin</SelectItem>
                      <SelectItem value="sakit">Sakit</SelectItem>
                      <SelectItem value="alfa">Alfa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bukti Upload */}
                {(status === "izin" || status === "sakit") && (
                  <div className="space-y-2">
                    <Label htmlFor="bukti-input">
                      Upload Bukti <span className="text-red-500">*</span>
                    </Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {!previewUrl ? (
                        <div>
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">Klik untuk upload gambar</p>
                          <p className="text-xs text-gray-500 mb-3">Format: JPEG, PNG, JPG (Max 2MB)</p>
                          <Input id="bukti-input" type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="hidden" />
                          <Button type="button" variant="outline" onClick={() => document.getElementById("bukti-input")?.click()}>
                            Pilih File
                          </Button>
                        </div>
                      ) : (
                        <div className="relative">
                          <img src={previewUrl} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
                          <Button type="button" variant="destructive" size="sm" className="absolute top-2 right-2" onClick={handleRemoveFile}>
                            <XCircleIcon size={18} />
                            Hapus
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-red-600">* Wajib upload bukti untuk status {status}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <Button type="button" onClick={() => navigate("/siswa/data-absensi/pelajaran")} className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90 flex-1">
                    <CircleXIcon size={18} />
                    Batal
                  </Button>
                  <Button type="submit" disabled={isLoading || mataPelajaranList.length === 0} className="flex-1 bg-primary">
                    {isLoading ? (
                      <>
                        <Loader2Icon className="animate-spin" size={18} />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <SaveIcon size={18} />
                        Simpan Absensi
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default CreateAbsensiPelajaranSiswa;
