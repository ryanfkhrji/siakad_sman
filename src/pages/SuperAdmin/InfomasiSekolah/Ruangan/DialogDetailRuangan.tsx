import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2, DoorOpen, Building2, Layers, Users, Square, Grid3x3, AlertCircle, Info, Sparkles } from "lucide-react";
import type { Ruangan } from "@/types/ruangan";
import api from "@/api/axios";

interface DialogDetailRuanganProps {
  ruanganId: number;
}

export function DialogDetailRuangan({ ruanganId }: DialogDetailRuanganProps) {
  const [ruangan, setRuangan] = useState<Ruangan | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/spa/ruangan/${ruanganId}`);
      const result = res.data;
      setRuangan(result.data);
    } catch (error) {
      console.error("Gagal memuat data ruangan:", error);
    } finally {
      setLoading(false);
    }
  };

  const getKondisiBadge = (kondisi: string) => {
    let color = "";

    if (kondisi === "Baik") color = "bg-green-100 text-green-700 border-green-300";
    else if (kondisi === "Rusak Ringan") color = "bg-yellow-100 text-yellow-700 border-yellow-300";
    else if (kondisi === "Rusak Berat") color = "bg-red-100 text-red-700 border-red-300";
    else color = "bg-blue-100 text-blue-600 border-blue-300";

    return color;
  };

  return (
    <Dialog onOpenChange={(open) => open && handleOpen()}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-purple-600" />
            Detail Ruangan
          </DialogTitle>
          <DialogDescription>Informasi lengkap mengenai ruangan yang dipilih.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground">
            <Loader2 className="animate-spin mr-2 w-6 h-6" />
            <span className="text-lg">Memuat data...</span>
          </div>
        ) : ruangan ? (
          <div className="space-y-6 py-4">
            {/* Header Card with Room Name */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-2">
                    <DoorOpen className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{ruangan.nama_ruangan}</h3>
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Badge variant="outline" className="bg-white">
                      <Building2 className="w-3 h-3 mr-1" />
                      {ruangan.nama_gedung}
                    </Badge>
                    <Badge variant="outline" className="bg-white">
                      <Grid3x3 className="w-3 h-3 mr-1" />
                      {ruangan.kode_ruangan}
                    </Badge>
                    <Badge variant="outline" className={getKondisiBadge(ruangan.kondisi)}>
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {ruangan.kondisi}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Jenis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-gray-900">{ruangan.jenis_ruangan}</p>
                </CardContent>
              </Card>

              <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Lantai
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-gray-900">Lantai {ruangan.lantai}</p>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Kapasitas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-gray-900">{ruangan.kapasitas} Orang</p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                    <Square className="w-3.5 h-3.5" />
                    Luas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-gray-900">{ruangan.luas_ruangan}</p>
                </CardContent>
              </Card>
            </div>

            {/* Facilities Section */}
            {ruangan.fasilitas && (
              <Card className="border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    Fasilitas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="bg-white border border-blue-100 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{ruangan.fasilitas}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes Section */}
            {ruangan.keterangan && (
              <Card className="border-gray-200">
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="w-5 h-5 text-gray-600" />
                    Keterangan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{ruangan.keterangan}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <DoorOpen className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg italic">Data tidak tersedia.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}