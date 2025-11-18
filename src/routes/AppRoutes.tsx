import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Auth pages
import LoginKepegawaian from "@/pages/Auth/LoginKepegawaian";
import LoginSiswa from "../pages/Auth/LoginSiswa";
import RegisterKepegawaian from "../pages/Auth/RegisterKepegawaian";
import RegisterSiswa from "../pages/Auth/RegisterSiswa";

// Shared
import { NotFound } from "@/pages/NotFound";
import ProtectedRoute from "./ProtectedRoute";

// Dashboard pages
import { DashboardSuperAdmin } from "@/pages/SuperAdmin/DashboardSuperAdmin";
import { DashboardKepsesk } from "@/pages/Kepsek/DashboardKepsek";
import { DashboardGuru } from "@/pages/Guru/DashboardGuru";
import { DashboardTu } from "@/pages/Tu/DashboardTu";
import { DashboardSiswa } from "@/pages/Siswa/DashboardSiswa";

// Super Admin pages
import DataKelas from "../pages/SuperAdmin/InfomasiSekolah/Kelas";
import CreateKelas from "@/pages/SuperAdmin/InfomasiSekolah/Kelas/CreateKelas";
import EditKelas from "@/pages/SuperAdmin/InfomasiSekolah/Kelas/EditKelas";
import DataGuru from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/Guru";
import EditGuru from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/Guru/EditGuru";
import DataJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan";
import CreateJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan/CreateJurusan";
import EditJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan/EditJurusan";
import DataSiswa from "@/pages/SuperAdmin/informasiAkademik/Siswa";
import EditSiswa from "@/pages/SuperAdmin/informasiAkademik/Siswa/EditSiswa";
import DataStaff from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/Staff";
import EditStaff from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/Staff/EditStaff";
import UserSiswa from "@/pages/SuperAdmin/ManajemenUser/Siswa";
import EditUserSiswa from "@/pages/SuperAdmin/ManajemenUser/Siswa/EditUserSiswa";
import UserGuru from "@/pages/SuperAdmin/ManajemenUser/Guru";
import EditUserGuru from "@/pages/SuperAdmin/ManajemenUser/Guru/EditUserGuru";
import UserKepsek from "@/pages/SuperAdmin/ManajemenUser/Kepsek";
import EditUserKepsek from "@/pages/SuperAdmin/ManajemenUser/Kepsek/EditUserKepsek";
import UserTu from "@/pages/SuperAdmin/ManajemenUser/Tu";
import EditUserTu from "@/pages/SuperAdmin/ManajemenUser/Tu/EditUserTu";
import UserStaff from "@/pages/SuperAdmin/ManajemenUser/Staff";
import EditUserStaff from "@/pages/SuperAdmin/ManajemenUser/Staff/EditUserStaff";
import SettingUserSuperAdmin from "@/pages/SuperAdmin/SettingsProfile/SettingUserSuperAdmin";
import DataEkstrakurikuler from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler";
import CreateEkskul from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler/CreateEkskul";
import EditEkskul from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler/EditEkskul";
import DaftarSiswaEkskul from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler/DaftarSiswaEkskul";
import DaftarSiswa from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler/DaftarSiswa";
import DataEkstrakurikulerSiswa from "@/pages/Siswa/Ekstrakurikuler";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import ResetPassword from "@/pages/Auth/ResetPassword";
import DetailEkstrakurikulerSiswa from "@/pages/Siswa/Ekstrakurikuler/DetailEkstrakurikuler";
import EditProfileSuperAdmin from "@/pages/SuperAdmin/SettingsProfile/EditProfileSuperAdmin";
import CreateKepegawaian from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/CreateKepegawaian";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login-kepegawaian" replace />} />
        {/* ================= AUTH ================= */}
        <Route path="/login-kepegawaian" element={<LoginKepegawaian />} />
        <Route path="/login-siswa" element={<LoginSiswa />} />
        <Route path="/register-kepegawaian" element={<RegisterKepegawaian />} />
        <Route path="/register-siswa" element={<RegisterSiswa />} />
        {/* ================= AUTH LUPA PASSWORD ================= */}
        <Route path="/lupa-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        {/* ================= DASHBOARD PER ROLE ================= */}
        <Route
          path="/superadmin/dashboard"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DashboardSuperAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kepsek/dashboard"
          element={
            <ProtectedRoute roles={["kepsek"]}>
              <DashboardKepsesk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/dashboard"
          element={
            <ProtectedRoute roles={["guru"]}>
              <DashboardGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/dashboard"
          element={
            <ProtectedRoute roles={["tu", "staff"]}>
              <DashboardTu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/dashboard"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <DashboardSiswa />
            </ProtectedRoute>
          }
        />
        {/* ================= DATA DASHBOARD SUPER ADMIN ================= */}
        {/* Setting user super admin */}
        <Route
          path="/superadmin/settings-profile/ubah-password"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <SettingUserSuperAdmin />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/settings-profile/ubah-profile"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditProfileSuperAdmin />
            </ProtectedRoute>
          }
        />
        {/* USER MANAJEMEN */}
        {/* Data User Siswa */}
        <Route
          path="/superadmin/manajemen-user/siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/siswa/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserSiswa />
            </ProtectedRoute>
          }
        />
        {/* Data User Guru */}
        <Route
          path="/superadmin/manajemen-user/guru"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/guru/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserGuru />
            </ProtectedRoute>
          }
        />
        {/* Data User Kepsek */}
        <Route
          path="/superadmin/manajemen-user/kepsek"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserKepsek />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/kepsek/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserKepsek />
            </ProtectedRoute>
          }
        />
        {/* Data User Tu */}
        <Route
          path="/superadmin/manajemen-user/tu"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserTu />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/tu/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserTu />
            </ProtectedRoute>
          }
        />
        {/* Data User Staff */}
        <Route
          path="/superadmin/manajemen-user/staff"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <UserStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/manajemen-user/staff/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditUserStaff />
            </ProtectedRoute>
          }
        />
        {/* Data User Ortu */}

        {/* INFORMASI SEKOLAH */}
        {/* Data Guru */}
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/guru"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataGuru />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKepegawaian />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/guru/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditGuru />
            </ProtectedRoute>
          }
        />
        {/* Data Staff */}
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/staff"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataStaff />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian/staff/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditStaff />
            </ProtectedRoute>
          }
        />
        {/* Data Kelas */}
        <Route
          path="/superadmin/informasi-sekolah/kelas"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKelas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kelas/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKelas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kelas/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKelas />
            </ProtectedRoute>
          }
        />
        {/* Data Jurusan */}
        <Route
          path="/superadmin/informasi-sekolah/jurusan"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataJurusan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/jurusan/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateJurusan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/jurusan/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditJurusan />
            </ProtectedRoute>
          }
        />
        {/* INFORMASI AKADEMIK */}
        {/* Data Siswa */}
        <Route
          path="/superadmin/informasi-akademik/siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/siswa/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditSiswa />
            </ProtectedRoute>
          }
        />
        {/* Data Ekstrakurikuler */}
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataEkstrakurikuler />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateEkskul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditEkskul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler/create-siswa/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DaftarSiswaEkskul />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler/daftar-siswa/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DaftarSiswa />
            </ProtectedRoute>
          }
        />
        {/* ================= DATA DASHBOARD SISWA ================= */}
        {/* Data Ekstrakurikuler */}
        <Route
          path="/siswa/ekstrakurikuler"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <DataEkstrakurikulerSiswa />
            </ProtectedRoute>
          }
        />

        <Route
          path="/siswa/ekstrakurikuler/detail-ekstrakurikuler/:id"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <DetailEkstrakurikulerSiswa />
            </ProtectedRoute>
          }
        />

        {/* ================= ERROR PAGE ================= */}
        <Route path="/unauthorized" element={<div>Akses tidak diizinkan</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
