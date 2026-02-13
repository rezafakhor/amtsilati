import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const diklat = await prisma.diklat.findUnique({
      where: { id: params.id },
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
      }
    });

    if (!diklat) {
      return NextResponse.json(
        { error: "Diklat not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(diklat);
  } catch (error) {
    console.error("Error fetching diklat:", error);
    return NextResponse.json(
      { error: "Failed to fetch diklat" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Delete existing dates and form fields
    await prisma.diklatdate.deleteMany({
      where: { diklatId: params.id }
    });
    
    await prisma.diklatformfield.deleteMany({
      where: { diklatId: params.id }
    });
    
    // Update diklat with new data
    const diklat = await prisma.diklat.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        method: body.method,
        registrationLink: body.registrationLink,
        image: body.image,
        isActive: body.isActive,
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
    console.error("Error updating diklat:", error);
    return NextResponse.json(
      { error: "Failed to update diklat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.diklat.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting diklat:", error);
    return NextResponse.json(
      { error: "Failed to delete diklat" },
      { status: 500 }
    );
  }
}
