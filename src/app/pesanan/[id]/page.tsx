"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Package, Clock, Truck, CheckCircle, Upload, MapPin, Phone, User, CreditCard } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import Image from "next/image";

interface OrderItem {
  quantity: number;
  price: number;
  product?: { name: string; image?: string };
  Renamedpackage?: { name: string };
}

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentProof?: string;
  paidAmount: number;
  remainingDebt: number;
  shippingName: string;
  shippingAddress: string;
  shippingPhone: string;
  shippingCity: string;
  shippingProvince: string;
  shippingMethod?: string;
  expeditionName?: string;
  trackingNumber?: string;
  trackingPhoto?: string;
  packingPhoto?: string;
  shippedAt?: string;
  createdAt: string;
  orderitem: OrderItem[];
}

export default function OrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToastContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [showPaymentProof, setShowPaymentProof] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchOrder();
    }
  }, [status, router, params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched order detail:', data);
        if (data.orderitem?.length > 0) {
          console.log('Sample orderitem:', data.orderitem[0]);
        }
        setOrder(data);
      } else {
        showToast("Pesanan tidak ditemukan", "error");
        router.push("/pesanan");
      }
    } catch (error) {
      console.error("Error fetching order:", error);
      showToast("Gagal memuat pesanan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProof = async () => {
    if (!paymentProof || !order) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", paymentProof);
      formData.append("type", "payment"); // Private file
      
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      
      if (!uploadRes.ok) {
        showToast("Gagal upload file", "error");
        setUploading(false);
        return;
      }

      const uploadData = await uploadRes.json();

      const res = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentProof: uploadData.path }) // Use path for private files
      });

      if (res.ok) {
        showToast("Bukti pembayaran berhasil diupload!", "success");
        setPaymentProof(null);
        fetchOrder();
      } else {
        showToast("Gagal menyimpan bukti pembayaran", "error");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setUploading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { icon: JSX.Element; label: string; color: string }> = {
      PENDING_PAYMENT: { 
        icon: <Clock className="w-4 h-4" />, 
        label: "Menunggu Verifikasi", 
        color: "text-orange-700 bg-orange-50" 
      },
      PROCESSING: { 
        icon: <Package className="w-4 h-4" />, 
        label: "Diproses", 
        color: "text-blue-700 bg-blue-50" 
      },
      SHIPPED: { 
        icon: <Truck className="w-4 h-4" />, 
        label: "Dikirim", 
        color: "text-purple-700 bg-purple-50" 
      },
      COMPLETED: { 
        icon: <CheckCircle className="w-4 h-4" />, 
        label: "Selesai", 
        color: "text-green-700 bg-green-50" 
      },
      CANCELLED: { 
        icon: <Clock className="w-4 h-4" />, 
        label: "Dibatalkan", 
        color: "text-red-700 bg-red-50" 
      },
    };
    return configs[status] || configs.PENDING_PAYMENT;
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <Navbar />
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <Navbar />
      
      <main className="container mx-auto px-3 md:px-6 py-4 md:py-6 max-w-4xl">
        {/* Back Button */}
        <button
          onClick={() => router.push("/pesanan")}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 md:p-6 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-lg md:text-xl font-bold text-dark">{order.orderNumber}</h1>
              <p className="text-xs md:text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${statusConfig.color} w-fit`}>
              {statusConfig.icon}
              <span className="text-xs md:text-sm font-semibold">{statusConfig.label}</span>
            </div>
          </div>

          {/* Upload Payment Proof */}
          {order.status === 'PENDING_PAYMENT' && order.paymentMethod !== "UTANG" && !order.paymentProof && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 md:p-4">
              <p className="text-xs md:text-sm font-semibold text-orange-800 mb-3">
                Upload Bukti Pembayaran
              </p>
              <div className="space-y-3">
                <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center bg-white">
                  <Upload className="w-6 h-6 md:w-8 md:h-8 text-orange-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    className="hidden"
                    id="payment-proof-upload"
                  />
                  <label htmlFor="payment-proof-upload" className="cursor-pointer text-primary hover:underline text-xs md:text-sm">
                    {paymentProof ? paymentProof.name : "Pilih file bukti transfer"}
                  </label>
                </div>
                {paymentProof && (
                  <button
                    onClick={handleUploadProof}
                    disabled={uploading}
                    className="w-full btn-primary text-sm py-2 disabled:opacity-50"
                  >
                    {uploading ? "Mengupload..." : "Upload Bukti"}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Payment Proof - Show for all statuses if exists */}
          {order.paymentProof && order.paymentMethod !== "UTANG" && (
            <div className={`border rounded-lg p-3 md:p-4 ${
              order.status === 'PENDING_PAYMENT' 
                ? 'bg-blue-50 border-blue-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <p className={`text-xs md:text-sm font-semibold mb-2 ${
                order.status === 'PENDING_PAYMENT' ? 'text-blue-800' : 'text-green-800'
              }`}>
                Bukti Pembayaran
              </p>
              <p className={`text-xs mb-3 ${
                order.status === 'PENDING_PAYMENT' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {order.status === 'PENDING_PAYMENT' 
                  ? 'Menunggu verifikasi admin' 
                  : '✓ Pembayaran telah diverifikasi'}
              </p>
              
              {!showPaymentProof ? (
                <button
                  onClick={() => setShowPaymentProof(true)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                  Lihat Bukti Transfer
                </button>
              ) : (
                <div className="space-y-2">
                  <div className={`relative w-full h-48 bg-white rounded-lg overflow-hidden border ${
                    order.status === 'PENDING_PAYMENT' ? 'border-blue-200' : 'border-green-200'
                  }`}>
                    <Image
                      src={order.paymentProof}
                      alt="Bukti Pembayaran"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    onClick={() => setShowPaymentProof(false)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Sembunyikan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Shipping Info */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 md:p-6 mb-4">
          <h2 className="text-sm md:text-base font-bold text-dark mb-3 flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span>Alamat Pengiriman</span>
          </h2>
          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex items-start space-x-2">
              <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-dark font-medium">{order.shippingName}</p>
            </div>
            <div className="flex items-start space-x-2">
              <Phone className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">{order.shippingPhone}</p>
            </div>
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-gray-700">
                {order.shippingAddress}, {order.shippingCity}, {order.shippingProvince}
              </p>
            </div>
          </div>
        </div>

        {/* Shipping Tracking Info */}
        {(order.status === 'SHIPPED' || order.status === 'COMPLETED') && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl shadow-soft border border-purple-200 p-4 md:p-6 mb-4">
            <h2 className="text-sm md:text-base font-bold text-dark mb-3 flex items-center space-x-2">
              <Truck className="w-4 h-4 text-purple-600" />
              <span>Informasi Pengiriman</span>
            </h2>
            <div className="space-y-3">
              <div className="bg-white rounded-lg p-3 space-y-2 text-xs md:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Jenis Pengiriman</span>
                  <span className="font-semibold text-dark">
                    {order.shippingMethod === "DRIVER" ? "🚗 Driver Pawedaran" : "📦 Ekspedisi"}
                  </span>
                </div>
                {order.shippingMethod === "EKSPEDISI" && order.expeditionName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama Ekspedisi</span>
                    <span className="font-semibold text-dark">{order.expeditionName}</span>
                  </div>
                )}
                {order.trackingNumber && !order.trackingNumber.startsWith("DRIVER-") && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nomor Resi</span>
                    <span className="font-mono font-semibold text-primary">{order.trackingNumber}</span>
                  </div>
                )}
                {order.shippedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tanggal Kirim</span>
                    <span className="font-semibold text-dark">
                      {new Date(order.shippedAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Packing Photo */}
              {order.packingPhoto && (
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">Foto Packing Barang</p>
                  <div className="relative w-full h-48 md:h-64 bg-white rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={order.packingPhoto}
                      alt="Foto Packing"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Tracking Photo */}
              {order.trackingPhoto && (
                <div>
                  <p className="text-xs md:text-sm font-semibold text-gray-700 mb-2">
                    Foto {order.shippingMethod === "DRIVER" ? "Pengiriman" : "Resi"}
                  </p>
                  <div className="relative w-full h-48 md:h-64 bg-white rounded-lg overflow-hidden border border-gray-200">
                    <Image
                      src={order.trackingPhoto}
                      alt="Foto Resi"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 md:p-6 mb-4">
          <h2 className="text-sm md:text-base font-bold text-dark mb-3">Produk Dipesan</h2>
          <div className="space-y-3">
            {order.orderitem.map((item, index) => (
              <div key={index} className="flex items-center space-x-3 pb-3 border-b border-gray-100 last:border-0">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg md:text-xl">📖</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dark font-medium text-xs md:text-sm truncate">
                    {item.product?.name || item.Renamedpackage?.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity}x • Rp {Number(item.price).toLocaleString('id-ID')}
                  </p>
                </div>
                <p className="text-dark font-bold text-xs md:text-sm">
                  Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100 p-4 md:p-6">
          <h2 className="text-sm md:text-base font-bold text-dark mb-3 flex items-center space-x-2">
            <CreditCard className="w-4 h-4 text-primary" />
            <span>Ringkasan Pembayaran</span>
          </h2>
          <div className="space-y-2 text-xs md:text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Metode Pembayaran</span>
              <span className="font-semibold text-dark">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status Pembayaran</span>
              <span className={`font-semibold ${
                order.paymentStatus === "PAID" ? "text-green-600" : "text-orange-600"
              }`}>
                {order.paymentStatus === "PAID" ? "Lunas" : "Belum Lunas"}
              </span>
            </div>
            
            {/* Show payment breakdown for SEBAGIAN */}
            {order.paymentMethod === "SEBAGIAN" && (
              <>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Sudah Dibayar</span>
                    <span className="font-semibold text-green-600">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(Number(order.paidAmount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sisa Pembayaran</span>
                    <span className="font-semibold text-orange-600">
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
            
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="font-bold text-dark">Total</span>
              <span className="font-bold text-primary text-base md:text-lg">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(Number(order.total))}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
