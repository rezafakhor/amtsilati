"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Calendar, MapPin, Users, ExternalLink, FileText, Clock } from "lucide-react";

interface Diklat {
  id: string;
  title: string;
  description: string;
  location: string;
  method: string;
  registrationLink: string;
  image: string;
  isActive: boolean;
  diklatdate: Array<{
    startDate: string;
    endDate: string;
  }>;
  _count: {
    diklatregistration: number;
  };
}

export default function DiklatPublicPage() {
  const router = useRouter();
  const [diklats, setDiklats] = useState<Diklat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiklats();
  }, []);

  const fetchDiklats = async () => {
    try {
      const res = await fetch("/api/diklat");
      const data = await res.json();
      
      // Filter only active diklats with future dates
      const today = new Date();
      const activeDiklats = data.filter((diklat: Diklat) => {
        if (!diklat.isActive) return false;
        
        // Check if any date is in the future
        return diklat.diklatdate.some(date => 
          new Date(date.endDate) >= today
        );
      });
      
      setDiklats(activeDiklats);
    } catch (error) {
      console.error("Error fetching diklat:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      ONLINE: "bg-blue-100 text-blue-700",
      OFFLINE: "bg-green-100 text-green-700",
      HYBRID: "bg-purple-100 text-purple-700"
    };
    return colors[method] || "bg-gray-100 text-gray-700";
  };

  const getNextDate = (dates: Array<{ startDate: string; endDate: string }>) => {
    const today = new Date();
    const futureDates = dates.filter(d => new Date(d.startDate) >= today);
    
    if (futureDates.length > 0) {
      return futureDates[0];
    }
    
    return dates[dates.length - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-arabic font-bold text-dark mb-4">
            Jadwal Diklat & Pelatihan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ikuti program pendidikan dan pelatihan metode Amtsilati untuk meningkatkan kemampuan membaca kitab kuning
          </p>
        </div>

        {/* Diklat List */}
        {diklats.length === 0 ? (
          <div className="card-3d p-12 text-center max-w-2xl mx-auto">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-arabic font-bold text-dark mb-3">
              Belum Ada Jadwal Diklat
            </h3>
            <p className="text-gray-600 mb-6">
              Saat ini belum ada jadwal diklat yang tersedia. Silakan cek kembali nanti.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {diklats.map((diklat) => {
              const nextDate = getNextDate(diklat.diklatdate);
              
              return (
                <div
                  key={diklat.id}
                  className="card-3d overflow-hidden group hover:shadow-soft-xl transition-all duration-300"
                >
                  {/* Image */}
                  <div className="relative h-56 bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden">
                    {diklat.image ? (
                      <img
                        src={diklat.image}
                        alt={diklat.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-20 h-20 text-gray-300" />
                      </div>
                    )}
                    
                    {/* Method Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${getMethodBadge(diklat.method)}`}>
                        {diklat.method}
                      </span>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-arabic font-bold text-dark line-clamp-2 min-h-[3.5rem]">
                      {diklat.title}
                    </h3>

                    {diklat.description && (
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {diklat.description}
                      </p>
                    )}

                    {/* Info */}
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                        <span className="line-clamp-2">{diklat.location}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>
                          {new Date(nextDate.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      {diklat.diklatdate.length > 1 && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 flex-shrink-0" />
                          <span>+{diklat.diklatdate.length - 1} jadwal lainnya</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{diklat._count.diklatregistration} pendaftar</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 space-y-2">
                      <button
                        onClick={() => router.push(`/diklat/${diklat.id}`)}
                        className="w-full btn-primary flex items-center justify-center space-x-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Lihat Detail</span>
                      </button>

                      {diklat.registrationLink && (
                        <a
                          href={diklat.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center space-x-2 text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Daftar Sekarang</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
