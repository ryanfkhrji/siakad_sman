import React, { useState, useCallback, memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, Loader2, AlertCircleIcon, CircleXIcon, FilePlus, LinkIcon } from "lucide-react";
import Swal from "sweetalert2";
import { psbService } from "@/services/psbService";
import { Link, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import Footer from "../Footer";
import LogoSekolah from "@/assets/logo-sekolah-42.png";
import { usePsbStatus, PsbClosedMessage } from "@/components/PsbStatusToggle";

// Import service yang sudah ada
// import type { PsbFormData } from '@/types/psb';

interface PsbFormData {
  nama_siswa: string;
  nisn: string;
  jk: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  agama: string;
  alamat: string;
  no_hp_siswa: string;
  nama_ayah: string;
  pekerjaan_ayah: string;
  no_hp_ayah: string;
  nama_ibu: string;
  pekerjaan_ibu: string;
  no_hp_ibu: string;
  nama_wali?: string;
  pekerjaan_wali?: string;
  no_hp_wali?: string;
  sekolah_asal: string;
  alamat_sekolah_asal: string;
  kelas_terakhir?: string;
  nilai_raport_terakhir?: string;
  alasan_pindah?: string;
  berkas_raport: File | null;
  suket_pindah?: File | null;
  berkas_kartu_keluarga: File | null;
  berkas_akta_lahir: File | null;
  foto_siswa: File | null;
}

interface ValidationErrors {
  [key: string]: string[];
}

interface FilePreview {
  url: string;
  name: string;
  type: string;
}

// Komponen FormField di luar - mencegah re-create setiap render
const FormField = memo(
  ({
    label,
    field,
    type = "text",
    required = false,
    placeholder = "",
    value,
    error,
    onChange,
    children,
  }: {
    label: string;
    field: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
    value?: string;
    error?: string[];
    onChange?: (value: string) => void;
    children?: React.ReactNode;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={field}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      {children || <Input id={field} type={type} value={value || ""} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className={error ? "border-red-500" : ""} />}
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error[0]}
        </p>
      )}
    </div>
  )
);

