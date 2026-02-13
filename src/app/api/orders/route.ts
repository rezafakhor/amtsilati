import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') as any;

    const where: any = session.user.role === "SUPERADMIN" 
      ? (statusFilter ? { status: statusFilter } : {})
      : (statusFilter ? { userId: session.user.id, status: statusFilter } : { userId: session.user.id });

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, pesantrenName: true } },
        orderitem: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Manually fetch product/package names for each orderitem
    const ordersWithNames = await Promise.all(
      orders.map(async (order) => {
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

        return {
          ...order,
          orderitem: itemsWithNames
        };
      })
    );
    
    console.log('Sample order with names:', ordersWithNames[0]?.orderitem[0]);
    
    return NextResponse.json(ordersWithNames);
  } catch (error) {
    console.error('Error in GET /api/orders:', error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    console.log("Creating order with data:", body);
    
    // Generate IDs
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const orderCount = await prisma.order.count();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;
    
    const order = await prisma.order.create({
      data: {
        id: orderId,
        orderNumber,
        userId: session.user.id,
        shippingName: body.shippingName,
        shippingAddress: body.shippingAddress,
        shippingPhone: body.shippingPhone,
        shippingCity: body.shippingCity,
        shippingProvince: body.shippingProvince,
        shippingPostal: body.shippingPostal || "",
        paymentMethod: body.paymentMethod,
        paymentProof: body.paymentProof || null,
        paidAmount: body.paidAmount || 0,
        subtotal: body.subtotal,
        discount: body.discount || 0,
        total: body.total,
        remainingDebt: body.remainingDebt || 0,
        promoId: body.promoId || null,
        updatedAt: new Date(),
        orderitem: {
          create: body.items.map((item: any) => ({
            id: `orderitem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId: item.productId || null,
            packageId: item.packageId || null,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        orderitem: true
      }
    });
    
    // Update stock
    for (const item of body.items) {
      if (item.productId) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            updatedAt: new Date()
          }
        });
      }
    }
    
    // Create debt if needed
    if (body.remainingDebt > 0) {
      const debtId = `debt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await prisma.debt.create({
        data: {
          id: debtId,
          userId: session.user.id,
          totalDebt: body.remainingDebt,
          remainingDebt: body.remainingDebt,
          paidAmount: 0,
          updatedAt: new Date()
        }
      });
    }
    
    console.log("Order created successfully:", order.id);
    return NextResponse.json(order);
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
