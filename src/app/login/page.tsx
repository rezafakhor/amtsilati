"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === 'SUPERADMIN' || session.user.role === 'ADMIN') {
        router.push("/admin");
      } else {
        router.push("/katalog");
      }
    }
  }, [status, session, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Email atau password salah");
      } else {
        // Fetch session to get user role
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        
        // Redirect based on role
        if (session?.user?.role === 'SUPERADMIN' || session?.user?.role === 'ADMIN') {
          router.push("/admin");
        } else {
          router.push("/katalog");
        }
        router.refresh();
      }
    } catch (error) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const message = encodeURIComponent("السلام عليكم ورحمة الله وبركاته\n\nSaya ingin mendaftar akun Pawedaran. Mohon bantuannya.");
    window.open(`https://wa.me/6282288554667?text=${message}`, '_blank');
  };

  // Show loading while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f3d2e] via-[#145c43] to-[#0f3d2e]">
        <div className="text-white text-lg">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f3d2e] via-[#145c43] to-[#0f3d2e] p-6">
      <div className="w-full max-w-md">
        {/* Login Card */}
        <div className="bg-white rounded-[24px] p-8 md:p-10 shadow-[0_20px_60px_rgba(15,61,46,0.3)] border border-[#eceae7]">
          {/* Logo & Brand */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-[#0f3d2e] to-[#145c43] p-3 shadow-[0_8px_24px_rgba(15,61,46,0.25)]">
                <Image 
                  src="/asset/img/logo.png" 
                  alt="Pawedaran" 
                  width={80} 
                  height={80}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-courgette text-[#0f3d2e] mb-2">
              Pawedaran
            </h1>
            <p className="text-[#c6a548] font-courgette text-sm">
              by Amtsilati Jabar 1
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#c6a548] to-transparent mx-auto mt-3"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] text-[#1c1c1c] placeholder-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20 focus:border-[#0f3d2e] transition-all"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] text-[#1c1c1c] placeholder-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20 focus:border-[#0f3d2e] transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a6a6a] hover:text-[#0f3d2e] transition-colors p-1"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" strokeWidth={1.5} />
                  ) : (
                    <Eye className="w-5 h-5" strokeWidth={1.5} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-[12px] text-sm border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-[#0f3d2e] to-[#145c43] text-white rounded-[12px] font-medium hover:shadow-[0_8px_24px_rgba(15,61,46,0.3)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#eceae7]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-[#6a6a6a]">atau</span>
            </div>
          </div>

          {/* WhatsApp Contact */}
          <button
            onClick={handleWhatsAppContact}
            type="button"
            className="w-full h-12 bg-white border-2 border-[#0f3d2e] text-[#0f3d2e] rounded-[12px] font-medium hover:bg-[#0f3d2e] hover:text-white transition-all duration-200 flex items-center justify-center space-x-2 group"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={1.5} />
            <span>Hubungi Admin untuk Daftar</span>
          </button>

          <p className="text-center text-xs text-[#6a6a6a] mt-4 leading-relaxed">
            Belum punya akun? Silakan hubungi admin untuk pembuatan akun baru
          </p>

          {/* Back to Catalog */}
          <div className="mt-6 text-center">
            <Link 
              href="/katalog" 
              className="text-sm text-[#0f3d2e] hover:text-[#145c43] font-medium transition-colors inline-flex items-center space-x-1"
            >
              <span>←</span>
              <span>Kembali ke Katalog</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