// Komponen FileUploadField di luar
const FileUploadField = memo(
  ({
    label,
    field,
    description,
    allowedTypes,
    required = false,
    error,
    preview,
    onFileChange,
  }: {
    label: string;
    field: string;
    description: string;
    allowedTypes: string[];
    required?: boolean;
    error?: string[];
    preview?: FilePreview | null;
    onFileChange: (file: File | null) => void;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={field}>
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <p className="text-sm text-gray-500">{description}</p>

      <div className="flex items-center gap-4">
        <Input id={field} type="file" onChange={(e) => onFileChange(e.target.files?.[0] || null)} accept={allowedTypes.map((t) => `.${t}`).join(",")} className={error ? "border-red-500" : ""} />
      </div>

      {preview && (
        <div className="mt-2 p-3 bg-gray-50 rounded-lg">
          {preview.url ? (
            <div className="space-y-2">
              <img src={preview.url} alt="Preview" className="w-32 h-32 object-cover rounded border" />
              <p className="text-sm text-gray-600">{preview.name}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-600">{preview.name}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error[0]}
        </p>
      )}
    </div>
  )
);

const FormPsbPublic = () => {
  // CHECK STATUS PSB - TAMBAHKAN DI AWAL
  const { isActive, loading: statusLoading } = usePsbStatus();
  const [activeTab, setActiveTab] = useState("siswa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const navigate = useNavigate();

  const [formData, setFormData] = useState<PsbFormData>({
    nama_siswa: "",
    nisn: "",
    jk: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    agama: "",
    alamat: "",
    no_hp_siswa: "",
    nama_ayah: "",
    pekerjaan_ayah: "",
    no_hp_ayah: "",
    nama_ibu: "",
    pekerjaan_ibu: "",
    no_hp_ibu: "",
    nama_wali: "",
    pekerjaan_wali: "",
    no_hp_wali: "",
    sekolah_asal: "",
    alamat_sekolah_asal: "",
    kelas_terakhir: "",
    nilai_raport_terakhir: "",
    alasan_pindah: "",
    berkas_raport: null,
    suket_pindah: null,
    berkas_kartu_keluarga: null,
    berkas_akta_lahir: null,
    foto_siswa: null,
  });

  // NEW: Fungsi untuk memeriksa apakah semua field wajib sudah terisi
  const checkIfFormIsValid = () => {
    const requiredFields: (keyof PsbFormData)[] = [
      "nama_siswa",
      "nisn",
      "jk",
      "tempat_lahir",
      "tanggal_lahir",
      "agama",
      "alamat",
      "no_hp_siswa",
      "nama_ayah",
      "pekerjaan_ayah",
      "no_hp_ayah",
      "nama_ibu",
      "pekerjaan_ibu",
      "no_hp_ibu",
      "sekolah_asal",
      "alamat_sekolah_asal",
      "berkas_raport",
      "berkas_kartu_keluarga",
      "berkas_akta_lahir",
      "foto_siswa",
    ];

    return requiredFields.every((field) => {
      const value = formData[field];

      if (typeof value === "string") {
        // Untuk string, periksa apakah tidak kosong atau hanya whitespace
        return value.trim() !== "";
      } // Untuk File/null, periksa apakah bukan null

      return value !== null;
    });
  };

  const [filePreviews, setFilePreviews] = useState<{
    [key: string]: FilePreview | null;
  }>({
    foto_siswa: null,
    berkas_raport: null,
    suket_pindah: null,
    berkas_kartu_keluarga: null,
    berkas_akta_lahir: null,
  });

  // Gunakan useCallback untuk mencegah re-create function
  const handleInputChange = useCallback((field: keyof PsbFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const handleFileChange = useCallback((field: keyof PsbFormData, file: File | null, allowedTypes: string[]) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });

    if (!file) {
      setFormData((prev) => ({ ...prev, [field]: null }));
      setFilePreviews((prev) => ({ ...prev, [field]: null }));
      return;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      setErrors((prev) => ({
        ...prev,
        [field]: [`Format file tidak didukung. Hanya ${allowedTypes.join(", ")} yang diperbolehkan`],
      }));
      return;
    }

    if (file.size > 2048 * 1024) {
      setErrors((prev) => ({
        ...prev,
        [field]: ["Ukuran file maksimal 2 MB"],
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: file }));

    if (["jpg", "jpeg", "png"].includes(fileExtension)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews((prev) => ({
          ...prev,
          [field]: {
            url: reader.result as string,
            name: file.name,
            type: file.type,
          },
        }));
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviews((prev) => ({
        ...prev,
        [field]: {
          url: "",
          name: file.name,
          type: file.type,
        },
      }));
    }
  }, []);

  function generateNomorPendaftaran() {
    const year = new Date().getFullYear();
    const key = `psb_counter_${year}`;

    // Ambil counter tahun ini dari localStorage (default 0 kalau belum ada)
    let counter = parseInt(localStorage.getItem(key) || "0", 10);

    // Naikkan 1
    counter++;

    // Simpan kembali counter baru
    localStorage.setItem(key, counter.toString());

    // Kembalikan nomor pendaftaran lengkap
    return `PSB/${year}/${counter.toString().padStart(4, "0")}`;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Uncomment untuk menggunakan service sebenarnya
      const response = await psbService.create(formData);

      // Simulasi API call (hapus saat produksi)
      // await new Promise((resolve) => setTimeout(resolve, 1500));

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data pendaftaran siswa berhasil disimpan",
        showConfirmButton: false,
        timer: 1800,
      });

      // Redirect ke halaman sukses dengan semua data
      navigate("/public-psb/psb-success", {
        state: {
          data: {
            ...formData,
            nomor_pendaftaran: response.data?.nomor_pendaftaran || generateNomorPendaftaran(),
            tanggal_daftar: new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }),
          },
        },
      });
    } catch (error: any) {
      if (error.response?.data) {
        const responseData = error.response.data;

        if (responseData.status === "error" && responseData.errors) {
          setErrors(responseData.errors);

          Swal.fire({
            icon: "error",
            title: "Validasi Gagal",
            text: responseData.message || "Terdapat kesalahan pada form yang Anda isi",
            showConfirmButton: false,
            timer: 1800,
          });

          const errorFields = Object.keys(responseData.errors);
          if (errorFields.length > 0) {
            const firstError = errorFields[0];

            if (["nama_siswa", "nisn", "jk", "tempat_lahir", "tanggal_lahir", "agama", "alamat", "no_hp_siswa"].includes(firstError)) {
              setActiveTab("siswa");
            } else if (["nama_ayah", "pekerjaan_ayah", "no_hp_ayah"].includes(firstError)) {
              setActiveTab("ayah");
            } else if (["nama_ibu", "pekerjaan_ibu", "no_hp_ibu"].includes(firstError)) {
              setActiveTab("ibu");
            } else if (["nama_wali", "pekerjaan_wali", "no_hp_wali"].includes(firstError)) {
              setActiveTab("wali");
            } else if (["sekolah_asal", "alamat_sekolah_asal", "kelas_terakhir", "nilai_raport_terakhir", "alasan_pindah"].includes(firstError)) {
              setActiveTab("sekolah");
            } else {
              setActiveTab("berkas");
            }
          }
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Terjadi kesalahan yang tidak terduga. Silakan coba lagi.",
          showConfirmButton: false,
          timer: 1800,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. Jika masih loading status
  if (statusLoading) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 md:px-0">
        <PageTitle title="Form Penerimaan Siswa Baru" />

        {/* Header */}
        <Card className="overflow-hidden border-0 shadow bg-linear-to-br from-indigo-50 via-white to-purple-50">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center md:flex-row flex-col gap-2">
                <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="w-10 h-10" />
                <h5 className="text-xl font-bold text-muted-foreground">SMA Negeri 42 Jakarta</h5>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Loading State */}
        <div className="min-h-screen flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="ml-2 mt-2 text-gray-600">Memuat...</p>
        </div>

        <Footer />
      </div>
    );
  }

  // 2. Jika pendaftaran tidak aktif
  if (!isActive) {
    return (
      <div className="mx-auto max-w-7xl w-full px-4 md:px-0">
        <PageTitle title="Pendaftaran Ditutup" />

        {/* HeaderLayouts */}
        <Card className="overflow-hidden border-0 shadow bg-linear-to-br from-indigo-50 via-white to-purple-50 mb-8">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center md:flex-row flex-col gap-2">
                <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="w-10 h-10" />
                <h5 className="text-xl font-bold text-muted-foreground">SMA Negeri 42 Jakarta</h5>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Closed Message */}
        <PsbClosedMessage />

        {/* FooterLayouts */}
        <footer>
          <Card className="overflow-hidden border-0 shadow mt-8 bg-linear-to-br from-indigo-50 via-white to-purple-50">
            <CardFooter>
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  <div className="flex md:flex-row flex-col items-center gap-3 col-span-2">
                    <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="w-15 h-15" />
                    <div>
                      <h2 className="text-normal font-bold text-muted-foreground text-center md:text-left">SMA Negeri 42 Jakarta</h2>
                      <p className="text-sm font-medium text-muted-foreground leading-relaxed text-center md:text-left">Jl. Rajawali Raya, Halim Perdana Kusumah, Kec. Makasar, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta.</p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-normal font-bold text-muted-foreground">Sosial Media</h2>
                    <div className="flex flex-row">
                      <Link to={"https://www.instagram.com/sman42.official/"} target="_blank">
                        <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                          <LinkIcon /> Instagram
                        </Button>
                      </Link>

                      <Link to={"https://www.tiktok.com/@sman42jkt.officia?_t=8qmFQ3qYS3D&_r=1"} target="_blank">
                        <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                          <LinkIcon /> Tiktok
                        </Button>
                      </Link>

                      <Link to={"https://www.youtube.com/@sman42jkt?si=n59-TPNibdDAE-nr"} target="_blank">
                        <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                          <LinkIcon /> Youtube
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>
        </footer>

        <Footer />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 md:px-0">
      <PageTitle title="Form Penerimaan Siswa Baru" />

      {/* HeaderLayouts */}
      <Card className="overflow-hidden border-0 shadow bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center md:flex-row flex-col gap-2">
              <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="w-10 h-10" />
              <h5 className="text-xl font-bold text-muted-foreground">SMA Negeri 42 Jakarta</h5>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card className="w-full mt-4">
        <CardHeader>
          <CardTitle>Formulir Pendaftaran Siswa Baru</CardTitle>
          <CardDescription>Lengkapi semua data dengan benar. Field dengan tanda * wajib diisi.</CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
                <TabsTrigger value="siswa">Data Siswa</TabsTrigger>
                <TabsTrigger value="ayah">Data Ayah</TabsTrigger>
                <TabsTrigger value="ibu">Data Ibu</TabsTrigger>
                <TabsTrigger value="wali">Data Wali</TabsTrigger>
                <TabsTrigger value="sekolah">Sekolah Asal</TabsTrigger>
                <TabsTrigger value="berkas">Upload Berkas</TabsTrigger>
              </TabsList>

              {/* Tab Data Siswa */}
              <TabsContent value="siswa" className="space-y-4">
                <FormField label="Nama Lengkap Siswa" field="nama_siswa" required placeholder="Masukkan nama lengkap" value={formData.nama_siswa} error={errors.nama_siswa} onChange={(value) => handleInputChange("nama_siswa", value)} />
                <FormField label="NISN" field="nisn" required placeholder="Nomor Induk Siswa Nasional" value={formData.nisn} error={errors.nisn} onChange={(value) => handleInputChange("nisn", value)} />

                <FormField label="Jenis Kelamin" field="jk" required error={errors.jk}>
                  <Select value={formData.jk} onValueChange={(value) => handleInputChange("jk", value)}>
                    <SelectTrigger className={errors.jk ? "border-red-500" : ""}>
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Tempat Lahir" field="tempat_lahir" required placeholder="Kota/Kabupaten" value={formData.tempat_lahir} error={errors.tempat_lahir} onChange={(value) => handleInputChange("tempat_lahir", value)} />
                  <FormField label="Tanggal Lahir" field="tanggal_lahir" type="date" required value={formData.tanggal_lahir} error={errors.tanggal_lahir} onChange={(value) => handleInputChange("tanggal_lahir", value)} />
                </div>

                <FormField label="Agama" field="agama" required error={errors.agama}>
                  <Select value={formData.agama} onValueChange={(value) => handleInputChange("agama", value)}>
                    <SelectTrigger className={errors.agama ? "border-red-500" : ""}>
                      <SelectValue placeholder="Pilih agama" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Islam">Islam</SelectItem>
                      <SelectItem value="Kristen">Kristen</SelectItem>
                      <SelectItem value="Katolik">Katolik</SelectItem>
                      <SelectItem value="Hindu">Hindu</SelectItem>
                      <SelectItem value="Buddha">Buddha</SelectItem>
                      <SelectItem value="Konghucu">Konghucu</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Alamat Lengkap" field="alamat" required error={errors.alamat}>
                  <Textarea id="alamat" value={formData.alamat} onChange={(e) => handleInputChange("alamat", e.target.value)} placeholder="Masukkan alamat lengkap" className={errors.alamat ? "border-red-500" : ""} rows={3} />
                </FormField>

                <FormField label="No. HP Siswa" field="no_hp_siswa" required placeholder="08xx-xxxx-xxxx" value={formData.no_hp_siswa} error={errors.no_hp_siswa} onChange={(value) => handleInputChange("no_hp_siswa", value)} />
              </TabsContent>

              {/* Tab Data Ayah */}
              <TabsContent value="ayah" className="space-y-4">
                <FormField label="Nama Ayah" field="nama_ayah" required placeholder="Nama lengkap ayah" value={formData.nama_ayah} error={errors.nama_ayah} onChange={(value) => handleInputChange("nama_ayah", value)} />
                <FormField label="Pekerjaan Ayah" field="pekerjaan_ayah" required placeholder="Pekerjaan" value={formData.pekerjaan_ayah} error={errors.pekerjaan_ayah} onChange={(value) => handleInputChange("pekerjaan_ayah", value)} />
                <FormField label="No. HP Ayah" field="no_hp_ayah" required placeholder="08xx-xxxx-xxxx" value={formData.no_hp_ayah} error={errors.no_hp_ayah} onChange={(value) => handleInputChange("no_hp_ayah", value)} />
              </TabsContent>

              {/* Tab Data Ibu */}
              <TabsContent value="ibu" className="space-y-4">
                <FormField label="Nama Ibu" field="nama_ibu" required placeholder="Nama lengkap ibu" value={formData.nama_ibu} error={errors.nama_ibu} onChange={(value) => handleInputChange("nama_ibu", value)} />
                <FormField label="Pekerjaan Ibu" field="pekerjaan_ibu" required placeholder="Pekerjaan" value={formData.pekerjaan_ibu} error={errors.pekerjaan_ibu} onChange={(value) => handleInputChange("pekerjaan_ibu", value)} />
                <FormField label="No. HP Ibu" field="no_hp_ibu" required placeholder="08xx-xxxx-xxxx" value={formData.no_hp_ibu} error={errors.no_hp_ibu} onChange={(value) => handleInputChange("no_hp_ibu", value)} />
              </TabsContent>

              {/* Tab Data Wali */}
              <TabsContent value="wali" className="space-y-4">
                <Alert className="border border-yellow-200 bg-amber-400/10">
                  <AlertDescription>
                    <div className="flex items-center justify-between md:flex-row flex-col gap-1 text-yellow-500">
                      <AlertCircleIcon size={18} />
                      Data wali bersifat opsional. Isi jika siswa tinggal bersama wali, jika tidak maka isi "Tidak ada".
                    </div>
                  </AlertDescription>
                </Alert>
                <FormField label="Nama Wali" field="nama_wali" placeholder="Nama lengkap wali (opsional)" value={formData.nama_wali} error={errors.nama_wali} onChange={(value) => handleInputChange("nama_wali", value)} />
                <FormField label="Pekerjaan Wali" field="pekerjaan_wali" placeholder="Pekerjaan (opsional)" value={formData.pekerjaan_wali} error={errors.pekerjaan_wali} onChange={(value) => handleInputChange("pekerjaan_wali", value)} />
                <FormField label="No. HP Wali" field="no_hp_wali" placeholder="08xx-xxxx-xxxx (opsional)" value={formData.no_hp_wali} error={errors.no_hp_wali} onChange={(value) => handleInputChange("no_hp_wali", value)} />
              </TabsContent>

              {/* Tab Sekolah Asal */}
              <TabsContent value="sekolah" className="space-y-4">
                <FormField
                  label="Nama Sekolah Asal"
                  field="sekolah_asal"
                  required
                  placeholder="Nama sekolah lengkap"
                  value={formData.sekolah_asal}
                  error={errors.sekolah_asal}
                  onChange={(value) => handleInputChange("sekolah_asal", value)}
                />
                <FormField label="Alamat Sekolah Asal" field="alamat_sekolah_asal" required error={errors.alamat_sekolah_asal}>
                  <Textarea
                    id="alamat_sekolah_asal"
                    value={formData.alamat_sekolah_asal}
                    onChange={(e) => handleInputChange("alamat_sekolah_asal", e.target.value)}
                    placeholder="Alamat lengkap sekolah asal"
                    className={errors.alamat_sekolah_asal ? "border-red-500" : ""}
                    rows={3}
                  />
                </FormField>
                <FormField
                  label="Kelas Terakhir"
                  field="kelas_terakhir"
                  placeholder="Contoh: X, XI, XII (opsional)"
                  value={formData.kelas_terakhir}
                  error={errors.kelas_terakhir}
                  onChange={(value) => handleInputChange("kelas_terakhir", value)}
                />
                <FormField
                  label="Nilai Raport Terakhir"
                  field="nilai_raport_terakhir"
                  placeholder="Rata-rata nilai (opsional)"
                  value={formData.nilai_raport_terakhir}
                  error={errors.nilai_raport_terakhir}
                  onChange={(value) => handleInputChange("nilai_raport_terakhir", value)}
                />

                <Alert className="border border-yellow-200 bg-amber-400/10">
                  <AlertDescription>
                    <div className="flex items-center justify-between md:flex-row flex-col gap-1 text-yellow-500">
                      <AlertCircleIcon size={18} />
                      Jika bukan siswa pindahan maka di isi "Bukan Pindahan".
                    </div>
                  </AlertDescription>
                </Alert>
                <FormField label="Alasan Pindah" field="alasan_pindah" error={errors.alasan_pindah}>
                  <Textarea id="alasan_pindah" value={formData.alasan_pindah || ""} onChange={(e) => handleInputChange("alasan_pindah", e.target.value)} placeholder="Jelaskan alasan pindah sekolah (opsional)" rows={3} />
                </FormField>
              </TabsContent>

              {/* Tab Upload Berkas */}
              <TabsContent value="berkas" className="space-y-6">
                <Alert className="border border-yellow-200 bg-amber-400/10">
                  <AlertDescription>
                    <div className="flex items-center justify-between md:flex-row flex-col gap-1 text-yellow-500">
                      <AlertCircleIcon size={18} />
                      Pastikan file yang diupload sesuai format dan ukuran maksimal 2MB.
                    </div>
                  </AlertDescription>
                </Alert>

                <FileUploadField
                  label="Foto Siswa"
                  field="foto_siswa"
                  description="Upload foto formal siswa dengan latar belakang polos (JPG, JPEG, PNG)"
                  allowedTypes={["jpg", "jpeg", "png"]}
                  required
                  error={errors.foto_siswa}
                  preview={filePreviews.foto_siswa}
                  onFileChange={(file) => handleFileChange("foto_siswa", file, ["jpg", "jpeg", "png"])}
                />

                <FileUploadField
                  label="Berkas Raport"
                  field="berkas_raport"
                  description="Upload foto raport semester terakhir (JPG, JPEG, PNG)"
                  allowedTypes={["jpg", "jpeg", "png"]}
                  required
                  error={errors.berkas_raport}
                  preview={filePreviews.berkas_raport}
                  onFileChange={(file) => handleFileChange("berkas_raport", file, ["jpg", "jpeg", "png"])}
                />

                <Alert className="border border-yellow-200 bg-amber-400/10">
                  <AlertDescription>
                    <div className="flex items-center justify-between md:flex-row flex-col gap-1 text-yellow-500">
                      <AlertCircleIcon size={18} />
                      Kalau bukan siswa pindahan maka tidak perlu upload surat keterangan pindah.
                    </div>
                  </AlertDescription>
                </Alert>
                <FileUploadField
                  label="Surat Keterangan Pindah"
                  field="suket_pindah"
                  description="Upload file PDF surat keterangan pindah dari sekolah asal (PDF)"
                  allowedTypes={["pdf"]}
                  error={errors.suket_pindah}
                  preview={filePreviews.suket_pindah}
                  onFileChange={(file) => handleFileChange("suket_pindah", file, ["pdf"])}
                />

                <FileUploadField
                  label="Kartu Keluarga"
                  field="berkas_kartu_keluarga"
                  description="Upload foto Kartu Keluarga asli yang masih berlaku (JPG, JPEG, PNG)"
                  allowedTypes={["jpg", "jpeg", "png"]}
                  required
                  error={errors.berkas_kartu_keluarga}
                  preview={filePreviews.berkas_kartu_keluarga}
                  onFileChange={(file) => handleFileChange("berkas_kartu_keluarga", file, ["jpg", "jpeg", "png"])}
                />

                <FileUploadField
                  label="Akta Kelahiran"
                  field="berkas_akta_lahir"
                  description="Upload foto Akta Kelahiran asli (JPG, JPEG, PNG)"
                  allowedTypes={["jpg", "jpeg", "png"]}
                  required
                  error={errors.berkas_akta_lahir}
                  preview={filePreviews.berkas_akta_lahir}
                  onFileChange={(file) => handleFileChange("berkas_akta_lahir", file, ["jpg", "jpeg", "png"])}
                />
              </TabsContent>
            </Tabs>

            <div className="flex gap-4 mt-8 pt-6 border-t">
              <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90" onClick={() => window.history.back()} disabled={isSubmitting}>
                <CircleXIcon size={18} />
                Batal
              </Button>
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !checkIfFormIsValid()} className="flex-1">
                <FilePlus size={18} />
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Data"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FooterLayouts */}
      <footer>
        <Card className="overflow-hidden border-0 shadow mt-8 bg-linear-to-br from-indigo-50 via-white to-purple-50">
          <CardFooter>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex md:flex-row flex-col items-center gap-3 col-span-2">
                  <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="w-15 h-15" />
                  <div>
                    <h2 className="text-normal font-bold text-muted-foreground text-center md:text-left">SMA Negeri 42 Jakarta</h2>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed text-center md:text-left">Jl. Rajawali Raya, Halim Perdana Kusumah, Kec. Makasar, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta.</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-normal font-bold text-muted-foreground">Sosial Media</h2>
                  <div className="flex flex-row">
                    <Link to={"https://www.instagram.com/sman42.official/"} target="_blank">
                      <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                        <LinkIcon /> Instagram
                      </Button>
                    </Link>

                    <Link to={"https://www.tiktok.com/@sman42jkt.officia?_t=8qmFQ3qYS3D&_r=1"} target="_blank">
                      <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                        <LinkIcon /> Tiktok
                      </Button>
                    </Link>

                    <Link to={"https://www.youtube.com/@sman42jkt?si=n59-TPNibdDAE-nr"} target="_blank">
                      <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                        <LinkIcon /> Youtube
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </footer>

      <Footer />
    </div>
  );
};

export default FormPsbPublic;
