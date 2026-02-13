"use client";

import { useState, useEffect } from "react";
import { Eye, Package, Truck, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import OrderDetailModal from "@/components/admin/OrderDetailModal";

interface Order {
  id: string;
  orderNumber: string;
  user: { name: string; pesantrenName?: string };
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paidAmount: number;
  remainingDebt: number;
  shippingAddress: string;
  createdAt: string;
}

export default function PesananPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: string } | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleQuickStatusUpdate = async () => {
    if (!confirmAction) return;

    try {
      const newStatus = confirmAction.action === 'complete' ? 'COMPLETED' : 'SHIPPED';
      
      const res = await fetch(`/api/orders/${confirmAction.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        showToast(
          newStatus === 'COMPLETED' ? "Pesanan selesai" : "Pesanan dikirim",
          "success"
        );
        fetchOrders();
      } else {
        showToast("Gagal mengubah status", "error");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setConfirmAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      PENDING_PAYMENT: 'bg-amber-50 text-amber-700 border border-amber-200',
      PROCESSING: 'bg-blue-50 text-blue-700 border border-blue-200',
      SHIPPED: 'bg-purple-50 text-purple-700 border border-purple-200',
      COMPLETED: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      CANCELLED: 'bg-red-50 text-red-700 border border-red-200',
    };
    
    return badges[status] || 'bg-gray-100 text-gray-700 border border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING_PAYMENT: 'Menunggu Verifikasi',
      PROCESSING: 'Diproses',
      SHIPPED: 'Dikirim',
      COMPLETED: 'Selesai',
      CANCELLED: 'Dibatalkan',
    };
    
    return labels[status] || status;
  };

  const extractPesantrenName = (address: string): string | null => {
    // Try to extract pesantren name from address
    // Format: "Name\nPesantren: XYZ\nAddress..."
    const lines = address.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('pesantren:')) {
        return line.replace(/pesantren:/i, '').trim();
      }
    }
    return null;
  };

  if (loading) {
    return <div className="text-center py-12">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Pesanan</h1>
        <p className="text-sm text-[#6a6a6a]">Kelola pesanan dan pengiriman</p>
      </div>

      {/* Desktop: Table View */}
      <div className="hidden md:block bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f4f1] border-b border-[#eceae7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">No. Pesanan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Pelanggan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Total</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Pembayaran</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceae7]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#f5f4f1]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#1c1c1c] text-sm">{order.orderNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[#1c1c1c] text-sm">{order.user.name}</p>
                    {order.user.pesantrenName && (
                      <p className="text-xs text-[#6a6a6a] mt-0.5">{order.user.pesantrenName}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#0f3d2e] text-sm">
                    Rp {Number(order.total).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-[#1c1c1c] text-xs">{order.paymentMethod}</p>
                      {order.paymentMethod === "SEBAGIAN" && (
                        <div className="text-xs mt-1 space-y-0.5">
                          <p className="text-emerald-600">
                            ✓ Rp {Number(order.paidAmount).toLocaleString('id-ID')}
                          </p>
                          <p className="text-[#c6a548]">
                            ⊙ Rp {Number(order.remainingDebt).toLocaleString('id-ID')}
                          </p>
                        </div>
                      )}
                      {order.paymentMethod === "UTANG" && (
                        <p className="text-xs text-[#c6a548] mt-1">
                          Piutang: Rp {Number(order.total).toLocaleString('id-ID')}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6a6a6a]">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewDetail(order.id)}
                        className="p-2 text-[#0f3d2e] hover:bg-[#0f3d2e]/10 rounded-[10px] transition-colors"
                        title="Lihat Detail & Kelola"
                      >
                        <Eye className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                      {order.status === 'SHIPPED' && (
                        <button 
                          onClick={() => setConfirmAction({ id: order.id, action: 'complete' })}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-[10px] transition-colors"
                          title="Selesaikan Pesanan"
                        >
                          <CheckCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="text-center py-16 text-[#6a6a6a]">
              <div className="w-16 h-16 bg-[#f5f4f1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-[#6a6a6a]" />
              </div>
              <p className="text-sm">Belum ada pesanan</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Card View - Compact with 2-column layout */}
      <div className="md:hidden space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#eceae7] p-3">
            {/* Header - Compact */}
            <div className="flex items-start justify-between mb-2 pb-2 border-b border-[#eceae7]">
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[#1c1c1c] text-xs mb-0.5">{order.orderNumber}</p>
                <p className="text-[10px] text-[#6a6a6a]">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ml-2 ${getStatusBadge(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
            </div>

            {/* 2-Column Layout for Customer & Payment */}
            <div className="grid grid-cols-2 gap-3 mb-2">
              {/* Customer Info */}
              <div>
                <p className="text-[10px] text-[#6a6a6a] mb-0.5">Pelanggan</p>
                <p className="text-xs font-medium text-[#1c1c1c] leading-tight">{order.user.name}</p>
                {order.user.pesantrenName && (
                  <p className="text-[10px] text-[#6a6a6a] leading-tight mt-0.5">{order.user.pesantrenName}</p>
                )}
              </div>

              {/* Payment Info */}
              <div>
                <p className="text-[10px] text-[#6a6a6a] mb-0.5">Pembayaran</p>
                <p className="text-xs font-medium text-[#1c1c1c] leading-tight">{order.paymentMethod}</p>
                {order.paymentMethod === "SEBAGIAN" && (
                  <div className="text-[10px] space-y-0.5 mt-0.5">
                    <p className="text-emerald-600 leading-tight">✓ Rp {(Number(order.paidAmount) / 1000).toFixed(0)}k</p>
                    <p className="text-[#c6a548] leading-tight">⊙ Rp {(Number(order.remainingDebt) / 1000).toFixed(0)}k</p>
                  </div>
                )}
                {order.paymentMethod === "UTANG" && (
                  <p className="text-[10px] text-[#c6a548] mt-0.5 leading-tight">Rp {(Number(order.total) / 1000).toFixed(0)}k</p>
                )}
              </div>
            </div>

            {/* Total & Actions in one row */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#eceae7]">
              <div>
                <p className="text-[10px] text-[#6a6a6a] mb-0.5">Total</p>
                <p className="text-sm font-bold text-[#0f3d2e]">
                  Rp {Number(order.total).toLocaleString('id-ID')}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleViewDetail(order.id)}
                  className="h-8 px-3 bg-[#0f3d2e] text-white rounded-lg text-xs font-medium hover:bg-[#145c43] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" strokeWidth={2} />
                  <span>Detail</span>
                </button>
                {order.status === 'SHIPPED' && (
                  <button 
                    onClick={() => setConfirmAction({ id: order.id, action: 'complete' })}
                    className="h-8 w-8 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center"
                    title="Selesaikan"
                  >
                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-12 text-[#6a6a6a] bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#eceae7]">
            <div className="w-12 h-12 bg-[#f5f4f1] rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-[#6a6a6a]" />
            </div>
            <p className="text-xs">Belum ada pesanan</p>
          </div>
        )}
      </div>

      <OrderDetailModal
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        orderId={selectedOrderId || ""}
        onSuccess={fetchOrders}
      />

      <ConfirmDialog
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        title="Selesaikan Pesanan"
        message="Apakah Anda yakin pesanan ini sudah selesai dan diterima pelanggan?"
        onConfirm={handleQuickStatusUpdate}
        confirmText="Selesaikan"
        type="info"
      />
    </div>
  );
}
