import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageTitle from "@/components/PageTitle";
import { SidebarSuperAdmin } from "@/components/SidebarSuperAdmin";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Loader2Icon } from "lucide-react";
import Footer from "@/pages/Footer";
import Swal from "sweetalert2";
import { keuanganService } from "@/services/keuanganService";
import { Card, CardContent } from "@/components/ui/card";
import type { Keuangan } from "@/types/keuangan";

const DetailKeuangan = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Keuangan | null>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await keuanganService.getDetail(Number(id));

      if (response.status === "success") {
        setData(response.data);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal memuat data!",
        text: error.response?.data?.message || "Tidak dapat memuat detail data keuangan.",
      });
      navigate("/superadmin/informasi-laporan-umum/data-keuangan");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/superadmin/informasi-laporan-umum/data-keuangan");
  };

  const formatRupiah = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <SidebarProvider>
        <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
          <div className="flex flex-col items-center justify-center h-64 text-gray-600">
            <Loader2Icon className="animate-spin mb-2" size={28} />
            <p className="text-lg font-medium">Memuat data...</p>
          </div>
        </main>
      </SidebarProvider>
    );
  }

  if (!data) {
    return null;
  }

  const saldo = parseFloat(data.debit) - parseFloat(data.kredit);

  return (
    <SidebarProvider>
      <SidebarSuperAdmin isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      <main className={`w-full min-h-screen bg-background transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-[300px]"}`}>
        <PageTitle title="Detail Data Keuangan" />
        <div className="mx-auto p-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center gap-3">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeftIcon size={18} />
              Kembali
            </Button>
            <h1 className="text-3xl font-bold">Detail Data Keuangan</h1>
          </div>

          <Card>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ID</p>
                  <p className="text-lg font-semibold">{data.id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Nama Akun</p>
                  <p className="text-lg font-semibold">{data.nama_akun}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Debit</p>
                  <p className="text-lg font-semibold text-green-600">{formatRupiah(data.debit)}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Kredit</p>
                  <p className="text-lg font-semibold text-red-600">{formatRupiah(data.kredit)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-1">Saldo</p>
                <p className={`text-2xl font-bold ${saldo >= 0 ? "text-blue-600" : "text-red-600"}`}>{formatRupiah(saldo)}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Keterangan</p>
                <p className="text-base whitespace-pre-wrap">{data.keterangan || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Footer />
      </main>
    </SidebarProvider>
  );
};

export default DetailKeuangan;
