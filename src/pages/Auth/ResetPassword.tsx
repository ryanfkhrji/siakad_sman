import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import { AxiosError } from "axios";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // Import icon

const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token tidak valid"),
    email: z.string().email("Email tidak valid"),
    password: z
      .string()
      .min(6, "Password minimal 6 karakter")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, "Password harus mengandung huruf besar, huruf kecil, angka, dan simbol"),
    password_confirmation: z.string(),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

type FormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // State untuk show/hide password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Ambil token dan email dari URL params
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token,
      email: email,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      // Kirim ke endpoint tanpa token di URL
      const res = await api.post("/reset-password", {
        token: data.token,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      Swal.fire({
        title: "Berhasil!",
        text: res.data.message || "Password berhasil diperbarui.",
        icon: "success",
      })
    } catch (err) {
      let message = "Token tidak valid atau sudah kedaluwarsa.";

      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;

        // Tampilkan error detail jika ada
        const errors = err.response?.data?.errors;
        if (errors) {
          const errorMessages = Object.values(errors).flat().join(", ");
          message = errorMessages;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      Swal.fire({
        title: "Gagal",
        text: message,
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Validasi jika token atau email tidak ada
  if (!token || !email) {
    return (
      <>
        <PageTitle title="Reset Password" />
        <div className="flex justify-center items-center min-h-dvh bg-background px-4 md:px-0">
          <div className="bg-white p-6 rounded-md shadow-sm max-w-lg w-full text-center">
            <h2 className="text-2xl font-bold mb-5 text-red-500">Link Tidak Valid</h2>
            <p className="mb-4">Token atau email tidak ditemukan. Silakan minta link reset password baru.</p>
            <Button onClick={() => navigate("/lupa-password")} className="w-full">
              Kembali ke Lupa Password
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageTitle title="Reset Password" />
      <div className="flex justify-center items-center min-h-dvh bg-background px-4 md:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-md shadow-sm max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-5 text-center text-foreground">Reset Password</h2>

          {/* Hidden inputs untuk token dan email */}
          <input type="hidden" {...register("token")} />
          <input type="hidden" {...register("email")} />

          {/* Tampilkan email (read-only) agar user tahu email mana yang direset */}
          <label className="block mb-4 font-semibold text-foreground">
            Email
            <input type="email" value={email} readOnly className="border p-2 w-full mt-2 rounded bg-gray-100 cursor-not-allowed" />
          </label>

          {/* Password Baru dengan Toggle Show/Hide */}
          <label className="block mb-4 font-semibold text-foreground">
            Password Baru
            <div className="relative">
              <input type={showPassword ? "text" : "password"} {...register("password")} placeholder="Minimal 6 karakter" className="border p-2 w-full mt-2 rounded pr-10" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none mt-1"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </label>

          {/* Konfirmasi Password dengan Toggle Show/Hide */}
          <label className="block mb-4 font-semibold text-foreground">
            Konfirmasi Password
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} {...register("password_confirmation")} placeholder="Ketik ulang password" className="border p-2 w-full mt-2 rounded pr-10" />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none mt-1"
                aria-label={showConfirmPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password_confirmation && <p className="text-red-500 text-sm mt-1">{errors.password_confirmation.message}</p>}
          </label>

          <Button type="submit" className="text-white w-full mt-3 text-base font-semibold" disabled={loading}>
            {loading ? "Loading..." : "Ubah Password"}
          </Button>

          {/* <div className="mt-3 text-center">
            <Button type="button" variant="outline" onClick={() => navigate("/login-kepegawaian")} className="w-full">
              Kembali ke Login
            </Button>
          </div> */}
        </form>
      </div>
    </>
  );
}
