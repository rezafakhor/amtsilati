import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get all addresses for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}

// POST - Create new address
export async function POST(req: NextRequest) {
  try {
    console.log("=== POST /api/addresses START ===");
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Received address data:", JSON.stringify(body, null, 2));
    
    const { label, recipientName, pesantrenName, phone, address, city, province, postalCode, isDefault } = body;

    // Validate required fields
    if (!label || !recipientName || !phone || !address || !city || !province) {
      console.log("Validation failed:", { label, recipientName, phone, address, city, province });
      return NextResponse.json({ 
        error: "Missing required fields",
        missing: {
          label: !label,
          recipientName: !recipientName,
          phone: !phone,
          address: !address,
          city: !city,
          province: !province
        }
      }, { status: 400 });
    }

    console.log("Validation passed, checking for default address...");

    // If setting as default, unset other defaults
    if (isDefault) {
      console.log("Unsetting other default addresses...");
      await prisma.address.updateMany({
        where: { 
          userId: session.user.id,
          isDefault: true
        },
        data: { isDefault: false, updatedAt: new Date() }
      });
      console.log("Other defaults unset");
    }

    // Generate unique ID
    const addressId = `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log("Generated ID:", addressId);

    console.log("Creating address in database...");
    const newAddress = await prisma.address.create({
      data: {
        id: addressId,
        userId: session.user.id,
        label,
        recipientName,
        pesantrenName: pesantrenName || null,
        phone,
        address,
        city,
        province,
        postalCode: postalCode || null,
        isDefault: isDefault || false,
        updatedAt: new Date()
      }
    });

    console.log("Address created successfully:", newAddress.id);
    console.log("=== POST /api/addresses SUCCESS ===");
    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("=== POST /api/addresses ERROR ===");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Full error:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json({ 
      error: "Failed to create address",
      details: error instanceof Error ? error.message : "Unknown error",
      type: error?.constructor?.name
    }, { status: 500 });
  }
}
