import { useState } from "react";
import PageTitle from "@/components/PageTitle";
import { SidebarSiswa } from "@/components/SidebarSiswa";
import { SidebarProvider } from "@/components/ui/sidebar";

export const DashboardSiswa = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarProvider>
      <SidebarSiswa isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Main Content */}
      <main className="w-full transition-all duration-300 bg-background">
        <PageTitle title="Dashboard Siswa" />

        {/* konten */}
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold mb-4">Dashboard Siswa</h1>
          <p className="text-muted-foreground mb-6">Deskripsi singkat tentang sekolah, jumlah siswa, dan statistik lainnya...</p>

          {/* contoh card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="text-lg font-semibold">Jumlah Siswa</h3>
              <p className="text-3xl font-bold mt-2 text-primary">850</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="text-lg font-semibold">Jumlah Guru</h3>
              <p className="text-3xl font-bold mt-2 text-primary">56</p>
            </div>
            <div className="bg-white rounded-2xl shadow p-5">
              <h3 className="text-lg font-semibold">Jumlah Staff</h3>
              <p className="text-3xl font-bold mt-2 text-primary">24</p>
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
};
