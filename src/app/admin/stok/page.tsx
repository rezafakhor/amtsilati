"use client";

import { useState, useEffect } from "react";
import { Package, TrendingUp, TrendingDown } from "lucide-react";

interface Product {
  id: string;
  name: string;
  stock: number;
  minStock: number;
}

export default function StokPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  if (loading) {
    return <div className="text-center py-12">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Stok Opname</h1>
        <p className="text-sm text-[#6a6a6a]">Kelola dan pantau stok produk</p>
      </div>

      {/* Alert Stok Kritis */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-br from-[#b76e6e]/10 to-[#b76e6e]/5 rounded-[18px] p-6 border-l-4 border-[#b76e6e] shadow-[0_6px_20px_rgba(183,110,110,0.1)]">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-[#b76e6e]/10 rounded-[14px] flex-shrink-0">
              <Package className="w-6 h-6 text-[#b76e6e]" strokeWidth={1.5} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[#b76e6e] text-base mb-2">
                Peringatan Stok Kritis
              </h3>
              <p className="text-[#b76e6e]/80 text-sm mb-3">
                {lowStockProducts.length} produk memiliki stok di bawah minimum
              </p>
              <div className="space-y-1.5">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="text-sm text-[#b76e6e]/90 flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b76e6e]"></span>
                    <span>{product.name}: <span className="font-semibold">{product.stock}</span> unit (min: {product.minStock})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f4f1] border-b border-[#eceae7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Produk</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Stok Saat Ini</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Stok Minimum</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceae7]">
              {products.map((product) => {
                const isLowStock = product.stock <= product.minStock;
                const stockPercentage = (product.stock / product.minStock) * 100;
                
                return (
                  <tr key={product.id} className="hover:bg-[#f5f4f1]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#1c1c1c] text-sm">{product.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline space-x-2">
                        <span className={`text-2xl font-bold ${
                          isLowStock ? 'text-[#b76e6e]' : 'text-[#0f3d2e]'
                        }`}>
                          {product.stock}
                        </span>
                        <span className="text-[#6a6a6a] text-sm">unit</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[#1c1c1c] text-sm">
                      {product.minStock} unit
                    </td>
                    <td className="px-6 py-4">
                      {isLowStock ? (
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-[#b76e6e]/10 rounded-[8px]">
                            <TrendingDown className="w-4 h-4 text-[#b76e6e]" strokeWidth={1.5} />
                          </div>
                          <span className="font-medium text-[#b76e6e] text-sm">Stok Kritis</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 bg-emerald-50 rounded-[8px]">
                            <TrendingUp className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                          </div>
                          <span className="font-medium text-emerald-600 text-sm">Stok Aman</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button className="h-9 px-4 bg-[#0f3d2e] text-white rounded-[10px] text-sm font-medium hover:bg-[#145c43] transition-all duration-200">
                        Update Stok
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
