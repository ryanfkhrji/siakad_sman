import React, { useState, useEffect, useCallback, memo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, AlertCircle, Loader2, X, AlertCircleIcon, CircleXIcon, FilePlus, Loader2Icon } from "lucide-react";
import Swal from "sweetalert2";
import { psbService } from "@/services/psbService";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import PageTitle from "@/components/PageTitle";
import Footer from "@/pages/Footer";

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
  isExisting?: boolean;
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
    onRemove,
  }: {
    label: string;
    field: string;
    description: string;
    allowedTypes: string[];
    required?: boolean;
    error?: string[];
    preview?: FilePreview | null;
    onFileChange: (file: File | null) => void;
    onRemove: () => void;
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
        <div className="mt-2 p-3 bg-gray-50 rounded-lg border relative">
          <Button type="button" variant="ghost" size="sm" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>

          {preview.url && preview.type !== "pdf" ? (
            <div className="space-y-2">
              <img src={preview.url} alt="Preview" className="w-32 h-32 object-cover rounded border" />
              <p className="text-sm text-gray-600">
                {preview.name}
                {preview.isExisting && <span className="text-blue-600 ml-2">(File saat ini)</span>}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-gray-400" />
              <p className="text-sm text-gray-600">
                {preview.name}
                {preview.isExisting && <span className="text-blue-600 ml-2">(File saat ini)</span>}
              </p>
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

const EditPsb = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("siswa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  const [filePreviews, setFilePreviews] = useState<{
    [key: string]: FilePreview | null;
  }>({
    foto_siswa: null,
    berkas_raport: null,
    suket_pindah: null,
    berkas_kartu_keluarga: null,
    berkas_akta_lahir: null,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "ID tidak valid",
          showConfirmButton: true,
        }).then(() => {
          navigate("/superadmin/psb");
        });
        return;
      }

      setIsLoading(true);
      try {
        const response = await psbService.getDetail(Number(id));
        const data = response.data;

        setFormData({
          nama_siswa: data.nama_siswa || "",
          nisn: data.nisn || "",
          jk: data.jk || "",
          tempat_lahir: data.tempat_lahir || "",
          tanggal_lahir: data.tanggal_lahir || "",
          agama: data.agama || "",
          alamat: data.alamat || "",
          no_hp_siswa: data.no_hp_siswa || "",
          nama_ayah: data.data_ayah?.nama_ayah || "",
          pekerjaan_ayah: data.data_ayah?.pekerjaan_ayah || "",
          no_hp_ayah: data.data_ayah?.no_hp_ayah || "",
          nama_ibu: data.data_ibu?.nama_ibu || "",
          pekerjaan_ibu: data.data_ibu?.pekerjaan_ibu || "",
          no_hp_ibu: data.data_ibu?.no_hp_ibu || "",
          nama_wali: data.data_wali?.nama_wali || "",
          pekerjaan_wali: data.data_wali?.pekerjaan_wali || "",
          no_hp_wali: data.data_wali?.no_hp_wali || "",
          sekolah_asal: data.sekolah_asal || "",
          alamat_sekolah_asal: data.alamat_sekolah_asal || "",
          kelas_terakhir: data.kelas_terakhir || "",
          nilai_raport_terakhir: data.nilai_raport_terakhir || "",
          alasan_pindah: data.alasan_pindah || "",
          berkas_raport: null,
          suket_pindah: null,
          berkas_kartu_keluarga: null,
          berkas_akta_lahir: null,
          foto_siswa: null,
        });

        setFilePreviews({
          foto_siswa: data.foto_siswa ? { url: data.foto_siswa, name: "Foto siswa saat ini", type: "image", isExisting: true } : null,
          berkas_raport: data.berkas_raport ? { url: data.berkas_raport, name: "Berkas raport saat ini", type: "image", isExisting: true } : null,
          suket_pindah: data.suket_pindah ? { url: data.suket_pindah, name: "Surat pindah saat ini", type: "pdf", isExisting: true } : null,
          berkas_kartu_keluarga: data.berkas_kartu_keluarga ? { url: data.berkas_kartu_keluarga, name: "Kartu keluarga saat ini", type: "image", isExisting: true } : null,
          berkas_akta_lahir: data.berkas_akta_lahir ? { url: data.berkas_akta_lahir, name: "Akta lahir saat ini", type: "image", isExisting: true } : null,
        });
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: error.response?.data?.message || "Terjadi kesalahan saat memuat data",
          showConfirmButton: true,
        }).then(() => {
          navigate("/superadmin/psb");
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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
            isExisting: false,
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
          isExisting: false,
        },
      }));
    }
  }, []);

  const handleRemoveFile = useCallback((field: keyof PsbFormData) => {
    setFormData((prev) => ({ ...prev, [field]: null }));
    setFilePreviews((prev) => ({ ...prev, [field]: null }));
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "ID tidak valid",
        showConfirmButton: false,
        timer: 1800,
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const updateData: Partial<PsbFormData> = {};

      Object.keys(formData).forEach((key) => {
        const fieldKey = key as keyof PsbFormData;
        if (formData[fieldKey] !== null && formData[fieldKey] !== undefined) {
          if (!(formData[fieldKey] instanceof File)) {
            updateData[fieldKey] = formData[fieldKey] as any;
          }
        }
      });

      const fileFields: (keyof PsbFormData)[] = ["foto_siswa", "berkas_raport", "suket_pindah", "berkas_kartu_keluarga", "berkas_akta_lahir"];

      fileFields.forEach((field) => {
        if (formData[field] instanceof File) {
          updateData[field] = formData[field] as any;
        }
      });

      await psbService.update(Number(id), updateData);

      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data pendaftaran siswa berhasil diperbarui",
        showConfirmButton: false,
        timer: 1800,
      });

      navigate("/superadmin/psb");
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

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Pendaftaran Siswa Baru" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Pendaftaran Siswa Baru</h1>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Edit Data Pendaftaran Siswa Baru</CardTitle>
                  <CardDescription>Perbarui data siswa. Field dengan tanda * wajib diisi.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="mb-6">
                    <AlertDescription>Anda dapat mengganti file dengan upload file baru. Jika tidak ingin mengganti, biarkan kosong.</AlertDescription>
                  </Alert>

                  <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
                        <TabsTrigger value="siswa">Data Siswa</TabsTrigger>
                        <TabsTrigger value="ayah">Data Ayah</TabsTrigger>
                        <TabsTrigger value="ibu">Data Ibu</TabsTrigger>
                        <TabsTrigger value="wali">Data Wali</TabsTrigger>
                        <TabsTrigger value="sekolah">Sekolah Asal</TabsTrigger>
                        <TabsTrigger value="berkas">Upload Berkas</TabsTrigger>
                      </TabsList>

                      <TabsContent value="siswa" className="space-y-4">
                        <FormField
                          label="Nama Lengkap Siswa"
                          field="nama_siswa"
                          required
                          placeholder="Masukkan nama lengkap"
                          value={formData.nama_siswa}
                          error={errors.nama_siswa}
                          onChange={(value) => handleInputChange("nama_siswa", value)}
                        />
                        <FormField label="NISN" field="nisn" required placeholder="Nomor Induk Siswa Nasional" value={formData.nisn} error={errors.nisn} onChange={(value) => handleInputChange("nisn", value)} />

                        <FormField label="Jenis Kelamin" field="jk" required error={errors.jk}>
                          <Select value={formData.jk || ""} onValueChange={(value) => handleInputChange("jk", value)}>
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
                          <Select value={formData.agama || ""} onValueChange={(value) => handleInputChange("agama", value)}>
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
                          <Textarea id="alamat" value={formData.alamat || ""} onChange={(e) => handleInputChange("alamat", e.target.value)} placeholder="Masukkan alamat lengkap" className={errors.alamat ? "border-red-500" : ""} rows={3} />
                        </FormField>

                        <FormField label="No. HP Siswa" field="no_hp_siswa" required placeholder="08xx-xxxx-xxxx" value={formData.no_hp_siswa} error={errors.no_hp_siswa} onChange={(value) => handleInputChange("no_hp_siswa", value)} />
                      </TabsContent>

                      <TabsContent value="ayah" className="space-y-4">
                        <FormField label="Nama Ayah" field="nama_ayah" required placeholder="Nama lengkap ayah" value={formData.nama_ayah} error={errors.nama_ayah} onChange={(value) => handleInputChange("nama_ayah", value)} />
                        <FormField
                          label="Pekerjaan Ayah"
                          field="pekerjaan_ayah"
                          required
                          placeholder="Pekerjaan"
                          value={formData.pekerjaan_ayah}
                          error={errors.pekerjaan_ayah}
                          onChange={(value) => handleInputChange("pekerjaan_ayah", value)}
                        />
                        <FormField label="No. HP Ayah" field="no_hp_ayah" required placeholder="08xx-xxxx-xxxx" value={formData.no_hp_ayah} error={errors.no_hp_ayah} onChange={(value) => handleInputChange("no_hp_ayah", value)} />
                      </TabsContent>

                      <TabsContent value="ibu" className="space-y-4">
                        <FormField label="Nama Ibu" field="nama_ibu" required placeholder="Nama lengkap ibu" value={formData.nama_ibu} error={errors.nama_ibu} onChange={(value) => handleInputChange("nama_ibu", value)} />
                        <FormField label="Pekerjaan Ibu" field="pekerjaan_ibu" required placeholder="Pekerjaan" value={formData.pekerjaan_ibu} error={errors.pekerjaan_ibu} onChange={(value) => handleInputChange("pekerjaan_ibu", value)} />
                        <FormField label="No. HP Ibu" field="no_hp_ibu" required placeholder="08xx-xxxx-xxxx" value={formData.no_hp_ibu} error={errors.no_hp_ibu} onChange={(value) => handleInputChange("no_hp_ibu", value)} />
                      </TabsContent>

                      <TabsContent value="wali" className="space-y-4">
                        <Alert className="border border-yellow-200 bg-amber-400/10">
                          <AlertDescription>
                            <div className="flex items-center justify-between md:flex-row flex-col gap-1 text-yellow-500">
                              <AlertCircleIcon size={18} />
                              Data wali bersifat opsional. Isi jika siswa tinggal bersama wali.
                            </div>
                          </AlertDescription>
                        </Alert>
                        <FormField label="Nama Wali" field="nama_wali" placeholder="Nama lengkap wali (opsional)" value={formData.nama_wali} error={errors.nama_wali} onChange={(value) => handleInputChange("nama_wali", value)} />
                        <FormField
                          label="Pekerjaan Wali"
                          field="pekerjaan_wali"
                          placeholder="Pekerjaan (opsional)"
                          value={formData.pekerjaan_wali}
                          error={errors.pekerjaan_wali}
                          onChange={(value) => handleInputChange("pekerjaan_wali", value)}
                        />
                        <FormField label="No. HP Wali" field="no_hp_wali" placeholder="08xx-xxxx-xxxx (opsional)" value={formData.no_hp_wali} error={errors.no_hp_wali} onChange={(value) => handleInputChange("no_hp_wali", value)} />
                      </TabsContent>

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
                            value={formData.alamat_sekolah_asal || ""}
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

                      <TabsContent value="berkas" className="space-y-6">
                        <Alert className="border border-yellow-200 bg-amber-400/10">
                          <AlertDescription>
                            <AlertCircleIcon size={18} />
                            <div className="flex items-center justify-between md:flex-row flex-col gap-1 text-yellow-500">Upload file baru hanya jika ingin mengganti. Jika tidak, file lama akan tetap digunakan, maksimal ukuran 2MB.</div>
                          </AlertDescription>
                        </Alert>

                        <FileUploadField
                          label="Foto Siswa"
                          field="foto_siswa"
                          description="Upload foto formal siswa dengan latar belakang polos (JPG, JPEG, PNG)"
                          allowedTypes={["jpg", "jpeg", "png"]}
                          error={errors.foto_siswa}
                          preview={filePreviews.foto_siswa}
                          onFileChange={(file) => handleFileChange("foto_siswa", file, ["jpg", "jpeg", "png"])}
                          onRemove={() => handleRemoveFile("foto_siswa")}
                        />

                        <FileUploadField
                          label="Berkas Raport"
                          field="berkas_raport"
                          description="Upload foto raport semester terakhir (JPG, JPEG, PNG)"
                          allowedTypes={["jpg", "jpeg", "png"]}
                          error={errors.berkas_raport}
                          preview={filePreviews.berkas_raport}
                          onFileChange={(file) => handleFileChange("berkas_raport", file, ["jpg", "jpeg", "png"])}
                          onRemove={() => handleRemoveFile("berkas_raport")}
                        />

                        <FileUploadField
                          label="Surat Keterangan Pindah"
                          field="suket_pindah"
                          description="Upload file PDF surat keterangan pindah dari sekolah asal (PDF)"
                          allowedTypes={["pdf"]}
                          error={errors.suket_pindah}
                          preview={filePreviews.suket_pindah}
                          onFileChange={(file) => handleFileChange("suket_pindah", file, ["jpg", "jpeg", "png"])}
                          onRemove={() => handleRemoveFile("suket_pindah")}
                        />

                        <FileUploadField
                          label="Berkas Kartu Keluarga"
                          field="berkas_kartu_keluarga"
                          description="Upload file PDF kartu keluarga (PDF)"
                          allowedTypes={["pdf"]}
                          error={errors.berkas_kartu_keluarga}
                          preview={filePreviews.berkas_kartu_keluarga}
                          onFileChange={(file) => handleFileChange("berkas_kartu_keluarga", file, ["jpg", "jpeg", "png"])}
                          onRemove={() => handleRemoveFile("berkas_kartu_keluarga")}
                        />

                        <FileUploadField
                          label="Berkas Akta Lahir"
                          field="berkas_akta_lahir"
                          description="Upload file PDF akta lahir (PDF)"
                          allowedTypes={["pdf"]}
                          error={errors.berkas_akta_lahir}
                          preview={filePreviews.berkas_akta_lahir}
                          onFileChange={(file) => handleFileChange("berkas_akta_lahir", file, ["jpg", "jpeg", "png"])}
                          onRemove={() => handleRemoveFile("berkas_akta_lahir")}
                        />
                      </TabsContent>
                    </Tabs>
                    <div className="flex gap-4 mt-8 pt-6 border-t">
                      <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90" onClick={() => navigate("/superadmin/psb")} disabled={isSubmitting}>
                        <CircleXIcon size={18} />
                        Batal
                      </Button>
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        <FilePlus size={18} />
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Memperbarui...
                          </>
                        ) : (
                          "Simpan Perubahan"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </>
          )}
        </div>
        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default EditPsb;
