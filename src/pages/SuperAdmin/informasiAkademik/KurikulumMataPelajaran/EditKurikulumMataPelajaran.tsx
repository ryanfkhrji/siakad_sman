import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePenLine, Loader2Icon } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import type { DataSelectKurmap, KurmapEditFormData } from "@/types/kurikulumMataPelajaran";

interface FormErrors {
  kurikulum_id: string[];
  mata_pelajaran_id: string[];
  tingkat: string[];
  nilai_kkm: string[];
  status_mata_pelajaran: string[];
  status: string[];
  pesan: string[];
}

const EditKurikulumMataPelajaran = () => {
  const { id } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [selectData, setSelectData] = useState<DataSelectKurmap | null>(null);

  const [formData, setFormData] = useState<KurmapEditFormData>({
    kurikulum_id: "",
    mata_pelajaran_id: "",
    tingkat: "",
    nilai_kkm: "",
    status_mata_pelajaran: "",
    status: "",
  });

  const [errors, setErrors] = useState<FormErrors>({
    kurikulum_id: [],
    mata_pelajaran_id: [],
    tingkat: [],
    nilai_kkm: [],
    status_mata_pelajaran: [],
    status: [],
    pesan: [],
  });

  const [loading, setLoading] = useState(false);
  const [initialStatus, setInitialStatus] = useState("");
  const navigate = useNavigate();

  // Fetch data select
  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/kurmap");
        if (res.data.status === "success") {
          setSelectData(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data untuk form.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };

    fetchSelectData();
  }, []);

  // AMBIL DATA LAMA
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true);

        // Cek apakah id adalah composite key (format: kurikulum_id-tingkat-mata_pelajaran_id)
        if (id && id.includes("-")) {
          const [kurikulumId, tingkat, mapelId] = id.split("-");

          // Coba ambil dari localStorage dulu
          try {
            const mapping = localStorage.getItem("kurmap_mapping");
            if (mapping) {
              const data = JSON.parse(mapping)[id];
              if (data) {
                setFormData({
                  kurikulum_id: String(data.kurikulum_id),
                  mata_pelajaran_id: String(data.mata_pelajaran_id),
                  tingkat: String(data.tingkat),
                  nilai_kkm: String(data.nilai_kkm),
                  status_mata_pelajaran: data.status_mapel,
                  status: data.status_aktif,
                });
                setInitialStatus(data.status_aktif);
                setLoadingData(false);
                return;
              }
            }
          } catch (e) {
            console.log("LocalStorage not available, fetching from API");
          }

          // Jika tidak ada di localStorage, fetch dari backend
          const allDataRes = await api.get("/spa/kurikulum-mata-pelajaran");

          if (allDataRes.data.status === "success") {
            const allData = allDataRes.data.data;

            // Cari data yang match
            let foundData = null;
            for (const kurikulum of allData) {
              if (kurikulum.kurikulum_id === Number(kurikulumId)) {
                for (const tingkatObj of kurikulum.tingkat) {
                  if (tingkatObj.tingkat === Number(tingkat)) {
                    const mapel = tingkatObj.mata_pelajaran.find((m: any) => m.mata_pelajaran_id === Number(mapelId));
                    if (mapel) {
                      foundData = {
                        kurikulum_id: kurikulum.kurikulum_id,
                        mata_pelajaran_id: mapel.mata_pelajaran_id,
                        tingkat: tingkatObj.tingkat,
                        nilai_kkm: mapel.nilai_kkm,
                        status_mata_pelajaran: mapel.status_mapel,
                        status_aktif: mapel.status_aktif,
                      };
                      break;
                    }
                  }
                }
              }
              if (foundData) break;
            }

            if (!foundData) {
              throw new Error("Data tidak ditemukan");
            }

            setFormData({
              kurikulum_id: String(foundData.kurikulum_id),
              mata_pelajaran_id: String(foundData.mata_pelajaran_id),
              tingkat: String(foundData.tingkat),
              nilai_kkm: String(foundData.nilai_kkm),
              status_mata_pelajaran: foundData.status_mata_pelajaran,
              status: foundData.status_aktif,
            });

            setInitialStatus(foundData.status_aktif);
          }
        } else {
          // Jika id bukan composite key (kurmap_id langsung dari backend yang sudah update)
          const res = await api.get(`/spa/kurikulum-mata-pelajaran/${id}`);
          const data = res.data.data;

          setFormData({
            kurikulum_id: String(data.kurikulum.kurikulum_id) || "",
            mata_pelajaran_id: String(data.mata_pelajaran.mata_pelajaran_id) || "",
            tingkat: String(data.tingkat) || "",
            nilai_kkm: String(data.nilai_kkm) || "",
            status_mata_pelajaran: data.status_mata_pelajaran || "",
            status: data.status_aktif_kurmap || "aktif",
          });

          setInitialStatus(data.status_aktif_kurmap || "aktif");
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || error.message || "Terjadi kesalahan saat mengambil data.",
        });
        navigate("/superadmin/informasi-akademik/kurikulum-mata-pelajaran");
      } finally {
        setLoadingData(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id, navigate]);

  // SUBMIT EDIT
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({
      kurikulum_id: [],
      mata_pelajaran_id: [],
      tingkat: [],
      nilai_kkm: [],
      status_mata_pelajaran: [],
      status: [],
      pesan: [],
    });

    setLoading(true);

    try {
      let kurmapId: string | number | undefined = id;

      // Jika id adalah composite key, cari kurikulum_mata_pelajaran_id yang sebenarnya
      if (id && id.includes("-")) {
        // Fetch semua data untuk mencari kurikulum_mata_pelajaran_id
        const allDataRes = await api.get("/spa/kurikulum-mata-pelajaran");

        if (allDataRes.data.status === "success") {
          const allData = allDataRes.data.data;
          const [kurikulumId, tingkat, mapelId] = id.split("-");

          // Cari kurikulum_mata_pelajaran_id dari response
          let foundKurmapId = null;
          for (const kurikulum of allData) {
            if (kurikulum.kurikulum_id === Number(kurikulumId)) {
              for (const tingkatObj of kurikulum.tingkat) {
                if (tingkatObj.tingkat === Number(tingkat)) {
                  const mapel = tingkatObj.mata_pelajaran.find((m: any) => m.mata_pelajaran_id === Number(mapelId));
                  if (mapel && mapel.kurikulum_mata_pelajaran_id) {
                    foundKurmapId = mapel.kurikulum_mata_pelajaran_id;
                    break;
                  }
                }
              }
            }
            if (foundKurmapId) break;
          }

          if (!foundKurmapId) {
            // Backend belum menyediakan kurikulum_mata_pelajaran_id
            Swal.fire({
              icon: "warning",
              title: "Tidak dapat update langsung",
              html: `
                <p>Backend belum menyediakan <code>kurikulum_mata_pelajaran_id</code> di response index.</p>
                <br/>
                <p class="text-sm text-muted-foreground">Data form sudah benar, namun backend perlu menyediakan field ini.</p>
                <br/>
                <p><strong>Solusi:</strong></p>
                <ul style="text-align: left; padding-left: 20px; margin-top: 8px;">
                  <li>Minta backend developer tambahkan field <code>kurikulum_mata_pelajaran_id</code> di response index</li>
                  <li>Atau gunakan Insomnia/Postman untuk update manual</li>
                </ul>
              `,
              confirmButtonText: "OK, Saya Mengerti",
              width: "500px",
            });
            setLoading(false);
            return;
          }

          kurmapId = foundKurmapId;
        }
      }

      // Lakukan update
      const res = await api.put(`/spa/kurikulum-mata-pelajaran/${kurmapId}`, {
        kurikulum_id: Number(formData.kurikulum_id),
        mata_pelajaran_id: Number(formData.mata_pelajaran_id),
        tingkat: Number(formData.tingkat),
        nilai_kkm: Number(formData.nilai_kkm),
        status_mata_pelajaran: formData.status_mata_pelajaran,
        status: formData.status,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data kurikulum mata pelajaran berhasil diperbarui.",
          timer: 1800,
          showConfirmButton: false,
        });

        navigate("/superadmin/informasi-akademik/kurikulum-mata-pelajaran");
      }
    } catch (error: any) {
      const errorStatus = error.response?.status;
      const errorData = error.response?.data;

      // HANDLE VALIDATION ERROR 422
      if (errorStatus === 422 && errorData?.errors) {
        // 1️⃣ Cek error khusus status atau duplikasi
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

        if (errorData.errors.pesan) {
          Swal.fire({
            icon: "warning",
            title: "Tidak dapat mengubah data!",
            text: Array.isArray(errorData.errors.pesan) ? errorData.errors.pesan[0] : errorData.errors.pesan,
            confirmButtonText: "OK",
          });
          setLoading(false);
          return;
        }

        // 2️⃣ Handle validation errors biasa
        setErrors(errorData.errors);
        setLoading(false);
        return;
      }

      // HANDLE ERROR 404
      if (errorStatus === 404) {
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: errorData?.message || "Data tidak ditemukan.",
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

  const isLoading = loadingData || loadingSelect;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main
        className={`w-full min-h-screen bg-background transition-all duration-300
        ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}
      >
        <PageTitle title="Edit Kurikulum Mata Pelajaran" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Kurikulum Mata Pelajaran</h1>

          <div className="bg-white rounded shadow p-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-600">
                <Loader2Icon className="animate-spin mb-2" size={28} />
                <p className="text-lg font-medium">Memuat data...</p>
              </div>
            ) : (
              <form className="space-y-6 max-w-2xl w-full" onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Kurikulum <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.kurikulum_id)} onValueChange={(value) => setFormData({ ...formData, kurikulum_id: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih kurikulum --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Kurikulum</SelectLabel>
                        {selectData?.kurikulum.map((k) => (
                          <SelectItem key={k.kurikulum_id} value={String(k.kurikulum_id)}>
                            {k.nama_kurikulum} ({k.tipe_kurikulum}) - {k.status_kurikulum}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.kurikulum_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.kurikulum_id[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Mata Pelajaran <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.mata_pelajaran_id)} onValueChange={(value) => setFormData({ ...formData, mata_pelajaran_id: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih mata pelajaran --" />
                    </SelectTrigger>

                    <SelectContent>
                      {selectData?.mata_pelajaran.map((kelompok) => (
                        <SelectGroup key={kelompok.kelompok}>
                          <SelectLabel className="font-bold text-primary capitalize">{kelompok.kelompok}</SelectLabel>
                          {kelompok.mata_pelajaran.map((mapel) => (
                            <SelectItem key={mapel.mata_pelajaran_id} value={String(mapel.mata_pelajaran_id)}>
                              {mapel.nama_pelajaran} ({mapel.status})
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.mata_pelajaran_id?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.mata_pelajaran_id[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Tingkat (Kelas) <span className="text-red-500">*</span>
                  </label>

                  <Select value={String(formData.tingkat)} onValueChange={(value) => setFormData({ ...formData, tingkat: value })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih tingkat --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Tingkat</SelectLabel>
                        <SelectItem value="10">Kelas 10</SelectItem>
                        <SelectItem value="11">Kelas 11</SelectItem>
                        <SelectItem value="12">Kelas 12</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.tingkat?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.tingkat[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold">
                    Nilai KKM <span className="text-red-500">*</span>
                  </label>
                  <input type="number" step="0.01" min="0" max="100" placeholder="contoh: 75" value={formData.nilai_kkm} onChange={(e) => setFormData({ ...formData, nilai_kkm: e.target.value })} className="border p-2 w-full mt-2 rounded" />
                  {errors.nilai_kkm?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.nilai_kkm[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Status Mata Pelajaran <span className="text-red-500">*</span>
                  </label>

                  <Select value={formData.status_mata_pelajaran} onValueChange={(value) => setFormData({ ...formData, status_mata_pelajaran: value as any })}>
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder="-- pilih status mata pelajaran --" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Pilih Status</SelectLabel>
                        <SelectItem value="wajib">Wajib</SelectItem>
                        <SelectItem value="pilihan">Pilihan</SelectItem>
                        <SelectItem value="jurusan">Jurusan</SelectItem>
                        <SelectItem value="mulok">Mulok</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  {errors.status_mata_pelajaran?.length > 0 && <p className="text-red-500 text-sm mt-1">{errors.status_mata_pelajaran[0]}</p>}
                </div>

                <div className="mb-6">
                  <label className="block font-semibold text-foreground">
                    Status <span className="text-red-500">*</span>
                  </label>

                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as any })} disabled={initialStatus === "arsip"}>
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
                {initialStatus === "arsip" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm text-yellow-800">
                    <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                    <p>Data yang sudah diarsipkan tidak dapat diubah statusnya kembali ke aktif.</p>
                  </div>
                )}

                {formData.status === "arsip" && initialStatus === "aktif" && (
                  <div className="bg-orange-50 border border-orange-200 rounded p-3 text-sm text-orange-800">
                    <p className="font-semibold mb-1">⚠️ Perhatian:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Setelah diarsipkan, status tidak dapat dikembalikan ke aktif</li>
                      <li>Pastikan data sudah tidak digunakan sebelum mengarsipkan</li>
                    </ul>
                  </div>
                )}

                {/* Tombol */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    <FilePenLine size={18} />
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>

                  <Link to="/superadmin/informasi-akademik/kurikulum-mata-pelajaran">
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

export default EditKurikulumMataPelajaran;
