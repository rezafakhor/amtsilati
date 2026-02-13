"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

export default function EditAgendaPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "WISUDA",
    pesantrenName: "",
    location: "",
    eventDate: "",
    image: "",
    isActive: true,
  });

  useEffect(() => {
    fetchAgenda();
  }, []);

  const fetchAgenda = async () => {
    try {
      const res = await fetch(`/api/agenda/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        const eventDate = new Date(data.eventDate);
        const formattedDate = eventDate.toISOString().slice(0, 16);
        
        setFormData({
          title: data.title,
          description: data.description || "",
          eventType: data.eventType,
          pesantrenName: data.pesantrenName,
          location: data.location,
          eventDate: formattedDate,
          image: data.image || "",
          isActive: data.isActive,
        });
      }
    } catch (error) {
      showToast("Gagal memuat data", "error");
    } finally {
      setFetching(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
        showToast("Gambar berhasil diupload", "success");
      }
    } catch (error) {
      showToast("Gagal upload gambar", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/agenda/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showToast("Agenda berhasil diupdate", "success");
        router.push("/admin/agenda");
      } else {
        showToast("Gagal mengupdate agenda", "error");
      }
    } catch (error) {
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="text-center py-12">Memuat...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-[32px] font-serif font-semibold text-[#1c1c1c] mb-1">Edit Agenda</h1>
          <p className="text-sm text-[#6a6a6a]">Ubah informasi agenda</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.05)] border border-[#eceae7] p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
              Judul Agenda *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
              Jenis Acara *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20"
              required
            >
              <option value="WISUDA">Wisuda</option>
              <option value="TEST_KELULUSAN">Test Kelulusan</option>
              <option value="SEMINAR">Seminar</option>
              <option value="WORKSHOP">Workshop</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
              Nama Pesantren *
            </label>
            <input
              type="text"
              value={formData.pesantrenName}
              onChange={(e) => setFormData({ ...formData, pesantrenName: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
              Lokasi *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
              Tanggal Acara *
            </label>
            <input
              type="datetime-local"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="w-full px-4 py-3 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#0f3d2e]/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1c1c1c] mb-2">
              Gambar
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 px-4 py-2 bg-[#f5f4f1] border border-[#eceae7] rounded-[12px] cursor-pointer hover:bg-[#eceae7] transition-colors">
                <Upload className="w-5 h-5" />
                <span className="text-sm">Upload Gambar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {formData.image && (
                <img src={formData.image} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-[#0f3d2e] rounded focus:ring-[#0f3d2e]"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-[#1c1c1c]">
              Aktif
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 h-11 bg-[#0f3d2e] text-white rounded-xl font-medium hover:bg-[#145c43] transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Update Agenda"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 h-11 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
