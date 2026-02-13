"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  PackageOpen, 
  ShoppingCart, 
  CreditCard, 
  Tag, 
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Calendar,
  Settings
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/produk", icon: Package, label: "Produk" },
  { href: "/admin/paket", icon: PackageOpen, label: "Paket" },
  { href: "/admin/pesanan", icon: ShoppingCart, label: "Pesanan" },
  { href: "/admin/piutang", icon: CreditCard, label: "Piutang" },
  { href: "/admin/promo", icon: Tag, label: "Promo" },
  { href: "/admin/diklat", icon: Calendar, label: "Diklat" },
  { href: "/admin/agenda", icon: Calendar, label: "Agenda" },
  { href: "/admin/partners", icon: Users, label: "Mitra" },
  { href: "/admin/stok", icon: ClipboardList, label: "Stok Opname" },
  { href: "/admin/users", icon: Users, label: "Users", superAdminOnly: true },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // Fetch pending orders count
  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const response = await fetch('/api/orders?status=PENDING');
        const data = await response.json();
        setPendingOrdersCount(data.length || 0);
      } catch (error) {
        console.error('Failed to fetch pending orders:', error);
      }
    };

    fetchPendingOrders();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  // Filter menu based on role
  const filteredMenuItems = menuItems.filter(item => {
    if (item.superAdminOnly) {
      return session?.user?.role === 'SUPERADMIN';
    }
    return true;
  });

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#0f3d2e] shadow-lg z-40 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-base font-courgette text-white leading-tight">Pawedaran</h1>
            <p className="text-[10px] text-white/60 font-courgette">by Amtsilati Jabar 1</p>
          </div>
          <Image 
            src="/asset/img/logo.png" 
            alt="Pawedaran" 
            width={32} 
            height={32}
            className="w-8 h-8"
          />
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 mt-[60px]"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar - Executive Minimal × Academic Luxury */}
      <aside
        className={`
          fixed top-0 h-screen bg-[#0f3d2e] z-50 transition-transform duration-300
          w-[240px]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          lg:mt-0 mt-[60px]
          flex flex-col
        `}
      >
        {/* Logo & Brand - Desktop */}
        <div className="hidden lg:block px-5 py-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1">
              <h1 className="text-white font-courgette text-lg leading-tight">
                Pawedaran
              </h1>
              <p className="text-white/60 text-xs font-courgette">
                by Amtsilati Jabar 1
              </p>
            </div>
            <Image 
              src="/asset/img/logo.png" 
              alt="Pawedaran" 
              width={40} 
              height={40}
              className="w-10 h-10 ml-2"
            />
          </div>
          
          {/* Divider */}
          <div className="h-px bg-white/15 mt-4"></div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const showBadge = item.href === "/admin/pesanan" && pendingOrdersCount > 0;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  group relative flex items-center space-x-3 h-11 px-[18px] rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? "bg-white/12 text-white"
                    : "text-white/70 hover:bg-white/6 hover:text-white/90"
                  }
                `}
              >
                {/* Active indicator - gold line */}
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#c6a548] rounded-r-full"></div>
                )}
                
                <Icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                <span className="text-[15px] font-medium flex-1">{item.label}</span>
                
                {/* Badge for pending orders */}
                {showBadge && (
                  <span className="flex items-center justify-center min-w-[22px] h-[22px] px-1.5 bg-[#c6a548] text-[#0f3d2e] text-xs font-bold rounded-full">
                    {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - Logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <button
            onClick={() => {
              closeMobileMenu();
              signOut({ callbackUrl: "/login" });
            }}
            className="flex items-center space-x-3 h-11 px-[18px] rounded-xl text-[#b76e6e] hover:bg-[#b76e6e]/10 w-full transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="text-[15px] font-medium">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
}
