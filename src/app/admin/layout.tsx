import type { Metadata } from "next";
import AdminNav from "./AdminNav";
import AdminAuthGate from "./AdminAuthGate";

export const metadata: Metadata = {
  title: "Admin — Backyard Restoration",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGate>
      <div className="min-h-screen bg-charcoal-950 text-charcoal-200">
        <AdminNav />
        <main className="pl-0 md:pl-56 pt-14 md:pt-0 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</div>
        </main>
      </div>
    </AdminAuthGate>
  );
}
