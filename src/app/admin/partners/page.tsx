"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Partner {
  id: string;
  pesantrenName: string;
  city: string;
  province: string;
  logo: string | null;
  description: string | null;
  joinedDate: string;
  isActive: boolean;
}

export default function PartnersPage() {
  const { showToast } = useToastContext();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const res = await fetch("/api/partners");
      const data = await res.json();
      setPartners(data);
    } catch (error) {
      console.error("Error fetching partners:", error);
      showToast("Gagal memuat partners", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const res = await fetch(`/api/partners/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Partner berhasil dihapus", "success");
        fetchPartners();
      } else {
        showToast("Gagal menghapus partner", "error");
      }
    } catch (error) {
      console.error("Error deleting partner:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Mitra Pesantren</h1>
          <p className="text-sm text-[#6a6a6a]">Kelola pesantren mitra</p>
        </div>
        <button 
          onClick={() => window.location.href = '/admin/partners/create'}
          className="h-11 px-5 bg-[#0f3d2e] text-white rounded-xl text-sm font-medium hover:bg-[#145c43] transition-all duration-200 flex items-center space-x-2 shadow-[0_4px_12px_rgba(15,61,46,0.2)]"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
          <span>Tambah Mitra</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {partners.map((partner) => (
          <div key={partner.id} className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] p-6 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 bg-[#f5f4f1] rounded-full flex items-center justify-center">
                {partner.logo ? (
                  <img src={partner.logo} alt={partner.pesantrenName} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <Building2 className="w-8 h-8 text-[#0f3d2e]" />
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                partner.isActive 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200'
              }`}>
                {partner.isActive ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>

            <h3 className="font-semibold text-[#1c1c1c] text-lg mb-2">{partner.pesantrenName}</h3>
            <p className="text-sm text-[#6a6a6a] mb-1">{partner.city}, {partner.province}</p>
            <p className="text-xs text-[#6a6a6a] mb-4">
              Bergabung: {new Date(partner.joinedDate).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </p>

            {partner.description && (
              <p className="text-sm text-[#6a6a6a] mb-4 line-clamp-2">{partner.description}</p>
            )}

            <div className="flex items-center space-x-2 pt-4 border-t border-[#eceae7]">
              <button
                onClick={() => window.location.href = `/admin/partners/edit/${partner.id}`}
                className="flex-1 p-2 text-[#0f3d2e] hover:bg-[#0f3d2e]/10 rounded-[10px] transition-colors flex items-center justify-center space-x-2"
              >
                <Edit className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={() => setDeleteConfirm({ isOpen: true, id: partner.id })}
                className="flex-1 p-2 text-[#b76e6e] hover:bg-[#b76e6e]/10 rounded-[10px] transition-colors flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                <span className="text-sm">Hapus</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {partners.length === 0 && (
        <div className="text-center py-16 text-[#6a6a6a] bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7]">
          <div className="w-16 h-16 bg-[#f5f4f1] rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-[#6a6a6a]" />
          </div>
          <p className="text-sm">Belum ada mitra pesantren</p>
          <p className="text-xs mt-1">Klik tombol "Tambah Mitra" untuk memulai</p>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        title="Hapus Mitra Pesantren"
        message="Apakah Anda yakin ingin menghapus mitra pesantren ini?"
        onConfirm={handleDelete}
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
}
