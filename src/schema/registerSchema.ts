import { z } from "zod";

export const registerSiswaSchema = z
  .object({
    nama: z.string().trim().min(1, "Nama wajib diisi"),
    nisn: z.string().trim().min(5, "NISN minimal 5 karakter").max(10, "NISN maksimal 10 karakter"),
    nis: z.string().trim().min(5, "NISN minimal 5 karakter").max(10, "NISN maksimal 10 karakter"),
    kelas: z.string().trim().min(1, "Kelas wajib diisi"),
    jurusan: z.string().trim().min(1, "Jurusan wajib diisi"),
    password: z
      .string()
      .min(5, "Password minimal 5 karakter")
      .max(8, "Password maksimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf kapital")
      .regex(/\d/, "Password harus mengandung minimal 1 angka")
      .regex(/[$@#%*!?&]/, "Password harus mengandung minimal 1 simbol seperti $, @, #, dll")
      .regex(/^\S*$/, "Password tidak boleh mengandung spasi"),
    confirmPassword: z.string().trim().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });

export const registerKepegawaianSchema = z
  .object({
    nama: z.string().trim().min(1, "Nama wajib diisi"),
    nip: z.string().trim().min(5, "NIP minimal 5 karakter").max(18, "NIP maksimal 18 karakter"),
    password: z
      .string()
      .min(5, "Password minimal 5 karakter")
      .max(8, "Password maksimal 8 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf kapital")
      .regex(/\d/, "Password harus mengandung minimal 1 angka")
      .regex(/[$@#%*!?&]/, "Password harus mengandung minimal 1 simbol seperti $, @, #, dll")
      .regex(/^\S*$/, "Password tidak boleh mengandung spasi"),
    confirmPassword: z.string().trim().min(1, "Konfirmasi password wajib diisi"),
    keterangan: z.string().trim().optional(),
    status: z.string().trim().optional(),
    role: z.enum(["super_admin", "kepsek", "guru", "tu", "staff"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak sama",
    path: ["confirmPassword"],
  });
