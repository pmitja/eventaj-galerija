import type { Metadata } from "next";
import { EventsPage } from "@/components/admin/admin-pages";
export const metadata: Metadata = { title: "Dogodki | Eventaj Galerija" };
export default function Page() { return <EventsPage />; }
