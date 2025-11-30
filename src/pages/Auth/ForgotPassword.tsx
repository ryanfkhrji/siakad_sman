import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import { AxiosError } from "axios";
// import { Link } from "react-router-dom";
import { useState } from "react";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email tidak valid").nonempty("Email wajib diisi"),
});

type FormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const res = await api.post("/lupa-password", data);
      Swal.fire({
        title: "Berhasil!",
        text: res.data.message || "Link reset password telah dikirim ke email Anda.",
        icon: "success",
      });
    } catch (err) {
      console.error("Error:", err);

      let message = "Terjadi kesalahan. Pastikan email terdaftar.";

      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
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

  return (
    <>
      <PageTitle title="Lupa Password" />
      <div className="flex justify-center items-center min-h-dvh bg-background px-4 md:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-md shadow-sm max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-5 text-center text-foreground">Lupa Password</h2>
          <label className="block mb-4 font-semibold text-foreground">
            Masukkan Email Terdaftar
            <input {...register("email")} type="email" placeholder="cth: example@gmail.com" className="border p-2 w-full mt-2 rounded" />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </label>
          <Button className="text-white w-full mt-3 text-base font-semibold" disabled={loading} size={"lg"}>
            {loading ? "Mengirim..." : "Kirim Link Reset Password"}
          </Button>

          {/* <div className="mt-3 text-center">
            <Link to="/login-kepegawaian">
              <Button variant={"outline"} size={"lg"} className="w-full text-base font-semibold">
                Kembali Ke Login
              </Button>
            </Link>
          </div> */}
        </form>
      </div>
    </>
  );
}
