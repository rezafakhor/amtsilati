"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import AddressModal from "@/components/AddressModal";
import { clearCart } from "@/lib/cart";
import { Upload, Loader2, MapPin, Plus, Check } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  pesantrenName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

interface CartItem {
  productId?: string;
  packageId?: string;
  quantity: number;
  type: "product" | "package";
}

interface CartItemWithDetails extends CartItem {
  name: string;
  price: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showToast } = useToastContext();
  const [cart, setCart] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Address management
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [useManualAddress, setUseManualAddress] = useState(false);

  // Manual form data (fallback)
  const [shippingName, setShippingName] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingProvince, setShippingProvince] = useState("");
  const [shippingPostal, setShippingPostal] = useState("");
  
  const [paymentMethod, setPaymentMethod] = useState<"UTANG" | "SEBAGIAN" | "LUNAS">("LUNAS");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadCartWithDetails();
      fetchAddresses();
    }
  }, [status, router]);

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

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
        // Auto-select default address
        const defaultAddr = data.find((addr: Address) => addr.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);

  const subtotal = cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const total = subtotal - discount;
  const remainingDebt = paymentMethod === "UTANG" 
    ? total 
    : paymentMethod === "SEBAGIAN" 
    ? total - Number(paidAmount || 0)
    : 0;

  const handlePromoValidation = async () => {
    if (!promoCode) return;
    
    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal })
      });
      
      const data = await res.json();
      
      if (data.valid) {
        setDiscount(data.discount);
        showToast(`Promo berhasil! Diskon: Rp ${data.discount.toLocaleString('id-ID')}`, "success");
      } else {
        showToast(data.message || "Kode promo tidak valid", "error");
      }
    } catch (error) {
      showToast("Gagal validasi promo", "error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSaveAddress = async (addressData: any) => {
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData)
      });

      if (res.ok) {
        const newAddress = await res.json();
        setIsAddressModalOpen(false);
        await fetchAddresses();
        setSelectedAddressId(newAddress.id);
        setUseManualAddress(false);
      } else {
        showToast("Gagal menyimpan alamat", "error");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get shipping data from selected address or manual input
      let finalShippingData;
      
      if (useManualAddress) {
        if (!shippingName || !shippingAddress || !shippingPhone || !shippingCity || !shippingProvince) {
          showToast("Mohon lengkapi data pengiriman", "error");
          setSubmitting(false);
          return;
        }
        finalShippingData = {
          shippingName,
          shippingAddress,
          shippingPhone,
          shippingCity,
          shippingProvince,
          shippingPostal
        };
      } else {
        if (!selectedAddress) {
          showToast("Mohon pilih alamat pengiriman", "error");
          setLoading(false);
          return;
        }
        finalShippingData = {
          shippingName: selectedAddress.recipientName,
          shippingAddress: selectedAddress.address,
          shippingPhone: selectedAddress.phone,
          shippingCity: selectedAddress.city,
          shippingProvince: selectedAddress.province,
          shippingPostal: selectedAddress.postalCode || ""
        };
      }

      // Upload payment proof if exists (optional for UTANG)
      let paymentProofUrl = "";
      if (paymentProof) {
        const formData = new FormData();
        formData.append("file", paymentProof);
        formData.append("type", "payment"); // Private file
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        if (!uploadRes.ok) {
          showToast("Gagal upload bukti transfer", "error");
          setLoading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        paymentProofUrl = uploadData.path; // Use path for private files
      }

      // Validate payment for non-UTANG methods
      if (paymentMethod === "SEBAGIAN") {
        if (!paidAmount || Number(paidAmount) <= 0) {
          showToast("Mohon masukkan nominal pembayaran", "error");
          setLoading(false);
          return;
        }
        if (!paymentProof) {
          showToast("Mohon upload bukti transfer", "error");
          setLoading(false);
          return;
        }
      }

      if (paymentMethod === "LUNAS" && !paymentProof) {
        showToast("Mohon upload bukti transfer", "error");
        setLoading(false);
        return;
      }

      // Create order
      const orderData = {
        ...finalShippingData,
        paymentMethod,
        paymentProof: paymentProofUrl,
        paidAmount: paymentMethod === "SEBAGIAN" ? Number(paidAmount) : paymentMethod === "LUNAS" ? total : 0,
        subtotal,
        discount,
        total,
        remainingDebt,
        promoId: promoCode ? undefined : undefined, // TODO: Get promo ID from validation
        items: cart.map(item => ({
          productId: item.productId || null,
          packageId: item.packageId || null,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        clearCart();
        showToast("Pesanan berhasil dibuat!", "success");
        router.push("/pesanan");
      } else {
        const error = await res.json();
        showToast(error.error || "Gagal membuat pesanan", "error");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      showToast("Terjadi kesalahan. Silakan coba lagi.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <LoadingSpinner text="Memuat checkout..." />
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-cream">
        <Navbar />
        <div className="container mx-auto px-6 py-12 text-center">
          <p className="text-gray-600 mb-4">Keranjang kosong</p>
          <a href="/katalog" className="btn-primary inline-block">
            Mulai Belanja
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-arabic font-bold text-dark mb-6 md:mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Info */}
            <div className="card-3d p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl md:text-2xl font-arabic font-bold text-dark">Data Pengiriman</h2>
                {!useManualAddress && (
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="flex items-center space-x-2 text-primary hover:text-primary-dark text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Alamat</span>
                  </button>
                )}
              </div>
              
              {/* Toggle between saved addresses and manual input */}
              {addresses.length > 0 && (
                <div className="mb-4 flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => setUseManualAddress(false)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      !useManualAddress
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Pilih Alamat Tersimpan
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseManualAddress(true)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      useManualAddress
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Input Manual
                  </button>
                </div>
              )}

              {/* Saved Addresses Selection */}
              {!useManualAddress && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddressId === addr.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              addr.label === "Rumah"
                                ? "bg-blue-100 text-blue-700"
                                : addr.label === "Pesantren"
                                ? "bg-green-100 text-green-700"
                                : "bg-purple-100 text-purple-700"
                            }`}>
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="px-2 py-1 bg-accent/20 text-accent rounded text-xs font-bold">
                                UTAMA
                              </span>
                            )}
                          </div>
                          <p className="font-bold text-dark">{addr.recipientName}</p>
                          {addr.pesantrenName && (
                            <p className="text-sm text-accent font-semibold">{addr.pesantrenName}</p>
                          )}
                          <p className="text-sm text-gray-600 mt-1">{addr.phone}</p>
                          <p className="text-sm text-gray-700 mt-1">
                            {addr.address}, {addr.city}, {addr.province} {addr.postalCode}
                          </p>
                        </div>
                        {selectedAddressId === addr.id && (
                          <div className="ml-3">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : !useManualAddress && addresses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">Belum ada alamat tersimpan</p>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="btn-primary inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Tambah Alamat</span>
                  </button>
                </div>
              ) : (
                // Manual Input Form
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Nama Penerima *
                    </label>
                    <input
                      type="text"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Alamat Lengkap *
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="input-field"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        No. Telepon *
                      </label>
                      <input
                        type="tel"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Kota *
                      </label>
                      <input
                        type="text"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Provinsi *
                      </label>
                      <input
                        type="text"
                        value={shippingProvince}
                        onChange={(e) => setShippingProvince(e.target.value)}
                        className="input-field"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-dark mb-2">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        value={shippingPostal}
                        onChange={(e) => setShippingPostal(e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="card-3d p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-arabic font-bold text-dark mb-4">Metode Pembayaran</h2>
              
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="LUNAS"
                      checked={paymentMethod === "LUNAS"}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span>Lunas</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="SEBAGIAN"
                      checked={paymentMethod === "SEBAGIAN"}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span>Sebagian</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UTANG"
                      checked={paymentMethod === "UTANG"}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-4 h-4"
                    />
                    <span>Utang</span>
                  </label>
                </div>

                {paymentMethod === "SEBAGIAN" && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Nominal Dibayar *
                    </label>
                    <input
                      type="number"
                      value={paidAmount}
                      onChange={(e) => setPaidAmount(e.target.value)}
                      className="input-field"
                      placeholder="Masukkan nominal"
                      required
                    />
                  </div>
                )}

                {paymentMethod !== "UTANG" && (
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Upload Bukti Transfer *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="payment-proof"
                        required
                      />
                      <label htmlFor="payment-proof" className="cursor-pointer text-primary hover:underline">
                        {paymentProof ? paymentProof.name : "Pilih file"}
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
            <div className="card-3d p-4 md:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl md:text-2xl font-arabic font-bold text-dark mb-4">Ringkasan</h2>
              
              {/* Cart Items */}
              <div className="space-y-3 mb-4 border-b border-gray-200 pb-4">
                {cart.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-dark">
                      {item.name} x {item.quantity}
                    </span>
                    <span className="font-medium">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format((item.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-dark mb-2">
                  Kode Promo
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="input-field flex-1"
                    placeholder="Masukkan kode"
                  />
                  <button
                    type="button"
                    onClick={handlePromoValidation}
                    className="btn-accent"
                  >
                    Pakai
                  </button>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-200 pt-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(subtotal)}
                  </span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Diskon</span>
                    <span className="font-medium">
                      - {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        minimumFractionDigits: 0,
                      }).format(discount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold text-dark border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(total)}
                  </span>
                </div>

                {paymentMethod === "SEBAGIAN" && paidAmount && (
                  <>
                    <div className="flex justify-between text-green-600">
                      <span>Dibayar</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(Number(paidAmount))}
                      </span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Sisa Hutang</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(remainingDebt)}
                      </span>
                    </div>
                  </>
                )}

                {paymentMethod === "UTANG" && (
                  <div className="flex justify-between text-red-600">
                    <span>Total Hutang</span>
                    <span className="font-medium">Rp {remainingDebt.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary mt-6 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>Buat Pesanan</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  );
}