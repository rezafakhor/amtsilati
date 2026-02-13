import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build where clause
    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(new Date(endDate).setHours(23, 59, 59, 999))
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            pesantrenName: true,
          }
        },
        orderitem: {
          include: {
            product: {
              select: {
                name: true,
                price: true,
              }
            },
            Renamedpackage: {
              select: {
                name: true,
                price: true,
              }
            }
          }
        },
        promo: {
          select: {
            code: true,
            discountType: true,
            discountValue: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform data for export
    const exportData = orders.flatMap(order => {
      // If order has items, create one row per item
      if (order.orderitem.length > 0) {
        return order.orderitem.map(item => ({
          'No. Order': order.orderNumber,
          'Tanggal': new Date(order.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          'Customer': order.user.name,
          'Email': order.user.email,
          'Pesantren': order.user.pesantrenName || '-',
          'Nama Item': item.product?.name || item.Renamedpackage?.name || '-',
          'Qty': item.quantity,
          'Harga Satuan': Number(item.price),
          'Subtotal Item': Number(item.price) * item.quantity,
          'Subtotal Order': Number(order.subtotal),
          'Diskon': Number(order.discount),
          'Total Order': Number(order.total),
          'Metode Bayar': order.paymentMethod,
          'Status Bayar': order.paymentStatus,
          'Dibayar': Number(order.paidAmount),
          'Sisa Hutang': Number(order.remainingDebt),
          'Status Order': order.status,
          'Kode Promo': order.promo?.code || '-',
          'Alamat Kirim': `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingProvince}`,
          'Penerima': order.shippingName,
          'No. HP': order.shippingPhone,
          'Metode Kirim': order.shippingMethod || '-',
          'No. Resi': order.trackingNumber || '-',
        }));
      } else {
        // If no items, create one row for the order
        return [{
          'No. Order': order.orderNumber,
          'Tanggal': new Date(order.createdAt).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          'Customer': order.user.name,
          'Email': order.user.email,
          'Pesantren': order.user.pesantrenName || '-',
          'Nama Item': '-',
          'Qty': 0,
          'Harga Satuan': 0,
          'Subtotal Item': 0,
          'Subtotal Order': Number(order.subtotal),
          'Diskon': Number(order.discount),
          'Total Order': Number(order.total),
          'Metode Bayar': order.paymentMethod,
          'Status Bayar': order.paymentStatus,
          'Dibayar': Number(order.paidAmount),
          'Sisa Hutang': Number(order.remainingDebt),
          'Status Order': order.status,
          'Kode Promo': order.promo?.code || '-',
          'Alamat Kirim': `${order.shippingAddress}, ${order.shippingCity}, ${order.shippingProvince}`,
          'Penerima': order.shippingName,
          'No. HP': order.shippingPhone,
          'Metode Kirim': order.shippingMethod || '-',
          'No. Resi': order.trackingNumber || '-',
        }];
      }
    });

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Error exporting orders:", error);
    return NextResponse.json(
      { error: "Failed to export orders" },
      { status: 500 }
    );
  }
}
