"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { MapPin, Calendar, Building2 } from "lucide-react";

interface Partner {
  id: string;
  pesantrenName: string;
  city: string;
  province: string;
  logo: string | null;
  description: string | null;
  joinedDate: string;
  isActive: boolean;
}

export default function MitraPesantrenPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await fetch("/api/partners");
      if (response.ok) {
        const data = await response.json();
        setPartners(data.filter((p: Partner) => p.isActive));
      }
    } catch (error) {
      console.error("Error fetching partners:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
    });
  };

  return (
    <div className="min-h-screen bg-[#f9faf7]">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-playfair font-bold text-[#0f3d2e] mb-4">
            Mitra Pesantren
          </h1>
          <p className="text-lg text-[#6a6a6a] max-w-2xl mx-auto">
            Pesantren-pesantren yang telah mempercayai dan menggunakan metode Amtsilati
            dalam pembelajaran nahwu shorof
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-[#c6a548] to-[#d4af37] mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
            <p className="mt-4 text-[#6a6a6a]">Memuat data mitra...</p>
          </div>
        )}

        {/* Partners Grid */}
        {!loading && partners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(15,61,46,0.08)] hover:shadow-[0_8px_30px_rgba(15,61,46,0.12)] transition-all duration-300 border border-[#eceae7]"
              >
                {/* Logo */}
                {partner.logo ? (
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-[#f5f4f1] flex items-center justify-center">
                    <img
                      src={partner.logo}
                      alt={partner.pesantrenName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#0f3d2e] to-[#145c43] flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-white" strokeWidth={1.5} />
                  </div>
                )}

                {/* Name */}
                <h3 className="text-xl font-semibold text-[#0f3d2e] text-center mb-3">
                  {partner.pesantrenName}
                </h3>

                {/* Location */}
                <div className="flex items-center justify-center text-[#6a6a6a] mb-3">
                  <MapPin className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  <span className="text-sm">
                    {partner.city}, {partner.province}
                  </span>
                </div>

                {/* Joined Date */}
                <div className="flex items-center justify-center text-[#6a6a6a] mb-4">
                  <Calendar className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  <span className="text-sm">
                    Bergabung sejak {formatDate(partner.joinedDate)}
                  </span>
                </div>

                {/* Description */}
                {partner.description && (
                  <p className="text-sm text-[#6a6a6a] text-center leading-relaxed">
                    {partner.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && partners.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-16 h-16 text-[#c6a548] mx-auto mb-4" strokeWidth={1.5} />
            <h3 className="text-xl font-semibold text-[#0f3d2e] mb-2">
              Belum Ada Mitra Pesantren
            </h3>
            <p className="text-[#6a6a6a]">
              Saat ini belum ada data mitra pesantren yang tersedia
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-[#0f3d2e] to-[#145c43] rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-playfair font-bold mb-4">
            Ingin Menjadi Mitra Kami?
          </h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Bergabunglah dengan ratusan pesantren yang telah mempercayai metode Amtsilati
            untuk pembelajaran nahwu shorof yang efektif dan menyenangkan
          </p>
          <a
            href="https://wa.me/6282288554667?text=السلام%20عليكم%20ورحمة%20الله%20وبركاته%0A%0ASaya%20ingin%20menjadi%20mitra%20pesantren%20Amtsilati"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#0f3d2e] px-8 py-3 rounded-full font-semibold hover:bg-[#f5f4f1] transition-colors"
          >
            Hubungi Kami
          </a>
        </div>
      </main>
    </div>
  );
}
