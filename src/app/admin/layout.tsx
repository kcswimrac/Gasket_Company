import type { Metadata } from "next";
import AdminAuthGate from "./AdminAuthGate";
import SessionWrapper from "./SessionWrapper";
import AdminShell from "./AdminShell";

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
    <SessionWrapper>
      <AdminAuthGate>
        <AdminShell>{children}</AdminShell>
      </AdminAuthGate>
    </SessionWrapper>
  );
}
