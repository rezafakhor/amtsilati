"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { CreditCard, DollarSign, Upload, Calendar, CheckCircle, AlertCircle, TrendingDown } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

interface DebtPayment {
  id: string;
  amount: number;
  createdAt: string;
  notes?: string;
  paymentProof?: string;
}

interface Debt {
  id: string;
  totalDebt: number;
  paidAmount: number;
  remainingDebt: number;
  createdAt: string;
  debtpayment: DebtPayment[];
}

export default function PiutangPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToastContext();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean; debtId: string | null }>({
    isOpen: false,
    debtId: null
  });
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchDebts();
    }
  }, [status, router]);

  const fetchDebts = async () => {
    try {
      const res = await fetch("/api/debts");
      const data = await res.json();
      // Ensure data is array
      setDebts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching debts:", error);
      setDebts([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModal.debtId) return;

    setSubmitting(true);
    try {
      // Upload payment proof if exists
      let paymentProofUrl = "";
      if (paymentProof) {
        const formData = new FormData();
        formData.append("file", paymentProof);
        
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        
        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          paymentProofUrl = uploadData.url;
        }
      }

      const res = await fetch("/api/debts/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          debtId: paymentModal.debtId,
          amount: Number(paymentAmount),
          paymentProof: paymentProofUrl,
          notes: paymentNotes
        })
      });

      if (res.ok) {
        showToast("Pembayaran berhasil dicatat!", "success");
        setPaymentModal({ isOpen: false, debtId: null });
        setPaymentAmount("");
        setPaymentProof(null);
        setPaymentNotes("");
        fetchDebts();
      } else {
        showToast("Gagal mencatat pembayaran", "error");
      }
    } catch (error) {
      console.error("Payment error:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPiutang = debts.reduce((sum, debt) => sum + Number(debt.remainingDebt), 0);
  const totalTerbayar = debts.reduce((sum, debt) => sum + Number(debt.paidAmount), 0);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <Navbar />
        <div className="container mx-auto px-4 md:px-6 py-12">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-arabic font-bold text-dark mb-2">Piutang Saya</h1>
          <p className="text-gray-600 text-sm md:text-base">Kelola dan bayar piutang Anda</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Piutang */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-soft p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <TrendingDown className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Piutang</p>
            <p className="text-3xl font-bold">
              Rp {totalPiutang.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Total Terbayar */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-soft p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <DollarSign className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-sm opacity-90 mb-1">Sudah Dibayar</p>
            <p className="text-3xl font-bold">
              Rp {totalTerbayar.toLocaleString('id-ID')}
            </p>
          </div>

          {/* Jumlah Piutang */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-soft p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <span className="text-4xl font-bold opacity-50">{debts.length}</span>
            </div>
            <p className="text-sm opacity-90 mb-1">Piutang Aktif</p>
            <p className="text-2xl font-bold">{debts.length} Transaksi</p>
          </div>
        </div>

        {/* Debts List */}
        {debts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-soft p-12 text-center border border-gray-100">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-arabic font-bold text-dark mb-2">
              Tidak Ada Piutang
            </h3>
            <p className="text-gray-600 mb-6">
              Alhamdulillah, Anda tidak memiliki piutang aktif
            </p>
            <a href="/katalog" className="btn-primary inline-block">
              Mulai Belanja
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {debts.map((debt) => {
              const percentage = (Number(debt.paidAmount) / Number(debt.totalDebt)) * 100;
              return (
                <div
                  key={debt.id}
                  className="bg-white rounded-xl shadow-soft hover:shadow-soft-lg transition-all border border-gray-100 overflow-hidden"
                >
                  {/* Debt Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-white px-4 md:px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <CreditCard className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-bold text-dark">Piutang #{debt.id.slice(-8)}</p>
                          <p className="text-xs text-gray-500 flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(debt.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Progress</p>
                        <p className="text-lg font-bold text-primary">{percentage.toFixed(0)}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="px-4 md:px-6 py-3 bg-gray-50">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Debt Details */}
                  <div className="px-4 md:px-6 py-4">
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Total Hutang</p>
                        <p className="text-base md:text-lg font-bold text-dark">
                          Rp {Number(debt.totalDebt).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Terbayar</p>
                        <p className="text-base md:text-lg font-bold text-green-600">
                          Rp {Number(debt.paidAmount).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Sisa</p>
                        <p className="text-base md:text-lg font-bold text-red-600">
                          Rp {Number(debt.remainingDebt).toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>

                    {/* Payment History */}
                    {debt.debtpayment && debt.debtpayment.length > 0 && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <p className="font-semibold text-dark mb-3 flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span>Riwayat Pembayaran ({debt.debtpayment.length})</span>
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {debt.debtpayment.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg border border-green-100">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-bold text-dark text-sm">
                                    Rp {Number(payment.amount).toLocaleString('id-ID')}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {new Date(payment.createdAt).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </p>
                                </div>
                              </div>
                              {payment.notes && (
                                <p className="text-xs text-gray-600 max-w-[150px] truncate">{payment.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    {Number(debt.remainingDebt) > 0 && (
                      <button
                        onClick={() => setPaymentModal({ isOpen: true, debtId: debt.id })}
                        className="mt-4 w-full btn-primary flex items-center justify-center space-x-2"
                      >
                        <DollarSign className="w-5 h-5" />
                        <span>Bayar Piutang</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Payment Modal */}
      {paymentModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-soft-xl w-full max-w-md animate-scale-in">
            <div className="border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-arabic font-bold text-dark">Bayar Piutang</h2>
            </div>
            
            <form onSubmit={handlePayment} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Nominal Pembayaran *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="input-field"
                  placeholder="Masukkan nominal"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Bukti Transfer *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPaymentProof(e.target.files?.[0] || null)}
                    className="hidden"
                    id="payment-proof-modal"
                    required
                  />
                  <label htmlFor="payment-proof-modal" className="cursor-pointer text-primary hover:underline text-sm">
                    {paymentProof ? paymentProof.name : "Pilih file"}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dark mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Tambahkan catatan..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setPaymentModal({ isOpen: false, debtId: null })}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-soft disabled:opacity-50"
                  disabled={submitting}
                >
                  {submitting ? "Memproses..." : "Bayar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
