import PageTitle from "@/components/PageTitle";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LogoSekolah from "@/assets/logo-sekolah-42.png";
import { LinkIcon, MapPinIcon, UserPlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import BannerSekolah from "@/assets/Banner-image-psb.png";
import { Link } from "react-router-dom";
import Footer from "../Footer";
import type { TahunAkademik } from "@/types";
import { useEffect, useState } from "react";
import api from "@/api/axios";
import Swal from "sweetalert2";

const HomePage = () => {
  const [dataTahunAkademik, setDataTahunAkademik] = useState<TahunAkademik[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data dari backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/spa/tahun-akademik");
        if (res.data.status === "success") {
          setDataTahunAkademik(res.data.data);
        }
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data!",
          text: error.response?.data?.message || "Tidak dapat memuat data tahun akademik",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Ambil tahun akademik aktif (bisa berdasarkan status atau yang pertama)
  const tahunAkademikAktif = dataTahunAkademik.find((ta) => ta.status === "aktif") || dataTahunAkademik[0];

  return (
    <div className="mx-auto max-w-7xl w-full px-4 md:px-0">
      <PageTitle title="Penerimaan Siswa Baru" />

      {/* HeaderLayouts */}
      <Card className="overflow-hidden border-0 shadow bg-linear-to-br from-indigo-50 via-white to-purple-50">
        <CardHeader>
          <CardTitle>
            <div className="flex items-center md:flex-row flex-col gap-2">
              <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="w-10 h-10" />
              <h5 className="text-xl font-bold text-muted-foreground">SMA Negeri 42 Jakarta</h5>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* MainLayouts */}
      <main className="container mx-auto mt-8 space-y-8">
        {/* Hero Section */}
        <Card className="overflow-hidden border-0 shadow bg-linear-to-br from-indigo-50 via-white to-purple-50">
          <CardContent className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Text Content */}
              <div className="space-y-6 order-2 lg:order-1">
                <div className="space-y-3">
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">Penerimaan Siswa Baru</h1>
                  <div className="flex items-center gap-3">
                    <img src={LogoSekolah} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800">SMA Negeri 42 Jakarta</h2>

                      {/* TAMPILKAN TAHUN AKADEMIK DINAMIS */}
                      {loading ? (
                        <p className="text-lg text-gray-400 font-medium animate-pulse">Memuat...</p>
                      ) : tahunAkademikAktif ? (
                        <p className="text-lg text-gray-600 font-medium">Tahun Ajaran {tahunAkademikAktif.tahun_akademik}</p>
                      ) : (
                        <p className="text-lg text-gray-500 font-medium">Tahun Ajaran -</p>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 leading-relaxed text-base md:text-lg">Bergabunglah bersama kami dan wujudkan masa depan cemerlang Anda. Situs resmi untuk pendaftaran online Penerimaan Siswa Baru SMA Negeri 42 Jakarta.</p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link to="/public-psb/form-psb-siswa" className="flex-1 sm:flex-initial">
                    <Button size="lg" className="w-full group shadow-lg hover:shadow-xl transition-all">
                      <UserPlusIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      Daftar Sekarang
                    </Button>
                  </Link>
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-gray-50" onClick={() => document.getElementById("lokasi")?.scrollIntoView({ behavior: "smooth" })}>
                    <MapPinIcon className="w-5 h-5" />
                    Lihat Lokasi
                  </Button>
                </div>
              </div>

              {/* Image */}
              <div className="order-1 lg:order-2">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-linear-to-r from-indigo-500 to-purple-500 rounded-3xl blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <div className="relative bg-white p-2 rounded-2xl shadow-2xl">
                    <img src={BannerSekolah} alt="SMA Negeri 42 Jakarta" className="w-full h-auto rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Section */}
        <Card id="lokasi" className="overflow-hidden border-0 shadow p-0">
          <CardContent className="p-0">
            <div className="bg-linear-to-r from-indigo-600 to-purple-600 p-8 md:p-10">
              <div className="flex items-center gap-3 mb-2">
                <MapPinIcon className="w-6 h-6 text-white" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Lokasi Sekolah</h2>
              </div>
              <p className="text-indigo-100">Jl. Rajawali Raya, Halim Perdana Kusumah, Jakarta Timur</p>
            </div>

            <div className="relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15864.248659398025!2d106.892649!3d-6.255541!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e69f2df62cacd63%3A0x54cd7440230e1b08!2sSMA%20Negeri%2042%20Jakarta!5e0!3m2!1sen!2sus!4v1764752405574!5m2!1sen!2sus"
                width="100%"
                height="450"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* FooterLayouts */}
      <footer>
        <Card className="overflow-hidden border-0 shadow mt-8 bg-linear-to-br from-indigo-50 via-white to-purple-50">
          <CardFooter>
            <div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                <div className="flex md:flex-row flex-col items-center gap-3 col-span-2">
                  <img src={LogoSekolah} alt="SMA Negeri 42 Jakarta" className="w-15 h-15" />
                  <div>
                    <h2 className="text-normal font-bold text-muted-foreground text-center md:text-left">SMA Negeri 42 Jakarta</h2>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed text-center md:text-left">Jl. Rajawali Raya, Halim Perdana Kusumah, Kec. Makasar, Kota Jakarta Timur, Daerah Khusus Ibukota Jakarta.</p>
                  </div>
                </div>
                <div>
                  <h2 className="text-normal font-bold text-muted-foreground">Sosial Media</h2>
                  <div className="flex flex-row">
                    <Link to={"https://www.instagram.com/sman42.official/"} target="_blank">
                      <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                        <LinkIcon /> Instagram
                      </Button>
                    </Link>

                    <Link to={"https://www.tiktok.com/@sman42jkt.officia?_t=8qmFQ3qYS3D&_r=1"} target="_blank">
                      <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                        <LinkIcon /> Tiktok
                      </Button>
                    </Link>

                    <Link to={"https://www.youtube.com/@sman42jkt?si=n59-TPNibdDAE-nr"} target="_blank">
                      <Button type="button" size={"sm"} variant={"link"} className="text-primary">
                        <LinkIcon /> Youtube
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
      </footer>
      <Footer />
    </div>
  );
};

export default HomePage;
