"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import AddressModal from "@/components/AddressModal";
import { User, Mail, MapPin, Plus, Edit2, Trash2, LogOut, Star, Building2, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Address {
  id: string;
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

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useToastContext();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; addressId: string | null }>({
    isOpen: false,
    addressId: null
  });
  
  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchAddresses();
    }
  }, [status, router]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (addressData: any) => {
    try {
      const url = editingAddress ? `/api/addresses/${editingAddress.id}` : "/api/addresses";
      const method = editingAddress ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressData)
      });

      if (res.ok) {
        showToast(
          editingAddress ? "Alamat berhasil diperbarui!" : "Alamat berhasil ditambahkan!",
          "success"
        );
        setIsModalOpen(false);
        setEditingAddress(null);
        fetchAddresses();
      } else {
        showToast("Gagal menyimpan alamat", "error");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleDeleteAddress = async () => {
    if (!deleteConfirm.addressId) return;

    try {
      const res = await fetch(`/api/addresses/${deleteConfirm.addressId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showToast("Alamat berhasil dihapus!", "success");
        setDeleteConfirm({ isOpen: false, addressId: null });
        fetchAddresses();
      } else {
        showToast("Gagal menghapus alamat", "error");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      showToast("Terjadi kesalahan", "error");
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast("Password baru dan konfirmasi tidak cocok", "error");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast("Password baru minimal 6 karakter", "error");
      return;
    }

    setPasswordLoading(true);

    try {
      const res = await fetch("/api/users/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast("Password berhasil diubah!", "success");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordSection(false);
      } else {
        showToast(data.error || "Gagal mengubah password", "error");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <Navbar />
        <div className="container mx-auto px-6 py-12 text-center">
          <p>Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-arabic font-bold text-dark mb-8">Profil Saya</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-6 md:p-8 text-center border border-gray-100">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4 shadow-soft">
                <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
              </div>
              <h2 className="text-xl md:text-2xl font-arabic font-bold text-dark mb-2">
                {session.user.name}
              </h2>
              <p className="text-gray-600 mb-4 text-sm md:text-base">{session.user.email}</p>
              <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                session.user.role === 'SUPERADMIN'
                  ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
              }`}>
                {session.user.role}
              </span>

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full mt-6 flex items-center justify-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-soft hover:shadow-soft-lg"
              >
                <LogOut className="w-5 h-5" />
                <span>Keluar</span>
              </button>

              <button
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                className="w-full mt-3 flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-soft hover:shadow-soft-lg"
              >
                <Lock className="w-5 h-5" />
                <span>Ubah Password</span>
              </button>
            </div>

            {/* Quick Menu */}
            <div className="bg-white rounded-2xl shadow-soft p-6 mt-6 border border-gray-100">
              <h3 className="text-lg font-arabic font-bold text-dark mb-4">
                Menu Cepat
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => router.push("/pesanan")}
                  className="w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg">📦</span>
                  </div>
                  <div>
                    <p className="font-semibold text-dark text-sm">Pesanan Saya</p>
                    <p className="text-xs text-gray-600">Lihat riwayat</p>
                  </div>
                </button>
                <button
                  onClick={() => router.push("/piutang")}
                  className="w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <span className="text-lg">💰</span>
                  </div>
                  <div>
                    <p className="font-semibold text-dark text-sm">Piutang</p>
                    <p className="text-xs text-gray-600">Kelola piutang</p>
                  </div>
                </button>
                {(session.user.role === "SUPERADMIN" || session.user.role === "ADMIN") && (
                  <button
                    onClick={() => router.push("/admin")}
                    className="w-full p-3 bg-primary/10 rounded-xl hover:bg-primary/20 transition-colors text-left flex items-center space-x-3"
                  >
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <span className="text-lg">⚙️</span>
                    </div>
                    <div>
                      <p className="font-semibold text-primary text-sm">Admin</p>
                      <p className="text-xs text-primary/80">Dashboard</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Addresses Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Password Change Section */}
            {showPasswordSection && (
              <div className="bg-white rounded-2xl shadow-soft p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-arabic font-bold text-dark">Ubah Password</h2>
                  <button
                    onClick={() => {
                      setShowPasswordSection(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Password Lama
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Konfirmasi Password Baru
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? "Menyimpan..." : "Simpan Password"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordSection(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-arabic font-bold text-dark mb-1">Alamat Pengiriman</h2>
                <p className="text-gray-600 text-sm">Kelola alamat untuk pengiriman pesanan</p>
              </div>
              <button
                onClick={handleAddNew}
                className="flex items-center space-x-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all shadow-soft hover:shadow-soft-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Tambah Alamat</span>
              </button>
            </div>

            {/* Addresses List */}
            {addresses.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-soft p-12 text-center border border-gray-100">
                <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-arabic font-bold text-dark mb-2">
                  Belum Ada Alamat
                </h3>
                <p className="text-gray-600 mb-6">
                  Tambahkan alamat pengiriman untuk mempermudah checkout
                </p>
                <button
                  onClick={handleAddNew}
                  className="btn-primary inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Tambah Alamat Pertama</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`bg-white rounded-2xl shadow-soft p-5 md:p-6 border-2 transition-all hover:shadow-soft-lg ${
                      address.isDefault
                        ? "border-primary bg-primary/5"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                          address.label === "Rumah"
                            ? "bg-blue-100 text-blue-700"
                            : address.label === "Pesantren"
                            ? "bg-green-100 text-green-700"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {address.label}
                        </div>
                        {address.isDefault && (
                          <div className="flex items-center space-x-1 px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-xs font-bold">
                            <Star className="w-3 h-3 fill-current" />
                            <span>UTAMA</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditAddress(address)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, addressId: address.id })}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-bold text-dark">{address.recipientName}</p>
                          {address.pesantrenName && (
                            <div className="flex items-center space-x-2 mt-1">
                              <Building2 className="w-4 h-4 text-accent" />
                              <p className="text-sm text-accent font-semibold">{address.pesantrenName}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-gray-700">{address.phone}</p>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-700">{address.address}</p>
                          <p className="text-gray-600 text-sm mt-1">
                            {address.city}, {address.province} {address.postalCode}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddressModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        onSave={handleSaveAddress}
        address={editingAddress}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Hapus Alamat"
        message="Apakah Anda yakin ingin menghapus alamat ini?"
        onConfirm={handleDeleteAddress}
        onClose={() => setDeleteConfirm({ isOpen: false, addressId: null })}
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
}
