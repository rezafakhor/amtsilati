"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    console.log("Admin Layout - Status:", status);
    console.log("Admin Layout - Session:", session);
    console.log("Admin Layout - Role:", session?.user?.role);

    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      console.log("Redirecting to login - unauthenticated");
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (!session?.user?.role) {
        console.log("No role found in session");
        setIsChecking(false);
        return;
      }

      // Allow both ADMIN and SUPERADMIN to access admin panel
      if (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN") {
        console.log("Not ADMIN or SUPERADMIN, redirecting to katalog. Role:", session.user.role);
        router.push("/katalog");
        return;
      }

      console.log("Access granted - Role:", session.user.role);
      setIsChecking(false);
    }
  }, [session, status, router]);

  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="text-center">
          <div className="text-lg text-dark mb-2">Memuat...</div>
          <div className="text-sm text-gray-600">Memeriksa akses admin</div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (!session?.user?.role || (session.user.role !== "SUPERADMIN" && session.user.role !== "ADMIN")) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[#f5f4f1]">
      <AdminSidebar />
      <main className="flex-1 lg:ml-[240px] p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
