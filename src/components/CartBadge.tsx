"use client";

import { useEffect, useState } from "react";
import { getCartCount } from "@/lib/cart";

export default function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial count
    setCount(getCartCount());

    // Listen for cart updates
    const handleCartUpdate = () => {
      setCount(getCartCount());
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  if (count === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  );
}
