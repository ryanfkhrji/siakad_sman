import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Info, Loader2, HomeIcon } from "lucide-react";

// Hook untuk cek status PSB dari localStorage
export const usePsbStatus = () => {
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      try {
        // Ambil dari localStorage
        const storedStatus = localStorage.getItem("psb_registration_active");
        if (storedStatus !== null) {
          setIsActive(storedStatus === "true");
        }
      } catch (error) {
        console.log("Status not found, defaulting to active");
        setIsActive(true);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  return { isActive, loading };
};

// Komponen Toggle untuk Admin
export const PsbStatusToggle = () => {
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch status saat komponen mount dari localStorage
  useEffect(() => {
    const fetchStatus = () => {
      try {
        const storedStatus = localStorage.getItem("psb_registration_active");
        if (storedStatus !== null) {
          setIsActive(storedStatus === "true");
        }
      } catch (error) {
        console.log("Status not found, using default (active)");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchStatus();
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const newStatus = !isActive;

      // Simpan ke localStorage
      localStorage.setItem("psb_registration_active", String(newStatus));
      setIsActive(newStatus);

      // Trigger event untuk update komponen lain di tab yang sama
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "psb_registration_active",
          newValue: String(newStatus),
          url: window.location.href,
        })
      );

      // Tampilkan notifikasi sukses
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        icon: newStatus ? "success" : "warning",
        title: newStatus ? "Pendaftaran Diaktifkan" : "Pendaftaran Dinonaktifkan",
        text: newStatus ? "Form pendaftaran publik sekarang dapat diakses" : "Form pendaftaran publik sekarang tidak dapat diakses",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (error: any) {
      console.error("Error updating status:", error);
      const Swal = (await import("sweetalert2")).default;
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengubah status. Silakan coba lagi.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Listen untuk perubahan dari tab/window lain
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "psb_registration_active" && e.newValue !== null) {
        setIsActive(e.newValue === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (initialLoading) {
    return (
      <Card className="border-2">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary mr-2" />
          <span className="text-gray-600">Memuat status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          Status Pendaftaran PSB
        </CardTitle>
        <CardDescription>Kontrol apakah form pendaftaran publik dapat diakses</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={isActive ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"}>
          <AlertDescription className="flex items-center gap-2">
            {isActive ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-700">Form pendaftaran saat ini AKTIF dan dapat diakses publik</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-semibold text-red-700">Form pendaftaran saat ini TIDAK AKTIF dan tidak dapat diakses publik</span>
              </>
            )}
          </AlertDescription>
        </Alert>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <Label className="text-base font-semibold">Status Pendaftaran</Label>
            <p className="text-sm text-gray-600 mt-1">{isActive ? "Aktif - Publik dapat mendaftar" : "Nonaktif - Publik tidak dapat mendaftar"}</p>
          </div>

          <Button onClick={handleToggle} disabled={loading} variant={isActive ? "destructive" : "default"} size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : isActive ? (
              <>
                <XCircle size={18} />
                Nonaktifkan
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Aktifkan
              </>
            )}
          </Button>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>
            💡 <strong>Catatan:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Saat dinonaktifkan, form publik akan menampilkan pesan bahwa pendaftaran ditutup</li>
            <li>Data yang sudah tersimpan tidak akan terpengaruh</li>
            <li>Status ini berlaku untuk semua pengguna yang mengakses form publik</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Komponen Pesan untuk Form Public saat Nonaktif
export const PsbClosedMessage = () => {
  return (
    <div className="flex items-center justify-center">
      <Card className="w-full border-2 border-red-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-red-700">Pendaftaran Ditutup</CardTitle>
          <CardDescription className="text-base mt-2">Maaf, pendaftaran siswa baru saat ini sedang tidak aktif</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <Info className="w-5 h-5 text-yellow-600" />
            <AlertDescription className="ml-2 text-yellow-800">
              <strong>Informasi:</strong> Pendaftaran akan dibuka kembali sesuai pengumuman dari sekolah. Silakan hubungi bagian administrasi untuk informasi lebih lanjut.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-6 rounded-lg text-center">
            <p className="text-gray-700 mb-4">Untuk informasi lebih lanjut, silakan hubungi:</p>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">📞 Telepon: (021) 8093-926</p>
              <p className="font-semibold">🏫 Website: https://sman42-jkt.sch.id/</p>
            </div>
          </div>

          <Button type="button" className="w-full" onClick={() => window.history.back()}>
            <HomeIcon size={18} />
            Kembali ke Beranda
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
