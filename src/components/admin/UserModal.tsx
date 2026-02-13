"use client";

import { useState, useEffect } from "react";
import Modal from "../Modal";
import { Loader2 } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
}

export default function UserModal({ isOpen, onClose, onSuccess, user }: UserModalProps) {
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "USER",
    pesantrenName: "",
    address: "",
    phone: "",
    city: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || "",
        password: "",
        name: user.name || "",
        role: user.role || "USER",
        pesantrenName: user.pesantrenName || "",
        address: user.address || "",
        phone: user.phone || "",
        city: user.city || "",
        province: user.province || "",
        postalCode: user.postalCode || "",
      });
    } else {
      setFormData({
        email: "",
        password: "",
        name: "",
        role: "USER",
        pesantrenName: "",
        address: "",
        phone: "",
        city: "",
        province: "",
        postalCode: "",
      });
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      } else {
        const error = await res.json();
        showToast(error.error || "Gagal menyimpan user", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={user ? "Edit User" : "Tambah User"} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Password {user ? "(kosongkan jika tidak diubah)" : "*"}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field"
              required={!user}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">Nama Lengkap *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Role *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="input-field"
              required
            >
              <option value="USER">USER</option>
              <option value="SUPERADMIN">SUPERADMIN</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-2">Nama Pesantren</label>
          <input
            type="text"
            value={formData.pesantrenName}
            onChange={(e) => setFormData({ ...formData, pesantrenName: e.target.value })}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-2">Alamat</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="input-field"
            rows={2}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">No. Telepon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Kota</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Provinsi</label>
            <input
              type="text"
              value={formData.province}
              onChange={(e) => setFormData({ ...formData, province: e.target.value })}
              className="input-field"
            />
          </div>
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
