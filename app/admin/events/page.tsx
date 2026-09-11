import type { Metadata } from "next";
import { EventsPage } from "@/components/admin/admin-pages";
export const metadata: Metadata = { title: "Dogodki | Eventaj Galerija" };
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <EventsPage query={await searchParams} />;
}
