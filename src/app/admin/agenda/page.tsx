"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Agenda {
  id: string;
  title: string;
  description: string | null;
  eventType: string;
  pesantrenName: string;
  location: string;
  eventDate: string;
  image: string | null;
  isActive: boolean;
}

export default function AgendaPage() {
  const { showToast } = useToastContext();
  const [agendas, setAgendas] = useState<Agenda[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string | null }>({
    isOpen: false,
    id: null,
  });

  useEffect(() => {
    fetchAgendas();
  }, []);

  const fetchAgendas = async () => {
    try {
      const res = await fetch("/api/agenda");
      const data = await res.json();
      setAgendas(data);
    } catch (error) {
      console.error("Error fetching agendas:", error);
      showToast("Gagal memuat agenda", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm.id) return;

    try {
      const res = await fetch(`/api/agenda/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        showToast("Agenda berhasil dihapus", "success");
        fetchAgendas();
      } else {
        showToast("Gagal menghapus agenda", "error");
      }
    } catch (error) {
      console.error("Error deleting agenda:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setDeleteConfirm({ isOpen: false, id: null });
    }
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      WISUDA: "Wisuda",
      TEST_KELULUSAN: "Test Kelulusan",
      SEMINAR: "Seminar",
      WORKSHOP: "Workshop",
      LAINNYA: "Lainnya"
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="text-center py-12">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Agenda</h1>
          <p className="text-sm text-[#6a6a6a]">Kelola agenda acara pesantren</p>
        </div>
        <button 
          onClick={() => window.location.href = '/admin/agenda/create'}
          className="h-11 px-5 bg-[#0f3d2e] text-white rounded-xl text-sm font-medium hover:bg-[#145c43] transition-all duration-200 flex items-center space-x-2 shadow-[0_4px_12px_rgba(15,61,46,0.2)]"
        >
          <Plus className="w-[18px] h-[18px]" strokeWidth={2} />
          <span>Tambah Agenda</span>
        </button>
      </div>

      <div className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#f5f4f1] border-b border-[#eceae7]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Judul</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Jenis</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Pesantren</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-[#1c1c1c]">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceae7]">
              {agendas.map((agenda) => {
                const eventDate = new Date(agenda.eventDate);
                const isPast = eventDate < new Date();
                
                return (
                  <tr key={agenda.id} className="hover:bg-[#f5f4f1]/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[#1c1c1c] text-sm">{agenda.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {getEventTypeLabel(agenda.eventType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#1c1c1c] text-sm">{agenda.pesantrenName}</td>
                    <td className="px-6 py-4 text-[#1c1c1c] text-sm">
                      {eventDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {isPast && <span className="ml-2 text-xs text-red-600">(Lewat)</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        agenda.isActive 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                        {agenda.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.location.href = `/admin/agenda/edit/${agenda.id}`}
                          className="p-2 text-[#0f3d2e] hover:bg-[#0f3d2e]/10 rounded-[10px] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-[18px] h-[18px]" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm({ isOpen: true, id: agenda.id })}
                          className="p-2 text-[#b76e6e] hover:bg-[#b76e6e]/10 rounded-[10px] transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-[18px] h-[18px]" strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {agendas.length === 0 && (
            <div className="text-center py-16 text-[#6a6a6a]">
              <div className="w-16 h-16 bg-[#f5f4f1] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[#6a6a6a]" />
              </div>
              <p className="text-sm">Belum ada agenda</p>
              <p className="text-xs mt-1">Klik tombol "Tambah Agenda" untuk memulai</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: null })}
        title="Hapus Agenda"
        message="Apakah Anda yakin ingin menghapus agenda ini?"
        onConfirm={handleDelete}
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
}
