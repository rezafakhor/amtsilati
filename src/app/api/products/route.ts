import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const id = `PRD${Date.now()}`;
    const product = await prisma.product.create({
      data: {
        id,
        name: body.name,
        description: body.description,
        price: body.price,
        stock: body.stock || 0,
        minStock: body.minStock || 5,
        image: body.image,
        isBestseller: body.isBestseller || false,
        isActive: body.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
