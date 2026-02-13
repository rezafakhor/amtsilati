"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Users, Award, ShoppingBag, Star, TrendingUp, Book, LogIn, User, Calendar, MapPin, Building2 } from "lucide-react";
import { useSession } from "next-auth/react";

interface Agenda {
  id: string;
  title: string;
  eventType: string;
  pesantrenName: string;
  location: string;
  eventDate: string;
  image: string | null;
}

interface Partner {
  id: string;
  pesantrenName: string;
  city: string;
  province: string;
  logo: string | null;
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    setMounted(true);
    fetchAgendas();
    fetchPartners();
  }, []);

  const fetchAgendas = async () => {
    try {
      const res = await fetch('/api/agenda');
      const data = await res.json();
      // Filter only upcoming events (from today 00:00:00 onwards)
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of today
      const upcoming = data.filter((agenda: Agenda) => new Date(agenda.eventDate) >= today);
      setAgendas(upcoming.slice(0, 3)); // Show max 3 upcoming events
    } catch (error) {
      console.error('Failed to fetch agendas:', error);
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await fetch('/api/partners');
      const data = await res.json();
      setPartners(data.slice(0, 6)); // Show max 6 partners
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-dark to-primary relative overflow-hidden">
      {/* Static Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navigation Bar - Clean with Lucide Icons */}
      <div className="relative">
        <div className="container mx-auto px-4 md:px-6 py-4">
          <div className="flex justify-end items-center gap-3">
            <Link 
              href="/katalog" 
              className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/95 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#0f3d2e] to-[#145c43] rounded-lg flex items-center justify-center">
                <Book className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="text-[#0f3d2e] font-semibold text-base">
                Katalog
              </span>
            </Link>

            {session ? (
              session.user?.role === 'ADMIN' || session.user?.role === 'SUPERADMIN' ? (
                <Link 
                  href="/admin" 
                  className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/95 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#c6a548] to-[#9a7b1e] rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[#0f3d2e] font-semibold text-base">
                    Dashboard
                  </span>
                </Link>
              ) : (
                <Link 
                  href="/profile" 
                  className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/95 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#c6a548] to-[#9a7b1e] rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <span className="text-[#0f3d2e] font-semibold text-base">
                    Profil
                  </span>
                </Link>
              )
            ) : (
              <Link 
                href="/login" 
                className="group flex items-center gap-2.5 px-6 py-2.5 bg-white/95 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#c6a548] to-[#9a7b1e] rounded-lg flex items-center justify-center">
                  <LogIn className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <span className="text-[#0f3d2e] font-semibold text-base">
                  Login
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 relative z-10">
        <div className="text-center text-white space-y-4 md:space-y-5 mb-8 md:mb-10">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-accent/30 to-accent/20 backdrop-blur-sm border-2 border-accent px-4 md:px-5 py-2 rounded-full text-accent text-xs md:text-sm font-semibold shadow-xl">
            <Star className="w-4 h-4 md:w-5 md:h-5" />
            <span className="tracking-wide">Metode Praktis Mendalami Al-Qur'an</span>
          </div>

          {/* 3D Logos - Static Elegant Style (Amtsilati first, then Pawedaran) */}
          <div className="flex justify-center items-center gap-5 md:gap-6 mb-4">
            <div className="relative w-20 h-20 md:w-28 md:h-28">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-3xl border-2 border-white/30 shadow-2xl">
                <Image 
                  src="/asset/img/amtsilati.png" 
                  alt="Amtsilati Logo" 
                  width={96} 
                  height={96}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
            
            <div className="relative w-20 h-20 md:w-28 md:h-28">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent/10 rounded-3xl blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-md p-3 md:p-4 rounded-3xl border-2 border-white/30 shadow-2xl">
                <Image 
                  src="/asset/img/logo.png" 
                  alt="Pawedaran Logo" 
                  width={96} 
                  height={96}
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-arabic font-bold leading-tight px-4" style={{ fontWeight: 800 }}>
            Belajar Kitab Kuning<br />
            <span className="text-accent">Lebih Mudah & Cepat</span>
          </h1>

          {/* Description */}
          <p className="text-sm md:text-base lg:text-lg opacity-90 max-w-3xl mx-auto px-4 leading-relaxed">
            AMTSILATI menyediakan metode pembelajaran nahwu shorof yang sistematis, 
            kitab-kitab berkualitas, dan pelatihan intensif untuk santri dan umum.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
            <Link 
              href="/katalog" 
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-semibold text-base shadow-soft-xl transition-all duration-300 hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Belanja Kitab</span>
            </Link>
            <Link 
              href="/diklat" 
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 hover:-translate-y-1 flex items-center justify-center space-x-2"
            >
              <BookOpen className="w-5 h-5" />
              <span>Lihat Jadwal Diklat</span>
            </Link>
          </div>

          {/* Trust Badge */}
          <p className="text-xs md:text-sm opacity-90 px-4 font-medium">
            Bergabung dengan <span className="font-bold text-accent text-base md:text-lg">10.000+</span> Santri lainnya
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto px-4">
          {/* Card 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 md:p-6 text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-xl">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-6 h-6 md:w-7 md:h-7 text-accent" />
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-1">10.000+</div>
            <div className="text-xs md:text-sm opacity-80">Alumni Santri</div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 md:p-6 text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-xl">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-3">
              <Award className="w-6 h-6 md:w-7 md:h-7 text-accent" />
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-1">20+</div>
            <div className="text-xs md:text-sm opacity-80">Tahun Pengalaman</div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 md:p-6 text-white border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-soft-xl sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-accent/20 rounded-xl flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 md:w-7 md:h-7 text-accent" />
            </div>
            <div className="text-2xl md:text-3xl font-bold mb-1">100+</div>
            <div className="text-xs md:text-sm opacity-80">Kitab Berkualitas</div>
          </div>
        </div>
      </div>

      {/* Program Amtsilati Section */}
      <div className="bg-cream py-10 md:py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-arabic font-bold text-dark mb-3" style={{ fontWeight: 800 }}>
                Program Amtsilati
              </h2>
              <div className="w-20 h-1 bg-accent mx-auto mb-4 rounded-full"></div>
            </div>

            {/* Main Content */}
            <div className="space-y-5">
              {/* Metode Pembelajaran Intensif */}
              <div className="card-3d p-5 md:p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-arabic font-bold text-dark mb-2">
                      Metode Pembelajaran Intensif
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-2">
                      Amtsilati adalah metode cepat membaca kitab kuning yang ada di Pondok Pesantren Darul Falah. Dimana para Santri diajarkan dan dibimbing dengan intensif oleh asatidz agar bisa mengkhatamkan Amtsilati dalam kurun waktu <span className="font-semibold text-primary">3 sampai 6 bulan</span> atau bisa lebih cepat dengan berbasis sistem <span className="font-semibold text-primary">kompetisi (perlombaan)</span> dan <span className="font-semibold text-primary">kompetensi (kemampuan)</span>.
                    </p>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-2">
                      Dalam seminggu, Santri diberikan kesempatan untuk mendaftar tes sesuai kemampuan masing-masing Santri. Jika memenuhi standar kelulusan, maka dipersilahkan naik kelas. Jika belum bisa, maka melakukan evaluasi dan mendaftar tes di kemudian hari sampai memenuhi standar kelulusan.
                    </p>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      Maka, setiap Santri mempunyai peluang untuk menyelesaikan materi tanpa harus menunggu waktu yang ditentukan. Karena sistem tersebut mengharuskan para Santri untuk saling berlomba dalam kebaikan. Manfaat dari sistem tersebut, anak yang pandai akan cepat selesai dan anak yang kurang mampu akan matang walaupun lama. Karena setiap hari, para Santri didorong giat belajar karena melihat temannya yang sudah sampai pada pelajaran yang lebih tinggi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Materi Pembelajaran */}
              <div className="card-3d p-5 md:p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-arabic font-bold text-dark mb-2">
                      Materi Pembelajaran
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-2">
                      Materi yang diajarkan di Amtsilati adalah <span className="font-semibold text-primary">kitab Qoidati dan Khulashoti</span> karya KH. Taufiqul hakim yang diambil dari intisari kitab Alfiyyah Ibnu Malik karangan Syekh Jamaluddin Muhammad bin Abdullah bin Malik sebanyak <span className="font-semibold text-primary">182 bait</span> sebagai materi pokok dari pembelajaran amtsilati.
                    </p>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-2">
                      Tak hanya itu, Amtsilati terdiri dari <span className="font-semibold text-primary">5 jilid</span> beserta pembahasan dan pemahaman sebagai penunjang kitab Khulasoti.
                    </p>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      Setelah mempelajari dasar teori dan rumus Amtsilati, para Santri diajarkan bagaimana mempratekkan Amtsilati dengan cara mengajak Santri memaknai kitab yang tidak ada harokat dan maknanya. Dengan bekal rumus qoidati, para Santri bisa untuk memahami kitab kuning dengan seksama didampingi oleh asatidz.
                    </p>
                  </div>
                </div>
              </div>

              {/* Manfaat Amtsilati */}
              <div className="card-3d p-5 md:p-6 bg-gradient-to-br from-primary/5 to-accent/5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg md:text-xl font-arabic font-bold text-dark mb-2">
                      Manfaat Amtsilati
                    </h3>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-2">
                      Dengan Amtsilati, maka tidak perlu membutuhkan waktu lama untuk mempelajari ilmu nahwu seperti zaman dahulu dimana membutuhkan waktu bertahun-tahun untuk sekedar bisa membaca kitab kuning.
                    </p>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-2">
                      Dan perlu diingat, Amtsilati adalah <span className="font-semibold text-accent">jembatan bukan tujuan</span>. Amtsilati adalah <span className="font-semibold text-accent">program pemula bukan pemuka (mahir)</span>. Jika tidak ada jembatan, maka orang akan berenang dengan tenaga ekstra dan waktu yang lama. Kalau ia tidak kuat maka akan tenggelam.
                    </p>
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                      Seperti halnya Amtsilati, sebagai wujud inovasi dan terobosan dalam membaca kitab kuning melalui intisari Alfiyyah yang telah dihimpun oleh KH. Taufiqul Hakim.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agenda Section */}
      {agendas.length > 0 && (
        <div className="bg-white py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-arabic font-bold text-dark mb-3" style={{ fontWeight: 800 }}>
                Agenda Mendatang
              </h2>
              <div className="w-20 h-1 bg-accent mx-auto mb-4 rounded-full"></div>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                Ikuti berbagai acara dan kegiatan dari pesantren partner kami
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {agendas.map((agenda) => (
                <div key={agenda.id} className="card-3d overflow-hidden group">
                  {agenda.image && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={agenda.image} 
                        alt={agenda.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="inline-block px-2.5 py-1 bg-accent/10 text-accent text-xs font-semibold rounded-full mb-2">
                      {agenda.eventType === 'WISUDA' ? 'Wisuda' :
                       agenda.eventType === 'TEST_KELULUSAN' ? 'Test Kelulusan' :
                       agenda.eventType === 'SEMINAR' ? 'Seminar' :
                       agenda.eventType === 'WORKSHOP' ? 'Workshop' : 'Lainnya'}
                    </span>
                    <h3 className="text-lg font-bold text-dark mb-1.5">{agenda.title}</h3>
                    <p className="text-xs text-gray-600 mb-2">{agenda.pesantrenName}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(agenda.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{agenda.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mitra Pesantren Section */}
      {partners.length > 0 && (
        <div className="bg-gradient-to-br from-[#f5f4f1] to-white py-10 md:py-14">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-arabic font-bold text-dark mb-3" style={{ fontWeight: 800 }}>
                Mitra Pesantren
              </h2>
              <div className="w-20 h-1 bg-accent mx-auto mb-4 rounded-full"></div>
              <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                Jaringan pesantren yang telah mempercayai dan menerapkan metode Amtsilati
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {partners.map((partner) => (
                <div key={partner.id} className="bg-white rounded-[20px] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-[#eceae7] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 group">
                  <div className="flex items-start space-x-3">
                    <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-[#0f3d2e] to-[#145c43] rounded-2xl flex items-center justify-center overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {partner.logo ? (
                        <img src={partner.logo} alt={partner.pesantrenName} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-7 h-7 text-white" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-[#1c1c1c] mb-1.5 line-clamp-2 group-hover:text-[#0f3d2e] transition-colors">
                        {partner.pesantrenName}
                      </h3>
                      <div className="flex items-center text-xs text-[#6a6a6a] space-x-1">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{partner.city}, {partner.province}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative element */}
                  <div className="mt-4 pt-3 border-t border-[#eceae7]">
                    <div className="flex items-center justify-between text-[10px] text-[#6a6a6a]">
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span>Mitra Aktif</span>
                      </span>
                      <span className="text-[#c6a548] font-semibold">Amtsilati</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center mt-8">
              <Link 
                href="/mitra-pesantren"
                className="inline-flex items-center space-x-2 px-6 py-2.5 bg-white border-2 border-[#0f3d2e] text-[#0f3d2e] rounded-xl font-semibold hover:bg-[#0f3d2e] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg text-sm"
              >
                <Building2 className="w-5 h-5" />
                <span>Lihat Semua Mitra Pesantren</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary-dark py-10 md:py-12">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-arabic font-bold text-white mb-3 md:mb-4" style={{ fontWeight: 800 }}>
            Siap Memulai Perjalanan Belajar Anda?
          </h2>
          <p className="text-sm md:text-base text-white/90 mb-5 md:mb-6 max-w-2xl mx-auto">
            Jelajahi koleksi kitab kami dan temukan yang sesuai dengan kebutuhan Anda
          </p>
          <Link 
            href="/katalog" 
            className="inline-flex items-center space-x-2 bg-accent hover:bg-accent/90 text-white px-6 py-3 rounded-xl font-bold text-base shadow-soft-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Lihat Katalog Lengkap</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-primary-dark text-white py-6 px-4 md:px-6">
        <div className="container mx-auto text-center">
          <h3 className="text-xl md:text-2xl font-courgette mb-1.5">Pawedaran</h3>
          <p className="text-accent font-courgette mb-3 text-sm">by Amtsilati Jabar 1</p>
          <p className="text-xs opacity-75">
            Platform E-Commerce Kitab Islami Premium
          </p>
        </div>
      </div>
    </div>
  );
}
