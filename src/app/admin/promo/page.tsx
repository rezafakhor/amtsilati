"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

interface Promo {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  maxUsage: number | null;
  usedCount: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
}

export default function PromoPage() {
  const [promos, setPromos] = useState<Promo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      const res = await fetch("/api/promos");
      const data = await res.json();
      setPromos(data);
    } catch (error) {
      console.error("Error fetching promos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Kode Promo</h1>
          <p className="text-sm text-[#6a6a6a]">Kelola kode promo dan diskon</p>
        </div>
        <button 
          className="h-11 px-5 bg-[#0f3d2e] text-white rounded-xl text-sm font-medium hover:bg-[#145c43] transition-all duration-200 flex items-center space-x-2 shadow-[0_4px_12px_rgba(15,61,46,0.2)]"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
          <span>Tambah Promo</span>
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f4f1] border-b border-[#eceae7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Kode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Diskon</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Penggunaan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Periode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceae7]">
              {promos.map((promo) => (
                <tr key={promo.id} className="hover:bg-[#f5f4f1]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 bg-[#c6a548]/10 rounded-[8px]">
                        <Tag className="w-4 h-4 text-[#c6a548]" strokeWidth={1.5} />
                      </div>
                      <span className="font-mono font-bold text-[#1c1c1c] text-sm">{promo.code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#1c1c1c] font-semibold text-sm">
                    {promo.discountType === 'PERCENTAGE' 
                      ? `${promo.discountValue}%`
                      : `Rp ${Number(promo.discountValue).toLocaleString('id-ID')}`
                    }
                  </td>
                  <td className="px-6 py-4 text-[#1c1c1c] text-sm">
                    <span className="font-semibold">{promo.usedCount}</span>
                    <span className="text-[#6a6a6a]"> / {promo.maxUsage || '∞'}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6a6a6a]">
                    {promo.validFrom && promo.validUntil ? (
                      <div className="space-y-0.5">
                        <div>{new Date(promo.validFrom).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</div>
                        <div className="text-xs">s/d {new Date(promo.validUntil).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                      </div>
                    ) : (
                      'Tidak terbatas'
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      promo.isActive 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}>
                      {promo.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-[#0f3d2e] hover:bg-[#0f3d2e]/10 rounded-[10px] transition-colors">
                        <Edit className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                      <button className="p-2 text-[#b76e6e] hover:bg-[#b76e6e]/10 rounded-[10px] transition-colors">
                        <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {promos.length === 0 && (
            <div className="text-center py-16 text-[#6a6a6a]">
              <div className="w-16 h-16 bg-[#f5f4f1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Tag className="w-8 h-8 text-[#6a6a6a]" />
              </div>
              <p className="text-sm">Belum ada promo</p>
              <p className="text-xs mt-1">Klik tombol &quot;Tambah Promo&quot; untuk memulai</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
