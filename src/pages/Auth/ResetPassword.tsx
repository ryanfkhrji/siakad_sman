import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/api/axios";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import { AxiosError } from "axios";

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirm_password"],
  });

type FormData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await api.post(`/reset-password/${token}`, data);
      Swal.fire({
        title: "Berhasil!",
        text: res.data.message || "Password berhasil diperbarui.",
        icon: "success",
      }).then(() => navigate("/login-kepegawaian"));
    } catch (err) {
      let message = "Token tidak valid atau sudah kedaluwarsa."

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
    }
  };

  return (
    <>
      <PageTitle title="Reset Password" />
      <div className="flex justify-center items-center min-h-dvh bg-background px-4 md:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-md shadow-sm max-w-lg w-full">
          <h2 className="text-2xl font-bold mb-5 text-center text-foreground">Reset Password</h2>

          <label className="block mb-4 font-semibold text-foreground">
            Password Baru
            <input type="password" {...register("password")} placeholder="********" className="border p-2 w-full mt-2 rounded" />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </label>

          <label className="block mb-4 font-semibold text-foreground">
            Konfirmasi Password
            <input type="password" {...register("confirm_password")} placeholder="********" className="border p-2 w-full mt-2 rounded" />
            {errors.confirm_password && <p className="text-red-500 text-sm">{errors.confirm_password.message}</p>}
          </label>

          <Button className="text-white w-full mt-3 text-base font-semibold">Ubah Password</Button>
        </form>
      </div>
    </>
  );
}
