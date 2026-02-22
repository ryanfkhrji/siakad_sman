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

// ─────────────────────────────────────────────────────────────────────────────
// Tipe data minimal untuk form edit
// ─────────────────────────────────────────────────────────────────────────────
interface EditFormData {
  nama_siswa: string;
  rombel: string;
  mata_pelajaran: string;
  hari: string;
  status: "hadir" | "izin" | "sakit" | "alfa";
  bukti: string | null;
  tahun_akademik: string;
  semester: string;
}

// ─────────────────────────────────────────────────────────────────────────────
const EditAbsensiSiswa = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // id = absensi_id

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state (data yang ditampilkan)
  const [formData, setFormData] = useState<EditFormData | null>(null);

  // Input yang bisa diubah
  const [status, setStatus] = useState<"hadir" | "izin" | "sakit" | "alfa">("hadir");
  const [buktiFoto, setBuktiFoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // ── Fetch detail absensi ────────────────────────────────────────────────────
  // Response update mengandung semua info yang dibutuhkan untuk pre-fill form.
  // Namun karena kita di halaman EDIT (GET dulu), kita pakai endpoint getAll
  // lalu flatten untuk cari absensi by id — atau lebih tepat, backend sudah
  // memberi response update lengkap. Untuk GET awal kita gunakan getAll +
  // flatten (karena tidak ada endpoint GET single absensi).
  //
  // Strategi: getAll() → flatten semua absensi_id → temukan yang sesuai.
  // Ini sedikit berat, tapi sesuai kondisi backend saat ini.
  // Alternatif lebih ringan: state dari halaman sebelumnya via router state.
  // ─────────────────────────────────────────────────────────────────────────
  const fetchDetail = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const absensiId = Number(id);

      // Kita tidak tahu siswa_id dari URL, jadi ambil getAll lalu flatten
      const res = await absensiSiswaService.getAll();
      if (res.status !== "success") throw new Error("Gagal memuat data");

      // Flatten: tahun → rombel → siswa
      // Tapi getAll hanya memberi rekap pertahun, bukan detail absensi_id.
      // Untuk mendapatkan detail tiap absensi kita butuh getDetail(siswa_id).
      // Karena kita tidak tahu siswa_id, kita perlu cari lewat getDetail
      // semua siswa — ini tidak efisien. Solusi terbaik: simpan siswa_id
      // di URL param, contoh: /edit/:siswaId/:absensiId
      //
      // WORKAROUND saat ini: iterasi getDetail per siswa sampai ketemu.
      // Ini akan dioptimasi jika backend menambah endpoint GET /absensi/:id.

      let found: EditFormData | null = null;

      // Kumpulkan semua siswa_id unik
      const siswaIds = new Set<number>();
      res.data.forEach((t) => t.rombel.forEach((r) => r.siswa.forEach((s) => siswaIds.add(s.siswa_id))));

      for (const siswaId of siswaIds) {
        if (found) break;
        try {
          const detail = await absensiSiswaService.getDetail(siswaId);
          if (detail.status !== "success") continue;

          detail.data.histori_rombel.forEach((rombel) => {
            rombel.periode.forEach((periode) => {
              periode.semester.forEach((sem) => {
                sem.mata_pelajarans.forEach((mapel) => {
                  mapel.absensi.forEach((abs) => {
                    if (abs.absensi_id === absensiId && !found) {
                      found = {
                        nama_siswa: detail.data.nama_siswa,
                        rombel: rombel.nama_rombel,
                        mata_pelajaran: mapel.mata_pelajaran,
                        hari: abs.hari,
                        status: abs.status,
                        bukti: abs.bukti,
                        tahun_akademik: periode.tahun_akademik,
                        semester: sem.semester,
                      };
                    }
                  });
                });
              });
            });
          });
        } catch {
          // lewati siswa yang gagal di-fetch
        }
      }

      if (!found) throw new Error("Data absensi tidak ditemukan");

      // Simpan ke variabel bertipe eksplisit agar TypeScript bisa narrow dengan aman
      const resolvedData: EditFormData = found;
      setFormData(resolvedData);
      setStatus(resolvedData.status);
      if (resolvedData.bukti) setPreviewUrl(resolvedData.bukti);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: error.message || "Tidak dapat memuat data absensi.",
      });
      navigate("/superadmin/informasi-laporan-umum/absensi-siswa");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  // ── Handle file ──────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      Swal.fire({ icon: "error", title: "Format tidak valid", text: "Hanya JPG, JPEG, PNG." });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "File terlalu besar", text: "Maksimal 2 MB." });
      return;
    }

    setBuktiFoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((status === "izin" || status === "sakit") && !buktiFoto && !formData?.bukti) {
      Swal.fire({ icon: "warning", title: "Bukti Diperlukan", text: "Status izin atau sakit wajib menyertakan bukti foto." });
      return;
    }

    try {
      setSaving(true);
      await absensiSiswaService.update(Number(id), { status, bukti: buktiFoto });

      Swal.fire({ icon: "success", title: "Berhasil!", text: "Data absensi berhasil diperbarui.", showConfirmButton: false, timer: 1800 });
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

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Absensi Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-siswa")}>
              <ArrowLeftIcon size={16} /> Kembali
            </Button>
            <h1 className="text-3xl font-bold">Edit Absensi Siswa</h1>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : formData ? (
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Form Edit Absensi</CardTitle>
                <CardDescription>Perbarui status kehadiran dan bukti izin siswa</CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Info read-only */}
                  <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Nama Siswa</Label>
                        <p className="font-semibold text-gray-900 mt-1">{formData.nama_siswa}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Rombel</Label>
                        <p className="font-semibold text-gray-900 mt-1">{formData.rombel}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Mata Pelajaran</Label>
                        <p className="font-semibold text-gray-900 mt-1">{formData.mata_pelajaran}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Tanggal</Label>
                        <p className="font-semibold text-gray-900 mt-1">{formData.hari}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Tahun Akademik</Label>
                        <p className="font-semibold text-gray-900 mt-1">{formData.tahun_akademik}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Semester</Label>
                        <p className="font-semibold text-gray-900 mt-1">{formData.semester}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-base font-medium">
                      Status Kehadiran <span className="text-red-500">*</span>
                    </Label>
                    <Select value={status} onValueChange={(v: "hadir" | "izin" | "sakit" | "alfa") => setStatus(v)}>
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
                    <p className="text-sm text-gray-500">Status Izin atau Sakit wajib menyertakan bukti foto</p>
                  </div>

                  {/* Upload Bukti */}
                  <div className="space-y-2">
                    <Label htmlFor="bukti" className="text-base font-medium">
                      Bukti Foto {(status === "izin" || status === "sakit") && <span className="text-red-500">*</span>}
                    </Label>
                    <Input id="bukti" type="file" accept="image/jpeg,image/png,image/jpg" onChange={handleFileChange} className="cursor-pointer" disabled={status === "hadir" || status === "alfa"} />
                    <p className="text-sm text-gray-500">Format: JPG, JPEG, PNG · Maks 2 MB</p>
                  </div>

                  {/* Preview */}
                  {previewUrl && (
                    <div className="space-y-2">
                      <Label className="text-base font-medium">Preview Bukti</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 flex justify-center">
                        <div className="text-center">
                          <img src={previewUrl} alt="Preview" className="max-w-full max-h-80 mx-auto rounded-lg shadow-md" />
                          <p className="text-sm text-gray-500 mt-2">
                            <ImageIcon size={14} className="inline mr-1" />
                            {buktiFoto ? buktiFoto.name : "Bukti saat ini"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button type="button" onClick={() => navigate("/superadmin/informasi-laporan-umum/absensi-siswa")} disabled={saving} className="bg-muted-foreground hover:bg-muted-foreground/90 flex-1 flex items-center gap-2">
                      <CircleXIcon size={18} /> Batal
                    </Button>
                    <Button type="submit" disabled={saving} className="flex-1 bg-primary flex items-center gap-2">
                      {saving ? (
                        <>
                          <Loader2Icon className="animate-spin" size={18} /> Menyimpan...
                        </>
                      ) : (
                        <>
                          <SaveIcon size={18} /> Simpan Perubahan
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-gray-500 py-8">Data tidak ditemukan</div>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditAbsensiSiswa;
