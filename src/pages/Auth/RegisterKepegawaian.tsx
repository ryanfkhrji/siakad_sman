import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios";
import { registerKepegawaianSchema } from "../../schema/registerSchema";
import Swal from "sweetalert2";
import { useState } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import LogoSekolah from "@/assets/logo-sekolah-42.png";
import PageTitle from "@/components/PageTitle";
import { endpoints } from "../../api/endpoints";
import type { AxiosError } from "axios";
import Footer from "../Footer";

type FormData = z.infer<typeof registerKepegawaianSchema>;

export default function RegisterKepegawaian() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(registerKepegawaianSchema),
    mode: "onSubmit",
  });

  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const payload = {
        nama: data.nama,
        nip: data.nip,
        email: data.email,
        keterangan: data.keterangan || null,
        status: data.status || null,
        password: data.password,
        password_confirmation: data.confirmPassword,
        role: data.role,
      };

      // 🚀 Kirim ke backend
      await api.post(endpoints.kepegawaian.register, payload);

      // ✅ Registrasi sukses
      await Swal.fire({
        title: "Registrasi Berhasil!",
        text: "Registrasi Kepegawaian berhasil, silakan login.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
      });

      navigate("/login-kepegawaian");
    } catch (error) {
      const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      console.error("Register error:", err);

      if (err.response) {
        const status = err.response.status;
        const resData = err.response.data;

        if (status === 422 && resData?.errors) {
          // ⚠️ Tangani semua error validasi dari backend
          Object.keys(resData.errors).forEach((field) => {
            const message = resData.errors?.[field]?.[0];
            if (message) {
              setError(field as keyof FormData, {
                type: "server",
                message,
              });
            }
          });

          // 🔍 Khusus untuk NIP yang sudah terdaftar
          if (resData.errors.nip?.[0]?.toLowerCase().includes("sudah terdaftar") || resData.errors.nip?.[0]?.toLowerCase().includes("sudah digunakan")) {
            Swal.fire({
              title: "NIP Sudah Terdaftar",
              text: resData.errors.nip[0],
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          } else if (resData.errors.email?.[0]?.toLowerCase().includes("sudah terdaftar") || resData.errors.email?.[0]?.toLowerCase().includes("sudah digunakan")) {
            Swal.fire({
              title: "Email Sudah Terdaftar",
              text: resData.errors.email[0],
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          } else {
            Swal.fire({
              title: "Validasi Gagal",
              text: resData.message || "Periksa kembali input Anda.",
              icon: "warning",
              confirmButtonColor: "#EAB308",
            });
          }
        } else {
          // ⚠️ Error umum dari backend (misal 500, 403, dll)
          Swal.fire({
            title: "Gagal Registrasi",
            text: resData.message || "Terjadi kesalahan saat registrasi.",
            icon: "error",
            confirmButtonColor: "#DC2626",
          });
        }
      } else if (err.request) {
        // ❌ Tidak ada respons sama sekali (server down / koneksi internet gagal)
        Swal.fire({
          title: "Koneksi Gagal",
          text: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      } else {
        // 🧩 Error tak terduga di frontend
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
    <>
      <PageTitle title="Register Kepegawaian" />
      <div className="flex justify-center items-center min-h-dvh my-3 bg-background px-4 md:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-md shadow-sm max-w-lg w-full">
          {/* <div className="flex justify-center mb-4">
            <img src={LogoSekolah} alt="Logo Sekolah" className="object-cover bg-no-repeat bg-center h-36" />
          </div> */}
          <div className="relative w-full">
            <div className="absolute w-32 h-32 inset-0 bg-gradient-to-br from-primary/20 to-indigo-600/20 rounded-2xl blur-xl mx-auto"></div>
            <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-md mx-auto mb-6" />
          </div>

          <h2 className="text-2xl font-bold mb-5 text-center text-primary">Register Kepegawaian</h2>

          <div className="mb-6">
            <label htmlFor="nip" className="block font-semibold text-foreground">
              NIP
              <input
                {...register("nip")}
                type="text"
                name="nip"
                inputMode="numeric"
                maxLength={50}
                placeholder="cth: 123456789098765432"
                className="border p-2 w-full mt-2 rounded"
                autoComplete="off"
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
              />
              {errors.nip && <p className="text-red-500 text-sm">{errors.nip.message}</p>}
            </label>
          </div>

          <div className="mb-6">
            <label htmlFor="nama" className="block font-semibold text-foreground">
              Nama Lengkap
              <input {...register("nama")} type="text" name="nama" placeholder="cth: John Doe" className="border p-2 w-full mt-2 rounded" />
              {errors.nama && <p className="text-red-500 text-sm">{errors.nama.message}</p>}
            </label>
          </div>

          <div className="mb-6">
            <label htmlFor="email" className="block font-semibold text-foreground">
              Email
              <input {...register("email")} type="text" name="email" placeholder="cth: example@gmail.com" className="border p-2 w-full mt-2 rounded" />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </label>
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block font-semibold text-foreground">
              Status
              <input {...register("status")} type="text" name="status" placeholder="cth: Aktif" className="border p-2 w-full mt-2 rounded" />
              {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
            </label>
          </div>

          <div className="mb-6">
            <label htmlFor="keterangan" className="block font-semibold text-foreground">
              Keterangan
              <input {...register("keterangan")} type="text" name="keterangan" placeholder="cth: Guru, Staff, dll" className="border p-2 w-full mt-2 rounded" />
              {errors.keterangan && <p className="text-red-500 text-sm">{errors.keterangan.message}</p>}
            </label>
          </div>

          <div className="mb-6">
            <label className="block font-medium">Role</label>
            <select {...register("role")} className="border p-2 w-full rounded mt-2" defaultValue="">
              <option value="" disabled>
                Pilih Role
              </option>
              <option value="super_admin">Super Admin</option>
              <option value="kepsek">Kepala Sekolah</option>
              <option value="guru">Guru</option>
              <option value="tu">Tata Usaha</option>
              <option value="staff">Staff</option>
            </select>
            {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
          </div>

          <div className="mb-6 relative">
            <label htmlFor="password" className="block font-semibold text-foreground">
              Password
              <input type={showPass ? "text" : "password"} {...register("password")} placeholder="*********" name="password" className="border p-2 w-full mt-2 rounded" autoComplete="current-password" />
            </label>
            <FontAwesomeIcon icon={showPass ? faEye : faEyeSlash} className="absolute top-11 right-3 text-muted-foreground cursor-pointer" onClick={() => setShowPass(!showPass)} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div className="mb-6 relative">
            <label htmlFor="confirmPassword" className="block font-semibold text-foreground">
              Konfirmasi Password
              <input type={showPass ? "text" : "password"} {...register("confirmPassword")} placeholder="*********" name="confirmPassword" className="border p-2 w-full mt-2 rounded" autoComplete="confirm-password" />
            </label>
            <FontAwesomeIcon icon={showPass ? faEye : faEyeSlash} className="absolute top-11 right-3 text-muted-foreground cursor-pointer" onClick={() => setShowPass(!showPass)} />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </div>

          <Button className="text-white w-full mt-3 text-base font-semibold" disabled={loading} size={"lg"}>
            {loading ? "Memuat..." : "Register"}
          </Button>

          <div className="mt-6 text-center">
            <Link to="/login-kepegawaian">
              <p className="text-base font-normal text-foreground">
                Sudah punya akun? <span className="text-primary font-bold">Login</span>
              </p>
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
}
