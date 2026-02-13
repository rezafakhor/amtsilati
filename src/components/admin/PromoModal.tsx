"use client";

import { useState, useEffect } from "react";
import Modal from "../Modal";
import { Loader2 } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  promo?: any;
}

export default function PromoModal({ isOpen, onClose, onSuccess, promo }: PromoModalProps) {
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxUsage: "",
    isActive: true,
    validFrom: "",
    validUntil: "",
  });

  useEffect(() => {
    if (promo) {
      setFormData({
        code: promo.code || "",
        discountType: promo.discountType || "PERCENTAGE",
        discountValue: promo.discountValue?.toString() || "",
        maxUsage: promo.maxUsage?.toString() || "",
        isActive: promo.isActive !== false,
        validFrom: promo.validFrom ? new Date(promo.validFrom).toISOString().split('T')[0] : "",
        validUntil: promo.validUntil ? new Date(promo.validUntil).toISOString().split('T')[0] : "",
      });
    } else {
      setFormData({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        maxUsage: "",
        isActive: true,
        validFrom: "",
        validUntil: "",
      });
    }
  }, [promo, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = promo ? `/api/promos/${promo.id}` : "/api/promos";
      const method = promo ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          discountValue: parseFloat(formData.discountValue),
          maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : null,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        showToast("Gagal menyimpan promo", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={promo ? "Edit Promo" : "Tambah Promo"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-2">Kode Promo *</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            className="input-field uppercase"
            placeholder="RAMADHAN2024"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Tipe Diskon *</label>
            <select
              value={formData.discountType}
              onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
              className="input-field"
              required
            >
              <option value="PERCENTAGE">Persentase (%)</option>
              <option value="FIXED">Nominal (Rp)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Nilai Diskon *</label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
              className="input-field"
              placeholder={formData.discountType === "PERCENTAGE" ? "10" : "50000"}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-2">Batas Penggunaan</label>
          <input
            type="number"
            value={formData.maxUsage}
            onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
            className="input-field"
            placeholder="Kosongkan untuk unlimited"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Berlaku Dari</label>
            <input
              type="date"
              value={formData.validFrom}
              onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Berlaku Sampai</label>
            <input
              type="date"
              value={formData.validUntil}
              onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-dark">Aktif</span>
          </label>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? "Menyimpan..." : "Simpan"}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
