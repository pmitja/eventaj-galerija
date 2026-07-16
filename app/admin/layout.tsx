import { AdminShell } from "@/components/admin/admin-shell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!(await auth())) redirect("/login");
  return <AdminShell>{children}</AdminShell>;
}
