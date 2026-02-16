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
import DataJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan";
import CreateJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan/CreateJurusan";
import EditJurusan from "@/pages/SuperAdmin/InfomasiSekolah/Jurusan/EditJurusan";
import DataSiswa from "@/pages/SuperAdmin/informasiAkademik/Siswa";
import EditSiswa from "@/pages/SuperAdmin/informasiAkademik/Siswa/EditSiswa";
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
import EditPasswordSuperAdmin from "@/pages/SuperAdmin/SettingsProfile/EditPasswordSuperAdmin";
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
import CreateSiswa from "@/pages/SuperAdmin/informasiAkademik/Siswa/CreateSiswa";
import DataMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/MataPelajaran";
import CreateMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/MataPelajaran/CreateMapel";
import EditMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/MataPelajaran/EditMapel";
import DataJadwalPelajaran from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaran";
import CreateJadwalPelajaran from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaran/CreateJadwalPelajaran";
import EditJadwalPelajaran from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaran/EditJadwalPelajaran";
import CreateJadwalPelajaranSiswa from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaranSiswa/CreateJadwalPelajaranSiswa";
import EditJadwalPelajaranSiswa from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaranSiswa/EditJadwalPelajaranSiswa";
import DataJadwalPelajaranSiswa from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaranSiswa";
import DataKurikulum from "@/pages/SuperAdmin/InfomasiSekolah/Kurikulum";
import CreateKurikulum from "@/pages/SuperAdmin/InfomasiSekolah/Kurikulum/CreateKurikulum";
import EditKurikulum from "@/pages/SuperAdmin/InfomasiSekolah/Kurikulum/EditKurikulum";
import DataKompetensiDasar from "@/pages/SuperAdmin/informasiAkademik/KompetensiDasar";
import CreateKompetensiDasar from "@/pages/SuperAdmin/informasiAkademik/KompetensiDasar/CreateKompetensiDasar";
import EditKompetensiDasar from "@/pages/SuperAdmin/informasiAkademik/KompetensiDasar/EditKompetensiDasar";
import DataGedung from "@/pages/SuperAdmin/InfomasiSekolah/Gedung";
import CreateGedung from "@/pages/SuperAdmin/InfomasiSekolah/Gedung/CreateGedung";
import EditGedung from "@/pages/SuperAdmin/InfomasiSekolah/Gedung/EditGedung";
import DetailKelas from "@/pages/Siswa/Kelas";
import JadwalPelajaranSiswa from "@/pages/Siswa/JadwalPelajaran";
import EditPasswordSiswa from "@/pages/Siswa/SettingProfile/EditPasswordSiswa";
import EditProfileSiswa from "@/pages/Siswa/SettingProfile/EditProfileSiswa";
import EditPasswordGuru from "@/pages/Guru/SettingsProfile/EditPasswordGuru";
import EditProfileGuru from "@/pages/Guru/SettingsProfile/EditProfileGuru";
import DetailKelasGuru from "@/pages/Guru/Kelas";
import EditKelasGuru from "@/pages/Guru/Kelas/EditKelasGuru";
import JadwalPelajaranGuru from "@/pages/Guru/JadwalPelajaran";
import DetailJadwalPelajaranGuru from "@/pages/Guru/JadwalPelajaran/DetailJadwalPelajaranGuru";
import DataSiswaGuru from "@/pages/Guru/Siswa";
import DetailSiswaGuru from "@/pages/Guru/Siswa/DetailSiswaGuru";
import DetailEkskulGuru from "@/pages/Guru/Ekstrakurikuler";
import DataIdentitasSekolah from "@/pages/SuperAdmin/InfomasiSekolah/IdentitasSekolah";
import CreateIdentitasSekolah from "@/pages/SuperAdmin/InfomasiSekolah/IdentitasSekolah/CreateIdentitasSekolah";
import EditIdentitasSekolah from "@/pages/SuperAdmin/InfomasiSekolah/IdentitasSekolah/EditIdentitasSekolah";
import PublicRoute from "./PublicRoute";
import DataRuangan from "@/pages/SuperAdmin/InfomasiSekolah/Ruangan";
import CreateRuangan from "@/pages/SuperAdmin/InfomasiSekolah/Ruangan/CreateRuangan";
import EditRuangan from "@/pages/SuperAdmin/InfomasiSekolah/Ruangan/EditRuangan";
import DialogDetailJadwalPelajaranSiswa from "@/pages/SuperAdmin/informasiAkademik/JadwalPelajaranSiswa/DialogDetailJadwalPelajaranSiswa";
import DetailJadwalPelajaranSiswa from "@/pages/Siswa/JadwalPelajaran/DetailJadwalPelajaranSiswa";
import DataTahunAkademik from "@/pages/SuperAdmin/InfomasiSekolah/TahunAkademik";
import CreateTahunAkademik from "@/pages/SuperAdmin/InfomasiSekolah/TahunAkademik/CreateTahunAkademik";
import EditTahunAkademik from "@/pages/SuperAdmin/InfomasiSekolah/TahunAkademik/EditTahunAkademik";
import DataPrestasiSiswa from "@/pages/SuperAdmin/informasiAkademik/Prestasi";
import CreatePrestasiSiswa from "@/pages/SuperAdmin/informasiAkademik/Prestasi/CreatePrestasiSiswa";
import EditPrestasiSiswa from "@/pages/SuperAdmin/informasiAkademik/Prestasi/EditPrestasiSiswa";
import DataPsb from "@/pages/SuperAdmin/PSB";
import DetailPsb from "@/pages/SuperAdmin/PSB/DetailPsb";
import CreatePsb from "@/pages/SuperAdmin/PSB/CreatePsb";
import EditPsb from "@/pages/SuperAdmin/PSB/EditPsb";
import HomePage from "@/pages/PublicPsb/HomePsbSiswa";
import FormPsbPublic from "@/pages/PublicPsb/FormPsbSiswa";
import PsbSuccess from "@/pages/PublicPsb/PsbSuccess";
import DataAbsensiPegawai from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiPegawai";
import DataAbsensiPegawaiGuru from "@/pages/Guru/Absensi/Pegawai";
import DetailAbsensiPegawai from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiPegawai/DetailAbsensiPegawai";
import DataAbsensiPelajaran from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiPelajaran";
import DetailAbsensiPelajaran from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiPelajaran/DetailAbsensiPelajaran";
import DataAbsensiPelajaranGuru from "@/pages/Guru/Absensi/Pelajaran";
import DataAbsensiSiswa from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiSiswa";
import DetailAbsensiSiswa from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiSiswa/DetailAbsensiSiswa";
import EditAbsensiSiswa from "@/pages/SuperAdmin/InformasiLaporanUmum/DataAbsensi/AbsensiSiswa/EditAbsensiSiswa";
import DataAbsensiPelajaranSiswa from "@/pages/Siswa/Absensi/Pelajaran";
import CreateAbsensiPelajaranSiswa from "@/pages/Siswa/Absensi/Pelajaran/CreateAbsensiPelajaranSiswa";
import DataKeuangan from "@/pages/SuperAdmin/InformasiLaporanUmum/Keuangan";
import CreateKeuangan from "@/pages/SuperAdmin/InformasiLaporanUmum/Keuangan/CreateKeuangan";
import EditKeuangan from "@/pages/SuperAdmin/InformasiLaporanUmum/Keuangan/EditKeuangan";
import DetailKeuangan from "@/pages/SuperAdmin/InformasiLaporanUmum/Keuangan/DetailKeuangan";
import EditEkskulSiswaSikap from "@/pages/SuperAdmin/informasiAkademik/Ekstrakurikuler/EditEkskulSiswaSikap";
import KompetensiDasar from "@/pages/Guru/KompetensiDasar";
import EditEkskulSikapSiswaPegawai from "@/pages/Guru/Ekstrakurikuler/EditEkskulSikapSiswaPegawai";
import DataKepegawaian from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian";
import EditKepegawaian from "@/pages/SuperAdmin/InfomasiSekolah/Kepegawaian/EditKepegawaian";
import DataSemester from "@/pages/SuperAdmin/InfomasiSekolah/Semester";
import CreateSemester from "@/pages/SuperAdmin/InfomasiSekolah/Semester/CreateSemester";
import EditSemester from "@/pages/SuperAdmin/InfomasiSekolah/Semester/EditSemester";
import DataKurikulumMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/KurikulumMataPelajaran";
import CreateKurikulumMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/KurikulumMataPelajaran/CreateKurikulumMataPelajaran";
import EditKurikulumMataPelajaran from "@/pages/SuperAdmin/informasiAkademik/KurikulumMataPelajaran/EditKurikulumMataPelajaran";
import DataAtpMaster from "@/pages/SuperAdmin/informasiAkademik/AlurTujuanPembelajaran";
import CreateAtpMaster from "@/pages/SuperAdmin/informasiAkademik/AlurTujuanPembelajaran/CreateAlurTujuanPembelajaran";
import EditAtpMaster from "@/pages/SuperAdmin/informasiAkademik/AlurTujuanPembelajaran/EditAlurTujuanPembelajaran";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login-kepegawaian" replace />} />
        {/* ================= AUTH ================= */}
        <Route
          path="/login-kepegawaian"
          element={
            <PublicRoute>
              <LoginKepegawaian />
            </PublicRoute>
          }
        />
        <Route
          path="/login-siswa"
          element={
            <PublicRoute>
              <LoginSiswa />
            </PublicRoute>
          }
        />
        <Route
          path="/register-kepegawaian"
          element={
            <PublicRoute>
              <RegisterKepegawaian />
            </PublicRoute>
          }
        />
        <Route
          path="/register-siswa"
          element={
            <PublicRoute>
              <RegisterSiswa />
            </PublicRoute>
          }
        />

        {/* ================= AUTH LUPA PASSWORD Pegawai ================= */}
        <Route
          path="/lupa-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />
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
              <EditPasswordSuperAdmin />
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
        {/* Data Kepegawaian */}
        <Route
          path="/superadmin/informasi-sekolah/kepegawaian"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKepegawaian />
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
          path="/superadmin/informasi-sekolah/kepegawaian/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKepegawaian />
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
        {/* Data Kurikulum */}
        <Route
          path="/superadmin/informasi-sekolah/kurikulum"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKurikulum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kurikulum/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKurikulum />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/kurikulum/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKurikulum />
            </ProtectedRoute>
          }
        />
        {/* Data Gedung */}
        <Route
          path="/superadmin/informasi-sekolah/gedung"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataGedung />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/gedung/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateGedung />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/gedung/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditGedung />
            </ProtectedRoute>
          }
        />
        {/* Data Ruangan*/}
        <Route
          path="/superadmin/informasi-sekolah/ruangan"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataRuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/ruangan/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateRuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/ruangan/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditRuangan />
            </ProtectedRoute>
          }
        />
        {/* Data Identitas Sekolah */}
        <Route
          path="/superadmin/informasi-sekolah/identitas-sekolah"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataIdentitasSekolah />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/identitas-sekolah/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateIdentitasSekolah />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/identitas-sekolah/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditIdentitasSekolah />
            </ProtectedRoute>
          }
        />
        {/* Data Tahun Akademik */}
        <Route
          path="/superadmin/informasi-sekolah/tahun-akademik"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataTahunAkademik />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/tahun-akademik/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateTahunAkademik />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/tahun-akademik/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditTahunAkademik />
            </ProtectedRoute>
          }
        />

        {/* Data Semester */}
        <Route
          path="/superadmin/informasi-sekolah/semester"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataSemester />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/semester/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateSemester />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/semester/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditSemester />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/tahun-akademik/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateTahunAkademik />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-sekolah/tahun-akademik/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditTahunAkademik />
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
          path="/superadmin/informasi-akademik/siswa/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateSiswa />
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
        <Route
          path="/superadmin/informasi-akademik/ekstrakurikuler/edit-siswa/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditEkskulSiswaSikap />
            </ProtectedRoute>
          }
        />
        {/* Data Mata Pelajaran */}
        <Route
          path="/superadmin/informasi-akademik/mata-pelajaran"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataMataPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/mata-pelajaran/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateMataPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/mata-pelajaran/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditMataPelajaran />
            </ProtectedRoute>
          }
        />

        {/* Data Kurikulum Mata Pelajaran */}
        <Route
          path="/superadmin/informasi-akademik/kurikulum-mata-pelajaran"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKurikulumMataPelajaran />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/informasi-akademik/kurikulum-mata-pelajaran/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKurikulumMataPelajaran />
            </ProtectedRoute>
          }
        />

        <Route
          path="/superadmin/informasi-akademik/kurikulum-mata-pelajaran/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKurikulumMataPelajaran />
            </ProtectedRoute>
          }
        />

        {/* Data Jadwal Pelajaran */}
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-guru"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataJadwalPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-guru/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateJadwalPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-guru/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditJadwalPelajaran />
            </ProtectedRoute>
          }
        />
        {/* Data Jadwal Pelajaran Siswa */}
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataJadwalPelajaranSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-siswa/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateJadwalPelajaranSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="//superadmin/informasi-akademik/jadwal-pelajaran-siswa/edit/:siswaId/:pivotId"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditJadwalPelajaranSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/jadwal-pelajaran-siswa/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DialogDetailJadwalPelajaranSiswa />{" "}
            </ProtectedRoute>
          }
        />
        {/* Data Kompetensi Dasar */}
        <Route
          path="/superadmin/informasi-akademik/kompetensi"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKompetensiDasar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/kompetensi/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKompetensiDasar />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/kompetensi/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKompetensiDasar />
            </ProtectedRoute>
          }
        />

        {/* Data ATP Master */}
        <Route
          path="/superadmin/informasi-akademik/alur-tujuan-pembelajaran"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataAtpMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/alur-tujuan-pembelajaran/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateAtpMaster />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/alur-tujuan-pembelajaran/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditAtpMaster />
            </ProtectedRoute>
          }
        />

        {/* Data Prestasi Siswa */}
        <Route
          path="/superadmin/informasi-akademik/prestasi-siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataPrestasiSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/prestasi-siswa/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreatePrestasiSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-akademik/prestasi-siswa/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditPrestasiSiswa />
            </ProtectedRoute>
          }
        />
        {/* Data PSB */}
        <Route
          path="/superadmin/psb"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataPsb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/psb/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailPsb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/psb/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreatePsb />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/psb/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditPsb />
            </ProtectedRoute>
          }
        />

        {/* INFORMASI LAPORAN UMUM */}
        {/* Data Absensi Pegawai */}
        <Route
          path="/superadmin/informasi-laporan-umum/absensi-pegawai"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataAbsensiPegawai />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/absensi-pegawai/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailAbsensiPegawai />
            </ProtectedRoute>
          }
        />

        {/* Data Absensi Pelajaran */}
        <Route
          path="/superadmin/informasi-laporan-umum/absensi-pelajaran"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataAbsensiPelajaran />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/absensi-pelajaran/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailAbsensiPelajaran />
            </ProtectedRoute>
          }
        />

        {/* Data Absensi Siswa */}
        <Route
          path="/superadmin/informasi-laporan-umum/absensi-siswa"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataAbsensiSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/absensi-siswa/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailAbsensiSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/absensi-siswa/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditAbsensiSiswa />
            </ProtectedRoute>
          }
        />

        {/* Data Keuangan */}
        <Route
          path="/superadmin/informasi-laporan-umum/data-keuangan"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DataKeuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/data-keuangan/create"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <CreateKeuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/data-keuangan/edit/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <EditKeuangan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/superadmin/informasi-laporan-umum/data-keuangan/detail/:id"
          element={
            <ProtectedRoute roles={["super_admin"]}>
              <DetailKeuangan />
            </ProtectedRoute>
          }
        />

        {/* ================= DATA DASHBOARD GURU ================= */}
        {/* Setting User */}
        <Route
          path="/guru/settings-profile/ubah-password"
          element={
            <ProtectedRoute roles={["guru"]}>
              <EditPasswordGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/settings-profile/ubah-profile"
          element={
            <ProtectedRoute roles={["guru"]}>
              <EditProfileGuru />
            </ProtectedRoute>
          }
        />

        {/* Data Kelas */}
        <Route
          path="/guru/kelas/detail-kelas"
          element={
            <ProtectedRoute roles={["guru"]}>
              <DetailKelasGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/kelas/edit"
          element={
            <ProtectedRoute roles={["guru"]}>
              <EditKelasGuru />
            </ProtectedRoute>
          }
        />

        {/* Data Jadwal Pembelajaran */}
        <Route
          path="/guru/jadwal-pelajaran/data-jadwal"
          element={
            <ProtectedRoute roles={["guru"]}>
              <JadwalPelajaranGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/jadwal-pelajaran/detail/:id"
          element={
            <ProtectedRoute roles={["guru"]}>
              <DetailJadwalPelajaranGuru />
            </ProtectedRoute>
          }
        />

        {/* Data Siswa */}
        <Route
          path="/guru/siswa/data-siswa"
          element={
            <ProtectedRoute roles={["guru"]}>
              <DataSiswaGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/siswa/data-siswa/detail-siswa/:id"
          element={
            <ProtectedRoute roles={["guru"]}>
              <DetailSiswaGuru />
            </ProtectedRoute>
          }
        />

        {/* Data Ekstrakurikuler */}
        <Route
          path="/guru/ekstrakurikuler/data-ekstrakurikuler"
          element={
            <ProtectedRoute roles={["guru"]}>
              <DetailEkskulGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/ekstrakurikuler/edit-siswa/:id"
          element={
            <ProtectedRoute roles={["guru"]}>
              <EditEkskulSikapSiswaPegawai />
            </ProtectedRoute>
          }
        />

        {/* Data Absensi */}
        <Route
          path="/guru/absensi/data-absensi/pegawai"
          element={
            <ProtectedRoute roles={["guru"]}>
              <DataAbsensiPegawaiGuru />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guru/absensi/data-absensi/pelajaran"
          element={
            <ProtectedRoute roles={["guru"]}>
              <DataAbsensiPelajaranGuru />
            </ProtectedRoute>
          }
        />

        {/* Kompetensi Dasar */}
        <Route
          path="/guru/kompetensi-dasar"
          element={
            <ProtectedRoute roles={["guru"]}>
              <KompetensiDasar />
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

        {/* Detail Kelas */}
        <Route
          path="/siswa/detail-kelas"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <DetailKelas />
            </ProtectedRoute>
          }
        />

        {/* Jadwal Pelajaran Siswa */}
        <Route
          path="/siswa/jadwal-pelajaran"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <JadwalPelajaranSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/jadwal-pelajaran/detail/:id"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <DetailJadwalPelajaranSiswa />
            </ProtectedRoute>
          }
        />

        {/* Setting User */}
        <Route
          path="/siswa/settings-profile/ubah-password"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <EditPasswordSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/settings-profile/ubah-profile"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <EditProfileSiswa />
            </ProtectedRoute>
          }
        />

        {/* Data Absensi Pelajaran */}
        <Route
          path="/siswa/data-absensi/pelajaran"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <DataAbsensiPelajaranSiswa />
            </ProtectedRoute>
          }
        />
        <Route
          path="/siswa/data-absensi/pelajaran/create"
          element={
            <ProtectedRoute roles={["siswa"]}>
              <CreateAbsensiPelajaranSiswa />
            </ProtectedRoute>
          }
        />

        {/* ================= PUBLIC PSB SISWA ================= */}
        <Route path="/public-psb/" element={<HomePage />} />
        <Route path="/public-psb/form-psb-siswa" element={<FormPsbPublic />} />
        <Route path="/public-psb/psb-success" element={<PsbSuccess />} />

        {/* ================= ERROR PAGE ================= */}
        <Route path="/unauthorized" element={<div>Akses tidak diizinkan</div>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
