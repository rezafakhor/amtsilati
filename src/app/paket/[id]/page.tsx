import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import AddToCartButtonDetail from "@/components/AddToCartButtonDetail";
import { Package2 } from "lucide-react";

interface PackageDetailPageProps {
  params: {
    id: string;
  };
}

export default async function PackageDetailPage({ params }: PackageDetailPageProps) {
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
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Package Image */}
          <div className="card-3d overflow-hidden">
            <div className="relative h-96 lg:h-[600px] bg-gray-100">
              {pkg.image ? (
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package2 className="w-32 h-32 text-gray-300" />
                </div>
              )}
            </div>
          </div>

          {/* Package Info */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="flex gap-3">
              <span className="px-4 py-2 bg-primary text-white rounded-full text-sm font-medium">
                📦 Paket Hemat
              </span>
              {!pkg.isActive && (
                <span className="px-4 py-2 bg-gray-500 text-white rounded-full text-sm font-medium">
                  Tidak Aktif
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-dark">
              {pkg.name}
            </h1>

            {/* Price */}
            <div className="card-3d p-6">
              <p className="text-sm text-gray-600 mb-2">Harga Paket</p>
              <p className="text-4xl font-bold text-primary">
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(Number(pkg.price))}
              </p>
            </div>

            {/* Package Contents */}
            <div className="card-3d p-6">
              <h2 className="text-xl font-serif font-bold text-dark mb-4">
                Isi Paket
              </h2>
              <div className="space-y-3">
                {pkg.packageitem.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-dark">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(Number(item.product.price))}
                      </p>
                    </div>
                    <span className="text-primary font-semibold">{item.quantity}x</span>
                  </div>
                ))}
              </div>
              
              {/* Total if bought separately */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Jika beli terpisah:</span>
                  <span className="line-through">
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      pkg.packageitem.reduce(
                        (sum, item) => sum + Number(item.product.price) * item.quantity,
                        0
                      )
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600 mt-2">
                  <span>Hemat:</span>
                  <span>
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      minimumFractionDigits: 0,
                    }).format(
                      pkg.packageitem.reduce(
                        (sum, item) => sum + Number(item.product.price) * item.quantity,
                        0
                      ) - Number(pkg.price)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {pkg.description && (
              <div className="card-3d p-6">
                <h2 className="text-xl font-serif font-bold text-dark mb-4">
                  Deskripsi
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {pkg.description}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButtonDetail
              packageId={pkg.id}
              productName={pkg.name}
              price={Number(pkg.price)}
              stock={999}
              disabled={!pkg.isActive}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
