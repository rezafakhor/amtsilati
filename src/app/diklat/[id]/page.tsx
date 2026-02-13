"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ArrowLeft, Calendar, MapPin, Users, ExternalLink, Send, CheckCircle } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import { useSession } from "next-auth/react";

interface FormField {
  id: string;
  label: string;
  fieldType: string;
  options: string;
  isRequired: boolean;
  placeholder: string;
}

interface Diklat {
  id: string;
  title: string;
  description: string;
  location: string;
  method: string;
  registrationLink: string;
  image: string;
  diklatdate: Array<{
    startDate: string;
    endDate: string;
  }>;
  diklatformfield: FormField[];
  _count: {
    diklatregistration: number;
  };
}

export default function DiklatDetailPublicPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { showToast } = useToastContext();
  
  const [diklat, setDiklat] = useState<Diklat | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [registered, setRegistered] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    customFields: {} as Record<string, any>
  });

  useEffect(() => {
    fetchDiklat();
  }, [params.id]);

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || "",
        phone: (session.user as any).phone || ""
      }));
    }
  }, [session]);

  const fetchDiklat = async () => {
    try {
      const res = await fetch(`/api/diklat/${params.id}`);
      const data = await res.json();
      setDiklat(data);
    } catch (error) {
      console.error("Error fetching diklat:", error);
      showToast("Gagal memuat data diklat", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldId]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone) {
      showToast("Mohon lengkapi data diri", "error");
      return;
    }

    // Validate required custom fields
    if (diklat?.diklatformfield) {
      for (const field of diklat.diklatformfield) {
        if (field.isRequired && !formData.customFields[field.id]) {
          showToast(`${field.label} harus diisi`, "error");
          return;
        }
      }
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/diklat/${params.id}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          formData: formData.customFields
        })
      });

      if (res.ok) {
        setRegistered(true);
        showToast("Pendaftaran berhasil!", "success");
        setShowForm(false);
      } else {
        showToast("Gagal mendaftar", "error");
      }
    } catch (error) {
      console.error("Error registering:", error);
      showToast("Terjadi kesalahan", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFormField = (field: FormField) => {
    const options = field.options ? JSON.parse(field.options) : [];
    const value = formData.customFields[field.id] || "";

    switch (field.fieldType) {
      case "TEXT":
      case "EMAIL":
      case "PHONE":
      case "NUMBER":
        return (
          <input
            type={field.fieldType.toLowerCase()}
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            className="input-field"
          />
        );

      case "TEXTAREA":
        return (
          <textarea
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            required={field.isRequired}
            rows={4}
            className="input-field"
          />
        );

      case "DATE":
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            required={field.isRequired}
            className="input-field"
          />
        );

      case "SELECT":
        return (
          <select
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            required={field.isRequired}
            className="input-field"
          >
            <option value="">Pilih...</option>
            {options.map((opt: string, i: number) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case "RADIO":
        return (
          <div className="space-y-2">
            {options.map((opt: string, i: number) => (
              <label key={i} className="flex items-center space-x-2">
                <input
                  type="radio"
                  name={field.id}
                  value={opt}
                  checked={value === opt}
                  onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                  required={field.isRequired}
                  className="w-4 h-4 text-primary"
                />
                <span className="text-sm text-gray-700">{opt}</span>
              </label>
            ))}
          </div>
        );

      case "CHECKBOX":
        return (
          <div className="space-y-2">
            {options.map((opt: string, i: number) => {
              const checkedValues = Array.isArray(value) ? value : [];
              return (
                <label key={i} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={opt}
                    checked={checkedValues.includes(opt)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...checkedValues, opt]
                        : checkedValues.filter((v: string) => v !== opt);
                      handleCustomFieldChange(field.id, newValues);
                    }}
                    className="w-4 h-4 text-primary rounded"
                  />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return null;
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
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!diklat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
        <Navbar />
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">Diklat tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-cream">
      <Navbar />
      
      <main className="container mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {diklat.image && (
              <div className="card-3d overflow-hidden">
                <img
                  src={diklat.image}
                  alt={diklat.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Info */}
            <div className="card-3d p-6 md:p-8 space-y-6">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${getMethodBadge(diklat.method)}`}>
                    {diklat.method}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-arabic font-bold text-dark mb-4">
                  {diklat.title}
                </h1>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {diklat.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Lokasi</p>
                    <p className="font-semibold text-dark">{diklat.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pendaftar</p>
                    <p className="font-semibold text-dark">{diklat._count.diklatregistration} orang</p>
                  </div>
                </div>
              </div>

              {/* Jadwal */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-xl font-bold text-dark mb-4">Jadwal Pelaksanaan</h3>
                <div className="space-y-3">
                  {diklat.diklatdate.map((date, index) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-primary/5 rounded-xl">
                      <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-dark">
                          {new Date(date.startDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                          {' - '}
                          {new Date(date.endDate).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Registration */}
          <div className="lg:col-span-1">
            <div className="card-3d p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-dark mb-6">Pendaftaran</h2>

              {registered ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-dark mb-2">Pendaftaran Berhasil!</h3>
                  <p className="text-gray-600 mb-6">
                    Terima kasih telah mendaftar. Kami akan menghubungi Anda segera.
                  </p>
                </div>
              ) : (
                <>
                  {diklat.registrationLink ? (
                    <a
                      href={diklat.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Daftar via Link External</span>
                    </a>
                  ) : (
                    <>
                      {!showForm ? (
                        <button
                          onClick={() => setShowForm(true)}
                          className="w-full btn-primary flex items-center justify-center space-x-2"
                        >
                          <Send className="w-5 h-5" />
                          <span>Daftar Sekarang</span>
                        </button>
                      ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-dark mb-2">
                              Nama Lengkap <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-dark mb-2">
                              Email <span className="text-red-500">*</span>
                            </label>
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
                              No. Telepon <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="input-field"
                              required
                            />
                          </div>

                          {/* Custom Fields */}
                          {diklat.diklatformfield.map((field) => (
                            <div key={field.id}>
                              <label className="block text-sm font-medium text-dark mb-2">
                                {field.label}
                                {field.isRequired && <span className="text-red-500"> *</span>}
                              </label>
                              {renderFormField(field)}
                            </div>
                          ))}

                          <div className="flex space-x-2 pt-4">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="flex-1 btn-primary disabled:opacity-50"
                            >
                              {submitting ? "Mengirim..." : "Kirim Pendaftaran"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowForm(false)}
                              className="px-4 py-2 bg-gray-200 text-dark rounded-lg hover:bg-gray-300"
                            >
                              Batal
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
