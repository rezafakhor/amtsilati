import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where = session.user.role === "SUPERADMIN" 
      ? { remainingDebt: { gt: 0 } }
      : { userId: session.user.id, remainingDebt: { gt: 0 } };

    const debts = await prisma.debt.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            pesantrenName: true,
            email: true
          }
        },
        debtpayment: {
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(debts);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch debts" },
      { status: 500 }
    );
  }
}
