import { z } from "zod";

export const loginSiswaSchema = z.object({
  // nisn: z.string().trim().min(5, "NISN wajib diisi").max(10, "NISN maksimal 10 karakter"),
  email: z.string().trim().min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(5, "Password minimal 5 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf kapital")
    .regex(/\d/, "Password harus mengandung minimal 1 angka")
    .regex(/[$@#%*!?&.]/, "Password harus mengandung minimal 1 simbol seperti $, @, #, ., dll")
    .regex(/^\S*$/, "Password tidak boleh mengandung spasi"),
});

export const loginKepegawaianSchema = z.object({
  // nip: z.string().min(5, "NIP wajib diisi").max(18, "NIP maksimal 18 karakter"),
  email: z.string().trim().min(1, "Email wajib diisi"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(5, "Password minimal 5 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf kapital")
    .regex(/\d/, "Password harus mengandung minimal 1 angka")
    .regex(/[$@#%*!?&.]/, "Password harus mengandung minimal 1 simbol seperti $, @, #, ., dll")
    .regex(/^\S*$/, "Password tidak boleh mengandung spasi"),
});