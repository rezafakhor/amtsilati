import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";

export async function GET() {
  try {
    const partners = await prisma.partner.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        joinedDate: 'desc'
      }
    });

    return NextResponse.json(partners);
  } catch (error) {
    console.error("Error fetching partners:", error);
    return NextResponse.json(
      { error: "Failed to fetch partners" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pesantrenName, city, province, logo, description, joinedDate } = body;

    const partner = await prisma.partner.create({
      data: {
        id: nanoid(),
        pesantrenName,
        city,
        province,
        logo,
        description,
        joinedDate: new Date(joinedDate),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error creating partner:", error);
    return NextResponse.json(
      { error: "Failed to create partner" },
      { status: 500 }
    );
  }
}
