import { z } from "zod";

export const loginSiswaSchema = z.object({
  nisn: z.string().trim().min(5, "NISN wajib diisi").max(10, "NISN maksimal 10 karakter"),
  password: z
    .string()
    .min(5, "Password minimal 5 karakter")
    .max(8, "Password maksimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf kapital")
    .regex(/\d/, "Password harus mengandung minimal 1 angka")
    .regex(/[$@#%*!?&.]/, "Password harus mengandung minimal 1 simbol seperti $, @, #, ., dll")
    .regex(/^\S*$/, "Password tidak boleh mengandung spasi"),
});

export const loginKepegawaianSchema = z.object({
  nip: z.string().min(5, "NIP wajib diisi").max(18, "NIP maksimal 18 karakter"),
  password: z
    .string()
    .min(5, "Password minimal 5 karakter")
    .max(8, "Password maksimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf kapital")
    .regex(/\d/, "Password harus mengandung minimal 1 angka")
    .regex(/[$@#%*!?&.]/, "Password harus mengandung minimal 1 simbol seperti $, @, #, ., dll")
    .regex(/^\S*$/, "Password tidak boleh mengandung spasi"),
});
