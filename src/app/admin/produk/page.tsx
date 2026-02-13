"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import ProductModal from "@/components/admin/ProductModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import Toast from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  image: string | null;
  isBestseller: boolean;
  isActive: boolean;
}

export default function ProdukPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; product: Product | null }>({
    isOpen: false,
    product: null,
  });
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info"; show: boolean }>({
    message: "",
    type: "info",
    show: false,
  });

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
      showToast("Gagal memuat produk", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type, show: true });
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedProduct(null);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteDialog.product) return;

    try {
      const res = await fetch(`/api/products/${deleteDialog.product.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Produk berhasil dihapus", "success");
        fetchProducts();
      } else {
        showToast("Gagal menghapus produk", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner text="Memuat produk..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchProducts();
          showToast(selectedProduct ? "Produk berhasil diupdate" : "Produk berhasil ditambahkan", "success");
        }}
        product={selectedProduct}
      />

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, product: null })}
        onConfirm={handleDelete}
        title="Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus "${deleteDialog.product?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        type="danger"
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Produk</h1>
          <p className="text-sm text-[#6a6a6a]">Kelola kitab satuan</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="h-11 px-5 bg-[#0f3d2e] text-white rounded-xl text-sm font-medium hover:bg-[#145c43] transition-all duration-200 flex items-center space-x-2 shadow-[0_4px_12px_rgba(15,61,46,0.2)]"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
          <span>Tambah Produk</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f4f1] border-b border-[#eceae7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Gambar</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Nama Produk</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Harga</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Stok</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceae7]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#f5f4f1]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="w-14 h-14 relative bg-[#f5f4f1] rounded-[12px] overflow-hidden border border-[#eceae7]">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">📖</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#1c1c1c] text-sm">{product.name}</p>
                    {product.isBestseller && (
                      <span className="inline-flex items-center text-xs text-[#c6a548] mt-1">
                        <span className="mr-1">⭐</span> Terlaris
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#1c1c1c] font-semibold text-sm">
                    Rp {product.price.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold text-sm ${
                      product.stock <= product.minStock ? 'text-[#b76e6e]' : 'text-[#1c1c1c]'
                    }`}>
                      {product.stock}
                    </span>
                    {product.stock <= product.minStock && (
                      <span className="block text-xs text-[#b76e6e] mt-0.5">Stok rendah</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      product.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {product.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-[#0f3d2e] hover:bg-[#0f3d2e]/10 rounded-[10px] transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setDeleteDialog({ isOpen: true, product })}
                        className="p-2 text-[#b76e6e] hover:bg-[#b76e6e]/10 rounded-[10px] transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {products.length === 0 && (
            <div className="text-center py-16 text-[#6a6a6a]">
              <div className="w-16 h-16 bg-[#f5f4f1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-[#6a6a6a]" />
              </div>
              <p className="text-sm">Belum ada produk</p>
              <p className="text-xs mt-1">Klik tombol "Tambah Produk" untuk memulai</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
