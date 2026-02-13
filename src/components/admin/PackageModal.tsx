"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, Upload } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import { deleteSupabaseFile } from "@/lib/supabase-helpers";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface PackageItem {
  productId: string;
  quantity: number;
}

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  packageData?: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string | null;
    isActive: boolean;
    packageitem: Array<{
      productId: string;
      quantity: number;
    }>;
  };
}

export default function PackageModal({ isOpen, onClose, onSuccess, packageData }: PackageModalProps) {
  const { showToast } = useToastContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    isActive: true,
  });
  const [items, setItems] = useState<PackageItem[]>([{ productId: "", quantity: 1 }]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      if (packageData) {
        setFormData({
          name: packageData.name,
          description: packageData.description || "",
          price: packageData.price.toString(),
          image: packageData.image || "",
          isActive: packageData.isActive,
        });
        setItems(packageData.packageitem.length > 0 
          ? packageData.packageitem 
          : [{ productId: "", quantity: 1 }]
        );
      } else {
        resetForm();
      }
    }
  }, [isOpen, packageData]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      isActive: true,
    });
    setItems([{ productId: "", quantity: 1 }]);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const oldImageUrl = formData.image; // Store old image URL BEFORE upload

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("type", "product"); // Package images are public

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!res.ok) {
        showToast("Gagal upload gambar", "error");
        setUploading(false);
        return;
      }

      const data = await res.json();
      const newImageUrl = data.url;
      
      setFormData(prev => ({ ...prev, image: newImageUrl }));
      showToast("Gambar berhasil diupload", "success");

      // Delete old image ONLY when:
      // 1. EDITING (packageData exists)
      // 2. Old image exists and is different from new image
      // 3. Old image is from Supabase
      if (packageData && oldImageUrl && oldImageUrl !== newImageUrl && oldImageUrl.includes('supabase.co')) {
        await deleteSupabaseFile(oldImageUrl);
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("Terjadi kesalahan saat upload", "error");
    } finally {
      setUploading(false);
    }
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof PackageItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi items
    const validItems = items.filter(item => item.productId && item.quantity > 0);
    if (validItems.length === 0) {
      showToast("Mohon tambahkan minimal 1 produk ke paket", "error");
      return;
    }

    setLoading(true);

    try {
      const url = packageData ? `/api/packages/${packageData.id}` : "/api/packages";
      const method = packageData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          items: validItems,
        }),
      });

      if (res.ok) {
        showToast(packageData ? "Paket berhasil diupdate" : "Paket berhasil ditambahkan", "success");
        onSuccess();
        onClose();
      } else {
        const errorData = await res.json();
        showToast(errorData.error || "Gagal menyimpan paket", "error");
      }
    } catch (error) {
      console.error("Error saving package:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-dark">
            {packageData ? "Edit Paket" : "Tambah Paket"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Nama Paket</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Harga Paket</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Gambar Paket</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="package-image-upload"
              />
              <label
                htmlFor="package-image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                {uploading ? (
                  <div className="text-primary">Mengupload...</div>
                ) : formData.image ? (
                  <div className="text-center">
                    <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Klik untuk ganti gambar</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm text-gray-600">Klik untuk upload gambar</span>
                  </>
                )}
              </label>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-dark">Isi Paket</label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center space-x-1 text-primary hover:text-primary/80 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Item</span>
              </button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <select
                    value={item.productId}
                    onChange={(e) => updateItem(index, "productId", e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    <option value="">Pilih Produk</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - Rp {product.price.toLocaleString('id-ID')}
                      </option>
                    ))}
                  </select>
                  
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value))}
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                    required
                  />
                  
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="isActive" className="text-sm text-dark">
              Paket Aktif
            </label>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-dark rounded-lg hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Menyimpan..." : packageData ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
