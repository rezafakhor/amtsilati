"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface DashboardGreetingProps {
  dateString: string;
  hijriString: string;
}

export default function DashboardGreeting({ dateString }: DashboardGreetingProps) {
  const [greeting, setGreeting] = useState("Selamat Pagi");

  useEffect(() => {
    // Update greeting based on time
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) {
        setGreeting("Selamat Pagi");
      } else if (hour >= 11 && hour < 15) {
        setGreeting("Selamat Siang");
      } else if (hour >= 15 && hour < 18) {
        setGreeting("Selamat Sore");
      } else {
        setGreeting("Selamat Malam");
      }
    };

    updateGreeting();
    // Update every minute
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-br from-[#0f3d2e] to-[#145c43] rounded-[20px] p-6 md:p-8 mb-6 shadow-[0_12px_32px_rgba(15,61,46,0.3)] border border-[#0f3d2e]/20 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#c6a548]/10 rounded-full blur-2xl"></div>
      
      <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        {/* Left: Greeting Text */}
        <div className="flex-1 text-center md:text-left">
          <p className="text-white/70 text-xs md:text-sm font-medium mb-2 md:mb-3 line-clamp-1">
            {dateString}
          </p>
          <h1 className="text-white text-xl md:text-3xl lg:text-4xl font-bold mb-2 tracking-tight">
            {greeting}, Superadmin!
          </h1>
          <p className="text-white/80 text-xs md:text-base leading-relaxed">
            Pantau performa sistem, statistik keuangan,<br className="hidden md:inline" /> dan aktivitas user hari ini.
          </p>
        </div>
        
        {/* Right: Logos */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-2xl border-2 border-white/30 shadow-xl">
              <Image 
                src="/asset/img/amtsilati.png" 
                alt="Amtsilati" 
                width={80} 
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <div className="absolute inset-0 bg-[#c6a548]/20 rounded-2xl blur-lg"></div>
            <div className="relative bg-white/10 backdrop-blur-sm p-3 rounded-2xl border-2 border-white/30 shadow-xl">
              <Image 
                src="/asset/img/logo.png" 
                alt="Pawedaran" 
                width={80} 
                height={80}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
