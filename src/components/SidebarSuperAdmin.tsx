import { SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Home, Users, School, FileText, GraduationCap, ClipboardList, Settings, ChevronDown, LogOut, PanelLeftClose, PanelLeftOpen, Menu } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoSekolah from "@/assets/logo-sekolah-42.png";
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
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
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
                <div>SMA Negeri 42 Jakarta</div>
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
                    <SidebarMenuButton
                      onClick={() => toggleDropdown("manajemen-user")}
                      className={cn("hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors", location.pathname.includes("/superadmin/manajemen-user") && "bg-primary/10 text-primary")}
                    >
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
                    <SidebarMenuButton
                      onClick={() => toggleDropdown("informasi-sekolah")}
                      className={cn("hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors", location.pathname.includes("/superadmin/informasi-sekolah") && "bg-primary/10 text-primary")}
                    >
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
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/kurikulum") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/kurikulum">Data Kurikulum</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/tahun-akademik") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/tahun-akademik">Data Tahun Akademik</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/semester") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/semester">Data Semester</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/gedung") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/gedung">Data Gedung</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/ruangan") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/ruangan">Data Ruangan</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/kepegawaian") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/kepegawaian">Data Kepegawaian</Link>
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

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/rombel") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/rombel">Data Rombel</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/wali-rombel") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/wali-rombel">Data Wali Rombel</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-sekolah/siswa-rombel") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-sekolah/siswa-rombel">Data Siswa Rombel</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Data Akademik */}
                  {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase text-muted-foreground mt-1">Data Akademik</SidebarGroupLabel>}

                  <SidebarMenuItem>
                    {/* Tombol dropdown utama */}
                    <SidebarMenuButton
                      onClick={() => toggleDropdown("data-akademik")}
                      className={cn("hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors", location.pathname.includes("/superadmin/informasi-akademik") && "bg-primary/10 text-primary")}
                    >
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
                          <SidebarMenuSubButton
                            onClick={() => toggleSubDropdown("akademik")}
                            className={cn("hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors", location.pathname.includes("/superadmin/informasi-akademik") && "bg-primary/10 text-primary")}
                          >
                            <span>Manajemen Akademik</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", openSubDropdown === "akademik" && "rotate-180")} />
                          </SidebarMenuSubButton>

                          {/* SUBMENU LEVEL 2 */}
                          {!isCollapsed && openSubDropdown === "akademik" && (
                            <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/mata-pelajaran") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-akademik/mata-pelajaran">Mata Pelajaran</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/kurikulum-mata-pelajaran") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-akademik/kurikulum-mata-pelajaran">Kurmapel</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/jadwal-pelajaran-guru") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-guru">Jadwal (Guru)</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/jadwal-pelajaran-siswa") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-akademik/jadwal-pelajaran-siswa">Jadwal (Siswa)</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/kompetensi") && "bg-primary text-white font-medium")}>
                                  <Link to="/superadmin/informasi-akademik/kompetensi">Kompetensi</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/penilaian") && "bg-primary text-white font-medium")}>
                                  <Link to="/superadmin/informasi-akademik/penilaian">Penilaian</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/alur-tujuan-pembelajaran-master") && "bg-primary text-white font-medium")}
                          >
                            <Link to="/superadmin/informasi-akademik/alur-tujuan-pembelajaran-master">ATP Master</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/alur-tujuan-pembelajaran") && "bg-primary text-white font-medium")}
                          >
                            <Link to="/superadmin/informasi-akademik/alur-tujuan-pembelajaran">Alur Tujuan Pembelajaran</Link>
                          </SidebarMenuSubButton>
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
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/siswa") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-akademik/siswa">Data Siswa</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        {/* SUBMENU NESTED */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => toggleSubDropdown("ekstrakurikuler")}
                            className={cn(
                              "hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors",
                              location.pathname.includes("/superadmin/informasi-akademik/ekstrakurikuler") && "bg-primary/10 text-primary",
                            )}
                          >
                            <span>Data Ekstrakurikuler</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", openSubDropdown === "ekstrakurikuler" && "rotate-180")} />
                          </SidebarMenuSubButton>

                          {/* SUBMENU LEVEL 2 */}
                          {!isCollapsed && openSubDropdown === "ekstrakurikuler" && (
                            <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/ekstrakurikuler") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-akademik/ekstrakurikuler">Ekstrakurikuler</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/pembina-ekskul") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-akademik/pembina-ekskul">Pembina - Ekskul</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/pelatih-ekskul") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-akademik/pelatih-ekskul">Pelatih - Ekskul</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/siswa-ekskul") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-akademik/siswa-ekskul">Siswa - Ekskul</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuSubItem>

                        {/* <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/ekstrakurikuler") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-akademik/ekstrakurikuler">Data Ekstrakurikuler</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem> */}

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-akademik/prestasi-siswa") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-akademik/prestasi-siswa">Data Prestasi</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Data Laporan Umum */}
                  {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase text-muted-foreground mt-1">Data Laporan Umum</SidebarGroupLabel>}
                  {/* Tombol dropdown utama */}
                  <SidebarMenuButton
                    onClick={() => toggleDropdown("laporan-umum")}
                    className={cn("hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors", location.pathname.includes("/superadmin/informasi-laporan-umum") && "bg-primary/10 text-primary")}
                  >
                    <span className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {!isCollapsed && "Informasi Laporan Umum"}
                    </span>

                    {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "laporan-umum" && "rotate-180")} />}
                  </SidebarMenuButton>

                  {/* Data Laporan Umum */}
                  <SidebarMenuItem>
                    {/* SUBMENU LEVEL 1 */}
                    {!isCollapsed && openDropdown === "laporan-umum" && (
                      <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                        {/* SUBMENU NESTED */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            onClick={() => toggleSubDropdown("absensi")}
                            className={cn("hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors", location.pathname.includes("/superadmin/informasi-laporan-umum") && "bg-primary/10 text-primary")}
                          >
                            <span>Data Absensi</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", openSubDropdown === "absensi" && "rotate-180")} />
                          </SidebarMenuSubButton>

                          {/* SUBMENU LEVEL 2 */}
                          {!isCollapsed && openSubDropdown === "absensi" && (
                            <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-laporan-umum/absensi-pegawai") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-laporan-umum/absensi-pegawai">Pegawai</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-laporan-umum/absensi-pelajaran") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-laporan-umum/absensi-pelajaran">Pelajaran</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>

                              <SidebarMenuSubItem>
                                <SidebarMenuSubButton
                                  asChild
                                  className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-laporan-umum/absensi-siswa") && "bg-primary text-white font-medium")}
                                >
                                  <Link to="/superadmin/informasi-laporan-umum/absensi-siswa">Siswa</Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuSubItem>

                        {/* SUBMENU BIASA */}
                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-laporan-umum/berkas-administrasi") && "bg-primary text-white font-medium")}
                          >
                            <Link to="/superadmin/informasi-laporan-umum/berkas-administrasi">Data Berkas Administrasi</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton asChild className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-laporan-umum/nilai-raport") && "bg-primary text-white font-medium")}>
                            <Link to="/superadmin/informasi-laporan-umum/nilai-raport">Data Nilai Raport</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-laporan-umum/laporan-nilai-siswa") && "bg-primary text-white font-medium")}
                          >
                            <Link to="/superadmin/informasi-laporan-umum/laporan-nilai-siswa">Laporan Nilai Siswa</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-laporan-umum/status-kepegawaian") && "bg-primary text-white font-medium")}
                          >
                            <Link to="/superadmin/informasi-laporan-umum/status-kepegawaian">Data Status Kepegawaian</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>

                        <SidebarMenuSubItem>
                          <SidebarMenuSubButton
                            asChild
                            className={cn("hover:bg-primary rounded-md px-3 py-1.5 text-sm", location.pathname.includes("/superadmin/informasi-laporan-umum/data-keuangan") && "bg-primary text-white font-medium")}
                          >
                            <Link to="/superadmin/informasi-laporan-umum/data-keuangan">Data keuangan</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    )}
                  </SidebarMenuItem>

                  {/* Data PSB Online (Penerimaan Siswa Baru) */}
                  {!isCollapsed && <SidebarGroupLabel className="text-xs uppercase text-muted-foreground mt-1">Data PSB Online</SidebarGroupLabel>}
                  {/* Data PSB Online */}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      onClick={() => toggleDropdown("psb-online")}
                      className={cn("hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors", location.pathname.includes("/superadmin/psb") && "bg-primary/10 text-primary")}
                    >
                      <span className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        {!isCollapsed && "Informasi PSB Online"}
                      </span>
                      {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "psb-online" && "rotate-180")} />}
                    </SidebarMenuButton>

                    {!isCollapsed && openDropdown === "psb-online" && (
                      <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                        {[
                          // { to: "/superadmin/siswa", label: "Data Halaman" },
                          // { to: "/superadmin/guru", label: "Kode Aktivasi" },
                          { to: "/superadmin/psb", label: "Data Pendaftaran Siswa" },
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
                    <SidebarMenuButton
                      onClick={() => toggleDropdown("pengaturan")}
                      className={cn("hover:bg-primary/10 hover:text-primary rounded-md justify-between py-2 px-3 transition-colors", location.pathname.includes("/superadmin/settings-profile") && "bg-primary/10 text-primary")}
                    >
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
