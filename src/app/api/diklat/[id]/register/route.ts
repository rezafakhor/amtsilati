import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    
    const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const registration = await prisma.diklatregistration.create({
      data: {
        id: registrationId,
        diklatId: params.id,
        userId: session?.user?.id || null,
        name: body.name,
        email: body.email,
        phone: body.phone,
        formData: JSON.stringify(body.formData),
        status: 'PENDING'
      }
    });
    
    return NextResponse.json(registration);
  } catch (error) {
    console.error("Failed to create registration:", error);
    return NextResponse.json(
      { error: "Failed to create registration" },
      { status: 500 }
    );
  }
}
