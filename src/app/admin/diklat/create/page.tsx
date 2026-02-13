"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Upload, Calendar as CalendarIcon } from "lucide-react";
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

export default function CreateDiklatPage() {
  const router = useRouter();
  const { showToast } = useToastContext();
  const [loading, setLoading] = useState(false);
  
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
      
      // Create preview
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

      // Upload image if file selected
      if (imageFile) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        uploadFormData.append("type", "product"); // Public image

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData
        });

        if (!uploadRes.ok) {
          showToast("Gagal upload gambar", "error");
          setLoading(false);
          return;
        }

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.url;
        
        // No need to delete old image on CREATE page
      }

      const res = await fetch("/api/diklat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
          dates,
          formFields
        })
      });

      if (res.ok) {
        showToast("Diklat berhasil dibuat!", "success");
        router.push("/admin/diklat");
      } else {
        showToast("Gagal membuat diklat", "error");
      }
    } catch (error) {
      console.error("Error creating diklat:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-dark">Tambah Diklat Baru</h1>
          <p className="text-gray-600 mt-1">Buat jadwal pendidikan dan pelatihan</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
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
              placeholder="Contoh: Pelatihan Metode Amtsilati"
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
              placeholder="Deskripsi lengkap tentang diklat..."
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
                placeholder="Nama pesantren atau lokasi"
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
              placeholder="https://..."
            />
            <p className="text-xs text-gray-500 mt-1">Kosongkan jika menggunakan form custom di bawah</p>
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
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-2 border-dashed border-gray-300">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {imageFile ? imageFile.name : "Pilih Gambar"}
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
              <p className="text-xs text-gray-500">Format: JPG, PNG, GIF (Max 5MB)</p>
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

        {/* Dates */}
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

        {/* Custom Form Fields */}
        <div className="card-3d p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-dark">Form Pendaftaran Custom</h2>
              <p className="text-sm text-gray-600 mt-1">Buat field form sesuai kebutuhan (opsional)</p>
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

          {/* Field List */}
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

          {/* Add Field Form */}
          {showFieldForm && (
            <div className="border-2 border-primary/20 rounded-xl p-4 space-y-4 bg-primary/5">
              <h3 className="font-bold text-dark">Tambah Field Baru</h3>
              
              <div>
                <label className="block text-sm font-medium text-dark mb-2">Label Field</label>
                <input
                  type="text"
                  value={currentField.label}
                  onChange={(e) => setCurrentField({ ...currentField, label: e.target.value })}
                  className="input-field"
                  placeholder="Contoh: Nama Lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Tipe Field</label>
                <select
                  value={currentField.fieldType}
                  onChange={(e) => setCurrentField({ ...currentField, fieldType: e.target.value, options: [] })}
                  className="input-field"
                >
                  {fieldTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {["SELECT", "RADIO", "CHECKBOX"].includes(currentField.fieldType) && (
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Opsi Pilihan</label>
                  <div className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={optionInput}
                      onChange={(e) => setOptionInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
                      className="input-field flex-1"
                      placeholder="Ketik opsi dan tekan Enter"
                    />
                    <button
                      type="button"
                      onClick={addOption}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                    >
                      Tambah
                    </button>
                  </div>
                  {currentField.options.length > 0 && (
                    <div className="space-y-1">
                      {currentField.options.map((opt, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white rounded">
                          <span className="text-sm">{opt}</span>
                          <button
                            type="button"
                            onClick={() => removeOption(i)}
                            className="text-red-600 text-sm"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-dark mb-2">Placeholder (Opsional)</label>
                <input
                  type="text"
                  value={currentField.placeholder}
                  onChange={(e) => setCurrentField({ ...currentField, placeholder: e.target.value })}
                  className="input-field"
                  placeholder="Teks bantuan untuk field"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="fieldRequired"
                  checked={currentField.isRequired}
                  onChange={(e) => setCurrentField({ ...currentField, isRequired: e.target.checked })}
                  className="w-4 h-4 text-primary rounded"
                />
                <label htmlFor="fieldRequired" className="text-sm font-medium text-dark">
                  Field wajib diisi
                </label>
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={saveField}
                  className="btn-primary flex-1"
                >
                  Simpan Field
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFieldForm(false);
                    setCurrentField({
                      label: "",
                      fieldType: "TEXT",
                      options: [],
                      isRequired: false,
                      placeholder: ""
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 text-dark rounded-lg hover:bg-gray-300"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Diklat"}
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
