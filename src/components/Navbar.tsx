"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";
import CartBadge from "./CartBadge";
import { useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-primary shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/katalog" className="flex items-center space-x-2 md:space-x-3">
            <Image 
              src="/asset/img/logo.png" 
              alt="Pawedaran Logo" 
              width={40} 
              height={40}
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl font-courgette text-white leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Pawedaran</h1>
              <span className="text-[10px] md:text-sm text-accent font-courgette hidden sm:block">by Amtsilati Jabar 1</span>
            </div>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-white hover:text-accent transition-colors">
              Beranda
            </Link>
            <Link href="/katalog" className="text-white hover:text-accent transition-colors">
              Katalog
            </Link>
            <Link href="/diklat" className="text-white hover:text-accent transition-colors">
              Diklat
            </Link>
            {session && (
              <>
                <Link href="/pesanan" className="text-white hover:text-accent transition-colors">
                  Pesanan Saya
                </Link>
                <Link href="/piutang" className="text-white hover:text-accent transition-colors">
                  Piutang
                </Link>
              </>
            )}
            <Link href="/keranjang" className="relative">
              <ShoppingCart className="w-6 h-6 text-white hover:text-accent transition-colors" />
              <CartBadge />
            </Link>
            <Link href={session ? "/profile" : "/login"} className="relative">
              {session ? (
                <div className="relative">
                  <User className="w-6 h-6 text-white hover:text-accent transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-primary"></div>
                </div>
              ) : (
                <User className="w-6 h-6 text-white/60 hover:text-accent transition-colors" />
              )}
            </Link>
          </div>

          {/* Mobile Menu Button & Icons */}
          <div className="flex md:hidden items-center space-x-4">
            <Link href="/keranjang" className="relative">
              <ShoppingCart className="w-6 h-6 text-white hover:text-accent transition-colors" />
              <CartBadge />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-accent transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-primary-dark space-y-3 animate-slide-in">
            <Link 
              href="/" 
              className="block py-2 text-white hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Beranda
            </Link>
            <Link 
              href="/katalog" 
              className="block py-2 text-white hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Katalog
            </Link>
            <Link 
              href="/diklat" 
              className="block py-2 text-white hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Diklat
            </Link>
            {session && (
              <>
                <Link 
                  href="/pesanan" 
                  className="block py-2 text-white hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pesanan Saya
                </Link>
                <Link 
                  href="/piutang" 
                  className="block py-2 text-white hover:text-accent transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Piutang
                </Link>
              </>
            )}
            <Link 
              href={session ? "/profile" : "/login"}
              className="block py-2 text-white hover:text-accent transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              {session ? "Profil ✓" : "Login"}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
