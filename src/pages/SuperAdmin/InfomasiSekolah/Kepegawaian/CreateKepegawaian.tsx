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
import { registerKepegawaianSchema } from "@/schema/registerSchema";
import type { z } from "zod";
import type { AxiosError } from "axios";

// font awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// 🟦 Type Form
type FormData = z.infer<typeof registerKepegawaianSchema>;

const CreateKepegawaian = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerKepegawaianSchema),
    mode: "onSubmit",
  });

  // 🟦 SUBMIT
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const payload = {
        nama: data.nama,
        nip: data.nip,
        email: data.email,
        keterangan: data.keterangan,
        status: data.status,
        password: data.password,
        password_confirmation: data.confirmPassword,
        role: data.role,
      };

      await api.post("/kepegawaian/register", payload);

      await Swal.fire({
        title: "Registrasi Berhasil!",
        text: "Data kepegawaian berhasil ditambahkan.",
        icon: "success",
        confirmButtonColor: "#4F46E5",
      });

      reset();

      navigate("/superadmin/informasi-sekolah/kepegawaian/create");
    } catch (error) {
      const err = error as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;

      if (err.response) {
        const resData = err.response.data;

        // 🔥 SET ERROR VALIDASI KE FORM
        if (resData.errors) {
          Object.entries(resData.errors).forEach(([field, msgs]) => {
            setError(field as keyof FormData, {
              type: "server",
              message: msgs[0],
            });
          });
        }

        Swal.fire({
          title: "Gagal",
          text: resData.message || "Terjadi error.",
          icon: "error",
          confirmButtonColor: "#DC2626",
        });
      } else {
        Swal.fire({
          title: "Koneksi Error",
          text: "Tidak dapat terhubung ke server.",
          icon: "error",
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
        <PageTitle title="Tambah Kepegawaian" />

        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-6">Tambah Kepegawaian</h1>

          <div className="bg-white rounded shadow p-5">
            <form className="space-y-6 max-w-lg w-full" onSubmit={handleSubmit(onSubmit)}>
              {/* Nama */}
              <div>
                <label className="block font-semibold">
                  Nama Lengkap
                  <input {...register("nama")} className="border p-2 w-full mt-2 rounded" placeholder="cth: John Doe" />
                  {errors.nama && <p className="text-red-500 text-sm">{errors.nama.message}</p>}
                </label>
              </div>

              {/* NIP */}
              <div>
                <label className="block font-semibold">
                  NIP
                  <input {...register("nip")} className="border p-2 w-full mt-2 rounded" placeholder="cth: 1234567890" />
                  {errors.nip && <p className="text-red-500 text-sm">{errors.nip.message}</p>}
                </label>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block font-semibold">
                  Email
                  <input {...register("email")} className="border p-2 w-full mt-2 rounded" placeholder="cth: example@gmail.com" />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </label>
              </div>

              {/* STATUS */}
              <div>
                <label className="block font-semibold">
                  Status
                  <input {...register("status")} className="border p-2 w-full mt-2 rounded" placeholder="cth: Aktif" />
                  {errors.status && <p className="text-red-500 text-sm">{errors.status.message}</p>}
                </label>
              </div>

              {/* KETERANGAN */}
              <div>
                <label className="block font-semibold">
                  Keterangan
                  <input {...register("keterangan")} className="border p-2 w-full mt-2 rounded" placeholder="cth: Guru / Staff" />
                  {errors.keterangan && <p className="text-red-500 text-sm">{errors.keterangan.message}</p>}
                </label>
              </div>

              {/* ROLE */}
              <div>
                <label className="block font-semibold">
                  Role
                  <select {...register("role")} className="border p-2 w-full mt-2 rounded">
                    <option value="">Pilih Role</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="kepsek">Kepala Sekolah</option>
                    <option value="guru">Guru</option>
                    <option value="tu">Tata Usaha</option>
                    <option value="staff">Staff</option>
                  </select>
                  {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
                </label>
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <label className="block font-semibold">
                  Password
                  <input type={showPass ? "text" : "password"} {...register("password")} className="border p-2 w-full mt-2 rounded" placeholder="********" />
                </label>

                <FontAwesomeIcon icon={showPass ? faEye : faEyeSlash} className="absolute top-11 right-3 text-gray-500 cursor-pointer" onClick={() => setShowPass(!showPass)} />

                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="relative">
                <label className="block font-semibold">
                  Konfirmasi Password
                  <input type={showPass ? "text" : "password"} {...register("confirmPassword")} className="border p-2 w-full mt-2 rounded" placeholder="********" />
                </label>

                <FontAwesomeIcon icon={showPass ? faEye : faEyeSlash} className="absolute top-11 right-3 text-gray-500 cursor-pointer" onClick={() => setShowPass(!showPass)} />

                {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
              </div>

              {/* BUTTON */}
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-primary flex items-center gap-2">
                  <FilePlus size={18} />
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>

                <Link to="/superadmin/dashboard">
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

export default CreateKepegawaian;
