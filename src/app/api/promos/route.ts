import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const promos = await prisma.promo.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(promos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch promos" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    const promo = await prisma.promo.create({
      data: {
        code: body.code.toUpperCase(),
        discountType: body.discountType,
        discountValue: body.discountValue,
        maxUsage: body.maxUsage,
        isActive: body.isActive !== false,
        validFrom: body.validFrom ? new Date(body.validFrom) : null,
        validUntil: body.validUntil ? new Date(body.validUntil) : null,
      }
    });
    
    return NextResponse.json(promo);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create promo" },
      { status: 500 }
    );
  }
}
