"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import PackageModal from "@/components/admin/PackageModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToast } from "@/hooks/useToast";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string | null;
  isActive: boolean;
  packageitem: Array<{
    productId: string;
    product: {
      name: string;
    };
    quantity: number;
  }>;
}

export default function PaketPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | undefined>();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/packages");
      const data = await res.json();
      setPackages(data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedPackage(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (pkg: Package) => {
    setSelectedPackage(pkg);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await fetch(`/api/packages/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Paket berhasil dihapus", "success");
        fetchPackages();
      } else {
        showToast("Gagal menghapus paket", "error");
      }
    } catch (error) {
      console.error("Error deleting package:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setDeleteId(null);
    }
  };

  const handleSuccess = () => {
    showToast(
      selectedPackage ? "Paket berhasil diupdate" : "Paket berhasil ditambahkan",
      "success"
    );
    fetchPackages();
  };

  if (loading) {
    return <div className="text-center py-12">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Paket</h1>
          <p className="text-sm text-[#6a6a6a]">Kelola paket bundle kitab</p>
        </div>
        <button 
          onClick={handleAdd} 
          className="h-11 px-5 bg-[#0f3d2e] text-white rounded-xl text-sm font-medium hover:bg-[#145c43] transition-all duration-200 flex items-center space-x-2 shadow-[0_4px_12px_rgba(15,61,46,0.2)]"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
          <span>Tambah Paket</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f4f1] border-b border-[#eceae7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Nama Paket</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Isi Paket</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Harga</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceae7]">
              {packages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-[#f5f4f1]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#1c1c1c] text-sm">{pkg.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-[#6a6a6a] space-y-1">
                      {pkg.packageitem.map((item, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#c6a548]"></span>
                          <span>{item.product.name} × {item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#1c1c1c] font-semibold text-sm">
                    Rp {Number(pkg.price).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pkg.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {pkg.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEdit(pkg)}
                        className="p-2 text-[#0f3d2e] hover:bg-[#0f3d2e]/10 rounded-[10px] transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                      <button 
                        onClick={() => setDeleteId(pkg.id)}
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
          
          {packages.length === 0 && (
            <div className="text-center py-16 text-[#6a6a6a]">
              <div className="w-16 h-16 bg-[#f5f4f1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-[#6a6a6a]" />
              </div>
              <p className="text-sm">Belum ada paket</p>
              <p className="text-xs mt-1">Klik tombol &quot;Tambah Paket&quot; untuk memulai</p>
            </div>
          )}
        </div>
      </div>

      <PackageModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
        packageData={selectedPackage}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Hapus Paket"
        message="Apakah Anda yakin ingin menghapus paket ini?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
