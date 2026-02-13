import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const packages = await prisma.renamedpackage.findMany({
      include: {
        packageitem: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json(
      { error: "Failed to fetch packages" },
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
    console.log("Create package body:", body);
    
    // Validate required fields
    if (!body.name || !body.price) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }
    
    // Generate ID
    const id = `PKG${Date.now()}`;
    
    const pkg = await prisma.renamedpackage.create({
      data: {
        id,
        name: body.name,
        description: body.description || "",
        price: Number(body.price),
        image: body.image || null,
        isActive: body.isActive !== false,
      },
      include: {
        packageitem: {
          include: {
            product: true
          }
        }
      }
    });

    // Create package items separately
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
      where: { id: pkg.id },
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
    console.error("Error creating package:", error);
    return NextResponse.json(
      { error: `Failed to create package: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
