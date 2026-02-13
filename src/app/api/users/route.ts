import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        pesantrenName: true,
        phone: true,
        city: true,
        province: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch users" },
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
    
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(body.password, 10);
    
    // Generate ID
    const userId = `USR${Date.now()}`;
    const now = new Date();
    
    const user = await prisma.user.create({
      data: {
        id: userId,
        email: body.email,
        password: hashedPassword,
        name: body.name,
        role: body.role || "USER",
        pesantrenName: body.pesantrenName,
        address: body.address,
        phone: body.phone,
        city: body.city,
        province: body.province,
        postalCode: body.postalCode,
        updatedAt: now,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        pesantrenName: true,
        phone: true,
        city: true,
        province: true,
        createdAt: true,
      }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
