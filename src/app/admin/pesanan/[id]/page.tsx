"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, User, MapPin, CreditCard, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  paymentMethod: string;
  paymentProof: string | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
  };
  shippingAddress: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product?: {
      name: string;
      image: string | null;
    };
    package?: {
      name: string;
      image: string | null;
    };
  }>;
}

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}`);
      const data = await res.json();
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!confirm(`Ubah status pesanan menjadi ${newStatus}?`)) return;

    try {
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        alert('Status pesanan berhasil diubah');
        fetchOrder();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Gagal mengubah status pesanan');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <p>Pesanan tidak ditemukan</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Kembali</span>
      </button>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pesanan #{order.orderNumber}
            </h1>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informasi Pembeli
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-600">Nama:</span> {order.user.name}</p>
              <p><span className="text-gray-600">Email:</span> {order.user.email}</p>
              {order.user.phone && (
                <p><span className="text-gray-600">Telepon:</span> {order.user.phone}</p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Alamat Pengiriman
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium">{order.shippingAddress.recipientName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p className="text-gray-600">
                {order.shippingAddress.address}<br />
                {order.shippingAddress.city}, {order.shippingAddress.province}<br />
                {order.shippingAddress.postalCode}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Item Pesanan
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                {(item.product?.image || item.package?.image) && (
                  <img
                    src={item.product?.image || item.package?.image || ''}
                    alt={item.product?.name || item.package?.name || ''}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <p className="font-medium">{item.product?.name || item.package?.name}</p>
                  <p className="text-sm text-gray-600">Jumlah: {item.quantity}</p>
                </div>
                <p className="font-semibold">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0
                  }).format(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t mt-6 pt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold">Total Pembayaran</span>
            <span className="text-2xl font-bold text-primary">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(order.totalAmount)}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            <CreditCard className="w-4 h-4 inline mr-1" />
            Metode Pembayaran: {order.paymentMethod}
          </p>
          {order.paymentProof && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Bukti Pembayaran:</p>
              <img
                src={order.paymentProof}
                alt="Bukti Pembayaran"
                className="max-w-md rounded-lg border"
              />
            </div>
          )}
        </div>

        <div className="border-t mt-6 pt-6">
          <h3 className="font-semibold mb-4">Ubah Status Pesanan</h3>
          <div className="flex flex-wrap gap-2">
            {['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((status) => (
              <button
                key={status}
                onClick={() => handleUpdateStatus(status)}
                disabled={order.status === status}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  order.status === status
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
