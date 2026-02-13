"use client";

import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";
import { Package2 } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock: number;
  isBestseller?: boolean;
  type: "product" | "package";
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  stock,
  isBestseller = false,
  type
}: ProductCardProps) {
  const productUrl = type === "product" ? `/produk/${id}` : `/paket/${id}`;

  return (
    <div className="group bg-white rounded-[18px] overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_18px_45px_rgba(0,0,0,0.10)] transition-all duration-300 ease-out hover:-translate-y-1.5">
      {/* Image Area - 4:5 Aspect Ratio */}
      <Link href={productUrl} className="block relative aspect-[4/5] bg-[#f0efec] overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] p-4"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package2 className="w-16 h-16 text-[#6a6a6a]/35" strokeWidth={1.5} />
            {/* Subtle radial light */}
            <div className="absolute inset-0 bg-gradient-radial from-white/40 via-transparent to-transparent opacity-40"></div>
          </div>
        )}
        
        {/* Bestseller Badge */}
        {isBestseller && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-[#c6a548] text-white text-xs font-semibold rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.15)]" style={{ letterSpacing: '0.5px' }}>
            TERLARIS
          </div>
        )}
      </Link>

      {/* Content Area */}
      <div className="p-5">
        {/* Title */}
        <Link href={productUrl}>
          <h3 className="font-serif text-lg leading-[1.4] text-[#1c1c1c] mb-4 line-clamp-2 min-h-[3.5rem] group-hover:text-[#0f3d2e] transition-colors duration-300">
            {name}
          </h3>
        </Link>

        {/* Divider */}
        <div className="h-px bg-[#eeeeee] mb-4"></div>

        {/* Price & Stock Section */}
        <div className="flex justify-between items-end mb-4">
          {/* Price */}
          <div>
            <p className="text-xs text-[#6a6a6a] mb-1" style={{ letterSpacing: '0.3px' }}>Harga</p>
            <p className="text-2xl font-bold text-[#0f3d2e]">
              {new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
                minimumFractionDigits: 0,
              }).format(price)}
            </p>
          </div>

          {/* Stock */}
          <div className="text-right">
            <p className="text-xs text-[#6a6a6a] mb-1" style={{ letterSpacing: '0.3px' }}>Stok</p>
            <p className="text-base font-medium text-[#145c43]">{stock} unit</p>
          </div>
        </div>

        {/* CTA Button */}
        <AddToCartButton
          productId={type === "product" ? id : undefined}
          packageId={type === "package" ? id : undefined}
          stock={stock}
          className="w-full h-11 rounded-xl bg-gradient-to-br from-[#0f3d2e] to-[#145c43] text-white font-semibold text-sm flex items-center justify-center space-x-2 shadow-[0_6px_18px_rgba(0,0,0,0.15)] hover:from-[#145c43] hover:to-[#1a6b52] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.20)] active:translate-y-0 active:shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] transition-all duration-300 ease-out disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          style={{ letterSpacing: '0.5px' }}
        />
      </div>
    </div>
  );
}
