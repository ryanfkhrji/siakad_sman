import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSiswaSchema } from "../../schema/loginSchema";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import Swal from "sweetalert2";
import LogoSekolah from "@/assets/logo-sekolah-42.png";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { useAuthStore } from "@/store/authStore";
import { AxiosError } from "axios";
import Footer from "../Footer";

type FormData = z.infer<typeof loginSiswaSchema>;

export default function LoginSiswa() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSiswaSchema),
  });

  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, user, isAuthenticated, checkAuth, isCheckingAuth } = useAuthStore();

  // ✅ Cek sesi login lebih awal, sebelum render form
  useEffect(() => {
    const verifyAuth = async () => {
      await checkAuth();
    };
    verifyAuth();
  }, [checkAuth]);

  // ✅ Redirect otomatis kalau sudah login
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated && user?.role === "siswa") {
      navigate("/siswa/dashboard", { replace: true });
    }
  }, [isAuthenticated, user, isCheckingAuth, navigate]);

  // const onSubmit = async (data: FormData) => {
  //   try {
  //     setLoading(true);
  //     await login("siswa/login", data);
  //     const savedUser = JSON.parse(localStorage.getItem("user") || "{}");

  //     await Swal.fire({
  //       title: "Login Berhasil!",
  //       text: `Selamat datang, ${savedUser.nama || savedUser.name || "Siswa"}`,
  //       icon: "success",
  //       confirmButtonText: "OK",
  //       confirmButtonColor: "#4F46E5",
  //     });

  //     navigate("/siswa/dashboard", { replace: true });
  //   } catch (err) {
  //     console.error("Login Error:", err);
  //     let message = "Periksa kembali NISN dan password Anda.";

  //     if (err instanceof AxiosError) {
  //       message = err.response?.data?.message || err.response?.data?.errors || message;
  //     } else if (err instanceof Error) {
  //       message = err.message;
  //     }

  //     await Swal.fire({
  //       title: "Login Gagal",
  //       text: message,
  //       icon: "error",
  //       confirmButtonColor: "#EF4444",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      await login("siswa/login", data);

      // Ambil user langsung dari Zustand, lebih aman
      const savedUser = useAuthStore.getState().user;

      await Swal.fire({
        title: "Login Berhasil!",
        text: `Selamat datang, ${savedUser?.nama || "Siswa"}`,
        icon: "success",
        confirmButtonColor: "#4F46E5",
      });

      navigate("/siswa/dashboard", { replace: true });
    } catch (err) {
      console.error("Login Error:", err);
      let message = "Periksa kembali NISN dan password Anda.";

      if (err instanceof AxiosError) {
        message = err.response?.data?.message || err.response?.data?.errors || message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      await Swal.fire({
        title: "Login Gagal",
        text: message,
        icon: "error",
        confirmButtonColor: "#EF4444",
      });
    } finally {
      setLoading(false);
    }
  };


  // ✅ UX lebih baik: Tampilkan loading dulu sebelum tahu status login
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600 text-lg animate-pulse">Memeriksa sesi login...</p>
      </div>
    );
  }

  // ✅ Kalau sudah login langsung redirect (tidak render form)
  if (isAuthenticated && user?.role === "siswa") {
    navigate("/siswa/dashboard", { replace: true });
    return null;
  }

  // ✅ Kalau belum login, baru tampilkan form
  return (
    <>
      <PageTitle title="Login Siswa" />
      <div className="flex justify-center items-center min-h-dvh bg-background px-4 md:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-md shadow-sm max-w-lg w-full">
          {/* <div className="flex justify-center mb-4">
            <img src={LogoSekolah} alt="Logo Sekolah" className="object-cover bg-no-repeat bg-center h-36" />
          </div> */}
          <div className="relative w-full">
            <div className="absolute w-32 h-32 inset-0 bg-gradient-to-br from-primary/20 to-indigo-600/20 rounded-2xl blur-xl mx-auto"></div>
            <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl object-cover border-4 border-white shadow-md mx-auto mb-6" />
          </div>

          <h2 className="text-2xl font-bold mb-5 text-center text-primary">Login Siswa</h2>

          <div className="mb-6">
            <label htmlFor="email" className="block font-semibold text-foreground">
              Email
              <input {...register("email")} type="text" placeholder="cth: example@gmail.com" className="border p-2 w-full mt-2 rounded" autoComplete="username" autoFocus />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </label>
          </div>

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
            <Link to="/lupa-password?type=siswa" className="text-sm text-primary font-semibold">
              Lupa Password?
            </Link>
          </div>

          <Button className="text-white w-full mt-3 text-base font-semibold" disabled={loading} size={"lg"}>
            {loading ? "Memuat..." : "Login"}
          </Button>

          <div className="mt-6 text-center">
            <Link to="/register-siswa">
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
