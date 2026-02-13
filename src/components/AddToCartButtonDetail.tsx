"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface AddToCartButtonDetailProps {
  productId?: string;
  packageId?: string;
  productName: string;
  price: number;
  stock: number;
  disabled?: boolean;
}

export default function AddToCartButtonDetail({
  productId,
  packageId,
  productName,
  price,
  stock,
  disabled = false,
}: AddToCartButtonDetailProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    setLoading(true);

    // Get existing cart from localStorage
    const cartStr = localStorage.getItem("cart");
    const cart = cartStr ? JSON.parse(cartStr) : [];

    const itemId = productId || packageId;
    const itemType = productId ? "product" : "package";

    // Check if item already in cart
    const existingIndex = cart.findIndex((item: any) => 
      (item.productId === productId && productId) || 
      (item.packageId === packageId && packageId)
    );

    if (existingIndex >= 0) {
      // Update quantity
      cart[existingIndex].quantity += quantity;
    } else {
      // Add new item with correct structure
      cart.push({
        id: itemId,
        quantity: quantity,
        type: itemType,
        productId: productId || null,
        packageId: packageId || null,
      });
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Show success toast
    showToast(`${productName} (${quantity}x) berhasil ditambahkan ke keranjang!`, "cart");

    // Show checkmark animation
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);

    // Dispatch event to update cart badge
    window.dispatchEvent(new Event("cartUpdated"));

    setLoading(false);
  };

  const incrementQuantity = () => {
    if (quantity < stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const totalPrice = price * quantity;

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="card-3d p-6">
        <p className="text-sm text-gray-600 mb-3">Jumlah</p>
        <div className="flex items-center space-x-4">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>
          <span className="text-2xl font-bold text-dark w-16 text-center">
            {quantity}
          </span>
          <button
            onClick={incrementQuantity}
            disabled={quantity >= stock}
            className="w-12 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Total Price */}
      <div className="card-3d p-6 bg-primary/5">
        <p className="text-sm text-gray-600 mb-2">Total Harga</p>
        <p className="text-3xl font-bold text-primary">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(totalPrice)}
        </p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={disabled || loading}
        className={`w-full flex items-center justify-center space-x-3 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${
          justAdded 
            ? "bg-green-600 hover:bg-green-700 rounded-xl" 
            : "btn-primary"
        }`}
      >
        {justAdded ? (
          <>
            <Check className="w-6 h-6" />
            <span>Ditambahkan!</span>
          </>
        ) : (
          <>
            <ShoppingCart className="w-6 h-6" />
            <span>{loading ? "Menambahkan..." : disabled ? "Stok Habis" : "Tambah ke Keranjang"}</span>
          </>
        )}
      </button>

      {/* Buy Now Button */}
      <button
        onClick={() => {
          handleAddToCart();
          setTimeout(() => router.push("/checkout"), 500);
        }}
        disabled={disabled || loading}
        className="w-full btn-accent flex items-center justify-center space-x-3 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span>{disabled ? "Stok Habis" : "Beli Sekarang"}</span>
      </button>
    </div>
  );
}
