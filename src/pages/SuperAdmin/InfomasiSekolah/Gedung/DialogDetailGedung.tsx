import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2, Building2, Layers, Ruler, Calendar, AlertCircle, Info, DoorOpen, Users, Square } from "lucide-react";
import type { GedungDetail } from "@/types/gedung";
import api from "@/api/axios";

interface DialogDetailGedungProps {
  gedungId: number;
}

export function DialogDetailGedung({ gedungId }: DialogDetailGedungProps) {
  const [gedung, setGedung] = useState<GedungDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/spa/gedung/${gedungId}`);
      const result = res.data;
      setGedung(result.data);
    } catch (error) {
      console.error("Gagal memuat data gedung:", error);
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

      <DialogContent className="sm:max-w-[900px] lg:max-w-[1000px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Detail Gedung
          </DialogTitle>
          <DialogDescription>Informasi lengkap mengenai gedung dan ruangan yang tersedia.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-16 text-muted-foreground">
            <Loader2 className="animate-spin mr-2 w-6 h-6" />
            <span className="text-lg">Memuat data...</span>
          </div>
        ) : gedung ? (
          <div className="space-y-6 py-4">
            {/* Header Section with Image and Key Info */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Foto Gedung */}
              <div className="md:col-span-1">
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 shadow-lg bg-gray-50">
                  <img
                    src={
                      gedung.foto_gedung ||
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E'
                    }
                    alt={gedung.nama_gedung}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.onerror = null;
                      target.src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23e5e7eb" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="20"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              </div>

              {/* Info Cards */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4">
                <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      Kode Gedung
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">{gedung.kode_gedung}</p>
                  </CardContent>
                </Card>

                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Jumlah Lantai
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">{gedung.jumlah_lantai} Lantai</p>
                  </CardContent>
                </Card>

                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Ruler className="w-4 h-4" />
                      Luas Bangunan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">{gedung.luas_bangunan}</p>
                  </CardContent>
                </Card>

                <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Tahun Dibangun
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">{gedung.tahun_dibangun}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Building Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  Informasi Gedung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Nama Gedung</p>
                    <p className="text-lg font-semibold text-gray-900">{gedung.nama_gedung}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Kondisi</p>
                    <Badge className={`${getKondisiBadge(gedung.kondisi)} border px-3 py-1 text-sm font-semibold`}>
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {gedung.kondisi}
                    </Badge>
                  </div>
                </div>

                {gedung.keterangan && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Keterangan</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{gedung.keterangan}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rooms Section */}
            {gedung.ruangan && gedung.ruangan.length > 0 && (
              <Card className="border-2 border-blue-100">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DoorOpen className="w-5 h-5 text-blue-600" />
                    Daftar Ruangan ({gedung.ruangan.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    {gedung.ruangan.map((ruangan) => (
                      <Card key={ruangan.id} className="border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-bold text-gray-900 text-lg">{ruangan.nama_ruangan}</h4>
                              <p className="text-sm text-gray-500">Kode: {ruangan.kode_ruangan}</p>
                            </div>
                            <Badge className={`${getKondisiBadge(ruangan.kondisi)} border`}>{ruangan.kondisi}</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Building2 className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Jenis</p>
                                <p className="font-semibold text-gray-900">{ruangan.jenis_ruangan}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                <Layers className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Lantai</p>
                                <p className="font-semibold text-gray-900">{ruangan.lantai}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                                <Users className="w-4 h-4 text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Kapasitas</p>
                                <p className="font-semibold text-gray-900">{ruangan.kapasitas}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                                <Square className="w-4 h-4 text-orange-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Luas</p>
                                <p className="font-semibold text-gray-900">{ruangan.luas_ruangan}</p>
                              </div>
                            </div>
                          </div>

                          {ruangan.fasilitas && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-600 mb-1">Fasilitas</p>
                              <p className="text-sm text-gray-700">{ruangan.fasilitas}</p>
                            </div>
                          )}

                          {ruangan.keterangan && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <p className="text-xs font-medium text-gray-600 mb-1">Keterangan</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{ruangan.keterangan}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Building2 className="w-16 h-16 mb-4 opacity-50" />
            <p className="text-lg italic">Data tidak tersedia.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
