import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/pages/Footer";
import { CircleXIcon, FilePlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api/axios";
import type { z } from "zod";
import type { AxiosError } from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { registerSiswaSchema } from "@/schema/registerSchema";

// Type untuk form
type FormData = z.infer<typeof registerSiswaSchema>;

// Response type dari API
interface ApiResponse {
  status: string;
  message: string;
  data?: any;
  errors?: Record<string, string[]>;
}

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

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const payload = {
        nama: data.nama,
        email: data.email,
        nisn: data.nisn,
        nis: data.nis,
        password: data.password,
        password_confirmation: data.confirmPassword,
      };

      const res = await api.post<ApiResponse>("/spa/siswa", payload);

      if (res.data.status === "success") {
        await Swal.fire({
          title: "Registrasi Berhasil!",
          text: "Data siswa berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#4F46E5",
        });

        reset();
        navigate("/superadmin/informasi-akademik/siswa");
      } else {
        Swal.fire({
          title: "Gagal Registrasi",
          text: res.data.message || "Terjadi kesalahan saat registrasi.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      }
    } catch (error) {
      const err = error as AxiosError<ApiResponse>;
      console.error("Error saat registrasi:", err);

      if (err.response) {
        const status = err.response.status;
        const resData = err.response.data;

        if (status === 422 && resData?.errors) {
          const errorsObj = resData.errors;
          const nisnError = errorsObj?.nisn?.[0];
          const nisError = errorsObj?.nis?.[0];
          const emailError = errorsObj?.email?.[0];

          if (nisnError && nisError) {
            Swal.fire({
              title: "Validasi Gagal",
              text: `${nisnError} dan ${nisError}`,
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          } else if (nisnError) {
            setError("nisn", { type: "server", message: nisnError });
            Swal.fire({
              title: "Validasi Gagal",
              text: nisnError,
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          } else if (nisError) {
            setError("nis", { type: "server", message: nisError });
            Swal.fire({
              title: "Validasi Gagal",
              text: nisError,
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          } else if (emailError) {
            setError("email", { type: "server", message: emailError });
            Swal.fire({
              title: "Validasi Gagal",
              text: emailError,
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          } else {
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
        } else {
          Swal.fire({
            title: "Gagal Registrasi",
            text: resData?.message || "Terjadi kesalahan saat registrasi.",
            icon: "error",
            confirmButtonColor: "#DC2626",
          });
        }
      } else if (err.request) {
        Swal.fire({
          title: "Koneksi Gagal",
          text: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      } else {
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

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Tambah Siswa" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Siswa</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit(onSubmit)}>
              {/* NISN */}
              <div>
                <label className="block font-semibold text-foreground">
                  NISN <span className="text-red-500">*</span>
                  <input
                    {...register("nisn")}
                    type="text"
                    inputMode="numeric"
                    maxLength={50}
                    placeholder="cth: 20214350000008"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteData = e.clipboardData.getData("text");
                      if (!/^[0-9]+$/.test(pasteData)) {
                        e.preventDefault();
                      }
                    }}
                    className="border p-2 w-full mt-2 rounded"
                    autoComplete="off"
                  />
                  {errors.nisn && <p className="text-red-500 text-sm mt-1">{errors.nisn.message}</p>}
                </label>
              </div>

              {/* NIS */}
              <div>
                <label className="block font-semibold text-foreground">
                  NIS <span className="text-red-500">*</span>
                  <input
                    {...register("nis")}
                    type="text"
                    inputMode="numeric"
                    maxLength={50}
                    placeholder="cth: 20214350000008"
                    onKeyPress={(e) => {
                      if (!/[0-9]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteData = e.clipboardData.getData("text");
                      if (!/^[0-9]+$/.test(pasteData)) {
                        e.preventDefault();
                      }
                    }}
                    className="border p-2 w-full mt-2 rounded"
                    autoComplete="off"
                  />
                  {errors.nis && <p className="text-red-500 text-sm mt-1">{errors.nis.message}</p>}
                </label>
              </div>

              {/* Nama */}
              <div>
                <label className="block font-semibold text-foreground">
                  Nama Lengkap <span className="text-red-500">*</span>
                  <input
                    {...register("nama")}
                    type="text"
                    placeholder="cth: John Doe"
                    className="border p-2 w-full mt-2 rounded"
                    autoComplete="name"
                  />
                  {errors.nama && <p className="text-red-500 text-sm mt-1">{errors.nama.message}</p>}
                </label>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block font-semibold text-foreground">
                  Email <span className="text-red-500">*</span>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="cth: example@gmail.com"
                    className="border p-2 w-full mt-2 rounded"
                    autoComplete="email"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </label>
              </div>

              {/* Password */}
              <div className="relative">
                <label className="block font-semibold text-foreground">
                  Password <span className="text-red-500">*</span>
                  <input
                    type={showPass ? "text" : "password"}
                    {...register("password")}
                    placeholder="*********"
                    className="border p-2 w-full mt-2 rounded pr-10"
                    autoComplete="new-password"
                  />
                </label>
                <FontAwesomeIcon
                  icon={showPass ? faEye : faEyeSlash}
                  className="absolute top-11 right-3 text-muted-foreground cursor-pointer"
                  onClick={() => setShowPass(!showPass)}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <label className="block font-semibold text-foreground">
                  Konfirmasi Password <span className="text-red-500">*</span>
                  <input
                    type={showPass ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="*********"
                    className="border p-2 w-full mt-2 rounded pr-10"
                    autoComplete="new-password"
                  />
                </label>
                <FontAwesomeIcon
                  icon={showPass ? faEye : faEyeSlash}
                  className="absolute top-11 right-3 text-muted-foreground cursor-pointer"
                  onClick={() => setShowPass(!showPass)}
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>

                <Link to="/superadmin/informasi-akademik/siswa">
                  <Button type="button" className="bg-muted-foreground flex items-center gap-2 hover:bg-muted-foreground/90">
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