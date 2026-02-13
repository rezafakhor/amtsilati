import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const diklatCount = await prisma.diklat.count();
    
    return NextResponse.json({
      success: true,
      message: "Database connected successfully!",
      data: {
        users: userCount,
        products: productCount,
        diklat: diklatCount,
      },
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
      }
    });
  } catch (error: any) {
    console.error("Database connection error:", error);
    return NextResponse.json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
      }
    }, { status: 500 });
  }
}
