import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Image from "next/image";
import AddToCartButtonDetail from "@/components/AddToCartButtonDetail";
import Navbar from "@/components/Navbar";

interface ProductDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="card-3d overflow-hidden">
            <div className="relative h-96 lg:h-[600px] bg-gray-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-9xl">📖</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex gap-3">
              {product.isBestseller && (
                <span className="px-4 py-2 bg-accent text-white rounded-full text-sm font-medium">
                  ⭐ Terlaris
                </span>
              )}
              {product.stock <= product.minStock && product.stock > 0 && (
                <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
                  Stok Terbatas
                </span>
              )}
              {product.stock === 0 && (
                <span className="px-4 py-2 bg-gray-500 text-white rounded-full text-sm font-medium">
                  Stok Habis
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-serif font-bold text-dark">
              {product.name}
            </h1>

            {/* Price */}
            <div className="card-3d p-6">
              <p className="text-sm text-gray-600 mb-2">Harga</p>
              <p className="text-4xl font-bold text-primary">
                Rp {Number(product.price).toLocaleString('id-ID')}
              </p>
            </div>

            {/* Stock Info */}
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Stok: {product.stock} unit</span>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="card-3d p-6">
                <h2 className="text-xl font-serif font-bold text-dark mb-4">
                  Deskripsi
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButtonDetail
              productId={product.id}
              productName={product.name}
              price={Number(product.price)}
              stock={product.stock}
              disabled={product.stock === 0}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
