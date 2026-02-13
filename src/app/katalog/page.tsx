"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import { Search, X } from "lucide-react";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string | null;
  stock: number;
  isBestseller: boolean;
}

interface Package {
  id: string;
  name: string;
  price: number;
  image: string | null;
}

export default function KatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, packagesRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/packages")
      ]);
      
      const productsData = await productsRes.json();
      const packagesData = await packagesRes.json();
      
      setProducts(Array.isArray(productsData) ? productsData.filter((p: Product) => p.stock > 0) : []);
      setPackages(Array.isArray(packagesData) ? packagesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setProducts([]);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPackages = packages.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResults = filteredProducts.length + filteredPackages.length;

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-[#f5f4f1]">
        <Navbar />
        <div className="container mx-auto px-6 py-12">
          <LoadingSpinner text="Memuat katalog..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f4f1] relative">
      <Navbar />
      
      {/* Subtle Islamic Pattern Background - Top Only */}
      <div className="absolute top-0 left-0 right-0 h-64 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230f3d2e' fill-opacity='1'%3E%3Cpath d='M0 0h40v40H0V0zm40 40h40v40H40V40zm0-40h2l-2 2V0zm0 4l4-4h2l-6 6V4zm0 4l8-8h2L40 10V8zm0 4L52 0h2L40 14v-2zm0 4L56 0h2L40 18v-2zm0 4L60 0h2L40 22v-2zm0 4L64 0h2L40 26v-2zm0 4L68 0h2L40 30v-2zm0 4L72 0h2L40 34v-2zm0 4L76 0h2L40 38v-2zm0 4L80 0v2L42 40h-2zm4 0L80 4v2L46 40h-2zm4 0L80 8v2L50 40h-2zm4 0l28-28v2L54 40h-2zm4 0l24-24v2L58 40h-2zm4 0l20-20v2L62 40h-2zm4 0l16-16v2L66 40h-2zm4 0l12-12v2L70 40h-2zm4 0l8-8v2l-6 6h-2zm4 0l4-4v2l-2 2h-2z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <main className="container mx-auto px-4 md:px-6 py-10 md:py-16 max-w-[1280px] relative z-10">
        
        {/* Section Header - Premium Style */}
        <div className="mb-10">
          <div className="flex items-start space-x-4 mb-6">
            <div className="w-[3px] h-7 bg-gradient-to-b from-[#c6a548] to-[#c6a548]/50 rounded-full mt-1"></div>
            <div>
              <p className="text-sm text-[#6a6a6a] mb-1.5">Menampilkan {totalResults} Produk</p>
              <h1 className="text-4xl font-serif font-semibold text-[#1c1c1c] tracking-tight">Katalog Produk</h1>
            </div>
          </div>

          {/* Search Bar - Minimalist */}
          <div className="max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6a6a6a] group-focus-within:text-[#0f3d2e] transition-colors duration-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kitab..."
                className="w-full pl-14 pr-14 py-4 bg-white border border-[#e5e5e5] rounded-xl focus:border-[#0f3d2e] focus:ring-2 focus:ring-[#0f3d2e]/10 outline-none transition-all duration-300 text-[#1c1c1c] placeholder:text-[#6a6a6a]"
                style={{ letterSpacing: '0.3px' }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#6a6a6a] hover:text-[#1c1c1c] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Packages Grid - Show First */}
        {filteredPackages.length > 0 && (
          <section className="mb-16">
            <div className="flex items-start space-x-4 mb-8">
              <div className="w-[3px] h-7 bg-gradient-to-b from-[#c6a548] to-[#c6a548]/50 rounded-full mt-1"></div>
              <div>
                <h2 className="text-3xl font-serif font-semibold text-[#1c1c1c] tracking-tight">Paket Hemat</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredPackages.map((pkg, index) => (
                <div
                  key={pkg.id}
                  className="opacity-0 animate-fade-up"
                  style={{
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <ProductCard
                    id={pkg.id}
                    name={pkg.name}
                    price={Number(pkg.price)}
                    image={pkg.image || undefined}
                    stock={999}
                    type="package"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Products Grid - Show Second */}
        {filteredProducts.length > 0 && (
          <section className="mb-16">
            <div className="flex items-start space-x-4 mb-8">
              <div className="w-[3px] h-7 bg-gradient-to-b from-[#c6a548] to-[#c6a548]/50 rounded-full mt-1"></div>
              <div>
                <h2 className="text-3xl font-serif font-semibold text-[#1c1c1c] tracking-tight">Kitab Satuan</h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="opacity-0 animate-fade-up"
                  style={{
                    animationDelay: `${index * 80}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={Number(product.price)}
                    image={product.image || undefined}
                    stock={product.stock}
                    isBestseller={product.isBestseller}
                    type="product"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* No Results */}
        {filteredProducts.length === 0 && filteredPackages.length === 0 && (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-[#f0efec] rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-[#6a6a6a]/40" />
            </div>
            <h3 className="text-2xl font-serif font-semibold text-[#1c1c1c] mb-3">
              Tidak Ada Hasil
            </h3>
            <p className="text-[#6a6a6a] mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `Maaf, kami tidak menemukan produk yang cocok dengan "${searchQuery}"`
                : "Belum ada produk tersedia saat ini"
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-[#0f3d2e] text-white font-medium hover:bg-[#145c43] transition-all duration-300"
              >
                <X className="w-5 h-5" />
                <span>Hapus Pencarian</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
