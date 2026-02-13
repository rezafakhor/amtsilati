import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const diklats = await prisma.diklat.findMany({
      include: {
        diklatdate: {
          orderBy: { startDate: 'asc' }
        },
        diklatformfield: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: { diklatregistration: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(diklats);
  } catch (error) {
    console.error("Error fetching diklat:", error);
    return NextResponse.json(
      { error: "Failed to fetch diklat" },
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
    const diklatId = `diklat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const diklat = await prisma.diklat.create({
      data: {
        id: diklatId,
        title: body.title,
        description: body.description,
        location: body.location,
        method: body.method,
        registrationLink: body.registrationLink,
        image: body.image,
        isActive: body.isActive ?? true,
        updatedAt: new Date(),
        diklatdate: {
          create: body.dates.map((date: any) => ({
            id: `diklatdate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            startDate: new Date(date.startDate),
            endDate: new Date(date.endDate)
          }))
        },
        diklatformfield: {
          create: body.formFields?.map((field: any, index: number) => ({
            id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            label: field.label,
            fieldType: field.fieldType,
            options: field.options ? JSON.stringify(field.options) : null,
            isRequired: field.isRequired ?? false,
            placeholder: field.placeholder,
            order: index
          })) || []
        }
      },
      include: {
        diklatdate: true,
        diklatformfield: true
      }
    });
    
    return NextResponse.json(diklat);
  } catch (error) {
    console.error("Failed to create diklat:", error);
    return NextResponse.json(
      { error: "Failed to create diklat" },
      { status: 500 }
    );
  }
}
