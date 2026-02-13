"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Package, Clock, Truck, CheckCircle, XCircle, ShoppingBag, Search } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paidAmount: number;
  remainingDebt: number;
  createdAt: string;
  orderitem: Array<{
    quantity: number;
    price: number;
    product?: { name: string };
    Renamedpackage?: { name: string };
  }>;
}

type StatusFilter = "ALL" | "PENDING_PAYMENT" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED";

export default function PesananPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      console.log('Fetched orders:', data.length);
      if (data.length > 0 && data[0].orderitem?.length > 0) {
        console.log('Sample orderitem from frontend:', data[0].orderitem[0]);
      }
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeTab === "ALL" || order.status === activeTab;
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: JSX.Element; label: string; color: string; bgColor: string }> = {
      PENDING_PAYMENT: {
        icon: <Clock className="w-4 h-4" />,
        label: "Menunggu Verifikasi",
        color: "text-orange-700",
        bgColor: "bg-orange-50 border-orange-200"
      },
      PROCESSING: {
        icon: <Package className="w-4 h-4" />,
        label: "Diproses",
        color: "text-blue-700",
        bgColor: "bg-blue-50 border-blue-200"
      },
      SHIPPED: {
        icon: <Truck className="w-4 h-4" />,
        label: "Dikirim",
        color: "text-purple-700",
        bgColor: "bg-purple-50 border-purple-200"
      },
      COMPLETED: {
        icon: <CheckCircle className="w-4 h-4" />,
        label: "Selesai",
        color: "text-green-700",
        bgColor: "bg-green-50 border-green-200"
      },
      CANCELLED: {
        icon: <XCircle className="w-4 h-4" />,
        label: "Dibatalkan",
        color: "text-red-700",
        bgColor: "bg-red-50 border-red-200"
      },
    };
    return configs[status] || configs.PENDING_PAYMENT;
  };

  const getStatusCount = (status: StatusFilter) => {
    if (status === "ALL") return orders.length;
    return orders.filter(o => o.status === status).length;
  };

  const tabs: { key: StatusFilter; label: string; icon: JSX.Element }[] = [
    { key: "ALL", label: "Semua", icon: <ShoppingBag className="w-4 h-4" /> },
    { key: "PENDING_PAYMENT", label: "Verifikasi", icon: <Clock className="w-4 h-4" /> },
    { key: "PROCESSING", label: "Diproses", icon: <Package className="w-4 h-4" /> },
    { key: "SHIPPED", label: "Dikirim", icon: <Truck className="w-4 h-4" /> },
    { key: "COMPLETED", label: "Selesai", icon: <CheckCircle className="w-4 h-4" /> },
  ];

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f5f4f1]">
        <Navbar />
        <div className="container mx-auto px-6 py-8 max-w-[1200px]">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.05)]"></div>
              <div className="h-32 bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.05)]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      <Navbar />
      
      <main className="container mx-auto px-6 py-8 max-w-[1200px]">
        {/* Header Section */}
        <div className="mb-5">
          <div className="relative inline-block">
            <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Pesanan Saya</h1>
            <div className="h-[2px] w-[60px] bg-[#c6a548] opacity-40 mt-1"></div>
          </div>
          <p className="text-sm text-[#6a6a6a] mt-2">Kelola dan lacak pesanan Anda</p>
        </div>

        {/* Search Bar - Compact */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a] opacity-50" />
            <input
              type="text"
              placeholder="Cari nomor pesanan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-11 pr-4 bg-white border border-[#e8e6e3] rounded-xl text-[#1c1c1c] text-sm placeholder:text-[#6a6a6a] focus:outline-none focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/8 transition-all"
            />
          </div>
        </div>

        {/* Status Tabs - Segmented Compact */}
        <div className="bg-white rounded-[14px] p-1.5 mb-6 inline-flex gap-1 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          {tabs.map((tab) => {
            const count = getStatusCount(tab.key);
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative h-10 px-[18px] rounded-[10px] flex items-center space-x-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[#0f3d2e] text-white shadow-[0_2px_6px_rgba(15,61,46,0.25)]"
                    : "text-[#6a6a6a] hover:bg-[#f1efec]"
                }`}
              >
                <span className={`${isActive ? "opacity-90" : "opacity-60"}`}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className={`min-w-[20px] h-5 px-1.5 rounded-full text-xs flex items-center justify-center ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-[#e8e6e3] text-[#6a6a6a]"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.05)] p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-semibold text-[#1c1c1c] mb-2">
              {searchQuery ? "Pesanan tidak ditemukan" : "Belum ada pesanan"}
            </h3>
            <p className="text-[#6a6a6a] mb-6">
              {searchQuery 
                ? "Coba kata kunci lain" 
                : "Yuk mulai belanja kitab-kitab pilihan!"}
            </p>
            {!searchQuery && (
              <a href="/katalog" className="inline-block px-6 py-2.5 bg-[#0f3d2e] text-white rounded-xl text-sm font-medium hover:bg-[#145c43] transition-colors">
                Mulai Belanja
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-[18px]">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.05)] overflow-hidden hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)] hover:-translate-y-[3px] transition-all duration-300"
                >
                  {/* Header Order */}
                  <div className="px-5 py-4 flex items-center justify-between border-b border-[#f0eeea]">
                    <div className="flex items-center space-x-3">
                      <ShoppingBag className="w-4 h-4 text-[#0f3d2e]" />
                      <div>
                        <p className="font-semibold text-[#1c1c1c]">{order.orderNumber}</p>
                        <p className="text-[13px] text-[#6a6a6a] mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className={`h-[30px] px-[14px] rounded-full flex items-center space-x-1.5 text-sm font-medium ${
                      order.status === "PENDING_PAYMENT"
                        ? "bg-[rgba(198,165,72,0.15)] text-[#9a7b1e] border border-[rgba(198,165,72,0.35)]"
                        : order.status === "PROCESSING"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : order.status === "SHIPPED"
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : order.status === "COMPLETED"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}>
                      <span className="opacity-80">{statusConfig.icon}</span>
                      <span>{statusConfig.label}</span>
                    </div>
                  </div>

                  {/* Product List - Ultra Compact */}
                  <div className="px-5 py-4">
                    <div className="space-y-3">
                      {order.orderitem.map((item, index) => (
                        <div key={index} className="grid grid-cols-[48px_1fr_auto] gap-3 items-center">
                          {/* Image */}
                          <div className="w-12 h-12 bg-[#f0efec] rounded-[10px] flex items-center justify-center flex-shrink-0">
                            <span className="text-lg">📖</span>
                          </div>
                          
                          {/* Name + Qty */}
                          <div className="min-w-0">
                            <p className="text-[15px] font-medium text-[#1c1c1c] truncate">
                              {item.product?.name || item.Renamedpackage?.name}
                            </p>
                            <p className="text-[13px] text-[#6a6a6a] mt-0.5">
                              {item.quantity}x • {new Intl.NumberFormat("id-ID", {
                                style: "currency",
                                currency: "IDR",
                                minimumFractionDigits: 0,
                              }).format(Number(item.price))}
                            </p>
                          </div>
                          
                          {/* Price Right */}
                          <p className="text-[15px] font-semibold text-[#1c1c1c]">
                            {new Intl.NumberFormat("id-ID", {
                              style: "currency",
                              currency: "IDR",
                              minimumFractionDigits: 0,
                            }).format(Number(item.price) * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Order */}
                  <div className="px-5 py-4 border-t border-[#f0eeea] flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-xs text-[#6a6a6a]">Pembayaran: </span>
                        <span className="text-xs font-medium text-[#1c1c1c]">{order.paymentMethod}</span>
                      </div>
                      <div className="h-4 w-px bg-[#e8e6e3]"></div>
                      <div>
                        <span className="text-xs text-[#6a6a6a]">Total: </span>
                        <span className="text-lg font-bold text-[#0f3d2e]">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                            minimumFractionDigits: 0,
                          }).format(Number(order.total))}
                        </span>
                      </div>
                      {order.paymentMethod === "SEBAGIAN" && (
                        <>
                          <div className="h-4 w-px bg-[#e8e6e3]"></div>
                          <div className="text-xs">
                            <div className="text-[#6a6a6a]">
                              Dibayar: <span className="font-medium text-green-600">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(Number(order.paidAmount))}
                              </span>
                            </div>
                            <div className="text-[#6a6a6a] mt-0.5">
                              Sisa: <span className="font-medium text-orange-600">
                                {new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                  minimumFractionDigits: 0,
                                }).format(Number(order.remainingDebt))}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => router.push(`/pesanan/${order.id}`)}
                      className="h-9 px-4 bg-[#0f3d2e] text-white rounded-[10px] text-sm font-medium hover:bg-[#145c43] hover:-translate-y-[1px] transition-all duration-200"
                    >
                      Detail
                    </button>
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
