import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { code, subtotal } = await request.json();

    if (!code) {
      return NextResponse.json(
        { valid: false, message: "Kode promo harus diisi" },
        { status: 200 }
      );
    }

    const promo = await prisma.promo.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!promo) {
      return NextResponse.json(
        { valid: false, message: "Kode promo tidak ditemukan" },
        { status: 200 }
      );
    }

    if (!promo.isActive) {
      return NextResponse.json(
        { valid: false, message: "Kode promo tidak aktif" },
        { status: 200 }
      );
    }

    if (promo.maxUsage && promo.usedCount >= promo.maxUsage) {
      return NextResponse.json(
        { valid: false, message: "Kode promo sudah mencapai batas penggunaan" },
        { status: 200 }
      );
    }

    if (promo.validFrom && new Date(promo.validFrom) > new Date()) {
      return NextResponse.json(
        { valid: false, message: "Kode promo belum berlaku" },
        { status: 200 }
      );
    }

    if (promo.validUntil && new Date(promo.validUntil) < new Date()) {
      return NextResponse.json(
        { valid: false, message: "Kode promo sudah kadaluarsa" },
        { status: 200 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (promo.discountType === "PERCENTAGE") {
      discount = (subtotal * Number(promo.discountValue)) / 100;
    } else {
      discount = Number(promo.discountValue);
    }

    // Make sure discount doesn't exceed subtotal
    discount = Math.min(discount, subtotal);

    return NextResponse.json({
      valid: true,
      discount,
      promo: {
        id: promo.id,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: Number(promo.discountValue)
      }
    });
  } catch (error) {
    console.error("Promo validation error:", error);
    return NextResponse.json(
      { valid: false, message: "Gagal memvalidasi kode promo" },
      { status: 200 }
    );
  }
}
