import { prisma } from "@/lib/prisma";
import { Package, ShoppingCart, CreditCard, AlertTriangle, TrendingUp, Building2, Calendar } from "lucide-react";
import DashboardGreeting from "@/components/admin/DashboardGreeting";

// Function to get current Hijri date
function toHijri(date: Date) {
  // Fixed to current date: 25 Syaban 1447 H
  return '25 Syaban 1447 H';
}

export default async function AdminDashboard() {
  // Get current month data
  const now = new Date();
  const hijriString = toHijri(now);
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Get statistics
  const [
    totalOrders,
    monthlyOrders,
    totalRevenue,
    monthlyRevenue,
    totalDebt,
    lowStockProducts,
    totalPesantren,
    topProducts,
    topPesantren,
    recentOrders,
    monthlyStats
  ] = await Promise.all([
    // Total orders
    prisma.order.count(),
    
    // Monthly orders
    prisma.order.count({
      where: {
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      }
    }),
    
    // Total revenue
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } }
    }),
    
    // Monthly revenue
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      }
    }),
    
    // Total debt
    prisma.debt.aggregate({
      _sum: { remainingDebt: true }
    }),
    
    // Low stock products
    prisma.product.count({
      where: {
        stock: { lte: prisma.product.fields.minStock }
      }
    }),
    
    // Total pesantren (users with pesantrenName)
    prisma.user.count({
      where: {
        pesantrenName: { not: null }
      }
    }),
    
    // Top products - get all orderitems with products
    prisma.orderitem.findMany({
      where: {
        productId: { not: null },
        order: { status: { not: 'CANCELLED' } }
      },
      select: {
        productId: true,
        quantity: true
      }
    }),
    
    // Top pesantren
    prisma.order.findMany({
      where: {
        status: { not: 'CANCELLED' }
      },
      select: {
        userId: true,
        total: true,
        user: {
          select: {
            name: true,
            pesantrenName: true
          }
        }
      }
    }),
    
    // Recent orders
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, pesantrenName: true } }
      }
    }),
    
    // Last 6 months stats
    prisma.$queryRaw`
      SELECT 
        DATE_FORMAT(createdAt, '%Y-%m') as month,
        COUNT(*) as orderCount,
        SUM(total) as revenue
      FROM \`order\`
      WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
        AND status != 'CANCELLED'
      GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
      ORDER BY month DESC
      LIMIT 6
    `
  ]);

  // Process top products - manually fetch product names
  const productQuantityMap = new Map<string, number>();
  
  // First, aggregate quantities by productId
  for (const item of topProducts as any[]) {
    if (item.productId) {
      const existing = productQuantityMap.get(item.productId);
      productQuantityMap.set(item.productId, (existing || 0) + item.quantity);
    }
  }
  
  // Then fetch product names for unique productIds
  const uniqueProductIds = Array.from(productQuantityMap.keys());
  const products = await prisma.product.findMany({
    where: { id: { in: uniqueProductIds } },
    select: { id: true, name: true }
  });
  
  const topProductsWithNames = products
    .map(product => ({
      name: product.name,
      totalQuantity: productQuantityMap.get(product.id) || 0
    }))
    .sort((a, b) => b.totalQuantity - a.totalQuantity)
    .slice(0, 10);

  // Process top pesantren
  const pesantrenMap = new Map<string, { name: string; pesantrenName: string | null; orderCount: number; totalRevenue: number }>();
  topPesantren.forEach((order: any) => {
    const existing = pesantrenMap.get(order.userId);
    if (existing) {
      existing.orderCount += 1;
      existing.totalRevenue += Number(order.total);
    } else {
      pesantrenMap.set(order.userId, {
        name: order.user.name,
        pesantrenName: order.user.pesantrenName,
        orderCount: 1,
        totalRevenue: Number(order.total)
      });
    }
  });
  
  const topPesantrenWithNames = Array.from(pesantrenMap.values())
    .sort((a, b) => {
      // Prioritize pesantren with pesantrenName
      if (a.pesantrenName && !b.pesantrenName) return -1;
      if (!a.pesantrenName && b.pesantrenName) return 1;
      return b.orderCount - a.orderCount;
    })
    .slice(0, 10);

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const monthlyData = (monthlyStats as any[]).reverse();

  // Format date string for greeting component
  const dateString = now.toLocaleDateString('id-ID', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return (
    <div className="space-y-8">
      {/* Header - Executive Style */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
        <div className="flex-1">
          {/* Greeting Box - Client Component with Real-time Clock */}
          <DashboardGreeting dateString={dateString} hijriString={hijriString} />
          
          <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Dashboard</h1>
          <p className="text-sm text-[#6a6a6a]">Ringkasan performa dan aktivitas sistem</p>
        </div>
      </div>

      {/* ZONE A - KPI STRIP (Horizontal Compact) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total Penjualan */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Total Penjualan</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">
            {(Number(totalRevenue._sum.total || 0) / 1000000).toFixed(1)}
            <span className="text-sm font-normal text-[#6a6a6a] ml-1">jt</span>
          </p>
        </div>

        {/* Pendapatan Bulan Ini */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Pendapatan Bulan Ini</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">
            {(Number(monthlyRevenue._sum.total || 0) / 1000000).toFixed(1)}
            <span className="text-sm font-normal text-[#6a6a6a] ml-1">jt</span>
          </p>
        </div>

        {/* Total Pesanan */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <ShoppingCart className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Total Pesanan</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{monthlyOrders}</p>
          <p className="text-xs text-[#6a6a6a] mt-1">bulan ini</p>
        </div>

        {/* Pesantren Aktif */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <Building2 className="w-5 h-5 text-[#0f3d2e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Pesantren Aktif</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{totalPesantren}</p>
        </div>

        {/* Total Piutang */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <CreditCard className="w-5 h-5 text-[#c6a548]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Total Piutang</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">
            {(Number(totalDebt._sum.remainingDebt || 0) / 1000000).toFixed(1)}
            <span className="text-sm font-normal text-[#6a6a6a] ml-1">jt</span>
          </p>
        </div>

        {/* Stok Kritis */}
        <div className="bg-white rounded-[18px] p-5 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-5 h-5 text-[#b76e6e]" strokeWidth={1.5} />
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
          </div>
          <p className="text-xs text-[#6a6a6a] mb-1">Stok Kritis</p>
          <p className="text-2xl font-bold text-[#1c1c1c]">{lowStockProducts}</p>
          <p className="text-xs text-[#b76e6e] mt-1">perlu restock</p>
        </div>
      </div>

      {/* ZONE B - ANALYTICS & INSIGHTS */}
      {/* Row 1: Penjualan 6 Bulan + Pesanan Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Penjualan 6 Bulan Terakhir - span 8 */}
        <div className="lg:col-span-8 bg-white rounded-[18px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <h2 className="text-lg font-serif font-semibold text-[#1c1c1c] mb-6">Penjualan 6 Bulan Terakhir</h2>
          <div className="space-y-4">
            {monthlyData.map((stat: any, index) => {
              const monthDate = new Date(stat.month + '-01');
              const monthName = monthNames[monthDate.getMonth()];
              const maxRevenue = Math.max(...monthlyData.map((s: any) => Number(s.revenue)));
              const percentage = (Number(stat.revenue) / maxRevenue) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-[#6a6a6a]">{monthName} {monthDate.getFullYear()}</span>
                    <div className="text-right">
                      <span className="font-bold text-[#0f3d2e]">
                        Rp {(Number(stat.revenue) / 1000000).toFixed(1)}jt
                      </span>
                      <span className="text-xs text-[#6a6a6a] ml-2">• {stat.orderCount} pesanan</span>
                    </div>
                  </div>
                  <div className="w-full bg-[#f5f4f1] rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#0f3d2e] to-[#145c43] rounded-full transition-all duration-600"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pesanan Terbaru - span 4 */}
        <div className="lg:col-span-4 bg-white rounded-[18px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <h2 className="text-lg font-serif font-semibold text-[#1c1c1c] mb-6">Pesanan Terbaru</h2>
          <div className="space-y-3">
            {recentOrders.slice(0, 6).map((order) => (
              <div key={order.id} className="p-3 bg-[#f5f4f1] rounded-[14px] hover:bg-[#eceae7] transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-[#1c1c1c] text-sm">{order.orderNumber}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    order.status === 'SHIPPED' ? 'bg-purple-100 text-purple-700' :
                    order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {order.status === 'COMPLETED' ? 'Selesai' :
                     order.status === 'SHIPPED' ? 'Dikirim' :
                     order.status === 'PROCESSING' ? 'Diproses' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-[#6a6a6a] mb-1 truncate">{order.user.name}</p>
                <p className="font-bold text-[#0f3d2e] text-sm">
                  Rp {Number(order.total).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
            
            {recentOrders.length === 0 && (
              <p className="text-center text-[#6a6a6a] py-8 text-sm">Belum ada pesanan</p>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Produk Terlaris + Pesantren Terbanyak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produk Terlaris */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <h2 className="text-lg font-serif font-semibold text-[#1c1c1c] mb-6">Produk Terlaris</h2>
          {topProductsWithNames.length > 0 ? (
            <div className="space-y-3">
              {topProductsWithNames.slice(0, 8).map((product: any, index) => {
                const maxQty = Number(topProductsWithNames[0].totalQuantity) || 1;
                const quantity = Number(product.totalQuantity) || 0;
                const percentage = (quantity / maxQty) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="flex-shrink-0 w-7 h-7 bg-[#0f3d2e] text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-medium text-[#1c1c1c] truncate">{product.name}</span>
                      </div>
                      <span className="text-sm font-bold text-[#0f3d2e] ml-2">
                        {quantity}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-7 flex-shrink-0"></div>
                      <div className="flex-1 bg-[#f5f4f1] rounded-full h-1.5 overflow-hidden ml-3">
                        <div
                          className="h-full bg-gradient-to-r from-[#0f3d2e] to-[#c6a548] rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-[#6a6a6a]">
              <Package className="w-12 h-12 mx-auto mb-2 text-[#eceae7]" />
              <p className="text-sm">Belum ada produk terjual</p>
            </div>
          )}
        </div>

        {/* Pesantren Terbanyak Pesan */}
        <div className="bg-white rounded-[18px] p-6 shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <h2 className="text-lg font-serif font-semibold text-[#1c1c1c] mb-6">Pesantren Terbanyak Pesan</h2>
          {topPesantrenWithNames.length > 0 ? (
            <div className="space-y-3">
              {topPesantrenWithNames.slice(0, 8).map((item: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#f5f4f1] rounded-[14px] hover:bg-[#eceae7] transition-colors">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#0f3d2e] text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1c1c1c] text-sm truncate">
                        {item.pesantrenName || item.name}
                      </p>
                      <p className="text-xs text-[#6a6a6a]">{Number(item.orderCount)} pesanan</p>
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-[#0f3d2e] text-sm">
                      {(Number(item.totalRevenue) / 1000000).toFixed(1)}jt
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-[#6a6a6a]">
              <Building2 className="w-12 h-12 mx-auto mb-2 text-[#eceae7]" />
              <p className="text-sm">Belum ada pesanan dari pesantren</p>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Ringkasan Laporan Bulanan - Full Width Compact Grid */}
      <div className="bg-gradient-to-br from-[#0f3d2e]/5 to-[#c6a548]/5 rounded-[18px] p-6 border border-[#0f3d2e]/10">
        <h2 className="text-lg font-serif font-semibold text-[#1c1c1c] mb-6">Ringkasan Laporan Bulanan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-sm text-[#6a6a6a] mb-2">Total Pesanan</p>
            <p className="text-3xl font-bold text-[#0f3d2e]">{monthlyOrders}</p>
            <p className="text-xs text-[#6a6a6a] mt-1">bulan ini</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-[#6a6a6a] mb-2">Pendapatan</p>
            <p className="text-3xl font-bold text-[#0f3d2e]">
              {(Number(monthlyRevenue._sum.total || 0) / 1000000).toFixed(1)}
              <span className="text-lg font-normal text-[#6a6a6a] ml-1">jt</span>
            </p>
            <p className="text-xs text-[#6a6a6a] mt-1">bulan ini</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-[#6a6a6a] mb-2">Pesantren</p>
            <p className="text-3xl font-bold text-[#0f3d2e]">{totalPesantren}</p>
            <p className="text-xs text-[#6a6a6a] mt-1">terdaftar</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-[#6a6a6a] mb-2">Total Penjualan</p>
            <p className="text-3xl font-bold text-[#0f3d2e]">
              {(Number(totalRevenue._sum.total || 0) / 1000000).toFixed(1)}
              <span className="text-lg font-normal text-[#6a6a6a] ml-1">jt</span>
            </p>
            <p className="text-xs text-[#6a6a6a] mt-1">keseluruhan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
