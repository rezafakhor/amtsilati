"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Check } from "lucide-react";
import { useToast } from "@/hooks/useToast";

interface AddToCartButtonProps {
  productId?: string;
  packageId?: string;
  stock: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function AddToCartButton({
  productId,
  packageId,
  stock,
  className = "",
  style = {}
}: AddToCartButtonProps) {
  const router = useRouter();
  const { showToast } = useToast();
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
      cart[existingIndex].quantity += 1;
    } else {
      // Add new item with correct structure
      cart.push({
        id: itemId,
        quantity: 1,
        type: itemType,
        productId: productId || null,
        packageId: packageId || null,
      });
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(cart));

    // Show success toast
    showToast("Berhasil ditambahkan ke keranjang!", "cart");

    // Show checkmark animation
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);

    // Dispatch event to update cart badge
    window.dispatchEvent(new Event("cartUpdated"));

    setLoading(false);
  };

  const disabled = stock <= 0;

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || loading}
      className={className}
      style={style}
    >
      {justAdded ? (
        <>
          <Check className="w-5 h-5" />
          <span>Ditambahkan!</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          <span>{loading ? "..." : disabled ? "Stok Habis" : "Tambah ke Keranjang"}</span>
        </>
      )}
    </button>
  );
}
