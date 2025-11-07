import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "../../api/axios";
import { registerSiswaSchema } from "../../schema/registerSchema";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/PageTitle";
import LogoSekolah from "@/assets/logo-sekolah.jpg";
import { endpoints } from "../../api/endpoints";
import type { AxiosError } from "axios";
import type { Kelas, Jurusan } from "@/types";

type FormData = z.infer<typeof registerSiswaSchema>;

export default function RegisterSiswa() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(registerSiswaSchema),
    mode: "onSubmit",
  });

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
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

  // 🔹 Fungsi submit form
  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const payload = {
        nama: data.nama,
        nisn: data.nisn,
        nis: data.nis,
        kelas_id: Number(data.kelas),
        jurusan_id: Number(data.jurusan),
        password: data.password,
        password_confirmation: data.confirmPassword,
      };

      const res = await api.post(endpoints.siswa.register, payload);

      if (res.data.status === "success") {
        await Swal.fire({
          title: "Registrasi Berhasil!",
          text: res.data.message || "Registrasi siswa berhasil, silakan login.",
          icon: "success",
          confirmButtonText: "OK",
          confirmButtonColor: "#4F46E5",
        });

        navigate("/login-siswa");
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
    <>
      <PageTitle title="Register Siswa" />
      <div className="flex justify-center items-center min-h-dvh my-3 bg-background px-4 md:px-0">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded-md shadow-sm max-w-lg w-full">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={LogoSekolah} alt="Logo Sekolah" className="object-cover bg-no-repeat bg-center h-36" />
          </div>

          <h2 className="text-2xl font-bold mb-5 text-center text-foreground">Register Siswa</h2>

          {/* NISN */}
          <div className="mb-6">
            <label className="block font-semibold text-foreground">
              NISN
              <input {...register("nisn")} type="text" placeholder="cth: 20214350000008" className="border p-2 w-full mt-2 rounded" autoComplete="off" />
              {errors.nisn && <p className="text-red-500 text-sm">{errors.nisn.message}</p>}
            </label>
          </div>

          {/* Nama */}
          <div className="mb-6">
            <label className="block font-semibold text-foreground">
              Nama Lengkap
              <input {...register("nama")} type="text" placeholder="cth: Siswa Keempat" className="border p-2 w-full mt-2 rounded" autoComplete="name" />
              {errors.nama && <p className="text-red-500 text-sm">{errors.nama.message}</p>}
            </label>
          </div>

          {/* NIS */}
          <div className="mb-6">
            <label className="block font-semibold text-foreground">
              NIS
              <input {...register("nis")} type="text" placeholder="cth: 20214350000008" className="border p-2 w-full mt-2 rounded" autoComplete="username" />
              {errors.nis && <p className="text-red-500 text-sm">{errors.nis.message}</p>}
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

          <Button className="text-white w-full mt-3 text-base font-semibold" disabled={loading} size="lg">
            {loading ? "Memuat..." : "Register"}
          </Button>

          <div className="mt-6 text-center">
            <Link to="/login-siswa">
              <p className="text-base font-normal text-foreground">
                Sudah punya akun? <span className="text-primary font-bold">Login</span>
              </p>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}
