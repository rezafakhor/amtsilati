import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { debtId, amount, paymentProof, notes } = body;

    if (!debtId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid payment data" },
        { status: 400 }
      );
    }

    // Get debt
    const debt = await prisma.debt.findUnique({
      where: { id: debtId }
    });

    if (!debt) {
      return NextResponse.json(
        { error: "Debt not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (session.user.role !== "SUPERADMIN" && debt.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if payment amount is valid
    if (amount > debt.remainingDebt) {
      return NextResponse.json(
        { error: "Payment amount exceeds remaining debt" },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.debtpayment.create({
      data: {
        debtId,
        userId: debt.userId,
        amount,
        paymentProof,
        notes
      }
    });

    // Update debt
    const newPaidAmount = Number(debt.paidAmount) + Number(amount);
    const newRemainingDebt = Number(debt.totalDebt) - newPaidAmount;

    await prisma.debt.update({
      where: { id: debtId },
      data: {
        paidAmount: newPaidAmount,
        remainingDebt: newRemainingDebt
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    );
  }
}
