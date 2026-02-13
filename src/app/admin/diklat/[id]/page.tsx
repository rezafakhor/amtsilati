"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, MapPin, Users, Edit, CheckCircle, XCircle, Clock } from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  formData: string;
  status: string;
  createdAt: string;
}

interface Diklat {
  id: string;
  title: string;
  description: string;
  location: string;
  method: string;
  registrationLink: string;
  image: string;
  isActive: boolean;
  diklatdate: Array<{
    startDate: string;
    endDate: string;
  }>;
  diklatformfield: Array<{
    label: string;
    fieldType: string;
    isRequired: boolean;
  }>;
}

export default function DiklatDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToastContext();
  const [diklat, setDiklat] = useState<Diklat | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiklat();
    fetchRegistrations();
  }, [params.id]);

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

  const fetchRegistrations = async () => {
    try {
      const res = await fetch(`/api/diklat/registrations?diklatId=${params.id}`);
      const data = await res.json();
      setRegistrations(data);
    } catch (error) {
      console.error("Error fetching registrations:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; icon: JSX.Element }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Clock className="w-4 h-4" /> },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: <CheckCircle className="w-4 h-4" /> },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-4 h-4" /> }
    };
    return badges[status] || badges.PENDING;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!diklat) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Diklat tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-dark">Detail Diklat</h1>
            <p className="text-gray-600 mt-1">{diklat.title}</p>
          </div>
        </div>
        <button
          onClick={() => router.push(`/admin/diklat/edit/${diklat.id}`)}
          className="btn-primary flex items-center space-x-2"
        >
          <Edit className="w-5 h-5" />
          <span>Edit</span>
        </button>
      </div>

      {/* Diklat Info */}
      <div className="card-3d p-6">
        {diklat.image && (
          <div className="mb-6">
            <img
              src={diklat.image}
              alt={diklat.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-arabic font-bold text-dark mb-2">{diklat.title}</h2>
            <p className="text-gray-600">{diklat.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="w-5 h-5 text-primary" />
              <span>{diklat.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="w-5 h-5 text-primary" />
              <span>{diklat.method}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-700">
              <Users className="w-5 h-5 text-primary" />
              <span>{registrations.length} Pendaftar</span>
            </div>
          </div>

          {/* Jadwal */}
          <div>
            <h3 className="font-bold text-dark mb-2">Jadwal Pelaksanaan:</h3>
            <div className="space-y-2">
              {diklat.diklatdate.map((date, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
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
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          {diklat.diklatformfield.length > 0 && (
            <div>
              <h3 className="font-bold text-dark mb-2">Form Pendaftaran Custom:</h3>
              <div className="space-y-1">
                {diklat.diklatformfield.map((field, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    • {field.label} ({field.fieldType})
                    {field.isRequired && <span className="text-red-500"> *</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {diklat.registrationLink && (
            <div>
              <h3 className="font-bold text-dark mb-2">Link Pendaftaran:</h3>
              <a
                href={diklat.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {diklat.registrationLink}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Registrations */}
      <div className="card-3d p-6">
        <h2 className="text-xl font-bold text-dark mb-4">
          Daftar Pendaftar ({registrations.length})
        </h2>

        {registrations.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Belum ada pendaftar</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-dark">Nama</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Telepon</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-dark">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => {
                  const statusBadge = getStatusBadge(reg.status);
                  return (
                    <tr key={reg.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{reg.name}</td>
                      <td className="py-3 px-4">{reg.email}</td>
                      <td className="py-3 px-4">{reg.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}>
                          {statusBadge.icon}
                          <span>{reg.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(reg.createdAt).toLocaleDateString('id-ID')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
