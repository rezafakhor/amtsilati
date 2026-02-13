"use client";

import { useState, useEffect } from "react";
import { DollarSign, CheckCircle } from "lucide-react";

interface Debt {
  id: string;
  user: {
    name: string;
    pesantrenName: string | null;
  };
  totalDebt: number;
  paidAmount: number;
  remainingDebt: number;
  createdAt: string;
}

export default function PiutangPage() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDebts();
  }, []);

  const fetchDebts = async () => {
    try {
      const res = await fetch("/api/debts");
      const data = await res.json();
      setDebts(data);
    } catch (error) {
      console.error("Error fetching debts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Memuat...</div>;
  }

  const totalPiutang = debts.reduce((sum, debt) => sum + Number(debt.remainingDebt), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Piutang</h1>
        <p className="text-sm text-[#6a6a6a]">Kelola piutang pelanggan</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-[#0f3d2e] to-[#145c43] rounded-[18px] p-6 shadow-[0_8px_24px_rgba(15,61,46,0.25)] border border-[#0f3d2e]/20">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-white/10 rounded-[14px]">
            <DollarSign className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm text-white/70 mb-1">Total Piutang Aktif</p>
            <p className="text-3xl font-bold text-white">
              Rp {totalPiutang.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-white/60 mt-1">{debts.length} pelanggan</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f4f1] border-b border-[#eceae7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Pelanggan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Total Hutang</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Terbayar</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Sisa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceae7]">
              {debts.map((debt) => (
                <tr key={debt.id} className="hover:bg-[#f5f4f1]/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#1c1c1c] text-sm">{debt.user.name}</p>
                    {debt.user.pesantrenName && (
                      <p className="text-sm text-[#6a6a6a] mt-0.5">{debt.user.pesantrenName}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#1c1c1c] font-semibold text-sm">
                    Rp {Number(debt.totalDebt).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-semibold text-sm">
                    Rp {Number(debt.paidAmount).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#c6a548] text-sm">
                    Rp {Number(debt.remainingDebt).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#6a6a6a]">
                    {new Date(debt.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <button className="h-9 px-4 bg-[#0f3d2e] text-white rounded-[10px] text-sm font-medium hover:bg-[#145c43] transition-all duration-200 flex items-center space-x-2">
                      <CheckCircle className="w-[16px] h-[16px]" strokeWidth={1.5} />
                      <span>Bayar</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {debts.length === 0 && (
            <div className="text-center py-16 text-[#6a6a6a]">
              <div className="w-16 h-16 bg-[#f5f4f1] rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#6a6a6a]" />
              </div>
              <p className="text-sm">Tidak ada piutang aktif</p>
              <p className="text-xs mt-1">Semua pembayaran sudah lunas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
