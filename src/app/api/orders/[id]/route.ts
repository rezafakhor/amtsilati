import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { name: true, email: true } },
        orderitem: true
      }
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (session.user.role !== "SUPERADMIN" && order.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Manually fetch product/package names for each orderitem
    const itemsWithNames = await Promise.all(
      order.orderitem.map(async (item) => {
        let productName = null;
        let productImage = null;
        let packageName = null;

        if (item.productId) {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: { name: true, image: true }
          });
          if (product) {
            productName = product.name;
            productImage = product.image;
          }
        }

        if (item.packageId) {
          const pkg = await prisma.renamedpackage.findUnique({
            where: { id: item.packageId },
            select: { name: true }
          });
          if (pkg) {
            packageName = pkg.name;
          }
        }

        return {
          ...item,
          product: productName ? { name: productName, image: productImage } : null,
          Renamedpackage: packageName ? { name: packageName } : null
        };
      })
    );

    const orderWithNames = {
      ...order,
      orderitem: itemsWithNames
    };

    console.log('Order detail - Sample item:', orderWithNames.orderitem[0]);

    return NextResponse.json(orderWithNames);
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
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
    
    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    if (body.status !== undefined) {
      updateData.status = body.status;
    }
    if (body.paymentStatus !== undefined) {
      updateData.paymentStatus = body.paymentStatus;
    }
    if (body.shippingMethod !== undefined) {
      updateData.shippingMethod = body.shippingMethod;
    }
    if (body.expeditionName !== undefined) {
      updateData.expeditionName = body.expeditionName;
    }
    if (body.packingPhoto !== undefined) {
      updateData.packingPhoto = body.packingPhoto;
    }
    if (body.trackingNumber !== undefined) {
      updateData.trackingNumber = body.trackingNumber;
    }
    if (body.trackingPhoto !== undefined) {
      updateData.trackingPhoto = body.trackingPhoto;
    }
    if (body.shippedAt !== undefined) {
      updateData.shippedAt = new Date(body.shippedAt);
    }
    
    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData
    });
    
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    // Check if order belongs to user
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id }
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (session.user.role !== "SUPERADMIN" && existingOrder.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date()
    };

    // User can update payment proof
    if (body.paymentProof !== undefined) {
      updateData.paymentProof = body.paymentProof;
    }

    // Admin can update status
    if (body.status !== undefined && session.user.role === "SUPERADMIN") {
      updateData.status = body.status;
      
      // Set shippedAt when status changes to SHIPPED
      if (body.status === 'SHIPPED' && !existingOrder.shippedAt) {
        updateData.shippedAt = new Date();
      }

      // Update payment status when order is verified (PROCESSING)
      if (body.status === 'PROCESSING' && existingOrder.paymentMethod === 'LUNAS') {
        updateData.paymentStatus = 'PAID';
      }
    }

    // Update order
    const order = await prisma.order.update({
      where: { id: params.id },
      data: updateData
    });
    
    return NextResponse.json(order);
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
