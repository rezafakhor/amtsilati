"use client";

import { useState, useEffect } from "react";
import { Eye, Package, CheckCircle, Download, Calendar } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import ConfirmDialog from "@/components/ConfirmDialog";
import OrderDetailModal from "@/components/admin/OrderDetailModal";
import * as XLSX from 'xlsx';

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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exporting, setExporting] = useState(false);
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

  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      showToast("Pilih rentang tanggal terlebih dahulu", "error");
      return;
    }

    setExporting(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
      });

      const res = await fetch(`/api/orders/export?${params}`);
      if (!res.ok) throw new Error("Export failed");

      const data = await res.json();

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(data);

      // Set column widths
      const colWidths = [
        { wch: 15 }, // No. Order
        { wch: 18 }, // Tanggal
        { wch: 20 }, // Customer
        { wch: 25 }, // Email
        { wch: 25 }, // Pesantren
        { wch: 30 }, // Nama Item
        { wch: 8 },  // Qty
        { wch: 15 }, // Harga Satuan
        { wch: 15 }, // Subtotal Item
        { wch: 15 }, // Subtotal Order
        { wch: 12 }, // Diskon
        { wch: 15 }, // Total Order
        { wch: 12 }, // Metode Bayar
        { wch: 12 }, // Status Bayar
        { wch: 15 }, // Dibayar
        { wch: 15 }, // Sisa Hutang
        { wch: 12 }, // Status Order
        { wch: 15 }, // Kode Promo
        { wch: 40 }, // Alamat Kirim
        { wch: 20 }, // Penerima
        { wch: 15 }, // No. HP
        { wch: 12 }, // Metode Kirim
        { wch: 20 }, // No. Resi
      ];
      ws['!cols'] = colWidths;

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Penjualan");

      // Generate filename with date range
      const filename = `Penjualan_${startDate}_${endDate}.xlsx`;

      // Download file
      XLSX.writeFile(wb, filename);

      showToast("Data berhasil diexport", "success");
    } catch (error) {
      console.error("Error exporting:", error);
      showToast("Gagal export data", "error");
    } finally {
      setExporting(false);
    }
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

      {/* Export Section */}
      <div className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] p-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#eceae7] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20 focus:border-[#0f3d2e] transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
                <Calendar className="w-4 h-4 inline mr-1.5" />
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#eceae7] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20 focus:border-[#0f3d2e] transition-all text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleExportExcel}
            disabled={!startDate || !endDate || exporting}
            className="px-6 py-2.5 bg-[#0f3d2e] text-white rounded-[12px] hover:bg-[#145c43] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-medium text-sm"
          >
            <Download className="w-4 h-4" />
            {exporting ? "Mengexport..." : "Export Excel"}
          </button>
        </div>
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
