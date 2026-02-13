"use client";

import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Diklat {
  id: string;
  title: string;
  description: string;
  location: string;
  method: string;
  image: string;
  isActive: boolean;
  diklatdate: Array<{
    startDate: string;
    endDate: string;
  }>;
  _count: {
    diklatregistration: number;
  };
}

export default function AdminDiklatPage() {
  const { showToast } = useToastContext();
  const [diklats, setDiklats] = useState<Diklat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; diklatId: string | null }>({
    isOpen: false,
    diklatId: null
  });

  useEffect(() => {
    fetchDiklats();
  }, []);

  const fetchDiklats = async () => {
    try {
      const res = await fetch("/api/diklat");
      const data = await res.json();
      setDiklats(data);
    } catch (error) {
      console.error("Error fetching diklat:", error);
      showToast("Gagal memuat data diklat", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.diklatId) return;

    try {
      const res = await fetch(`/api/diklat/${deleteConfirm.diklatId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        showToast("Diklat berhasil dihapus!", "success");
        fetchDiklats();
      } else {
        showToast("Gagal menghapus diklat", "error");
      }
    } catch (error) {
      console.error("Error deleting diklat:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setDeleteConfirm({ isOpen: false, diklatId: null });
    }
  };

  const getMethodBadge = (method: string) => {
    const colors: Record<string, string> = {
      ONLINE: "bg-blue-100 text-blue-700",
      OFFLINE: "bg-green-100 text-green-700",
      HYBRID: "bg-purple-100 text-purple-700"
    };
    return colors[method] || "bg-gray-100 text-gray-700";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-dark">Manajemen Diklat</h1>
          <p className="text-gray-600 mt-1">Kelola jadwal pendidikan dan pelatihan</p>
        </div>
        <button
          onClick={() => window.location.href = '/admin/diklat/create'}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Diklat</span>
        </button>
      </div>

      {/* Diklat List */}
      {diklats.length === 0 ? (
        <div className="card-3d p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-dark mb-2">Belum Ada Diklat</h3>
          <p className="text-gray-600 mb-6">Mulai buat jadwal diklat pertama Anda</p>
          <button
            onClick={() => window.location.href = '/admin/diklat/create'}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Tambah Diklat</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diklats.map((diklat) => (
            <div key={diklat.id} className="card-3d overflow-hidden group">
              {/* Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10">
                {diklat.image ? (
                  <img
                    src={diklat.image}
                    alt={diklat.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMethodBadge(diklat.method)}`}>
                    {diklat.method}
                  </span>
                </div>
                {!diklat.isActive && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                      TIDAK AKTIF
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-arabic text-lg font-bold text-dark mb-2 line-clamp-2">
                  {diklat.title}
                </h3>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span className="line-clamp-1">{diklat.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{diklat.diklatdate.length} jadwal</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{diklat._count.diklatregistration} pendaftar</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => window.location.href = `/admin/diklat/${diklat.id}`}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Detail</span>
                  </button>
                  <button
                    onClick={() => window.location.href = `/admin/diklat/edit/${diklat.id}`}
                    className="flex-1 px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-1 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirm({ isOpen: true, diklatId: diklat.id })}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Hapus Diklat"
        message="Apakah Anda yakin ingin menghapus diklat ini? Semua data pendaftaran juga akan terhapus."
        onConfirm={handleDelete}
        onClose={() => setDeleteConfirm({ isOpen: false, diklatId: null })}
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
}
