import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const pkg = await prisma.renamedpackage.findUnique({
      where: { id: params.id },
      include: {
        packageitem: {
          include: {
            product: true
          }
        }
      }
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json(
      { error: "Failed to fetch package" },
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
    console.log("Update package body:", body);
    
    // Validate required fields
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }

    // Delete existing items
    await prisma.packageitem.deleteMany({
      where: { packageId: params.id }
    });
    
    // Update package
    const pkg = await prisma.renamedpackage.update({
      where: { id: params.id },
      data: {
        name: body.name,
        description: body.description || "",
        price: Number(body.price),
        image: body.image || null,
        isActive: body.isActive !== undefined ? body.isActive : true,
        updatedAt: new Date(),
      },
      include: {
        packageitem: {
          include: {
            product: true
          }
        }
      }
    });

    // Create new items
    if (body.items && Array.isArray(body.items) && body.items.length > 0) {
      for (const item of body.items) {
        if (item.productId && item.quantity > 0) {
          const itemId = `PKI${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
          await prisma.packageitem.create({
            data: {
              id: itemId,
              packageId: pkg.id,
              productId: item.productId,
              quantity: Number(item.quantity),
            }
          });
        }
      }
    }
    
    // Fetch the complete package with items
    const completePackage = await prisma.renamedpackage.findUnique({
      where: { id: params.id },
      include: {
        packageitem: {
          include: {
            product: true
          }
        }
      }
    });
    
    return NextResponse.json(completePackage);
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { error: `Failed to update package: ${error instanceof Error ? error.message : 'Unknown error'}` },
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

    await prisma.renamedpackage.delete({
      where: { id: params.id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}
