import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NewEventPage } from "@/components/admin/admin-pages";
import { getAuthContext } from "@/lib/auth/context";
export const metadata: Metadata = { title: "Nov dogodek | Eventaj Galerija" };
export default async function Page() {
  const context = await getAuthContext();
  // Platform admins keep the free in-dashboard flow; everyone else buys an event.
  if (!context?.platformAdmin) redirect("/naroci");
  return <NewEventPage />;
}
