import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginKepegawaianSchema } from "../../schema/loginSchema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import LogoSekolah from "@/assets/logo-sekolah-42.png";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { useAuthStore } from "../../store/authStore";
import { AxiosError } from "axios";
import Footer from "../Footer";

type FormData = z.infer<typeof loginKepegawaianSchema>;

export default function LoginKepegawaian() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginKepegawaianSchema),
  });

  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, checkAuth, isCheckingAuth } = useAuthStore();

  // Jalankan hanya sekali saat halaman login dibuka
  useEffect(() => {
    // Cek apakah user sudah login dari localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);

      // Langsung redirect sesuai role (tanpa menampilkan halaman login dulu)
      switch (user.role) {
        case "super_admin":
          navigate("/superadmin/dashboard", { replace: true });
          return;
        case "guru":
          navigate("/guru/dashboard", { replace: true });
          return;
        case "tu":
        case "staff":
          navigate("/staff/dashboard", { replace: true });
          return;
        case "kepsek":
          navigate("/kepsek/dashboard", { replace: true });
          return;
        default:
          navigate("/unauthenticated", { replace: true });
          return;
      }
    }

    // Kalau belum login, baru jalankan pengecekan token
    checkAuth();
  }, [navigate, checkAuth]);

  // Fungsi login
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      await login("/kepegawaian/login", data);

      const storedUser = JSON.parse(localStorage.getItem("user")!);

      await Swal.fire({
        title: "Login Berhasil!",
        text: "Klik OK untuk melanjutkan.",
        icon: "success",
        confirmButtonText: "OK",
        confirmButtonColor: "#4F46E5",
      });

      // 🔁 Arahkan ke dashboard sesuai role
      switch (storedUser.role) {
        case "super_admin":
          navigate("/superadmin/dashboard", { replace: true });
          break;
        case "guru":
          navigate("/guru/dashboard", { replace: true });
          break;
        case "tu":
        case "staff":
          navigate("/staff/dashboard", { replace: true });
          break;
        case "kepsek":
          navigate("/kepsek/dashboard", { replace: true });
          break;
        default:
          navigate("/unauthenticated", { replace: true });
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      console.error("Login Error:", err);

      if (err.response) {
        const status = err.response.status;
        const resData = err.response.data;

        if (status === 401) {
          // 🔑 Login gagal karena kredensial salah
          await Swal.fire({
            title: "Login Gagal",
            text: resData.message || "Email atau password salah. Silakan coba lagi.",
            icon: "error",
            confirmButtonColor: "#DC2626",
          });
        } else if (status === 422 && resData?.errors) {
          // ⚠️ Validasi input dari backend
          const firstError = Object.values(resData.errors)[0]?.[0] || "Periksa kembali input Anda.";
          await Swal.fire({
            title: "Validasi Gagal",
            text: firstError,
            icon: "warning",
            confirmButtonColor: "#EAB308",
          });
        } else {
          // ⚠️ Error umum dari backend
          await Swal.fire({
            title: "Terjadi Kesalahan",
            text: resData.message || "Terjadi kesalahan di server. Silakan coba lagi nanti.",
            icon: "error",
            confirmButtonColor: "#DC2626",
          });
        }
      } else if (err.request) {
        // ❌ Tidak ada respons dari server (server mati / koneksi internet gagal)
        await Swal.fire({
          title: "Koneksi Gagal",
          text: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      } else {
        // 🧩 Error tak terduga di frontend
        await Swal.fire({
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

  // Tampilkan loading saat sedang memeriksa sesi login
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-muted-foreground">Memeriksa sesi login...</p>
      </div>
    );
  }

  return (
    <>
      <PageTitle title="Login Kepegawaian" />
      <div className="flex justify-center items-center min-h-dvh bg-background px-4 md:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-md shadow-sm max-w-lg w-full">
          {/* <div className="flex justify-center mb-4">
            <img src={LogoSekolah} alt="Logo Sekolah" className="object-cover bg-no-repeat bg-center h-36" />
          </div> */}
          <div className="relative w-full">
            <div className="absolute w-32 h-32 inset-0 bg-gradient-to-br from-primary/20 to-indigo-600/20 rounded-2xl blur-xl mx-auto"></div>
            <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-md mx-auto mb-6" />
          </div>

          <h2 className="text-2xl font-bold mb-5 text-center text-primary">Login Kepegawaian</h2>

          {/* Input Email */}
          <div className="mb-6">
            <label htmlFor="email" className="block font-semibold text-foreground">
              Email
              <input {...register("email")} type="text" placeholder="cth: example@gmail.com" className="border p-2 w-full mt-2 rounded" autoComplete="username" autoFocus />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </label>
          </div>

          {/* Input Password */}
          <div className="mb-6 relative">
            <label htmlFor="password" className="block font-semibold text-foreground">
              Password
              <input type={showPass ? "text" : "password"} {...register("password")} placeholder="*********" className="border p-2 w-full mt-2 rounded" autoComplete="current-password" />
            </label>
            <FontAwesomeIcon icon={showPass ? faEye : faEyeSlash} className="absolute top-11 right-3 text-muted-foreground cursor-pointer" onClick={() => setShowPass(!showPass)} />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          {/* Tombol Lupa Password */}
          <div className="mt-3 mb-3 text-end">
            <Link to="/lupa-password" className="text-sm text-primary font-semibold">
              Lupa Password?
            </Link>
          </div>

          {/* Tombol Login */}
          <Button className="text-white w-full mt-3 text-base font-semibold" disabled={loading} size={"lg"}>
            {loading ? "Memuat..." : "Login"}
          </Button>

          <div className="mt-6 text-center">
            <Link to="/register-kepegawaian">
              <p className="text-base font-normal text-foreground">
                Belum punya akun? <span className="text-primary font-bold">Register</span>
              </p>
            </Link>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
}
