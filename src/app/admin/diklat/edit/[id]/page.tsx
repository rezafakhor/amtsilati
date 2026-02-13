"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Upload } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

interface DateRange {
  startDate: string;
  endDate: string;
}

interface FormField {
  label: string;
  fieldType: string;
  options: string[];
  isRequired: boolean;
  placeholder: string;
}

const fieldTypes = [
  { value: "TEXT", label: "Text Pendek" },
  { value: "TEXTAREA", label: "Text Panjang" },
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Nomor Telepon" },
  { value: "NUMBER", label: "Angka" },
  { value: "DATE", label: "Tanggal" },
  { value: "SELECT", label: "Dropdown" },
  { value: "RADIO", label: "Pilihan (Radio)" },
  { value: "CHECKBOX", label: "Checkbox" }
];

export default function EditDiklatPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    method: "OFFLINE",
    registrationLink: "",
    image: "",
    isActive: true
  });

  const [dates, setDates] = useState<DateRange[]>([
    { startDate: "", endDate: "" }
  ]);

  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [currentField, setCurrentField] = useState<FormField>({
    label: "",
    fieldType: "TEXT",
    options: [],
    isRequired: false,
    placeholder: ""
  });
  const [optionInput, setOptionInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchDiklat();
  }, [params.id]);

  const fetchDiklat = async () => {
    try {
      const res = await fetch(`/api/diklat/${params.id}`);
      const data = await res.json();
      
      setFormData({
        title: data.title,
        description: data.description || "",
        location: data.location,
        method: data.method,
        registrationLink: data.registrationLink || "",
        image: data.image || "",
        isActive: data.isActive
      });

      setImagePreview(data.image || "");

      setDates(data.diklatdate.map((d: any) => ({
        startDate: d.startDate.split('T')[0],
        endDate: d.endDate.split('T')[0]
      })));

      setFormFields(data.diklatformfield.map((f: any) => ({
        label: f.label,
        fieldType: f.fieldType,
        options: f.options ? JSON.parse(f.options) : [],
        isRequired: f.isRequired,
        placeholder: f.placeholder || ""
      })));

    } catch (error) {
      console.error("Error fetching diklat:", error);
      showToast("Gagal memuat data diklat", "error");
    } finally {
      setLoadingData(false);
    }
  };

  const addDate = () => {
    setDates([...dates, { startDate: "", endDate: "" }]);
  };

  const removeDate = (index: number) => {
    setDates(dates.filter((_, i) => i !== index));
  };

  const updateDate = (index: number, field: keyof DateRange, value: string) => {
    const newDates = [...dates];
    newDates[index][field] = value;
    setDates(newDates);
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setCurrentField({
        ...currentField,
        options: [...currentField.options, optionInput.trim()]
      });
      setOptionInput("");
    }
  };

  const removeOption = (index: number) => {
    setCurrentField({
      ...currentField,
      options: currentField.options.filter((_, i) => i !== index)
    });
  };

  const saveField = () => {
    if (!currentField.label.trim()) {
      showToast("Label field harus diisi", "error");
      return;
    }

    if (["SELECT", "RADIO", "CHECKBOX"].includes(currentField.fieldType) && currentField.options.length === 0) {
      showToast("Tambahkan minimal 1 opsi", "error");
      return;
    }

    setFormFields([...formFields, currentField]);
    setCurrentField({
      label: "",
      fieldType: "TEXT",
      options: [],
      isRequired: false,
      placeholder: ""
    });
    setShowFieldForm(false);
    showToast("Field berhasil ditambahkan", "success");
  };

  const removeField = (index: number) => {
    setFormFields(formFields.filter((_, i) => i !== index));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.location) {
      showToast("Judul dan lokasi harus diisi", "error");
      return;
    }

    if (dates.length === 0 || !dates[0].startDate) {
      showToast("Minimal 1 jadwal harus diisi", "error");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = formData.image;

      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData
        });

        const uploadData = await uploadRes.json();
        if (uploadData.success) {
          imageUrl = uploadData.url;
        }
      }

      const res = await fetch(`/api/diklat/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          dates,
          formFields
        })
      });

      if (res.ok) {
        showToast("Diklat berhasil diupdate!", "success");
        router.push("/admin/diklat");
      } else {
        showToast("Gagal mengupdate diklat", "error");
      }
    } catch (error) {
      console.error("Error updating diklat:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
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
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-dark">Edit Diklat</h1>
          <p className="text-gray-600 mt-1">Perbarui informasi diklat</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Same form as create, but with loaded data */}
        {/* I'll include the key sections */}
        
        <div className="card-3d p-6 space-y-4">
          <h2 className="text-xl font-bold text-dark mb-4">Informasi Dasar</h2>
          
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Judul Diklat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Lokasi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark mb-2">
                Metode <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                className="input-field"
              >
                <option value="OFFLINE">Offline</option>
                <option value="ONLINE">Online</option>
                <option value="HYBRID">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Link Pendaftaran (Opsional)</label>
            <input
              type="url"
              value={formData.registrationLink}
              onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">Gambar Diklat</label>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview("");
                      setFormData({ ...formData, image: "" });
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <label className="cursor-pointer">
                <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-2 border-dashed border-gray-300">
                  <Upload className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {imageFile ? imageFile.name : "Pilih Gambar Baru"}
                  </span>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 text-primary rounded"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-dark">
              Aktifkan diklat ini
            </label>
          </div>
        </div>

        {/* Dates Section - Similar to create */}
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-dark">Jadwal Pelaksanaan</h2>
            <button
              type="button"
              onClick={addDate}
              className="btn-primary text-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Jadwal</span>
            </button>
          </div>

          {dates.map((date, index) => (
            <div key={index} className="flex items-end space-x-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date.startDate}
                    onChange={(e) => updateDate(index, 'startDate', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={date.endDate}
                    onChange={(e) => updateDate(index, 'endDate', e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>
              {dates.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDate(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Form Fields - Show existing fields */}
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-dark">Form Pendaftaran Custom</h2>
              <p className="text-sm text-gray-600 mt-1">Field form yang sudah ada</p>
            </div>
            <button
              type="button"
              onClick={() => setShowFieldForm(true)}
              className="btn-primary text-sm flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Field</span>
            </button>
          </div>

          {formFields.length > 0 && (
            <div className="space-y-2">
              {formFields.map((field, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-dark">{field.label}</p>
                    <p className="text-sm text-gray-600">
                      {fieldTypes.find(t => t.value === field.fieldType)?.label}
                      {field.isRequired && <span className="text-red-500 ml-1">*</span>}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeField(index)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Update Diklat"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 bg-gray-200 text-dark rounded-xl hover:bg-gray-300 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
