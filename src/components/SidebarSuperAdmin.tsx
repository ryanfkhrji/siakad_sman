import { SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Home, Users, School, FileText, GraduationCap, ClipboardList, Settings, ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoSekolah from "@/assets/logo-sekolah.jpg";
import { useAuthStore } from "@/store/authStore";
import Swal from "sweetalert2";

export function SidebarSuperAdmin({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const toggleSubDropdown = (menu: string) => {
    setOpenSubDropdown(openSubDropdown === menu ? null : menu);
  };

  return (
    <>
      {/* Tombol toggle sidebar di mobile */}
      <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="fixed bottom-2 right-4 z-50 md:hidden bg-primary text-white p-2 rounded-lg shadow-md">
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay hitam saat sidebar dibuka di mobile */}
      <div onClick={() => setIsMobileOpen(false)} className={cn("fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden", isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none")} />

      {/* SIDEBAR */}
      <div
        className={cn(
          "fixed top-0 left-0 h-screen border-r bg-white backdrop-blur-sm transition-all duration-300 z-50 flex flex-col",
          isCollapsed ? "w-16" : "w-[300px]",
          "md:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* === HEADER === */}
        <SidebarHeader className="relative flex items-center justify-between px-3 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <img src={LogoSekolah} alt="logo-sekolah" className="w-5 h-5 object-cover" />
            </div>
            {!isCollapsed && (
              <div className="font-semibold text-sm leading-tight">
                <div>SMA Negeri 43 Jakarta</div>
                <span className="text-xs text-muted-foreground">{user?.role}</span>
              </div>
            )}
          </div>

          {/* Tombol collapse */}
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-primary cursor-pointer p-1 rounded-md transition-colors hidden md:block">
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </SidebarHeader>

        <hr />

        {/* === CONTENT === */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <SidebarGroup>
              {/* Dashboard */}
              <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md", location.pathname.includes("/dashboard") && "bg-primary text-white font-medium")}>
                <Link to="/superadmin/dashboard" className="flex items-center gap-2 py-2 px-3">
                  <Home className="h-4 w-4" />
                  {!isCollapsed && <span>Dashboard</span>}
                </Link>
              </SidebarMenuButton>

              {/* Data Master */}
              {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase text-muted-foreground mt-1">Data Mater</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Manajemen User */}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleDropdown("manajemen-user")} className="hover:bg-primary rounded-md justify-between py-2 px-3">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {!isCollapsed && "Manajemen User"}
                      </span>
                      {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "manajemen-user" && "rotate-180")} />}
                    </SidebarMenuButton>

                    {!isCollapsed && openDropdown === "manajemen-user" && (
                      <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                        {[
                          { to: "/superadmin/manajemen-user/kepsek", label: "Kepsek" },
                          { to: "/superadmin/manajemen-user/guru", label: "Guru" },
                          { to: "/superadmin/manajemen-user/siswa", label: "Siswa" },
                          { to: "/superadmin/manajemen-user/ortu", label: "Orang Tua" },
                          { to: "/superadmin/manajemen-user/tu", label: "Tata Usaha" },
                          { to: "/superadmin/manajemen-user/staff", label: "Staff" },
                        ].map((item) => (
                          <SidebarMenuSubItem key={item.to}>
                            <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes(item.to) && "bg-primary text-white font-medium")}>
                              <Link to={item.to}>{item.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Informasi Sekolah */}
                  <SidebarMenuItem>
                    {/* Tombol utama dropdown */}
                    <SidebarMenuButton onClick={() => toggleDropdown("informasi-sekolah")} className="hover:bg-primary rounded-md justify-between py-2 px-3">
                      <span className="flex items-center gap-2">
                        <School className="h-4 w-4" />
                        {!isCollapsed && "Informasi Sekolah"}
                      </span>
                      {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "informasi-sekolah" && "rotate-180")} />}
                    </SidebarMenuButton>

                    {/* Submenu utama */}
                    {!isCollapsed && openDropdown === "informasi-sekolah" && (
                      <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                        {/* Item biasa */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/identitas-sekolah") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/identitas-sekolah">Data Identitas Sekolah</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/guru") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/kurikulum">Data Kurikulum</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/tahun-akademik") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/tahun-akademik">Data Tahun Akademik</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/guru") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/gedung">Data Gedung</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/ruangan") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/ruangan">Data Ruangan</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* Item nested: Data Kepegawaian */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton onClick={() => toggleSubDropdown("kepegawaian")} className="hover:bg-primary rounded-md px-3 py-1.5 text-sm justify-between w-full">
                            <span>Data Kepegawaian</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", openSubDropdown === "kepegawaian" && "rotate-180")} />
                          </SidebarMenuSubButton>

                          {/* Submenu dalam Data Kepegawaian */}
                          {!isCollapsed && openSubDropdown === "kepegawaian" && (
                            <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/kepegawaian/create") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-sekolah/kepegawaian/create">Tambah Kepegawaian</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/kepegawaian/guru") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-sekolah/kepegawaian/guru">Guru</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/kepegawaian/staff") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-sekolah/kepegawaian/staff">Staff</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/staff") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/">Data Golongan</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/jurusan") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/jurusan">Data Jurusan</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/kelas") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/kelas">Data Kelas</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Data Akademik */}
                  {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase text-muted-foreground mt-1">Data Akademik</SidebarGroupLabel>}

                  <SidebarMenuItem>
                    {/* Tombol dropdown utama */}
                    <SidebarMenuButton onClick={() => toggleDropdown("data-akademik")} className="hover:bg-primary rounded-md justify-between py-2 px-3">
                      <span className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {!isCollapsed && "Informasi Akademik"}
                      </span>

                      {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "data-akademik" && "rotate-180")} />}
                    </SidebarMenuButton>

                    {/* SUBMENU LEVEL 1 */}
                    {!isCollapsed && openDropdown === "data-akademik" && (
                      <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                        {/* SUBMENU NESTED — Data Akademik */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton onClick={() => toggleSubDropdown("akademik")} className="hover:bg-primary rounded-md px-3 py-1.5 text-sm justify-between w-full">
                            <span>Manajemen Akademik</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", openSubDropdown === "akademik" && "rotate-180")} />
                          </SidebarMenuSubButton>

                          {/* SUBMENU LEVEL 2 */}
                          {!isCollapsed && openSubDropdown === "akademik" && (
                            <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                                  <Link to="/superadmin/informasi-akademik/mata-pelajaran">Mata Pelajaran</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                                  <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-guru">Jadwal (Guru)</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                                  <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-siswa">Jadwal (Siswa)</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                                  <Link to="/superadmin/informasi-akademik/kompetensi-dasar">Kompetensi Dasar</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                                  <Link to="/superadmin/informasi-akademik/penilaian">Penilaian</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuSubItem>

                        {/* SUBMENU NESTED — LMS       */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton onClick={() => toggleSubDropdown("lms")} className="hover:bg-primary rounded-md px-3 py-1.5 text-sm justify-between w-full">
                            <span>Data LMS</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", openSubDropdown === "lms" && "rotate-180")} />
                          </SidebarMenuSubButton>

                          {/* SUBMENU LEVEL 2 */}
                          {!isCollapsed && openSubDropdown === "lms" && (
                            <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                                  <Link to="/superadmin/lms/mapel">Data Mapel LMS</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                                  <Link to="/superadmin/lms/tugas">Data Tugas LMS</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                                  <Link to="/superadmin/lms/modul">Data Modul LMS</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuSubItem>

                        {/* SUBMENU BIASA */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                            <Link to="/superadmin/informasi-akademik/siswa">Data Siswa</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                            <Link to="/superadmin/informasi-akademik/ekstrakurikuler">Data Ekstrakurikuler</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className="hover:bg-primary rounded-md px-3 py-1.5 text-sm">
                            <Link to="/superadmin/informasi-akademik/prestasi-siswa">Data Prestasi</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Data Laporan Umum */}
                  {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase text-muted-foreground mt-1">Data Laporan Umum</SidebarGroupLabel>}
                  {/* Data Laporan Umum */}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleDropdown("laporan-umum")} className="hover:bg-primary rounded-md justify-between py-2 px-3">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {!isCollapsed && "Informasi Laporan Umum"}
                      </span>
                      {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "laporan-umum" && "rotate-180")} />}
                    </SidebarMenuButton>

                    {!isCollapsed && openDropdown === "laporan-umum" && (
                      <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                        {[
                          { to: "/superadmin/siswa", label: "Data Absensi" },
                          { to: "/superadmin/guru", label: "Data Berkas Administrasi" },
                          { to: "/superadmin/staff", label: "Data Nilai Raport" },
                          { to: "/superadmin/staff", label: "Laporan Nilai Siswa" },
                          { to: "/superadmin/staff", label: "Data Status Kepegawaian" },
                          { to: "/superadmin/staff", label: "Data keuangan" },
                        ].map((item) => (
                          <SidebarMenuSubItem key={item.to}>
                            <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes(item.to) && "bg-primary text-white font-medium")}>
                              <Link to={item.to}>{item.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Data PSB Online (Penerimaan Siswa Baru) */}
                  {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase text-muted-foreground mt-1">Data PSB Online</SidebarGroupLabel>}
                  {/* Data PSB Online */}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleDropdown("psb-online")} className="hover:bg-primary rounded-md justify-between py-2 px-3">
                      <span className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        {!isCollapsed && "Informasi PSB Online"}
                      </span>
                      {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "psb-online" && "rotate-180")} />}
                    </SidebarMenuButton>

                    {!isCollapsed && openDropdown === "psb-online" && (
                      <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                        {[
                          { to: "/superadmin/siswa", label: "Data Halaman" },
                          { to: "/superadmin/guru", label: "Kode Aktivasi" },
                          { to: "/superadmin/staff", label: "Data Pendaftaran Siswa" },
                          { to: "/superadmin/staff", label: "Laporan Nilai Siswa" },
                          { to: "/superadmin/staff", label: "Data Status Kepegawaian" },
                          { to: "/superadmin/staff", label: "Data keuangan" },
                        ].map((item) => (
                          <SidebarMenuSubItem key={item.to}>
                            <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes(item.to) && "bg-primary text-white font-medium")}>
                              <Link to={item.to}>{item.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Pengaturan */}
                  {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase text-muted-foreground mt-1">Data Pengaturan</SidebarGroupLabel>}
                  {/* Data Pengaturan */}
                  <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => toggleDropdown("pengaturan")} className="hover:bg-primary rounded-md justify-between py-2 px-3">
                      <span className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        {!isCollapsed && "Pengaturan"}
                      </span>
                      {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "pengaturan" && "rotate-180")} />}
                    </SidebarMenuButton>

                    {!isCollapsed && openDropdown === "pengaturan" && (
                      <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                        {[
                          { to: "/superadmin/settings-profile/ubah-profile", label: "Ubah Profile" },
                          { to: "/superadmin/settings-profile/ubah-password", label: "Ubah Password" },
                        ].map((item) => (
                          <SidebarMenuSubItem key={item.to}>
                            <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes(item.to) && "bg-primary text-white font-medium")}>
                              <Link to={item.to}>{item.label}</Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </ScrollArea>
        </div>

        <hr />

        {/* === FOOTER === */}
        <SidebarFooter className="px-3 py-3 shrink-0">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex flex-col text-xs leading-tight">
                <span className="font-medium">{user?.nama || "Pengguna"}</span>
                <span className="text-muted-foreground">{user?.role || "Tidak diketahui"}</span>
              </div>
            )}
            <button
              onClick={async () => {
                const confirm = await Swal.fire({
                  title: "Logout?",
                  text: "Anda yakin ingin keluar dari akun ini?",
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonText: "Ya, Logout",
                  cancelButtonText: "Batal",
                  confirmButtonColor: "#4F46E5",
                });

                if (confirm.isConfirmed) {
                  await logout(navigate);
                  Swal.fire({
                    title: "Berhasil logout!",
                    icon: "success",
                    timer: 1500,
                    showConfirmButton: false,
                  });
                }
              }}
              className="p-2 rounded-md hover:bg-primary/10 transition-colors"
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </SidebarFooter>
      </div>
    </>
  );
}
