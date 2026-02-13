import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalOrders,
      pendingOrders,
      totalRevenue,
      monthlyRevenue,
      totalProducts,
      lowStockProducts,
      totalPartners,
      upcomingAgendas
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING_PAYMENT" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } }
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          status: { not: "CANCELLED" },
          createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth }
        }
      }),
      prisma.product.count(),
      prisma.product.count({
        where: {
          OR: [
            { stock: { lte: 5 } },
            { stock: { equals: 0 } }
          ]
        }
      }),
      prisma.partner.count({ where: { isActive: true } }),
      prisma.agenda.count({
        where: {
          isActive: true,
          eventDate: { gte: now }
        }
      })
    ]);

    return NextResponse.json({
      totalOrders,
      pendingOrders,
      monthlyRevenue: Number(monthlyRevenue._sum.total || 0),
      totalProducts,
      lowStockProducts,
      totalPartners,
      upcomingAgendas,
      totalRevenue: Number(totalRevenue._sum.total || 0)
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
