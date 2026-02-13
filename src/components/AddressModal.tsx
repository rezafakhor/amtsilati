"use client";

import { useState, useEffect } from "react";
import { X, MapPin, User, Phone, Building2, Home } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

interface Address {
  id?: string;
  label: string;
  recipientName: string;
  pesantrenName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  address?: Address | null;
}

export default function AddressModal({ isOpen, onClose, onSave, address }: AddressModalProps) {
  const { showToast } = useToastContext();
  const [formData, setFormData] = useState<Address>({
    label: "Rumah",
    recipientName: "",
    pesantrenName: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    isDefault: false,
  });

  useEffect(() => {
    if (address) {
      setFormData(address);
    } else {
      setFormData({
        label: "Rumah",
        recipientName: "",
        pesantrenName: "",
        phone: "",
        address: "",
        city: "",
        province: "",
        postalCode: "",
        isDefault: false,
      });
    }
  }, [address, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.label || !formData.recipientName || !formData.phone || 
        !formData.address || !formData.city || !formData.province) {
      showToast("Mohon lengkapi semua field yang wajib diisi (*)", "error");
      return;
    }
    
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-soft-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-arabic font-bold text-dark">
            {address ? "Edit Alamat" : "Tambah Alamat Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Label Alamat */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-3">
              Label Alamat *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["Rumah", "Pesantren", "Kantor"].map((labelOption) => (
                <button
                  key={labelOption}
                  type="button"
                  onClick={() => setFormData({ ...formData, label: labelOption })}
                  className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center space-x-2 ${
                    formData.label === labelOption
                      ? "bg-primary text-white shadow-soft"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {labelOption === "Rumah" && <Home className="w-4 h-4" />}
                  {labelOption === "Pesantren" && <Building2 className="w-4 h-4" />}
                  {labelOption === "Kantor" && <MapPin className="w-4 h-4" />}
                  <span>{labelOption}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Nama Penerima */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Nama Penerima *
            </label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              className="input-field"
              placeholder="Nama lengkap penerima"
              required
            />
          </div>

          {/* Nama Pesantren */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              <Building2 className="w-4 h-4 inline mr-1" />
              Nama Pesantren
            </label>
            <input
              type="text"
              value={formData.pesantrenName}
              onChange={(e) => setFormData({ ...formData, pesantrenName: e.target.value })}
              className="input-field"
              placeholder="Nama pesantren (opsional)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Isi jika pengiriman ke pesantren
            </p>
          </div>

          {/* Nomor Telepon */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              <Phone className="w-4 h-4 inline mr-1" />
              Nomor Telepon *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="input-field"
              placeholder="08xxxxxxxxxx"
              required
            />
          </div>

          {/* Alamat Lengkap */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Alamat Lengkap *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
              required
            />
          </div>

          {/* Kota & Provinsi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Kota/Kabupaten *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field"
                placeholder="Contoh: Bandung"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Provinsi *
              </label>
              <input
                type="text"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="input-field"
                placeholder="Contoh: Jawa Barat"
                required
              />
            </div>
          </div>

          {/* Kode Pos */}
          <div>
            <label className="block text-sm font-semibold text-dark mb-2">
              Kode Pos
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="input-field"
              placeholder="40xxx"
            />
          </div>

          {/* Set as Default */}
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 rounded border-2 border-gray-300 text-primary focus:ring-2 focus:ring-primary/20"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-dark cursor-pointer">
              Jadikan alamat utama
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors shadow-soft"
            >
              {address ? "Simpan Perubahan" : "Tambah Alamat"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
