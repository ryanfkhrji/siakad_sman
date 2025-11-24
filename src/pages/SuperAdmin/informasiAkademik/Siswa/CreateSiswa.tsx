import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { ArrowLeft, CircleXIcon, FilePlus } from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api/axios";
import type { z } from "zod";
import type { AxiosError } from "axios";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import type { Kelas, Jurusan } from "@/types";
import { endpoints } from "@/api/endpoints";
import { registerSiswaSchema } from "@/schema/registerSchema";

// 🟦 Type Form
type FormData = z.infer<typeof registerSiswaSchema>;

const CreateSiswa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(registerSiswaSchema),
    mode: "onSubmit",
  });

  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);

  // Ambil data kelas & jurusan dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [kelasRes, jurusanRes] = await Promise.all([api.get(endpoints.kelas.index), api.get(endpoints.jurusan.index)]);

        setKelasList(kelasRes.data.data || []);
        setJurusanList(jurusanRes.data.data || []);
      } catch (error) {
        console.error("Gagal fetch kelas atau jurusan:", error);
        Swal.fire({
          title: "Gagal Memuat Data",
          text: "Tidak dapat memuat data kelas atau jurusan.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🟦 SUBMIT
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const payload = {
        nama: data.nama,
        email: data.email,
        nisn: data.nisn,
        nis: data.nis,
        kelas_id: Number(data.kelas),
        jurusan_id: Number(data.jurusan),
        password: data.password,
        password_confirmation: data.confirmPassword,
      };

      const res = await api.post("/siswa/register", payload);

      if (res.data.status === "success") {
        await Swal.fire({
          title: "Registrasi Berhasil!",
          text: "Data siswa berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });

        reset();

        navigate("/superadmin/informasi-akademik/siswa/create");
      } else {
        Swal.fire({
          title: "Gagal Registrasi",
          text: res.data.message || "Terjadi kesalahan saat registrasi.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      console.error("Error saat registrasi:", err);

      if (err.response) {
        const status = err.response.status;
        const resData = err.response.data;

        // ✅ Validasi gagal (422)
        if (status === 422 && resData?.errors) {
          const errorsObj = resData.errors;

          // Tangkap error spesifik dari backend Laravel
          const nisnError = errorsObj?.nisn?.[0];
          const nisError = errorsObj?.nis?.[0];
          const emailError = errorsObj?.email?.[0];

          // ✅ Jika ada error NISN & NIS sekaligus
          if (nisnError && nisError) {
            Swal.fire({
              title: "Validasi Gagal",
              text: `${nisnError} dan ${nisError}`,
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          }
          // ✅ Jika hanya ada error NISN
          else if (nisnError) {
            Swal.fire({
              title: "Validasi Gagal",
              text: nisnError,
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          }
          // ✅ Jika hanya ada error NIS
          else if (nisError) {
            Swal.fire({
              title: "Validasi Gagal",
              text: nisError,
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          }

          // email sudah terdaftar
          else if (emailError) {
            Swal.fire({
              title: "Validasi Gagal",
              text: emailError,
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          }
          // ✅ Kalau error bukan NISN/NIS (misal password atau jurusan_id)
          else {
            Object.entries(errorsObj).forEach(([field, messages]) => {
              const message = messages?.[0];
              if (message) {
                setError(field as keyof FormData, { type: "server", message });
              }
            });

            Swal.fire({
              title: "Validasi Gagal",
              text: resData.message || "Periksa kembali input Anda.",
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          }
        }
        // ❌ Error lain (bukan validasi)
        else {
          Swal.fire({
            title: "Gagal Registrasi",
            text: resData.message || "Terjadi kesalahan saat registrasi.",
            icon: "error",
            confirmButtonColor: "#DC2626",
          });
        }
      }
      // ❌ Tidak ada respon dari server
      else if (err.request) {
        Swal.fire({
          title: "Koneksi Gagal",
          text: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      }
      // ❌ Error lain (misalnya runtime)
      else {
        Swal.fire({
          title: "Terjadi Kesalahan",
          text: err.message || "Terjadi kesalahan tak terduga. Silakan coba lagi.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      }
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
        <PageTitle title="Tambah Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Siswa</h1>

          {/* Tombol Kembali - selalu muncul */}
          <Link to="/superadmin/informasi-akademik/siswa">
            <Button variant="outline" className="mb-6">
              <ArrowLeft size={16} />
              Kembali
            </Button>
          </Link>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit(onSubmit)}>
              {/* NISN */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  NISN
                  <input
                    {...register("nisn")}
                    type="text"
                    inputMode="numeric"
                    maxLength={50}
                    placeholder="cth: 20214350000008"
                    onKeyPress={(e) => {
                      // ✅ Hanya izinkan angka
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      // ✅ Cegah paste non-numeric
                      const pasteData = e.clipboardData.getData("text");
                      if (!/^[0-9]+$/.test(pasteData)) {
                        e.preventDefault();
                      }
                    }}
                    className="border p-2 w-full mt-2 rounded"
                    autoComplete="off"
                  />
                  {errors.nisn && <p className="text-red-500 text-sm">{errors.nisn.message}</p>}
                </label>
              </div>

              {/* NIS */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  NIS
                  <input
                    {...register("nis")}
                    type="text"
                    inputMode="numeric"
                    maxLength={50}
                    placeholder="cth: 20214350000008"
                    onKeyPress={(e) => {
                      // ✅ Hanya izinkan angka
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      // ✅ Cegah paste non-numeric
                      const pasteData = e.clipboardData.getData("text");
                      if (!/^[0-9]+$/.test(pasteData)) {
                        e.preventDefault();
                      }
                    }}
                    className="border p-2 w-full mt-2 rounded"
                    autoComplete="off"
                  />
                  {errors.nis && <p className="text-red-500 text-sm">{errors.nis.message}</p>}
                </label>
              </div>

              {/* Nama */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Nama Lengkap
                  <input {...register("nama")} type="text" placeholder="cth: John Doe" className="border p-2 w-full mt-2 rounded" autoComplete="name" />
                  {errors.nama && <p className="text-red-500 text-sm">{errors.nama.message}</p>}
                </label>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label htmlFor="email" className="block font-semibold text-foreground">
                  Email
                  <input {...register("email")} type="text" name="email" placeholder="cth: example@gmail.com" className="border p-2 w-full mt-2 rounded" />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </label>
              </div>

              {/* Kelas */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Kelas
                  <select {...register("kelas")} className="border p-2 w-full rounded mt-2" defaultValue="">
                    <option value="" disabled>
                      Pilih Kelas
                    </option>
                    {kelasList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama_kelas} ({k.jam_masuk})
                      </option>
                    ))}
                  </select>
                  {errors.kelas && <p className="text-red-500 text-sm">{errors.kelas.message}</p>}
                </label>
              </div>

              {/* Jurusan */}
              <div className="mb-6">
                <label className="block font-semibold text-foreground">
                  Jurusan
                  <select {...register("jurusan")} className="border p-2 w-full rounded mt-2" defaultValue="">
                    <option value="" disabled>
                      Pilih Jurusan
                    </option>
                    {jurusanList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.nama_jurusan}
                      </option>
                    ))}
                  </select>
                  {errors.jurusan && <p className="text-red-500 text-sm">{errors.jurusan.message}</p>}
                </label>
              </div>

              {/* Password */}
              <div className="mb-6 relative">
                <label className="block font-semibold text-foreground">
                  Password
                  <input type={showPass ? "text" : "password"} {...register("password")} placeholder="*********" className="border p-2 w-full mt-2 rounded" autoComplete="new-password" />
                </label>
                <FontAwesomeIcon icon={showPass ? faEye : faEyeSlash} className="absolute top-11 right-3 text-muted-foreground cursor-pointer" onClick={() => setShowPass(!showPass)} />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="mb-6 relative">
                <label className="block font-semibold text-foreground">
                  Konfirmasi Password
                  <input type={showPass ? "text" : "password"} {...register("confirmPassword")} placeholder="*********" className="border p-2 w-full mt-2 rounded" autoComplete="new-password" />
                </label>
                <FontAwesomeIcon icon={showPass ? faEye : faEyeSlash} className="absolute top-11 right-3 text-muted-foreground cursor-pointer" onClick={() => setShowPass(!showPass)} />
                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
              </div>

              {/* BUTTON */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>

                <Link to="/superadmin/informasi-akademik/siswa">
                  <Button className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
                    <CircleXIcon size={18} /> Batal
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

export default CreateSiswa;
