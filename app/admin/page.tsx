import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata: Metadata = {
  title: "Pregled | Eventaj Galerija",
  description: "Administratorski pregled dogodkov in galerij.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
