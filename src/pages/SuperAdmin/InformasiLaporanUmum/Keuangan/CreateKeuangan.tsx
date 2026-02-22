import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { keuanganService } from "@/services/keuanganService";
import { Card, CardContent } from "@/components/ui/card";

const CreateKeuangan = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_akun: "",
    debit: "",
    kredit: "",
    keterangan: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama_akun.trim()) {
      newErrors.nama_akun = "Nama akun wajib diisi";
    }
    if (!formData.debit.trim()) {
      newErrors.debit = "Debit wajib diisi";
    } else if (isNaN(Number(formData.debit)) || Number(formData.debit) < 0) {
      newErrors.debit = "Debit harus berupa angka positif";
    }
    if (!formData.kredit.trim()) {
      newErrors.kredit = "Kredit wajib diisi";
    } else if (isNaN(Number(formData.kredit)) || Number(formData.kredit) < 0) {
      newErrors.kredit = "Kredit harus berupa angka positif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await keuanganService.create({
        nama_akun: formData.nama_akun,
        debit: Number(formData.debit),
        kredit: Number(formData.kredit),
        keterangan: formData.keterangan,
      });
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data keuangan berhasil ditambahkan",
        showConfirmButton: false,
        timer: 1800,
      });
      navigate("/superadmin/informasi-laporan-umum/data-keuangan");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: error.response?.data?.message || "Terjadi kesalahan saat menyimpan data",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Buat Data Keuangan" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Buat Data Keuangan</h1>

          <Card>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nama_akun">
                    Nama Akun <span className="text-red-500">*</span>
                  </Label>
                  <Input id="nama_akun" name="nama_akun" value={formData.nama_akun} onChange={handleChange} placeholder="Masukkan nama akun" className={errors.nama_akun ? "border-red-500" : ""} />
                  {errors.nama_akun && <p className="text-red-500 text-sm">{errors.nama_akun}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="debit">
                      Debit <span className="text-red-500">*</span>
                    </Label>
                    <Input id="debit" name="debit" type="number" value={formData.debit} onChange={handleChange} placeholder="0" min="0" step="0.01" className={errors.debit ? "border-red-500" : ""} />
                    {errors.debit && <p className="text-red-500 text-sm">{errors.debit}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kredit">
                      Kredit <span className="text-red-500">*</span>
                    </Label>
                    <Input id="kredit" name="kredit" type="number" value={formData.kredit} onChange={handleChange} placeholder="0" min="0" step="0.01" className={errors.kredit ? "border-red-500" : ""} />
                    {errors.kredit && <p className="text-red-500 text-sm">{errors.kredit}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keterangan">Keterangan</Label>
                  <Textarea id="keterangan" name="keterangan" value={formData.keterangan} onChange={handleChange} placeholder="Masukkan keterangan (opsional)" rows={4} />
                </div>

                <div className="flex gap-2 justify-start">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2Icon className="animate-spin" size={18} /> : <FilePlus size={18} />}
                    {loading ? "Menyimpan..." : "Simpan"}
                  </Button>
                  <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90" onClick={() => navigate("/superadmin/informasi-laporan-umum/data-keuangan")} disabled={loading}>
                    <CircleXIcon size={18} />
                    Batal
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

export default CreateKeuangan;
