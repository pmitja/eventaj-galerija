import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { auth } from "@/auth";
import { getAuthContext } from "@/lib/auth/context";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await auth())) redirect("/login");
  const context = await getAuthContext();
  if (!context) redirect("/login");
  return <AdminShell user={{ name: context.name, email: context.email, role: context.role }}>{children}</AdminShell>;
}
