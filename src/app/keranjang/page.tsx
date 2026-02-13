"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useToastContext } from "@/contexts/ToastContext";
import LoadingSpinner from "@/components/LoadingSpinner";

interface CartItem {
  productId?: string;
  packageId?: string;
  quantity: number;
  type: "product" | "package";
}

interface CartItemWithDetails extends CartItem {
  name: string;
  price: number;
  stock: number;
}

export default function KeranjangPage() {
  const router = useRouter();
  const { showToast } = useToastContext();
  const [cart, setCart] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartWithDetails();
  }, []);

  const loadCartWithDetails = async () => {
    const cartStr = localStorage.getItem("cart");
    if (!cartStr) {
      setLoading(false);
      return;
    }

    const cartItems: CartItem[] = JSON.parse(cartStr);
    const itemsWithDetails: CartItemWithDetails[] = [];

    for (const item of cartItems) {
      try {
        if (item.productId) {
          const res = await fetch(`/api/products/${item.productId}`);
          if (res.ok) {
            const product = await res.json();
            itemsWithDetails.push({
              ...item,
              name: product.name,
              price: Number(product.price),
              stock: product.stock,
            });
          }
        } else if (item.packageId) {
          const res = await fetch(`/api/packages/${item.packageId}`);
          if (res.ok) {
            const pkg = await res.json();
            itemsWithDetails.push({
              ...item,
              name: pkg.name,
              price: Number(pkg.price),
              stock: 999,
            });
          }
        }
      } catch (error) {
        console.error("Error loading item:", error);
      }
    }

    setCart(itemsWithDetails);
    setLoading(false);
  };

  const saveCart = (newCart: CartItemWithDetails[]) => {
    const cartToSave = newCart.map(item => ({
      productId: item.productId,
      packageId: item.packageId,
      quantity: item.quantity,
      type: item.type,
    }));
    localStorage.setItem("cart", JSON.stringify(cartToSave));
    setCart(newCart);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const item = cart[index];
    if (newQuantity > item.stock) {
      showToast(`Stok maksimal ${item.stock} unit`, "error");
      return;
    }
    const newCart = [...cart];
    newCart[index].quantity = newQuantity;
    saveCart(newCart);
  };

  const handleQuantityInput = (index: number, value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0) {
      updateQuantity(index, num);
    }
  };

  const removeItem = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    saveCart(newCart);
    showToast("Item berhasil dihapus dari keranjang", "success");
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <LoadingSpinner text="Memuat keranjang..." />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <main className="container mx-auto px-6 py-12">
          <div className="text-center py-20">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-serif font-bold text-dark mb-4">
              Keranjang Kosong
            </h2>
            <p className="text-gray-600 mb-8">
              Belum ada produk di keranjang Anda
            </p>
            <Link href="/katalog" className="btn-primary inline-block">
              Mulai Belanja
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-arabic font-bold text-dark mb-6 md:mb-8">
          Keranjang Belanja
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="card-3d p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1 w-full">
                    <h3 className="text-lg md:text-xl font-semibold text-dark mb-2">
                      {item.name}
                    </h3>
                    <p className="text-base md:text-lg text-primary font-bold mb-4">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(item.price || 0)}
                    </p>

                    {/* Quantity Controls with Manual Input */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => updateQuantity(index, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={item.stock}
                        value={item.quantity}
                        onChange={(e) => handleQuantityInput(index, e.target.value)}
                        className="w-16 h-10 text-center text-xl font-bold text-dark border-2 border-gray-200 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(index, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-500">
                        Stok: {item.stock}
                      </span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-4">
                    <p className="text-xl md:text-2xl font-bold text-dark">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format((item.price || 0) * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-700 flex items-center space-x-2 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-3d p-4 md:p-6 lg:sticky lg:top-6 space-y-6">
              <h2 className="text-xl md:text-2xl font-arabic font-bold text-dark">
                Ringkasan Pesanan
              </h2>

              <div className="border-t border-gray-200 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xl font-bold text-dark pt-3 border-t border-gray-200">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(subtotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full btn-primary py-4 text-lg"
              >
                Lanjut ke Checkout
              </button>

              <Link
                href="/katalog"
                className="block text-center text-primary hover:underline"
              >
                Lanjut Belanja
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
