"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, CreditCard, AlertTriangle, TrendingUp, Building2, Calendar } from "lucide-react";
import DashboardGreeting from "@/components/admin/DashboardGreeting";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  monthlyRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  totalPartners: number;
  upcomingAgendas: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    totalProducts: 0,
    lowStockProducts: 0,
    totalPartners: 0,
    upcomingAgendas: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  const now = new Date();
  const dateString = now.toLocaleDateString('id-ID', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  const hijriString = '25 Syaban 1447 H';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          <DashboardGreeting dateString={dateString} hijriString={hijriString} />
          <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Dashboard</h1>
          <p className="text-sm text-[#6a6a6a]">Ringkasan performa dan aktivitas sistem</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Total Penjualan</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">
            {(stats.totalRevenue / 1000000).toFixed(1)}
            <span className="text-sm font-normal text-[#6a6a6a] ml-1">jt</span>
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Pendapatan Bulan Ini</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">
            {(stats.monthlyRevenue / 1000000).toFixed(1)}
            <span className="text-sm font-normal text-[#6a6a6a] ml-1">jt</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <ShoppingCart className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Total Pesanan</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{stats.totalOrders}</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-5 h-5 text-[#c6a548]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Pesanan Pending</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{stats.pendingOrders}</p>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Total Produk</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{stats.totalProducts}</p>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-5 h-5 text-[#b76e6e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Stok Kritis</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{stats.lowStockProducts}</p>
        </div>

        {/* Total Partners */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Mitra Aktif</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{stats.totalPartners}</p>
        </div>

        {/* Upcoming Agendas */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Agenda Mendatang</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{stats.upcomingAgendas}</p>
        </div>
      </div>
    </div>
  );
}
