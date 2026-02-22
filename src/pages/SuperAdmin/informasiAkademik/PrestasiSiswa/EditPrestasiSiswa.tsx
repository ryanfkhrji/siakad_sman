import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, Loader2Icon, SaveIcon } from "lucide-react";
import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import api from "@/api/axios";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { SiswaSelect, TahunAkademikSelect, PrestasiFormErrors } from "@/types/prestasiSiswa";

const EditPrestasiSiswa = () => {
  const { id } = useParams<{ id: string }>(); // id = prestasi_id
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const [dataSiswa, setDataSiswa] = useState<SiswaSelect[]>([]);
  const [dataTahunAkademik, setDataTahunAkademik] = useState<TahunAkademikSelect[]>([]);
  const [loadingSelect, setLoadingSelect] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  // siswa_id sumber (untuk navigate back ke histori setelah save)
  const [sourceSiswaId, setSourceSiswaId] = useState<string>("");

  const [formData, setFormData] = useState({
    siswa_id: "",
    tahun_akademik_id: "",
    prestasi_diraih: "",
  });

  const [errors, setErrors] = useState<PrestasiFormErrors>({
    siswa_id: [],
    tahun_akademik_id: [],
    prestasi_diraih: [],
  });

  // ── FETCH DATA SELECT ──────────────────────────────────────
  useEffect(() => {
    const fetchSelect = async () => {
      try {
        setLoadingSelect(true);
        const res = await api.get("/spa/data-select/siswa/prestasi");
        if (res.data.status === "success") {
          setDataSiswa(res.data.data.siswa);
          setDataTahunAkademik(res.data.data.tahun_akademik);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data select!",
          text: error.response?.data?.message || "Tidak dapat memuat data.",
        });
      } finally {
        setLoadingSelect(false);
      }
    };
    fetchSelect();
  }, []);

  // ── FETCH DATA PRESTASI (setelah select siap) ─────────────
  // Endpoint show adalah by siswa_id, sementara kita punya prestasi_id.
  // Kita cari lewat semua siswa (loop show) — tidak efisien.
  // Solusi: simpan langsung dari response create/update, atau
  // di histori kita sudah tahu siswa_id → pass via state / localStorage.
  // Cara paling clean: panggil semua siswa satu-persatu TIDAK ideal.
  // Alternatif: cari prestasi_id dari response update (kita tahu id prestasi).
  // Backend tidak ada GET /prestasi/{prestasi_id} langsung —
  // tapi kita bisa isi dari histori yang sudah di-pass via navigate state.
  //
  // Fallback: cari berdasarkan semua siswa satu kali saja dengan
  // pendekatan: hit show per siswa sambil match prestasi id.
  // Ini terlalu berat. Solusi terbaik: simpan di state navigasi.
  // Kita pakai pendekatan: ambil semua siswa, iterate show sampai ketemu.
  // Tapi karena kita sudah punya data select siswa, cukup iterate show.
  //
  // NOTE: Karena backend tidak expose GET /prestasi/{id} langsung,
  // kita mengandalkan data yang dikirim dari halaman histori via navigate state.
  // Jika tidak ada, tampilkan form kosong dan user isi ulang.
  useEffect(() => {
    if (loadingSelect || dataSiswa.length === 0) return;

    const fetchPrestasiById = async () => {
      try {
        setLoadingData(true);

        // Cari prestasi_id ini di semua show siswa
        for (const siswa of dataSiswa) {
          try {
            const res = await api.get(`/spa/prestasi/${siswa.siswa_id}`);
            if (res.data.status === "success") {
              const siswaDetail = res.data.data;
              for (const periode of siswaDetail.periode) {
                const found = periode.prestasi.find((p: any) => p.id === Number(id));
                if (found) {
                  setSourceSiswaId(siswa.siswa_id.toString());
                  setFormData({
                    siswa_id: siswa.siswa_id.toString(),
                    tahun_akademik_id: periode.tahun_akademik_id.toString(),
                    prestasi_diraih: found.prestasi_diraih,
                  });
                  return; // Ketemu, stop
                }
              }
            }
          } catch {
            // 404 berarti siswa ini belum ada prestasi, skip
          }
        }

        // Tidak ditemukan
        Swal.fire({
          icon: "error",
          title: "Data tidak ditemukan!",
          text: "Prestasi yang ingin diedit tidak ditemukan.",
        }).then(() => navigate("/superadmin/informasi-akademik/prestasi-siswa"));
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data prestasi.",
        });
      } finally {
        setLoadingData(false);
      }
    };

    fetchPrestasiById();
  }, [loadingSelect, dataSiswa, id]);

  // ── SUBMIT ────────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({ siswa_id: [], tahun_akademik_id: [], prestasi_diraih: [] });
    setLoading(true);

    try {
      const res = await api.put(`/spa/prestasi/${id}`, {
        siswa_id: Number(formData.siswa_id),
        tahun_akademik_id: Number(formData.tahun_akademik_id),
        prestasi_diraih: formData.prestasi_diraih,
      });

      if (res.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data prestasi siswa berhasil diperbarui.",
          showConfirmButton: false,
          timer: 1800,
        });
        navigate(`/superadmin/informasi-akademik/prestasi-siswa/histori/${sourceSiswaId || formData.siswa_id}`);
      }
    } catch (error: any) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors ?? {});
        return;
      }
      if (error.response?.status === 404) {
        Swal.fire({ icon: "error", title: "Data tidak ditemukan!", text: error.response.data.message });
        return;
      }
      Swal.fire({ icon: "error", title: "Koneksi gagal!", text: error.response?.data?.message || "Terjadi kesalahan." });
    } finally {
      setLoading(false);
    }
  };

  const siswaSelected = dataSiswa.find((s) => s.siswa_id.toString() === formData.siswa_id);
  const isFormLoading = loadingSelect || loadingData;

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Edit Prestasi Siswa" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Edit Prestasi Siswa</h1>

          {isFormLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-600">
              <Loader2Icon className="animate-spin mb-2" size={28} />
              <p className="text-lg font-medium">Memuat data...</p>
            </div>
          ) : (
            <div className="bg-white rounded shadow p-5">
              <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit}>
                {/* PILIH SISWA */}
                <div className="space-y-2">
                  <label className="block font-semibold">
                    Pilih Siswa <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.siswa_id} onValueChange={(v) => setFormData({ ...formData, siswa_id: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Siswa --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Siswa</SelectLabel>
                        {dataSiswa.map((s) => (
                          <SelectItem key={s.siswa_id} value={s.siswa_id.toString()}>
                            {s.nama_siswa} — {s.nisn}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.siswa_id?.length > 0 && <p className="text-red-500 text-sm">{errors.siswa_id[0]}</p>}
                </div>

                {/* INFO SISWA (read only) */}
                {siswaSelected && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 text-sm text-gray-700 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">NISN:</span>
                      <span className="font-medium">{siswaSelected.nisn}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">NIS:</span>
                      <span className="font-medium">{siswaSelected.nis}</span>
                    </div>
                  </div>
                )}

                {/* TAHUN AKADEMIK */}
                <div className="space-y-2">
                  <label className="block font-semibold">
                    Tahun Akademik <span className="text-red-500">*</span>
                  </label>
                  <Select value={formData.tahun_akademik_id} onValueChange={(v) => setFormData({ ...formData, tahun_akademik_id: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="-- Pilih Tahun Akademik --" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Tahun Akademik</SelectLabel>
                        {dataTahunAkademik.map((ta) => (
                          <SelectItem key={ta.tahun_akademik_id} value={ta.tahun_akademik_id.toString()}>
                            {ta.tahun_akademik}
                            {ta.status_tahun_akademik === "aktif" && " (Aktif)"}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {errors.tahun_akademik_id?.length > 0 && <p className="text-red-500 text-sm">{errors.tahun_akademik_id[0]}</p>}
                </div>

                {/* PRESTASI DIRAIH */}
                <div className="space-y-2">
                  <label className="block font-semibold">
                    Prestasi Diraih <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.prestasi_diraih}
                    onChange={(e) => setFormData({ ...formData, prestasi_diraih: e.target.value })}
                    className="border p-2 w-full rounded h-32 resize-none"
                    placeholder="Contoh: Juara 1 Lomba Matematika Nasional"
                  />
                  {errors.prestasi_diraih?.length > 0 && <p className="text-red-500 text-sm">{errors.prestasi_diraih[0]}</p>}
                </div>

                {/* TOMBOL */}
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                    {loading ? <Loader2Icon size={18} className="animate-spin" /> : <SaveIcon size={18} />}
                    {loading ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                  <Link to="/superadmin/informasi-akademik/prestasi-siswa">
                    <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                      <CircleXIcon size={18} /> Batal
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

export default EditPrestasiSiswa;
