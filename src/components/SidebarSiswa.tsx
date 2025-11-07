import { SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSubButton, SidebarMenuSubItem, SidebarMenuSub } from "@/components/ui/sidebar";
import {
  Home, // Dashboard
  GraduationCap, // Data Akademik
  ClipboardList, // Data Kebutuhan Siswa
  CalendarCheck, // Data Absensi
  FileBarChart, // E-rapot
  Settings, // Pengaturan
  LogOut, // Logout (opsional)
  ChevronDown, // Dropdown Icon
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoSekolah from "@/assets/logo-sekolah.jpg";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useState } from "react";

export function SidebarSiswa({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();

  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className={cn("flex flex-col h-screen border-r bg-white backdrop-blur-sm transition-all duration-300 z-50", isCollapsed ? "w-16" : "w-90")}>
      {/* === HEADER (Tetap di Atas) === */}
      <SidebarHeader className="relative flex items-center justify-between px-3 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <img src={LogoSekolah} alt="logo-sekolah" className="w-5 h-5 object-cover bg-no-repeat" />
          </div>
          {!isCollapsed && (
            <div className="font-semibold text-sm leading-tight">
              <div>SMA Negeri Jakarta</div>
              <span className="text-xs text-muted-foreground">{user?.role}</span>
            </div>
          )}
        </div>

        {/* Tombol toggle sidebar */}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="text-primary cursor-pointer p-1 ounded-md transition-colors absolute top-5 -right-3">
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </SidebarHeader>

      <hr />

      {/* === CONTENT (Scrollable) === */}
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

                {/* Data Akademik */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                    <Link to="/superadmin/settings" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      {!isCollapsed && <span>Data Akademik</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Data Kebutuhan Siswa */}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={() => toggleDropdown("kebutuhan-siswa")} className="hover:bg-primary rounded-md justify-between py-2 px-3">
                    <span className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4" />
                      {!isCollapsed && "Data Kebutuhan Siswa"}
                    </span>
                    {!isCollapsed && <ChevronDown className={cn("h-4 w-4 transition-transform", openDropdown === "kebutuhan-siswa" && "rotate-180")} />}
                  </SidebarMenuButton>

                  {!isCollapsed && openDropdown === "kebutuhan-siswa" && (
                    <SidebarMenuSub className="ml-4 mt-1 space-y-1">
                      {[
                        { to: "/superadmin/siswa", label: "Tugas / Quiz" },
                        { to: "/superadmin/users/guru", label: "Forum Diskusi" },
                        { to: "/superadmin/users/guru", label: "Jurnal KBM" },
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

                {/* Data Absensi */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                    <Link to="/superadmin/settings" className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4" />
                      {!isCollapsed && <span>Data Absensi</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* e-rapot */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                    <Link to="/superadmin/settings" className="flex items-center gap-2">
                      <FileBarChart className="h-4 w-4" />
                      {!isCollapsed && <span>E-Rapot</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Pengaturan */}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                    <Link to="/superadmin/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      {!isCollapsed && <span>Pengaturan</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </div>

      <hr />

      {/* === FOOTER (Tetap di Bawah) === */}
      <SidebarFooter className="px-3 py-3 shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex flex-col text-xs leading-tight">
              <span className="font-medium">{user?.name || "Pengguna"}</span>
              <span className="text-muted-foreground">{user?.role || "Tidak diketahui"}</span>
            </div>
          )}

          {/* Tombol Logout */}
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
                // navigate("/login-kepegawaian", { replace: true });
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
  );
}
