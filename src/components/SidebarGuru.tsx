import { SidebarHeader, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Home, Users, CalendarDays, GraduationCap, DoorOpen, BookOpen, ClipboardCheck, ClipboardList, IdCard, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoSekolah from "@/assets/logo-sekolah.jpg";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export function SidebarGuru({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean; setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>> }) {
  const location = useLocation();

  const navigate = useNavigate();
  const { logout, user } = useAuthStore();

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
                  <SidebarMenuButton asChild className={cn("hover:bg-primary rounded-md py-2 px-3", location.pathname.includes("/settings") && "bg-primary/10 text-primary font-medium")}>
                    <Link to="/superadmin/settings" className="flex items-center gap-2">
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
