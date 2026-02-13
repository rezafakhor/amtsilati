"use client";

import { useState, useEffect } from "react";
import { X, CheckCircle, XCircle, Package, Truck, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess: () => void;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentProof: string | null;
  paidAmount: number;
  remainingDebt: number;
  packingPhoto: string | null;
  shippingMethod: string | null;
  expeditionName: string | null;
  trackingNumber: string | null;
  trackingPhoto: string | null;
  shippingAddress: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  orderitem: Array<{
    quantity: number;
    price: number;
    product?: { name: string; image: string | null };
    Renamedpackage?: { name: string };
  }>;
}

export default function OrderDetailModal({ isOpen, onClose, orderId, onSuccess }: OrderDetailModalProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [shippingMethod, setShippingMethod] = useState<"EKSPEDISI" | "DRIVER">("EKSPEDISI");
  const [expeditionName, setExpeditionName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [packingPhotoFile, setPackingPhotoFile] = useState<File | null>(null);
  const [trackingPhotoFile, setTrackingPhotoFile] = useState<File | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetail();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetail = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      console.log('Admin modal - Fetched order:', data);
      if (data.orderitem?.length > 0) {
        console.log('Admin modal - Sample orderitem:', data.orderitem[0]);
      }
      setOrder(data);
      setShippingMethod(data.shippingMethod || "EKSPEDISI");
      setExpeditionName(data.expeditionName || "");
      setTrackingNumber(data.trackingNumber || "");
    } catch (error) {
      console.error("Error fetching order:", error);
      showToast("Gagal memuat detail pesanan", "error");
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Upload failed");
    }

    const data = await res.json();
    return data.url;
  };

  const handleVerifyPayment = async (approve: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: approve ? "PROCESSING" : "CANCELLED",
        }),
      });

      if (res.ok) {
        showToast(
          approve ? "Pembayaran diverifikasi, pesanan diproses" : "Pesanan dibatalkan",
          "success"
        );
        onSuccess();
        fetchOrderDetail();
      } else {
        showToast("Gagal memverifikasi pembayaran", "error");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPackingPhoto = async () => {
    if (!packingPhotoFile) {
      showToast("Pilih foto packing terlebih dahulu", "error");
      return;
    }

    setUploading(true);
    try {
      const photoUrl = await uploadFile(packingPhotoFile);
      
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packingPhoto: photoUrl,
        }),
      });

      if (res.ok) {
        showToast("Foto packing berhasil disimpan", "success");
        setPackingPhotoFile(null);
        fetchOrderDetail();
      } else {
        showToast("Gagal menyimpan foto packing", "error");
      }
    } catch (error) {
      console.error("Error uploading packing photo:", error);
      showToast("Terjadi kesalahan saat upload", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleShipOrder = async () => {
    // Validation based on shipping method
    if (shippingMethod === "EKSPEDISI") {
      if (!trackingNumber.trim()) {
        showToast("Masukkan nomor resi", "error");
        return;
      }
      if (!expeditionName.trim()) {
        showToast("Masukkan nama ekspedisi", "error");
        return;
      }
    }

    setLoading(true);
    try {
      let trackingPhotoUrl = null;
      
      // Upload tracking photo if exists (only for EKSPEDISI)
      if (trackingPhotoFile && shippingMethod === "EKSPEDISI") {
        trackingPhotoUrl = await uploadFile(trackingPhotoFile);
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "SHIPPED",
          shippingMethod,
          expeditionName: shippingMethod === "EKSPEDISI" ? expeditionName : null,
          trackingNumber: shippingMethod === "EKSPEDISI" ? trackingNumber : "DRIVER-" + Date.now(),
          trackingPhoto: trackingPhotoUrl,
          shippedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        showToast("Pesanan berhasil dikirim", "success");
        setTrackingPhotoFile(null);
        onSuccess();
        fetchOrderDetail();
      } else {
        showToast("Gagal mengirim pesanan", "error");
      }
    } catch (error) {
      console.error("Error shipping order:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      PENDING_PAYMENT: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      PROCESSING: { bg: 'bg-blue-100', text: 'text-blue-700' },
      SHIPPED: { bg: 'bg-purple-100', text: 'text-purple-700' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-700' },
      CANCELLED: { bg: 'bg-red-100', text: 'text-red-700' },
    };
    return badges[status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
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

  if (!isOpen || !order) return null;

  const statusBadge = getStatusBadge(order.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-dark">{order.orderNumber}</h2>
            <p className="text-sm text-gray-600">{order.user.name} - {order.user.email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
              {getStatusLabel(order.status)}
            </span>
            <span className="text-sm text-gray-600">
              {new Date(order.createdAt).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-semibold text-dark mb-3">Produk Pesanan</h3>
            <div className="space-y-2">
              {order.orderitem.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {item.product?.image && (
                      <img src={item.product.image} alt="" className="w-12 h-12 object-cover rounded" />
                    )}
                    <div>
                      <p className="font-medium text-dark">
                        {item.product?.name || item.Renamedpackage?.name}
                      </p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-primary">
                    Rp {(Number(item.price) * item.quantity).toLocaleString('id-ID')}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-semibold text-dark">Total</span>
              <span className="text-2xl font-bold text-primary">
                Rp {Number(order.total).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div>
            <h3 className="font-semibold text-dark mb-2">Alamat Pengiriman</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{order.shippingAddress}</p>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="font-semibold text-dark mb-2">Metode Pembayaran</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="font-medium text-dark">{order.paymentMethod}</p>
              {order.paymentMethod === "SEBAGIAN" && (
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sudah Dibayar:</span>
                    <span className="font-semibold text-green-600">
                      Rp {Number(order.paidAmount).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sisa Pembayaran:</span>
                    <span className="font-semibold text-orange-600">
                      Rp {Number(order.remainingDebt).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}
              {order.paymentMethod === "UTANG" && (
                <div className="mt-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Piutang:</span>
                    <span className="font-semibold text-orange-600">
                      Rp {Number(order.total).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    * Pesanan dapat diproses, piutang tercatat di menu Piutang
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Payment Proof - Verification */}
          {order.status === 'PENDING_PAYMENT' && (
            <div className="border-2 border-yellow-200 bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold text-dark mb-3 flex items-center">
                <ImageIcon className="w-5 h-5 mr-2" />
                {order.paymentMethod === "UTANG" ? "Verifikasi Pesanan" : "Bukti Pembayaran"}
              </h3>
              
              {order.paymentMethod === "UTANG" ? (
                <div className="space-y-3">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      Pesanan dengan metode UTANG dapat langsung diproses. Piutang akan tercatat di menu Piutang.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleVerifyPayment(true)}
                      disabled={loading}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{loading ? "Memproses..." : "Proses Pesanan"}</span>
                    </button>
                    <button
                      onClick={() => handleVerifyPayment(false)}
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </div>
              ) : order.paymentProof ? (
                <>
                  <img 
                    src={order.paymentProof} 
                    alt="Bukti Pembayaran" 
                    className="w-full max-w-md mx-auto rounded-lg shadow-md mb-4"
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleVerifyPayment(true)}
                      disabled={loading}
                      className="flex-1 btn-primary flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>{loading ? "Memproses..." : "Verifikasi & Proses"}</span>
                    </button>
                    <button
                      onClick={() => handleVerifyPayment(false)}
                      disabled={loading}
                      className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <p className="text-sm text-orange-800">
                    Menunggu customer mengupload bukti pembayaran...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Packing Photo Upload */}
          {order.status === 'PROCESSING' && (
            <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-dark mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Foto Packing Barang
              </h3>
              {order.packingPhoto ? (
                <div>
                  <img 
                    src={order.packingPhoto} 
                    alt="Foto Packing" 
                    className="w-full max-w-md mx-auto rounded-lg shadow-md mb-3"
                  />
                  <p className="text-sm text-green-600 text-center">✓ Foto packing sudah diupload</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPackingPhotoFile(e.target.files?.[0] || null)}
                      className="hidden"
                      id="packingPhotoInput"
                    />
                    <label htmlFor="packingPhotoInput" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {packingPhotoFile ? packingPhotoFile.name : "Klik untuk pilih foto packing"}
                      </p>
                    </label>
                  </div>
                  <button
                    onClick={handleUploadPackingPhoto}
                    disabled={uploading || !packingPhotoFile}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{uploading ? "Mengupload..." : "Simpan Foto Packing"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Shipping Info */}
          {order.status === 'PROCESSING' && order.packingPhoto && (
            <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-dark mb-3 flex items-center">
                <Truck className="w-5 h-5 mr-2" />
                Informasi Pengiriman
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Jenis Pengiriman</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShippingMethod("EKSPEDISI")}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        shippingMethod === "EKSPEDISI"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      📦 Ekspedisi
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingMethod("DRIVER")}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        shippingMethod === "DRIVER"
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      }`}
                    >
                      🚗 Driver Pawedaran
                    </button>
                  </div>
                </div>

                {shippingMethod === "EKSPEDISI" ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Nama Ekspedisi</label>
                      <input
                        type="text"
                        value={expeditionName}
                        onChange={(e) => setExpeditionName(e.target.value)}
                        placeholder="Contoh: JNE, J&T, SiCepat, dll"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Nomor Resi</label>
                      <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        placeholder="Masukkan nomor resi"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">Foto Resi (Opsional)</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setTrackingPhotoFile(e.target.files?.[0] || null)}
                          className="hidden"
                          id="trackingPhotoInput"
                        />
                        <label htmlFor="trackingPhotoInput" className="cursor-pointer">
                          <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">
                            {trackingPhotoFile ? trackingPhotoFile.name : "Klik untuk pilih foto resi"}
                          </p>
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      ✓ Pengiriman menggunakan Driver Pawedaran. Klik tombol di bawah untuk mengirim pesanan.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleShipOrder}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Truck className="w-5 h-5" />
                  <span>{loading ? "Memproses..." : "Kirim Pesanan"}</span>
                </button>
              </div>
            </div>
          )}

          {/* Shipped Info */}
          {(order.status === 'SHIPPED' || order.status === 'COMPLETED') && (
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-dark mb-3">Informasi Pengiriman</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nomor Resi:</span>
                  <span className="font-semibold text-dark">{order.trackingNumber}</span>
                </div>
                {order.trackingPhoto && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Foto Resi:</p>
                    <img 
                      src={order.trackingPhoto} 
                      alt="Foto Resi" 
                      className="w-full max-w-md mx-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
                {order.packingPhoto && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Foto Packing:</p>
                    <img 
                      src={order.packingPhoto} 
                      alt="Foto Packing" 
                      className="w-full max-w-md mx-auto rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Proof - Show for all statuses */}
          {order.paymentProof && (
            <div className="border-2 border-purple-200 bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-dark mb-3">Bukti Pembayaran</h3>
              <div>
                <img 
                  src={order.paymentProof} 
                  alt="Bukti Pembayaran" 
                  className="w-full max-w-md mx-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
