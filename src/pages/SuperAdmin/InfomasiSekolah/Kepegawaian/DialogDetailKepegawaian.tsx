import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2, GraduationCap, Trophy, Calendar, BookOpen } from "lucide-react";
import type { KepegawaianDetail } from "@/types/kepegawaian";
import api from "@/api/axios";

interface DialogDetailKepegawaianProps {
  kepegawaianId: number;
}

export function DialogDetailKepegawaian({ kepegawaianId }: DialogDetailKepegawaianProps) {
  const [detail, setDetail] = useState<KepegawaianDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && !detail) {
      fetchDetail();
    }
  }, [open]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/spa/kepegawaian/${kepegawaianId}`);
      if (res.data.status === "success") {
        setDetail(res.data.data);
      }
    } catch (error) {
      console.error("Gagal mengambil detail:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye size={16} />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[950px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            <GraduationCap className="w-6 h-6" />
            Detail Kepegawaian
          </DialogTitle>
          <DialogDescription>Informasi lengkap mengenai data kepegawaian dan historinya.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="animate-spin mb-3 text-primary" size={32} />
            <p className="text-sm text-gray-500">Memuat data...</p>
          </div>
        ) : detail ? (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Info Dasar</TabsTrigger>
              <TabsTrigger value="rombel">Wali Rombel</TabsTrigger>
              <TabsTrigger value="ekskul">Ekskul</TabsTrigger>
              <TabsTrigger value="jadwal">Jadwal</TabsTrigger>
            </TabsList>

            {/* TAB 1: Info Dasar */}
            <TabsContent value="info" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">NIP</span>
                      <span className="text-gray-900">{detail.nip ?? "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-700">NUPTK</span>
                      <span className="text-gray-900">{detail.nuptk ?? "-"}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">Nama Lengkap</span>
                    <span className="text-gray-900">{detail.nama}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">Email</span>
                    <span className="text-gray-900">{detail.email ?? "-"}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">Role</span>
                    <Badge variant="outline" className="capitalize">
                      {detail.role.replace("_", " ")}
                    </Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">Status</span>
                    <Badge className={detail.status === "aktif" ? "bg-green-100 text-green-700 border-green-300" : "bg-red-100 text-red-700 border-red-300"}>{detail.status}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold text-gray-700">Keterangan</span>
                    <span className="text-gray-900">{detail.keterangan ?? "-"}</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2: Histori Wali Rombel */}
            <TabsContent value="rombel" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Histori Wali Rombel
                  </CardTitle>
                  <CardDescription>Riwayat menjadi wali kelas di berbagai tahun akademik</CardDescription>
                </CardHeader>
                <CardContent>
                  {detail.histori_wali_rombel && detail.histori_wali_rombel.length > 0 ? (
                    <div className="space-y-3">
                      {detail.histori_wali_rombel.map((item, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold text-primary">{item.nama_rombel}</p>
                              <p className="text-sm text-gray-600">
                                {item.nama_kelas} - Tingkat {item.tingkat_kelas}
                              </p>
                              {item.jurusan_kelas && <p className="text-sm text-gray-600">{item.jurusan_kelas}</p>}
                            </div>
                            <Badge variant="outline">{item.tahun_akademik_rombel}</Badge>
                          </div>
                          <Badge className={item.status_tahun_akademik_rombel === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{item.status_tahun_akademik_rombel}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-6">Tidak ada histori wali rombel</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 3: Histori Ekskul */}
            <TabsContent value="ekskul" className="space-y-4">
              {/* Pelatih */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Histori Pelatih Ekstrakurikuler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detail.histori_pelatih_ekskul && detail.histori_pelatih_ekskul.length > 0 ? (
                    <div className="space-y-3">
                      {detail.histori_pelatih_ekskul.map((item, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-primary">{item.nama_ekskul}</p>
                              <p className="text-sm text-gray-600">{item.tahun_akademik_melatih}</p>
                            </div>
                            <Badge className={item.status_tahun_akademik_melatih === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{item.status_tahun_akademik_melatih}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-6">Tidak ada histori pelatih ekskul</p>
                  )}
                </CardContent>
              </Card>

              {/* Pembina */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Histori Pembina Ekstrakurikuler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {detail.histori_pembina_ekstrakurikuler && detail.histori_pembina_ekstrakurikuler.length > 0 ? (
                    <div className="space-y-3">
                      {detail.histori_pembina_ekstrakurikuler.map((item, idx) => (
                        <div key={idx} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-primary">{item.nama_ekstrakurikuler}</p>
                              <p className="text-sm text-gray-600">{item.tahun_akademik_membina}</p>
                            </div>
                            <Badge className={item.status_tahun_akademik_membina === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{item.status_tahun_akademik_membina}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-6">Tidak ada histori pembina ekskul</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 4: Histori Jadwal Pelajaran */}
            <TabsContent value="jadwal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Histori Jadwal Pelajaran
                  </CardTitle>
                  <CardDescription>Riwayat mengajar di berbagai tahun akademik dan semester</CardDescription>
                </CardHeader>
                <CardContent>
                  {detail.histori_jadwal_pelajaran && detail.histori_jadwal_pelajaran.length > 0 ? (
                    <div className="space-y-4">
                      {detail.histori_jadwal_pelajaran.map((tahun, tIdx) => (
                        <div key={tIdx} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-primary" />
                              <span className="font-semibold">{tahun.tahun_akademik}</span>
                            </div>
                            <Badge className={tahun.status_tahun_akademik === "aktif" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>{tahun.status_tahun_akademik}</Badge>
                          </div>

                          {tahun.semester.map((sem, sIdx) => (
                            <div key={sIdx} className="mt-3 bg-white rounded-lg p-3">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium text-sm">Semester {sem.semester}</span>
                                <Badge variant="outline" className="text-xs">
                                  {sem.status_semester}
                                </Badge>
                              </div>

                              <div className="space-y-2">
                                {sem.jadwal.map((jdw, jIdx) => (
                                  <div key={jIdx} className="border-l-4 border-primary pl-3 py-2 text-sm">
                                    <p className="font-semibold text-primary">{jdw.mata_pelajaran.nama_pelajaran}</p>
                                    <p className="text-gray-600">
                                      {jdw.hari} • {jdw.jam_mulai} - {jdw.jam_selesai}
                                    </p>
                                    <p className="text-gray-600">
                                      Rombel: {jdw.rombel?.nama_rombel ?? "-"} • Ruangan: {jdw.ruangan ? `${jdw.ruangan.kode_ruangan} - ${jdw.ruangan.nama_ruangan}` : "-"}
                                    </p>

                                    {(jdw.mata_pelajaran?.jurusan_pelajaran || jdw.mata_pelajaran?.tingkat_pelajaran || jdw.mata_pelajaran?.kkm) && (
                                      <p className="text-gray-600 text-xs">
                                        {jdw.mata_pelajaran.jurusan_pelajaran ?? "-"} • Tingkat {jdw.mata_pelajaran.tingkat_pelajaran ?? "-"} • KKM: {jdw.mata_pelajaran.kkm ?? "-"}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-6">Tidak ada histori jadwal pelajaran</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-center text-gray-500 py-8">Data tidak ditemukan</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
