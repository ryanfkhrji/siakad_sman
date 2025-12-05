import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home, Phone, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface RegistrationData {
  nama_siswa: string;
  nisn: string;
}

const PsbSuccess = () => {
  const location = useLocation();

  const submittedData = location.state?.data as RegistrationData;

  // Data dari pendaftaran (sesuaikan dengan data yang dikirim dari form)
  const defaultRegistrationData: RegistrationData = {
    nama_siswa: "TIDAK ADA DATA (Error Akses)",
    nisn: "0000000000",
  };

  const registrationData = submittedData || defaultRegistrationData;

  return (
    <>
      {/* Halaman Normal (tidak dicetak) */}
      <div className="print:hidden mx-auto max-w-7xl w-full px-4 md:px-0">
        <div className="min-h-[70vh] flex items-center justify-center py-8">
          <Card className="w-full max-w-7xl">
            <CardHeader className="text-center space-y-4 pb-8">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping bg-green-400 rounded-full opacity-20"></div>
                  <div className="relative bg-green-100 p-6 rounded-full">
                    <CheckCircle2 className="w-20 h-20 text-green-600" />
                  </div>
                </div>
              </div>

              <CardTitle className="text-3xl font-bold text-green-600">Selamat!</CardTitle>
              <CardDescription className="text-lg">Pendaftaran Anda telah berhasil dikirim</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Informasi Pendaftaran */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-blue-900 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informasi Pendaftaran
                </h3>

                <div className="space-y-3 text-sm">
                  <p className="text-gray-700">Terima kasih telah mendaftar sebagai calon siswa baru. Data dan berkas Anda telah kami terima dengan baik.</p>

                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-gray-600">Nama Lengkap:</p>
                    <p className="font-semibold text-gray-900">{registrationData.nama_siswa}</p>
                  </div>

                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-gray-600">NISN:</p>
                    <p className="font-semibold text-gray-900">{registrationData.nisn}</p>
                  </div>
                </div>
              </div>

              {/* Langkah Selanjutnya */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-amber-900">Langkah Selanjutnya</h3>

                <ol className="space-y-3 text-sm text-gray-700">
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                    <span>Screenshot halaman ini untuk menjadi bukti pendaftaran</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                    <span>Tim kami akan melakukan verifikasi data dan berkas yang Anda kirimkan</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                    <span>Anda akan dihubungi melalui nomor telepon yang terdaftar</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                    <span>Jika lolos verifikasi, Anda akan mendapatkan jadwal untuk tes seleksi</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                    <span>Pengumuman hasil seleksi akan diinformasikan melalui website dan kontak yang terdaftar</span>
                  </li>
                </ol>
              </div>

              {/* Kontak Informasi */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Butuh Bantuan?</h3>

                <div className="space-y-3 text-sm">
                  <p className="text-gray-700">Jika ada pertanyaan atau kendala, silakan hubungi kami:</p>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span>(021) 8765-4321</span>
                    </div>
                    {/* <div className="flex items-center gap-3 text-gray-700">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>psb@sma42jakarta.sch.id</span>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link to={"/public-psb"} className="w-full">
                  <Button type="button" className="w-full">
                    <Home size={18} />
                    Kembali ke Beranda
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default PsbSuccess;
