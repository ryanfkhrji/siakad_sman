import { SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";
import { Home, GraduationCap, ClipboardList, Settings, LogOut, PanelLeftClose, PanelLeftOpen, Menu, Users, CalendarDays, BookOpen, DoorOpen, ClipboardCheck, IdCard, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoSekolah from "@/assets/logo-sekolah.jpg";
import { useAuthStore } from "@/store/authStore";
import Swal from "sweetalert2";

export function SidebarGuru({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // const [openSubDropdown, setOpenSubDropdown] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  // const toggleSubDropdown = (menu: string) => {
  //   setOpenSubDropdown(openSubDropdown === menu ? null : menu);
  // };

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
          isCollapsed ? "w-16" : "w-[280px]",
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
                <div>SMA Negeri Jakarta</div>
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
              <SidebarGroupContent>
                <SidebarMenu>
                  {/* Dashboard */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/superadmin/settings" className="flex items-center gap-2">
                        <Home className="h-4 w-4" />
                        {!isCollapsed && <span>Dashboard</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Data Siswa */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/superadmin/settings" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {!isCollapsed && <span>Data Siswa</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Data Jadwal Pelajaran */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/superadmin/settings" className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {!isCollapsed && <span>Data Jadwal Pelajaran</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Data Nilai */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/superadmin/settings" className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {!isCollapsed && <span>Data Nilai</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Data Kelas */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/guru/kelas/detail-kelas") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/guru/kelas/detail-kelas" className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4" />
                        {!isCollapsed && <span>Data Kelas</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Data Akademik */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/superadmin/settings" className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4" />
                        {!isCollapsed && <span>Data Akademik</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Data Absensi */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/superadmin/settings" className="flex items-center gap-2">
                        <ClipboardCheck className="h-4 w-4" />
                        {!isCollapsed && <span>Data Absensi</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Data Kebutuhan Siswa */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/superadmin/settings" className="flex items-center gap-2">
                        <ClipboardList className="h-4 w-4" />
                        {!isCollapsed && <span>Data Kebutuhan Siswa</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Data Status Kepegawaian */}
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                      <Link to="/superadmin/settings" className="flex items-center gap-2">
                        <IdCard className="h-4 w-4" />
                        {!isCollapsed && <span>Data Status Kepegawaian</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

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
                          { to: "/guru/settings-profile/ubah-profile", label: "Ubah Profile" },
                          { to: "/guru/settings-profile/ubah-password", label: "Ubah Password" },
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
