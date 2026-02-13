"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, User } from "lucide-react";
import UserModal from "@/components/admin/UserModal";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useToastContext } from "@/contexts/ToastContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  email: string;
  name: string;
  role: string;
  pesantrenName: string | null;
  phone: string | null;
  city: string | null;
  province: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const { showToast } = useToastContext();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; userId: string | null }>({
    isOpen: false,
    userId: null,
  });

  // Check if user is SUPERADMIN
  useEffect(() => {
    if (status === "loading") return;
    
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "SUPERADMIN") {
      showToast("Akses ditolak. Hanya SUPERADMIN yang dapat mengakses halaman ini.", "error");
      router.push("/admin");
      return;
    }
  }, [status, session, router, showToast]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("User berhasil dihapus", "success");
        fetchUsers();
      } else {
        showToast("Gagal menghapus user", "error");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Terjadi kesalahan", "error");
    }
    setDeleteConfirm({ isOpen: false, userId: null });
  };

  if (loading || status === "loading") {
    return <div className="text-center py-12">Memuat...</div>;
  }

  // Don't render if not SUPERADMIN
  if (session?.user?.role !== "SUPERADMIN") {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-dark mb-2">Manajemen User</h1>
          <p className="text-gray-600">Kelola akun pesantren dan admin</p>
        </div>
        <button onClick={handleAdd} className="btn-primary flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Tambah User</span>
        </button>
      </div>

      <div className="card-3d overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">User</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Pesantren</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Kontak</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Lokasi</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-dark">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-dark">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-dark">
                    {user.pesantrenName || '-'}
                  </td>
                  <td className="px-6 py-4 text-dark">
                    {user.phone || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.city && user.province ? `${user.city}, ${user.province}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'SUPERADMIN'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEdit(user)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm({ isOpen: true, userId: user.id })}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(undefined);
        }}
        onSuccess={() => {
          fetchUsers();
          setIsModalOpen(false);
          setSelectedUser(undefined);
        }}
        user={selectedUser}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, userId: null })}
        title="Hapus User"
        message="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
        onConfirm={() => deleteConfirm.userId && handleDelete(deleteConfirm.userId)}
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
}
